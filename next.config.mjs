const rawPatterns = process.env.NEXT_IMAGE_REMOTE_PATTERNS?.split(",") ?? [];

const remotePatterns = rawPatterns
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map((entry) => {
    const normalized = entry.includes("://") ? entry : `https://${entry}`;
    try {
      const parsed = new URL(normalized);
      return {
        protocol: parsed.protocol.replace(":", ""),
        hostname: parsed.hostname,
        pathname: parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "/**",
      };
    } catch (error) {
      console.warn(`Invalid NEXT_IMAGE_REMOTE_PATTERNS entry: ${entry}`);
      return null;
    }
  })
  .filter(Boolean);

const nextConfig = {
  images: {
    remotePatterns,
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
