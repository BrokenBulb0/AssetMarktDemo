import { useState, useEffect } from "react";

interface ImageOptimizationOptions {
  src: string;
  width?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export function useImageOptimization({ src, width, quality = 80, format = 'webp' }: ImageOptimizationOptions) {
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // For external URLs (like Unsplash), use their optimization parameters
    if (src.includes('unsplash.com')) {
      const url = new URL(src);
      if (width) url.searchParams.set('w', width.toString());
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('fm', format);
      url.searchParams.set('fit', 'crop');
      setOptimizedSrc(url.toString());
      setIsLoading(false);
    } else {
      // For local images, use as-is (could add image processing service here)
      setOptimizedSrc(src);
      setIsLoading(false);
    }
  }, [src, width, quality, format]);

  return { src: optimizedSrc, isLoading, error };
}

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export function LazyImage({ 
  src, 
  alt, 
  width, 
  quality, 
  format, 
  className,
  ...props 
}: LazyImageProps) {
  const { src: optimizedSrc, isLoading } = useImageOptimization({ 
    src, 
    width, 
    quality, 
    format 
  });
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    const element = document.getElementById(`lazy-${src}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <div id={`lazy-${src}`} className={className}>
      {isVisible && !isLoading && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${hasLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          onLoad={() => setHasLoaded(true)}
          loading="lazy"
          {...props}
        />
      )}
      {(!isVisible || !hasLoaded) && (
        <div className={`bg-muted animate-pulse ${className}`} />
      )}
    </div>
  );
}
