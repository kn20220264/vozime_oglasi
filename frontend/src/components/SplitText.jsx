import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SplitText = ({
  text = '',
  className = '',
  delay = 50,
  duration = 0.8,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete,
}) => {
  const ref = useRef(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (document.fonts?.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts?.ready.then(() => setFontsLoaded(true)) ?? setFontsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!ref.current || !text || !fontsLoaded) return;

    const el = ref.current;
    const chars = el.querySelectorAll('.split-char');
    if (!chars.length) return;

    const startPct = (1 - threshold) * 100;
    const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
    const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
    const marginUnit  = marginMatch ? (marginMatch[2] || 'px') : 'px';
    const sign = marginValue === 0 ? '' : marginValue < 0
      ? `-=${Math.abs(marginValue)}${marginUnit}`
      : `+=${marginValue}${marginUnit}`;
    const start = `top ${startPct}%${sign}`;

    const tween = gsap.fromTo(
      chars,
      { ...from },
      {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
        onComplete: () => onLetterAnimationComplete?.(),
        willChange: 'transform, opacity',
        force3D: true,
      }
    );

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach(st => { if (st.trigger === el) st.kill(); });
    };
  }, [text, delay, duration, ease, threshold, rootMargin, fontsLoaded]);

  // Manuelni split u spanove
  const words = text.split(' ');
  const Tag = tag || 'p';

  return (
    <Tag
      ref={ref}
      className={`split-parent ${className}`}
      style={{ textAlign, display: 'inline-block', whiteSpace: 'normal', wordWrap: 'break-word' }}
    >
      {words.map((word, wi) => (
        <span key={wi} style={{ display: 'inline-block', whiteSpace: 'nowrap', marginRight: '0.25em' }}>
          {word.split('').map((char, ci) => (
            <span key={ci} className="split-char" style={{ display: 'inline-block' }}>
              {char}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
};

export default SplitText;