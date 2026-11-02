/* ============================================= */
/* KEYBOARD-VISUAL.JS — On-Screen Keyboard        */
/* ============================================= */

const KeyboardVisual = (() => {
    const container = document.getElementById('keyboard-container');

    // Keyboard layout
    const ROWS = [
        [
            { key: '`', finger: 'pinky-l' }, { key: '1', finger: 'pinky-l' }, { key: '2', finger: 'ring-l' },
            { key: '3', finger: 'middle-l' }, { key: '4', finger: 'index-l' }, { key: '5', finger: 'index-l' },
            { key: '6', finger: 'index-r' }, { key: '7', finger: 'index-r' }, { key: '8', finger: 'middle-r' },
            { key: '9', finger: 'ring-r' }, { key: '0', finger: 'pinky-r' }, { key: '-', finger: 'pinky-r' },
            { key: '=', finger: 'pinky-r' }, { key: 'Back', finger: 'pinky-r', class: 'key-backspace' }
        ],
        [
            { key: 'Tab', finger: 'pinky-l', class: 'key-tab' },
            { key: 'Q', finger: 'pinky-l' }, { key: 'W', finger: 'ring-l' }, { key: 'E', finger: 'middle-l' },
            { key: 'R', finger: 'index-l' }, { key: 'T', finger: 'index-l' }, { key: 'Y', finger: 'index-r' },
            { key: 'U', finger: 'index-r' }, { key: 'I', finger: 'middle-r' }, { key: 'O', finger: 'ring-r' },
            { key: 'P', finger: 'pinky-r' }, { key: '[', finger: 'pinky-r' }, { key: ']', finger: 'pinky-r' },
            { key: '\\', finger: 'pinky-r' }
        ],
        [
            { key: 'Caps', finger: 'pinky-l', class: 'key-caps' },
            { key: 'A', finger: 'pinky-l', home: true }, { key: 'S', finger: 'ring-l', home: true },
            { key: 'D', finger: 'middle-l', home: true }, { key: 'F', finger: 'index-l', home: true },
            { key: 'G', finger: 'index-l' }, { key: 'H', finger: 'index-r' },
            { key: 'J', finger: 'index-r', home: true }, { key: 'K', finger: 'middle-r', home: true },
            { key: 'L', finger: 'ring-r', home: true }, { key: ';', finger: 'pinky-r', home: true },
            { key: "'", finger: 'pinky-r' }, { key: 'Enter', finger: 'pinky-r', class: 'key-enter' }
        ],
        [
            { key: 'Shift', finger: 'pinky-l', class: 'key-shift' },
            { key: 'Z', finger: 'pinky-l' }, { key: 'X', finger: 'ring-l' }, { key: 'C', finger: 'middle-l' },
            { key: 'V', finger: 'index-l' }, { key: 'B', finger: 'index-l' }, { key: 'N', finger: 'index-r' },
            { key: 'M', finger: 'index-r' }, { key: ',', finger: 'middle-r' }, { key: '.', finger: 'ring-r' },
            { key: '/', finger: 'pinky-r' }, { key: 'Shift', finger: 'pinky-r', class: 'key-shift' }
        ],
        [
            { key: 'Space', finger: 'index-r', class: 'key-space' }
        ]
    ];

    // Map key chars to DOM elements
    let keyElements = {};
    let activeZoneKeys = new Set();

    /**
     * Build the keyboard DOM
     */
    function render(zoneKeys = []) {
        container.innerHTML = '';
        keyElements = {};
        activeZoneKeys = new Set(zoneKeys.map(k => k.toUpperCase()));

        ROWS.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.classList.add('keyboard-row');

            row.forEach(keyData => {
                const keyEl = document.createElement('div');
                keyEl.classList.add('key');

                if (keyData.class) keyEl.classList.add(keyData.class);
                keyEl.classList.add(`finger-${keyData.finger}`);

                if (keyData.home) keyEl.classList.add('home-key');

                // Check if key is in the active zone
                const upperKey = keyData.key.toUpperCase();
                if (activeZoneKeys.has(upperKey)) {
                    keyEl.classList.add('in-zone');
                    keyEl.classList.add('show-fingers');
                }

                keyEl.textContent = keyData.key;
                keyEl.dataset.key = keyData.key;

                rowEl.appendChild(keyEl);

                // Store reference (handle special keys)
                const lookupKey = keyData.key.toUpperCase();
                if (!keyElements[lookupKey]) {
                    keyElements[lookupKey] = keyEl;
                }
                // Also store by lowercase
                keyElements[keyData.key.toLowerCase()] = keyEl;
            });

            container.appendChild(rowEl);
        });

        // Add finger guide
        renderFingerGuide();
    }

    /**
     * Render the finger color legend below keyboard
     */
    function renderFingerGuide() {
        const guide = document.createElement('div');
        guide.classList.add('keyboard-finger-guide');

        const fingers = [
            { name: 'L Pinky', color: '#ff6b9d' },
            { name: 'L Ring', color: '#c084fc' },
            { name: 'L Middle', color: '#60a5fa' },
            { name: 'L Index', color: '#34d399' },
            { name: 'R Index', color: '#fbbf24' },
            { name: 'R Middle', color: '#f97316' },
            { name: 'R Ring', color: '#f472b6' },
            { name: 'R Pinky', color: '#a78bfa' }
        ];

        fingers.forEach(f => {
            const label = document.createElement('div');
            label.classList.add('finger-label');
            const dot = document.createElement('span');
            dot.classList.add('finger-dot');
            dot.style.backgroundColor = f.color;
            label.appendChild(dot);
            label.appendChild(document.createTextNode(f.name));
            guide.appendChild(label);
        });

        container.appendChild(guide);
    }

    /**
     * Highlight the target key (the next key to press)
     */
    function highlightKey(key) {
        // Remove previous active highlights
        Object.values(keyElements).forEach(el => {
            el.classList.remove('active-key');
        });

        if (!key) return;

        const upper = key.toUpperCase();
        const el = keyElements[upper] || keyElements[key];
        if (el) {
            el.classList.add('active-key');
        }

        // Also highlight space if key is ' '
        if (key === ' ') {
            const spaceEl = keyElements['SPACE'];
            if (spaceEl) spaceEl.classList.add('active-key');
        }
    }

    /**
     * Flash a key green (correct)
     */
    function flashCorrect(key) {
        const upper = key.toUpperCase();
        const el = keyElements[upper] || keyElements[key];
        if (key === ' ') {
            const spaceEl = keyElements['SPACE'];
            if (spaceEl) flashKey(spaceEl, 'pressed');
            return;
        }
        if (el) flashKey(el, 'pressed');
    }

    /**
     * Flash a key red (wrong)
     */
    function flashWrong(key) {
        const upper = key.toUpperCase();
        const el = keyElements[upper] || keyElements[key];
        if (key === ' ') {
            const spaceEl = keyElements['SPACE'];
            if (spaceEl) flashKey(spaceEl, 'wrong');
            return;
        }
        if (el) flashKey(el, 'wrong');
    }

    function flashKey(el, className) {
        el.classList.add(className);
        setTimeout(() => {
            el.classList.remove(className);
        }, 200);
    }

    /**
     * Clear all highlights
     */
    function clearHighlights() {
        Object.values(keyElements).forEach(el => {
            el.classList.remove('active-key', 'pressed', 'wrong');
        });
    }

    return {
        render,
        highlightKey,
        flashCorrect,
        flashWrong,
        clearHighlights,
        ROWS
    };
})();
