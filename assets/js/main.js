(() => {
  const root = document.documentElement;

  // intro animations
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('loaded')));

  // nav: background on scroll, hide on scroll down
  const nav = document.querySelector('.nav');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hide', y > 400 && y > lastY && !root.classList.contains('menu-open'));
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile menu
  const burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = root.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', () => {
      root.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  // reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // lazy videos: play only when visible
  const vids = document.querySelectorAll('video[data-src]');
  const vio = new IntersectionObserver(entries => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (!v.src) { v.src = v.dataset.src; }
        v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    });
  }, { threshold: 0.25 });
  vids.forEach(v => vio.observe(v));

  // sound toggles (only one video with sound at a time)
  const soundBtns = document.querySelectorAll('.sound-btn');
  soundBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const v = btn.parentElement.querySelector('video');
      const turnOn = v.muted;
      document.querySelectorAll('.media video').forEach(o => { o.muted = true; });
      soundBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
      if (turnOn) {
        v.muted = false;
        v.play().catch(() => {});
        btn.setAttribute('aria-pressed', 'true');
      }
    });
  });

  // count-up numbers
  const nums = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver(entries => {
    entries.forEach(({ target: el, isIntersecting }) => {
      if (!isIntersecting) return;
      cio.unobserve(el);
      const end = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      const t0 = performance.now(), dur = 1600;
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = (end * eased).toFixed(dec).replace('.', ',');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  nums.forEach(n => cio.observe(n));

  // lightbox for images
  const zoomables = document.querySelectorAll('.zoomable');
  if (zoomables.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<img alt="">';
    document.body.appendChild(lb);
    const lbImg = lb.querySelector('img');
    zoomables.forEach(z => z.addEventListener('click', () => {
      const img = z.querySelector('img');
      lbImg.src = img.src; lbImg.alt = img.alt;
      lb.classList.add('open');
    }));
    const close = () => lb.classList.remove('open');
    lb.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // current year
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
