// Año en el pie
document.getElementById("year").textContent = new Date().getFullYear();

const root = document.documentElement;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined" && typeof window.SplitText !== "undefined";
const topbar = document.querySelector(".topbar");
const menu = document.getElementById("menu");
const BAR_H = 64; // = --topbar-h
const isDesktop = () => window.innerWidth >= 992;

/* =========================================================
   Scroll suave con Lenis (no corre si se pide reducir movimiento)
   ========================================================= */
let lenis = null;
if (!reduced && typeof window.Lenis !== "undefined") {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  if (hasGsap) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}

// Enlaces internos: deslizan hasta la sección y cierran el menú móvil
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    const target = id.length > 1 ? document.querySelector(id) : null;
    if (!target) return;
    if (menu.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(menu).hide();
    if (!lenis) return; // sin Lenis, el navegador hace el scroll suave por CSS
    event.preventDefault();
    const goingUp = target.getBoundingClientRect().top < 0;
    const barVisible = !isDesktop() || goingUp; // en escritorio la barra se esconde al bajar
    const offset = id === "#inicio" ? 0 : barVisible ? -BAR_H : 0;
    lenis.scrollTo(target, { offset, duration: 1.4 });
    history.replaceState(null, "", id);
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
});

/* =========================================================
   Grafo de versiones: sección activa, progreso del lomo y del menú,
   y barra superior que se esconde al bajar
   ========================================================= */
const sections = [...document.querySelectorAll("[data-section]")];
const spineLinks = [...document.querySelectorAll(".spine-nodes a")];
const navLinks = [...document.querySelectorAll("#menu .nav-link")];
let ticking = false;
let lastY = window.scrollY;

