import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';

export function mainSlider() {
    const swiper = new Swiper('.main-slider__slider', {
        modules: [Autoplay],
        autoplay: true,
        speed: 2000,
        loop: true,
        slidesPerView: 1,
        spaceBetween: 20,
    });
}
