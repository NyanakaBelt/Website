/* ============================================================
   MECHATROLIX — main.js
   ============================================================ */

/* ---- Navbar scroll shadow ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 40);
});

/* ---- Hamburger toggle ---- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    navLinks?.classList.remove('open');
  });
});

/* ---- Active nav link (per page) ---- */
(function markActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === page) link.classList.add('active');
  });
})();

/* ---- Scroll-reveal (fade-up) ---- */
const fadeEls = document.querySelectorAll('.fade-up');
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => obs.observe(el));
} else {
  fadeEls.forEach(el => el.classList.add('visible'));
}

/* ---- Smooth scroll for same-page anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   HERO CANVAS — Circuit Board Animation
   ============================================================ */
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, nodes, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initNodes();
    initParticles();
  }

  function initNodes() {
    nodes = [];
    const count = Math.max(40, Math.floor((W * H) / 20000));
    for (let i = 0; i < count; i++) {
      nodes.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        vx:    (Math.random() - 0.5) * 0.22,
        vy:    (Math.random() - 0.5) * 0.22,
        r:     Math.random() * 1.8 + 0.8,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < 55; i++) {
      spawnParticle(true);
    }
  }

  function spawnParticle(init) {
    particles.push({
      x:     Math.random() * W,
      y:     init ? Math.random() * H : H + 8,
      r:     Math.random() * 1.8 + 0.4,
      vx:    (Math.random() - 0.5) * 0.45,
      vy:    -(Math.random() * 0.7 + 0.2),
      life:  Math.random(),
      decay: Math.random() * 0.003 + 0.002,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* --- circuit connections --- */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          const alpha = (1 - d / 120) * 0.18;
          ctx.beginPath();
          /* right-angle trace style */
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(212,160,23,${alpha})`;
          ctx.lineWidth   = 0.65;
          ctx.stroke();
        }
      }
    }

    /* --- nodes --- */
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy; n.phase += 0.018;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      const glow = Math.sin(n.phase) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + glow * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,160,23,${0.35 + glow * 0.45})`;
      ctx.fill();
    });

    /* --- gold particles --- */
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x    += p.vx;
      p.y    += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        spawnParticle(false);
        continue;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,160,23,${p.life * 0.65})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
}

/* ============================================================
   PROJECT FILTER
   ============================================================ */
const filterBtns  = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card[data-industry]');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    projectCards.forEach(card => {
      card.style.display = (f === 'all' || card.dataset.industry === f) ? '' : 'none';
    });
  });
});

/* ============================================================
   PROJECT MODAL
   ============================================================ */
const modalOverlay = document.getElementById('modalOverlay');

document.querySelectorAll('.project-card[data-modal]').forEach(card => {
  card.addEventListener('click', () => {
    const tpl = document.getElementById(card.dataset.modal);
    if (!tpl || !modalOverlay) return;
    modalOverlay.innerHTML = '';
    const clone = tpl.content ? tpl.content.cloneNode(true) : tpl.cloneNode(true);
    modalOverlay.appendChild(clone);
    modalOverlay.classList.add('open');
    modalOverlay.querySelector('.modal-close')?.addEventListener('click', closeModal);
  });
});

modalOverlay?.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

function closeModal() {
  modalOverlay?.classList.remove('open');
}

/* ============================================================
   ABOUT SLIDESHOW
   ============================================================ */
(function initAboutSlideshow() {
  const el = document.getElementById('aboutSlideshow');
  if (!el) return;

  const slides  = el.querySelectorAll('.slide');
  const dots    = el.querySelectorAll('.ss-dot');
  const prevBtn = el.querySelector('.ss-prev');
  const nextBtn = el.querySelector('.ss-next');
  const total   = slides.length;
  let current   = 0;
  let timer     = null;
  const INTERVAL = 5000;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + total) % total;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function start() { timer = setInterval(() => goTo(current + 1), INTERVAL); }
  function stop()  { clearInterval(timer); }
  function reset() { stop(); start(); }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); reset(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); reset(); });
  dots.forEach(dot => dot.addEventListener('click', () => { goTo(+dot.dataset.index); reset(); }));

  /* pause on hover / touch */
  el.addEventListener('mouseenter', stop);
  el.addEventListener('mouseleave', start);
  el.addEventListener('touchstart', stop,  { passive: true });
  el.addEventListener('touchend',   start, { passive: true });

  /* swipe support */
  let touchX = 0;
  el.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend',   e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); reset(); }
  }, { passive: true });

  start();
})();

/* ============================================================
   CONTACT FORM + EMAILABLE EMAIL VERIFICATION
   emailState: 'idle' | 'verifying' | 'accepted' | 'rejected' | 'error'
   ============================================================ */
(function () {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const emailInput = document.getElementById('femail');
  let emailState = 'idle';

  /* Clear error styling on re-type */
  contactForm.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('input-error'));
  });

  /* ── Hunter.io email verification ── */
  if (emailInput) {
    const HUNTER_KEY = '63527896cb164ec44633cb9ad506e8f591ac74be';

    /* Reset state whenever the user edits the email */
    emailInput.addEventListener('input', () => {
      emailInput.classList.remove('vf-verified', 'vf-checking');
      emailState = 'idle';
    });

    /* Verify when the user leaves the field */
    emailInput.addEventListener('blur', async () => {
      const val = emailInput.value.trim();
      if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return;
      if (emailState !== 'idle') return;

      emailState = 'verifying';
      emailInput.classList.add('vf-checking');
      emailInput.classList.remove('vf-verified', 'input-error');

      try {
        const res  = await fetch(
          `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(val)}&api_key=${HUNTER_KEY}`
        );
        const json = await res.json();
        emailInput.classList.remove('vf-checking');

        if (json.errors) throw new Error('api-error');

        const result = json.data && json.data.result;
        if (result === 'undeliverable') {
          emailState = 'rejected';
          emailInput.classList.add('input-error');
        } else if (result === 'deliverable') {
          emailState = 'accepted';
          emailInput.classList.add('vf-verified');
        } else {
          emailState = 'accepted'; /* risky / accept_all / unknown — pass through */
        }
      } catch {
        emailInput.classList.remove('vf-checking');
        emailState = 'error'; /* fail open on network / API errors */
      }
    });
  }

  /* ── Form submit ── */
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn       = contactForm.querySelector('[type="submit"]');
    const successEl = document.getElementById('formSuccess');

    /* Required fields + email format */
    let valid = true;
    contactForm.querySelectorAll('[required]').forEach(field => {
      field.classList.remove('input-error');
      if (!field.value.trim()) {
        field.classList.add('input-error');
        valid = false;
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
        field.classList.add('input-error');
        valid = false;
      }
    });
    if (!valid) return;

    /* Emailable state gate */
    if (emailInput) {
      if (emailState === 'rejected') {
        emailInput.classList.add('input-error');
        return;
      }
      if (emailState === 'idle' || emailState === 'verifying') {
        /* Still waiting for verification — show amber and block */
        emailInput.classList.add('vf-checking');
        return;
      }
      /* 'accepted' and 'error' (fail-open) fall through */
    }

    btn.textContent = 'Sending…';
    btn.disabled    = true;

    try {
      const res = await fetch('https://formsubmit.co/ajax/info@mechatrolix.co.za', {
        method:  'POST',
        body:    new FormData(contactForm),
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        contactForm.reset();
        emailState = 'idle';
        if (successEl) successEl.style.display = 'block';
      } else {
        throw new Error('server error');
      }
    } catch {
      contactForm.submit(); /* fallback to standard POST */
    } finally {
      btn.textContent = 'Send Message';
      btn.disabled    = false;
    }
  });
})();
