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
    const lightboxCaption = document.getElementById('lightbox-caption');

    const img       = element.querySelector('img');
    const h3        = element.querySelector('h3');
    const p         = element.querySelector('p');
    const musicLink = element.getAttribute('data-music');

    const title    = _escapeHtml(h3 ? h3.innerText : '');
    const subtitle = _escapeHtml(p  ? p.innerText  : '');

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';

    if (musicLink) {
        lightboxCaption.innerHTML =
            '<strong>' + title + '</strong><br>' + subtitle +
            '<br><span class="music-hint">🎵 псс... кликни по самой картинке!</span>';
        lightboxImg.classList.add('clickable-art');
        lightboxImg.onclick = function (event) {
            event.stopPropagation();
            window.open(musicLink, '_blank');
        };
    } else {
        lightboxCaption.innerHTML = '<strong>' + title + '</strong><br>' + subtitle;
        lightboxImg.classList.remove('clickable-art');
        lightboxImg.onclick = null;
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
        const lightbox    = document.getElementById('myLightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
        lightboxImg.onclick = null;
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
