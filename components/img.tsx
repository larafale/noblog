"use client"


import { useState } from "react";
import type { ComponentProps } from "react";
import type { CldImageProps } from 'next-cloudinary';
import { CldImage } from 'next-cloudinary';
import cn from "clsx";
import Image from "next/image";
import { isCloudinarySrc } from "@/lib/utils";


export const Img = (props: CldImageProps) => {
  return isCloudinarySrc(props.src)
    ? <CldImage {...props} />
    : <Image {...props} />
}

export default function BlurImg(props: ComponentProps<typeof CldImage>) {
  const [isLoading, setLoading] = useState(true);

  return isCloudinarySrc(props.src) ?
    (<CldImage
      {...props}
      alt={props.alt}
      className={cn(
        props.className,
        "duration-700 ease-in-out",
        isLoading ? "scale-105 blur-lg" : "scale-100 blur-0",
      )}
      onLoad={() => setLoading(false)}
    />)
    : (<Image
      {...props}
      alt={props.alt}
      className={cn(
        props.className,
        "duration-700 ease-in-out",
        isLoading ? "scale-105 blur-lg" : "scale-100 blur-0",
      )}
      onLoad={() => setLoading(false)}
    />)
}