"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTransitionStore } from "@/store/useTransitionStore";

// Mellow palette inspired by Group Dynamics beige + muted tones
const COLORS = [
  "#c4a484", // warm beige
  "#7a8b6e", // sage green
  "#BFB5AF", // dusty lavender
  "#6b8f9e", // muted teal
  "#b8956a", // warm camel
  "#9b8578", // taupe
];

interface BlockState {
  // Current animated values
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  // Target values
  targetX: number;
  targetY: number;
  targetScaleX: number;
  targetScaleY: number;
  // Color
  color: THREE.Color;
  targetColor: THREE.Color;
  // Timing
  speed: number;
}

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pickRandomColor(): THREE.Color {
  return new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
}

function randomRestingState(viewport: { width: number; height: number }) {
  const halfW = viewport.width / 2;
  const halfH = viewport.height / 2;
  return {
    x: randomRange(-halfW, halfW),
    y: randomRange(-halfH, halfH),
    scaleX: randomRange(1, 4),
    scaleY: randomRange(1, 4),
  };
}

function randomChaosState(viewport: { width: number; height: number }) {
  const halfW = viewport.width / 2;
  const halfH = viewport.height / 2;
  return {
    x: randomRange(-halfW * 1.2, halfW * 1.2),
    y: randomRange(-halfH * 1.2, halfH * 1.2),
    scaleX: randomRange(0.3, 8),
    scaleY: randomRange(0.3, 8),
  };
}

export function ColorBlocks() {
  const blockCount = 6;
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const stateRef = useRef<BlockState[] | null>(null);
  const chaosTimerRef = useRef(0);
  const chaosStepRef = useRef(0);
  const prevPhaseRef = useRef<string>("idle");
  const viewportRef = useRef({ width: 16, height: 9 });

  // Initialize block states
  const materials = useMemo(() => {
    return Array.from({ length: blockCount }, () => {
      return new THREE.MeshBasicMaterial({
        color: pickRandomColor(),
        transparent: true,
        opacity: 0.85,
      });
    });
  }, []);

  useFrame((state, delta) => {
    const { width, height } = state.viewport;
    viewportRef.current = { width, height };
    const phase = useTransitionStore.getState().phase;
    const preloaderDone = useTransitionStore.getState().preloaderDone;

    // Initialize states on first frame
    if (!stateRef.current) {
      stateRef.current = Array.from({ length: blockCount }, () => {
        const resting = randomRestingState({ width, height });
        const color = pickRandomColor();
        return {
          x: resting.x,
          y: resting.y,
          scaleX: resting.scaleX,
          scaleY: resting.scaleY,
          targetX: resting.x,
          targetY: resting.y,
          targetScaleX: resting.scaleX,
          targetScaleY: resting.scaleY,
          color: color.clone(),
          targetColor: color.clone(),
          speed: randomRange(2, 5),
        };
      });
    }

    const blocks = stateRef.current;

    // Phase change detection
    if (phase !== prevPhaseRef.current) {
      if (phase === "exiting") {
        // Start chaos — rapid random movements
        chaosStepRef.current = 0;
        chaosTimerRef.current = 0;
        // Immediately set first chaos targets
        for (const block of blocks) {
          const chaos = randomChaosState({ width, height });
          block.targetX = chaos.x;
          block.targetY = chaos.y;
          block.targetScaleX = chaos.scaleX;
          block.targetScaleY = chaos.scaleY;
          block.targetColor = pickRandomColor();
          block.speed = randomRange(8, 15);
        }
      } else if (phase === "entering") {
        // Settle to new random resting positions
        for (const block of blocks) {
          const resting = randomRestingState({ width, height });
          block.targetX = resting.x;
          block.targetY = resting.y;
          block.targetScaleX = resting.scaleX;
          block.targetScaleY = resting.scaleY;
          block.targetColor = pickRandomColor();
          block.speed = randomRange(2, 4);
        }
      }
      prevPhaseRef.current = phase;
    }

    // During chaos phase, cycle through random targets rapidly
    if (phase === "exiting") {
      chaosTimerRef.current += delta * 1000;
      const stepTimings = [40, 120, 120, 80, 80, 160, 120, 120, 160];
      const currentStepTime =
        stepTimings[Math.min(chaosStepRef.current, stepTimings.length - 1)];

      if (chaosTimerRef.current > currentStepTime) {
        chaosTimerRef.current = 0;
        chaosStepRef.current++;

        if (chaosStepRef.current >= 9) {
          // Chaos done, move to navigating
          useTransitionStore.getState().setPhase("navigating");
        } else {
          // New random targets
          for (const block of blocks) {
            const chaos = randomChaosState({ width, height });
            block.targetX = chaos.x;
            block.targetY = chaos.y;
            block.targetScaleX = chaos.scaleX;
            block.targetScaleY = chaos.scaleY;
            if (chaosStepRef.current % 2 === 0) {
              block.targetColor = pickRandomColor();
            }
          }
        }
      }
    }

    // Animate all blocks toward their targets
    for (let i = 0; i < blockCount; i++) {
      const block = blocks[i];
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      const lerpFactor = 1 - Math.pow(0.001, delta * block.speed);

      block.x += (block.targetX - block.x) * lerpFactor;
      block.y += (block.targetY - block.y) * lerpFactor;
      block.scaleX += (block.targetScaleX - block.scaleX) * lerpFactor;
      block.scaleY += (block.targetScaleY - block.scaleY) * lerpFactor;
      block.color.lerp(block.targetColor, lerpFactor * 0.5);

      mesh.position.set(block.x, block.y, 0);
      mesh.scale.set(block.scaleX, block.scaleY, 1);
      (mesh.material as THREE.MeshBasicMaterial).color.copy(block.color);

      // Show blocks only after preloader or during transitions
      const visible = preloaderDone || phase !== "idle";
      (mesh.material as THREE.MeshBasicMaterial).opacity = visible ? 0.85 : 0;
    }
  });

  return (
    <>
      {Array.from({ length: blockCount }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          position={[0, 0, -1 + i * 0.01]}
        >
          <planeGeometry args={[1, 1]} />
          <primitive object={materials[i]} attach="material" />
        </mesh>
      ))}
    </>
  );
}
