document.getElementById("year").textContent = new Date().getFullYear();

const navigationLinks = Array.from(
    document.querySelectorAll('.navbar a[href^="#"]')
);
const navigableSections = navigationLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter((section) => section !== null);

const updateActiveNavigation = () => {
    const visibleSections = navigableSections.filter(
        (section) => section.getBoundingClientRect().top <= window.innerHeight * 0.35
    );
    const activeSection = visibleSections[visibleSections.length - 1];

    navigationLinks.forEach((link) => {
        if (activeSection && link.getAttribute("href") === `#${activeSection.id}`) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
};

let scrollUpdatePending = false;

const updateScrollProgress = () => {
    const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
    const progress =
        scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

    document.documentElement.style.setProperty(
        "--scroll-progress",
        String(Math.min(progress, 1))
    );
    updateActiveNavigation();
    scrollUpdatePending = false;
};

window.addEventListener(
    "scroll",
    () => {
        if (!scrollUpdatePending) {
            window.requestAnimationFrame(updateScrollProgress);
            scrollUpdatePending = true;
        }
    },
    { passive: true }
);
window.addEventListener("resize", updateScrollProgress, { passive: true });
updateScrollProgress();

const highlightNumbers = document.querySelectorAll(".highlight-number");
const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

const animateHighlight = (element) => {
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || "";

    if (!Number.isFinite(target)) {
        return;
    }

    if (prefersReducedMotion) {
        element.textContent = `${target}${suffix}`;
        return;
    }

    const duration = 900;
    const startTime = performance.now();
    const highlight = element.closest(".highlight");
    highlight?.classList.add("is-counting");

    const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        const currentValue = Math.round(target * easedProgress);

        element.textContent = `${currentValue}${suffix}`;

        if (progress < 1) {
            window.requestAnimationFrame(tick);
        } else {
            highlight?.classList.remove("is-counting");
        }
    };

    window.requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window) {
    const highlightObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateHighlight(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.6 }
    );

    highlightNumbers.forEach((element) => highlightObserver.observe(element));
} else {
    highlightNumbers.forEach((element) => animateHighlight(element));
}

if ("IntersectionObserver" in window) {
    const revealElements = document.querySelectorAll(
        "main > section:not(.hero), .skill-group, .experience-card, .project"
    );

    revealElements.forEach((element) => element.classList.add("reveal"));
    document.body.classList.add("reveal-enabled");

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
}
