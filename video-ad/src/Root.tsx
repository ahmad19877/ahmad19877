import React from "react";
import { Composition } from "remotion";
import { LandAd } from "./LandAd";

export const FPS = 30;
export const DURATION_IN_FRAMES = 900; // 30s
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LandAd"
      component={LandAd}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
