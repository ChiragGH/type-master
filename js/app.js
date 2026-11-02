/* ============================================= */
/* APP.JS — Main App Controller & Screen Manager  */
/* ============================================= */

const App = (() => {
    let currentScreen = 'screen-boot';
    let currentContext = {};

    // Chapter metadata (for display)
    const CHAPTER_META = {
        1: { name: 'Awakening', desc: 'Master the home row foundation', boss: 'Slime Sentinel', emoji: '🟢', keys: 'A S D F J K L' },
        2: { name: 'Rising', desc: 'Expand your home row mastery', boss: 'Shadow Stalker', emoji: '🟣', keys: 'A S D F G H J K L' },
        3: { name: 'Expansion', desc: 'Conquer the top row', boss: 'Crystal Golem', emoji: '🔵', keys: 'Q W E R T Y U I O P' },
        4: { name: 'Depth', desc: 'Claim the bottom row', boss: 'Venom Drake', emoji: '🔴', keys: 'Z X C V B N M' },
        5: { name: 'Ascension', desc: 'Full alphabet speed training', boss: 'Cyber Overlord', emoji: '🟡', keys: 'All Letters' },
        6: { name: 'Transcendence', desc: 'Numbers and the final challenge', boss: 'The Architect', emoji: '⭐', keys: '0-9 + All Letters' }
    };

    /**
     * Initialize the app
     */
    function init() {
        // Load game state
        GameState.load();

        // Init audio on first interaction
        document.addEventListener('click', () => Audio.init(), { once: true });
        document.addEventListener('keydown', () => Audio.init(), { once: true });

        // Boot sequence
        setTimeout(() => {
            showScreen('screen-menu');
            updateMenuUI();
        }, 2200);

        // Bind all event listeners
        bindMenuEvents();
        bindGlobalKeyboard();

        // Generate menu ambient particles
        generateMenuParticles();
    }

    /**
     * Show a screen (with transition)
     */
    function showScreen(screenId) {
        // Hide current screen
        const currentEl = document.getElementById(currentScreen);
        if (currentEl) {
            currentEl.classList.add('exiting');
            currentEl.classList.remove('active');
            setTimeout(() => {
                currentEl.classList.remove('exiting');
            }, 400);
        }

        // Show new screen
        const newEl = document.getElementById(screenId);
        if (newEl) {
            setTimeout(() => {
                newEl.classList.add('active');
            }, 50);
        }

        currentScreen = screenId;
    }

    /**
     * Update main menu UI from game state
     */
    function updateMenuUI() {
        const state = GameState.getState();

        document.getElementById('player-level').textContent = state.playerLevel;
        document.getElementById('player-xp-bar').style.width =
            ((state.playerXP / state.xpToNextLevel) * 100) + '%';
        document.getElementById('player-xp-text').textContent =
            `${state.playerXP} / ${state.xpToNextLevel} XP`;
        document.getElementById('stat-wpm').textContent = state.bestWPM;
        document.getElementById('stat-accuracy').textContent =
            state.bestAccuracy > 0 ? state.bestAccuracy + '%' : '0%';
        document.getElementById('stat-bosses').textContent = state.bossesDefeated;

        // Player avatar based on level
        const avatars = ['⚡', '🔥', '⚔️', '🛡️', '👑', '🌟'];
        const avatarIndex = Math.min(Math.floor(state.playerLevel / 3), avatars.length - 1);
        document.getElementById('player-avatar').textContent = avatars[avatarIndex];
    }

    /**
     * Bind menu button events
     */
    function bindMenuEvents() {
        // Continue button
        document.getElementById('btn-continue').addEventListener('click', () => {
            Audio.menuClick();
            const state = GameState.getState();
            const chapter = state.currentChapter;
            const lesson = state.currentLesson;
            const lessons = Training.getLessons(chapter);

            if (lesson < lessons.length) {
                Training.start(chapter, lesson);
            } else {
                // All lessons done, go to chapters
                renderChapters();
                showScreen('screen-chapters');
            }
        });

        // Chapters button
        document.getElementById('btn-chapters').addEventListener('click', () => {
            Audio.menuClick();
            renderChapters();
            showScreen('screen-chapters');
        });

        // Free play button
        document.getElementById('btn-freeplay').addEventListener('click', () => {
            Audio.menuClick();
            showScreen('screen-freeplay');
        });

        // Back buttons
        document.getElementById('btn-back-chapters').addEventListener('click', () => {
            Audio.menuClick();
            showScreen('screen-menu');
            updateMenuUI();
        });

        document.getElementById('btn-back-lessons').addEventListener('click', () => {
            Audio.menuClick();
            renderChapters();
            showScreen('screen-chapters');
        });

        document.getElementById('btn-back-training').addEventListener('click', () => {
            Audio.menuClick();
            Training.stop();
            renderLessons(currentContext.chapterId);
            showScreen('screen-lessons');
        });

        document.getElementById('btn-back-freeplay').addEventListener('click', () => {
            Audio.menuClick();
            showScreen('screen-menu');
        });

        // Pre-battle start
        document.getElementById('btn-start-battle').addEventListener('click', () => {
            Audio.menuClick();
            Battle.start(currentContext.chapterId);
        });

        // Results buttons
        document.getElementById('btn-results-continue').addEventListener('click', () => {
            Audio.menuClick();
            handleResultsContinue();
        });

        document.getElementById('btn-results-retry').addEventListener('click', () => {
            Audio.menuClick();
            handleResultsRetry();
        });

        document.getElementById('btn-results-menu').addEventListener('click', () => {
            Audio.menuClick();
            showScreen('screen-menu');
            updateMenuUI();
        });

        // Free play difficulty buttons
        document.querySelectorAll('#freeplay-difficulty .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#freeplay-difficulty .btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Free play duration buttons
        document.querySelectorAll('#freeplay-duration .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#freeplay-duration .btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Start free play
        document.getElementById('btn-start-freeplay').addEventListener('click', () => {
            Audio.menuClick();
            // Start training with chapter 5 (full alphabet) in drill mode
            const difficulty = document.querySelector('#freeplay-difficulty .btn.active')?.dataset.value || 'medium';
            const chapMap = { easy: 2, medium: 4, hard: 5 };
            const chapId = chapMap[difficulty];
            Training.start(chapId, 2); // drill lesson index
        });
    }

    /**
     * Bind global keyboard handler
     */
    function bindGlobalKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (Training.isActive()) {
                Training.handleKey(e);
            } else if (Battle.isActive()) {
                Battle.handleKey(e);
            }
        });
    }

    /**
     * Render chapter selection cards
     */
    function renderChapters() {
        const grid = document.getElementById('chapters-grid');
        grid.innerHTML = '';
        const state = GameState.getState();

        for (let i = 1; i <= 6; i++) {
            const meta = CHAPTER_META[i];
            const chapState = state.chapters[i];
            const lessons = Training.getLessons(i);
            const progress = GameState.getChapterProgress(i, lessons.length - 1); // -1 for boss

            const card = document.createElement('div');
            card.classList.add('chapter-card');
            card.style.animationDelay = `${(i - 1) * 0.1}s`;

            if (!chapState.unlocked) {
                card.classList.add('locked');
            }
            if (chapState.bossDefeated) {
                card.classList.add('completed');
            }

            card.innerHTML = `
                <div class="chapter-number">Chapter ${i}</div>
                <div class="chapter-name">${meta.name}</div>
                <div class="chapter-desc">${meta.desc}</div>
                <div class="chapter-boss">
                    <span class="chapter-boss-icon">${meta.emoji}</span>
                    Boss: ${meta.boss}
                </div>
                <div class="chapter-keys">
                    ${meta.keys.split(' ').map(k => `<span class="chapter-key">${k}</span>`).join('')}
                </div>
                <div class="chapter-progress">
                    <div class="chapter-progress-bar">
                        <div class="chapter-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="chapter-progress-text">${progress}%</span>
                </div>
                ${!chapState.unlocked ? '<div class="chapter-lock-icon">🔒</div>' : ''}
                ${chapState.bossDefeated ? '<div class="chapter-complete-badge">✓ COMPLETE</div>' : ''}
            `;

            if (chapState.unlocked) {
                card.addEventListener('click', () => {
                    Audio.menuClick();
                    currentContext.chapterId = i;
                    renderLessons(i);
                    showScreen('screen-lessons');
                });
            }

            grid.appendChild(card);
        }
    }

    /**
     * Render lessons for a chapter
     */
    function renderLessons(chapterId) {
        const list = document.getElementById('lessons-list');
        list.innerHTML = '';

        const meta = CHAPTER_META[chapterId];
        document.getElementById('lessons-title').textContent = `Chapter ${chapterId}: ${meta.name}`;

        const lessons = Training.getLessons(chapterId);
        const state = GameState.getState();

        lessons.forEach((lesson, idx) => {
            const unlocked = GameState.isLessonUnlocked(chapterId, idx, lessons);
            const lessonState = state.chapters[chapterId]?.lessons[idx];
            const completed = lessonState?.completed || false;
            const stars = lessonState?.stars || 0;

            const item = document.createElement('div');
            item.classList.add('lesson-item');
            item.style.animationDelay = `${idx * 0.08}s`;

            if (!unlocked) item.classList.add('locked');
            if (completed) item.classList.add('completed');

            // Type badge
            const typeClass = lesson.type;
            const typeLabel = lesson.type === 'boss' ? 'BOSS' : lesson.type === 'drill' ? 'DRILL' : 'LEARN';

            item.innerHTML = `
                <span class="lesson-number">${idx + 1}</span>
                <div class="lesson-details">
                    <div class="lesson-title">${lesson.title}</div>
                    <div class="lesson-description">${lesson.desc}</div>
                </div>
                <span class="lesson-type-badge ${typeClass}">${typeLabel}</span>
                <div class="lesson-stars">
                    ${[1,2,3].map(s => `<span class="star ${s <= stars ? 'earned' : ''}">★</span>`).join('')}
                </div>
            `;

            if (unlocked) {
                item.addEventListener('click', () => {
                    Audio.menuClick();
                    currentContext.chapterId = chapterId;
                    currentContext.lessonIndex = idx;

                    if (lesson.type === 'boss') {
                        startBattle(chapterId);
                    } else {
                        Training.start(chapterId, idx);
                    }
                });
            }

            list.appendChild(item);
        });
    }

    /**
     * Start a boss battle (with pre-battle screen)
     */
    function startBattle(chapterId) {
        currentContext.chapterId = chapterId;
        const boss = BossData.getBoss(chapterId);

        document.getElementById('prebattle-chapter').textContent = `CHAPTER ${chapterId}`;
        document.getElementById('prebattle-boss-name').textContent = boss.name.toUpperCase();
        document.getElementById('prebattle-boss-title').textContent = boss.title;
        document.getElementById('prebattle-tip').textContent =
            'Type the first letter of any word to target it. Complete words to deal damage. Build combos for multiplied damage!';

        showScreen('screen-prebattle');
    }

    /**
     * Show results screen
     */
    function showResults(data) {
        currentContext.resultsData = data;

        const titleEl = document.getElementById('results-title');
        titleEl.textContent = data.title;
        titleEl.className = 'results-title ' + (data.victory ? 'victory' : 'defeat');

        document.getElementById('results-subtitle').textContent = data.subtitle;
        document.getElementById('result-wpm').textContent = data.wpm;
        document.getElementById('result-accuracy').textContent = data.accuracy + '%';
        document.getElementById('result-max-combo').textContent = data.maxCombo;
        document.getElementById('result-xp').textContent = '+' + data.xp + ' XP';

        // Stars
        const starsEl = document.getElementById('results-stars');
        const starEls = starsEl.querySelectorAll('.star');
        starEls.forEach((star, i) => {
            star.classList.remove('earned');
            if (i < data.stars) {
                setTimeout(() => {
                    star.classList.add('earned');
                    Audio.starEarn();
                }, 300 + i * 400);
            }
        });

        // Show/hide retry button
        document.getElementById('btn-results-retry').style.display =
            data.context === 'battle' && !data.victory ? '' : 'none';

        showScreen('screen-results');
    }

    /**
     * Handle continue from results
     */
    function handleResultsContinue() {
        const data = currentContext.resultsData;
        if (!data) {
            showScreen('screen-menu');
            updateMenuUI();
            return;
        }

        if (data.context === 'training') {
            // Go to next lesson
            const lessons = Training.getLessons(data.chapterId);
            const nextIdx = data.lessonIndex + 1;
            if (nextIdx < lessons.length) {
                Training.start(data.chapterId, nextIdx);
            } else {
                renderLessons(data.chapterId);
                showScreen('screen-lessons');
            }
        } else if (data.context === 'battle') {
            if (data.victory) {
                // Go to menu with updated state
                showScreen('screen-menu');
                updateMenuUI();
            } else {
                // Go back to lessons
                renderLessons(data.chapterId);
                showScreen('screen-lessons');
            }
        } else {
            showScreen('screen-menu');
            updateMenuUI();
        }
    }

    /**
     * Handle retry from results
     */
    function handleResultsRetry() {
        const data = currentContext.resultsData;
        if (data && data.context === 'battle') {
            startBattle(data.chapterId);
        }
    }

    /**
     * Generate ambient floating particles for the menu
     */
    function generateMenuParticles() {
        const container = document.getElementById('menu-particles');
        if (!container) return;

        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            const size = Utils.randFloat(2, 5);
            const x = Utils.randFloat(0, 100);
            const duration = Utils.randFloat(8, 20);
            const delay = Utils.randFloat(0, 15);
            const drift = Utils.randFloat(-50, 50);
            const color = Utils.randPick(['#00f0ff', '#ff00aa', '#aa44ff', '#ffd700', '#00ff88']);

            particle.style.cssText = `
                position: absolute;
                left: ${x}%;
                bottom: -10px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                opacity: 0;
                box-shadow: 0 0 ${size * 2}px ${color};
                animation: floatUp ${duration}s ease-in-out ${delay}s infinite;
                --drift: ${drift}px;
            `;

            container.appendChild(particle);
        }
    }

    // Public API
    return {
        init,
        showScreen,
        showResults,
        startBattle,
        updateMenuUI
    };
})();

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
