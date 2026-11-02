/* ============================================= */
/* GAME-STATE.JS — Save/Load, XP, Progression    */
/* ============================================= */

const GameState = (() => {
    const SAVE_KEY = 'typemaster_save_v1';

    const DEFAULT_STATE = {
        playerLevel: 1,
        playerXP: 0,
        xpToNextLevel: 100,
        bestWPM: 0,
        bestAccuracy: 0,
        bossesDefeated: 0,
        totalWordsTyped: 0,
        totalTimePlayedMs: 0,

        // Chapter progress: { chapterId: { unlocked, lessons: { lessonId: { completed, stars, bestWPM, bestAccuracy } } } }
        chapters: {
            1: {
                unlocked: true,
                bossDefeated: false,
                lessons: {}
            },
            2: { unlocked: false, bossDefeated: false, lessons: {} },
            3: { unlocked: false, bossDefeated: false, lessons: {} },
            4: { unlocked: false, bossDefeated: false, lessons: {} },
            5: { unlocked: false, bossDefeated: false, lessons: {} },
            6: { unlocked: false, bossDefeated: false, lessons: {} }
        },

        // Current position for "Continue" button
        currentChapter: 1,
        currentLesson: 0
    };

    let state = null;

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function load() {
        try {
            const saved = localStorage.getItem(SAVE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to handle new fields
                state = { ...deepClone(DEFAULT_STATE), ...parsed };
                // Merge chapters deeply
                for (let i = 1; i <= 6; i++) {
                    if (!state.chapters[i]) {
                        state.chapters[i] = deepClone(DEFAULT_STATE.chapters[i]);
                    }
                }
            } else {
                state = deepClone(DEFAULT_STATE);
            }
        } catch (e) {
            console.warn('Failed to load save, starting fresh', e);
            state = deepClone(DEFAULT_STATE);
        }
        return state;
    }

    function save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save', e);
        }
    }

    function getState() {
        if (!state) load();
        return state;
    }

    /**
     * Calculate XP earned from a session
     */
    function calculateXP(wpm, accuracy, wordsTyped, maxCombo, isBoss = false) {
        let baseXP = wordsTyped * 2;

        // Speed bonus
        if (wpm >= 60) baseXP *= 1.5;
        else if (wpm >= 40) baseXP *= 1.2;

        // Accuracy bonus
        baseXP *= (accuracy / 100);

        // Combo bonus
        baseXP += maxCombo * 2;

        // Boss bonus
        if (isBoss) baseXP *= 2;

        return Math.round(baseXP);
    }

    /**
     * Add XP and handle level ups. Returns { levelsGained, newLevel }
     */
    function addXP(amount) {
        const s = getState();
        let levelsGained = 0;

        s.playerXP += amount;

        while (s.playerXP >= s.xpToNextLevel) {
            s.playerXP -= s.xpToNextLevel;
            s.playerLevel++;
            s.xpToNextLevel = Math.round(s.xpToNextLevel * 1.4);
            levelsGained++;
        }

        save();
        return { levelsGained, newLevel: s.playerLevel };
    }

    /**
     * Record lesson completion
     */
    function completeLesson(chapterId, lessonId, wpm, accuracy, stars) {
        const s = getState();
        const chapter = s.chapters[chapterId];
        if (!chapter) return;

        if (!chapter.lessons[lessonId]) {
            chapter.lessons[lessonId] = { completed: false, stars: 0, bestWPM: 0, bestAccuracy: 0 };
        }

        const lesson = chapter.lessons[lessonId];
        lesson.completed = true;
        lesson.stars = Math.max(lesson.stars, stars);
        lesson.bestWPM = Math.max(lesson.bestWPM, wpm);
        lesson.bestAccuracy = Math.max(lesson.bestAccuracy, accuracy);

        // Update global bests
        if (wpm > s.bestWPM) s.bestWPM = wpm;
        if (accuracy > s.bestAccuracy) s.bestAccuracy = accuracy;

        // Advance current position
        s.currentChapter = chapterId;
        s.currentLesson = lessonId + 1;

        save();
    }

    /**
     * Record boss defeat
     */
    function defeatBoss(chapterId, wpm, accuracy) {
        const s = getState();
        const chapter = s.chapters[chapterId];
        if (!chapter) return;

        chapter.bossDefeated = true;
        s.bossesDefeated++;

        // Unlock next chapter
        const nextChapter = s.chapters[chapterId + 1];
        if (nextChapter) {
            nextChapter.unlocked = true;
            s.currentChapter = chapterId + 1;
            s.currentLesson = 0;
        }

        if (wpm > s.bestWPM) s.bestWPM = wpm;
        if (accuracy > s.bestAccuracy) s.bestAccuracy = accuracy;

        save();
    }

    /**
     * Check if a lesson is unlocked
     */
    function isLessonUnlocked(chapterId, lessonIndex, totalLessonsData) {
        const s = getState();
        const chapter = s.chapters[chapterId];
        if (!chapter || !chapter.unlocked) return false;
        if (lessonIndex === 0) return true;

        // Previous lesson must be completed
        const prevLesson = chapter.lessons[lessonIndex - 1];
        return prevLesson && prevLesson.completed;
    }

    /**
     * Get chapter progress percentage
     */
    function getChapterProgress(chapterId, totalLessons) {
        const s = getState();
        const chapter = s.chapters[chapterId];
        if (!chapter) return 0;

        let completed = 0;
        for (let i = 0; i < totalLessons; i++) {
            if (chapter.lessons[i] && chapter.lessons[i].completed) completed++;
        }
        // Include boss as final "lesson"
        if (chapter.bossDefeated) completed++;
        return Math.round((completed / (totalLessons + 1)) * 100);
    }

    /**
     * Calculate star rating from WPM and accuracy
     */
    function calculateStars(wpm, accuracy, targetWPM = 30) {
        let stars = 0;
        if (accuracy >= 70 && wpm >= targetWPM * 0.5) stars = 1;
        if (accuracy >= 85 && wpm >= targetWPM * 0.75) stars = 2;
        if (accuracy >= 95 && wpm >= targetWPM) stars = 3;
        return stars;
    }

    /**
     * Reset all progress
     */
    function resetProgress() {
        state = deepClone(DEFAULT_STATE);
        save();
    }

    return {
        load,
        save,
        getState,
        calculateXP,
        addXP,
        completeLesson,
        defeatBoss,
        isLessonUnlocked,
        getChapterProgress,
        calculateStars,
        resetProgress
    };
})();
