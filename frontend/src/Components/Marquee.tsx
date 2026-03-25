import React, { useCallback, useEffect, useRef, useState } from 'react';

const FPS = 20;
const STEP = 1;
const TIMEOUT = (1 / FPS) * 1000;

interface MarqueeProps {
  text?: string;
  title?: string;
  hoverToStop?: boolean;
  loop?: boolean;
  className?: string;
}

function Marquee({
  text = '',
  title = '',
  hoverToStop = true,
  loop = false,
  className,
}: Readonly<MarqueeProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animStateRef = useRef({ offset: 0, direction: 0 });
  const hasAutoStartedRef = useRef(false);
  const [displayOffset, setDisplayOffset] = useState(0);

  const getOverflow = () => {
    if (!containerRef.current || !textRef.current) return 0;
    return textRef.current.offsetWidth - containerRef.current.offsetWidth;
  };

  const stopAnimation = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    stopAnimation();

    const tick = () => {
      const overflow = getOverflow();
      if (overflow <= 0) return;

      const anim = animStateRef.current;
      let { offset, direction } = anim;

      offset += direction === 0 ? STEP : -STEP;

      if (offset >= overflow) {
        direction = 1;
        offset = overflow;
      } else if (offset <= 0) {
        if (loop) {
          direction = 0;
          offset = 0;
        } else {
          timerRef.current = null;
          animStateRef.current = { offset: 0, direction: 0 };
          setDisplayOffset(0);
          return;
        }
      }

      animStateRef.current = { offset, direction };
      setDisplayOffset(offset);
      timerRef.current = setTimeout(tick, TIMEOUT);
    };

    timerRef.current = setTimeout(tick, 0);
  }, [loop, stopAnimation]);

  // Cleanup on unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => stopAnimation, []);

  // Reset when text changes
  useEffect(() => {
    stopAnimation();
    hasAutoStartedRef.current = false;
    animStateRef.current = { offset: 0, direction: 0 };
    setDisplayOffset(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Auto-start after every render once the container has a measurable overflow.
  // Needed because on initial mount the container has no width yet (parent hasn't
  // finished measuring), so we can't start in a mount-only effect.
  useEffect(() => {
    if (hoverToStop && !hasAutoStartedRef.current && getOverflow() > 0) {
      hasAutoStartedRef.current = true;
      startAnimation();
    }
  });

  const handleMouseEnter = () => {
    if (hoverToStop) {
      stopAnimation();
    } else if (getOverflow() > 0) {
      startAnimation();
    }
  };

  const handleMouseLeave = () => {
    if (hoverToStop && getOverflow() > 0) {
      startAnimation();
    } else {
      stopAnimation();
      animStateRef.current = { offset: 0, direction: 0 };
      setDisplayOffset(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      if (timerRef.current !== null) {
        stopAnimation();
      } else if (getOverflow() > 0) {
        startAnimation();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={className ? `ui-marquee ${className}` : 'ui-marquee'}
      style={{ overflow: 'hidden' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      <span
        ref={textRef}
        style={{
          position: 'relative',
          right: displayOffset,
          whiteSpace: 'nowrap',
        }}
        title={
          title && text !== title
            ? `translate('OriginalTitle'): ${title}`
            : text
        }
      >
        {text}
      </span>
    </div>
  );
}

export default Marquee;
