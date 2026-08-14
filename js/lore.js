/**
 * lore.js — Интерактивная карта лора (Pan & Zoom).
 * Поддерживает: мышь (перетаскивание + колесо), тач (один палец).
 */

(function () {
    'use strict';

    var loreWindow = document.getElementById('loreWindow');
    var loreCanvas = document.getElementById('loreCanvas');

    if (!loreWindow || !loreCanvas) return;

    var isDragging = false;
    var startX, startY;
    var translateX = 80;
    var translateY = 50;
    var scale      = 1;

    function updateCanvas() {
        // Ограничиваем перемещение
        translateX = Math.min(Math.max(translateX, -1500), 800);
        translateY = Math.min(Math.max(translateY, -800),  800);
        loreCanvas.style.transform =
            'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ')';
    }

    updateCanvas();

    // ==========================================
    // УПРАВЛЕНИЕ МЫШЬЮ (ПК)
    // ==========================================
    loreWindow.addEventListener('mousedown', function (e) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        loreWindow.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        e.preventDefault();
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateCanvas();
    });

    window.addEventListener('mouseup', function () {
        isDragging = false;
        loreWindow.style.cursor = 'grab';
    });

    loreWindow.addEventListener('mouseleave', function () {
        if (!isDragging) loreWindow.style.cursor = 'grab';
    });

    // ==========================================
    // УПРАВЛЕНИЕ ПАЛЬЦЕМ (ТЕЛЕФОНЫ)
    // ==========================================
    loreWindow.addEventListener('touchstart', function (e) {
        isDragging = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
    }, { passive: false });

    window.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        // Только один палец — перетаскивание
        if (e.touches.length === 1) {
            if (e.cancelable) e.preventDefault();
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateCanvas();
        }
    }, { passive: false });

    window.addEventListener('touchend',    function () { isDragging = false; });
    window.addEventListener('touchcancel', function () { isDragging = false; });

    // ==========================================
    // ЗУМ КОЛЕСИКОМ (ПК)
    // ==========================================
    loreWindow.addEventListener('wheel', function (e) {
        e.preventDefault();

        var rect   = loreWindow.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;

        var delta    = e.deltaY > 0 ? -0.15 : 0.15;
        var newScale = Math.min(Math.max(0.4, scale + delta), 2.5);

        if (newScale !== scale) {
            // Масштабируем относительно позиции курсора
            var canvasX = (mouseX - translateX) / scale;
            var canvasY = (mouseY - translateY) / scale;

            scale      = newScale;
            translateX = mouseX - canvasX * scale;
            translateY = mouseY - canvasY * scale;

            updateCanvas();
        }
    }, { passive: false });

}());
