"use client";

import Image from "next/image";

interface CardFrameProps {
  className?: string;
}

export default function CardFrame({ className }: CardFrameProps) {
  const baseClass = "pointer-events-none absolute inset-0 select-none";
  const classes = className ? `${baseClass} ${className}` : baseClass;

  return (
    <div className={classes} aria-hidden="true">
      <Image
        src="/CardFrame.svg"
        alt=""
        fill
        priority
        sizes="422px"
        className="object-contain"
        draggable={false}
      />
    </div>
  );
}
