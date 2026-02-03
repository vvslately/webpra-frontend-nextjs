"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

export function Globe({
  className,
  config = {},
}: {
  className?: string;
  config?: {
    width?: number;
    height?: number;
    onRender?: (state: Record<string, unknown>) => void;
    devicePixelRatio?: number;
    phi?: number;
    theta?: number;
    dark?: number;
    diffuse?: number;
    mapSamples?: number;
    mapBrightness?: number;
    baseColor?: [number, number, number];
    markerColor?: [number, number, number];
    glowColor?: [number, number, number];
    markers?: Array<{
      location: [number, number];
      size?: number;
    }>;
    scale?: number;
  };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let phi = 0;
    let width = 0;
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    // Wait until canvas has dimensions (e.g. after layout)
    const w = Math.max(width, 100);
    const h = w;

    const markers = Array.isArray(config.markers)
      ? config.markers.map((m) => ({ location: m.location, size: m.size ?? 1 }))
      : [];

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: w * 2,
      height: h * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      scale: 1,
      ...config,
      markers,
      onRender: (state) => {
        state.phi = phi;
        phi += 0.01;
        if (config.onRender) {
          config.onRender(state);
        }
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [config]);

  return (
    <div className={cn("relative size-full", className)}>
      <canvas
        ref={canvasRef}
        className="size-full"
        style={{
          width: "100%",
          height: "100%",
          contain: "layout style size",
        }}
      />
    </div>
  );
}
