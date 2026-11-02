/* ============================================= */
/* BATTLE.JS — Boss Fight Engine (Canvas)         */
/* ============================================= */

const Battle = (() => {
    const canvas = document.getElementById('battle-canvas');
    const ctx = canvas.getContext('2d');

    // DOM refs
    const bossNameEl = document.getElementById('boss-name-plate');
    const bossPhaseEl = document.getElementById('boss-phase');
    const bossHPEl = document.getElementById('boss-hp');
    const playerHPEl = document.getElementById('player-hp');
    const comboEl = document.getElementById('battle-combo');
    const multiplierEl = document.getElementById('battle-multiplier');
    const wpmEl = document.getElementById('battle-wpm');
    const currentWordEl = document.getElementById('battle-current-word');
    const typedEl = document.getElementById('battle-typed');
    const phaseOverlay = document.getElementById('phase-overlay');
    const phaseOverlayText = document.getElementById('phase-overlay-text');

    // Battle state
    let active = false;
    let boss = null;
    let currentPhaseIndex = 0;
    let bossHP = 0;
    let bossMaxHP = 0;
    let playerHP = 0;
    let playerMaxHP = 0;

    // Words
    let wordPool = [];
    let activeWords = [];    // { text, x, y, speed, typed, isPower, color }
    let targetWord = null;
    let typedText = '';

    // Stats
    let combo = 0;
    let maxCombo = 0;
    let multiplier = 1;
    let totalWordsTyped = 0;
    let correctChars = 0;
    let totalChars = 0;
    let startTime = 0;
    let lastSpawnTime = 0;

    // Animation
    let animFrame = null;
    let time = 0;
    let bossX = 0;
    let bossY = 0;
    let bossSize = 80;
    let shakeIntensity = 0;
    let shakeDuration = 0;
    let shakeStart = 0;
    let flashAlpha = 0;
    let flashColor = '#ffffff';
    let bossHurt = 0; // timer for boss hurt animation

    // Damage numbers
    let damageNumbers = [];

    // Context
    let chapterId = 1;

    /**
     * Resize canvas
     */
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        bossX = canvas.width / 2;
        bossY = canvas.height * 0.3;
        bossSize = Math.min(canvas.width, canvas.height) * 0.1;
    }

    /**
     * Start a boss fight
     */
    function start(chapId) {
        chapterId = chapId;
        boss = BossData.getBoss(chapId);
        if (!boss) return;

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Init state
        active = true;
        bossHP = boss.maxHP;
        bossMaxHP = boss.maxHP;
        playerHP = boss.playerMaxHP;
        playerMaxHP = boss.playerMaxHP;
        currentPhaseIndex = 0;
        combo = 0;
        maxCombo = 0;
        multiplier = 1;
        totalWordsTyped = 0;
        correctChars = 0;
        totalChars = 0;
        startTime = performance.now();
        lastSpawnTime = 0;
        activeWords = [];
        targetWord = null;
        typedText = '';
        damageNumbers = [];
        shakeIntensity = 0;
        flashAlpha = 0;
        bossHurt = 0;
        time = 0;

        // Generate word pool
        wordPool = WordEngine.getBossWords(chapterId, 1);

        // Update HUD
        bossNameEl.textContent = boss.name;
        bossPhaseEl.textContent = 'Phase 1';
        updateHUD();

        // Clear particles
        Particles.clear();

        // Start the game loop
        Audio.bossEntrance();
        App.showScreen('screen-battle');

        // Delay start slightly for dramatic effect
        setTimeout(() => {
            animFrame = requestAnimationFrame(gameLoop);
        }, 500);
    }

    /**
     * Main game loop
     */
    function gameLoop(timestamp) {
        if (!active) return;

        time = timestamp / 1000;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        drawBackground();

        // Update ambient particles
        Particles.updateAmbient(ctx, canvas.width, canvas.height);

        // Apply screen shake
        ctx.save();
        if (shakeIntensity > 0) {
            const elapsed = performance.now() - shakeStart;
            if (elapsed < shakeDuration) {
                const progress = elapsed / shakeDuration;
                const currentShake = shakeIntensity * (1 - progress);
                ctx.translate(
                    (Math.random() - 0.5) * 2 * currentShake,
                    (Math.random() - 0.5) * 2 * currentShake
                );
            } else {
                shakeIntensity = 0;
            }
        }

        // Draw boss
        drawBoss();

        // Update and draw words
        updateWords();

        // Draw particles
        Particles.update(ctx);

        // Draw damage numbers
        updateDamageNumbers();

        ctx.restore();

        // Draw flash overlay
        if (flashAlpha > 0) {
            ctx.save();
            ctx.fillStyle = flashColor;
            ctx.globalAlpha = flashAlpha;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
            flashAlpha -= 0.03;
            if (flashAlpha < 0) flashAlpha = 0;
        }

        // Spawn new words
        spawnWords();

        // Update HUD
        updateHUD();

        // Check win/lose
        if (bossHP <= 0) {
            victory();
            return;
        }
        if (playerHP <= 0) {
            defeat();
            return;
        }

        animFrame = requestAnimationFrame(gameLoop);
    }

    /**
     * Draw the dark battle background
     */
    function drawBackground() {
        // Dark gradient
        const grad = ctx.createRadialGradient(
            canvas.width / 2, canvas.height * 0.3, 50,
            canvas.width / 2, canvas.height * 0.3, canvas.height
        );
        grad.addColorStop(0, boss ? Utils.hexToRgba(boss.color, 0.05) : 'rgba(0,240,255,0.05)');
        grad.addColorStop(0.5, 'rgba(10, 14, 39, 0.95)');
        grad.addColorStop(1, 'rgba(5, 8, 22, 1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;
        const gridSize = 60;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Boss arena circle
        ctx.strokeStyle = boss ? Utils.hexToRgba(boss.color, 0.08) : 'rgba(0,240,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bossX, bossY, bossSize * 2.5, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * Draw the boss
     */
    function drawBoss() {
        if (!boss) return;

        const hpPercent = bossHP / bossMaxHP;

        // Boss hurt flash
        ctx.save();
        if (bossHurt > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(bossHurt * 20) * 0.5;
            bossHurt -= 0.016;
            if (bossHurt < 0) bossHurt = 0;
        }

        // Idle hover
        const idleY = bossY + Math.sin(time * 1.5) * 6;

        boss.drawBody(ctx, bossX, idleY, bossSize, time, hpPercent);
        ctx.restore();
    }

    /**
     * Spawn new words
     */
    function spawnWords() {
        const now = performance.now();
        const phaseData = boss.phases[currentPhaseIndex];

        if (now - lastSpawnTime < phaseData.spawnInterval) return;
        if (activeWords.length >= phaseData.maxActiveWords) return;

        lastSpawnTime = now;

        // Pick a word
        const text = WordEngine.getRandomWord(wordPool);

        // Random spawn position (from boss area, different angles)
        const angle = Utils.randFloat(-0.8, 0.8); // Spread below boss
        const startX = bossX + Math.sin(angle) * bossSize * 2;
        const startY = bossY + bossSize * 1.5;

        // Target: bottom center area (player zone)
        const targetY = canvas.height - 120;
        const dx = (canvas.width / 2 - startX) * 0.3;

        // Is this a power word? (rare)
        const isPower = Math.random() < 0.08;

        activeWords.push({
            text: isPower ? text.toUpperCase() : text,
            x: startX,
            y: startY,
            startY,
            targetY,
            vx: dx * 0.003,
            speed: phaseData.wordSpeed * (isPower ? 0.7 : 1),
            typed: 0,
            isPower,
            color: isPower ? '#ffd700' : boss.color,
            alpha: 1,
            alive: true,
            spawnTime: now
        });

        Audio.wordSpawn();
    }

    /**
     * Update and draw floating words
     */
    function updateWords() {
        activeWords = activeWords.filter(word => {
            if (!word.alive) return false;

            // Move word down
            word.y += word.speed;
            word.x += word.vx;

            // Check if word reached the bottom (player hit)
            if (word.y >= word.targetY) {
                // Player takes damage
                const phase = boss.phases[currentPhaseIndex];
                playerHP -= phase.damage;
                if (playerHP < 0) playerHP = 0;

                combo = 0;
                multiplier = 1;

                Audio.playerHit();
                triggerShake(8, 300);
                flashScreen('#ff2255', 0.3);
                Particles.playerDamageEffect(canvas.width / 2, canvas.height - 100);

                // Spawn damage number
                spawnDamageNumber(canvas.width / 2, canvas.height - 130, `-${phase.damage}`, 'player-dmg');

                // If this was the target word, clear it
                if (word === targetWord) {
                    targetWord = null;
                    typedText = '';
                    updateTypingDisplay();
                }

                return false;
            }

            // Draw word
            drawWord(word);
            return true;
        });
    }

    /**
     * Draw a floating word
     */
    function drawWord(word) {
        ctx.save();

        const isTarget = word === targetWord;
        const glowAmount = isTarget ? 15 : 5;

        // Background pill
        const textMetrics = ctx.measureText(word.text);
        ctx.font = `bold ${word.isPower ? 18 : 15}px 'JetBrains Mono', monospace`;
        const textWidth = ctx.measureText(word.text).width;
        const padding = 12;
        const height = word.isPower ? 32 : 28;

        // Pill background
        ctx.fillStyle = isTarget
            ? 'rgba(0, 240, 255, 0.15)'
            : word.isPower
                ? 'rgba(255, 215, 0, 0.12)'
                : 'rgba(10, 14, 39, 0.8)';
        ctx.strokeStyle = isTarget ? '#00f0ff' : word.isPower ? '#ffd700' : Utils.hexToRgba(word.color, 0.5);
        ctx.lineWidth = isTarget ? 2 : 1;

        ctx.shadowColor = isTarget ? '#00f0ff' : word.color;
        ctx.shadowBlur = glowAmount;

        const rx = word.x - textWidth / 2 - padding;
        const ry = word.y - height / 2;
        const rw = textWidth + padding * 2;
        const rh = height;
        const radius = height / 2;

        ctx.beginPath();
        ctx.moveTo(rx + radius, ry);
        ctx.lineTo(rx + rw - radius, ry);
        ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, radius);
        ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, radius);
        ctx.arcTo(rx, ry + rh, rx, ry, radius);
        ctx.arcTo(rx, ry, rx + rw, ry, radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw text with typed chars highlighted
        ctx.shadowBlur = 0;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isTarget && word.typed > 0) {
            // Draw typed portion in green
            const typedPart = word.text.substring(0, word.typed);
            const remainPart = word.text.substring(word.typed);

            const fullWidth = ctx.measureText(word.text).width;
            const typedWidth = ctx.measureText(typedPart).width;

            const startX = word.x - fullWidth / 2;

            ctx.textAlign = 'left';
            ctx.fillStyle = '#00ff88';
            ctx.fillText(typedPart, startX, word.y);

            ctx.fillStyle = '#ffffff';
            ctx.fillText(remainPart, startX + typedWidth, word.y);
        } else {
            ctx.fillStyle = word.isPower ? '#ffd700' : isTarget ? '#ffffff' : word.color;
            ctx.fillText(word.text, word.x, word.y);
        }

        ctx.restore();
    }

    /**
     * Handle keydown in battle mode
     */
    function handleKey(e) {
        if (!active) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        if (e.key === 'Escape') {
            stop();
            App.showScreen('screen-menu');
            return;
        }
        if (e.key.length > 1 && e.key !== 'Backspace') return;

        e.preventDefault();
        e.stopPropagation();

        if (e.key === 'Backspace') {
            if (typedText.length > 0) {
                typedText = typedText.slice(0, -1);
                if (targetWord) {
                    targetWord.typed = typedText.length;
                }
                if (typedText.length === 0) {
                    targetWord = null;
                }
                updateTypingDisplay();
            }
            return;
        }

        const char = e.key;
        totalChars++;

        // If no target word, find one that starts with this char
        if (!targetWord) {
            targetWord = activeWords.find(w => w.text[0].toLowerCase() === char.toLowerCase());
            if (!targetWord) {
                // No matching word found — this is a wrong key
                Audio.wrongKey();
                combo = 0;
                multiplier = 1;
                return;
            }
            typedText = '';
        }

        // Check if char matches the expected next character
        const expectedChar = targetWord.text[typedText.length];
        if (expectedChar && char.toLowerCase() === expectedChar.toLowerCase()) {
            // ★ CORRECT ★
            typedText += char;
            targetWord.typed = typedText.length;
            correctChars++;
            Audio.keyPress();

            // Check if word completed
            if (typedText.length >= targetWord.text.length) {
                wordCompleted(targetWord);
            }
        } else {
            // ★ WRONG — do NOT advance, reset target word ★
            Audio.wrongKey();
            combo = 0;
            multiplier = 1;
            triggerShake(4, 150);

            // Reset the target so player can re-target
            if (targetWord) {
                targetWord.typed = 0;
            }
            targetWord = null;
            typedText = '';
        }

        updateTypingDisplay();
    }

    /**
     * Word completed - deal damage to boss
     */
    function wordCompleted(word) {
        // Remove word from active
        word.alive = false;

        // Calculate damage
        let baseDamage = word.text.length * 5;
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        totalWordsTyped++;

        // Update multiplier
        if (combo >= 20) multiplier = 4;
        else if (combo >= 10) multiplier = 3;
        else if (combo >= 5) multiplier = 2;
        else multiplier = 1;

        let damage = Math.round(baseDamage * multiplier);
        const isCritical = word.isPower || combo >= 15 && Math.random() < 0.3;

        if (isCritical) {
            damage *= 2;
        }

        // Apply damage
        bossHP -= damage;
        if (bossHP < 0) bossHP = 0;

        // Effects
        if (isCritical) {
            Audio.criticalHit();
            Particles.criticalBurst(bossX, bossY);
            triggerShake(12, 400);
            flashScreen('#ffd700', 0.25);
            spawnDamageNumber(bossX, bossY - bossSize, `${damage}!`, 'critical');
        } else {
            Audio.bossHit();
            Particles.bossHitBurst(word.x, word.y, boss.color);
            triggerShake(4, 150);
            spawnDamageNumber(bossX + Utils.randFloat(-40, 40), bossY - bossSize * 0.5, `${damage}`, 'boss-dmg');
        }

        bossHurt = 0.3;

        // Combo sound
        if (combo > 0 && combo % 5 === 0) {
            Audio.comboUp();
        }

        // Particles at word position
        Particles.wordBurst(word.x, word.y, boss.color);

        // Check phase transition
        checkPhaseTransition();

        // Reset target
        targetWord = null;
        typedText = '';
        updateTypingDisplay();
    }

    /**
     * Check if boss should transition to next phase
     */
    function checkPhaseTransition() {
        const hpPercent = bossHP / bossMaxHP;
        const { index } = BossData.getCurrentPhase(boss, hpPercent);

        if (index > currentPhaseIndex) {
            currentPhaseIndex = index;
            const phase = boss.phases[index];

            // Dramatic phase transition
            Audio.phaseTransition();
            flashScreen(boss.color, 0.4);
            triggerShake(15, 600);

            // Update word pool for new phase
            wordPool = WordEngine.getBossWords(chapterId, index + 1);

            // Show phase overlay
            phaseOverlayText.textContent = phase.name.toUpperCase();
            phaseOverlay.classList.add('active');
            bossPhaseEl.textContent = phase.name;

            setTimeout(() => {
                phaseOverlay.classList.remove('active');
            }, 2000);
        }
    }

    /**
     * Update the typing display in the HUD
     */
    function updateTypingDisplay() {
        if (!targetWord) {
            currentWordEl.innerHTML = '<span style="color: var(--text-muted); font-size: 0.9rem;">Type the first letter of any word...</span>';
            typedEl.textContent = '';
            return;
        }

        let html = '';
        [...targetWord.text].forEach((char, i) => {
            if (i < typedText.length) {
                html += `<span class="char-correct">${char}</span>`;
            } else {
                html += `<span class="char-pending">${char}</span>`;
            }
        });
        currentWordEl.innerHTML = html;
        typedEl.textContent = typedText;
    }

    /**
     * Update HUD elements
     */
    function updateHUD() {
        const bossPercent = Math.max(0, (bossHP / bossMaxHP) * 100);
        const playerPercent = Math.max(0, (playerHP / playerMaxHP) * 100);

        bossHPEl.style.width = bossPercent + '%';
        playerHPEl.style.width = playerPercent + '%';

        // Color player HP bar based on health
        if (playerPercent < 25) {
            playerHPEl.style.background = 'linear-gradient(90deg, #ff2255, #ff4466)';
            playerHPEl.style.boxShadow = '0 0 10px rgba(255,34,85,0.5)';
        } else if (playerPercent < 50) {
            playerHPEl.style.background = 'linear-gradient(90deg, #ffaa00, #ffcc44)';
            playerHPEl.style.boxShadow = '0 0 10px rgba(255,170,0,0.5)';
        } else {
            playerHPEl.style.background = '';
            playerHPEl.style.boxShadow = '';
        }

        // Combo
        comboEl.querySelector('.combo-count').textContent = combo;
        if (combo >= 10) {
            comboEl.classList.add('fire');
        } else {
            comboEl.classList.remove('fire');
        }

        multiplierEl.textContent = multiplier + 'x';

        // WPM
        const elapsed = performance.now() - startTime;
        const wpm = Utils.calculateWPM(correctChars, elapsed);
        wpmEl.textContent = wpm + ' WPM';
    }

    /**
     * Trigger screen shake
     */
    function triggerShake(intensity, duration) {
        shakeIntensity = intensity;
        shakeDuration = duration;
        shakeStart = performance.now();
    }

    /**
     * Flash the screen
     */
    function flashScreen(color, alpha) {
        flashColor = color;
        flashAlpha = alpha;
    }

    /**
     * Spawn a floating damage number
     */
    function spawnDamageNumber(x, y, text, type) {
        damageNumbers.push({
            x, y, text, type,
            startTime: performance.now(),
            duration: 1000
        });
    }

    /**
     * Update and render damage numbers (as DOM elements)
     */
    function updateDamageNumbers() {
        const now = performance.now();

        damageNumbers = damageNumbers.filter(dn => {
            const elapsed = now - dn.startTime;
            if (elapsed > dn.duration) return false;

            const progress = elapsed / dn.duration;
            const yOffset = -60 * Utils.easeOutCubic(progress);
            const alpha = 1 - progress;
            const scale = dn.type === 'critical' ? 1.5 - progress * 0.5 : 1.2 - progress * 0.3;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (dn.type === 'critical') {
                ctx.font = "bold 32px 'Orbitron', sans-serif";
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 20;
            } else if (dn.type === 'boss-dmg') {
                ctx.font = "bold 24px 'Orbitron', sans-serif";
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 10;
            } else {
                ctx.font = "bold 22px 'Orbitron', sans-serif";
                ctx.fillStyle = '#ff2255';
                ctx.shadowColor = '#ff2255';
                ctx.shadowBlur = 10;
            }

            ctx.fillText(dn.text, dn.x, dn.y + yOffset);
            ctx.restore();

            return true;
        });
    }

    /**
     * Victory!
     */
    function victory() {
        active = false;
        cancelAnimationFrame(animFrame);

        // Epic death explosion
        Particles.bossDeathExplosion(bossX, bossY);
        Audio.victory();
        flashScreen('#ffd700', 0.5);
        triggerShake(20, 800);

        // Draw final frame with explosion
        let explosionFrames = 0;
        function explosionLoop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();
            Particles.updateAmbient(ctx, canvas.width, canvas.height);
            Particles.update(ctx);
            explosionFrames++;
            if (explosionFrames < 120) {
                requestAnimationFrame(explosionLoop);
            } else {
                showVictoryResults();
            }
        }
        requestAnimationFrame(explosionLoop);
    }

    function showVictoryResults() {
        const elapsed = performance.now() - startTime;
        const wpm = Utils.calculateWPM(correctChars, elapsed);
        const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
        const stars = GameState.calculateStars(wpm, accuracy, 30);

        // Save progress
        GameState.defeatBoss(chapterId, wpm, accuracy);

        // XP
        const xp = GameState.calculateXP(wpm, accuracy, totalWordsTyped, maxCombo, true);
        const levelResult = GameState.addXP(xp);

        App.showResults({
            victory: true,
            title: 'VICTORY!',
            subtitle: `You defeated ${boss.name}`,
            wpm,
            accuracy,
            maxCombo,
            xp,
            stars,
            levelsGained: levelResult.levelsGained,
            context: 'battle',
            chapterId
        });
    }

    /**
     * Defeat
     */
    function defeat() {
        active = false;
        cancelAnimationFrame(animFrame);

        Audio.defeat();
        flashScreen('#ff2255', 0.5);

        setTimeout(() => {
            const elapsed = performance.now() - startTime;
            const wpm = Utils.calculateWPM(correctChars, elapsed);
            const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

            // Still give some XP for effort
            const xp = Math.round(GameState.calculateXP(wpm, accuracy, totalWordsTyped, maxCombo, false) * 0.3);
            const levelResult = GameState.addXP(xp);

            App.showResults({
                victory: false,
                title: 'DEFEATED',
                subtitle: `${boss.name} was too powerful...`,
                wpm,
                accuracy,
                maxCombo,
                xp,
                stars: 0,
                levelsGained: levelResult.levelsGained,
                context: 'battle',
                chapterId
            });
        }, 1500);
    }

    /**
     * Stop battle
     */
    function stop() {
        active = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        window.removeEventListener('resize', resizeCanvas);
        Particles.clear();
    }

    /**
     * Check if battle is active
     */
    function isActive() {
        return active;
    }

    return {
        start,
        handleKey,
        stop,
        isActive
    };
})();
