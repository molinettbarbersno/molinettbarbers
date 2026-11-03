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

window.initGoogleReviews = async function () {
  const track = document.querySelector("[data-google-reviews]");
  if (!track || !window.google?.maps) return;

  const fallbackUrl = document.querySelector("[data-google-reviews-link]")?.href;
  const freshaReviews = Array.from(track.querySelectorAll('[data-review-source="fresha"]'))
    .map((card) => card.cloneNode(true));

  try {
    const { Place } = await google.maps.importLibrary("places");
    const response = await Place.searchByText({
      textQuery: "Molinett The Barber's, Sjøgata 20B, 8006 Bodø, Norway",
      fields: ["id", "displayName"],
      maxResultCount: 1,
      language: "en"
    });
    const result = response.places?.[0];
    if (!result) throw new Error("Business not found");

    const place = new Place({ id: result.id });
    await place.fetchFields({
      fields: ["displayName", "rating", "userRatingCount", "reviews", "googleMapsURI"]
    });

    const rating = document.querySelector("[data-google-rating]");
    const count = document.querySelector("[data-google-review-count]");
    const link = document.querySelector("[data-google-reviews-link]");
    if (rating && place.rating) rating.textContent = place.rating.toFixed(1);
    if (count && place.userRatingCount) count.textContent = `${place.userRatingCount} Google reviews`;
    if (link) link.href = place.googleMapsURI || fallbackUrl;

    const googleReviews = (place.reviews || []).map((review) => {
      const card = document.createElement("blockquote");
      card.className = "review-card";
      card.dataset.reviewSource = "google";

      const stars = document.createElement("div");
      stars.className = "review-card__stars";
      stars.setAttribute("aria-label", `${review.rating || 5} out of 5 stars`);
      stars.textContent = "★".repeat(Math.round(review.rating || 5));

      const text = document.createElement("p");
      text.textContent = `“${review.text || ""}”`;

      const cite = document.createElement("cite");
      const author = document.createElement("a");
      author.className = "review-source";
      author.textContent = review.authorAttribution?.displayName || "Google reviewer";
      author.href = review.authorAttribution?.uri || place.googleMapsURI || fallbackUrl;
      author.target = "_blank";
      author.rel = "noopener";
      cite.append(author);

      card.append(stars, text, cite);
      return card;
    });

    if (googleReviews.length) {
      track.replaceChildren(...googleReviews, ...freshaReviews);
    }
  } catch (error) {
    console.warn("Google reviews could not be refreshed; showing saved reviews.", error);
  }

  window.refreshReviewCarousel?.();
};

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

  window.refreshReviewCarousel = () => {
    current = 0;
    refresh();
  };
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
