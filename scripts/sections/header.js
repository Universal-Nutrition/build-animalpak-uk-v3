import { debounce } from "../helpers/utils.js";

class Header extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.search();
    this.countrySelector();

    this.addEventListener(
      "mouseover",
      debounce(function(e) {
        var targetName = e.target.id;
        var indexValue = e.target.getAttribute("meganav_heading_index");

        [...document.querySelectorAll(".mega-nav__item")].forEach((element) =>
          element.classList.remove("active")
        );

        if (
          (targetName && targetName.includes("meganav")) ||
          indexValue !== null
        ) {
          document
            .getElementById("desktop-menu-overlay")
            .classList.remove("hidden");
          this.querySelectorAll("[meganav_index]").forEach((element) => {
            if (element.getAttribute("meganav_index") != indexValue) {
              element.style.display = "none";
            } else {
              element.style.display = "block";
              e.target.classList.add("active");
            }
          });
        } else if (e.target.getAttribute("data-item-index")) {
          [...document.querySelectorAll("[meganav_index]")].forEach(
            (element) => {
              element.style.display = "none";
            }
          );
          document
            .getElementById("desktop-menu-overlay")
            .classList.add("hidden");
        }

        if (
          e.target.closest(".mega-nav__dropdown") !== null &&
          e.target.closest(".mega-nav__dropdown").style.display === "block"
        ) {
          const parentItemIndex = e.target
            .closest(".mega-nav__dropdown")
            .getAttribute("meganav_index");
          const parentItem = document.querySelector(
            `[meganav_heading_index="${parentItemIndex}"]`
          );
          parentItem.classList.add("active");
        }
      }, 200)
    );

    this.addEventListener(
      "mouseleave",
      debounce(this.mouseLeaveEvent.bind(this), 200)
    );
  }

  mouseLeaveEvent() {
    [...document.querySelectorAll(".mega-nav__item")].forEach((element) =>
      element.classList.remove("active")
    );
    this.querySelectorAll("[meganav_index]").forEach((element) => {
      element.style.display = "none";

      document.getElementById("desktop-menu-overlay").classList.add("hidden");
    });
  }

  search() {
    let searchTrigger = document.querySelectorAll(".trigger-search"),
      searchWrapper = this.querySelector(".search-wrapper"),
      searchInput = this.querySelector(".search-input"),
      searchResults = this.querySelector(".search-results");

    let mobile_trending_search = document
      .querySelector(".trending-searches")
      .cloneNode(true);
    mobile_trending_search.classList.add("trending-searches-mobile");
    document.body.appendChild(mobile_trending_search);

    document.addEventListener("input", function(e) {
      if (e.target.classList.contains("aa-Input")) {
        e.target.value.trim()
          ? mobile_trending_search.classList.add("hide")
          : mobile_trending_search.classList.remove("hide");
      }
    });

    document.addEventListener("click", function(e) {
      if (e.target.closest(".aa-ClearButton")) {
        mobile_trending_search.classList.remove("hide");
      }
    });

    searchTrigger.forEach(function(trigger) {
      trigger.addEventListener("click", function(e) {
        if (searchWrapper && searchInput) {
          searchWrapper.classList.remove("!hidden");
          searchInput.focus();
        } else {
          console.error("Search wrapper or input not found");
        }
      });
    });

    searchInput.addEventListener("keyup", function(e) {
      e.target.value.length
        ? searchResults.classList.remove("!hidden")
        : searchResults.classList.add("!hidden");
    });

    // close search
    document.addEventListener("click", function(e) {
      if (
        e.target.classList.contains("close-search") ||
        e.target.classList.contains("search-wrapper")
      ) {
        searchWrapper.classList.add("!hidden");
        searchResults.classList.add("!hidden");
        searchInput.value = "";
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

customElements.define("main-header", Header);
