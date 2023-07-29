import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

export function moreSlider() {
    const swiper = new Swiper('.more__slider', {
        modules: [Navigation],
        slidesPerView: 3,
        spaceBetween: 15,
        navigation: {
            nextEl: '.more__slider-pagination--next',
            prevEl: '.more__slider-pagination--prev',
        },
    });
}
