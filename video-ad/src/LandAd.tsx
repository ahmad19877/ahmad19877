import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { useCairoFont } from "./useCairoFont";

const BLACK = "#0A0908";
const BLACK_CARD = "#161310";
const GOLD = "#C9972E";
const GOLD_LIGHT = "#F0CD79";
const WHITE = "#FFFFFF";

const fontFamily = "Cairo, sans-serif";

// ---------- helpers ----------

// Explicit weight on both fontWeight and the variable-font axis so the
// Cairo variable font actually renders at the heavy end instead of
// defaulting to a thin interpolation.
const weight = (w: number): React.CSSProperties => ({
  fontWeight: w as React.CSSProperties["fontWeight"],
  fontVariationSettings: `"wght" ${w}`,
});

const textPop: React.CSSProperties = {
  textShadow: "0 3px 14px rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.8)",
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const edgeFade = (frame: number, duration: number, fadeFrames = 18) => {
  const inFade = interpolate(frame, [0, fadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outFade = interpolate(
    frame,
    [duration - fadeFrames, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return clamp01(Math.min(inFade, outFade));
};

// ---------- shared bits ----------

const TopBar: React.FC<{ visible: number }> = ({ visible }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 56,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: visible,
        transform: `translateY(${interpolate(visible, [0, 1], [-20, 0])}px)`,
      }}
    >
      <div
        style={{
          background: "rgba(10, 9, 8, 0.85)",
          border: `2px solid ${GOLD}`,
          borderRadius: 999,
          padding: "14px 36px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        <span
          style={{
            fontFamily,
            ...weight(800),
            fontSize: 30,
            color: GOLD_LIGHT,
          }}
        >
          قطعة أرض للبيع
        </span>
        <span style={{ color: WHITE, opacity: 0.5, fontSize: 26 }}>•</span>
        <span
          style={{
            fontFamily,
            ...weight(700),
            fontSize: 28,
            color: WHITE,
          }}
        >
          شفا بدران
        </span>
      </div>
    </div>
  );
};

const Caption: React.FC<{ frame: number; duration: number; lines: string[] }> = ({
  frame,
  duration,
  lines,
}) => {
  const appear = spring({
    frame: frame - 14,
    fps: 30,
    config: { damping: 18, stiffness: 140, mass: 0.8 },
  });
  const fadeOut = interpolate(
    frame,
    [duration - 20, duration - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = clamp01(appear) * fadeOut;
  const translateY = interpolate(appear, [0, 1], [50, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 210,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          background: "rgba(10, 9, 8, 0.9)",
          border: `2.5px solid ${GOLD}`,
          borderRadius: 28,
          padding: "28px 44px",
          boxShadow: "0 18px 44px rgba(0,0,0,0.6)",
          maxWidth: 900,
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily,
              ...weight(i === 0 ? 900 : 800),
              fontSize: i === 0 ? 48 : 34,
              color: i === 0 ? GOLD_LIGHT : WHITE,
              textAlign: "center",
              lineHeight: 1.4,
              letterSpacing: 0.3,
              ...textPop,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

const BottomGradient: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "55%",
      background:
        "linear-gradient(to bottom, rgba(10,9,8,0) 0%, rgba(10,9,8,0.6) 55%, rgba(10,9,8,0.92) 100%)",
    }}
  />
);

const TopGradient: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: "30%",
      background:
        "linear-gradient(to top, rgba(10,9,8,0) 0%, rgba(10,9,8,0.65) 100%)",
    }}
  />
);

// ---------- Ken Burns photo ----------

const KenBurns: React.FC<{
  src: string;
  duration: number;
  direction: "in" | "out";
  panX: number; // -1..1
  objectPosition?: string;
}> = ({ src, duration, direction, panX, objectPosition = "center" }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });

  const scale =
    direction === "in"
      ? interpolate(progress, [0, 1], [1.0, 1.16])
      : interpolate(progress, [0, 1], [1.16, 1.0]);

  const translate = interpolate(progress, [0, 1], [-panX * 3, panX * 3]);

  const opacity = edgeFade(frame, duration);

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          transform: `scale(${scale}) translate(${translate}%, 0)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Intro ----------

const Intro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const opacity = edgeFade(frame, duration, 20);

  const scaleTitle = spring({
    frame,
    fps: 30,
    config: { damping: 14, stiffness: 120, mass: 0.9 },
  });

  const subOpacity = interpolate(frame, [18, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill>
        <Img
          src={staticFile("images/photo1.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(2px) brightness(0.4)",
            transform: `scale(${interpolate(frame, [0, duration], [1, 1.08])})`,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,9,8,0.7) 0%, rgba(10,9,8,0.55) 45%, rgba(10,9,8,0.92) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "0 70px",
        }}
      >
        <div
          style={{
            fontFamily,
            ...weight(900),
            fontSize: 90,
            color: GOLD_LIGHT,
            textAlign: "center",
            lineHeight: 1.25,
            letterSpacing: 0.5,
            transform: `scale(${clamp01(scaleTitle)})`,
            textShadow: "0 4px 24px rgba(0,0,0,0.8)",
          }}
        >
          قطعة أرض للبيع
        </div>
        <div
          style={{
            fontFamily,
            ...weight(800),
            fontSize: 44,
            color: WHITE,
            textAlign: "center",
            marginTop: 26,
            opacity: subOpacity,
            ...textPop,
          }}
        >
          شفا بدران - حوض مرج الفرس
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Outro ----------

const Outro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const opacity = edgeFade(frame, duration, 20);

  const cardScale = spring({
    frame,
    fps: 30,
    config: { damping: 15, stiffness: 130, mass: 0.9 },
  });

  const rows: [string, string][] = [
    ["الموقع", "شفا بدران - حوض مرج الفرس"],
    ["المساحة", "775 م²"],
    ["التنظيم", "سكن ب"],
    ["الواجهة", "على شارع 12 متر"],
  ];

  const priceOpacity = interpolate(frame, [26, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phonePulse = 1 + 0.03 * Math.sin(frame / 8);

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `radial-gradient(circle at 50% 0%, ${BLACK_CARD} 0%, ${BLACK} 70%)`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 64px",
      }}
    >
      <div
        style={{
          fontFamily,
          ...weight(900),
          fontSize: 60,
          color: GOLD_LIGHT,
          textAlign: "center",
          letterSpacing: 0.5,
          transform: `scale(${clamp01(cardScale)})`,
          textShadow: "0 4px 20px rgba(0,0,0,0.6)",
        }}
      >
        قطعة أرض للبيع
      </div>

      <div
        style={{
          marginTop: 34,
          background: "rgba(255,255,255,0.04)",
          border: `2.5px solid ${GOLD}`,
          borderRadius: 30,
          padding: "36px 44px",
          width: "100%",
          maxWidth: 860,
          transform: `scale(${clamp01(cardScale)})`,
        }}
      >
        {rows.map(([label, value], i) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 0",
              borderBottom:
                i === rows.length - 1 ? "none" : "1px solid rgba(201,151,46,0.35)",
            }}
          >
            <span
              style={{
                fontFamily,
                ...weight(700),
                fontSize: 32,
                color: WHITE,
                opacity: 0.75,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily,
                ...weight(800),
                fontSize: 36,
                color: GOLD_LIGHT,
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 36,
          opacity: priceOpacity,
          background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
          borderRadius: 20,
          padding: "20px 56px",
          boxShadow: "0 12px 30px rgba(201,151,46,0.35)",
          transform: `scale(${clamp01(cardScale)})`,
        }}
      >
        <span
          style={{
            fontFamily,
            ...weight(900),
            fontSize: 50,
            color: BLACK,
          }}
        >
          130,000 دينار
        </span>
      </div>

      <div
        style={{
          marginTop: 40,
          opacity: priceOpacity,
          display: "flex",
          alignItems: "center",
          gap: 18,
          transform: `scale(${phonePulse})`,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: GOLD_LIGHT,
            boxShadow: `0 0 16px ${GOLD}`,
          }}
        />
        <span
          style={{
            fontFamily,
            ...weight(800),
            fontSize: 54,
            color: WHITE,
            direction: "ltr",
            ...textPop,
          }}
        >
          0795627631
        </span>
      </div>
      <div
        style={{
          marginTop: 10,
          opacity: priceOpacity,
          fontFamily,
          ...weight(700),
          fontSize: 30,
          color: WHITE,
          textAlign: "center",
        }}
      >
        للتواصل والاستفسار
      </div>
    </AbsoluteFill>
  );
};

// ---------- Progress dots ----------

const ProgressDots: React.FC<{
  frame: number;
  segments: { start: number; end: number }[];
}> = ({ frame, segments }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 60,
        right: 60,
        display: "flex",
        gap: 10,
      }}
    >
      {segments.map((seg, i) => {
        const progress = clamp01(
          interpolate(frame, [seg.start, seg.end], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        );
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              background: "rgba(255,255,255,0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                background: GOLD_LIGHT,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

// ---------- Slide (one photo + caption) ----------

const Slide: React.FC<{
  slide: {
    src: string;
    direction: "in" | "out";
    panX: number;
    objectPosition?: string;
    lines: string[];
  };
  duration: number;
}> = ({ slide, duration }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <KenBurns
        src={slide.src}
        duration={duration}
        direction={slide.direction}
        panX={slide.panX}
        objectPosition={slide.objectPosition}
      />
      <TopGradient />
      <BottomGradient />
      <Caption frame={frame} duration={duration} lines={slide.lines} />
    </AbsoluteFill>
  );
};

// ---------- Main ----------

const INTRO_DUR = 75;
const SLIDE_DUR = 140;
const OUTRO_DUR = 900 - 75 - 140 * 5;

const slides: {
  src: string;
  direction: "in" | "out";
  panX: number;
  objectPosition?: string;
  lines: string[];
}[] = [
  {
    src: staticFile("images/photo1.jpg"),
    direction: "in",
    panX: 1,
    lines: ["حوض مرج الفرس", "شفا بدران"],
  },
  {
    src: staticFile("images/photo2.jpg"),
    direction: "out",
    panX: -1,
    lines: ["المساحة", "775 م²"],
  },
  {
    src: staticFile("images/photo3.jpg"),
    direction: "in",
    panX: -1,
    lines: ["التنظيم", "سكن ب"],
  },
  {
    src: staticFile("images/photo4.jpg"),
    direction: "out",
    panX: 1,
    lines: ["الواجهة", "على شارع 12 متر"],
  },
  {
    src: staticFile("images/map.webp"),
    direction: "in",
    panX: 0,
    objectPosition: "center",
    lines: ["تفاصيل القطعة", "حسب المخطط"],
  },
];

export const LandAd: React.FC = () => {
  useCairoFont();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;

  const outroStart = INTRO_DUR + SLIDE_DUR * 5;
  const topBarOpacity = interpolate(
    frame,
    [INTRO_DUR, INTRO_DUR + 25, outroStart - 20, outroStart],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const segments = slides.map((_, i) => ({
    start: INTRO_DUR + i * SLIDE_DUR,
    end: INTRO_DUR + (i + 1) * SLIDE_DUR,
  }));

  return (
    <AbsoluteFill style={{ background: BLACK }}>
      <Sequence from={0} durationInFrames={INTRO_DUR}>
        <Intro duration={INTRO_DUR} />
      </Sequence>

      {slides.map((slide, i) => (
        <Sequence
          key={i}
          from={INTRO_DUR + i * SLIDE_DUR}
          durationInFrames={SLIDE_DUR}
        >
          <Slide slide={slide} duration={SLIDE_DUR} />
        </Sequence>
      ))}

      <Sequence from={INTRO_DUR + SLIDE_DUR * 5} durationInFrames={OUTRO_DUR}>
        <Outro duration={OUTRO_DUR} />
      </Sequence>

      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <TopBar visible={topBarOpacity} />
        {frame >= INTRO_DUR && frame < INTRO_DUR + SLIDE_DUR * 5 && (
          <ProgressDots frame={frame} segments={segments} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
