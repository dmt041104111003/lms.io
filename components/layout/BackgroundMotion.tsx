"use client";

import { motion } from "framer-motion";

interface BackgroundMotionProps {
  className?: string;
  opacity?: number;
  scale?: number;
  duration?: number;
  imageSrc?: string;
  imageAlt?: string;
  imageWidth?: string;
  imageHeight?: string;
  imagePosition?: string;
}

export default function BackgroundMotion({
  className = "fixed left-[-100px] top-0 z-0 pointer-events-none select-none block",
  opacity = 0.05,
  scale = 1,
  duration = 1,
  imageSrc = "/images/common/loading.png",
  imageAlt = "Cardano2VN Logo",
  imageWidth = "15000px",
  imageHeight = "15000px",
  imagePosition = "left center"
}: BackgroundMotionProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity, scale }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration, ease: "easeOut" }}
      className={className}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl rounded-full"></div>
        <img
          src={imageSrc}
          alt={imageAlt}
          className={`w-[${imageWidth}] h-[${imageHeight}] object-contain blur-[8px]`}
          draggable={false}
          style={{ 
            objectPosition: imagePosition,
            '--image-position': imagePosition 
          } as React.CSSProperties & { '--image-position': string }}
        />
      </div>
    </motion.div>
  );
}
