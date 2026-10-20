// Año actual en el footer
document.getElementById("year").textContent = new Date().getFullYear();

// Sombra del navbar al hacer scroll
const nav = document.getElementById("mainNav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Cerrar el menú móvil al elegir una sección
const navMenu = document.getElementById("navMenu");
document.querySelectorAll("#navMenu .nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (navMenu.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
  });
});

// Tema claro / oscuro (se recuerda en el navegador)
const root = document.documentElement;
const themeBtn = document.getElementById("themeToggle");
const setTheme = (theme) => {
  root.setAttribute("data-bs-theme", theme);
  themeBtn.innerHTML = theme === "dark" ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
  try { localStorage.setItem("theme", theme); } catch (e) {}
};
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
setTheme(saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener("click", () => setTheme(root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark"));

// Animaciones al entrar en pantalla
document.querySelectorAll(".section .card, .interest, .tool, .skill, .section-head").forEach((el) => el.classList.add("reveal"));
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
