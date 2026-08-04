/**
 * PORTFOLIO CORE ENGINE
 */

const PROJECT_ORDER = [
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
    'fsae-uprights': 'FSAE Uprights',
    'choked-flow': 'Choked FLow Impulse',
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
        UIComponents.initModelMaterials();
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