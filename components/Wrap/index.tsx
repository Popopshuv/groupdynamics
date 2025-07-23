"use client";

import styled from "styled-components";

import ScrollingPage from "@/components/ScrollingPage";

const WrapperDiv = styled.div``;

const Wrapper = () => {
  return (
    <WrapperDiv>
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
