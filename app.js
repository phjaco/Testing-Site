const content = document.getElementById("content");

/* Page cache */
const pageCache = new Map();

/* Fetch + cache page */
async function fetchPage(url) {
  if (pageCache.has(url)) return pageCache.get(url);

  const response = await fetch(url);
  const html = await response.text();
  pageCache.set(url, html);
  return html;
}

/* Load page without flashing */
async function loadPage(url, pushState = true) {
  const html = await fetchPage(url);

  // Create a temporary container
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Get new page section
  const newPage = temp.querySelector(".page");

  // Keep old children visible until new page is ready
  // Clear old children and append new one in memory
  content.replaceChildren(newPage);

  // Trigger fade-in animation
  requestAnimationFrame(() => {
    newPage.classList.add("page-loaded");
  });

  if (pushState) history.pushState(null, "", url);
}

/* Intercept nav clicks */
document.addEventListener("click", e => {
  const link = e.target.closest("a[data-link]");
  if (!link) return;

  e.preventDefault();
  loadPage(link.getAttribute("href"));
});

/* Back/forward support */
window.addEventListener("popstate", () => {
  loadPage(location.pathname, false);
});

/* Initial load */
loadPage(location.pathname === "/" ? "/home.html" : location.pathname, false);

/* Preload all pages */
const preloadUrls = ["/home.html", "/projects.html", "/contact.html"];
preloadUrls.forEach(url => fetchPage(url));

const blocks = () => document.querySelectorAll(".block");

function updateParallax() {
  const viewportHeight = window.innerHeight;

  blocks().forEach(block => {
    const rect = block.getBoundingClientRect();

    // Distance from center of viewport
    const offset = rect.top + rect.height / 2 - viewportHeight / 2;

    // Tune this value for strength (smaller = subtler)
    const translateY = offset * -0.15;

    block.style.transform = `translateY(${translateY}px)`;
  });
}

// Run on scroll + initial load
window.addEventListener("scroll", updateParallax, { passive: true });
window.addEventListener("resize", updateParallax);
updateParallax();

content.replaceChildren(newPage);
