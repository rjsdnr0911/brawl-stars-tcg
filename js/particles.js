// 브롤스타즈 TCG - Canvas 파티클 시스템

(function() {
    'use strict';

    const DEBUG = true;
    const MAX_PARTICLES = 200;
    const FPS = 60;
    const FRAME_TIME = 1000 / FPS;

    let canvas = null;
    let ctx = null;
    let particles = [];
    let particlePool = [];
    let lastFrameTime = 0;
    let animationFrameId = null;

    // ===== Particle 클래스 =====
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
            this.color = '#ffffff';
            this.size = 3;
            this.life = 1.0;
            this.maxLife = 1.0;
            this.alpha = 1.0;
            this.gravity = 0;
        }

        init(x, y, vx, vy, color, size, life, gravity) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color || '#ffffff';
            this.size = size || 3;
            this.life = life || 1.0;
            this.maxLife = life || 1.0;
            this.alpha = 1.0;
            this.gravity = gravity || 0;
        }

        update(deltaTime) {
            if (!deltaTime || deltaTime <= 0) return;

            // 속도 적용
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;

            // 중력 적용
            this.vy += this.gravity * deltaTime;

            // 수명 감소
            this.life -= deltaTime;

            // 알파값 계산 (페이드아웃)
            this.alpha = Math.max(0, this.life / this.maxLife);

            return this.life > 0;
        }

        render(ctx) {
            if (!ctx || this.alpha <= 0) return;

            try {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } catch (error) {
                console.error('Particle render 오류:', error);
            }
        }
    }

    // ===== 객체 풀링 =====
    function getParticle() {
        if (particlePool.length > 0) {
            return particlePool.pop();
        }
        return new Particle();
    }

    function releaseParticle(particle) {
        if (!particle) return;
        particle.reset();
        particlePool.push(particle);
    }

    // ===== ParticleSystem API =====
    const ParticleSystem = {
        // 초기화
        init: function(canvasId) {
            try {
                canvas = document.getElementById(canvasId);
                if (!canvas) {
                    console.error('Canvas를 찾을 수 없습니다:', canvasId);
                    return false;
                }

                ctx = canvas.getContext('2d');
                if (!ctx) {
                    console.error('Canvas 2D context를 가져올 수 없습니다');
                    return false;
                }

                // Canvas 크기 설정
                this.resize();
                window.addEventListener('resize', () => this.resize());

                // 애니메이션 루프 시작
                lastFrameTime = performance.now();
                this.loop();

                if (DEBUG) {
                    console.log('파티클 시스템 초기화 완료');
                }

                return true;
            } catch (error) {
                console.error('ParticleSystem.init 오류:', error);
                return false;
            }
        },

        // Canvas 리사이즈
        resize: function() {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        },

        // 폭발 효과 (원형 분산)
        createExplosion: function(x, y, count, color) {
            if (!canvas) return;

            try {
                count = Math.min(count || 50, MAX_PARTICLES - particles.length);
                color = color || '#ff6b6b';

                for (let i = 0; i < count; i++) {
                    const particle = getParticle();
                    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
                    const speed = 0.1 + Math.random() * 0.2;

                    particle.init(
                        x,
                        y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        color,
                        2 + Math.random() * 3,
                        1 + Math.random() * 0.5,
                        0.0002
                    );

                    particles.push(particle);
                }

                if (DEBUG && count > 0) {
                    console.log('폭발 효과:', count + '개 파티클 생성');
                }
            } catch (error) {
                console.error('createExplosion 오류:', error);
            }
        },

        // 반짝임 효과 (위로 떠오름)
        createSparkle: function(x, y, count) {
            if (!canvas) return;

            try {
                count = Math.min(count || 20, MAX_PARTICLES - particles.length);

                for (let i = 0; i < count; i++) {
                    const particle = getParticle();
                    const offsetX = (Math.random() - 0.5) * 0.05;
                    const offsetY = -0.05 - Math.random() * 0.1;

                    particle.init(
                        x + (Math.random() - 0.5) * 30,
                        y + (Math.random() - 0.5) * 30,
                        offsetX,
                        offsetY,
                        '#ffd700',
                        1 + Math.random() * 2,
                        1.5 + Math.random() * 1,
                        0
                    );

                    particles.push(particle);
                }

                if (DEBUG && count > 0) {
                    console.log('반짝임 효과:', count + '개 파티클 생성');
                }
            } catch (error) {
                console.error('createSparkle 오류:', error);
            }
        },

        // 이동 트레일 (베지어 곡선)
        createTrail: function(x1, y1, x2, y2, color) {
            if (!canvas) return;

            try {
                const count = Math.min(20, MAX_PARTICLES - particles.length);
                color = color || '#3498db';

                // 베지어 곡선 제어점
                const controlX = (x1 + x2) / 2;
                const controlY = Math.min(y1, y2) - 100;

                for (let i = 0; i < count; i++) {
                    const t = i / count;

                    // 2차 베지어 곡선 계산
                    const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * controlX + t * t * x2;
                    const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * controlY + t * t * y2;

                    const particle = getParticle();
                    particle.init(
                        bx,
                        by,
                        0,
                        0,
                        color,
                        2 + Math.random() * 2,
                        0.5 + t * 0.5,
                        0
                    );

                    particles.push(particle);
                }

                if (DEBUG && count > 0) {
                    console.log('트레일 효과:', count + '개 파티클 생성');
                }
            } catch (error) {
                console.error('createTrail 오류:', error);
            }
        },

        // 공격 충격파 (원형 확산)
        createAttackImpact: function(x, y, damage) {
            if (!canvas) return;

            try {
                // 데미지가 클수록 더 많은 파티클
                const baseCount = 30;
                const bonusCount = Math.floor(damage / 10);
                const count = Math.min(baseCount + bonusCount, MAX_PARTICLES - particles.length);

                // 데미지에 따른 색상 (약한 공격 = 노란색, 강한 공격 = 빨간색)
                const hue = damage > 40 ? 0 : damage > 20 ? 30 : 50;
                const color = `hsl(${hue}, 100%, 60%)`;

                for (let i = 0; i < count; i++) {
                    const particle = getParticle();
                    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
                    const speed = 0.15 + Math.random() * 0.25;

                    particle.init(
                        x,
                        y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        color,
                        3 + Math.random() * 4,
                        0.8 + Math.random() * 0.4,
                        0.0003
                    );

                    particles.push(particle);
                }

                if (DEBUG && count > 0) {
                    console.log('공격 충격파:', damage + '데미지,', count + '개 파티클');
                }
            } catch (error) {
                console.error('createAttackImpact 오류:', error);
            }
        },

        // 충격파 링 효과 (확장하는 원)
        createShockwave: function(x, y, damage) {
            if (!canvas) return;

            try {
                const count = Math.min(60, MAX_PARTICLES - particles.length);
                const hue = damage > 40 ? 0 : damage > 20 ? 30 : 50;

                for (let i = 0; i < count; i++) {
                    const particle = getParticle();
                    const angle = (Math.PI * 2 * i) / count;
                    const speed = 0.3 + Math.random() * 0.1;

                    particle.init(
                        x,
                        y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        `hsla(${hue}, 100%, 70%, 0.8)`,
                        2 + Math.random() * 2,
                        0.6 + Math.random() * 0.2,
                        0
                    );

                    particles.push(particle);
                }

                if (DEBUG && count > 0) {
                    console.log('충격파 링:', count + '개 파티클');
                }
            } catch (error) {
                console.error('createShockwave 오류:', error);
            }
        },

        // 강력한 공격 폭발 (다층 폭발)
        createAttackExplosion: function(x, y, damage) {
            if (!canvas) return;

            try {
                // 중심 폭발
                this.createAttackImpact(x, y, damage);

                // 충격파 링 (지연)
                setTimeout(() => {
                    this.createShockwave(x, y, damage);
                }, 50);

                // 추가 불꽃 파티클 (강한 공격만)
                if (damage > 30) {
                    setTimeout(() => {
                        const sparkCount = Math.min(20, MAX_PARTICLES - particles.length);
                        for (let i = 0; i < sparkCount; i++) {
                            const particle = getParticle();
                            const angle = Math.random() * Math.PI * 2;
                            const speed = 0.1 + Math.random() * 0.15;

                            particle.init(
                                x,
                                y,
                                Math.cos(angle) * speed,
                                Math.sin(angle) * speed,
                                '#ff6b00',
                                4 + Math.random() * 3,
                                1.0 + Math.random() * 0.5,
                                0.0004
                            );

                            particles.push(particle);
                        }
                    }, 100);
                }

                if (DEBUG) {
                    console.log('공격 폭발 (다층):', damage + '데미지');
                }
            } catch (error) {
                console.error('createAttackExplosion 오류:', error);
            }
        },

        // 진화 빛 폭발 (Pokemon TCG Pocket 스타일)
        createEvolutionBurst: function(x, y) {
            if (!canvas) return;

            try {
                // 1단계: 중심 빛 폭발 (골드)
                const burstCount = Math.min(80, MAX_PARTICLES - particles.length);
                for (let i = 0; i < burstCount; i++) {
                    const particle = getParticle();
                    const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.2;
                    const speed = 0.2 + Math.random() * 0.3;

                    particle.init(
                        x,
                        y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        '#FFD700',  // 골드
                        4 + Math.random() * 5,
                        1.5 + Math.random() * 0.5,
                        0.0002
                    );

                    particles.push(particle);
                }

                // 2단계: 보라색 에너지 (지연)
                setTimeout(() => {
                    const energyCount = Math.min(50, MAX_PARTICLES - particles.length);
                    for (let i = 0; i < energyCount; i++) {
                        const particle = getParticle();
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 0.15 + Math.random() * 0.2;

                        particle.init(
                            x,
                            y,
                            Math.cos(angle) * speed,
                            Math.sin(angle) * speed,
                            '#9B59B6',  // 보라색
                            3 + Math.random() * 4,
                            1.2 + Math.random() * 0.5,
                            0.0003
                        );

                        particles.push(particle);
                    }
                }, 150);

                // 3단계: 반짝이는 별 (위로 떠오름)
                setTimeout(() => {
                    const starCount = Math.min(40, MAX_PARTICLES - particles.length);
                    for (let i = 0; i < starCount; i++) {
                        const particle = getParticle();
                        const offsetX = (Math.random() - 0.5) * 0.1;
                        const offsetY = -0.08 - Math.random() * 0.15;

                        particle.init(
                            x + (Math.random() - 0.5) * 50,
                            y + (Math.random() - 0.5) * 50,
                            offsetX,
                            offsetY,
                            Math.random() > 0.5 ? '#FFD700' : '#FFF',
                            2 + Math.random() * 3,
                            2.0 + Math.random() * 1.0,
                            0
                        );

                        particles.push(particle);
                    }
                }, 300);

                if (DEBUG) {
                    console.log('진화 빛 폭발 효과 생성');
                }
            } catch (error) {
                console.error('createEvolutionBurst 오류:', error);
            }
        },

        // 업데이트
        update: function(deltaTime) {
            if (deltaTime <= 0 || deltaTime > 100) return;

            const dt = deltaTime / 1000;

            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];

                if (!particle.update(dt)) {
                    particles.splice(i, 1);
                    releaseParticle(particle);
                }
            }
        },

        // 렌더링
        render: function() {
            if (!ctx || !canvas) return;

            try {
                // Canvas 지우기
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 모든 파티클 렌더링
                for (let i = 0; i < particles.length; i++) {
                    particles[i].render(ctx);
                }
            } catch (error) {
                console.error('render 오류:', error);
            }
        },

        // 애니메이션 루프
        loop: function() {
            try {
                const currentTime = performance.now();
                const deltaTime = currentTime - lastFrameTime;

                if (deltaTime >= FRAME_TIME) {
                    this.update(deltaTime);
                    this.render();
                    lastFrameTime = currentTime - (deltaTime % FRAME_TIME);
                }

                animationFrameId = requestAnimationFrame(() => this.loop());
            } catch (error) {
                console.error('loop 오류:', error);
            }
        },

        // 정리
        destroy: function() {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            particles = [];
            particlePool = [];
            canvas = null;
            ctx = null;
        },

        // 승리 축하 효과 (Pokemon TCG Pocket 스타일)
        createVictoryCelebration: function() {
            if (!canvas) return;

            try {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                // 1단계: 중앙 골드 폭발 (100개)
                const explosionCount = Math.min(100, MAX_PARTICLES - particles.length);
                for (let i = 0; i < explosionCount; i++) {
                    const particle = getParticle();
                    const angle = (Math.PI * 2 * i) / explosionCount + (Math.random() - 0.5) * 0.3;
                    const speed = 0.25 + Math.random() * 0.35;

                    particle.init(
                        centerX,
                        centerY,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        Math.random() > 0.5 ? '#FFD700' : '#FFA500',
                        5 + Math.random() * 6,
                        2.0 + Math.random() * 1.0,
                        0.0002
                    );

                    particles.push(particle);
                }

                // 2단계: 위로 솟구치는 불꽃 (150ms 후)
                setTimeout(() => {
                    const fireCount = Math.min(60, MAX_PARTICLES - particles.length);
                    for (let i = 0; i < fireCount; i++) {
                        const particle = getParticle();
                        const offsetX = (Math.random() - 0.5) * 0.15;
                        const offsetY = -0.3 - Math.random() * 0.2;

                        particle.init(
                            centerX + (Math.random() - 0.5) * 200,
                            centerY,
                            offsetX,
                            offsetY,
                            '#FF6B00',
                            6 + Math.random() * 5,
                            1.5 + Math.random() * 1.0,
                            0.0004
                        );

                        particles.push(particle);
                    }
                }, 150);

                // 3단계: 떨어지는 색종이 (300ms 후)
                setTimeout(() => {
                    const confettiCount = Math.min(80, MAX_PARTICLES - particles.length);
                    const colors = ['#FF1744', '#00E676', '#2979FF', '#FFD700', '#FF6B00', '#E040FB'];

                    for (let i = 0; i < confettiCount; i++) {
                        const particle = getParticle();
                        const x = Math.random() * canvas.width;
                        const offsetX = (Math.random() - 0.5) * 0.1;
                        const offsetY = 0.05 + Math.random() * 0.15;

                        particle.init(
                            x,
                            -50,
                            offsetX,
                            offsetY,
                            colors[Math.floor(Math.random() * colors.length)],
                            4 + Math.random() * 4,
                            3.0 + Math.random() * 2.0,
                            0.0001
                        );

                        particles.push(particle);
                    }
                }, 300);

                // 4단계: 반짝이는 별 (600ms 후)
                setTimeout(() => {
                    const starCount = Math.min(50, MAX_PARTICLES - particles.length);
                    for (let i = 0; i < starCount; i++) {
                        const particle = getParticle();
                        const x = Math.random() * canvas.width;
                        const y = Math.random() * canvas.height;
                        const offsetX = (Math.random() - 0.5) * 0.05;
                        const offsetY = -0.02 - Math.random() * 0.08;

                        particle.init(
                            x,
                            y,
                            offsetX,
                            offsetY,
                            '#FFF',
                            3 + Math.random() * 3,
                            2.0 + Math.random() * 1.5,
                            0
                        );

                        particles.push(particle);
                    }
                }, 600);

                if (DEBUG) {
                    console.log('승리 축하 효과 생성');
                }
            } catch (error) {
                console.error('createVictoryCelebration 오류:', error);
            }
        },

        // 패배 효과 (Pokemon TCG Pocket 스타일)
        createDefeatEffect: function() {
            if (!canvas) return;

            try {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                // 1단계: 중앙에서 퍼지는 어두운 파장 (60개)
                const waveCount = Math.min(60, MAX_PARTICLES - particles.length);
                for (let i = 0; i < waveCount; i++) {
                    const particle = getParticle();
                    const angle = (Math.PI * 2 * i) / waveCount;
                    const speed = 0.1 + Math.random() * 0.15;

                    particle.init(
                        centerX,
                        centerY,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        '#546E7A',
                        4 + Math.random() * 4,
                        1.5 + Math.random() * 0.5,
                        0.0002
                    );

                    particles.push(particle);
                }

                // 2단계: 위에서 떨어지는 어두운 입자들 (200ms 후)
                setTimeout(() => {
                    const fallCount = Math.min(70, MAX_PARTICLES - particles.length);
                    for (let i = 0; i < fallCount; i++) {
                        const particle = getParticle();
                        const x = Math.random() * canvas.width;
                        const offsetX = (Math.random() - 0.5) * 0.05;
                        const offsetY = 0.08 + Math.random() * 0.12;

                        particle.init(
                            x,
                            -50,
                            offsetX,
                            offsetY,
                            Math.random() > 0.5 ? '#78909C' : '#90A4AE',
                            3 + Math.random() * 3,
                            2.5 + Math.random() * 1.5,
                            0.0001
                        );

                        particles.push(particle);
                    }
                }, 200);

                // 3단계: 중앙에서 천천히 사라지는 파란 불꽃 (400ms 후)
                setTimeout(() => {
                    const emberCount = Math.min(40, MAX_PARTICLES - particles.length);
                    for (let i = 0; i < emberCount; i++) {
                        const particle = getParticle();
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 0.05 + Math.random() * 0.1;

                        particle.init(
                            centerX + (Math.random() - 0.5) * 100,
                            centerY + (Math.random() - 0.5) * 100,
                            Math.cos(angle) * speed,
                            Math.sin(angle) * speed,
                            '#607D8B',
                            2 + Math.random() * 3,
                            2.0 + Math.random() * 1.0,
                            0
                        );

                        particles.push(particle);
                    }
                }, 400);

                if (DEBUG) {
                    console.log('패배 효과 생성');
                }
            } catch (error) {
                console.error('createDefeatEffect 오류:', error);
            }
        },

        // 상태 정보
        getStats: function() {
            return {
                activeParticles: particles.length,
                pooledParticles: particlePool.length,
                maxParticles: MAX_PARTICLES
            };
        }
    };

    // 전역 노출
    window.ParticleSystem = ParticleSystem;

    if (DEBUG) {
        console.log('파티클 시스템 로드 완료');
    }
})();
