// Año en el pie
document.getElementById("year").textContent = new Date().getFullYear();

// Cerrar el menú móvil al elegir una sección
const menu = document.getElementById("menu");
document.querySelectorAll("#menu .nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (menu.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  });
});

// Grafo de versiones: sección activa, progreso del lomo y del menú
const root = document.documentElement;
const sections = [...document.querySelectorAll("[data-section]")];
const spineLinks = [...document.querySelectorAll(".spine-nodes a")];
const navLinks = [...document.querySelectorAll("#menu .nav-link")];
let ticking = false;

function update() {
  ticking = false;
  const probe = window.scrollY + window.innerHeight * 0.4;
  const atBottom = window.innerHeight + window.scrollY >= root.scrollHeight - 2;

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
  const docProgress = window.scrollY / Math.max(root.scrollHeight - window.innerHeight, 1);

  root.style.setProperty("--spine-p", spineProgress.toFixed(4));
  root.style.setProperty("--doc-p", docProgress.toFixed(4));

  spineLinks.forEach((link, i) => {
    link.classList.toggle("is-active", i === index);
    link.classList.toggle("is-passed", i < index);
    if (i === index) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });

  sections.forEach((section, i) => section.classList.toggle("is-active", i === index));

  const id = current.id;
  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
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
update();
