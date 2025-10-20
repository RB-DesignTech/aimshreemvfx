# Curio Flex Lab

A funky, neon, orange-forward playground for experimenting with Curio Flex image remixes and Curio Flex Video storyboards.

## 1. Bootstrap the project

### Shell commands
```bash
pnpm create next-app@latest curio-flex-lab --ts --app --tailwind --eslint --src-dir false --import-alias "@/*"
cd curio-flex-lab
pnpm i zod
```

### Manual checklist
1. Run the commands above to generate the Next.js 14 project scaffold with Tailwind CSS and TypeScript.
2. Copy the contents of this repository into the generated folder (or apply the diff on top of the scaffold) so the custom UI, API routes, and styling are available.
3. Duplicate `.env.local.example` to `.env.local` and populate the values:
   - Set `CURIO_FLEX_API_KEY` to the key that unlocks your Curio Flex access.
   - Optionally override `CURIO_FLEX_IMAGE_MODEL` if you want something other than `gemini-2.5-flash-image`.
4. Install dependencies with `pnpm install`.
5. Start the development server with `pnpm dev` and open http://localhost:3000 to explore the playground.
6. When deploying, ensure the Curio Flex environment variables are configured on your hosting platform.

## 2. Useful scripts

- `pnpm dev` – run the development server.
- `pnpm build` – create a production build.
- `pnpm start` – start the production server.
- `pnpm lint` – lint the project with ESLint.

## 3. Environment configuration

Use `.env.local.example` as a template for your local secrets. The app expects:

- `CURIO_FLEX_API_KEY` – API key for Curio Flex image generation.
- `CURIO_FLEX_IMAGE_MODEL` – Optional override for the Curio Flex image model (defaults to `gemini-2.5-flash-image`).

## 4. Project structure highlights

- `app/page.tsx` – Main UI with drag-and-drop uploads, prompt input, and immediate Curio Flex responses.
- `app/curio-flex-video/page.tsx` – Curio Flex Video storyboard lab with shot duration and aspect ratio controls.
- `app/api/curio-flex/*` – Server-side proxy endpoints that communicate with the Curio Flex image backend using secure server-side fetch calls.
- `app/api/curio-flex-video/*` – Server-side proxy endpoints that build Curio Flex Video storyboard previews.
- `lib/curio-flex.ts` – Lightweight wrapper around the Curio Flex image SDK.
- `lib/curio-flex-video.ts` – SVG storyboard composer for Curio Flex Video previews.
- `components/Particles.tsx` – Dependency-free animated particle background.
- `app/globals.css` – Tailwind-powered neon theming with glow effects, scanlines, and film grain.
- `tailwind.config.ts` & `next.config.mjs` – Tailwind customization and image remote pattern configuration.

Enjoy conjuring new composites in the Curio Flex Lab!
