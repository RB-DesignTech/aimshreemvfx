const escapeForSvg = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type VeoStoryboardPayload = {
  prompt: string;
  storyboard?: string | null;
  referenceImage?: string | null;
  duration: string;
  aspectRatio: string;
};

type GeneratedImage = {
  mimeType: string;
  imageBase64: string;
};

export async function generateStoryboardPreview({
  prompt,
  storyboard,
  referenceImage,
  duration,
  aspectRatio,
}: VeoStoryboardPayload): Promise<GeneratedImage> {
  const trimmedPrompt = prompt.trim();
  const promptPreview = trimmedPrompt.length > 140 ? `${trimmedPrompt.slice(0, 137)}…` : trimmedPrompt;
  const storyboardPreview = storyboard?.trim() ?? "";
  const hasStoryboard = storyboardPreview.length > 0;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(15, 8, 40, 1)" />
      <stop offset="70%" stop-color="rgba(255, 122, 0, 0.35)" />
      <stop offset="100%" stop-color="rgba(255, 184, 107, 0.2)" />
    </linearGradient>
    <linearGradient id="border" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255, 122, 0, 0.6)" />
      <stop offset="100%" stop-color="rgba(255, 184, 107, 0.6)" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="960" height="540" fill="url(#bg)" rx="48" />
  <rect x="24" y="24" width="912" height="492" rx="36" fill="rgba(10, 10, 30, 0.55)" stroke="url(#border)" stroke-width="2" />
  <text x="64" y="96" font-family="'Space Grotesk', sans-serif" font-size="28" fill="rgba(255,255,255,0.8)" letter-spacing="12" text-transform="uppercase">Google Veo 3</text>
  <text x="64" y="144" font-family="'Space Grotesk', sans-serif" font-size="18" fill="rgba(255,255,255,0.6)">Duration: ${escapeForSvg(
    duration
  )}s · Frame: ${escapeForSvg(aspectRatio)}</text>
  <text x="64" y="204" font-family="'Space Grotesk', sans-serif" font-size="20" fill="rgba(255,184,107,0.9)" letter-spacing="6" text-transform="uppercase">Scene Prompt</text>
  <foreignObject x="64" y="220" width="832" height="120">
    <body xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Space Grotesk', sans-serif; color: rgba(255, 255, 255, 0.82); font-size: 18px; line-height: 1.6;">
      ${escapeForSvg(promptPreview).replace(/\n/g, "<br/>")}
    </body>
  </foreignObject>
  ${
    hasStoryboard
      ? `<text x="64" y="368" font-family="'Space Grotesk', sans-serif" font-size="20" fill="rgba(255,184,107,0.85)" letter-spacing="6" text-transform="uppercase">Storyboard Beats</text>
  <foreignObject x="64" y="384" width="832" height="96">
    <body xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Space Grotesk', sans-serif; color: rgba(255, 255, 255, 0.75); font-size: 16px; line-height: 1.6;">
      ${escapeForSvg(storyboardPreview).replace(/\n/g, "<br/>")}
    </body>
  </foreignObject>`
      : ""
  }
  <text x="64" y="520" font-family="'Space Grotesk', sans-serif" font-size="16" fill="rgba(255,255,255,0.55)">
    ${escapeForSvg(referenceImage ? "Reference frame attached" : "No reference frame supplied")}
  </text>
</svg>`;

  return {
    mimeType: "image/svg+xml",
    imageBase64: Buffer.from(svg).toString("base64"),
  };
}
