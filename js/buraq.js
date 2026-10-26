document.querySelectorAll("img").forEach((img) => {
  const hide = () => img.classList.add("is-missing");
  img.addEventListener("error", hide);
  if (img.complete && img.naturalWidth === 0) {
    hide();
  }
});

const themeToggle = document.querySelector(".theme-toggle");

if (themeToggle) {
  const themeLabel = themeToggle.querySelector("[data-theme-label]");
  const themeIcon = themeToggle.querySelector(".theme-icon");

  const updateThemeToggle = () => {
    const isLight = document.documentElement.dataset.theme === "light";
    const nextTheme = isLight ? "dark" : "light";

    themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeLabel.textContent = `${nextTheme[0].toUpperCase()}${nextTheme.slice(1)} mode`;
    themeIcon.classList.toggle("fa-sun", nextTheme === "light");
    themeIcon.classList.toggle("fa-moon", nextTheme === "dark");
  };

  updateThemeToggle();

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;

    try {
      localStorage.setItem("buraq-theme", nextTheme);
    } catch {
      // The selected theme still works for this page if storage is unavailable.
    }

    updateThemeToggle();
  });
}

const sectionNavLinks = Array.from(document.querySelectorAll(".navbar .nav-link[href]"))
  .map((link) => {
    const linkUrl = new URL(link.href, window.location.href);
    const targetId = decodeURIComponent(linkUrl.hash.slice(1));
    const section = linkUrl.pathname === window.location.pathname && targetId
      ? document.getElementById(targetId)
      : null;

    return section ? { link, section } : null;
  })
  .filter(Boolean);

if (sectionNavLinks.length) {
  const navbar = document.querySelector(".navbar");

  const setActiveSection = (activeSection) => {
    sectionNavLinks.forEach(({ link, section }) => {
      const isActive = section === activeSection;
      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const updateActiveSection = (preferredSection) => {
    if (preferredSection) {
      setActiveSection(preferredSection);
      return;
    }

    const marker = window.scrollY + (navbar?.getBoundingClientRect().height || 0) + 24;
    let activeSection = sectionNavLinks[0].section;

    sectionNavLinks.forEach(({ section }) => {
      if (section.offsetTop <= marker) {
        activeSection = section;
      }
    });

    setActiveSection(activeSection);
  };

  sectionNavLinks.forEach(({ link, section }) => {
    link.addEventListener("click", () => updateActiveSection(section));
  });

  let scrollUpdateQueued = false;
  window.addEventListener("scroll", () => {
    if (scrollUpdateQueued) return;

    scrollUpdateQueued = true;
    window.requestAnimationFrame(() => {
      scrollUpdateQueued = false;
      updateActiveSection();
    });
  }, { passive: true });

  window.addEventListener("resize", () => updateActiveSection());
  window.addEventListener("hashchange", () => updateActiveSection());
  window.addEventListener("pageshow", () => updateActiveSection());
  updateActiveSection();
}
