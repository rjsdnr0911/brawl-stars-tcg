// 브롤스타즈 TCG - 메인 게임 로직
// Pokemon TCG Pocket 스타일

(function() {
    'use strict';

    const DEBUG = true;

    // ===== 게임 상태 =====
    let gameState = {
        player: {
            deck: [],
            hand: [],
            battleZone: null,  // 배틀존 1개
            bench: [],         // 벤치 최대 3개
            prizes: 0,         // 획득한 점수
            energyZone: [],    // 에너지존 (생성된 에너지 임시 보관)
            discardPile: [],   // 버린 더미
            skipNextDraw: false,  // 다음 드로우 스킵 플래그
            energyAttachedThisTurn: false,
            supporterUsedThisTurn: false
        },
        ai: {
            deck: [],
            hand: [],
            battleZone: null,
            bench: [],
            prizes: 0,
            energyZone: [],
            discardPile: [],   // 버린 더미
            skipNextDraw: false,  // 다음 드로우 스킵 플래그
            energyAttachedThisTurn: false,
            supporterUsedThisTurn: false
        },
        currentPlayer: 'player', // 'player' or 'ai'
        turnCount: 0,
        gameOver: false,
        winner: null
    };

    // ===== Fisher-Yates 셔플 =====
    function shuffleDeck(deck) {
        if (!Array.isArray(deck)) {
            console.error('shuffleDeck: 잘못된 deck');
            return deck;
        }

        try {
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            return deck;
        } catch (error) {
            console.error('shuffleDeck 오류:', error);
            return deck;
        }
    }

    // ===== 기본 덱 생성 (20장) =====
    function createDefaultDeck() {
        const deck = [];

        try {
            // 브롤러 (10장)
            deck.push(window.CardDB.get('shelly'));
            deck.push(window.CardDB.get('shelly'));
            deck.push(window.CardDB.get('bandita_shelly'));
            deck.push(window.CardDB.get('colt'));
            deck.push(window.CardDB.get('nita'));
            deck.push(window.CardDB.get('poco'));
            deck.push(window.CardDB.get('poco'));
            deck.push(window.CardDB.get('serenade_poco'));
            deck.push(window.CardDB.get('bull'));
            deck.push(window.CardDB.get('bull'));

            // 트레이너 (10장)
            deck.push(window.CardDB.get('super_potion'));
            deck.push(window.CardDB.get('super_potion'));
            deck.push(window.CardDB.get('brawl_ball'));
            deck.push(window.CardDB.get('brawl_ball'));
            deck.push(window.CardDB.get('speed_boots'));
            deck.push(window.CardDB.get('gales_supply'));
            deck.push(window.CardDB.get('gales_supply'));
            deck.push(window.CardDB.get('taras_portal'));
            deck.push(window.CardDB.get('crows_poison'));
            deck.push(window.CardDB.get('crows_poison'));

            // null 제거
            return deck.filter(card => card !== null);
        } catch (error) {
            console.error('createDefaultDeck 오류:', error);
            return [];
        }
    }

    // ===== 카드 드로우 =====
    function drawCard(player) {
        if (!player || !Array.isArray(player.deck) || !Array.isArray(player.hand)) {
            console.error('drawCard: 잘못된 player');
            return null;
        }

        try {
            if (player.deck.length === 0) {
                if (DEBUG) console.log('덱이 비었습니다');
                return null;
            }

            const card = player.deck.shift();
            player.hand.push(card);

            // 카드 드로우 애니메이션 재생 (Pokemon TCG Pocket 스타일)
            const playerType = (player === gameState.player) ? 'player' : 'ai';
            if (typeof window.UI !== 'undefined' && window.UI.playCardDrawAnimation) {
                window.UI.playCardDrawAnimation(playerType, card);
            }

            if (DEBUG) {
                console.log('카드 드로우:', card.name);
            }

            return card;
        } catch (error) {
            console.error('drawCard 오류:', error);
            return null;
        }
    }

    // ===== 게임 초기화 =====
    function initGame() {
        if (DEBUG) console.log('=== 게임 초기화 ===');

        try {
            // 플레이어 덱 생성 (DeckBuilder 우선, 없으면 기본 덱)
            let playerDeck = null;
            if (typeof window.DeckBuilder !== 'undefined' && window.DeckBuilder.currentDeck) {
                // DeckBuilder에서 덱 로드
                const customDeck = window.DeckBuilder.convertToArray(window.DeckBuilder.currentDeck);
                if (customDeck && customDeck.length === 20) {
                    playerDeck = customDeck;
                    if (DEBUG) console.log('덱 빌더에서 커스텀 덱 로드 완료');
                } else {
                    if (DEBUG) console.log('덱 빌더 덱이 유효하지 않음, 기본 덱 사용');
                    playerDeck = createDefaultDeck();
                }
            } else {
                if (DEBUG) console.log('덱 빌더 없음, 기본 덱 사용');
                playerDeck = createDefaultDeck();
            }

            // 덱 생성 및 셔플
            gameState.player.deck = shuffleDeck(playerDeck);
            gameState.ai.deck = shuffleDeck(createDefaultDeck());

            // 손패 초기화
            gameState.player.hand = [];
            gameState.ai.hand = [];

            // 5장 드로우 (기본 브롤러 1장 보장)
            for (let i = 0; i < 5; i++) {
                drawCard(gameState.player);
                drawCard(gameState.ai);
            }

            // 기본 브롤러가 손에 없으면 강제로 1장 추가
            ensureBasicBrawler(gameState.player);
            ensureBasicBrawler(gameState.ai);

            // 첫 턴 시작
            gameState.turnCount = 1;
            gameState.currentPlayer = 'player'; // 플레이어 선공

            if (DEBUG) {
                console.log('플레이어 손패:', gameState.player.hand.length);
                console.log('AI 손패:', gameState.ai.hand.length);
            }

            // UI 업데이트
            if (typeof window.UI !== 'undefined') {
                window.UI.render(gameState);
            }

        } catch (error) {
            console.error('initGame 오류:', error);
        }
    }

    // ===== 기본 브롤러 보장 =====
    function ensureBasicBrawler(player) {
        try {
            const hasBasic = player.hand.some(card =>
                card.cardType === 'brawler' && card.isBasic
            );

            if (!hasBasic) {
                // 덱에서 기본 브롤러 찾기
                const basicIndex = player.deck.findIndex(card =>
                    card.cardType === 'brawler' && card.isBasic
                );

                if (basicIndex !== -1) {
                    const basicCard = player.deck.splice(basicIndex, 1)[0];
                    player.hand.push(basicCard);
                    if (DEBUG) console.log('기본 브롤러 강제 추가:', basicCard.name);
                }
            }
        } catch (error) {
            console.error('ensureBasicBrawler 오류:', error);
        }
    }

    // ===== 턴 시작 =====
    function startTurn() {
        try {
            const player = gameState[gameState.currentPlayer];

            if (DEBUG) {
                console.log('=== 턴 시작 (' + gameState.currentPlayer + ', Turn ' + gameState.turnCount + ') ===');
            }

            // 1턴 선공은 드로우/에너지 생성 안 함
            if (!(gameState.turnCount === 1 && gameState.currentPlayer === 'player')) {
                // 카드 드로우 (스킵 체크)
                if (player.skipNextDraw) {
                    player.skipNextDraw = false;
                    if (DEBUG) console.log('드로우 스킵');
                } else {
                    drawCard(player);
                }

                // 에너지 자동 생성
                const energy = window.EnergySystem.generate();
                if (energy) {
                    player.energyZone.push(energy);
                    if (DEBUG) console.log('에너지 생성 완료');
                }
            }

            // 턴 초기화
            player.energyAttachedThisTurn = false;
            player.supporterUsedThisTurn = false;

            // 브롤러들의 공격 가능 상태 초기화
            if (player.battleZone) {
                player.battleZone.canAttack = true;
            }
            player.bench.forEach(b => {
                if (b) b.canAttack = false; // 벤치는 공격 불가
            });

            // UI 업데이트
            if (typeof window.UI !== 'undefined') {
                window.UI.render(gameState);
            }

        } catch (error) {
            console.error('startTurn 오류:', error);
        }
    }

    // ===== 턴 종료 =====
    function endTurn() {
        try {
            if (DEBUG) console.log('턴 종료');

            // 임시 효과 초기화
            const player = gameState[gameState.currentPlayer];
            if (player.battleZone) {
                player.battleZone.attackBoost = 0;
                player.battleZone.damageReduction = 0;
                player.battleZone.retreatCostReduction = 0;
                player.battleZone.recoilDamage = 0;
            }
            player.bench.forEach(b => {
                if (b) {
                    b.attackBoost = 0;
                    b.damageReduction = 0;
                    b.retreatCostReduction = 0;
                    b.recoilDamage = 0;
                }
            });

            // 플레이어 교체
            if (gameState.currentPlayer === 'player') {
                gameState.currentPlayer = 'ai';
            } else {
                gameState.currentPlayer = 'player';
                gameState.turnCount++;
            }

            // 다음 턴 시작
            startTurn();

            // AI 턴이면 AI 실행
            if (gameState.currentPlayer === 'ai') {
                setTimeout(() => {
                    if (typeof window.AI !== 'undefined') {
                        window.AI.playTurn(gameState);
                    }
                }, 500);
            }

        } catch (error) {
            console.error('endTurn 오류:', error);
        }
    }

    // ===== 브롤러 배치 (손패 → 필드) =====
    function playBrawler(handIndex, toBattle) {
        const player = gameState[gameState.currentPlayer];

        // 입력값 검증
        if (typeof handIndex !== 'number' || handIndex < 0 || handIndex >= player.hand.length) {
            console.error('playBrawler: 잘못된 handIndex');
            return false;
        }

        try {
            const card = player.hand[handIndex];

            // 브롤러 카드인지 확인
            if (!card || card.cardType !== 'brawler') {
                console.log('브롤러 카드가 아닙니다');
                return false;
            }

            // 기본 브롤러만 배치 가능
            if (!card.isBasic) {
                console.log('기본 브롤러만 필드에 배치할 수 있습니다');
                return false;
            }

            // 에너지 초기화
            card.energy = [];

            // 배틀존에 배치
            if (toBattle && !player.battleZone) {
                player.hand.splice(handIndex, 1);
                player.battleZone = card;
                card.canAttack = false; // 배치한 턴은 공격 불가
                if (DEBUG) console.log(card.name + ' 배틀존에 배치');
            }
            // 벤치에 배치
            else if (!toBattle && player.bench.length < 3) {
                player.hand.splice(handIndex, 1);
                player.bench.push(card);
                card.canAttack = false;
                if (DEBUG) console.log(card.name + ' 벤치에 배치');
            } else {
                console.log('배치할 수 없습니다');
                return false;
            }

            // UI 업데이트
            if (typeof window.UI !== 'undefined') {
                window.UI.render(gameState);
            }

            return true;
        } catch (error) {
            console.error('playBrawler 오류:', error);
            return false;
        }
    }

    // ===== 에너지 부착 =====
    function attachEnergyToBrawler(brawlerLocation, brawlerIndex) {
        const player = gameState[gameState.currentPlayer];

        // 이미 이번 턴에 에너지 부착했는지 확인
        if (player.energyAttachedThisTurn) {
            console.log('이번 턴에 이미 에너지를 부착했습니다');
            return false;
        }

        // 에너지존에 에너지가 있는지 확인
        if (player.energyZone.length === 0) {
            console.log('에너지존에 에너지가 없습니다');
            return false;
        }

        try {
            let brawler = null;

            // 배틀존 또는 벤치에서 브롤러 찾기
            if (brawlerLocation === 'battle' && player.battleZone) {
                brawler = player.battleZone;
            } else if (brawlerLocation === 'bench' && brawlerIndex >= 0 && brawlerIndex < player.bench.length) {
                brawler = player.bench[brawlerIndex];
            }

            if (!brawler) {
                console.log('브롤러를 찾을 수 없습니다');
                return false;
            }

            // 에너지 부착
            const energy = player.energyZone.shift();
            window.EnergySystem.attachEnergy(brawler, energy);

            player.energyAttachedThisTurn = true;

            // UI 업데이트
            if (typeof window.UI !== 'undefined') {
                window.UI.render(gameState);
            }

            return true;
        } catch (error) {
            console.error('attachEnergyToBrawler 오류:', error);
            return false;
        }
    }

    // ===== 공격 애니메이션 헬퍼 =====
    function playAttackAnimation(attackerClass, defenderClass, damage) {
        try {
            // 공격자 애니메이션
            const attackerEl = document.querySelector(attackerClass);
            if (attackerEl) {
                attackerEl.classList.add('attacking');
                setTimeout(() => attackerEl.classList.remove('attacking'), 600);
            }

            // 피격자 애니메이션 (지연)
            setTimeout(() => {
                const defenderEl = document.querySelector(defenderClass);
                if (defenderEl) {
                    // 흔들림 + 플래시
                    defenderEl.classList.add('taking-damage', 'flash-damage');

                    // 데미지 숫자 표시
                    if (damage > 0) {
                        const damageNum = document.createElement('div');
                        damageNum.className = 'damage-number';
                        damageNum.textContent = '-' + damage;
                        defenderEl.style.position = 'relative';
                        defenderEl.appendChild(damageNum);

                        // 1.2초 후 제거
                        setTimeout(() => {
                            if (damageNum.parentNode) {
                                damageNum.parentNode.removeChild(damageNum);
                            }
                        }, 1200);
                    }

                    // 애니메이션 클래스 제거
                    setTimeout(() => {
                        defenderEl.classList.remove('taking-damage', 'flash-damage');
                    }, 500);
                }
            }, 300);
        } catch (error) {
            console.error('playAttackAnimation 오류:', error);
        }
    }

    // ===== 공격 =====
    function attack(attackIndex) {
        const player = gameState[gameState.currentPlayer];
        const opponent = gameState[gameState.currentPlayer === 'player' ? 'ai' : 'player'];

        // 배틀존 브롤러 확인
        if (!player.battleZone) {
            console.log('배틀존에 브롤러가 없습니다');
            return false;
        }

        const attacker = player.battleZone;

        // 공격 가능 여부 확인
        if (!attacker.canAttack) {
            console.log('이 브롤러는 아직 공격할 수 없습니다');
            return false;
        }

        // 공격 인덱스 확인
        if (!attacker.attacks || attackIndex < 0 || attackIndex >= attacker.attacks.length) {
            console.log('잘못된 공격입니다');
            return false;
        }

        const attackData = attacker.attacks[attackIndex];

        // 에너지 비용 확인
        if (!window.EnergySystem.canPayCost(attacker, attackData.cost)) {
            console.log('에너지가 부족합니다');
            return false;
        }

        try {
            if (DEBUG) {
                console.log(attacker.name + '의 ' + attackData.name + ' 사용!');
            }

            // 공격 효과 처리 (bonusDamage 반환받기)
            let bonusDamage = 0;
            if (attackData.effect && typeof window.Effects !== 'undefined') {
                const result = window.Effects.handleAttackEffect(attackData.effect, attacker, opponent, gameState, attackData);
                bonusDamage = (result && result.bonusDamage) ? result.bonusDamage : 0;

                if (DEBUG && bonusDamage > 0) {
                    console.log('효과 보너스 데미지: +' + bonusDamage);
                }
            }

            // 일반 피해 (기본 데미지 + 보너스 데미지 + 공격력 증가)
            const totalBaseDamage = (attackData.damage || 0) + bonusDamage;

            if (totalBaseDamage > 0 || attackData.damage > 0) {
                if (opponent.battleZone) {
                    // 최종 데미지 = 기본 데미지 + 보너스 + 공격력 증가
                    let finalDamage = totalBaseDamage + (attacker.attackBoost || 0);

                    // 피해 감소 적용
                    const reduction = opponent.battleZone.damageReduction || 0;
                    finalDamage = Math.max(0, finalDamage - reduction);

                    // 공격 애니메이션 재생
                    const attackerClass = gameState.currentPlayer === 'player' ?
                        '.player-battle .card' : '.opponent-battle .card';
                    const defenderClass = gameState.currentPlayer === 'player' ?
                        '.opponent-battle .card' : '.player-battle .card';
                    playAttackAnimation(attackerClass, defenderClass, finalDamage);

                    // 공격 파티클 효과 (피격 위치에)
                    const defenderEl = document.querySelector(defenderClass);
                    if (defenderEl && typeof window.ParticleSystem !== 'undefined') {
                        const rect = defenderEl.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;

                        // 데미지가 40 이상이면 강력한 폭발, 아니면 일반 충격파
                        if (finalDamage >= 40) {
                            window.ParticleSystem.createAttackExplosion(centerX, centerY, finalDamage);
                        } else {
                            window.ParticleSystem.createAttackImpact(centerX, centerY, finalDamage);
                        }
                    }

                    opponent.battleZone.hp -= finalDamage;
                    if (DEBUG) console.log('최종 피해: ' + finalDamage);

                    // 반동 피해 적용
                    if (attacker.recoilDamage && attacker.recoilDamage > 0) {
                        attacker.hp -= attacker.recoilDamage;
                        if (DEBUG) console.log('반동 피해: ' + attacker.recoilDamage);
                    }

                    // 기절 확인
                    if (opponent.battleZone.hp <= 0) {
                        handleBrawlerKO(opponent, 'battle');
                    }
                }
            }

            // 에너지 소모
            if (attackData.energyDiscard > 0) {
                window.EnergySystem.discardEnergy(attacker, attackData.energyDiscard);
            }

            // 공격 사용 표시
            attacker.canAttack = false;

            // 승리 조건 체크
            checkWinCondition();

            // UI 업데이트
            if (typeof window.UI !== 'undefined') {
                window.UI.render(gameState);
            }

            return true;
        } catch (error) {
            console.error('attack 오류:', error);
            return false;
        }
    }

    // ===== 브롤러 기절 처리 =====
    function handleBrawlerKO(player, location) {
        try {
            let brawler = null;

            if (location === 'battle') {
                brawler = player.battleZone;
                player.battleZone = null;
            } else if (location === 'bench') {
                // 벤치는 나중에
            }

            if (!brawler) return;

            if (DEBUG) console.log(brawler.name + ' 기절!');

            // 점수 계산
            const points = getBrawlerPoints(brawler);
            const opponent = (player === gameState.player) ? gameState.ai : gameState.player;
            opponent.prizes += points;

            if (DEBUG) console.log('상대 점수 +' + points + ' (총: ' + opponent.prizes + '점)');

            // 벤치에서 자동 교체
            if (player.bench.length > 0 && location === 'battle') {
                // 첫 번째 벤치 브롤러를 배틀존으로
                const newBattler = player.bench.shift();
                player.battleZone = newBattler;
                if (DEBUG) console.log(newBattler.name + ' 배틀존으로 이동');
            }

        } catch (error) {
            console.error('handleBrawlerKO 오류:', error);
        }
    }

    // ===== 브롤러 점수 계산 =====
    function getBrawlerPoints(brawler) {
        if (!brawler) return 0;

        try {
            // 신화/전설/울트라전설은 2점
            if (['mythic', 'legendary', 'ultra_legendary'].includes(brawler.rarity)) {
                return 2;
            }

            // 진화 카드는 2점
            if (!brawler.isBasic) {
                return 2;
            }

            // 기본 브롤러는 1점
            return 1;
        } catch (error) {
            console.error('getBrawlerPoints 오류:', error);
            return 1;
        }
    }

    // ===== 승리 조건 체크 =====
    function checkWinCondition() {
        try {
            // 플레이어 승리
            if (gameState.player.prizes >= 3) {
                gameState.gameOver = true;
                gameState.winner = 'player';

                // 승리 축하 파티클 효과
                if (typeof window.ParticleSystem !== 'undefined') {
                    window.ParticleSystem.createVictoryCelebration();
                }

                // 파티클 효과 시작 후 알림
                setTimeout(() => {
                    alert('🎉 플레이어 승리! 🎉');
                }, 500);

                return true;
            }

            // AI 승리 (플레이어 패배)
            if (gameState.ai.prizes >= 3) {
                gameState.gameOver = true;
                gameState.winner = 'ai';

                // 패배 파티클 효과
                if (typeof window.ParticleSystem !== 'undefined') {
                    window.ParticleSystem.createDefeatEffect();
                }

                // 파티클 효과 시작 후 알림
                setTimeout(() => {
                    alert('💔 AI 승리... 💔');
                }, 500);

                return true;
            }

            return false;
        } catch (error) {
            console.error('checkWinCondition 오류:', error);
            return false;
        }
    }

    // ===== 전역 API 노출 =====
    window.Game = {
        init: initGame,
        getState: function() { return gameState; },
        playBrawler: playBrawler,
        attachEnergy: attachEnergyToBrawler,
        attack: attack,
        endTurn: endTurn,
        checkWin: checkWinCondition
    };

    if (DEBUG) {
        console.log('게임 시스템 로드 완료');
    }
})();
