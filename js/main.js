(function () {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("mobile-menu");

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.hidden = isOpen;
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    });
  });
})();

(function () {
  const carousel = document.querySelector("[data-review-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector("[data-review-track]");
  const previous = carousel.querySelector("[data-review-prev]");
  const next = carousel.querySelector("[data-review-next]");
  const currentLabel = carousel.querySelector("[data-review-current]");
  const totalLabel = carousel.querySelector("[data-review-total]");
  let current = 0;

  function refresh() {
    const total = track.children.length;
    if (!total) return;
    current = (current + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    currentLabel.textContent = String(current + 1);
    totalLabel.textContent = String(total);
  }

  previous.addEventListener("click", () => {
    current -= 1;
    refresh();
  });
  next.addEventListener("click", () => {
    current += 1;
    refresh();
  });

  refresh();
})();

(function () {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(track.children);
  const prevBtn = document.querySelector("[data-carousel-prev]");
  const nextBtn = document.querySelector("[data-carousel-next]");
  const dotsWrap = document.querySelector("[data-carousel-dots]");

  function slidesPerView() {
    return window.matchMedia("(min-width: 700px)").matches ? 3 : 2;
  }

  function pageCount() {
    return Math.ceil(slides.length / slidesPerView());
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    for (let i = 0; i < pageCount(); i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show photo set ${i + 1} of ${pageCount()}`);
      dot.addEventListener("click", () => goToPage(i));
      dotsWrap.appendChild(dot);
    }
  }

  function currentPage() {
    const page = Math.round(track.scrollLeft / track.clientWidth);
    return Math.min(page, pageCount() - 1);
  }

  function updateUI() {
    const page = currentPage();
    Array.from(dotsWrap.children).forEach((dot, i) => {
      dot.classList.toggle("is-active", i === page);
    });
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page === pageCount() - 1;
  }

  function goToPage(page) {
    track.scrollTo({ left: page * track.clientWidth, behavior: "smooth" });
  }

  prevBtn.addEventListener("click", () => goToPage(Math.max(0, currentPage() - 1)));
  nextBtn.addEventListener("click", () => goToPage(Math.min(pageCount() - 1, currentPage() + 1)));

  let scrollTimeout;
  track.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateUI, 80);
  });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      buildDots();
      updateUI();
    }, 150);
  });

  buildDots();
  updateUI();
})();
