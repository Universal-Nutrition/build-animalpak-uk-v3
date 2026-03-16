import { Swiper, EffectFade, Navigation } from 'swiper'
import 'swiper/css/bundle'

class TestimonialSlider extends HTMLElement {
  constructor() {
    super()
  }
  connectedCallback() {
    let swiper;
    function swiperDesktop () {
      swiper = new Swiper(document.querySelector('.testimonial-slider'), {
        slidesPerView: 1,
        spaceBetween: 0,
        freeMode: true,
        loop: true,
        modules: [Navigation, EffectFade],
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
        navigation: {
          nextEl: '.swiper-testimonials-next',
          prevEl: '.swiper-testimonials-prev'
        }
      });
    }
    function swiperMobile () {
      swiper = new Swiper(document.querySelector('.testimonial-slider'), {
        slidesPerView: 1.25,
        spaceBetween: 24,
        freeMode: true,
        loop: true,
        modules: [Navigation, EffectFade],
        effect: 'slide',
        navigation: {
          nextEl: '.swiper-testimonials-next',
          prevEl: '.swiper-testimonials-prev'
        }
      });
    }
    if (window.innerWidth >= 768) {
      swiperDesktop();
    } else {
      swiperMobile();
    }
    window.addEventListener("resize", (event) => {
      if (window.innerWidth >= 768) {
        swiper.destroy();
        swiperDesktop();
      } else {
        swiper.destroy();
        swiperMobile();
      }
    });
    [...document.querySelectorAll('.swiper-testimonials-next')].forEach(elem => {
      elem.classList.remove('!hidden')
    });
    [...document.querySelectorAll('.swiper-testimonials-prev')].forEach(elem => {
      elem.classList.remove('!hidden')
    });
  }
}
if (!customElements.get('testimonial-slider')) customElements.define('testimonial-slider', TestimonialSlider)
