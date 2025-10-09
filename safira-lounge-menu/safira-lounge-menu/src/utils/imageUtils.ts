/**
 * Image Utilities - Responsive Images Helper
 */

export function generateSrcSet(imageSrc: string): string {
  const nameWithoutExt = imageSrc.replace(/\.[^/.]+$/, '');
  const sizes = [300, 600, 900, 1200];
  
  return sizes
    .map(w => `${nameWithoutExt}_${w}w.webp ${w}w`)
    .join(', ');
}

export function generateSizes(): string {
  return '(max-width: 400px) 300px, (max-width: 768px) 600px, (max-width: 1024px) 900px, 1200px';
}

export function getResponsiveImageProps(imageSrc: string, useResponsive = true) {
  if (!useResponsive) return { src: imageSrc };
  
  return {
    src: imageSrc.replace(/\.[^/.]+$/, '_600w.webp'),
    srcSet: generateSrcSet(imageSrc),
    sizes: generateSizes()
  };
}
