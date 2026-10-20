# Portafolio profesional · Nicolás Muñoz Rave

Portafolio personal, entrega del **Parcial 2**. Sitio frontend responsive construido con **Bootstrap 5**.

**Sitio publicado:** https://nicolasravem-design.github.io/parcial-2-portafolio/

## La idea

La carrera se presenta como unas **notas de versión** de software: cada etapa es una versión (v0 bachiller → v5.0, quinto semestre actual) y cada proyecto es algo ya publicado, con su resultado medido y su enlace. Un "grafo de commits" a la izquierda acompaña el recorrido y marca la sección en la que estás.

## Secciones

| Sección pedida | Dónde está |
|---|---|
| a. Información personal | Portada y sección **Información personal** |
| b. Estudios realizados | **Estudios** (Unilasallista y Colegio San José de La Salle) |
| c. Proyectos / experiencia | **Proyectos y experiencia** (Esthetic dental + 4 proyectos) |
| d. Lenguajes de programación | **Lenguajes** (Python como principal, JavaScript, HTML/CSS) |
| e. Áreas de interés profesional | **Áreas de interés** |

## Tecnologías

- HTML5, CSS3 y JavaScript sin paso de compilación
- [Bootstrap 5.3](https://getbootstrap.com/): grid (`col-12`, `col-md-*`, `col-lg-*`), navbar colapsable, botones y utilidades
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [GSAP 3.13](https://gsap.com/) con ScrollTrigger y SplitText: animaciones ligadas al scroll
- [Lenis](https://lenis.darkroom.engineering/): scroll suave
- Fuentes: Archivo (ancho y peso variables) y Martian Mono, de Google Fonts

## Diseño y movimiento

Tema oscuro: fondo casi negro, franjas de sección en azul tinta y amarillo solo para lo que está "vivo" (la versión actual y los proyectos publicados).

- Al cargar, la versión se "publica": el nombre sube letra a letra, la etiqueta v5.0 se sella y las líneas `+` se añaden con un destello verde.
- La línea de Estudios se dibuja mientras haces scroll.
- Las cifras de los proyectos cuentan hasta su valor real (0,466 → 0,641).
- La palabra "Python" se ensancha al pasar, usando el eje de ancho de la fuente variable.
- La captura de Esthetic dental se carga de arriba abajo.
- Si el sistema pide reducir el movimiento, todo esto se desactiva.

## Responsive

Probado en móvil (390 px), tablet (820 px) y escritorio (1440 px):

- **Móvil:** menú colapsable, botón de WhatsApp siempre visible y barra de progreso de lectura.
- **Tablet:** columnas de dos en dos donde caben.
- **Escritorio:** lomo lateral de navegación con el grafo de versiones y filas de proyectos en cuatro columnas.

Respeta `prefers-reduced-motion` y se puede navegar con el teclado.

## Estructura

```
index.html
css/styles.css
js/main.js
assets/img/esthetic-dental.png   captura del sitio publicado de Esthetic dental
```

## Ejecutar en local

```bash
npx http-server -p 5500
```
