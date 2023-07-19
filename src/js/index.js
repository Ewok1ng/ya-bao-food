import { mainSlider } from './modules/mainSlider';

// header
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.scrollY > header.offsetTop) {
        header.style.boxShadow = '0px 4px 24px 0px rgba(0, 0, 0, 0.26)';
    } else {
        header.style.boxShadow = '';
    }
});

// main-slider section
mainSlider();
