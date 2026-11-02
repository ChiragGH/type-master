/* ============================================= */
/* TRAINING.JS — Side-Scroll Stickman Combat      */
/* Words are enemies. Slash them with your sword.  */
/* ============================================= */

const Training = (() => {
    const CHAPTER_LESSONS = {
        1: [
            { title: 'Home Row: Left Hand', desc: 'Learn A, S, D, F keys', type: 'training', keys: ['a','s','d','f'], targetWPM: 15 },
            { title: 'Home Row: Right Hand', desc: 'Learn J, K, L keys', type: 'training', keys: ['j','k','l'], targetWPM: 15 },
            { title: 'Home Row Combined', desc: 'Use both hands together', type: 'training', keys: ['a','s','d','f','j','k','l'], targetWPM: 20 },
            { title: 'Speed Drill: Home Row', desc: 'Build speed with home row keys', type: 'drill', keys: ['a','s','d','f','j','k','l'], targetWPM: 25 },
            { title: '⚔️ Boss: Slime Sentinel', desc: 'Defeat the guardian!', type: 'boss', keys: ['a','s','d','f','j','k','l'], targetWPM: 20 }
        ],
        2: [
            { title: 'Adding G and H', desc: 'Extend home row reach', type: 'training', keys: ['a','s','d','f','g','h','j','k','l'], targetWPM: 20 },
            { title: 'Full Home Row Flow', desc: 'Smooth typing across all home keys', type: 'training', keys: ['a','s','d','f','g','h','j','k','l'], targetWPM: 25 },
            { title: 'Speed Drill: Full Home', desc: 'Push your home row speed', type: 'drill', keys: ['a','s','d','f','g','h','j','k','l'], targetWPM: 30 },
            { title: '⚔️ Boss: Shadow Stalker', desc: 'Face the phantom!', type: 'boss', keys: ['a','s','d','f','g','h','j','k','l'], targetWPM: 25 }
        ],
        3: [
            { title: 'Top Row: Left Side', desc: 'Learn Q, W, E, R, T', type: 'training', keys: ['q','w','e','r','t','a','s','d','f','g'], targetWPM: 20 },
            { title: 'Top Row: Right Side', desc: 'Learn Y, U, I, O, P', type: 'training', keys: ['y','u','i','o','p','h','j','k','l'], targetWPM: 20 },
            { title: 'Top + Home Row Mixed', desc: 'Combine top and home rows', type: 'training', keys: ['q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l'], targetWPM: 25 },
            { title: 'Speed Drill: Two Rows', desc: 'Build fluency across rows', type: 'drill', keys: ['q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l'], targetWPM: 30 },
            { title: '⚔️ Boss: Crystal Golem', desc: 'Shatter the crystal warden!', type: 'boss', keys: ['q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l'], targetWPM: 25 }
        ],
        4: [
            { title: 'Bottom Row: Left Side', desc: 'Learn Z, X, C, V, B', type: 'training', keys: ['z','x','c','v','b','a','s','d','f'], targetWPM: 20 },
            { title: 'Bottom Row: Right Side', desc: 'Learn N, M, comma, period', type: 'training', keys: ['n','m','h','j','k','l'], targetWPM: 20 },
            { title: 'Full Keyboard Letters', desc: 'All three rows combined', type: 'training', keys: 'abcdefghijklmnopqrstuvwxyz'.split(''), targetWPM: 25 },
            { title: 'Speed Drill: Full Alpha', desc: 'Master the full alphabet', type: 'drill', keys: 'abcdefghijklmnopqrstuvwxyz'.split(''), targetWPM: 30 },
            { title: '⚔️ Boss: Venom Drake', desc: 'Slay the serpent!', type: 'boss', keys: 'abcdefghijklmnopqrstuvwxyz'.split(''), targetWPM: 25 }
        ],
        5: [
            { title: 'Speed Challenge: Common Words', desc: 'Type everyday words at speed', type: 'training', keys: 'abcdefghijklmnopqrstuvwxyz'.split(''), targetWPM: 35 },
            { title: 'Speed Challenge: Long Words', desc: 'Handle complex words', type: 'training', keys: 'abcdefghijklmnopqrstuvwxyz'.split(''), targetWPM: 35 },
            { title: 'Endurance Drill', desc: 'Maintain speed over longer sessions', type: 'drill', keys: 'abcdefghijklmnopqrstuvwxyz'.split(''), targetWPM: 40 },
            { title: '⚔️ Boss: Cyber Overlord', desc: 'Override the system!', type: 'boss', keys: 'abcdefghijklmnopqrstuvwxyz'.split(''), targetWPM: 35 }
        ],
        6: [
            { title: 'Number Row', desc: 'Learn 1-0 on the top row', type: 'training', keys: '1234567890abcdefghijklmnopqrstuvwxyz'.split(''), targetWPM: 25 },
            { title: 'Numbers + Letters Mixed', desc: 'Combine numbers with words', type: 'training', keys: '1234567890abcdefghijklmnopqrstuvwxyz'.split(''), targetWPM: 30 },
            { title: 'Ultimate Speed Drill', desc: 'The final test of speed', type: 'drill', keys: '1234567890abcdefghijklmnopqrstuvwxyz'.split(''), targetWPM: 40 },
            { title: '⚔️ FINAL BOSS: The Architect', desc: 'Face the creator!', type: 'boss', keys: '1234567890abcdefghijklmnopqrstuvwxyz'.split(''), targetWPM: 35 }
        ]
    };

    // ─── State ─────────────────────────────────────
    let active = false;
    let currentChapter = 1;
    let currentLessonIndex = 0;
    let currentLesson = null;
    let words = [];
    let currentWordIndex = 0;
    let currentCharIndex = 0;
    let correctChars = 0;
    let totalKeystrokes = 0;
    let combo = 0;
    let maxCombo = 0;
    let wordsCompleted = 0;

    // ─── WPM Tracking (fixed — only active typing time) ──
    let firstKeypressTime = 0;
    let lastKeypressTime = 0;
    let activeTypingMs = 0;        // net active typing time
    let lastCharTimestamp = 0;     // timestamp of last character typed
    const IDLE_THRESHOLD = 2500;   // gaps > 2.5s don't count

    // ─── Canvas ────────────────────────────────────
    let canvas = null;
    let ctx = null;
    let animFrame = null;
    let time = 0;
    let dt = 0;
    let lastTime = 0;

    // ─── Scroll / Journey ──────────────────────────
    let scrollOffset = 0;
    let targetScroll = 0;
    let journeyProgress = 0; // 0..1

    // ─── Stickman Player ───────────────────────────
    const player = {
        x: 0, y: 0,
        state: 'idle',   // idle, run, slash, bigSlash, hurt
        stateTimer: 0,
        runTarget: 0,     // x position to run to
        slashAngle: 0,
        slashProgress: 0,
        legPhase: 0,
        energy: 0,
        trail: []         // afterimage trail for slashes
    };

    // ─── Word Enemy ────────────────────────────────
    const wordEnemy = {
        active: false,
        x: 0, y: 0,
        targetX: 0,
        word: '',
        typed: 0,
        hp: 0, maxHp: 0,
        shakeX: 0, shakeY: 0,
        alpha: 1,
        spawnAnim: 0,      // 0..1 spawn animation progress
        deathAnim: 0,      // 0..1 death animation
        dying: false,
        letters: [],       // per-letter state { char, slashed, slashAnim, offsetY }
        size: 1,           // scale multiplier based on word length
        glowColor: '#ff2255'
    };

    // ─── Effects ───────────────────────────────────
    let slashTrails = [];
    let particles = [];
    let floatingTexts = [];
    let screenShake = { intensity: 0 };
    let screenFlash = { alpha: 0, color: '#fff' };
    let bloodSplats = [];  // persistent ground marks
    let sparks = [];

    // ─── Combo ─────────────────────────────────────
    const COMBO_COLORS = ['#00f0ff', '#ff6600', '#aa00ff', '#ffd700', '#ff0088'];

    function getComboColor() {
        if (combo >= 20) return COMBO_COLORS[4];
        if (combo >= 15) return COMBO_COLORS[3];
        if (combo >= 10) return COMBO_COLORS[2];
        if (combo >= 5) return COMBO_COLORS[1];
        return COMBO_COLORS[0];
    }

    // ─── DOM Refs ──────────────────────────────────
    const promptEl = document.getElementById('training-prompt');
    const hintEl = document.getElementById('training-hint');
    const wpmEl = document.getElementById('training-wpm');
    const accuracyEl = document.getElementById('training-accuracy');
    const comboEl = document.getElementById('training-combo');
    const progressEl = document.getElementById('training-progress');
    const chapterEl = document.getElementById('training-chapter');
    const lessonNameEl = document.getElementById('training-lesson-name');

    /* ═══════════════════════════════════════════════ */
    /*  START / STOP                                   */
    /* ═══════════════════════════════════════════════ */

    function start(chapterId, lessonIndex) {
        currentChapter = chapterId;
        currentLessonIndex = lessonIndex;
        currentLesson = CHAPTER_LESSONS[chapterId][lessonIndex];
        if (!currentLesson) return;

        if (currentLesson.type === 'boss') {
            App.startBattle(chapterId);
            return;
        }

        active = true;
        currentWordIndex = 0;
        currentCharIndex = 0;
        correctChars = 0;
        totalKeystrokes = 0;
        combo = 0;
        maxCombo = 0;
        wordsCompleted = 0;
        firstKeypressTime = 0;
        lastKeypressTime = 0;
        activeTypingMs = 0;
        lastCharTimestamp = 0;

        scrollOffset = 0;
        targetScroll = 0;
        journeyProgress = 0;

        player.state = 'idle';
        player.stateTimer = 0;
        player.energy = 0;
        player.trail = [];
        player.legPhase = 0;
        player.slashAngle = 0;

        wordEnemy.active = false;
        wordEnemy.dying = false;
        slashTrails = [];
        particles = [];
        floatingTexts = [];
        screenShake = { intensity: 0 };
        screenFlash = { alpha: 0, color: '#fff' };
        bloodSplats = [];
        sparks = [];

        words = WordEngine.getTrainingWords(chapterId, lessonIndex, currentLesson.type === 'drill' ? 25 : 15, currentLesson.keys);

        chapterEl.textContent = `Chapter ${chapterId}`;
        lessonNameEl.textContent = currentLesson.title;
        hintEl.textContent = 'Type the highlighted letters to attack!';
        hintEl.style.color = 'var(--text-secondary)';

        KeyboardVisual.render(currentLesson.keys);
        renderWords();
        updateStats();
        highlightNextKey();

        App.showScreen('screen-training');
        initCanvas();

        // Spawn first word enemy after a short delay
        setTimeout(() => {
            if (active) spawnWordEnemy();
        }, 600);
    }

    function stop() {
        active = false;
        destroyCanvas();
        KeyboardVisual.clearHighlights();
    }

    /* ═══════════════════════════════════════════════ */
    /*  CANVAS INIT                                    */
    /* ═══════════════════════════════════════════════ */

    function initCanvas() {
        canvas = document.getElementById('training-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        lastTime = performance.now();
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animFrame = requestAnimationFrame(gameLoop);
    }

    function resizeCanvas() {
        if (!canvas) return;
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        // Position player on the left third
        player.x = canvas.width * 0.25;
        player.y = canvas.height * 0.72;
    }

    function destroyCanvas() {
        if (animFrame) cancelAnimationFrame(animFrame);
        window.removeEventListener('resize', resizeCanvas);
    }

    /* ═══════════════════════════════════════════════ */
    /*  MAIN GAME LOOP                                 */
    /* ═══════════════════════════════════════════════ */

    function gameLoop(timestamp) {
        if (!active) return;

        dt = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;
        time = timestamp / 1000;

        const W = canvas.width;
        const H = canvas.height;

        // ── Apply screen shake ──
        ctx.save();
        if (screenShake.intensity > 0) {
            ctx.translate(
                (Math.random() - 0.5) * screenShake.intensity * 2,
                (Math.random() - 0.5) * screenShake.intensity * 2
            );
            screenShake.intensity *= 0.88;
            if (screenShake.intensity < 0.2) screenShake.intensity = 0;
        }

        // ── Draw everything ──
        drawBackground(W, H);
        drawGround(W, H);
        drawBloodSplats(W, H);
        updateWordEnemy(W, H);
        drawWordEnemy(W, H);
        updatePlayer(W, H);
        drawPlayer(W, H);
        updateSlashTrails();
        drawSlashTrails();
        updateParticles();
        drawParticles();
        updateSparks();
        drawSparks();
        updateFloatingTexts();
        drawFloatingTexts();

        // ── Screen flash ──
        if (screenFlash.alpha > 0) {
            ctx.globalAlpha = screenFlash.alpha;
            ctx.fillStyle = screenFlash.color;
            ctx.fillRect(-20, -20, W + 40, H + 40);
            ctx.globalAlpha = 1;
            screenFlash.alpha -= 0.06;
            if (screenFlash.alpha < 0) screenFlash.alpha = 0;
        }

        // ── Smooth scroll ──
        scrollOffset += (targetScroll - scrollOffset) * 0.05;

        ctx.restore();

        animFrame = requestAnimationFrame(gameLoop);
    }

    /* ═══════════════════════════════════════════════ */
    /*  BACKGROUND — Parallax Cyberpunk City           */
    /* ═══════════════════════════════════════════════ */

    function drawBackground(W, H) {
        // Sky gradient — solid, no flicker
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#030610');
        sky.addColorStop(0.4, '#0a0e28');
        sky.addColorStop(0.7, '#0d1235');
        sky.addColorStop(1, '#060a1a');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        // ── Stars ──
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const sx = ((i * 173.7 + scrollOffset * 0.02) % (W + 20)) - 10;
            const sy = (i * 83.1) % (H * 0.45);
            const twinkle = Math.sin(time * 1.5 + i * 1.3) * 0.5 + 0.5;
            ctx.globalAlpha = twinkle * 0.35;
            ctx.beginPath();
            ctx.arc(sx, sy, 0.5 + twinkle * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // ── Distant city skyline (parallax layer 1) ──
        const cityOffset = scrollOffset * 0.03;
        ctx.fillStyle = '#0c1025';
        const baseY = H * 0.5;
        for (let i = 0; i < 20; i++) {
            const bx = (i * 80 - cityOffset) % (W + 160) - 80;
            const bh = 30 + Math.sin(i * 2.7) * 40 + Math.cos(i * 1.3) * 20;
            const bw = 25 + (i % 3) * 15;
            ctx.fillRect(bx, baseY - bh, bw, bh + 5);
            // Window lights
            ctx.fillStyle = `rgba(0, 240, 255, ${0.15 + Math.sin(time + i) * 0.1})`;
            for (let wy = baseY - bh + 8; wy < baseY - 5; wy += 12) {
                for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) {
                    if (Math.sin(i * 3 + wy * 0.1 + wx * 0.05) > 0.2) {
                        ctx.fillRect(wx, wy, 3, 4);
                    }
                }
            }
            ctx.fillStyle = '#0c1025';
        }

        // ── Mid-ground buildings (parallax layer 2) ──
        const midOffset = scrollOffset * 0.08;
        ctx.fillStyle = '#080c1e';
        const midY = H * 0.58;
        for (let i = 0; i < 15; i++) {
            const bx = (i * 110 - midOffset) % (W + 220) - 110;
            const bh = 50 + Math.sin(i * 1.8) * 60 + Math.cos(i * 3.1) * 30;
            const bw = 40 + (i % 4) * 20;
            ctx.fillRect(bx, midY - bh, bw, bh + 5);
        }

        // ── Ambient glow ──
        const comboGlow = ctx.createRadialGradient(W * 0.5, H * 0.7, 10, W * 0.5, H * 0.7, W * 0.5);
        comboGlow.addColorStop(0, `rgba(0, 240, 255, ${0.02 + (combo >= 5 ? 0.03 : 0)})`);
        comboGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = comboGlow;
        ctx.fillRect(0, 0, W, H);
    }

    function drawGround(W, H) {
        const groundY = H * 0.78;
        const groundOffset = scrollOffset * 0.5;

        // Ground surface
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
        groundGrad.addColorStop(0, '#0a0f22');
        groundGrad.addColorStop(0.3, '#070b18');
        groundGrad.addColorStop(1, '#040610');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY, W, H - groundY);

        // Ground line
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();

        // Scrolling ground marks
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 30; i++) {
            const x = ((i * 60 - groundOffset) % (W + 60)) - 30;
            ctx.beginPath();
            ctx.moveTo(x, groundY + 3);
            ctx.lineTo(x, groundY + 8 + (i % 3) * 5);
            ctx.stroke();
        }

        // Ground glow at player feet
        const feetGlow = ctx.createRadialGradient(player.x, groundY, 0, player.x, groundY, 60);
        feetGlow.addColorStop(0, `rgba(0, 240, 255, 0.06)`);
        feetGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = feetGlow;
        ctx.fillRect(player.x - 60, groundY - 5, 120, 20);
    }

    function drawBloodSplats(W, H) {
        bloodSplats = bloodSplats.filter(s => {
            s.alpha -= 0.001;
            if (s.alpha <= 0) return false;
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.ellipse(s.x - scrollOffset * 0.5, s.y, s.w, s.h, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            return true;
        });
    }

    /* ═══════════════════════════════════════════════ */
    /*  STICKMAN PLAYER                                */
    /* ═══════════════════════════════════════════════ */

    function updatePlayer(W, H) {
        // State timer
        if (player.stateTimer > 0) {
            player.stateTimer -= dt;
            if (player.stateTimer <= 0) {
                player.state = 'idle';
            }
        }

        // Leg animation when running
        if (player.state === 'run') {
            player.legPhase += dt * 12;
        } else {
            player.legPhase += dt * 1.5; // subtle idle sway
        }
    }

    function drawPlayer(W, H) {
        ctx.save();
        const px = player.x;
        const py = player.y;
        const s = Math.min(W, H) * 0.0022; // scale
        const breathe = Math.sin(time * 2) * 1.5;

        // ── Calculate animation offsets ──
        let bodyLean = 0;
        let armAngle = -0.4;     // sword arm angle
        let offArmAngle = 0.4;   // off-hand angle
        let bodyOffsetX = 0;
        let bodyOffsetY = 0;

        if (player.state === 'slash') {
            const t = 1 - player.stateTimer / 0.25;
            armAngle = -0.4 + Utils.easeOutCubic(Math.min(t * 2, 1)) * 3.0;
            bodyLean = Math.sin(t * Math.PI) * 0.15;
            bodyOffsetX = Math.sin(t * Math.PI) * 15 * s;
        } else if (player.state === 'bigSlash') {
            const t = 1 - player.stateTimer / 0.4;
            armAngle = -0.4 + Math.sin(t * Math.PI * 2) * 3.5;
            bodyLean = Math.sin(t * Math.PI) * 0.25;
            bodyOffsetX = Math.sin(t * Math.PI) * 25 * s;
            bodyOffsetY = -Math.sin(t * Math.PI) * 10 * s;
        } else if (player.state === 'hurt') {
            bodyOffsetX = Math.sin(player.stateTimer * 30) * 4 * s;
        }

        ctx.translate(px + bodyOffsetX, py + breathe + bodyOffsetY);

        // ── Ground shadow ──
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 2 * s, 18 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // ── Combo aura ──
        if (combo >= 5) {
            const auraColor = getComboColor();
            ctx.globalAlpha = 0.08 + Math.sin(time * 4) * 0.04;
            ctx.fillStyle = auraColor;
            ctx.shadowColor = auraColor;
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(0, -30 * s, 45 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        // ── Scale and lean ──
        ctx.scale(s, s);
        ctx.rotate(bodyLean);

        const lineW = 3;
        const jointR = 3.5;
        const headR = 12;
        const bodyCol = combo >= 10 ? getComboColor() : '#e0e8ff';
        const swordCol = combo >= 5 ? getComboColor() : '#c0d0ff';

        // ── Legs ──
        const legSwing = Math.sin(player.legPhase) * (player.state === 'run' ? 25 : 5);
        ctx.strokeStyle = bodyCol;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round';

        // Left leg: hip → knee → foot
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        const lKneeX = -8 + Math.sin(player.legPhase) * 5;
        const lKneeY = 22;
        ctx.lineTo(lKneeX, lKneeY);
        ctx.lineTo(lKneeX - 3 + legSwing * 0.3, 44);
        ctx.stroke();

        // Right leg
        ctx.beginPath();
        ctx.moveTo(3, 0);
        const rKneeX = 8 - Math.sin(player.legPhase) * 5;
        const rKneeY = 22;
        ctx.lineTo(rKneeX, rKneeY);
        ctx.lineTo(rKneeX + 3 - legSwing * 0.3, 44);
        ctx.stroke();

        // ── Body (torso) ──
        ctx.beginPath();
        ctx.moveTo(0, 0);   // hip
        ctx.lineTo(0, -40); // shoulder
        ctx.stroke();

        // ── Off-hand arm (left, behind) ──
        ctx.beginPath();
        ctx.moveTo(-2, -38);
        const offElbowX = -15 + Math.sin(offArmAngle) * 5;
        const offElbowY = -25;
        ctx.lineTo(offElbowX, offElbowY);
        ctx.lineTo(offElbowX - 5, -12);
        ctx.stroke();

        // ── Sword arm (right) ──
        ctx.save();
        ctx.translate(2, -38); // shoulder
        ctx.rotate(armAngle);

        // Upper arm
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(18, 8);
        ctx.stroke();

        // Forearm
        ctx.beginPath();
        ctx.moveTo(18, 8);
        ctx.lineTo(28, -5);
        ctx.stroke();

        // ── Sword ──
        const isSlashing = player.state === 'slash' || player.state === 'bigSlash';

        // Handle
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(28, -5);
        ctx.lineTo(33, -10);
        ctx.stroke();

        // Crossguard
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(29, -12);
        ctx.lineTo(37, -8);
        ctx.stroke();

        // Blade
        ctx.strokeStyle = isSlashing ? swordCol : '#d0d8ff';
        ctx.lineWidth = 2.5;
        if (isSlashing) {
            ctx.shadowColor = swordCol;
            ctx.shadowBlur = 15;
        }
        ctx.beginPath();
        ctx.moveTo(33, -10);
        ctx.lineTo(60, -30);
        ctx.stroke();

        // Blade tip glow
        if (isSlashing) {
            ctx.fillStyle = swordCol;
            ctx.beginPath();
            ctx.arc(60, -30, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        ctx.restore(); // sword arm

        // ── Head ──
        ctx.fillStyle = bodyCol;
        ctx.strokeStyle = bodyCol;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -52, headR, 0, Math.PI * 2);
        ctx.fill();

        // Eye (simple dot, facing right)
        ctx.fillStyle = '#080c20';
        ctx.beginPath();
        ctx.arc(5, -54, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Headband
        ctx.strokeStyle = getComboColor();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -54, headR + 1, -0.3, Math.PI + 0.3);
        ctx.stroke();
        // Headband tail
        ctx.strokeStyle = getComboColor();
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-headR, -54);
        ctx.bezierCurveTo(-headR - 10, -50 + Math.sin(time * 4) * 3, -headR - 18, -48, -headR - 22, -44 + Math.sin(time * 3) * 4);
        ctx.stroke();

        // ── Joints ──
        ctx.fillStyle = bodyCol;
        [[-3, 0], [3, 0], [0, -40]].forEach(([jx, jy]) => {
            ctx.beginPath();
            ctx.arc(jx, jy, jointR, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore(); // main transform
    }

    /* ═══════════════════════════════════════════════ */
    /*  WORD ENEMY                                     */
    /* ═══════════════════════════════════════════════ */

    function spawnWordEnemy() {
        if (!active || currentWordIndex >= words.length) return;

        const word = words[currentWordIndex];
        const W = canvas.width;
        const H = canvas.height;

        wordEnemy.active = true;
        wordEnemy.dying = false;
        wordEnemy.word = word;
        wordEnemy.typed = 0;
        wordEnemy.hp = word.length;
        wordEnemy.maxHp = word.length;
        wordEnemy.x = W + 50; // start off-screen right
        wordEnemy.targetX = W * 0.62;
        wordEnemy.y = H * 0.6;
        wordEnemy.shakeX = 0;
        wordEnemy.shakeY = 0;
        wordEnemy.alpha = 1;
        wordEnemy.spawnAnim = 0;
        wordEnemy.deathAnim = 0;
        wordEnemy.size = 0.8 + word.length * 0.05;

        // Per-letter state
        wordEnemy.letters = [...word].map(char => ({
            char,
            slashed: false,
            slashAnim: 0,
            offsetY: 0,
            offsetX: 0
        }));

        // Color based on chapter
        const colors = ['#ff2255', '#aa44ff', '#00ccff', '#ff4400', '#00ff88', '#ffd700'];
        wordEnemy.glowColor = colors[(currentChapter - 1) % colors.length];
    }

    function updateWordEnemy(W, H) {
        if (!wordEnemy.active) return;

        // Spawn animation — slide in from right
        if (wordEnemy.spawnAnim < 1) {
            wordEnemy.spawnAnim += dt * 2.5;
            if (wordEnemy.spawnAnim > 1) wordEnemy.spawnAnim = 1;
            const t = Utils.easeOutCubic(wordEnemy.spawnAnim);
            wordEnemy.x = Utils.lerp(W + 50, wordEnemy.targetX, t);
        }

        // Death animation
        if (wordEnemy.dying) {
            wordEnemy.deathAnim += dt * 3;
            wordEnemy.alpha = 1 - wordEnemy.deathAnim;
            if (wordEnemy.deathAnim >= 1) {
                wordEnemy.active = false;
                wordEnemy.dying = false;
                // Next word
                currentWordIndex++;
                currentCharIndex = 0;
                if (currentWordIndex >= words.length) {
                    finishLesson();
                } else {
                    renderWords();
                    highlightNextKey();
                    updateStats();
                    hintEl.textContent = '';
                    hintEl.style.color = '';
                    // Spawn next enemy after brief pause
                    setTimeout(() => {
                        if (active) spawnWordEnemy();
                    }, 350);
                }
                return;
            }
        }

        // Shake decay
        wordEnemy.shakeX *= 0.85;
        wordEnemy.shakeY *= 0.85;

        // Letter slash animations
        wordEnemy.letters.forEach(l => {
            if (l.slashed && l.slashAnim < 1) {
                l.slashAnim += dt * 5;
                l.offsetY += dt * 40; // letters fall when slashed
            }
        });
    }

    function drawWordEnemy(W, H) {
        if (!wordEnemy.active) return;

        ctx.save();

        const ex = wordEnemy.x + wordEnemy.shakeX;
        const ey = wordEnemy.y + wordEnemy.shakeY;
        const breathe = Math.sin(time * 2) * 3;

        ctx.globalAlpha = wordEnemy.alpha;
        ctx.translate(ex, ey + breathe);

        // ── Enemy body — dark orb with glow ──
        const orbSize = 25 + wordEnemy.word.length * 6;
        const orbGrad = ctx.createRadialGradient(0, -10, 0, 0, -10, orbSize);
        orbGrad.addColorStop(0, Utils.hexToRgba(wordEnemy.glowColor, 0.2));
        orbGrad.addColorStop(0.6, Utils.hexToRgba(wordEnemy.glowColor, 0.08));
        orbGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(0, -10, orbSize, 0, Math.PI * 2);
        ctx.fill();

        // Inner dark core
        ctx.fillStyle = 'rgba(10, 5, 20, 0.6)';
        ctx.beginPath();
        ctx.arc(0, -10, orbSize * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Glow ring
        ctx.strokeStyle = Utils.hexToRgba(wordEnemy.glowColor, 0.3 + Math.sin(time * 3) * 0.1);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -10, orbSize * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        // ── Enemy eyes ──
        const eyeGlow = 0.7 + Math.sin(time * 4) * 0.3;
        ctx.fillStyle = Utils.hexToRgba(wordEnemy.glowColor, eyeGlow);
        ctx.shadowColor = wordEnemy.glowColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(-10, -18, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(10, -18, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // ── Word text on enemy ──
        ctx.font = `bold ${Math.round(18 * wordEnemy.size)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const totalW = ctx.measureText(wordEnemy.word).width;
        let charX = -totalW / 2;

        wordEnemy.letters.forEach((l, i) => {
            const cw = ctx.measureText(l.char).width;
            ctx.save();

            if (l.slashed) {
                // Slashed letter — falls and fades
                ctx.globalAlpha = Math.max(0, 1 - l.slashAnim * 1.5) * wordEnemy.alpha;
                ctx.translate(charX + cw / 2 + l.offsetX, 5 + l.offsetY);
                ctx.rotate(l.slashAnim * (i % 2 === 0 ? 0.5 : -0.5));
                ctx.fillStyle = '#00ff88';
                ctx.fillText(l.char, 0, 0);

                // Slash line through letter
                if (l.slashAnim < 0.5) {
                    ctx.strokeStyle = getComboColor();
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-cw, -10);
                    ctx.lineTo(cw, 10);
                    ctx.stroke();
                }
            } else if (i === wordEnemy.typed) {
                // Current target letter — bright white pulsing
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 12;
                ctx.fillText(l.char, charX + cw / 2, 5);
                // Underline cursor
                ctx.fillStyle = '#00f0ff';
                ctx.fillRect(charX, 18, cw, 2.5);
            } else {
                // Upcoming letter — dim
                ctx.fillStyle = Utils.hexToRgba(wordEnemy.glowColor, 0.7);
                ctx.fillText(l.char, charX + cw / 2, 5);
            }

            ctx.restore();
            charX += cw + 2;
        });

        // ── HP bar ──
        const hpPercent = (wordEnemy.hp - wordEnemy.typed) / wordEnemy.hp;
        const barW = totalW + 20;
        const barH = 4;
        const barX = -barW / 2;
        const barY = -orbSize - 5;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barX, barY, barW, barH);
        const hpColor = hpPercent > 0.5 ? '#00ff88' : hpPercent > 0.25 ? '#ffaa00' : '#ff2255';
        ctx.fillStyle = hpColor;
        ctx.fillRect(barX, barY, barW * Math.max(0, hpPercent), barH);

        ctx.restore();
    }

    /* ═══════════════════════════════════════════════ */
    /*  SLASH EFFECTS                                  */
    /* ═══════════════════════════════════════════════ */

    function spawnSlashTrail(fromX, fromY, toX, toY, color) {
        slashTrails.push({
            fromX, fromY, toX, toY,
            alpha: 1,
            color: color || '#00f0ff',
            width: 3 + (combo >= 10 ? 2 : 0)
        });
        // Spawn sparks along the slash
        const steps = 5;
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            sparks.push({
                x: Utils.lerp(fromX, toX, t) + Utils.randFloat(-5, 5),
                y: Utils.lerp(fromY, toY, t) + Utils.randFloat(-5, 5),
                vx: Utils.randFloat(-3, 3),
                vy: Utils.randFloat(-4, -1),
                size: Utils.randFloat(1, 3),
                alpha: 1,
                color: Utils.randPick([color || '#00f0ff', '#ffffff', '#ffaa00']),
                life: 1
            });
        }
    }

    function updateSlashTrails() {
        slashTrails = slashTrails.filter(s => {
            s.alpha -= 0.07;
            return s.alpha > 0;
        });
    }

    function drawSlashTrails() {
        slashTrails.forEach(s => {
            ctx.save();
            ctx.globalAlpha = s.alpha;
            ctx.strokeStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 15;
            ctx.lineWidth = s.width * s.alpha;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(s.fromX, s.fromY);
            ctx.lineTo(s.toX, s.toY);
            ctx.stroke();
            // Inner bright line
            ctx.globalAlpha = s.alpha * 0.5;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = s.width * s.alpha * 0.3;
            ctx.beginPath();
            ctx.moveTo(s.fromX, s.fromY);
            ctx.lineTo(s.toX, s.toY);
            ctx.stroke();
            ctx.restore();
        });
    }

    /* ═══════════════════════════════════════════════ */
    /*  PARTICLES & SPARKS & FLOATING TEXT              */
    /* ═══════════════════════════════════════════════ */

    function spawnParticleBurst(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Utils.randFloat(-0.3, 0.3);
            const speed = Utils.randFloat(2, 8);
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Utils.randFloat(1.5, 4),
                alpha: 1,
                color: color || '#00f0ff',
                life: 1,
                gravity: 0.15
            });
        }
    }

    function updateParticles() {
        particles = particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += (p.gravity || 0.1);
            p.vx *= 0.98;
            p.life -= 0.02;
            p.size *= 0.99;
            return p.life > 0 && p.size > 0.3;
        });
    }

    function drawParticles() {
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life * p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    function updateSparks() {
        sparks = sparks.filter(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.08;
            s.life -= 0.03;
            return s.life > 0;
        });
    }

    function drawSparks() {
        sparks.forEach(s => {
            ctx.save();
            ctx.globalAlpha = s.life;
            ctx.fillStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    function spawnFloatingText(text, color, x, y, size) {
        floatingTexts.push({ text, color, x, y, size: size || 18, vy: -2.5, alpha: 1 });
    }

    function updateFloatingTexts() {
        floatingTexts = floatingTexts.filter(ft => {
            ft.y += ft.vy;
            ft.alpha -= 0.02;
            return ft.alpha > 0;
        });
    }

    function drawFloatingTexts() {
        floatingTexts.forEach(ft => {
            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.font = `bold ${ft.size}px 'Orbitron', sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = ft.color;
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 10;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        });
    }

    /* ═══════════════════════════════════════════════ */
    /*  COMBAT ACTIONS (triggered by typing)           */
    /* ═══════════════════════════════════════════════ */

    function onCorrectChar() {
        player.energy = Math.min(player.energy + 0.5, 15);

        // Stickman slash animation
        player.state = 'slash';
        player.stateTimer = 0.25;

        if (canvas && wordEnemy.active) {
            const color = getComboColor();

            // Slash trail from player sword to the letter
            spawnSlashTrail(
                player.x + 50, player.y - 50,
                wordEnemy.x + Utils.randFloat(-20, 20),
                wordEnemy.y + Utils.randFloat(-10, 15),
                color
            );

            // Mark letter as slashed
            if (wordEnemy.letters[currentCharIndex - 1]) {
                wordEnemy.letters[currentCharIndex - 1].slashed = true;
                wordEnemy.letters[currentCharIndex - 1].offsetX = Utils.randFloat(-3, 3);
            }

            // Enemy recoil
            wordEnemy.shakeX = Utils.randFloat(3, 8);
            wordEnemy.shakeY = Utils.randFloat(-3, 3);

            // Small sparks at impact
            for (let i = 0; i < 4; i++) {
                sparks.push({
                    x: wordEnemy.x + Utils.randFloat(-15, 15),
                    y: wordEnemy.y + Utils.randFloat(-10, 10),
                    vx: Utils.randFloat(-3, 3),
                    vy: Utils.randFloat(-4, -1),
                    size: Utils.randFloat(1.5, 3),
                    alpha: 1,
                    color: Utils.randPick([color, '#ffffff']),
                    life: 0.7
                });
            }

            screenShake.intensity = 2;
        }
    }

    function onWordComplete() {
        const color = getComboColor();
        const isCritical = combo >= 10;

        // Big slash animation
        player.state = 'bigSlash';
        player.stateTimer = 0.4;

        if (canvas && wordEnemy.active) {
            // Death the enemy
            wordEnemy.dying = true;

            // Big particle burst at enemy position
            spawnParticleBurst(wordEnemy.x, wordEnemy.y, isCritical ? 25 : 15, color);

            // Multiple slash trails (fan pattern)
            for (let i = 0; i < (isCritical ? 5 : 3); i++) {
                spawnSlashTrail(
                    player.x + 40, player.y - 40 + i * 10,
                    wordEnemy.x + Utils.randFloat(-30, 30),
                    wordEnemy.y + Utils.randFloat(-30, 20),
                    color
                );
            }

            // Floating combo text
            let comboText = `+${combo}`;
            let textSize = 16;
            if (combo >= 20) { comboText = `💀 x${combo}!`; textSize = 26; }
            else if (combo >= 15) { comboText = `✨ x${combo}!`; textSize = 24; }
            else if (combo >= 10) { comboText = `⚡ x${combo}!`; textSize = 22; }
            else if (combo >= 5) { comboText = `🔥 x${combo}!`; textSize = 20; }
            spawnFloatingText(comboText, color, wordEnemy.x, wordEnemy.y - 50, textSize);

            // Screen effects
            screenShake.intensity = isCritical ? 10 : 5;
            screenFlash = { alpha: isCritical ? 0.2 : 0.1, color };

            // Scroll forward
            targetScroll += 80 + combo * 3;

            // Blood splat on ground
            bloodSplats.push({
                x: wordEnemy.x + scrollOffset * 0.5,
                y: canvas.height * 0.78,
                w: Utils.randFloat(10, 25),
                h: Utils.randFloat(3, 6),
                color: Utils.hexToRgba(wordEnemy.glowColor, 0.15),
                alpha: 0.3
            });
        }
    }

    function onWrongKey() {
        player.state = 'hurt';
        player.stateTimer = 0.3;
        player.energy = Math.max(0, player.energy - 2);
        screenFlash = { alpha: 0.1, color: '#ff2255' };
        screenShake.intensity = 3;

        if (canvas) {
            spawnFloatingText('MISS!', '#ff2255', player.x + 30, player.y - 80, 16);
            for (let i = 0; i < 4; i++) {
                sparks.push({
                    x: player.x + Utils.randFloat(-10, 10),
                    y: player.y + Utils.randFloat(-20, 0),
                    vx: Utils.randFloat(-2, 2),
                    vy: Utils.randFloat(-3, -1),
                    size: Utils.randFloat(2, 4),
                    alpha: 0.8,
                    color: '#ff2255',
                    life: 0.5
                });
            }
        }
    }

    /* ═══════════════════════════════════════════════ */
    /*  WORD RENDERING (DOM — bottom panel)            */
    /* ═══════════════════════════════════════════════ */

    function renderWords() {
        promptEl.innerHTML = '';
        words.forEach((word, wIdx) => {
            const wordEl = document.createElement('span');
            wordEl.classList.add('word');
            if (wIdx === currentWordIndex) wordEl.classList.add('active');
            else if (wIdx < currentWordIndex) wordEl.classList.add('completed');

            [...word].forEach((char, cIdx) => {
                const charEl = document.createElement('span');
                charEl.classList.add('char');
                charEl.textContent = char;
                if (wIdx === currentWordIndex) {
                    if (cIdx < currentCharIndex) charEl.classList.add('correct');
                    else if (cIdx === currentCharIndex) charEl.classList.add('cursor');
                }
                wordEl.appendChild(charEl);
            });
            promptEl.appendChild(wordEl);
        });
    }

    /* ═══════════════════════════════════════════════ */
    /*  KEY HANDLING — BUGS FIXED                      */
    /* ═══════════════════════════════════════════════ */

    function handleKey(e) {
        if (!active) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        if (e.key === 'Escape') {
            stop();
            App.showScreen('screen-lessons');
            return;
        }
        if (e.key.length > 1 && e.key !== 'Backspace') return;

        e.preventDefault();
        e.stopPropagation();

        const now = performance.now();

        // Track WPM timing — only on first actual character
        if (firstKeypressTime === 0 && e.key !== 'Backspace' && e.key !== ' ') {
            firstKeypressTime = now;
            lastCharTimestamp = now;
        }

        const currentWord = words[currentWordIndex];
        if (!currentWord) return;

        // ── Backspace ──
        if (e.key === 'Backspace') {
            if (currentCharIndex > 0) {
                currentCharIndex--;
                // Un-slash the letter in canvas
                if (wordEnemy.active && wordEnemy.letters[currentCharIndex]) {
                    wordEnemy.letters[currentCharIndex].slashed = false;
                    wordEnemy.letters[currentCharIndex].slashAnim = 0;
                    wordEnemy.letters[currentCharIndex].offsetY = 0;
                    wordEnemy.letters[currentCharIndex].offsetX = 0;
                }
                renderWords();
                highlightNextKey();
            }
            return;
        }

        // ── Space — skip (no space needed, auto-advance) ──
        if (e.key === ' ') {
            return; // Words auto-advance when fully typed
        }

        // ── Don't accept after word is done ──
        if (currentCharIndex >= currentWord.length) return;

        // ── Character input ──
        totalKeystrokes++;
        const expectedChar = currentWord[currentCharIndex];

        if (e.key === expectedChar) {
            // ★ CORRECT ★
            correctChars++;
            currentCharIndex++;

            // Track active typing time (exclude idle gaps)
            if (lastCharTimestamp > 0) {
                const gap = now - lastCharTimestamp;
                if (gap < IDLE_THRESHOLD) {
                    activeTypingMs += gap;
                }
            }
            lastCharTimestamp = now;
            lastKeypressTime = now;

            Audio.keyPress();
            KeyboardVisual.flashCorrect(e.key);
            onCorrectChar();

            renderWords();
            highlightNextKey();
            updateStats();

            // ── Check if word is complete ──
            if (currentCharIndex >= currentWord.length) {
                // Word fully typed! Auto-complete — no space needed
                wordsCompleted++;
                combo++;
                if (combo > maxCombo) maxCombo = combo;
                Audio.correctWord();
                onWordComplete();

                // If last word, finish lesson
                if (currentWordIndex >= words.length - 1) {
                    // The word enemy death animation will call finishLesson
                    return;
                }

                // Otherwise, the enemy death animation handles advancing to next word
                hintEl.textContent = '';
                hintEl.style.color = '';
            }
        } else {
            // ★ WRONG KEY ★
            combo = 0;
            Audio.wrongKey();
            KeyboardVisual.flashWrong(e.key);
            onWrongKey();

            // Flash word error
            const wordEls = promptEl.querySelectorAll('.word');
            const activeWordEl = wordEls[currentWordIndex];
            if (activeWordEl) {
                activeWordEl.classList.add('error');
                setTimeout(() => activeWordEl.classList.remove('error'), 300);
            }

            // Flash incorrect char
            const charEls = activeWordEl?.querySelectorAll('.char');
            const cursorChar = charEls?.[currentCharIndex];
            if (cursorChar) {
                cursorChar.classList.add('incorrect');
                setTimeout(() => {
                    cursorChar.classList.remove('incorrect');
                    cursorChar.classList.add('cursor');
                }, 300);
            }

            updateStats();

            hintEl.textContent = `✗ Wrong! Press "${expectedChar.toUpperCase()}"`;
            hintEl.style.color = 'var(--neon-red)';
        }
    }

    function highlightNextKey() {
        const currentWord = words[currentWordIndex];
        if (!currentWord || currentCharIndex >= currentWord.length) {
            KeyboardVisual.clearHighlights();
            return;
        }
        KeyboardVisual.highlightKey(currentWord[currentCharIndex]);
    }

    function updateStats() {
        // ── Fixed WPM: use active typing time only ──
        const typingTime = activeTypingMs > 0 ? activeTypingMs : 0;
        const wpm = Utils.calculateWPM(correctChars, typingTime);
        const accuracy = totalKeystrokes > 0 ? Math.round((correctChars / totalKeystrokes) * 100) : 100;
        const progress = words.length > 0 ? Math.round(((currentWordIndex + (currentCharIndex / (words[currentWordIndex]?.length || 1))) / words.length) * 100) : 0;

        wpmEl.textContent = wpm;
        accuracyEl.textContent = accuracy + '%';
        comboEl.textContent = combo;
        progressEl.style.width = Math.min(100, progress) + '%';

        comboEl.style.color = getComboColor();
        comboEl.style.textShadow = combo >= 5 ? `0 0 10px ${getComboColor()}` : 'none';

        if (accuracy >= 95) accuracyEl.style.color = 'var(--neon-green)';
        else if (accuracy >= 80) accuracyEl.style.color = 'var(--neon-gold)';
        else accuracyEl.style.color = 'var(--neon-red)';
    }

    function finishLesson() {
        active = false;
        destroyCanvas();

        // Use active typing time for final WPM
        const wpm = Utils.calculateWPM(correctChars, activeTypingMs > 0 ? activeTypingMs : 1);
        const accuracy = totalKeystrokes > 0 ? Math.round((correctChars / totalKeystrokes) * 100) : 100;
        const stars = GameState.calculateStars(wpm, accuracy, currentLesson.targetWPM);
        GameState.completeLesson(currentChapter, currentLessonIndex, wpm, accuracy, stars);
        const xp = GameState.calculateXP(wpm, accuracy, wordsCompleted, maxCombo, false);
        const levelResult = GameState.addXP(xp);
        Audio.lessonComplete();

        App.showResults({
            victory: true,
            title: 'LESSON COMPLETE!',
            subtitle: currentLesson.title,
            wpm, accuracy, maxCombo, xp, stars,
            levelsGained: levelResult.levelsGained,
            context: 'training',
            chapterId: currentChapter,
            lessonIndex: currentLessonIndex
        });
    }

    function getLessons(chapterId) { return CHAPTER_LESSONS[chapterId] || []; }
    function isActive() { return active; }

    return { start, handleKey, stop, getLessons, isActive, CHAPTER_LESSONS };
})();
