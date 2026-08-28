const MEMORIES = [
  {
    id: "pool",
    src: "photo-pool.jpg",
    caption: "Pool day",
    alt: "The family together in the swimming pool",
    kicker: "All together",
    title: "Making a splash",
    wish: "Happy name day Mummy. Love you — days like this in the pool with everyone are honestly my favourite.",
    wishLv: "Daudz laimes vārda dienā, Mummy. Mīlu tevi — šādas dienas baseinā ar visiem ir manas mīļākās.",
    memory:
      "I love this one so much. All of us in the water, laughing, and you right there in the middle of it with us. Not on the side. With us. That always meant a lot.",
  },
  {
    id: "cable",
    src: "photo-cable.jpg",
    caption: "Up high",
    alt: "The family in a cable car above the sea",
    kicker: "Adventure day",
    title: "Above the waves",
    wish: "Happy name day Mama. Hope you get more days like this — a bit of an adventure and all of us being silly next to you.",
    wishLv: "Daudz laimes vārda dienā, Mama. Lai tev vēl ir tādas dienas — mazliet piedzīvojumu un mēs visi blakus, smieklīgi kā vienmēr.",
    memory:
      "Remember when we were all squished in that cable car over the sea? Alice stuck her tongue out and you did the peace sign. Every time I see this I smile.",
  },
  {
    id: "dinner",
    src: "photo-dinner.jpg",
    caption: "Dinner",
    alt: "Family dinner at home with birthday decorations",
    kicker: "Around the table",
    title: "Home-cooked love",
    wish: "Happy name day Mummy. Hope your day feels as warm as our dinners at home.",
    wishLv: "Daudz laimes vārda dienā, Mummy. Lai tava diena ir tikpat silta kā mūsu vakariņas mājās.",
    memory:
      "I love when we all sit round the table like this. Food everywhere, people talking over each other, and you right there with us. It just feels like home.",
  },
  {
    id: "flowers",
    src: "photo-flowers.jpg",
    caption: "Flower crowns",
    alt: "Flower crowns on a sunny day outdoors",
    kicker: "Summer blooms",
    title: "Crowned in flowers",
    wish: "You looked so pretty in that flower crown Mummy. Happy name day.",
    wishLv: "Tu izskaties tik skaisti tajā ziedu vainagā, Mummy. Daudz laimes vārda dienā.",
    memory:
      "You and Alice with the flower crowns on a sunny day. Purple flowers in your hair, her little yellow coat… I keep coming back to this photo. It’s just soft and happy.",
  },
  {
    id: "boat",
    src: "photo-boat.jpg",
    caption: "Boat ride",
    alt: "The family on a boat on a park lake",
    kicker: "Out on the water",
    title: "Drifting together",
    wish: "More sunny days out on the water with you please. Happy name day Mummy.",
    wishLv: "Vēl tādas saulainas dienas uz ūdens ar tevi, lūdzu. Daudz laimes vārda dienā, Mummy.",
    memory:
      "That boat day was so fun. Sunglasses on, sun everywhere, all of us piled into one little boat. Proper family chaos and I loved every second of it.",
  },
  {
    id: "sunset",
    src: "photo-sunset.jpg",
    caption: "Sunset",
    alt: "The family hugging on the beach at sunset",
    kicker: "Golden hour",
    title: "Held by the light",
    wish: "Happy name day Aiga. Love you more than I usually say out loud. Forever my Mummy.",
    wishLv: "Daudz laimes vārda dienā, Aiga. Mīlu tevi vairāk, nekā parasti pasaku skaļi. Forever my Mummy.",
    memory:
      "This sunset one always gets me. All of us on the beach, Alice hugging you, the sky going all orange and pink. One of those evenings you don’t want to end.",
  },
];

const stage = document.getElementById("stage");
const dropZone = document.getElementById("drop-zone");
const flash = document.getElementById("flash");
const modal = document.getElementById("modal");
const hint = document.getElementById("hint");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cards = [];
let dragging = null;
let snapping = false;
let lastTime = performance.now();

function framePadding() {
  const compact = window.innerWidth < 720;
  return {
    x: compact ? 16 : 20,
    top: compact ? 8 : 10,
    bottom: compact ? 30 : 36,
  };
}

