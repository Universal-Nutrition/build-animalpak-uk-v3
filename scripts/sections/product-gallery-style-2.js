import { Swiper, Thumbs, Pagination } from "swiper";

import 'swiper/css/bundle';


class ProductGallery2 extends HTMLElement {
	constructor() {
		super(); 
	}

    connectedCallback() {
        var ThumbnailSlider = new Swiper(document.querySelector('thumbnail-slider-style-2'), {
            loop: false,
            spaceBetween: 10,
            slidesPerView: 6,
            freeMode: true,
            direction: 'vertical'
            
          });

        var ProductGallery = new Swiper(this, {
            loop: false,
            autoHeight: true,
            spaceBetween: 10,
            slidesPerView: 1,
            modules: [Thumbs, Pagination],
            thumbs: {
                swiper: ThumbnailSlider,
            },
            pagination: {
                el: ".swiper-pagination",
              },
          });
   
    }
}


if (!customElements.get('product-gallery-style-2')) customElements.define('product-gallery-style-2', ProductGallery2);

