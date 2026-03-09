// components/AnimatedNumber.jsxx
import React, { useEffect, useMemo, useRef, useState } from "react";

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function AnimatedNumber({
  value,
  duration = 900,
  decimals = 0,
  prefix = "",
  suffix = "",
  startOnView = true,
}) {
  const ref = useRef(null);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const [display, setDisplay] = useState(0);

  const target = useMemo(() => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }, [value]);

  useEffect(() => {
    if (!startOnView) return;
    if (!ref.current) return;

    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setHasStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!hasStarted) return;

    let raf = 0;
    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      const v = from + (target - from) * eased;
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasStarted, target, duration]);

  const formatted = useMemo(() => {
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(display * factor) / factor;
    return `${prefix}${rounded.toFixed(decimals)}${suffix}`;
  }, [display, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={hasStarted ? "numRoll on" : "numRoll"}>
      {formatted}
    </span>
  );
}
