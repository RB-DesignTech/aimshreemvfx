import { NextResponse } from "next/server";
import { z } from "zod";

import { getJob } from "@/lib/nanobanana";

const paramsSchema = z.object({
  id: z.string().min(1),
});

export async function GET(_request: Request, context: { params: { id: string } }) {
  try {
    const { id } = paramsSchema.parse(context.params);
    const job = await getJob(id);
    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
    }

    console.error("NanoBanana getJob error", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 502 });
  }
}
