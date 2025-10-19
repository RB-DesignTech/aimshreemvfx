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

function mapReplicateStatus(status: string): JobStatus {
  switch (status) {
    case "starting":
    case "queued":
      return "queued";
    case "processing":
    case "running":
      return "running";
    case "succeeded":
      return "succeeded";
    default:
      return "failed";
  }
}

function extractReplicateResult(
  output: string | string[] | null | undefined
): string | undefined {
  if (!output) {
    return undefined;
  }

  if (typeof output === "string") {
    return output;
  }

  return output.find((value) => value.startsWith("http"));
}

export async function generate(payload: GeneratePayload) {
  const env = getEnv();

  if (env.provider === "replicate") {
    const response = await fetch(endpoint("/v1/predictions", env.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${env.apiKey}`,
      },
      body: JSON.stringify({
        ...(env.replicateModel ? { model: env.replicateModel } : {}),
        ...(env.replicateVersion ? { version: env.replicateVersion } : {}),
        input: {
          prompt: payload.prompt,
          reference_image: payload.referenceImage,
        },
      }),
    });

    const data = await handleResponse(response, replicatePredictionSchema);
    return { jobId: data.id };
  }

  const response = await fetch(endpoint("/v1/generate", env.baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.apiKey}`,
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
    },
    cache: "no-store",
  });

  return handleResponse(response, jobResponseSchema);
}

export type { JobStatus };
