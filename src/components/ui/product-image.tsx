"use client";

import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
}

function isLocalImage(src: string) {
  return typeof src === "string" && src.startsWith("/");
}

export function ProductImage({
  src,
  alt,
  className = "",
  fill,
  sizes,
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(isLocalImage(src) ? src : "/products/generic.svg");

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={fill ? { width: "100%", height: "100%", objectFit: "cover" } : undefined}
      sizes={sizes}
      onError={() => setImgSrc("/products/generic.svg")}
    />
  );
}
