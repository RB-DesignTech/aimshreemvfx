import { z } from "zod";

type GeneratePayload = {
  prompt: string;
  referenceImage: string;
};

type JobStatus = "queued" | "running" | "succeeded" | "failed";

const generateResponseSchema = z.object({
  jobId: z.string().min(1),
});

const jobResponseSchema = z.object({
  status: z.union([
    z.literal("queued"),
    z.literal("running"),
    z.literal("succeeded"),
    z.literal("failed"),
  ]),
  resultUrl: z.string().url().optional(),
});

const baseUrl = process.env.NANO_BANANA_BASE_URL;
const apiKey = process.env.NANO_BANANA_API_KEY;

function getEnv() {
  if (!baseUrl) {
    throw new Error("Missing NANO_BANANA_BASE_URL environment variable");
  }

  if (!apiKey) {
    throw new Error("Missing NANO_BANANA_API_KEY environment variable");
  }

  return { baseUrl, apiKey };
}

function endpoint(path: string, base: string) {
  return new URL(path, base).toString();
}

async function handleResponse<T>(res: Response, schema: z.ZodSchema<T>): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NanoBanana request failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  return schema.parse(json);
}

export async function generate(payload: GeneratePayload) {
  const { baseUrl: base, apiKey: key } = getEnv();
  const response = await fetch(endpoint("/v1/generate", base), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response, generateResponseSchema);
}

export async function getJob(jobId: string) {
  const { baseUrl: base, apiKey: key } = getEnv();
  const response = await fetch(endpoint(`/v1/jobs/${jobId}`, base), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  return handleResponse(response, jobResponseSchema);
}

export type { JobStatus };
