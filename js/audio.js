/* ============================================= */
/* AUDIO.JS — Web Audio API Sound Synthesis       */
/* ============================================= */

const Audio = (() => {
    let ctx = null;
    let enabled = true;
    let masterGain = null;

    function init() {
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = ctx.createGain();
            masterGain.gain.value = 0.3;
            masterGain.connect(ctx.destination);
        } catch (e) {
            console.warn('Web Audio API not supported');
            enabled = false;
        }
    }

    function ensureContext() {
        if (!ctx) init();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
        return enabled && ctx;
    }

    function playTone(freq, duration, type = 'sine', volume = 0.3, delay = 0) {
        if (!ensureContext()) return;
        const t = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + duration);
    }

    function playNoise(duration, volume = 0.1, delay = 0) {
        if (!ensureContext()) return;
        const t = ctx.currentTime + delay;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * volume;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        source.connect(gain);
        gain.connect(masterGain);
        source.start(t);
    }

    return {
        init,

        keyPress() {
            playTone(800, 0.05, 'sine', 0.1);
        },

        correctWord() {
            playTone(523, 0.08, 'sine', 0.2);
            playTone(659, 0.08, 'sine', 0.2, 0.06);
            playTone(784, 0.12, 'sine', 0.15, 0.12);
        },

        wrongKey() {
            playTone(200, 0.15, 'sawtooth', 0.15);
            playNoise(0.08, 0.1);
        },

        comboUp() {
            playTone(660, 0.06, 'square', 0.1);
            playTone(880, 0.06, 'square', 0.1, 0.06);
            playTone(1100, 0.1, 'square', 0.08, 0.12);
        },

        criticalHit() {
            playTone(440, 0.05, 'sawtooth', 0.2);
            playTone(880, 0.05, 'sawtooth', 0.2, 0.05);
            playTone(1760, 0.08, 'sawtooth', 0.15, 0.1);
            playTone(1320, 0.15, 'sine', 0.2, 0.15);
            playNoise(0.1, 0.15, 0.05);
        },

        bossHit() {
            playTone(150, 0.2, 'sawtooth', 0.25);
            playNoise(0.15, 0.2);
        },

        playerHit() {
            playTone(100, 0.3, 'sawtooth', 0.2);
            playTone(80, 0.2, 'square', 0.15, 0.1);
            playNoise(0.2, 0.15);
        },

        phaseTransition() {
            for (let i = 0; i < 6; i++) {
                playTone(200 + i * 150, 0.15, 'sawtooth', 0.12, i * 0.08);
            }
            playNoise(0.5, 0.1, 0.2);
            playTone(1200, 0.4, 'sine', 0.2, 0.5);
        },

        victory() {
            const notes = [523, 659, 784, 1047, 784, 1047, 1319];
            notes.forEach((n, i) => {
                playTone(n, 0.2, 'sine', 0.15, i * 0.12);
                playTone(n * 0.5, 0.2, 'sine', 0.08, i * 0.12);
            });
        },

        defeat() {
            const notes = [400, 350, 300, 250, 200];
            notes.forEach((n, i) => {
                playTone(n, 0.3, 'sawtooth', 0.12, i * 0.15);
            });
        },

        lessonComplete() {
            playTone(523, 0.1, 'sine', 0.15);
            playTone(659, 0.1, 'sine', 0.15, 0.1);
            playTone(784, 0.15, 'sine', 0.15, 0.2);
            playTone(1047, 0.3, 'sine', 0.2, 0.3);
        },

        starEarn() {
            playTone(1047, 0.1, 'sine', 0.2);
            playTone(1319, 0.15, 'sine', 0.15, 0.08);
        },

        menuClick() {
            playTone(600, 0.05, 'sine', 0.08);
        },

        menuHover() {
            playTone(400, 0.03, 'sine', 0.05);
        },

        bossEntrance() {
            playNoise(0.8, 0.15);
            playTone(80, 0.5, 'sawtooth', 0.2, 0.2);
            playTone(100, 0.5, 'sawtooth', 0.2, 0.5);
            playTone(60, 0.8, 'square', 0.15, 0.8);
        },

        wordSpawn() {
            playTone(1200, 0.04, 'sine', 0.05);
        },

        setVolume(v) {
            if (masterGain) masterGain.gain.value = Utils.clamp(v, 0, 1);
        },

        toggle() {
            enabled = !enabled;
            return enabled;
        }
    };
})();
