import { Swiper, Pagination, Autoplay, EffectFade } from "swiper";
import "swiper/css/bundle";
import $ from "jquery";

class HeroSlider extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const swiper = new Swiper(this, {
      slidesPerView: 1,
      loop: true,
      modules: [Pagination, Autoplay, EffectFade],
      pagination: true,
      pagination: {
        el: ".hero-pagination",
        clickable: true,
      },
      autoplay: {
        delay: slide_delay,
        disableOnInteraction: false,
      },
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
    });

    swiper.on("slideChange", function(e) {
      $(".swiper-pagination-bullet-active").prevAll().addClass("prev");
      setTimeout(() => {
        $(".swiper-pagination-bullet").removeClass("prev");
      }, 5300);
    });
  }
}
customElements.define("hero-slider", HeroSlider);
