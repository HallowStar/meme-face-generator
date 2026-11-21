const query = '(prefers-reduced-motion: no-preference)';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

const base = 'https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/';
try {
  await loadScript(base + 'gsap.min.js');
  await loadScript(base + 'ScrollTrigger.min.js');
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add(query, () => {
    const originals = new Map();
    for (const paragraph of document.querySelectorAll('[data-scrub-text]')) {
      const original = paragraph.textContent;
      originals.set(paragraph, original);
      const words = original.trim().split(/\s+/).map((word) => {
        const span = document.createElement('span');
        span.textContent = word;
        return span;
      });
      paragraph.replaceChildren(...words.flatMap((word, index) => index ? [' ', word] : [word]));
      gsap.from(words, {
        opacity: 0.1,
        stagger: 0.08,
        scrollTrigger: { trigger: paragraph, start: 'top 92%', end: 'top 75%', scrub: true },
      });
    }

    gsap.fromTo('#template-stack', { '--stack-space': 0.2 }, {
      '--stack-space': 1,
      scrollTrigger: { trigger: '.template-feature', start: 'top 91%', end: 'center 62%', scrub: true },
    });
    const resize = new ResizeObserver(() => {
      if (!document.body.classList.contains('camera-view')) ScrollTrigger.refresh();
    });
    resize.observe(document.getElementById('studio-grid'));
    return () => {
      resize.disconnect();
      originals.forEach((original, paragraph) => { paragraph.textContent = original; });
    };
  });
} catch {
  // The site remains usable if the animation scripts are unavailable.
}
