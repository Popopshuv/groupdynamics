import { Canvas } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import CameraSettings from "./CameraSettings";
import useScreenSize from "@/hooks/useScreenSize";
import styled from "styled-components";

// extend({ MeshLine, MeshLineMaterial });

export type ThreeCanvasProps = {
  children?: React.ReactNode;
};

const ThreeDiv = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
`;

const ThreeCanvas = ({ children }: ThreeCanvasProps) => {
  const screenSize = useScreenSize();
  const { screenWidth, screenHeight } = screenSize;

  // Calculate responsive camera distance for natural scaling
  const cameraDistance = useMemo(() => {
    const baseWidth = 1920;
    const baseHeight = 1080;
    const baseDistance = 4; // Base camera distance for this component

    // Calculate scale factor based on the smaller dimension
    const widthScale = screenWidth / baseWidth;
    const heightScale = screenHeight / baseHeight;
    const scaleFactor = Math.min(widthScale, heightScale, 1);

    // Move camera away as screen gets smaller (inverse scaling)
    const responsiveDistance = baseDistance / scaleFactor;

    return responsiveDistance;
  }, [screenWidth, screenHeight]);

  // Calculate responsive DPR
  const dpr = useMemo(() => {
    if (typeof window !== "undefined") {
      return Math.min(window.devicePixelRatio || 1, 2);
    }
    return 1;
  }, []);

  // Calculate responsive camera position
  const cameraPosition = useMemo(() => {
    return [0, -1, cameraDistance] as [number, number, number];
  }, [cameraDistance]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <ThreeDiv>
      <Canvas
        camera={{ position: cameraPosition, fov: 65 }}
        gl={{
          alpha: false,
        }}
        dpr={dpr}
      >
        <CameraSettings />
        {children}
      </Canvas>
    </ThreeDiv>
  );
};

export default ThreeCanvas;
