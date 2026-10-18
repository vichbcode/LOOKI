/*
  Fichier : script.js
  Projet  : Site vitrine du club LOOKI
  Objectif: Interactions vanilla JS (navbar mobile, thème clair/sombre,
            compteurs chiffres, animation au scroll "reveal", retour haut)
  Langue  : Français (commentaires)
  Notes   : Aucune dépendance, accessible, performant
*/

// ========================= UTILITAIRES =========================
// Sélectionne un élément DOM de façon sûre
function select(el, scope = document) {
  return scope.querySelector(el);
}

// Sélectionne plusieurs éléments DOM
function selectAll(el, scope = document) {
  return Array.from(scope.querySelectorAll(el));
}

// ========================= NAVBAR MOBILE =========================
(function initMobileNav() {
  const navbar = select("#navbar");
  const navToggle = select("#navToggle");
  const mobileNav = select("#mobileNav");
  const closeNavBtn = select("#closeNavBtn");
  const backdrop = select("[data-close-nav]");
  const navLinksMobile = selectAll("[data-nav-mobile]");

  if (!navToggle || !mobileNav) return;

  // Ouvre le menu mobile
  navToggle.addEventListener("click", () => {
    mobileNav.hidden = false;
    // Force reflow pour déclencher animation
    void mobileNav.offsetWidth;
    navbar.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    // Empêche le scroll du body pendant l'ouverture
    document.body.style.overflow = "hidden";
  });

  // Ferme le menu mobile
  function closeNav() {
    navbar.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    // Laisse l'animation se terminer avant de masquer
    setTimeout(() => {
      mobileNav.hidden = true;
    }, 250);
  }

  closeNavBtn?.addEventListener("click", closeNav);
  backdrop?.addEventListener("click", closeNav);

  // Ferme au clic sur un lien mobile
  navLinksMobile.forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  // Ferme avec la touche Échap
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navbar.classList.contains("open")) {
      closeNav();
    }
  });
})();

// ========================= BASCULE THÈME CLAIR/SOMBRE =========================
(function initThemeToggle() {
  const themeToggle = select("#themeToggle");
  const html = document.documentElement;
  const storageKey = "looki-theme";

  // Récupère le thème sauvegardé ou préfère sombre par défaut
  const savedTheme = localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Applique le thème initial
  if (savedTheme === "light" || savedTheme === "dark") {
    html.setAttribute("data-theme", savedTheme);
  } else {
    html.setAttribute("data-theme", prefersDark ? "dark" : "light");
  }

  // Bascule au clic
  themeToggle?.addEventListener("click", () => {
    const current = html.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    html.setAttribute("data-theme", next);
    localStorage.setItem(storageKey, next);
  });

  // Suit le changement de préférence système (si aucun choix explicite)
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem(storageKey)) {
      html.setAttribute("data-theme", e.matches ? "dark" : "light");
    }
  });
})();

// ========================= NAVIGATION ACTIVE AU SCROLL =========================
(function initActiveNav() {
  const navLinks = selectAll("[data-nav]");
  const sections = selectAll("main section[id], footer[id], main[id]");

  if (navLinks.length === 0 || sections.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -60% 0px",
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          if (href === `#${id}`) {
            navLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });
})();

// ========================= COMPTEURS CHIFFRES CLÉS =========================
(function initCounters() {
  const counters = selectAll("[data-count]");
  if (counters.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.4
  };

  let hasRun = false;

  const observer = new IntersectionObserver((entries) => {
    if (hasRun) return;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        hasRun = true;
        counters.forEach((counter) => {
          const target = parseInt(counter.getAttribute("data-count") || "0", 10);
          const duration = 1600; // ms
          const start = performance.now();
          const format = (n) => Math.floor(n).toLocaleString("fr-FR");

          function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            // Easing easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = format(target * eased);
            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              counter.textContent = target.toLocaleString("fr-FR");
            }
          }
          requestAnimationFrame(update);
        });
        observer.disconnect();
      }
    });
  }, observerOptions);

  // Observe le premier compteur (ou stats)
  const statsSection = select(".stats");
  if (statsSection) {
    observer.observe(statsSection);
  } else {
    counters.forEach((c) => observer.observe(c));
  }
})();

// ========================= ANIMATION AU SCROLL "REVEAL" =========================
(function initReveal() {
  const reveals = selectAll("[data-reveal]");
  if (reveals.length === 0) return;

  // Respecte la préférence "réduire les animations"
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    reveals.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach((el) => {
    observer.observe(el);
  });
})();

// ========================= BOUTON RETOUR EN HAUT =========================
(function initBackToTop() {
  const btn = select("#backToTop");
  if (!btn) return;

  function toggle() {
    if (window.scrollY > 400) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  }

  // État initial
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });

  // Clic
  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
})();

// ========================= ANNÉE DYNAMIQUE DANS FOOTER =========================
(function initYear() {
  const yearEl = select("#year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
})();
