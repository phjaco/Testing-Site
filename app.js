/**
 * PORTFOLIO CORE ENGINE
 */

const PROJECT_ORDER = [
    'sojo-s26',
    'fsae-uprights', 
    'choked-flow', 
    'clock-geartrain', 
    'ebike',
    'fluidsimver',
    'chip-clip',
    'magnetic-damping',
    'mmn-surface-prep',
    'mousetrap',
    'frc-2023',
    'frc-2022'
    ];

const DISPLAY_NAMES = {
    'sojo-s26':'SOJO Summer 2026',
    'fsae-uprights': 'FSAE Uprights',
    'choked-flow': 'Choked Flow Impulse',
    'clock-geartrain': 'Clock Geartrain',
    'ebike': 'Electric Bike',
    'fluidsimver' : 'Fluid Sim. Verification',
    'chip-clip' : 'Chip Clip',
    'magnetic-damping' : 'Eddy Current Brakes',
    'mmn-surface-prep' : 'MMN Surfaces',
    'mousetrap':'Mousetrap Car',
    'frc-2023' : "FRC '23",
    'frc-2022' : "FRC '22",
    };

const Router = {
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
        this.initGlobalEvents();
    },

    handleRoute() {
        const id = window.location.hash.substring(1) || 'home';
        this.showPage(id);
    },

    showPage(id) {
        const pages = document.querySelectorAll('.page');
        let targetFound = false;

        pages.forEach(page => {
            const isActive = page.id === id;
            page.classList.toggle('active', isActive);
            if (isActive) targetFound = true;
        });

        if (!targetFound) {
            const home = document.getElementById('home');
            if (home) home.classList.add('active');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });
        
        const bar = document.getElementById('global-project-taskbar');
        if (bar) bar.classList.remove('expanded');

        this.updateNav(id);
        this.handleTaskbar(id);
        
        UIComponents.initCarousels();
        //UIComponents.initModelMaterials();
        UIComponents.renderMath();   
        PDFViewerModule.init();
    },

    updateNav(id) {
        document.querySelectorAll('.nav a').forEach(a => {
            const href = a.getAttribute('href').replace('#', '');
            a.classList.toggle('active', href === id);
        });
    },

    handleTaskbar(id) {
        const isProject = PROJECT_ORDER.includes(id);
        document.body.classList.toggle('in-project', isProject);
        
        if (isProject) {
            this.renderTaskbarButtons(id);
        }
    },

    renderTaskbarButtons(currentId) {
        const container = document.getElementById('taskbar-content');
        if (!container) return;

        const currentIndex = PROJECT_ORDER.indexOf(currentId);
        container.innerHTML = '';

        const getName = (id) => DISPLAY_NAMES[id] || id.replace('project-', '').replace(/-/g, ' ').toUpperCase();
        
        const createBtn = (label, targetId, isNext = false) => {
            const btn = document.createElement('button');
            btn.className = isNext ? 'task-item next-task' : 'task-item';
            btn.innerHTML = label;
            btn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = targetId;
            };
            return btn;
        };

        if (currentIndex > 0) {
            container.appendChild(createBtn(`← ${getName(PROJECT_ORDER[currentIndex - 1])}`, PROJECT_ORDER[currentIndex - 1]));
        } else {
            container.appendChild(createBtn('All Projects', 'projects'));
        }

        if (currentIndex < PROJECT_ORDER.length - 1) {
            container.appendChild(createBtn(`${getName(PROJECT_ORDER[currentIndex + 1])} →`, PROJECT_ORDER[currentIndex + 1], true));
        } else {
            container.appendChild(createBtn('Back to Gallery', 'projects'));
        }
    },


    
    initGlobalEvents() {
        const scrollTopBtn = document.getElementById('scroll-top');
        if (scrollTopBtn) {
            window.addEventListener('scroll', () => {
                scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
            });
            scrollTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        const backBtn = document.getElementById('back-to-projects');
        const navEl = document.querySelector('.nav');

        if (backBtn && navEl) {
            const OVERLAP = 22;       // how far it tucks behind the nav pill's left edge
            const MIN_SPACE = 60;     // minimum room needed to the left before hiding
            const HEIGHT_REDUCTION = 10; // how much thinner than the nav pill (px, split evenly top/bottom)

            const positionBackButton = () => {
                if (window.innerWidth <= 768) return; // hidden via CSS anyway

                const navRect = navEl.getBoundingClientRect();
                const buttonWidth = backBtn.offsetWidth;
                const desiredLeft = navRect.left - buttonWidth + OVERLAP;

                if (desiredLeft < MIN_SPACE) {
                    backBtn.classList.add('no-room');
                } else {
                    backBtn.classList.remove('no-room');
                    const thinnerHeight = navRect.height - HEIGHT_REDUCTION;
                    backBtn.style.top = `${navRect.top + HEIGHT_REDUCTION / 2}px`;
                    backBtn.style.height = `${thinnerHeight}px`;
                    backBtn.style.left = `${desiredLeft}px`;
                }
            };

            positionBackButton();
            window.addEventListener('resize', positionBackButton);
            window.addEventListener('hashchange', () => setTimeout(positionBackButton, 0));

            let lastScrollY = window.scrollY;
            window.addEventListener('scroll', () => {
                const currentScrollY = window.scrollY;
                const scrollingDown = currentScrollY > lastScrollY;

                if (currentScrollY > 80 && scrollingDown) {
                    backBtn.classList.add('scrolled-down');
                } else {
                    backBtn.classList.remove('scrolled-down');
                }
                lastScrollY = currentScrollY;
            });
            }
        }
    };

