import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

let cairoLoadPromise: Promise<void> | null = null;

const loadCairo = (): Promise<void> => {
  if (cairoLoadPromise) return cairoLoadPromise;

  cairoLoadPromise = (async () => {
    const face = new FontFace(
      "Cairo",
      `url(${staticFile("fonts/Cairo-Regular.ttf")})`,
      { weight: "200 1000" }
    );
    const loaded = await face.load();
    (document.fonts as FontFaceSet).add(loaded);
    await (document.fonts as FontFaceSet).ready;
  })();

  return cairoLoadPromise;
};

export const useCairoFont = () => {
  const [handle] = useState(() => delayRender("Loading Cairo font"));

  useEffect(() => {
    loadCairo()
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
