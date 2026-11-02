/* ============================================= */
/* PARTICLES.JS — Particle Effects System         */
/* ============================================= */

const Particles = (() => {
    let particles = [];
    let ambientParticles = [];

    class Particle {
        constructor(x, y, options = {}) {
            this.x = x;
            this.y = y;
            this.vx = options.vx || (Math.random() - 0.5) * 6;
            this.vy = options.vy || (Math.random() - 0.5) * 6;
            this.size = options.size || Utils.randFloat(2, 5);
            this.color = options.color || '#00f0ff';
            this.alpha = options.alpha || 1;
            this.decay = options.decay || Utils.randFloat(0.015, 0.04);
            this.gravity = options.gravity || 0;
            this.friction = options.friction || 0.98;
            this.glow = options.glow || false;
            this.shape = options.shape || 'circle'; // 'circle', 'square', 'star'
        }

        update() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
            this.size *= 0.99;
            return this.alpha > 0 && this.size > 0.3;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;

            if (this.glow) {
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 10;
            }

            ctx.fillStyle = this.color;

            if (this.shape === 'square') {
                ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
            } else if (this.shape === 'star') {
                this.drawStar(ctx, this.x, this.y, 5, this.size, this.size / 2);
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        drawStar(ctx, cx, cy, spikes, outerR, innerR) {
            let rot = Math.PI / 2 * 3;
            const step = Math.PI / spikes;
            ctx.beginPath();
            ctx.moveTo(cx, cy - outerR);
            for (let i = 0; i < spikes; i++) {
                ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
                rot += step;
                ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
                rot += step;
            }
            ctx.closePath();
            ctx.fill();
        }
    }

    /**
     * Spawn an explosion of particles
     */
    function explode(x, y, count = 20, options = {}) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Utils.randFloat(-0.3, 0.3);
            const speed = Utils.randFloat(options.minSpeed || 2, options.maxSpeed || 8);
            particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: options.color || Utils.randPick(['#00f0ff', '#00ff88', '#ffffff', '#88ddff']),
                size: options.size || Utils.randFloat(2, 5),
                decay: options.decay || Utils.randFloat(0.015, 0.035),
                gravity: options.gravity || 0.05,
                glow: options.glow !== undefined ? options.glow : true,
                shape: options.shape || Utils.randPick(['circle', 'square'])
            }));
        }
    }

    /**
     * Word completion burst
     */
    function wordBurst(x, y, color = '#00f0ff') {
        explode(x, y, 15, {
            color: color,
            minSpeed: 2,
            maxSpeed: 6,
            size: Utils.randFloat(2, 4),
            glow: true,
            gravity: 0.03
        });
    }

    /**
     * Boss hit impact
     */
    function bossHitBurst(x, y, color = '#ff00aa') {
        explode(x, y, 30, {
            color: color,
            minSpeed: 3,
            maxSpeed: 10,
            size: Utils.randFloat(3, 6),
            glow: true,
            gravity: 0.08,
            shape: 'star'
        });
    }

    /**
     * Critical hit massive explosion
     */
    function criticalBurst(x, y) {
        const colors = ['#ffd700', '#ff8800', '#ffaa00', '#ffffff'];
        explode(x, y, 50, {
            color: undefined,
            minSpeed: 4,
            maxSpeed: 14,
            size: Utils.randFloat(3, 8),
            glow: true,
            gravity: 0.06
        });
        // Override with gold colors
        for (let i = particles.length - 50; i < particles.length; i++) {
            if (particles[i]) particles[i].color = Utils.randPick(colors);
        }
    }

    /**
     * Boss death explosion (massive)
     */
    function bossDeathExplosion(x, y) {
        // Multiple waves
        for (let wave = 0; wave < 3; wave++) {
            setTimeout(() => {
                const colors = ['#ff00aa', '#ff2255', '#aa44ff', '#ff8800', '#ffd700', '#ffffff'];
                explode(x + Utils.randFloat(-30, 30), y + Utils.randFloat(-30, 30), 40, {
                    minSpeed: 5,
                    maxSpeed: 15,
                    glow: true,
                    gravity: 0.05,
                    decay: 0.01
                });
                for (let i = Math.max(0, particles.length - 40); i < particles.length; i++) {
                    if (particles[i]) {
                        particles[i].color = Utils.randPick(colors);
                        particles[i].shape = Utils.randPick(['circle', 'star', 'square']);
                    }
                }
            }, wave * 200);
        }
    }

    /**
     * Player damage effect
     */
    function playerDamageEffect(x, y) {
        explode(x, y, 12, {
            color: '#ff2255',
            minSpeed: 2,
            maxSpeed: 5,
            glow: true,
            gravity: 0.1
        });
    }

    /**
     * Ambient floating particles (rendered in battle canvas)
     */
    function spawnAmbient(canvasWidth, canvasHeight) {
        if (ambientParticles.length < 30) {
            ambientParticles.push({
                x: Utils.randFloat(0, canvasWidth),
                y: canvasHeight + 10,
                vy: Utils.randFloat(-0.3, -0.8),
                vx: Utils.randFloat(-0.2, 0.2),
                size: Utils.randFloat(1, 3),
                alpha: Utils.randFloat(0.1, 0.4),
                color: Utils.randPick(['#00f0ff', '#ff00aa', '#aa44ff', '#ffd700']),
            });
        }
    }

    /**
     * Update and draw all particles on a canvas context
     */
    function update(ctx) {
        particles = particles.filter(p => {
            const alive = p.update();
            if (alive) p.draw(ctx);
            return alive;
        });
    }

    /**
     * Update and draw ambient particles
     */
    function updateAmbient(ctx, canvasWidth, canvasHeight) {
        spawnAmbient(canvasWidth, canvasHeight);

        ambientParticles = ambientParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.001;

            if (p.alpha <= 0 || p.y < -20) return false;

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            return true;
        });
    }

    /**
     * Clear all particles
     */
    function clear() {
        particles = [];
        ambientParticles = [];
    }

    /**
     * Trail particle effect (follows a path)
     */
    function spawnTrail(x, y, color = '#00f0ff', count = 5) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x + Utils.randFloat(-5, 5), y + Utils.randFloat(-5, 5), {
                vx: Utils.randFloat(-1, 1),
                vy: Utils.randFloat(-1, 1),
                color: color,
                size: Utils.randFloat(1.5, 3.5),
                decay: Utils.randFloat(0.03, 0.06),
                glow: true,
                friction: 0.95
            }));
        }
    }

    /**
     * Shockwave ring effect
     */
    function shockwave(x, y, color = '#00f0ff', count = 24) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = Utils.randFloat(6, 12);
            particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: Utils.randFloat(2, 4),
                decay: Utils.randFloat(0.04, 0.06),
                glow: true,
                gravity: 0,
                friction: 0.92
            }));
        }
    }

    /**
     * Energy wave — sweeping arc of particles
     */
    function energyWave(fromX, fromY, toX, toY, color = '#00f0ff') {
        const dx = toX - fromX;
        const dy = toY - fromY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.min(20, Math.floor(dist / 15));
        const angle = Math.atan2(dy, dx);

        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const px = Utils.lerp(fromX, toX, t) + Utils.randFloat(-10, 10);
            const py = Utils.lerp(fromY, toY, t) + Utils.randFloat(-10, 10);
            const perpX = Math.cos(angle + Math.PI / 2) * Utils.randFloat(-5, 5);
            const perpY = Math.sin(angle + Math.PI / 2) * Utils.randFloat(-5, 5);

            setTimeout(() => {
                particles.push(new Particle(px + perpX, py + perpY, {
                    vx: Math.cos(angle) * 2 + Utils.randFloat(-1, 1),
                    vy: Math.sin(angle) * 2 + Utils.randFloat(-1, 1),
                    color: color,
                    size: Utils.randFloat(2, 5),
                    decay: Utils.randFloat(0.03, 0.05),
                    glow: true,
                    gravity: 0,
                    friction: 0.96
                }));
            }, i * 15);
        }
    }

    /**
     * Combo fire — continuous upward flame particles
     */
    function comboFire(x, y, color = '#ff6600', intensity = 1) {
        const count = Math.ceil(3 * intensity);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x + Utils.randFloat(-15, 15), y, {
                vx: Utils.randFloat(-1.5, 1.5),
                vy: Utils.randFloat(-4, -1.5),
                color: Utils.randPick([color, '#ffaa00', '#ffffff']),
                size: Utils.randFloat(2, 5 * intensity),
                decay: Utils.randFloat(0.03, 0.05),
                glow: true,
                gravity: -0.02,
                friction: 0.97,
                shape: Utils.randPick(['circle', 'circle', 'star'])
            }));
        }
    }

    /**
     * Level up / milestone celebration burst
     */
    function celebrationBurst(x, y) {
        const colors = ['#ffd700', '#ff00aa', '#00f0ff', '#00ff88', '#aa44ff', '#ffffff'];
        explode(x, y, 60, {
            minSpeed: 3,
            maxSpeed: 12,
            glow: true,
            gravity: 0.08,
            decay: 0.012
        });
        for (let i = Math.max(0, particles.length - 60); i < particles.length; i++) {
            if (particles[i]) {
                particles[i].color = Utils.randPick(colors);
                particles[i].shape = Utils.randPick(['circle', 'star', 'square']);
                particles[i].size = Utils.randFloat(2, 7);
            }
        }
    }

    return {
        explode,
        wordBurst,
        bossHitBurst,
        criticalBurst,
        bossDeathExplosion,
        playerDamageEffect,
        spawnTrail,
        shockwave,
        energyWave,
        comboFire,
        celebrationBurst,
        update,
        updateAmbient,
        clear
    };
})();
