/**
 * slider.js — Автоматический слайдер с пагинацией и бейджами.
 * Зависит от: data.js (SLIDES_DATA)
 */

(function () {
    'use strict';

    const TIME_PER_SLIDE = 12000; // мс между переключениями

    const sliderEl   = document.getElementById('slider');
    const badgesEl   = document.getElementById('badges-layer');
    const pagEl      = document.getElementById('pagination');

    if (!sliderEl || !badgesEl || !pagEl || !SLIDES_DATA || SLIDES_DATA.length === 0) return;

    let currentIndex = 0;
    const slides  = [];
    const dots    = [];
    const badges  = [];

    // --- Построение слайдов ---
    SLIDES_DATA.forEach(function (item, index) {
        // Слайд
        const slide = document.createElement('div');
        slide.className = 'slide' + (index === 0 ? ' active' : '');
        if (item.url) {
            slide.classList.add('clickable');
            slide.addEventListener('click', function () { window.open(item.url, '_blank'); });
        }

        const blurBg = document.createElement('div');
        blurBg.className = 'slide-blur-bg';
        blurBg.style.backgroundImage = "url('" + item.file + "')";
        slide.appendChild(blurBg);

        const mainImg = document.createElement('div');
        mainImg.className = 'slide-main-img';
        mainImg.style.backgroundImage = "url('" + item.file + "')";
        slide.appendChild(mainImg);

        if (item.textMain || item.textAuthor) {
            const caption = document.createElement('div');
            caption.className = 'caption-panel';
            let html = '';
            if (item.textMain) {
                html += '<div class="caption-title">' + item.textMain + '</div>';
            }
            if (item.textAuthor) {
                const prefix = item.textAuthor.includes('@') ? '🎨 Автор:' : '💡';
                html += '<div class="caption-author">' + prefix + ' <span>' + item.textAuthor + '</span></div>';
            }
            caption.innerHTML = html;
            slide.appendChild(caption);
        }

        sliderEl.appendChild(slide);
        slides.push(slide);

        // Бейдж
        const badgeWrapper = document.createElement('div');
        badgeWrapper.className = 'badge-wrapper' + (index === 0 ? ' active' : '');
        if (item.badgeStyle !== 'none') {
            const badgeInner = document.createElement('div');
            badgeInner.className = 'badge ' + item.badgeStyle;
            badgeInner.textContent = item.badgeText;
            badgeWrapper.appendChild(badgeInner);
        }
        badgesEl.appendChild(badgeWrapper);
        badges.push(badgeWrapper);

        // Точка пагинации
        const dot = document.createElement('div');
        dot.className = 'dot' + (index === 0 ? ' active' : '');
        dot.addEventListener('click', function () { goToSlide(index); });
        pagEl.appendChild(dot);
        dots.push(dot);
    });

    // --- Логика переключения ---
    let slideInterval = setInterval(nextSlide, TIME_PER_SLIDE);

    function goToSlide(index) {
        if (index === currentIndex) return;

        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        badges[currentIndex].classList.remove('active');

        currentIndex = index;

        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
        badges[currentIndex].classList.add('active');

        // Сбрасываем таймер при ручном переключении
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, TIME_PER_SLIDE);
    }

    function nextSlide() {
        goToSlide((currentIndex + 1) % SLIDES_DATA.length);
    }
}());
