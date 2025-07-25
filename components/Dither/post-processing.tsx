import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, RenderPass, EffectPass } from "postprocessing";

import { DitheringEffect } from "./dithering-shader/DitheringEffect";

// Global state for mouse tracking
const globalMouseState = {
  isInCanvas: false,
  position: { x: 0, y: 0 },
  canvasBounds: { left: 0, top: 0, width: 0, height: 0 },
};

// Function to update global mouse state
export const updateMouseState = (
  isInCanvas: boolean,
  position?: { x: number; y: number },
  bounds?: { left: number; top: number; width: number; height: number }
) => {
  globalMouseState.isInCanvas = isInCanvas;
  if (position) globalMouseState.position = position;
  if (bounds) globalMouseState.canvasBounds = bounds;
};

/**
 * Component that manages all post-processing effects
 * Configures and applies various effects to the rendered scene
 */
export const PostProcessing = () => {
  // References
  const composerRef = useRef<EffectComposer | null>(null);
  const ditheringEffectRef = useRef<DitheringEffect | null>(null);
  const { gl } = useThree();

  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.Camera | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Static effect values (removed Leva dependency)
  const pixelSizeRatio = 1;
  const grayscaleOnly = true;

  // Calculate dithering grid size based on mouse distance from center
  const calculateGridSize = useCallback(() => {
    if (!globalMouseState.isInCanvas) return 1; // No dithering when mouse is outside canvas

    const centerX =
      globalMouseState.canvasBounds.left +
      globalMouseState.canvasBounds.width / 2;
    const centerY =
      globalMouseState.canvasBounds.top +
      globalMouseState.canvasBounds.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(globalMouseState.position.x - centerX, 2) +
        Math.pow(globalMouseState.position.y - centerY, 2)
    );
    const maxDistance = Math.sqrt(
      Math.pow(globalMouseState.canvasBounds.width / 2, 2) +
        Math.pow(globalMouseState.canvasBounds.height / 2, 2)
    );
    const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
    // Invert the behavior: more dithering when closer to center
    const invertedDistance = 1 - normalizedDistance;
    const minGridSize = 1;
    return Math.max(minGridSize, Math.round(invertedDistance * 20)); // 1 to 10
  }, []);

  // Mouse movement handler
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (globalMouseState.isInCanvas) {
      updateMouseState(true, { x: event.clientX, y: event.clientY });
    }
  }, []);

  // Memoized resize handler
  const handleResize = useCallback(() => {
    if (composerRef.current) {
      // Get the actual canvas element size
      const canvas = document.querySelector("canvas");
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        composerRef.current.setSize(rect.width, rect.height);
      } else {
        // Fallback to calculated size
        const canvasWidth = window.innerWidth * 0.6;
        const canvasHeight = window.innerHeight * 0.6;
        composerRef.current.setSize(canvasWidth, canvasHeight);
      }
    }
  }, []);

  // Handle window resize and mouse events
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleResize, handleMouseMove]);

  // Configure post-processing effects
  useEffect(() => {
    if (!scene || !camera || !composerRef.current) return;

    console.log("Setting up post-processing effects");
    const composer = composerRef.current;
    composer.removeAllPasses();

    // Add required passes in order
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Dithering effect - always active with dynamic grid size
    const ditheringEffect = new DitheringEffect({
      gridSize: calculateGridSize(),
      pixelSizeRatio,
      grayscaleOnly,
    });
    ditheringEffectRef.current = ditheringEffect;

    composer.addPass(new EffectPass(camera, ditheringEffect));
    console.log("Post-processing effects configured");
  }, [scene, camera, calculateGridSize, pixelSizeRatio, grayscaleOnly]);

  // Handle rendering and update grid size continuously
  useFrame(({ gl, scene: currentScene, camera: currentCamera }) => {
    // Wait for scene and camera to be available
    if (!currentScene || !currentCamera) {
      console.log("Waiting for scene/camera...");
      return;
    }

    // Initialize composer if not yet created
    if (!composerRef.current) {
      console.log("Creating EffectComposer");
      composerRef.current = new EffectComposer(gl);
      handleResize(); // Initial sizing
      // Add a small delay to ensure proper initialization
      setTimeout(() => setIsInitialized(true), 100);
    }

    // Update scene and camera references if changed
    if (scene !== currentScene) setScene(currentScene);
    if (camera !== currentCamera) setCamera(currentCamera);

    // Update grid size continuously
    if (ditheringEffectRef.current) {
      const newGridSize = calculateGridSize();
      const uniforms = ditheringEffectRef.current.uniforms;
      if (uniforms.get) {
        const gridSizeUniform = uniforms.get("gridSize");
        if (gridSizeUniform) {
          gridSizeUniform.value = newGridSize;
        }
      }
    }

    // Only render if we have all the necessary components and are initialized
    if (composerRef.current && scene && camera && isInitialized) {
      // Let the EffectComposer handle the rendering
      composerRef.current.render();
      console.log("Rendering with EffectComposer");
    }
  }, 1);

  return null;
};
