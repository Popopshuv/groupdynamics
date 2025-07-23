"use client";

import styled from "styled-components";
import { useEffect, useRef } from "react";
import { gsap, Expo } from "gsap";

import ThreeCanvas from "@/components/ThreeCanvas";
import MaskedText from "@/components/MaskedText";

import ScrollingPage from "@/components/ScrollingPage";

const WrapperDiv = styled.div``;

const TextBox = styled.div`
  position: fixed;
  bottom: 20vh;
  left: calc(50vw - 40px);
  display: inline-block;
  background: black;
  margin-top: 20vh;
  transform: translateX(-100%);

  overflow: hidden;
  height: 2px;
  opacity: 0;

  .fonts-loaded & {
    opacity: 1;
  }
`;

const TextContent = styled.div`
  padding: 20px 28px 20px 12px;
`;

const Wrapper = () => {
  const textBoxRef = useRef<HTMLDivElement>(null);

  const maskedText = `group dynamics`;

  return (
    <WrapperDiv ref={textBoxRef}>
      <ScrollingPage />
      {/* <TextBox>
        <TextContent>
          <a href="mailto:info@groupdynamics.net" target="_blank">
            info@groupdynamics.net
          </a>
        </TextContent>
      </TextBox> */}
    </WrapperDiv>
  );
};

export default Wrapper;
