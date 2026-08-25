import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The HTML document references content-hashed JS/CSS chunk
        // filenames from the build that produced it. If a CDN in front of
        // the app (e.g. Hostinger's) caches this page, visitors can get an
        // old HTML shell pointing at chunks a newer deploy already removed
        // — a 404 on the stylesheet, unstyled page. Force revalidation so
        // the document is always fetched fresh; the hashed chunks under
        // /_next/static/ stay safely cached long-term since Next already
        // marks those immutable.
        source: "/",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
