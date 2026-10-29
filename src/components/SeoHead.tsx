import React, { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'book';
  ogImage?: string;
  schemaJson?: Record<string, any>;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  ogImage = 'https://archive.org/services/img/don_quijote_vol1_0706_librivox',
  schemaJson,
}) => {
  useEffect(() => {
    // 1. Update document title
    document.title = title;

    // Helper to set or create meta tag
    const setMeta = (attr: 'name' | 'property', attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attr}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMeta('name', 'description', description);

    // 3. OpenGraph Tags
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:site_name', 'Auralis');

    const canonicalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${canonicalPath || window.location.pathname}`
      : canonicalPath;
    setMeta('property', 'og:url', canonicalUrl);

    // 4. Twitter Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    // 5. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // 6. Structured Data (JSON-LD)
    const scriptId = 'auralis-seo-schema';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (schemaJson) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schemaJson);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Cleanup custom schema on unmount if needed
    };
  }, [title, description, canonicalPath, ogType, ogImage, schemaJson]);

  return null;
};
