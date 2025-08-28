import {
  OrbitControls,
  OrthographicCamera,
  Sky,
  Environment,
  useFBO,
} from "@react-three/drei";
import { SketchyMaterial } from "../SketchyMaterial";
import { Canvas, useFrame, createPortal } from "@react-three/fiber";
import { useRef, useMemo, useEffect, useState, FC } from "react";
import * as THREE from "three";
import useScreenSize from "@/hooks/useScreenSize";

import styled from "styled-components";

const ThreeDiv = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  height: 100vh;

  canvas {
    width: 100% !important;
    height: 100% !important;
    max-width: 100%;
    max-height: 100%;
  }
`;

const Info = styled.div`
  position: fixed;
  left: 20px;
  top: 20px;
  z-index: 2;
  color: #000;
  font-size: 12px;
  a {
    color: blue;
    text-decoration: none;
    font-size: 12px;
  }
`;

const SiteInfo: FC = () => (
  <Info>
    <p>group dynamics</p>
    <a href="mailto:info@groupdynamics.net">info@groupdynamics.net</a>
  </Info>
);

const fragmentShader = `
 varying vec2 vUv;

uniform sampler2D textureA;
uniform sampler2D textureB;
uniform float uProgress;

void main() {
  vec2 uv = vUv;

  vec4 colorA = texture2D(textureA, uv);
  vec4 colorB = texture2D(textureB, uv);

  // Simple binary switch - no transition
  vec4 color = uProgress > 0.5 ? colorB : colorA;
  
  gl_FragColor = color;
  
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}

`;

const Transition = () => {
  const sphere = useRef<THREE.Mesh>(null);
  const screenMesh = useRef<THREE.Mesh>(null);
  const scene1 = new THREE.Scene();
  const scene2 = new THREE.Scene();
  const screenCamera = useRef<THREE.OrthographicCamera>(null);

  const progress = useRef(0);

  const renderTargetA = useFBO();
  const renderTargetB = useFBO();

  useFrame((state) => {
    const { gl, scene, camera, clock } = state;

    // Switch between 0 and 1 every 10 seconds
    const cycleTime = 10; // 10 seconds per cycle
    const elapsedTime = clock.getElapsedTime();
    const timeInCycle = elapsedTime % cycleTime;

    progress.current = timeInCycle >= 5 ? 0 : 1;

    gl.setRenderTarget(renderTargetA);
    gl.render(scene1, camera);

    gl.setRenderTarget(renderTargetB);
    gl.render(scene2, camera);

    // Update sketchy material time
    const sketchyMaterial = sphere.current?.material as THREE.ShaderMaterial;
    if (sketchyMaterial?.uniforms?.uTime) {
      sketchyMaterial.uniforms.uTime.value = clock.getElapsedTime();
    }

    if (screenMesh.current?.material) {
      const material = screenMesh.current.material as THREE.ShaderMaterial;
      material.uniforms.textureA.value = renderTargetA.texture;
      material.uniforms.textureB.value = renderTargetB.texture;
      material.uniforms.uProgress.value = progress.current;
    }
    gl.setRenderTarget(null);
  });

  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "/files/images/group-dynamics.png",
      (loadedTexture) => {
        setTexture(loadedTexture);
        setIsLoading(false);

        // Get the actual image dimensions
        const image = loadedTexture.image;
        if (image) {
          const aspectRatio = image.width / image.height;
          setImageAspectRatio(aspectRatio);
        }
      },
      undefined, // onProgress
      (error) => {
        console.error("Error loading texture:", error);
        setIsLoading(false);
      }
    );
  }, []);

  // Don't render anything while loading
  if (isLoading || !texture) {
    return null;
  }

  return (
    <>
      <OrbitControls
        enableDamping={true}
        dampingFactor={0.01}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(Math.PI * 3) / 4}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        // Responsive controls - adjust distance limits based on camera distance
        minDistance={0.5}
        maxDistance={10}
      />
      {createPortal(
        <>
          <ambientLight intensity={2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <mesh rotation={[0, 0.15, 0]}>
            <planeGeometry args={[imageAspectRatio, 1]} />

            <SketchyMaterial texture={texture} />
          </mesh>
        </>,
        scene1
      )}
      {createPortal(
        <>
          <ambientLight intensity={2} />
          <mesh rotation={[0, 0.15, 0]} ref={sphere}>
            <planeGeometry args={[imageAspectRatio, 1]} />

            <meshStandardMaterial
              map={texture}
              transparent={true}
              opacity={1}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>,
        scene2
      )}
      <OrthographicCamera ref={screenCamera} args={[-1, 1, 1, -1, 0, 1]} />
      <mesh ref={screenMesh} position={[0, 0, 0]} frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          uniforms={{
            textureA: {
              value: null,
            },
            textureB: {
              value: null,
            },
            uTime: {
              value: 0.0,
            },
            uProgress: {
              value: 0,
            },
          }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
    </>
  );
};

const Texture = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenSize = useScreenSize();
  const { screenWidth, screenHeight } = screenSize;

  // Calculate responsive camera distance for natural scaling
  const cameraDistance = useMemo(() => {
    const baseWidth = 1920;
    const baseHeight = 1080;
    const baseDistance = 1; // Base camera distance

    // Calculate scale factor based on the smaller dimension
    const widthScale = screenWidth / baseWidth;
    const heightScale = screenHeight / baseHeight;
    const scaleFactor = Math.min(widthScale, heightScale, 1);

    // Move camera away as screen gets smaller (inverse scaling)
    // This makes the scene appear smaller on smaller screens
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
    return [0, 0, cameraDistance] as [number, number, number];
  }, [cameraDistance]);

  return (
    <>
      <ThreeDiv>
        <Canvas
          ref={canvasRef}
          camera={{ position: cameraPosition }}
          dpr={dpr}
          gl={{ preserveDrawingBuffer: true, antialias: false }}
          data-r3f-canvas
        >
          <ambientLight intensity={2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          <Transition />
        </Canvas>
      </ThreeDiv>
      <SiteInfo />
    </>
  );
};

export default Texture;