/**
 * COPY TO CLIPBOARD UTILITY
 */
function copyToClipboard(button) {
  const textToCopy = button.getAttribute('data-copy');
  const originalText = button.innerText;

  navigator.clipboard.writeText(textToCopy).then(() => {
    // Visual Feedback
    button.innerText = "Copied!";
    button.style.background = "#28a745"; // Success green
    button.style.border = "#28a745"; // Success green
    button.style.color = "#FFFFFF";
    
    
    // Reset button after 2 seconds
    setTimeout(() => {
      button.innerText = originalText;
      button.style.background = ""; // Reverts to CSS var(--accent)
          button.style.border = "";
    button.style.color = "";
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

const UIComponents = {
    initCarousels() {
        document.querySelectorAll('.carousel').forEach(carousel => {
            if (carousel.dataset.initialized) return;
            carousel.dataset.initialized = "true";
            const track = carousel.querySelector('.carousel-track');
            const nav = carousel.querySelector('.carousel-nav');
            if (!track || !nav) return;

            Array.from(track.children).forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = `dot ${i === 0 ? 'active' : ''}`;
                dot.onclick = (e) => {
                    e.stopPropagation();
                    track.style.transform = `translateX(-${i * 100}%)`;
                    nav.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
                    dot.classList.add('active');
                };
                nav.appendChild(dot);
            });
        });
    },


     renderMath() {
        if (window.renderMathInElement) {
            renderMathInElement(document.body, {
                delimiters: [
                    { left: "'$$", right: "$$'", display: true },
                    { left: "'$", right: "$'", display: false }
                ]
            });
        } else {
            console.warn('KaTeX not loaded — check that vendor/katex/ files exist and paths are correct.');
        }
    },

    // initModelMaterials() {
    //     // Fix: Added safety checks to prevent breaking the viewer
    //     document.querySelectorAll('model-viewer').forEach(viewer => {
    //         const applyMaterials = () => {
    //             const model = viewer.model;
    //             if (!model || !model.materials) return;
                
    //             model.materials.forEach(mat => {
    //                 if (mat.pbrMetallicRoughness) {
    //                     mat.pbrMetallicRoughness.setRoughnessFactor(0.25);
    //                     mat.pbrMetallicRoughness.setMetallicFactor(1);
    //                 }
    //             });
    //         };

    //         // If already loaded, apply; otherwise wait for load event
    //         if (viewer.loaded) {
    //             applyMaterials();
    //         } else {
    //             viewer.addEventListener('load', applyMaterials);
    //         }
    //     });
    // }
};

document.addEventListener('DOMContentLoaded', () => Router.init());
window.showPage = (id) => window.location.hash = id;

/**
 * PDF VIEWER (custom, lazy-loaded continuous scroll, no native browser chrome)
 */
const PDFViewerModule = {
    async init() {
        const containers = document.querySelectorAll('.pdf-viewer:not([data-initialized])');
        for (const container of containers) {
            container.dataset.initialized = "true";
            this.setupViewer(container);
        }
    },

    async setupViewer(container) {
        const url = container.dataset.pdfUrl;
        if (!url) return;

        const scrollEl = container.querySelector('.pdf-viewer-scroll');
        const pageInfo = container.querySelector('.pdf-viewer-page-info');

        let pdfjsLib;
        try {
            pdfjsLib = await import('./vendor/pdfjs/pdf.min.mjs');
            pdfjsLib.GlobalWorkerOptions.workerSrc = './vendor/pdfjs/pdf.worker.min.mjs';
        } catch (err) {
            console.error('Failed to load PDF.js', err);
            scrollEl.innerHTML = '<div class="pdf-viewer-loading">Could not load PDF viewer.</div>';
            return;
        }

        let pdfDoc;
        try {
            pdfDoc = await pdfjsLib.getDocument(url).promise;
        } catch (err) {
            console.error('Failed to load PDF', err);
            scrollEl.innerHTML = '<div class="pdf-viewer-loading">Could not load PDF.</div>';
            return;
        }

        scrollEl.innerHTML = '';
        const numPages = pdfDoc.numPages;
        const dpr = window.devicePixelRatio || 1;

        // Build one placeholder wrapper per page, sized via aspect-ratio
        // (based on page 1's dimensions) so scroll height is stable before render.
        const firstPage = await pdfDoc.getPage(1);
        const baseViewport = firstPage.getViewport({ scale: 1 });
        const aspectRatio = baseViewport.width / baseViewport.height;

        const pageEls = [];
        for (let i = 1; i <= numPages; i++) {
            const wrap = document.createElement('div');
            wrap.className = 'pdf-page';
            wrap.dataset.pageNum = i;
            wrap.style.aspectRatio = aspectRatio;
            wrap.style.maxWidth = `${baseViewport.width}px`;

            const placeholder = document.createElement('div');
            placeholder.className = 'pdf-page-placeholder';
            placeholder.textContent = `Page ${i}`;
            wrap.appendChild(placeholder);

            scrollEl.appendChild(wrap);
            pageEls.push(wrap);
        }

        const renderedPages = new Set();

        const renderPage = async (wrap) => {
            const num = parseInt(wrap.dataset.pageNum, 10);
            if (renderedPages.has(num)) return;
            renderedPages.add(num);

            const page = await pdfDoc.getPage(num);
            const containerWidth = wrap.clientWidth;
            const unscaledViewport = page.getViewport({ scale: 1 });
            const scale = (containerWidth / unscaledViewport.width) * dpr;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            try {
                await page.render({ canvasContext: ctx, viewport }).promise;
                wrap.innerHTML = '';
                wrap.appendChild(canvas);
            } catch (err) {
                renderedPages.delete(num); // allow retry if render failed/was cancelled
            }
        };

        const unrenderPage = (wrap) => {
            const num = parseInt(wrap.dataset.pageNum, 10);
            if (!renderedPages.has(num)) return;
            renderedPages.delete(num);
            wrap.innerHTML = '';
            const placeholder = document.createElement('div');
            placeholder.className = 'pdf-page-placeholder';
            placeholder.textContent = `Page ${num}`;
            wrap.appendChild(placeholder);
        };

        // Preload ~1 viewport ahead/behind; unrender once well outside that margin.
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    renderPage(entry.target);
                } else {
                    unrenderPage(entry.target);
                }
            });
        }, {
            root: scrollEl,
            rootMargin: '600px 0px 600px 0px',
            threshold: 0
        });

        pageEls.forEach(el => observer.observe(el));

        // Track which page is most visible for the "Page X of N" label.
        const labelObserver = new IntersectionObserver((entries) => {
            let best = null;
            entries.forEach(entry => {
                if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) {
                    best = entry;
                }
            });
            if (best) {
                pageInfo.textContent = `Page ${best.target.dataset.pageNum} of ${numPages}`;
            }
        }, {
            root: scrollEl,
            threshold: [0.25, 0.5, 0.75]
        });

        pageEls.forEach(el => labelObserver.observe(el));
    }
};