function fitImageSize(naturalW, naturalH) {
  const compact = window.innerWidth < 720;
  const maxEdge = compact ? 148 : 210;
  const ratio = naturalW / naturalH || 1;
  let imgW;
  let imgH;

  if (ratio >= 1) {
    imgW = maxEdge;
    imgH = maxEdge / ratio;
  } else {
    imgH = maxEdge;
    imgW = maxEdge * ratio;
  }

  return { imgW, imgH };
}

function measureCard(card) {
  const pad = framePadding();
  const { imgW, imgH } = fitImageSize(card.naturalW, card.naturalH);
  return {
    w: imgW + pad.x,
    h: imgH + pad.top + pad.bottom,
    imgW,
    imgH,
  };
}

function applyCardMetrics(card) {
  const size = measureCard(card);
  const pad = framePadding();
  card.w = size.w;
  card.h = size.h;
  card.el.style.width = `${size.w}px`;
  card.el.style.height = `${size.h}px`;
  card.el.style.padding = `${pad.top}px ${pad.x / 2}px ${pad.bottom}px`;
  const img = card.el.querySelector("img");
  img.style.width = `${size.imgW}px`;
  img.style.height = `${size.imgH}px`;
  return size;
}

function dropRect() {
  return dropZone.getBoundingClientRect();
}

function spawnPetals() {
  const wrap = document.getElementById("petals");
  for (let i = 0; i < 14; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--dur", `${14 + Math.random() * 12}s`);
    petal.style.setProperty("--delay", `${-Math.random() * 18}s`);
    petal.style.setProperty("--drift", `${-50 + Math.random() * 100}px`);
    petal.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
    wrap.appendChild(petal);
  }
}

function placeAwayFromCenter(size, index, total) {
  const pad = 24;
  const zone = dropRect();
  const cx = zone.left + zone.width / 2;
  const cy = zone.top + zone.height / 2;
  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.34;
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  let x = cx + Math.cos(angle) * radius - size.w / 2;
  let y = cy + Math.sin(angle) * radius - size.h / 2;
  x = Math.max(pad, Math.min(window.innerWidth - size.w - pad, x));
  y = Math.max(pad + 120, Math.min(window.innerHeight - size.h - 70, y));
  return { x, y };
}

function assetUrl(fileName) {
  return new URL(fileName, window.location.href).href;
}

function loadImage(src) {
  const candidates = [src];
  if (!src.includes("/")) {
    candidates.push(`photos/${src}`);
  }
  return new Promise((resolve, reject) => {
    let index = 0;
    const tryNext = () => {
      if (index >= candidates.length) {
        reject(new Error(`Failed to load ${src}`));
        return;
      }
      const candidate = candidates[index];
      index += 1;
      const img = new Image();
      img.onload = () => resolve({ img, src: candidate });
      img.onerror = tryNext;
      img.src = assetUrl(candidate);
    };
    tryNext();
  });
}

async function createCard(data, index) {
  const loaded = await loadImage(data.src);
  data.src = loaded.src;
  const el = document.createElement("article");
  el.className = "polaroid";
  el.dataset.id = data.id;
  el.innerHTML = `<img src="${loaded.src}" alt="${data.alt}" draggable="false" /><span class="caption">${data.caption}</span>`;
  stage.appendChild(el);

  const speed = reducedMotion ? 0 : 14 + Math.random() * 12;
  const heading = Math.random() * Math.PI * 2;

  const card = {
    data,
    el,
    naturalW: loaded.img.naturalWidth || 1024,
    naturalH: loaded.img.naturalHeight || 768,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    vx: Math.cos(heading) * speed,
    vy: Math.sin(heading) * speed,
    rot: -10 + Math.random() * 20,
    rotV: reducedMotion ? 0 : -6 + Math.random() * 12,
    dragging: false,
    viewed: false,
    pointerId: null,
    grabX: 0,
    grabY: 0,
    moved: false,
  };

  const size = applyCardMetrics(card);
  const start = placeAwayFromCenter(size, index, MEMORIES.length);
  card.x = start.x;
  card.y = start.y;

  el.addEventListener("pointerdown", (event) => onPointerDown(card, event));
  cards.push(card);
  renderCard(card);
  requestAnimationFrame(() => el.classList.add("visible"));
}

