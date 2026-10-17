import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Reşat Yavçin",
    short_name: "Reşat Yavçin",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfdfc",
    theme_color: "#fdfdfc",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
