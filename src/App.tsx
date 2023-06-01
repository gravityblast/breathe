import { useEffect, useState } from "react";
import "./App.css";

enum Breathe {
  In,
  Out,
}

type RGB = { r: number; g: number; b: number; a: number };

function lighten(color: RGB, amount: number): RGB {
  return {
    r: Math.min(255, color.r + amount),
    g: Math.min(255, color.g + amount),
    b: Math.min(255, color.b + amount),
    a: color.a,
  };
}

function alpha(color: RGB, alpha: number): RGB {
  return { ...color, a: alpha };
}

function toRGB(color: RGB): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
}

function interpolateColor(color1: RGB, color2: RGB, factor: number) {
  let r = Math.round(lerp(color1.r, color2.r, factor));
  let g = Math.round(lerp(color1.g, color2.g, factor));
  let b = Math.round(lerp(color1.b, color2.b, factor));
  let a = Math.round(lerp(color1.a, color2.a, factor));

  return { r: r, g: g, b: b, a: a };
}

const presets = [
  {
    name: "Default",
    track: [
      { time: 3, state: Breathe.In },
      { time: 4, state: Breathe.Out },
    ],
  },
] as const;

function easeInOutCubic(x: number, exponent: number) {
  return 0.4 + 0.6 * (0.5 * (1 - Math.cos(x * Math.PI * exponent)));
}

type State = {
  time: number;
  totalDuration: number;
  point: (typeof presets)[0]["track"][0];
  pointStarted: number;
};

const green: RGB = { r: 8, g: 85, b: 187, a: 1 };
const orange: RGB = lighten(green, 10);

function App() {
  const [state, setState] = useState<undefined | State>(undefined);

  const [preset, _setPreset] = useState(presets[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setState((state) => {
        let totalDuration = 0;
        let point;
        let pointStarted = 0;
        let time = (state?.time ?? 0) + 0.001;

        for (let currentPoint of preset.track) {
          totalDuration += currentPoint.time;

          if (time < totalDuration && !point) {
            point = currentPoint;
            pointStarted = totalDuration - currentPoint.time;
          }
        }

        if (!point) {
          point = preset.track[0];
          pointStarted = 0;
          time = 0;
        }

        return {
          time,
          totalDuration,
          point: point!,
          pointStarted,
        };
      });
    }, 1);

    return () => clearInterval(interval);
  });

  if (!state) {
    return null;
  }

  const scale = (state.time - state.pointStarted) / state.point.time;
  const directionScale = state.point.state === Breathe.In ? scale : 1 - scale;

  const color = interpolateColor(orange, green, directionScale);

  return (
    <div
      style={{
        backgroundColor: toRGB(alpha(lighten(color, 0), 0.5)),
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "calc(min(80vw, 50vh))",
          height: "calc(min(80vw, 50vh))",
        }}
      >
        <div
          style={{
            backgroundColor: toRGB(alpha(color, 0.1)),
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${easeInOutCubic(directionScale, 1.4)})`,
            borderRadius: "100%",
            width: "100%",
            height: "100%",
          }}
        />
        <div
          style={{
            backgroundColor: toRGB(alpha(color, 0.3)),
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${easeInOutCubic(directionScale, 1.3)})`,
            borderRadius: "100%",
            width: "100%",
            height: "100%",
          }}
        />
        <div
          style={{
            backgroundColor: toRGB(alpha(color, 0.5)),
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${easeInOutCubic(directionScale, 1.2)})`,
            borderRadius: "100%",
            width: "100%",
            height: "100%",
          }}
        />
        <div
          style={{
            backgroundColor: toRGB(color),
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${easeInOutCubic(directionScale, 1)})`,
            borderRadius: "100%",
            width: "100%",
            height: "100%",
          }}
        />
        <div
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: 24,
            position: "absolute",
            top: "0",
            left: "0",
            textAlign: "center",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transformOrigin: "center center",
            transform: `scale(${easeInOutCubic(directionScale < 0.3 ? 0.3 : directionScale, 1)})`,
          }}
        >
          {state.point.state === Breathe.In ? "breathe in" : "breathe out"}
        </div>
      </div>
    </div>
  );
}

export default App;
