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
