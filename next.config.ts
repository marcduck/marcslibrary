import type { NextConfig } from 'next';

// Covers come from whatever URL the catalogue gives us (and can be edited by
// hand), so they are rendered with a plain <img> that falls back when the image
// fails, rather than next/image with a fixed host allowlist.
const nextConfig: NextConfig = {};

export default nextConfig;
