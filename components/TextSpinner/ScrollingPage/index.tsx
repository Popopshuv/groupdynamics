/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import ThreeCanvas from "../ThreeCanvas";
import { Container } from "./styles";
import MaskedText from "../MaskedText";
import classNames from "classnames";
import gsap from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

export const ScrollPageContext = React.createContext({
  introComplete: false,
  setIntroComplete: (value: boolean) => {},
});

const ScrollingPage = () => {
  const [introComplete, setIntroComplete] = useState(false);

  // Move the timer logic here to avoid multiple timers
  useEffect(() => {
    console.log("ScrollingPage: Setting up intro timer");
    const timer = setTimeout(() => {
      console.log("ScrollingPage: Intro timer fired");
      setIntroComplete(true);
    }, 7000);

    return () => {
      console.log("ScrollingPage: Cleaning up intro timer");
      clearTimeout(timer);
    };
  }, []);

  const contextValue = {
    introComplete,
    setIntroComplete: (value: boolean) => {
      console.log("ScrollingPage: setIntroComplete called with", value);
      setIntroComplete(value);
    },
  };

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.to(global?.window, {
      scrollTo: {
        x: 0,
        y: 0,
      },
      duration: 1,
    });

    gsap.to(pageRef.current, {
      opacity: 1,
      delay: 1,
      duration: 0.5,
    });
  }, []);

  const maskedText = `group dynamics`;

  const containerClasses = classNames({
    "intro-complete": introComplete,
  });

  return (
    <ScrollPageContext.Provider value={contextValue}>
      <Container ref={pageRef} id="page-container" className={containerClasses}>
        <ThreeCanvas>
          <MaskedText text={maskedText} start={0} end={100} />
        </ThreeCanvas>
      </Container>
    </ScrollPageContext.Provider>
  );
};

export default ScrollingPage;
