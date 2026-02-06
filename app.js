const content = document.getElementById("content");

/* Page cache */
const pageCache = new Map();

/* Fetch + cache page */
async function fetchPage(url) {
  if (pageCache.has(url)) {
    return pageCache.get(url);
  }

  const response = await fetch(url);
  const html = await response.text();
  pageCache.set(url, html);
  return html;
}

/* Load page */
async function loadPage(url, pushState = true) {
  const html = await fetchPage(url);

  content.innerHTML = html;

  if (pushState) {
    history.pushState(null, "", url)
  };
}

/* Preload pages */
const preloadUrls = [
  "/home.html",
  "/projects.html",
  "/contact.html"
];

preloadUrls.forEach(url => {
  fetchPage(url);
});


document.querySelectorAll("a[data-link]").forEach(link => {
  link.addEventListener("mouseenter", () => {
    fetchPage(link.getAttribute("href"));
  }, { once: true });
});


async function loadPage(url, pushState = true) {
  const html = await fetchPage(url);

  /* Atomic replace — do NOT clear content before this */
  content.innerHTML = html;

  if (pushState) history.pushState(null, "", url);
}
