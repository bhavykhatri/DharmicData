import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dharmic Data",
    short_name: "Dharmic Data",
    description: "Read the Gita, Ramayana, Mahabharata and the Vedas, online or offline.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ec",
    theme_color: "#b8510a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
