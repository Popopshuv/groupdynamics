"use client";

import { Canvas } from "@react-three/fiber";

export function BackgroundCanvas() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      <Canvas
        orthographic
        camera={{ zoom: 50, position: [0, 0, 10] }}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Canvas ready for 3D elements — blocks are DOM-based for proper transform-origin behavior */}
        <ambientLight intensity={1} />
      </Canvas>
    </div>
  );
}
