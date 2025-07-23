import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import CameraSettings from "./CameraSettings";
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
  const dpr = 1;
  // const dpr = global?.window?.devicePixelRatio || 1;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <ThreeDiv>
      <Canvas
        dpr={[dpr, dpr]}
        ref={canvasRef}
        flat
        linear
        gl={{ stencil: true }}
      >
        <CameraSettings />
        {children}
      </Canvas>
    </ThreeDiv>
  );
};

export default ThreeCanvas;
