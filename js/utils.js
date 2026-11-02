/* ============================================= */
/* UTILS.JS — Utility Functions                  */
/* ============================================= */

const Utils = {
    /**
     * Clamp a value between min and max
     */
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    /**
     * Linear interpolation
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * Random integer between min (inclusive) and max (inclusive)
     */
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Random float between min and max
     */
    randFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Pick a random element from an array
     */
    randPick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /**
     * Shuffle an array (Fisher-Yates)
     */
    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    /* ---------- Easing Functions ---------- */

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    },

    easeInCubic(t) {
        return t * t * t;
    },

    easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 :
            Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },

    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    },

    /* ---------- Color Helpers ---------- */

    /**
     * HSL to CSS string
     */
    hsl(h, s, l, a = 1) {
        return a < 1
            ? `hsla(${h}, ${s}%, ${l}%, ${a})`
            : `hsl(${h}, ${s}%, ${l}%)`;
    },

    /**
     * Hex to RGBA
     */
    hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /* ---------- Formatting ---------- */

    /**
     * Format number with commas
     */
    formatNumber(n) {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Format time in MM:SS
     */
    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    },

    /**
     * Calculate WPM from characters typed and elapsed time (ms)
     */
    calculateWPM(charsTyped, elapsedMs) {
        if (elapsedMs <= 0) return 0;
        const minutes = elapsedMs / 60000;
        const words = charsTyped / 5; // Standard: 5 chars = 1 word
        return Math.round(words / minutes);
    },

    /* ---------- DOM Helpers ---------- */

    $(selector) {
        return document.querySelector(selector);
    },

    $$(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * Create element with classes and optional text
     */
    createElement(tag, classes = [], text = '') {
        const el = document.createElement(tag);
        classes.forEach(c => el.classList.add(c));
        if (text) el.textContent = text;
        return el;
    },

    /**
     * Screen shake effect on an element
     */
    screenShake(element, intensity = 5, duration = 300) {
        const start = performance.now();
        const originalTransform = element.style.transform;

        function shake(now) {
            const elapsed = now - start;
            if (elapsed > duration) {
                element.style.transform = originalTransform;
                return;
            }
            const progress = elapsed / duration;
            const currentIntensity = intensity * (1 - progress);
            const x = (Math.random() - 0.5) * 2 * currentIntensity;
            const y = (Math.random() - 0.5) * 2 * currentIntensity;
            element.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(shake);
        }

        requestAnimationFrame(shake);
    },

    /**
     * Flash an element with a color
     */
    flashElement(element, color = '#ff0044', duration = 200) {
        element.style.transition = `background-color ${duration / 2}ms`;
        const original = element.style.backgroundColor;
        element.style.backgroundColor = color;
        setTimeout(() => {
            element.style.backgroundColor = original;
            setTimeout(() => {
                element.style.transition = '';
            }, duration / 2);
        }, duration / 2);
    },

    /**
     * Wait for a duration (promise-based)
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
