import { Swiper, Navigation } from 'swiper'
import 'swiper/css'

class RelatedArticles extends HTMLElement {
  constructor() {
    super()
  }
  connectedCallback() {
    const swiper = new Swiper(this.querySelector('.related-article-js'), {
      // Optional parameters
      slidesPerView: 1.2,
      freeMode: true,
      spaceBetween: 16,
      modules: [Navigation],
      loop: true,
      navigation: {
        nextEl: '.swiper-article-next',
        prevEl: '.swiper-article-prev',
      },
      breakpoints: {
        768: {
          slidesPerView: 2.7,
          spaceBetween: 32,
        },
        1110: {
          slidesPerView: 3,
          spaceBetween: 32,
        },
      },
    })
  }
}
customElements.define('related-articles', RelatedArticles)
