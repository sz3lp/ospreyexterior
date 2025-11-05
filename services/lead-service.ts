import { createClient } from "@supabase/supabase-js";

import { logError, logInfo, logWarn } from "@/lib/logger";
import { z } from "zod";

const leadSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email required").optional(),
    phone: z.string().min(7).max(32).optional(),
    address: z.string().max(240).optional(),
    city: z.string().max(120).optional(),
    zip: z.string().max(16).optional(),
    service_type: z.string().max(120).optional(),
    service: z.string().max(120).optional(),
    message: z.string().max(2000).optional(),
    utm_source: z.string().max(120).optional(),
    utm_medium: z.string().max(120).optional(),
    utm_campaign: z.string().max(120).optional(),
    geo: z.string().max(120).optional(),
    notification_email: z.string().email().optional(),
  })
  .refine((data) => Boolean(data.email || data.phone), {
    message: "Email or phone is required",
    path: ["email"],
  })
  .passthrough();

export type LeadPayload = z.infer<typeof leadSchema>;

interface LeadContext {
  readonly requestId?: string;
  readonly traceId?: string;
}

const RETRY_ATTEMPTS = 3;
const BASE_DELAY_MS = 150;

function getSupabaseConfig(): { url: string; key: string; table: string } {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_LEADS_TABLE || "leads";
  if (!url || !key) {
    throw new Error("Supabase configuration missing: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars");
  }
  return { url, key, table };
}

function createSupabaseServiceClient() {
  const { url, key } = getSupabaseConfig();
  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

async function checkDuplicateLead(
  client: ReturnType<typeof createSupabaseServiceClient>,
  table: string,
  payload: LeadPayload,
  context: LeadContext,
): Promise<boolean> {
  const filters: Record<string, string> = {};
  if (payload.email) {
    filters.email = payload.email;
  }
  if (payload.phone) {
    filters.phone = payload.phone;
  }
  if (Object.keys(filters).length === 0) {
    return false;
  }
  const query = client.from(table).select("id", { count: "exact", head: true }).match(filters).limit(1);
  const { error, count } = await query;
  if (error) {
    logWarn("lead_duplicate_check_failed", {
      error: error.message,
      requestId: context.requestId,
      traceId: context.traceId,
      });
    return false;
  }
  return Boolean(count && count > 0);
}

function normalizePayload(payload: LeadPayload): Record<string, unknown> {
  const serviceType = payload.service_type || payload.service || "general";
  const baseRecord: Record<string, unknown> = {
    name: payload.name,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    address: payload.address ?? null,
    city: payload.city ?? null,
    zip: payload.zip ?? null,
    service_type: serviceType,
    message: payload.message ?? null,
    utm_source: payload.utm_source ?? null,
    utm_medium: payload.utm_medium ?? null,
    utm_campaign: payload.utm_campaign ?? null,
    geo: payload.geo ?? null,
    notification_email: payload.notification_email ?? null,
  };

  Object.entries(payload).forEach(([key, value]) => {
    if (baseRecord[key] === undefined) {
      baseRecord[key] = value;
    }
  });

  return baseRecord;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function submitLead(
  raw: unknown,
  context: LeadContext = {},
): Promise<{ status: "created" | "skipped" }> {
  const payload = leadSchema.parse(raw);
  const { table } = getSupabaseConfig();
  const client = createSupabaseServiceClient();
  const duplicate = await checkDuplicateLead(client, table, payload, context);
  if (duplicate) {
    logInfo("lead_duplicate_skipped", {
      requestId: context.requestId,
      traceId: context.traceId,
      email: payload.email,
      phone: payload.phone,
      remediation: "Lead already exists for contact info; skipping insert.",
    });
    return { status: "skipped" };
  }

  const record = normalizePayload(payload);
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt += 1) {
    const jitter = Math.random() * BASE_DELAY_MS;
    try {
      const { error } = await client.from(table).insert([record], { returning: "minimal" });
      if (error) {
        throw new Error(error.message);
      }
      logInfo("lead_created", {
        requestId: context.requestId,
        traceId: context.traceId,
        email: payload.email,
        phone: payload.phone,
        serviceType: record.service_type,
        cost_usd: 0,
      });
      return { status: "created" };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logWarn("lead_insert_retry", {
        attempt: attempt + 1,
        requestId: context.requestId,
        traceId: context.traceId,
        remediation: "Retrying Supabase insert with jitter",
        error: lastError.message,
      });
      await wait(BASE_DELAY_MS * (attempt + 1) + jitter);
    }
  }

  logError("lead_insert_failed", {
    requestId: context.requestId,
    traceId: context.traceId,
    remediation: "Verify Supabase credentials and table schema.",
    error: lastError?.message,
  });
  throw lastError ?? new Error("Lead insert failed");
}

export { leadSchema as LeadPayloadSchema };
