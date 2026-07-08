/* ══════════════════════════════════════════════════════
   Main Application Logic
   ══════════════════════════════════════════════════════ */

import { initScene, switchRoom, getCurrentRoom, disposeScene } from './three-scene.js';

/* ── DOM References ──────────────────────────── */

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const navbar = $('#navbar');
const navToggle = $('.nav-toggle');
const navLinks = $('.nav-links');
const roomBtns = $$('.room-btn');
const roomName = $('#roomName');
const roomDesc = $('#roomDesc');
const schemeCards = $$('.scheme-card');
const statNumbers = $$('.stat-number');

/* ── Three.js Init ────────────────────────────── */

const threeContainer = $('#threeContainer');
if (threeContainer) {
  initScene(threeContainer);
}

/* ── Navbar Scroll Effect ─────────────────────── */

function handleScroll() {
  const scrollY = window.scrollY;
  navbar.classList.toggle('scrolled', scrollY > 80);
}

window.addEventListener('scroll', handleScroll, { passive: true });

/* ── Mobile Nav Toggle ────────────────────────── */

navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

/* ── Close mobile nav on link click ───────────── */

$$('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

/* ── Room Switching (3D) ──────────────────────── */

function updateRoomUI(roomKey) {
  const rooms = {
    living: { name: '客厅', desc: '以浅色橡木地板和艺术涂料墙面营造温润基调，整面落地窗将城市天际线引入室内。' },
    bedroom: { name: '主卧', desc: '微水泥墙面与木质背板结合，内嵌灯带营造悬浮感。步入式衣帽间采用通透玻璃隔断。' },
    kitchen: { name: '厨房', desc: 'U 型布局搭配岩板岛台，隐藏式收纳系统让所有器具有序归位。防眩射灯配合感应灯带。' },
    study: { name: '书房', desc: '整面书墙采用悬浮层板，可调节角度。百叶帘将自然光切割成温柔的光影线条。' },
  };
  const data = rooms[roomKey];
  if (!data) return;

  // Update info card
  roomName.textContent = data.name;
  roomDesc.textContent = data.desc;

  // Update toolbar buttons
  roomBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.room === roomKey);
  });
}

roomBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const roomKey = btn.dataset.room;
    const result = switchRoom(roomKey);
    if (result) {
      updateRoomUI(roomKey);
    }
  });
});

/* ── Scheme card → switch 3D room ─────────────── */

schemeCards.forEach(card => {
  card.addEventListener('click', () => {
    const roomKey = card.dataset.room;
    const result = switchRoom(roomKey);
    if (result) {
      updateRoomUI(roomKey);
      // Scroll to viewer
      $('#viewer').scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ── Intersection Observer: Reveal Animations ─── */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

// Add reveal class to sections and children
$$('.section').forEach(section => {
  section.classList.add('reveal');
  revealObserver.observe(section);
});

// Stat cards get staggered animation
$$('.stat-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 100}ms`;
  card.classList.add('reveal');
  revealObserver.observe(card);
});

// Scheme cards staggered
$$('.scheme-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 80}ms`;
  card.classList.add('reveal');
  revealObserver.observe(card);
});

// Material cards staggered
$$('.material-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 80}ms`;
  card.classList.add('reveal');
  revealObserver.observe(card);
});

/* ── Animated Counters ────────────────────────── */

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  if (isNaN(target)) return;

  let current = 0;
  const duration = 1500;
  const step = Math.max(1, Math.floor(target / 60));
  const increment = target / (duration / 16);

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counterObserver.unobserve(el);

        let value = 0;
        const timer = setInterval(() => {
          value += increment;
          if (value >= target) {
            el.textContent = target + (target >= 100 ? '+' : '');
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(value);
          }
        }, 16);
      }
    });
  }, { threshold: 0.5 });

  counterObserver.observe(el);
}

statNumbers.forEach(animateCounter);

/* ── Keyboard Navigation ──────────────────────── */

document.addEventListener('keydown', (e) => {
  const rooms = ['living', 'bedroom', 'kitchen', 'study'];
  const currentIdx = rooms.indexOf(getCurrentRoom());
  let nextIdx;

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    nextIdx = (currentIdx + 1) % rooms.length;
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    nextIdx = (currentIdx - 1 + rooms.length) % rooms.length;
  } else {
    return;
  }

  e.preventDefault();
  const nextRoom = rooms[nextIdx];
  const result = switchRoom(nextRoom);
  if (result) {
    updateRoomUI(nextRoom);
  }
});

/* ── Cleanup on page unload ───────────────────── */

window.addEventListener('beforeunload', () => {
  disposeScene();
});

console.log('🏠 璞舍 · 交互展示站已加载');
*** End of File