function renderCard(card) {
  card.el.style.transform = `translate3d(${card.x}px, ${card.y}px, 0) rotate(${card.rot}deg)`;
}

function onPointerDown(card, event) {
  if (snapping || !modal.hidden) return;
  if (event.button != null && event.button !== 0) return;
  event.preventDefault();
  dragging = card;
  card.dragging = true;
  card.moved = false;
  card.pointerId = event.pointerId;
  card.el.classList.add("dragging");
  try {
    card.el.setPointerCapture(event.pointerId);
  } catch (_) {
    /* older browsers */
  }
  // Keep logical top-left coords — do not jump to the rotated bounding box.
  card.grabX = event.clientX - card.x;
  card.grabY = event.clientY - card.y;
}

function onPointerMove(event) {
  if (!dragging || dragging.pointerId !== event.pointerId) return;
  event.preventDefault();
  const nextX = event.clientX - dragging.grabX;
  const nextY = event.clientY - dragging.grabY;
  if (Math.hypot(nextX - dragging.x, nextY - dragging.y) > 4) {
    dragging.moved = true;
  }
  dragging.x = Math.max(-40, Math.min(window.innerWidth - dragging.w + 40, nextX));
  dragging.y = Math.max(-40, Math.min(window.innerHeight - dragging.h + 40, nextY));
  dropZone.classList.toggle("armed", isOverDropZone(dragging));
  renderCard(dragging);
}

function onPointerUp(event) {
  if (!dragging || dragging.pointerId !== event.pointerId) return;
  const card = dragging;
  const dropped = isOverDropZone(card);
  card.dragging = false;
  card.pointerId = null;
  card.el.classList.remove("dragging");
  dropZone.classList.remove("armed");
  dragging = null;
  if (dropped || !card.moved) {
    // Drop on camera, or simple tap/click opens the memory (helps on phones).
    snapToCamera(card);
  }
}

function cardCenter(card) {
  const rect = card.el.getBoundingClientRect();
  return {
    cx: rect.left + rect.width / 2,
    cy: rect.top + rect.height / 2,
  };
}

function isOverDropZone(card) {
  const { cx, cy } = cardCenter(card);
  const zone = dropRect();
  const zx = zone.left + zone.width / 2;
  const zy = zone.top + zone.height / 2;
  const dx = cx - zx;
  const dy = cy - zy;
  const hit = zone.width * 0.62;
  return dx * dx + dy * dy <= hit * hit;
}

