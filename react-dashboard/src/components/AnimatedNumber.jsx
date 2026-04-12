import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * AnimatedNumber — counts up from 0 to `value` when it enters the viewport.
 * @param {number}  value      - Target number
 * @param {number}  duration   - Animation duration in ms (default 1500)
 * @param {string}  className  - Extra class names
 * @param {string}  suffix     - Optional suffix (e.g., "+", "%")
 * @param {string}  prefix     - Optional prefix (e.g., "₹")
 */
const AnimatedNumber = ({ value = 0, duration = 1500, className = '', suffix = '', prefix = '', margin = '-80px' }) => {
  const ref       = useRef(null);
  const inView    = useInView(ref, { once: true, margin });
  const [display, setDisplay] = useState(0);
  const frameRef  = useRef(null);

  useEffect(() => {
    if (!inView) return;

    const start     = performance.now();
    const startVal  = 0;
    const endVal    = Number(value) || 0;

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + (endVal - startVal) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${value.toLocaleString()}${suffix}`}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
};

export default AnimatedNumber;
