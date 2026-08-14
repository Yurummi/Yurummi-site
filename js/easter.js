/**
 * easter.js — Пасхалки сайта.
 *   1. Дождь из коробок 📦 (5× клик на слово "коробки" в секции Обо мне)
 *   2. Режим seppuku (скрытая кнопка ! внизу страницы)
 */

(function () {
    'use strict';

    // ==========================================
    // ПАСХАЛКА 1: Дождь из коробок
    // ==========================================
    var secretBox   = document.getElementById('secret-box');
    var boxClicks   = 0;
    var rainActive  = false; // защита от спама

    if (secretBox) {
        secretBox.addEventListener('click', function (e) {
            e.preventDefault();

            boxClicks++;

            // Встряхиваем слово при каждом клике
            secretBox.style.transform = 'translateX(' + (boxClicks % 2 === 0 ? 4 : -4) + 'px)';
            setTimeout(function () { secretBox.style.transform = 'none'; }, 100);

            // Запускаем дождь на 5-м клике
            if (boxClicks >= 5 && !rainActive) {
                rainActive = true;
                startBoxRain();
                // Сбрасываем счётчик после окончания дождя (~6с)
                setTimeout(function () {
                    boxClicks  = 0;
                    rainActive = false;
                }, 6000);
            }
        });
    }

    function startBoxRain() {
        for (var i = 0; i < 40; i++) {
            setTimeout((function () {
                var box = document.createElement('div');
                box.textContent = '📦';
                box.className   = 'falling-box';
                box.style.left  = Math.random() * 100 + 'vw';
                box.style.animationDuration = (Math.random() * 2 + 2) + 's';
                document.body.appendChild(box);
                setTimeout(function () { box.remove(); }, 5000);
            }), i * 100);
        }
    }

    // ==========================================
    // ПАСХАЛКА 2: Режим seppuku
    // ==========================================
    var seppukuBtn = document.getElementById('seppuku-btn');

    if (seppukuBtn) {
        seppukuBtn.addEventListener('click', function () {
            document.body.classList.add('seppuku-mode');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

}());
