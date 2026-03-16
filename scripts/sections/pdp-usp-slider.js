import { Swiper, Pagination, EffectFade } from 'swiper'
import 'swiper/css/bundle'

class pdpUsp extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const uspSwiper = new Swiper(document.querySelector('.badge-swiper'), {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      modules: [Pagination],
      pagination: {
        el: '.swiper-pdp-badge-pagination',
        clickable: true
      },
    })
  }
}

if (!customElements.get('pdp-usp')) customElements.define('pdp-usp', pdpUsp);


