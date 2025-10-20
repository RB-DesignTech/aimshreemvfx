# Curio VFX

A funky, neon, orange-forward VFX playground powered by Google Gemini 2.5 Flash Image.

## 1. Bootstrap the project

### Shell commands
```bash
pnpm create next-app@latest curio-vfx --ts --app --tailwind --eslint --src-dir false --import-alias "@/*"
cd curio-vfx
pnpm i zod
```

### Manual checklist
1. Run the commands above to generate the Next.js 14 project scaffold with Tailwind CSS and TypeScript.
2. Copy the contents of this repository into the generated `curio-vfx` folder (or apply the diff on top of the scaffold) so the custom UI, API routes, and styling are available.
3. Duplicate `.env.local.example` to `.env.local` and populate the values:
   - Set `GEMINI_API_KEY` to your Google AI Studio key.
  - Optionally override `GEMINI_IMAGE_MODEL` if you want something other than `gemini-2.5-flash-image`.
4. Install dependencies with `pnpm install`.
5. Start the development server with `pnpm dev` and open http://localhost:3000 to explore the playground.
6. When deploying, ensure the Gemini environment variables are configured on your hosting platform.

## 2. Useful scripts

- `pnpm dev` – run the development server.
- `pnpm build` – create a production build.
- `pnpm start` – start the production server.
- `pnpm lint` – lint the project with ESLint.

## 3. Environment configuration

Use `.env.local.example` as a template for your local secrets. The app expects:

- `GEMINI_API_KEY` – API key generated in Google AI Studio.
- `GEMINI_IMAGE_MODEL` – Optional override for the image-capable Gemini model (defaults to `gemini-2.5-flash-image`).

## 4. Project structure highlights

- `app/page.tsx` – Main UI with drag-and-drop uploads, prompt input, and immediate Gemini responses.
- `app/api/gemini/*` – Server-side proxy endpoints that communicate with Google Gemini using secure server-side fetch calls.
- `lib/gemini.ts` – Lightweight wrapper around the official Google Generative AI SDK.
- `components/Particles.tsx` – Dependency-free animated particle background.
- `app/globals.css` – Tailwind-powered neon theming with glow effects, scanlines, and film grain.
- `tailwind.config.ts` & `next.config.mjs` – Tailwind customization and image remote pattern configuration.

Enjoy conjuring new composites in Curio VFX!
