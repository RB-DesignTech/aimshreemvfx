import { z } from "zod";

type GeneratePayload = {
  prompt: string;
  referenceImage: string;
};

type JobStatus = "queued" | "running" | "succeeded" | "failed";

type Provider = "nanobanana" | "replicate";

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

const replicatePredictionSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  output: z
    .union([
      z.string(),
      z.array(z.string()),
      z.null(),
      z.undefined(),
    ])
    .optional(),
});

const baseUrl = process.env.NANO_BANANA_BASE_URL;
const apiKey = process.env.NANO_BANANA_API_KEY;
const provider = (process.env.NANO_BANANA_PROVIDER ?? "nanobanana") as Provider;
const replicateModel = process.env.NANO_BANANA_REPLICATE_MODEL;
const replicateVersion = process.env.NANO_BANANA_REPLICATE_VERSION;
const baseUrl = process.env.NANO_BANANA_BASE_URL;
const apiKey = process.env.NANO_BANANA_API_KEY;

function getEnv() {
  if (!baseUrl) {
    throw new Error("Missing NANO_BANANA_BASE_URL environment variable");
  }

  if (!apiKey) {
    throw new Error("Missing NANO_BANANA_API_KEY environment variable");
  }

  if (provider !== "nanobanana" && provider !== "replicate") {
    throw new Error(
      "NANO_BANANA_PROVIDER must be either 'nanobanana' or 'replicate'"
    );
  }

  if (provider === "replicate" && !replicateVersion && !replicateModel) {
    throw new Error(
      "NANO_BANANA_REPLICATE_VERSION or NANO_BANANA_REPLICATE_MODEL is required when provider is 'replicate'"
    );
  }

  return { baseUrl, apiKey, provider, replicateModel, replicateVersion };
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
  const env = getEnv();

  if (env.provider === "replicate") {
    const response = await fetch(
      endpoint(`/v1/predictions/${jobId}`, env.baseUrl),
      {
        method: "GET",
        headers: {
          Authorization: `Token ${env.apiKey}`,
        },
        cache: "no-store",
      }
    );

    const data = await handleResponse(response, replicatePredictionSchema);
    return jobResponseSchema.parse({
      status: mapReplicateStatus(data.status),
      resultUrl: extractReplicateResult(data.output),
    });
  }

  const response = await fetch(endpoint(`/v1/jobs/${jobId}`, env.baseUrl), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
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
