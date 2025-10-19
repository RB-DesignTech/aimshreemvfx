# Curio VFX

A funky, neon, orange-forward VFX playground powered by the NanoBanana APIs.

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
3. Create a `.env.local` file (or copy `.env.local.example` to `.env.local`) and populate it with your NanoBanana credentials and optional image host configuration.
4. Install dependencies with `pnpm install`.
5. Start the development server with `pnpm dev` and open http://localhost:3000 to explore the playground.
6. When deploying, ensure the NanoBanana environment variables are configured on your hosting platform.

## 2. Useful scripts

- `pnpm dev` – run the development server.
- `pnpm build` – create a production build.
- `pnpm start` – start the production server.
- `pnpm lint` – lint the project with ESLint.

## 3. Environment configuration

Use `.env.local.example` as a template for your local secrets. The app expects:

- `NANO_BANANA_BASE_URL` – Base URL for the NanoBanana API (e.g. `https://api.nanobanana.dev`).
- `NANO_BANANA_API_KEY` – API key to authorize requests.
- `NEXT_IMAGE_REMOTE_PATTERNS` – Optional comma-separated list of remote image hosts allowed by Next/Image.

## 4. Project structure highlights

- `app/page.tsx` – Main UI with drag-and-drop uploads, prompt input, live preview, and polling.
- `app/api/nb/*` – Server-side proxy endpoints that communicate with NanoBanana using secure server-side fetch calls.
- `lib/nanobanana.ts` – Tiny SDK for generating jobs and polling their status.
- `components/Particles.tsx` – Dependency-free animated particle background.
- `app/globals.css` – Tailwind-powered neon theming with glow effects, scanlines, and film grain.
- `tailwind.config.ts` & `next.config.mjs` – Tailwind customization and image remote pattern configuration.

Enjoy conjuring new composites in Curio VFX!
