/* ============================================= */
/* BOSS-DATA.JS — Boss Definitions & Phases       */
/* ============================================= */

const BossData = {
    bosses: {
        1: {
            id: 1,
            name: 'Slime Sentinel',
            title: 'Guardian of the Home Row',
            chapter: 1,
            color: '#44ff88',
            glowColor: 'rgba(68, 255, 136, 0.4)',
            accentColor: '#22cc66',

            maxHP: 500,
            playerMaxHP: 200,

            phases: [
                {
                    name: 'Phase 1',
                    hpThreshold: 1.0,  // 100% - 60%
                    wordSpeed: 0.3,     // pixels per frame
                    spawnInterval: 3000, // ms between words
                    maxActiveWords: 3,
                    damage: 15          // damage per missed word
                },
                {
                    name: 'Phase 2',
                    hpThreshold: 0.6,   // 60% - 30%
                    wordSpeed: 0.45,
                    spawnInterval: 2500,
                    maxActiveWords: 4,
                    damage: 20
                },
                {
                    name: 'Phase 3',
                    hpThreshold: 0.3,   // 30% - 0%
                    wordSpeed: 0.6,
                    spawnInterval: 2000,
                    maxActiveWords: 5,
                    damage: 25
                }
            ],

            // Visual: simple slime blob
            drawBody(ctx, x, y, size, time, hpPercent) {
                const wobble = Math.sin(time * 2) * 5;
                const squish = 1 + Math.sin(time * 3) * 0.05;

                // Shadow
                ctx.save();
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(x, y + size * 0.6, size * 0.7, size * 0.15, 0, 0, Math.PI * 2);
                ctx.fill();

                // Body
                const grad = ctx.createRadialGradient(x, y - 10, 0, x, y, size);
                grad.addColorStop(0, '#88ffbb');
                grad.addColorStop(0.5, '#44ff88');
                grad.addColorStop(1, '#22aa55');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(x, y + wobble * 0.3, size * 0.85 * squish, size * (1 / squish), 0, 0, Math.PI * 2);
                ctx.fill();

                // Glow
                ctx.shadowColor = '#44ff88';
                ctx.shadowBlur = 20;
                ctx.fillStyle = 'rgba(68, 255, 136, 0.1)';
                ctx.fill();

                // Eyes
                ctx.shadowBlur = 0;
                const eyeY = y - size * 0.15 + wobble * 0.3;
                // Left eye
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(x - size * 0.25, eyeY, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#112211';
                ctx.beginPath();
                ctx.arc(x - size * 0.22, eyeY + 2, size * 0.06, 0, Math.PI * 2);
                ctx.fill();

                // Right eye
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(x + size * 0.25, eyeY, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#112211';
                ctx.beginPath();
                ctx.arc(x + size * 0.28, eyeY + 2, size * 0.06, 0, Math.PI * 2);
                ctx.fill();

                // Angry mouth in later phases
                if (hpPercent < 0.6) {
                    ctx.strokeStyle = '#112211';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(x, eyeY + size * 0.25, size * 0.15, 0.1 * Math.PI, 0.9 * Math.PI);
                    ctx.stroke();
                }

                ctx.restore();
            }
        },

        2: {
            id: 2,
            name: 'Shadow Stalker',
            title: 'Phantom of the Keys',
            chapter: 2,
            color: '#aa44ff',
            glowColor: 'rgba(170, 68, 255, 0.4)',
            accentColor: '#8822dd',
            maxHP: 700,
            playerMaxHP: 200,
            phases: [
                { name: 'Phase 1', hpThreshold: 1.0, wordSpeed: 0.35, spawnInterval: 2800, maxActiveWords: 3, damage: 18 },
                { name: 'Phase 2', hpThreshold: 0.6, wordSpeed: 0.5, spawnInterval: 2200, maxActiveWords: 4, damage: 22 },
                { name: 'Phase 3', hpThreshold: 0.3, wordSpeed: 0.65, spawnInterval: 1800, maxActiveWords: 5, damage: 28 }
            ],
            drawBody(ctx, x, y, size, time, hpPercent) {
                const flicker = 0.7 + Math.sin(time * 5) * 0.3;
                ctx.save();

                // Shadow aura
                ctx.shadowColor = '#aa44ff';
                ctx.shadowBlur = 30 * flicker;

                // Body - ghostly triangle shape
                const grad = ctx.createRadialGradient(x, y - size * 0.2, 0, x, y, size);
                grad.addColorStop(0, `rgba(170, 68, 255, ${0.8 * flicker})`);
                grad.addColorStop(0.7, `rgba(100, 20, 200, ${0.5 * flicker})`);
                grad.addColorStop(1, 'rgba(50, 10, 100, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(x, y - size);
                ctx.bezierCurveTo(x + size * 0.8, y - size * 0.3, x + size * 0.6, y + size * 0.5, x + size * 0.3, y + size * 0.8);
                ctx.bezierCurveTo(x + size * 0.1, y + size, x - size * 0.1, y + size, x - size * 0.3, y + size * 0.8);
                ctx.bezierCurveTo(x - size * 0.6, y + size * 0.5, x - size * 0.8, y - size * 0.3, x, y - size);
                ctx.fill();

                // Eyes - glowing
                const eyeGlow = Math.sin(time * 3) * 0.3 + 0.7;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ff00ff';
                ctx.fillStyle = `rgba(255, 0, 255, ${eyeGlow})`;
                ctx.beginPath();
                ctx.ellipse(x - size * 0.2, y - size * 0.2, size * 0.08, size * 0.12, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(x + size * 0.2, y - size * 0.2, size * 0.08, size * 0.12, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        },

        3: {
            id: 3,
            name: 'Crystal Golem',
            title: 'Warden of the Upper Realm',
            chapter: 3,
            color: '#00ccff',
            glowColor: 'rgba(0, 204, 255, 0.4)',
            accentColor: '#0088cc',
            maxHP: 1000,
            playerMaxHP: 220,
            phases: [
                { name: 'Phase 1', hpThreshold: 1.0, wordSpeed: 0.4, spawnInterval: 2600, maxActiveWords: 4, damage: 20 },
                { name: 'Phase 2', hpThreshold: 0.6, wordSpeed: 0.55, spawnInterval: 2000, maxActiveWords: 5, damage: 25 },
                { name: 'Phase 3', hpThreshold: 0.3, wordSpeed: 0.7, spawnInterval: 1600, maxActiveWords: 6, damage: 30 }
            ],
            drawBody(ctx, x, y, size, time, hpPercent) {
                ctx.save();

                // Crystal body - geometric
                ctx.shadowColor = '#00ccff';
                ctx.shadowBlur = 20;

                const grad = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
                grad.addColorStop(0, '#00eeff');
                grad.addColorStop(0.5, '#0088cc');
                grad.addColorStop(1, '#004466');
                ctx.fillStyle = grad;

                // Main body - hexagon
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i - Math.PI / 2;
                    const px = x + Math.cos(angle) * size * 0.7;
                    const py = y + Math.sin(angle) * size * 0.7;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();

                // Crystal facets
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Inner crystal
                ctx.fillStyle = `rgba(0, 240, 255, ${0.3 + Math.sin(time * 2) * 0.2})`;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i - Math.PI / 2 + time * 0.5;
                    const px = x + Math.cos(angle) * size * 0.35;
                    const py = y + Math.sin(angle) * size * 0.35;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();

                // Eyes
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x - size * 0.2, y - size * 0.1, size * 0.07, 0, Math.PI * 2);
                ctx.arc(x + size * 0.2, y - size * 0.1, size * 0.07, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        },

        4: {
            id: 4,
            name: 'Venom Drake',
            title: 'Serpent of the Deep Keys',
            chapter: 4,
            color: '#ff4400',
            glowColor: 'rgba(255, 68, 0, 0.4)',
            accentColor: '#cc2200',
            maxHP: 1300,
            playerMaxHP: 240,
            phases: [
                { name: 'Phase 1', hpThreshold: 1.0, wordSpeed: 0.45, spawnInterval: 2400, maxActiveWords: 4, damage: 22 },
                { name: 'Phase 2', hpThreshold: 0.6, wordSpeed: 0.6, spawnInterval: 1800, maxActiveWords: 5, damage: 28 },
                { name: 'Phase 3', hpThreshold: 0.3, wordSpeed: 0.75, spawnInterval: 1400, maxActiveWords: 6, damage: 35 }
            ],
            drawBody(ctx, x, y, size, time, hpPercent) {
                ctx.save();
                ctx.shadowColor = '#ff4400';
                ctx.shadowBlur = 25;

                // Dragon-like body
                const breathe = Math.sin(time * 2) * 0.05;
                const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
                grad.addColorStop(0, '#ff6633');
                grad.addColorStop(0.6, '#cc2200');
                grad.addColorStop(1, '#661100');
                ctx.fillStyle = grad;

                // Body
                ctx.beginPath();
                ctx.ellipse(x, y, size * 0.6 * (1 + breathe), size * 0.8 * (1 - breathe), 0, 0, Math.PI * 2);
                ctx.fill();

                // Wings
                ctx.fillStyle = 'rgba(255, 68, 0, 0.5)';
                // Left wing
                ctx.beginPath();
                ctx.moveTo(x - size * 0.4, y - size * 0.2);
                ctx.bezierCurveTo(x - size * 1.2, y - size * 0.8, x - size * 1.0, y - size * 0.1, x - size * 0.5, y + size * 0.2);
                ctx.fill();
                // Right wing
                ctx.beginPath();
                ctx.moveTo(x + size * 0.4, y - size * 0.2);
                ctx.bezierCurveTo(x + size * 1.2, y - size * 0.8, x + size * 1.0, y - size * 0.1, x + size * 0.5, y + size * 0.2);
                ctx.fill();

                // Eyes - fiery
                ctx.shadowColor = '#ffaa00';
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#ffcc00';
                ctx.beginPath();
                ctx.ellipse(x - size * 0.18, y - size * 0.2, size * 0.07, size * 0.1, -0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(x + size * 0.18, y - size * 0.2, size * 0.07, size * 0.1, 0.2, 0, Math.PI * 2);
                ctx.fill();

                // Fire breath particles in phase 3
                if (hpPercent < 0.3) {
                    ctx.fillStyle = `rgba(255, 100, 0, ${0.3 + Math.random() * 0.3})`;
                    for (let i = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.arc(
                            x + Utils.randFloat(-size * 0.3, size * 0.3),
                            y + size * 0.5 + Utils.randFloat(0, size * 0.4),
                            Utils.randFloat(2, 6), 0, Math.PI * 2
                        );
                        ctx.fill();
                    }
                }

                ctx.restore();
            }
        },

        5: {
            id: 5,
            name: 'Cyber Overlord',
            title: 'Master of All Keys',
            chapter: 5,
            color: '#00ff88',
            glowColor: 'rgba(0, 255, 136, 0.4)',
            accentColor: '#00cc66',
            maxHP: 1600,
            playerMaxHP: 260,
            phases: [
                { name: 'Phase 1', hpThreshold: 1.0, wordSpeed: 0.5, spawnInterval: 2200, maxActiveWords: 5, damage: 25 },
                { name: 'Phase 2', hpThreshold: 0.6, wordSpeed: 0.65, spawnInterval: 1600, maxActiveWords: 6, damage: 30 },
                { name: 'Phase 3', hpThreshold: 0.3, wordSpeed: 0.8, spawnInterval: 1200, maxActiveWords: 7, damage: 35 }
            ],
            drawBody(ctx, x, y, size, time, hpPercent) {
                ctx.save();
                ctx.shadowColor = '#00ff88';
                ctx.shadowBlur = 25;

                // Digital/circuit aesthetic
                const pulse = Math.sin(time * 4) * 0.2 + 0.8;

                // Outer ring
                ctx.strokeStyle = `rgba(0, 255, 136, ${pulse * 0.6})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
                ctx.stroke();

                // Rotating inner ring
                ctx.strokeStyle = `rgba(0, 240, 255, ${pulse * 0.4})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, size * 0.65, time, time + Math.PI * 1.5);
                ctx.stroke();

                // Core
                const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.5);
                coreGrad.addColorStop(0, '#00ff88');
                coreGrad.addColorStop(0.5, '#008844');
                coreGrad.addColorStop(1, '#003322');
                ctx.fillStyle = coreGrad;
                ctx.beginPath();
                ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
                ctx.fill();

                // Circuit lines
                ctx.strokeStyle = `rgba(0, 255, 136, ${0.3 + Math.sin(time * 6) * 0.2})`;
                ctx.lineWidth = 1;
                for (let i = 0; i < 4; i++) {
                    const angle = (Math.PI / 2) * i + time * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(x + Math.cos(angle) * size * 0.5, y + Math.sin(angle) * size * 0.5);
                    ctx.lineTo(x + Math.cos(angle) * size * 0.9, y + Math.sin(angle) * size * 0.9);
                    ctx.stroke();
                }

                // Eye
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y - size * 0.05, size * 0.1 * pulse, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        },

        6: {
            id: 6,
            name: 'The Architect',
            title: 'Creator of the Digital Realm',
            chapter: 6,
            color: '#ffd700',
            glowColor: 'rgba(255, 215, 0, 0.5)',
            accentColor: '#ffaa00',
            maxHP: 2000,
            playerMaxHP: 300,
            phases: [
                { name: 'Phase 1', hpThreshold: 1.0, wordSpeed: 0.55, spawnInterval: 2000, maxActiveWords: 5, damage: 28 },
                { name: 'Phase 2', hpThreshold: 0.6, wordSpeed: 0.7, spawnInterval: 1500, maxActiveWords: 6, damage: 35 },
                { name: 'Phase 3', hpThreshold: 0.3, wordSpeed: 0.85, spawnInterval: 1000, maxActiveWords: 8, damage: 40 }
            ],
            drawBody(ctx, x, y, size, time, hpPercent) {
                ctx.save();
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 30;

                // The Architect - geometric deity
                const rotate = time * 0.5;

                // Outer geometric shape (rotating octagon)
                ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + Math.sin(time * 2) * 0.2})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI / 4) * i + rotate;
                    const px = x + Math.cos(angle) * size;
                    const py = y + Math.sin(angle) * size;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.stroke();

                // Inner star
                ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI / 4) * i - rotate;
                    const r = i % 2 === 0 ? size * 0.7 : size * 0.35;
                    const px = x + Math.cos(angle) * r;
                    const py = y + Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();

                // Core orb
                const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.35);
                coreGrad.addColorStop(0, '#ffffff');
                coreGrad.addColorStop(0.3, '#ffd700');
                coreGrad.addColorStop(0.7, '#ff8800');
                coreGrad.addColorStop(1, '#663300');
                ctx.fillStyle = coreGrad;
                ctx.beginPath();
                ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
                ctx.fill();

                // All-seeing eye
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.ellipse(x, y, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(x, y, size * 0.04, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }
    },

    /**
     * Get boss for a chapter
     */
    getBoss(chapterId) {
        return this.bosses[chapterId] || this.bosses[1];
    },

    /**
     * Get current phase for a boss based on HP percentage
     */
    getCurrentPhase(boss, hpPercent) {
        for (let i = boss.phases.length - 1; i >= 0; i--) {
            if (hpPercent <= boss.phases[i].hpThreshold) {
                return { phase: boss.phases[i], index: i };
            }
        }
        return { phase: boss.phases[0], index: 0 };
    }
};
