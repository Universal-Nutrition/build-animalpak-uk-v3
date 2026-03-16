import { Swiper, Navigation } from 'swiper';
import 'swiper/css';

class FeaturedBlog extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        const swiper = new Swiper(this, {
            // Optional parameters
            slidesPerView: 1.2,
            freeMode: true,
            spaceBetween: 16,
            modules: [Navigation],
            loop: true,
            navigation: {
                nextEl: '.swiper-article-next',
                prevEl: '.swiper-article-prev'
            },
            breakpoints: {
                1024: {
                  slidesPerView: 2.2,
                  spaceBetween: 32
                }
              }
        });
    }
}
if (!customElements.get('featured-blog')) customElements.define('featured-blog', FeaturedBlog);