import { NextResponse } from "next/server";
import { z } from "zod";

import { generate } from "@/lib/nanobanana";

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  referenceImage: z.string().min(1, "Reference image data is required"),
});

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const job = await generate(payload);
    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.flatten() },
        { status: 400 }
      );
    }

    console.error("NanoBanana generate error", error);
    return NextResponse.json({ error: "Failed to start generation" }, { status: 502 });
  }
}
