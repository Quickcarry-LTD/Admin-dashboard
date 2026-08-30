import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // There are other lockfiles above this directory (it lives under
  // Downloads); without this, Turbopack infers the wrong workspace root.
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
