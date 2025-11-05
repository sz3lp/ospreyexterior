import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { logError, logInfo, logWarn } from "@/lib/logger";
import { submitLead } from "@/services/lead-service";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "anonymous";
  }
  return request.headers.get("x-real-ip") ?? "anonymous";
}

function enforceRateLimit(identifier: string): boolean {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);
  if (!existing || existing.resetAt < now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  existing.count += 1;
  return true;
}

export async function POST(request: Request): Promise<NextResponse> {
  const headerList = headers();
  const requestId = headerList.get("x-request-id") ?? undefined;
  const traceId = headerList.get("x-trace-id") ?? requestId;
  const identifier = getClientIdentifier(request);

  if (!enforceRateLimit(identifier)) {
    logWarn("lead_rate_limited", { requestId, traceId, identifier });
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before submitting again." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    logError("lead_invalid_json", {
      requestId,
      traceId,
      identifier,
      remediation: "Send valid JSON body.",
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (process.env.FEATURE_LEAD_SUBMISSION === "off") {
    logWarn("lead_submission_feature_disabled", { requestId, traceId, identifier });
    return NextResponse.json({ status: "disabled" }, { status: 202 });
  }

  try {
    const result = await submitLead(payload, { requestId, traceId });
    logInfo("lead_submission_success", { requestId, traceId, identifier, status: result.status });
    return NextResponse.json({ status: result.status });
  } catch (error) {
    logError("lead_submission_failure", {
      requestId,
      traceId,
      identifier,
      remediation: "Verify Supabase credentials and payload schema.",
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Unable to process lead" }, { status: 500 });
  }
}
