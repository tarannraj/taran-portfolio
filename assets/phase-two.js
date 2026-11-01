(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const progress = document.createElement('div');
  progress.className = 'site-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<i></i>';
  body.append(progress);

  let scrollFrame = 0;
  const updateScroll = () => {
    scrollFrame = 0;
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--scroll-progress', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : '0');
  };
  const queueScroll = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  };
  addEventListener('scroll', queueScroll, { passive: true });
  addEventListener('resize', queueScroll, { passive: true });
  updateScroll();

  const hero = document.querySelector('#home.hero');
  if (hero && finePointer && !reduceMotion) {
    const spotlight = document.createElement('div');
    spotlight.className = 'hero__spotlight';
    spotlight.setAttribute('aria-hidden', 'true');
    hero.prepend(spotlight);
    let pointerFrame = 0;
    let point = null;
    hero.addEventListener('pointermove', event => {
      point = event;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!point) return;
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty('--spot-x', `${point.clientX - rect.left}px`);
        hero.style.setProperty('--spot-y', `${point.clientY - rect.top}px`);
      });
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      point = null;
      hero.style.removeProperty('--spot-x');
      hero.style.removeProperty('--spot-y');
    }, { passive: true });
  }

  const reveals = [...document.querySelectorAll('.toolkit__card, .ch')];
  if (reveals.length && !reduceMotion && 'IntersectionObserver' in window) {
    body.classList.add('phase-motion');
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('phase-visible');
      revealObserver.unobserve(entry.target);
    }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach((element, index) => {
      element.style.setProperty('--phase-delay', `${Math.min(index % 4, 3) * 70}ms`);
      revealObserver.observe(element);
    });
  }

  if ('IntersectionObserver' in window) {
    const menuItems = [...document.querySelectorAll('.hdr [data-go], .navm [data-go]')];
    const sections = [...document.querySelectorAll('#home, #works, #about, #toolkit, #contact-footer')];
    const activeObserver = new IntersectionObserver(entries => {
      const active = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;
      menuItems.forEach(item => {
        if (item.dataset.go === active.target.id) item.setAttribute('aria-current', 'location');
        else item.removeAttribute('aria-current');
      });
    }, { threshold: [.15, .35, .6], rootMargin: '-18% 0px -52% 0px' });
    sections.forEach(section => activeObserver.observe(section));
  }
})();
