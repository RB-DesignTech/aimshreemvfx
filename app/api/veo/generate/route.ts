import { NextResponse } from "next/server";
import { z } from "zod";

import { generateStoryboardPreview } from "@/lib/veo";

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  storyboard: z.string().optional().nullable(),
  referenceImage: z.string().optional().nullable(),
  duration: z.string().min(1, "Duration is required"),
  aspectRatio: z.string().min(1, "Aspect ratio is required"),
});

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const image = await generateStoryboardPreview(payload);

    return NextResponse.json({
      image: `data:${image.mimeType};base64,${image.imageBase64}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.flatten() },
        { status: 400 }
      );
    }

    console.error("Veo generate error", error);
    return NextResponse.json({ error: "Failed to generate Veo storyboard" }, { status: 502 });
  }
}
