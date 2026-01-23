import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({
  title = "WindSand Asset Market - Premium Game Assets & 3D Models",
  description = "Discover premium game assets and 3D models for Unity and similar engines. Browse characters, environments, props, and effects with real-time 3D previews.",
  image = "/og-image.png",
  url,
  type = "website",
}: SEOProps) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
      }
      if (!element) {
        element = document.createElement("meta");
        if (property.startsWith("og:") || property.startsWith("twitter:")) {
          element.setAttribute("property", property);
        } else {
          element.setAttribute("name", property);
        }
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Standard meta tags
    updateMetaTag("description", description);

    // Open Graph tags
    updateMetaTag("og:title", title);
    updateMetaTag("og:description", description);
    updateMetaTag("og:image", image);
    updateMetaTag("og:type", type);
    if (url) updateMetaTag("og:url", url);

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);
  }, [title, description, image, url, type]);

  return null;
}
