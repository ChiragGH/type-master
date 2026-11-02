/* ============================================= */
/* WORD-ENGINE.JS — Word Pools & Difficulty        */
/* ============================================= */

const WordEngine = (() => {
    // Key zones — which keys are available at each chapter
    const KEY_ZONES = {
        1: ['a', 's', 'd', 'f', 'j', 'k', 'l'],           // Home row basics
        2: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], // Full home row
        3: ['a','s','d','f','g','h','j','k','l','q','w','e','r','t','y','u','i','o','p'], // + top row
        4: ['a','s','d','f','g','h','j','k','l','q','w','e','r','t','y','u','i','o','p',
            'z','x','c','v','b','n','m'],  // + bottom row
        5: ['a','s','d','f','g','h','j','k','l','q','w','e','r','t','y','u','i','o','p',
            'z','x','c','v','b','n','m'],  // Full alphabet speed
        6: ['a','s','d','f','g','h','j','k','l','q','w','e','r','t','y','u','i','o','p',
            'z','x','c','v','b','n','m','1','2','3','4','5','6','7','8','9','0']  // + numbers
    };

    // Word pools organized by key zones
    const WORD_POOLS = {
        // Chapter 1: Home row basics (a s d f j k l)
        1: {
            easy: ['as', 'ad', 'add', 'all', 'ask', 'dad', 'fad', 'jab', 'lad', 'sad', 'sal', 'lass',
                   'fall', 'tall', 'call', 'hall', 'ball', 'wall', 'doll', 'full', 'hull', 'gull',
                   'dusk', 'task', 'mask', 'flask', 'lass', 'lass', 'falls', 'halls', 'salad', 'flash'],
            medium: ['flask', 'salad', 'skull', 'stall', 'shall', 'allas', 'falls', 'skill', 'daffodil',
                     'askall', 'fallsad', 'salads', 'flasks'],
            hard: ['daffodils', 'slapdash', 'flashdall', 'skullfall']
        },

        // Chapter 2: Full home row (+ g h)
        2: {
            easy: ['ash', 'gag', 'gas', 'had', 'hag', 'has', 'lag', 'gal', 'glad', 'half', 'hash',
                   'dash', 'gash', 'lash', 'gall', 'hall', 'flag', 'shag', 'slag'],
            medium: ['flash', 'slash', 'glass', 'shall', 'flags', 'glads', 'laughs', 'dashed', 'hashed',
                     'lashed', 'gashed', 'flagged', 'halfsad'],
            hard: ['flashlag', 'halfglass', 'flagdash', 'dashflash', 'slashflag']
        },

        // Chapter 3: + Top row
        3: {
            easy: ['the', 'to', 'of', 'it', 'is', 'he', 'we', 'or', 'up', 'if', 'go',
                   'eye', 'yet', 'her', 'out', 'red', 'hot', 'you', 'old', 'put',
                   'top', 'tip', 'type', 'your', 'with', 'they', 'wire', 'this', 'quite', 'wrote'],
            medium: ['power', 'quiet', 'their', 'world', 'write', 'other', 'youth', 'tower',
                     'quest', 'quote', 'equip', 'route', 'outer', 'super', 'tiger', 'first',
                     'query', 'rapid', 'tease', 'wheat', 'wrist', 'trout', 'roast'],
            hard: ['quarter', 'trouble', 'require', 'whether', 'quitter', 'outside', 'without',
                   'further', 'quickly', 'twitter', 'typewriter', 'fortress', 'equipped']
        },

        // Chapter 4: + Bottom row
        4: {
            easy: ['box', 'mix', 'van', 'can', 'man', 'zen', 'ban', 'vim', 'cab', 'nab',
                   'back', 'come', 'down', 'move', 'name', 'next', 'once', 'much', 'know', 'been',
                   'come', 'back', 'from', 'them', 'been', 'even', 'many', 'make'],
            medium: ['black', 'brown', 'check', 'clean', 'climb', 'cover', 'dance', 'exact',
                     'bunch', 'crumb', 'bench', 'blank', 'brick', 'breeze', 'bronze', 'cancel',
                     'chance', 'change', 'choose', 'combat', 'convex', 'boxing', 'zombie'],
            hard: ['complex', 'combine', 'machine', 'maximum', 'between', 'connect', 'context',
                   'exquisite', 'recognize', 'excavate', 'exclusive', 'customize']
        },

        // Chapter 5: Full alphabet speed
        5: {
            easy: ['about', 'after', 'being', 'could', 'doing', 'every', 'found', 'great',
                   'house', 'joint', 'known', 'learn', 'might', 'never', 'often', 'place',
                   'quick', 'right', 'small', 'there', 'under', 'value', 'where', 'young'],
            medium: ['always', 'became', 'behind', 'before', 'broken', 'caught', 'coming', 'danger',
                     'enough', 'expect', 'figure', 'global', 'happen', 'impact', 'jungle', 'knight',
                     'launch', 'modern', 'nature', 'office', 'planet', 'signal', 'travel', 'unique'],
            hard: ['absolute', 'backward', 'campaign', 'daughter', 'electric', 'forecast', 'guardian',
                   'hardware', 'industry', 'judgment', 'keyboard', 'language', 'marathon', 'navigate',
                   'objective', 'platform', 'question', 'research', 'software', 'thousand']
        },

        // Chapter 6: + Numbers and symbols
        6: {
            easy: ['go2', 'be4', 'no1', 'hi5', 'a1b', 'c3d', 'f4g', 'h8j', 'k9l',
                   'abc123', 'xyz789', 'test01', 'code42', 'play99', 'win100'],
            medium: ['hack3r', 'cod3rs', 'typ1ng', 'g4m3rs', 'l3v3l5', 'qu3st6',
                     'pass123', 'user456', 'data789', 'file001', 'code2025', 'level99',
                     'quest42', 'power10', 'ultra99'],
            hard: ['master2025', 'keyboard99', 'algorithm1', 'protocol42', 'encrypted7',
                   'firewall99', 'cyberpunk0', 'architect3', 'typemaster1']
        }
    };

    // Boss-themed word pools
    const BOSS_WORDS = {
        1: { // Slime Sentinel
            theme: ['slime', 'goo', 'jelly', 'sludge', 'gloop', 'blob', 'ooze', 'gel', 'drip',
                    'leak', 'drool', 'splash', 'slide', 'slick', 'stick', 'gloss'],
            hard: ['dissolve', 'dissolve', 'sentinel', 'guardian']
        },
        2: { // Shadow Stalker
            theme: ['shadow', 'dark', 'shade', 'dusk', 'gloom', 'haze', 'fog', 'mist',
                    'ghost', 'haunt', 'stalk', 'lurk', 'hide', 'sneak', 'fang', 'claw'],
            hard: ['darkness', 'stalking', 'shadowed', 'haunting']
        },
        3: { // Crystal Golem
            theme: ['crystal', 'quartz', 'prism', 'jewel', 'ruby', 'topaz', 'opal', 'pearl',
                    'stone', 'rock', 'tower', 'power', 'golem', 'earth', 'iron', 'steel'],
            hard: ['crystalize', 'petrified', 'fortified', 'unbreaking']
        },
        4: { // Venom Drake
            theme: ['venom', 'toxic', 'cobra', 'fang', 'bite', 'scale', 'blaze', 'claw',
                    'flame', 'burn', 'scorch', 'smoke', 'ember', 'cinder', 'drake', 'wyvern'],
            hard: ['venomous', 'draconic', 'scorching', 'blazeclaw']
        },
        5: { // Cyber Overlord
            theme: ['cyber', 'code', 'data', 'hack', 'virus', 'proxy', 'debug', 'pixel',
                    'logic', 'query', 'cloud', 'stack', 'script', 'input', 'output', 'kernel'],
            hard: ['mainframe', 'algorithm', 'encrypted', 'overclocked']
        },
        6: { // The Architect
            theme: ['arch1', 'code99', 'sys404', 'root0', 'build7', 'nexus5', 'prime3', 'grid8',
                    'core42', 'node16', 'flux9', 'zen0', 'apex1', 'nova7'],
            hard: ['arch1tect', 'master999', 'final0boss', 'endgame42']
        }
    };

    /**
     * Get words for a specific chapter and difficulty
     */
    function getWords(chapterId, difficulty = 'easy', count = 20) {
        const pool = WORD_POOLS[chapterId];
        if (!pool) return [];

        const words = pool[difficulty] || pool.easy;
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(Utils.randPick(words));
        }
        return result;
    }

    /**
     * Get words for a boss fight
     */
    function getBossWords(chapterId, phase = 1) {
        const pool = WORD_POOLS[chapterId];
        const bossPool = BOSS_WORDS[chapterId];
        if (!pool || !bossPool) return ['error'];

        const sources = [];

        // Mix regular words and boss-themed words
        if (phase === 1) {
            sources.push(...pool.easy, ...pool.easy, ...bossPool.theme);
        } else if (phase === 2) {
            sources.push(...pool.easy, ...pool.medium, ...bossPool.theme);
        } else {
            sources.push(...pool.medium, ...pool.hard, ...bossPool.theme, ...bossPool.hard);
        }

        return sources;
    }

    /**
     * Get a single random word from a pool
     */
    function getRandomWord(wordPool) {
        return Utils.randPick(wordPool);
    }

    /**
     * Check if a word only uses keys available in a chapter
     */
    function isWordValid(word, chapterId) {
        const keys = KEY_ZONES[chapterId];
        return [...word.toLowerCase()].every(c => keys.includes(c) || c === ' ');
    }

    /**
     * Generate a "power word" for special attacks (golden word)
     */
    function getPowerWord(chapterId) {
        const bossPool = BOSS_WORDS[chapterId];
        if (!bossPool) return 'POWER';
        return Utils.randPick(bossPool.hard).toUpperCase();
    }

    /**
     * Get training words for a specific lesson, filtered by allowed keys
     */
    function getTrainingWords(chapterId, lessonIndex, count = 15, lessonKeys = null) {
        const pool = WORD_POOLS[chapterId];
        if (!pool) return [];

        // Early lessons = easy words, later = harder
        const lessonDifficulty = lessonIndex < 2 ? 'easy' :
                                 lessonIndex < 4 ? 'medium' : 'hard';

        let words = pool[lessonDifficulty] || pool.easy;

        // Filter words to only use allowed lesson keys
        if (lessonKeys && lessonKeys.length > 0) {
            const keySet = new Set(lessonKeys.map(k => k.toLowerCase()));
            const filtered = words.filter(w =>
                [...w.toLowerCase()].every(c => keySet.has(c))
            );
            // Use filtered if we have enough words, otherwise fallback to all easy words filtered
            if (filtered.length >= 3) {
                words = filtered;
            } else {
                // Try all difficulties
                const allWords = [...(pool.easy || []), ...(pool.medium || []), ...(pool.hard || [])];
                const allFiltered = allWords.filter(w =>
                    [...w.toLowerCase()].every(c => keySet.has(c))
                );
                if (allFiltered.length >= 3) {
                    words = allFiltered;
                }
                // If still not enough, generate simple combos from the keys
                if (words === filtered && filtered.length < 3) {
                    words = generateFromKeys(lessonKeys, count);
                    return words;
                }
            }
        }

        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(Utils.randPick(words));
        }
        return result;
    }

    /**
     * Generate simple practice words from specific keys when pool is insufficient
     */
    function generateFromKeys(keys, count) {
        const result = [];
        const lowerKeys = keys.map(k => k.toLowerCase());
        for (let i = 0; i < count; i++) {
            const len = Utils.randInt(2, 5);
            let word = '';
            for (let j = 0; j < len; j++) {
                word += Utils.randPick(lowerKeys);
            }
            result.push(word);
        }
        return result;
    }

    return {
        KEY_ZONES,
        getWords,
        getBossWords,
        getRandomWord,
        isWordValid,
        getPowerWord,
        getTrainingWords,
        BOSS_WORDS
    };
})();