function snapToCamera(card) {
  snapping = true;
  card.el.classList.add("snapped");
  dropZone.classList.add("snapping");
  const zone = dropRect();
  const targetX = zone.left + zone.width / 2 - card.w / 2;
  const targetY = zone.top + zone.height / 2 - card.h / 2;
  const startX = card.x;
  const startY = card.y;
  const startRot = card.rot;
  const duration = reducedMotion ? 80 : 420;
  const started = performance.now();

  function step(now) {
    const t = Math.min(1, (now - started) / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    card.x = startX + (targetX - startX) * ease;
    card.y = startY + (targetY - startY) * ease;
    card.rot = startRot + (0 - startRot) * ease;
    renderCard(card);
    if (t < 1) {
      requestAnimationFrame(step);
      return;
    }
    flash.classList.remove("pop");
    void flash.offsetWidth;
    flash.classList.add("pop");
    window.setTimeout(() => {
      openLetter(card);
      dropZone.classList.remove("snapping");
    }, reducedMotion ? 60 : 280);
  }

  requestAnimationFrame(step);
}

function openLetter(card) {
  const { data } = card;
  document.getElementById("letter-image").src = data.src;
  document.getElementById("letter-image").alt = data.alt;
  document.getElementById("letter-kicker").textContent = data.kicker;
  document.getElementById("letter-title").textContent = data.title;
  document.getElementById("letter-wish").textContent = data.wish;
  document.getElementById("letter-wish-lv").textContent = data.wishLv;
  document.getElementById("letter-memory").textContent = data.memory;
  modal.hidden = false;
  hint.innerHTML =
    'Each photo holds a little wish<span class="hint-lv">Katrs foto slēpj mazu vēlējumu</span>';
  card.viewed = true;
  card.el.classList.add("viewed");
}

function closeLetter() {
  modal.hidden = true;
  const snapped = cards.find((card) => card.el.classList.contains("snapped"));
  if (snapped) {
    snapped.el.classList.remove("snapped");
    const size = measureCard(snapped);
    const start = placeAwayFromCenter(size, cards.indexOf(snapped), cards.length);
    snapped.x = start.x;
    snapped.y = start.y;
    snapped.rot = -8 + Math.random() * 16;
    const heading = Math.random() * Math.PI * 2;
    const speed = 20;
    snapped.vx = Math.cos(heading) * speed;
    snapped.vy = Math.sin(heading) * speed;
    renderCard(snapped);
  }
  snapping = false;
  if (cards.every((card) => card.viewed)) {
    hint.innerHTML =
      'Happy name day Mummy<span class="hint-lv">Daudz laimes vārda dienā, Mummy</span>';
  }
}

function steerFromCenter(card, dt) {
  const zone = dropRect();
  const cx = card.x + card.w / 2;
  const cy = card.y + card.h / 2;
  const zx = zone.left + zone.width / 2;
  const zy = zone.top + zone.height / 2;
  const dx = cx - zx;
  const dy = cy - zy;
  const dist = Math.hypot(dx, dy) || 1;
  const keepOut = zone.width * 0.72 + Math.max(card.w, card.h) * 0.28;
  if (dist < keepOut) {
    const push = (keepOut - dist) * 4.5;
    card.vx += (dx / dist) * push * dt;
    card.vy += (dy / dist) * push * dt;
  }
}

function tick(now) {
  const dt = Math.min(0.032, (now - lastTime) / 1000);
  lastTime = now;
  const pad = 16;

  for (const card of cards) {
    if (card.dragging || card.el.classList.contains("snapped")) {
      continue;
    }
    if (!reducedMotion) {
      card.x += card.vx * dt;
      card.y += card.vy * dt;
      card.rot += card.rotV * dt;
      steerFromCenter(card, dt);

      const maxX = window.innerWidth - card.w - pad;
      const maxY = window.innerHeight - card.h - pad;

      if (card.x < pad) {
        card.x = pad;
        card.vx = Math.abs(card.vx);
      } else if (card.x > maxX) {
        card.x = maxX;
        card.vx = -Math.abs(card.vx);
      }
      if (card.y < pad + 110) {
        card.y = pad + 110;
        card.vy = Math.abs(card.vy);
      } else if (card.y > maxY - 28) {
        card.y = maxY - 28;
        card.vy = -Math.abs(card.vy);
      }

      const speed = Math.hypot(card.vx, card.vy);
      const target = 16;
      if (speed > 0.1) {
        card.vx = (card.vx / speed) * target;
        card.vy = (card.vy / speed) * target;
      }
      card.rot = Math.max(-14, Math.min(14, card.rot));
    }
    renderCard(card);
  }

  requestAnimationFrame(tick);
}

window.addEventListener("pointermove", onPointerMove, { passive: false });
window.addEventListener("pointerup", onPointerUp);
window.addEventListener("pointercancel", onPointerUp);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeLetter();
});
modal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close]")) closeLetter();
});
window.addEventListener("resize", () => {
  for (const card of cards) {
    applyCardMetrics(card);
    card.x = Math.max(12, Math.min(window.innerWidth - card.w - 12, card.x));
    card.y = Math.max(70, Math.min(window.innerHeight - card.h - 40, card.y));
    renderCard(card);
  }
});

spawnPetals();
Promise.allSettled(MEMORIES.map((memory, index) => createCard(memory, index))).then((results) => {
  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length) {
    console.warn("Some memory photos failed to load", failed);
  }
  if (!cards.length) {
    hint.innerHTML =
      'Photos failed to load — try refreshing<span class="hint-lv">Foto neatvērās — mēģini atsvaidzināt</span>';
  }
  requestAnimationFrame(tick);
});
