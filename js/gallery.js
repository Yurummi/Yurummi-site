let lightboxElements = [];
let currentLightboxIndex = 0;

/**
 * gallery.js — Лайтбокс и кнопки "Показать всё / Свернуть".
 *
 * openLightbox() и closeLightbox() остаются глобальными,
 * так как вызываются из атрибутов onclick в HTML.
 */

// --- ЛАЙТБОКС ---

/**
 * Экранирует спецсимволы HTML при вставке текста из DOM через innerHTML.
 */
function _escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Открывает лайтбокс для переданного элемента галереи.
 * @param {HTMLElement} element — .gallery-item
 */
function openLightbox(element) {
    const lightbox        = document.getElementById('myLightbox');
    const lightboxImg     = document.getElementById('lightbox-img');
    const lightboxVideo   = document.getElementById('lightbox-video');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const prevBtn         = document.querySelector('.lightbox-prev');
    const nextBtn         = document.querySelector('.lightbox-next');

    // Find siblings to create a gallery list
    let parent = element.parentElement;
    if (parent) {
        // Find all clickable lightbox items in this container
        let siblings = Array.from(parent.querySelectorAll('[onclick*="openLightbox"]'));
        if (siblings.length < 2 && parent.parentElement) {
             siblings = Array.from(parent.parentElement.querySelectorAll('[onclick*="openLightbox"]'));
        }
        if (siblings.length > 1) {
            lightboxElements = siblings;
            currentLightboxIndex = siblings.indexOf(element);
            if(prevBtn) prevBtn.style.display = 'block';
            if(nextBtn) nextBtn.style.display = 'block';
        } else {
            lightboxElements = [element];
            currentLightboxIndex = 0;
            if(prevBtn) prevBtn.style.display = 'none';
            if(nextBtn) nextBtn.style.display = 'none';
        }
    }

    _showLightboxElement(element);
}

function changeLightboxSlide(event, direction) {
    event.stopPropagation(); // don't close lightbox
    if (lightboxElements.length < 2) return;
    
    currentLightboxIndex += direction;
    if (currentLightboxIndex < 0) currentLightboxIndex = lightboxElements.length - 1;
    if (currentLightboxIndex >= lightboxElements.length) currentLightboxIndex = 0;
    
    _showLightboxElement(lightboxElements[currentLightboxIndex]);
}

function _showLightboxElement(element) {
    const lightbox        = document.getElementById('myLightbox');
    const lightboxImg     = document.getElementById('lightbox-img');
    const lightboxVideo   = document.getElementById('lightbox-video');
    const lightboxCaption = document.getElementById('lightbox-caption');

    const media     = element.querySelector('img') || element.querySelector('video') || element.querySelector('source');
    const h3        = element.querySelector('h3');
    const p         = element.querySelector('p');
    const musicLink = element.getAttribute('data-music');

    const title    = _escapeHtml(h3 ? h3.innerText : '');
    const subtitle = _escapeHtml(p  ? p.innerText  : '');

    // some sources are in picture->source srcset
    let src = element.getAttribute('data-src');
    if (!src && media) {
        if (media.tagName.toLowerCase() === 'source') {
            src = media.srcset || media.src;
        } else {
            src = media.src || media.currentSrc;
        }
    }
    if (!src) src = '';
    
    if (src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm')) {
        lightboxImg.style.display = 'none';
        lightboxVideo.style.display = 'block';
        lightboxVideo.src = element.getAttribute('data-src') || src;
        lightboxVideo.play();
        
        // Для видео обработка клика-ссылки пока отключена, так как видео само может принимать клики
        lightboxVideo.onclick = null;
        lightboxVideo.classList.remove('clickable-art');
    } else {
        lightboxVideo.style.display = 'none';
        lightboxVideo.pause();
        lightboxImg.style.display = 'block';
        lightboxImg.src = element.getAttribute('data-src') || src;
        lightboxImg.alt = media ? media.alt || '' : '';
        
        if (musicLink) {
            lightboxImg.classList.add('clickable-art');
            lightboxImg.onclick = function (event) {
                event.stopPropagation();
                window.open(musicLink, '_blank');
            };
        } else {
            lightboxImg.classList.remove('clickable-art');
            lightboxImg.onclick = null;
        }
    }

    if (musicLink) {
        lightboxCaption.innerHTML =
            '<strong>' + title + '</strong><br>' + subtitle +
            '<br><span class="music-hint">🎵 псс... кликни по самой картинке!</span>';
    } else {
        lightboxCaption.innerHTML = '<strong>' + title + '</strong><br>' + subtitle;
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Закрывает лайтбокс при клике на фон или кнопку ×.
 * @param {MouseEvent} event
 */
function closeLightbox(event) {
    const isBackdrop = event.target.id === 'myLightbox';
    const isClose    = event.target.classList.contains('lightbox-close');

    if (isBackdrop || isClose) {
        const lightbox      = document.getElementById('myLightbox');
        const lightboxImg   = document.getElementById('lightbox-img');
        const lightboxVideo = document.getElementById('lightbox-video');
        
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxImg.onclick = null;
        if (lightboxVideo) {
            lightboxVideo.pause();
        }
    }
}

// --- КЛАВИАТУРА ---

// .gallery-item — это <div role="button">, у которого нет нативной
// активации по Enter/Space, поэтому эмулируем клик вручную.
document.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    const item = event.target.closest('.gallery-item');
    if (!item) return;

    event.preventDefault();
    item.click();
});

// --- КНОПКИ EXPAND / COLLAPSE ---

document.addEventListener('DOMContentLoaded', function () {
    const VISIBLE_LIMIT = 6;

    document.querySelectorAll('.gallery-grid').forEach(function (grid) {
        const items = grid.querySelectorAll('.gallery-item');

        if (items.length <= VISIBLE_LIMIT) return;

        // Скрываем лишние элементы
        for (let i = VISIBLE_LIMIT; i < items.length; i++) {
            items[i].style.display = 'none';
        }

        // Создаём кнопку после сетки
        const btn = document.createElement('button');
        btn.className = 'btn-more-arts';
        btn.textContent = 'Показать все ▼';
        grid.parentNode.insertBefore(btn, grid.nextSibling);

        let isExpanded = false;

        btn.addEventListener('click', function () {
            if (!isExpanded) {
                for (let i = VISIBLE_LIMIT; i < items.length; i++) {
                    items[i].style.display = '';
                }
                btn.textContent = 'Свернуть ▲';
                isExpanded = true;
            } else {
                for (let i = VISIBLE_LIMIT; i < items.length; i++) {
                    items[i].style.display = 'none';
                }
                btn.textContent = 'Показать все ▼';
                isExpanded = false;
                grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
