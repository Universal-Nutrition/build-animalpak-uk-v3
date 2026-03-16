import { debounce } from "../helpers/utils.js";

class Header extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.toggleExpanded();
    this.search();
    this.countrySelector();

    this.addEventListener(
      "mouseleave",
      debounce(this.mouseLeaveEvent.bind(this), 50)
    );
  }

  toggleExpanded() {
    const overlay = document.getElementById("desktop-menu-overlay");
    const elements = document.querySelectorAll("[data-item-index]");

    elements.forEach((element) => {
      const dropdown = element.querySelector(".mega-nav__dropdown");
      if (!dropdown) return;

      element.addEventListener("mouseover", () => {
        [...document.querySelectorAll(".mega-nav__item")].forEach((el) =>
          el.classList.remove("active")
        );
        const btn = element.querySelector("[meganav_heading_index]");
        if (btn) btn.classList.add("active");

        document.querySelectorAll(".mega-nav__dropdown").forEach((el) =>
          el.classList.add("hidden")
        );
        dropdown.classList.remove("hidden");

        if (overlay) {
          overlay.style.opacity = "1";
          overlay.style.pointerEvents = "auto";
        }
      });

      element.addEventListener("mouseout", (e) => {
        if (!element.contains(e.relatedTarget)) {
          dropdown.classList.add("hidden");
          element.querySelector("[meganav_heading_index]")?.classList.remove("active");
        }
      });
    });
  }

  mouseLeaveEvent() {
    [...document.querySelectorAll(".mega-nav__item")].forEach((element) =>
      element.classList.remove("active")
    );
    document.querySelectorAll(".mega-nav__dropdown").forEach((element) => {
      element.classList.add("hidden");
    });

    const overlay = document.getElementById("desktop-menu-overlay");
    if (overlay) {
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
    }
  }

  search() {
    let searchTrigger = document.querySelectorAll(".trigger-search"),
      searchWrapper = this.querySelector(".search-wrapper"),
      searchInput = this.querySelector(".search-input"),
      searchResults = this.querySelector(".search-results");

    const trendingEl = document.querySelector(".trending-searches");
    let mobile_trending_search = null;
    if (trendingEl) {
      mobile_trending_search = trendingEl.cloneNode(true);
      mobile_trending_search.classList.add("trending-searches-mobile");
      document.body.appendChild(mobile_trending_search);
    }

    document.addEventListener("input", function(e) {
      if (e.target.classList.contains("aa-Input") && mobile_trending_search) {
        e.target.value.trim()
          ? mobile_trending_search.classList.add("hide")
          : mobile_trending_search.classList.remove("hide");
      }
    });

    document.addEventListener("click", function(e) {
      if (e.target.closest(".aa-ClearButton") && mobile_trending_search) {
        mobile_trending_search.classList.remove("hide");
      }
    });

    searchTrigger.forEach(function(trigger) {
      trigger.addEventListener("click", function(e) {
        if (searchWrapper && searchInput) {
          searchWrapper.classList.remove("!hidden");
          searchInput.focus();
        }
      });
    });

    if (searchInput) {
      searchInput.addEventListener("keyup", function(e) {
        e.target.value.length
          ? searchResults.classList.remove("!hidden")
          : searchResults.classList.add("!hidden");
      });
    }

    // close search
    document.addEventListener("click", function(e) {
      if (
        e.target.classList.contains("close-search") ||
        e.target.classList.contains("search-wrapper")
      ) {
        if (searchWrapper) searchWrapper.classList.add("!hidden");
        if (searchResults) searchResults.classList.add("!hidden");
        if (searchInput) searchInput.value = "";
      }
    });
  }
  countrySelector() {
    setTimeout(() => {
      if (document.getElementById("md-footer-selector__form__id")) {
        document
          .querySelector(".custom-orbe")
          .addEventListener("click", function() {
            document.getElementById("md-form__select__country--footer").click();
          });

        document
          .querySelector(".custom-orbe-wrap")
          .addEventListener("click", function() {
            if (
              document
                .getElementById("md-form__select__country--footer")
                .getAttribute("aria-expanded") === "true"
            ) {
              document
                .querySelector(".custom-orbe-arrow")
                .classList.add("active");
            } else {
              document
                .querySelector(".custom-orbe-arrow")
                .classList.remove("active");
            }
          });

        document.querySelector(".custom-orbe-wrap").classList.remove("hidden");
      }
    }, 1000);
  }
}

if (!customElements.get("main-header")) customElements.define("main-header", Header);
