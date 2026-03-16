import { Swiper, Navigation } from "swiper";

import 'swiper/css/bundle';


class ProductGallery extends HTMLElement {
	constructor() {
		super(); 
	}

    connectedCallback() {
       
        let progress = this.querySelector('.inner-progress')
        let size = +this.dataset.size
        let self = this

        var ProductGallery = new Swiper(this, {
            loop: true,
            autoHeight: true,
            spaceBetween: 10,
            slidesPerView: 1,
            modules: [Navigation],
            navigation: {
                nextEl: '.swiper-product-next',
                prevEl: '.swiper-product-prev',
            },
          });

        window.gallery = ProductGallery
        
        ProductGallery.on( 'slideChange', function(e) {
            setTimeout(() => {
                let index = +self.querySelector('.swiper-slide-active').dataset.index
                let width = self.querySelector('.progress').offsetWidth
                let percent = (100/size * index) / 100
                progress.style.width =  width * percent + 'px'
            });
        })
   
    }
}


if (!customElements.get('product-gallery')) customElements.define('product-gallery', ProductGallery);

