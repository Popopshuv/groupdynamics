"use client";

import styled from "styled-components";
import Dither from "../Dither";
import Texture from "./texture";

const WrapperDiv = styled.div`
  width: 100vw;
  height: 100vh;
`;

const Wrapper = () => {
  return (
    <WrapperDiv>
      <Texture />
    </WrapperDiv>
  );
};

export default Wrapper;
