import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Mask, useMask, Text } from "@react-three/drei";
import * as THREE from "three";

import { extend, useFrame } from "@react-three/fiber";
import _ from "lodash";
import gsap, { Expo } from "gsap";
import { ScrollPageContext } from "@/components/ScrollingPage";

export type MaskedContentProps = {
  text: string;
  index: number;
  start: number;
  end: number;
};

type Ref = THREE.Group;

const font = "/files/fonts/sohne-halbfett.ttf";

const MaskedContent = React.forwardRef<Ref, MaskedContentProps>(
  ({ text = "", index = 1, start = 0, end = 100 }, ref) => {
    const stencil = useMask(index + 1);
    const textRef = useRef<THREE.Object3D>(null);
    const { introComplete } = useContext(ScrollPageContext);

    const mouseRef = useRef({ x: 0, y: 0 });

    const ww = global?.window?.innerWidth || 100;
    const fontSize = Math.round((ww / 1200) * 120);

    const onMouseMove = useCallback(
      (event: MouseEvent) => {
        if (!introComplete) return;
        const ww = global?.window?.innerWidth || 100;
        const wh = global?.window?.innerHeight || 100;
        gsap.to(mouseRef.current, {
          x: event.clientX - ww / 2,
          y: event.clientY - wh / 2,
          duration: 0.2,
        });
      },
      [introComplete]
    );

    useEffect(() => {
      if (introComplete) {
        global?.window.addEventListener("mousemove", onMouseMove);
      }
      return () => {
        global?.window.removeEventListener("mousemove", onMouseMove);
      };
    }, [introComplete, onMouseMove]);

    useFrame(() => {
      if (!introComplete) return;
      if (!textRef?.current?.position) return;
      gsap.to(textRef?.current?.position, {
        x: mouseRef.current.x * -0.3,
        y: mouseRef.current.y * 0.3,
        duration: 0.2 * index,
      });
    });

    return (
      <group ref={ref}>
        <Text
          ref={textRef}
          position={[0, 0, 0]}
          font={font}
          fontSize={fontSize}
          lineHeight={0.6}
          anchorX="center"
          anchorY="middle"
          color="lightgray"
          material-stencilWrite={stencil["stencilWrite"]}
          material-stencilFunc={stencil["stencilFunc"]}
          material-stencilRef={stencil["stencilRef"]}
          material-stencilFail={stencil["stencilFail"]}
          material-stencilZFail={stencil["stencilZFail"]}
          material-stencilZPass={stencil["stencilZPass"]}
        >
          {text}
        </Text>
      </group>
    );
  }
);
MaskedContent.displayName = "MaskedContent";

const MaskText = ({
  text = "",
  inner = 20,
  outter = 80,
  index = 0,
  start = 0,
  end = 0,
}) => {
  const contentRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!contentRef?.current) return;
    gsap.fromTo(
      contentRef.current.position,
      {
        z: 1500,
      },
      {
        z: 0,
        duration: 4,
        delay: 2 + index * 0.15,
        ease: Expo.easeInOut,
      }
    );
    gsap.fromTo(
      contentRef.current.rotation,
      {
        z: Math.PI,
      },
      {
        z: 0,
        duration: 2,
        delay: 2 + index * 0.15,
        ease: Expo.easeOut,
      }
    );
  }, []);

  return (
    <group>
      <Mask id={index + 1} position={[0, 0, 0]}>
        {/* <ringGeometry args={[inner, outter, 64]} /> */}
        <planeGeometry args={[inner, outter]} />
      </Mask>
      <MaskedContent
        text={text}
        ref={contentRef}
        index={index}
        start={0}
        end={100}
      />
    </group>
  );
};

export type MaskedTextProps = {
  text: string;
  start: number;
  end: number;
};

const MaskedText = ({ text, start, end }: MaskedTextProps) => {
  const { introComplete } = useContext(ScrollPageContext);
  const textRef = useRef<THREE.Object3D>(null);

  const renderRings = () => {
    const ww = global?.window?.innerWidth || 100;
    const wh = global?.window?.innerHeight || 100;
    const ringSize = (ww / 1200) * 140;
    const screenMax = Math.max(ww, wh);
    const totalRings = Math.ceil(screenMax / ringSize + 1);
    const masks: React.ReactElement[] = [];

    _.times(totalRings, (r: number) => {
      const inner = r * ringSize;
      const outter = r * ringSize + ringSize;
      const key = `aa-mask-text-${r}`;
      masks.push(
        <MaskText
          text={text}
          inner={inner}
          outter={outter}
          index={r}
          key={key}
          start={start}
          end={end}
        />
      );
    });

    return masks;
  };

  useEffect(() => {
    if (!textRef?.current || !introComplete) return;

    // Set initial state for animation
    gsap.set(textRef.current, {
      opacity: 0,
      y: -150,
    });

    // Set initial scale using Three.js scale property
    if (textRef.current.scale) {
      textRef.current.scale.set(0, 0, 0);
    }

    // Animate in
    gsap.to(textRef.current, {
      opacity: 1,
      y: -100,
      duration: 1.2,
      ease: Expo.easeOut,
      delay: 0.3, // Small delay for better timing
    });

    // Animate scale separately
    if (textRef.current.scale) {
      gsap.to(textRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.2,
        ease: Expo.easeOut,
        delay: 0.3,
      });
    }
  }, [introComplete]);

  return (
    <group>
      {renderRings()}

      {introComplete && (
        <Text
          ref={textRef}
          position={[0, -100, 0]}
          font="/files/fonts/sohne-halbfett.ttf"
          fontSize={20}
          color="lightgray"
          onClick={() => {
            window.open("mailto:info@groupdynamics.net", "_blank");
          }}
        >
          info@groupdynamics.net
        </Text>
      )}
    </group>
  );
};

export default MaskedText;
