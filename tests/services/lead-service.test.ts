import { beforeEach, describe, expect, it, vi } from "vitest";

import { submitLead } from "@/services/lead-service";

const insertMock = vi.fn();
const selectMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: fromMock,
  })),
}));

describe("submitLead", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    process.env.SUPABASE_LEADS_TABLE = "leads";
    insertMock.mockReset();
    selectMock.mockReset();
    fromMock.mockImplementation(() => ({
      select: selectMock,
      insert: insertMock,
    }));
  });

  it("rejects payloads without contact info", async () => {
    await expect(submitLead({ name: "Missing contact" }, {})).rejects.toThrow(/Email or phone/);
  });

  it("skips inserting duplicate leads", async () => {
    selectMock.mockImplementation(() => ({
      match: () => ({
        limit: () => Promise.resolve({ error: null, count: 1 }),
      }),
    }));

    const result = await submitLead(
      { name: "Dup Contact", email: "dup@example.com" },
      { requestId: "req-1", traceId: "trace-1" },
    );

    expect(result).toEqual({ status: "skipped" });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("inserts new leads with normalized payload", async () => {
    selectMock.mockImplementation(() => ({
      match: () => ({
        limit: () => Promise.resolve({ error: null, count: 0 }),
      }),
    }));
    insertMock.mockResolvedValue({ error: null });

    const payload = {
      name: "New Lead",
      email: "lead@example.com",
      service: "RainWise",
      message: "Help with gutters",
    };

    const result = await submitLead(payload, { requestId: "req-2", traceId: "trace-2" });

    expect(result).toEqual({ status: "created" });
    expect(insertMock).toHaveBeenCalledTimes(1);
    const [records] = insertMock.mock.calls[0];
    expect(Array.isArray(records)).toBe(true);
    const [record] = records as Array<Record<string, unknown>>;
    expect(record).toMatchObject({
      email: "lead@example.com",
      service_type: "RainWise",
      message: "Help with gutters",
    });
  });
});
