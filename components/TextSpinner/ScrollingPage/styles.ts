import styled from 'styled-components';

export const Container = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  /* cursor: none; */
  /* transition: height 1s ease-in-out; */

  &.intro-complete {
    height: 100vh;
  }
`;
