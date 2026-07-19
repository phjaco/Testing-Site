const content = document.getElementById("content");

/* ---------------- PAGE CACHE ---------------- */

const pageCache = new Map();

async function fetchPage(url) {
  if (pageCache.has(url)) return pageCache.get(url);

  const response = await fetch(url);
  const html = await response.text();
  pageCache.set(url, html);
  return html;
}

/* ---------------- LOAD PAGE ---------------- */

async function loadPage(url, pushState = true) {
  const html = await fetchPage(url);

  const temp = document.createElement("div");
  temp.innerHTML = html;

  const newPage = temp.querySelector(".page");
  if (!newPage) return;

  content.replaceChildren(newPage);

  requestAnimationFrame(() => {
    newPage.classList.add("page-loaded");
    updateParallax();     // re-init parallax
    initCarousels();      // ✅ INIT CAROUSELS HERE
  });

  if (pushState) history.pushState(null, "", url);
}

/* ---------------- NAVIGATION ---------------- */

document.addEventListener("click", e => {
  const link = e.target.closest("a[data-link]");
  if (!link) return;

  e.preventDefault();
  loadPage(link.getAttribute("href"));
});

window.addEventListener("popstate", () => {
  loadPage(location.pathname, false);
});

/* ---------------- PARALLAX ---------------- */

function updateParallax() {
  const blocks = document.querySelectorAll(".block");
  const vh = window.innerHeight;

  blocks.forEach(block => {
    const rect = block.getBoundingClientRect();
    const offset = rect.top + rect.height / 2 - vh / 2;
    const translateY = offset * -0.15;
    block.style.transform = `translateY(${translateY}px)`;
  });
}

window.addEventListener("scroll", updateParallax, { passive: true });
window.addEventListener("resize", updateParallax);

/* ---------------- CAROUSELS ---------------- */

function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach(carousel => {
    if (carousel.dataset.ready) return;
    carousel.dataset.ready = "true";

    const track = carousel.querySelector(".carousel-track");
    const images = [...track.children];
    const dotsContainer = carousel.querySelector(".carousel-dots");

    let index = 0;

    images.forEach((_, i) => {
      const dot = document.createElement("button");
      if (i === 0) dot.classList.add("active");

      dot.addEventListener("click", () => {
        index = i;
        update();
      });

      dotsContainer.appendChild(dot);
    });

    const dots = [...dotsContainer.children];

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach(d => d.classList.remove("active"));
      dots[index].classList.add("active");
    }

    update();
  });
}

/* ---------------- INIT ---------------- */

loadPage(location.pathname === "/" ? "/home.html" : location.pathname, false);

["/home.html", "/projects.html", "/contact.html"].forEach(fetchPage);