function update() {
  ticking = false;
  const y = window.scrollY;
  const probe = y + window.innerHeight * 0.4;
  const atBottom = window.innerHeight + y >= root.scrollHeight - 2;

  let index = 0;
  sections.forEach((section, i) => {
    if (section.offsetTop <= probe) index = i;
  });
  if (atBottom) index = sections.length - 1;

  const current = sections[index];
  const next = sections[index + 1];
  const span = (next ? next.offsetTop : root.scrollHeight) - current.offsetTop;
  const within = atBottom ? 0 : Math.min(Math.max((probe - current.offsetTop) / span, 0), 1);
  const spineProgress = Math.min((index + within) / (sections.length - 1), 1);
  const docProgress = y / Math.max(root.scrollHeight - window.innerHeight, 1);

  root.style.setProperty("--spine-p", spineProgress.toFixed(4));
  root.style.setProperty("--doc-p", docProgress.toFixed(4));

  spineLinks.forEach((link, i) => {
    link.classList.toggle("is-active", i === index);
    link.classList.toggle("is-passed", i < index);
    if (i === index) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });

  sections.forEach((section, i) => section.classList.toggle("is-active", i === index));

  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${current.id}`;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });

  if (!reduced && isDesktop()) {
    const menuOpen = menu.classList.contains("show");
    if (y > window.innerHeight * 0.5 && y > lastY + 4 && !menuOpen) topbar.classList.add("is-hidden");
    else if (y < lastY - 4 || y < 80) topbar.classList.remove("is-hidden");
  }
  else topbar.classList.remove("is-hidden");
  lastY = y;
}

function requestUpdate() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
}

window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("resize", requestUpdate);
window.addEventListener("load", update);
topbar.addEventListener("focusin", () => topbar.classList.remove("is-hidden"));
update();

/* =========================================================
   Movimiento con GSAP: la versión se publica y cada sección
   se "aplica" como un cambio al llegar a ella
   ========================================================= */
function reveal() {
  root.classList.remove("motion");
}

if (reduced || !hasGsap) {
  reveal();
} else {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const ease = "expo.out";
  const once = (trigger, start = "top 85%") => ({ trigger, start, once: true });
  const addFlash = "rgba(95, 214, 143, 0.16)";
  const addDone = "rgba(95, 214, 143, 0)";

  document.fonts.ready.then(() => {
    /* ---- Portada: el nombre se escribe y la versión se sella ----
       Solo si sigue oculta; si el respaldo ya la mostró, no se repite. */
    if (root.classList.contains("motion")) playHeroIntro();
    window.__motionReady = true;
    reveal();
    setupScrollMotion();
    if (document.readyState === "complete") ScrollTrigger.refresh();
    else window.addEventListener("load", () => ScrollTrigger.refresh());
  });

  function playHeroIntro() {
    const heroBits = [".hero-name", ".hero-meta", ".hero-lede", ".hero .diff li", ".hero-actions", ".assets"];
    gsap.set(heroBits, { visibility: "visible" });

    const name = SplitText.create(".hero-name .split", { type: "lines,chars", mask: "lines", linesClass: "split-line", aria: "none" });
    const hero = gsap.timeline({ defaults: { ease } });
    hero
      .from(name.chars, { yPercent: 115, duration: 1.1, stagger: 0.028 })
      .from(".hero-name .tag-live", { scale: 1.8, rotate: -8, autoAlpha: 0, duration: 0.7 }, 0.6)
      .from([".hero-meta", ".hero-lede"], { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.3)
      .from([".hero-actions", ".assets"], { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.25)
      .fromTo(".hero .diff li",
        { clipPath: "inset(0 100% 0 0)", backgroundColor: addFlash },
        { clipPath: "inset(0 0% 0 0)", duration: 0.7, stagger: 0.12 }, 0.55)
      .to(".hero .diff li", { backgroundColor: addDone, duration: 0.8, stagger: 0.12 }, 1.05);
  }

  function setupScrollMotion() {
    /* ---- Títulos grandes: suben desde su línea ---- */
    gsap.utils.toArray(".plate-title, .feature-title, .contact-title").forEach((title) => {
      SplitText.create(title, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 115, duration: 1.1, stagger: 0.08, ease,
          scrollTrigger: once(title.closest(".plate") || title, "top 85%"),
        }),
      });
    });
    gsap.utils.toArray(".plate-meta").forEach((meta) => {
      gsap.from(meta, { y: 10, autoAlpha: 0, duration: 0.8, delay: 0.3, ease, scrollTrigger: once(meta) });
    });

    /* ---- Líneas "+": se añaden con un destello verde ---- */
    gsap.utils.toArray(".release .diff").forEach((list) => {
      const items = list.querySelectorAll("li");
      gsap.timeline({ scrollTrigger: once(list) })
        .fromTo(items,
          { clipPath: "inset(0 100% 0 0)", backgroundColor: addFlash },
          { clipPath: "inset(0 0% 0 0)", duration: 0.7, stagger: 0.1, ease })
        .to(items, { backgroundColor: addDone, duration: 0.8, stagger: 0.1 }, 0.45);
    });

    /* ---- Estudios: la rama se dibuja con el scroll ---- */
    gsap.utils.toArray(".commit").forEach((commit) => {
      gsap.fromTo(commit, { "--draw": 0 }, {
        "--draw": 1, ease: "none",
        scrollTrigger: { trigger: commit, start: "top 65%", end: "bottom 65%", scrub: 0.6 },
      });
      gsap.from(commit.querySelector(".commit-node"), { scale: 0.2, autoAlpha: 0, duration: 0.7, ease, scrollTrigger: once(commit, "top 75%") });
      gsap.from([commit.querySelector(".commit-ver"), commit.querySelector(".commit-body")], {
        x: -18, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease, scrollTrigger: once(commit, "top 75%"),
      });
    });

    /* ---- Información personal: la ficha se llena fila a fila ---- */
    gsap.from(".facts > div", { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease, scrollTrigger: once(".facts") });
    gsap.from("#perfil .prose-lead, #perfil .prose", { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease, scrollTrigger: once("#perfil .release-body") });

    /* ---- Esthetic dental: la página carga de arriba abajo ---- */
    const frame = document.querySelector(".frame");
    if (frame) {
      gsap.from(frame.querySelector(".frame-bar"), { autoAlpha: 0, y: 10, duration: 0.6, ease, scrollTrigger: once(frame, "top 80%") });
      gsap.fromTo(frame.querySelector(".frame-shot"),
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 1.4, ease: "expo.inOut", delay: 0.15, scrollTrigger: once(frame, "top 80%") });
      gsap.fromTo(frame.querySelector("img"), { scale: 1.14 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom 30%", scrub: true },
      });
    }

    /* ---- Releases: cada fila entra en orden ---- */
    gsap.set(".rel, .deps > div, .roadmap li, .contact-rows > div", { autoAlpha: 0, y: 24 });
    ScrollTrigger.batch(".rel, .deps > div, .roadmap li, .contact-rows > div", {
      start: "top 90%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease, overwrite: true }),
    });

    /* ---- Cifras: cuentan hasta su valor real ---- */
    document.querySelectorAll(".count").forEach((el) => {
      const to = parseFloat(el.dataset.to);
      const from = parseFloat(el.dataset.from || "0");
      const dec = parseInt(el.dataset.dec || "0", 10);
      const fmt = (v) => v.toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
      const counter = { v: from };
      el.textContent = fmt(from);
      gsap.to(counter, {
        v: to, duration: 1.8, ease, delay: 0.2,
        scrollTrigger: once(el, "top 92%"),
        onUpdate: () => { el.textContent = fmt(counter.v); },
      });
    });

    /* ---- Python: la letra se ensancha mientras pasas ---- */
    gsap.fromTo(".dep-name",
      { fontVariationSettings: "'wdth' 62, 'wght' 300" },
      { fontVariationSettings: "'wdth' 125, 'wght' 850", ease: "none",
        scrollTrigger: { trigger: ".main-dep", start: "top 90%", end: "center 45%", scrub: 0.8 } });
    gsap.from(".dep-role", { autoAlpha: 0, y: 10, duration: 0.8, ease, scrollTrigger: once(".main-dep", "top 70%") });

    /* ---- Herramientas: aparecen como una lista ---- */
    gsap.from(".tools li", { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.04, ease, scrollTrigger: once(".tools", "top 92%") });
  }
}
