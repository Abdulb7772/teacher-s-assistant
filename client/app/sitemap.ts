import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();

  return ["", "/course-outline", "/students", "/login"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? ("monthly" as const) : ("weekly" as const),
    priority: path === "" ? 1 : 0.7,
  }));
}
