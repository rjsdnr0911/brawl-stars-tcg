// Brawl Cards - Main Game Logic
(function() {
    'use strict';

    // 게임 상수
    const DEBUG = true;
    const MAX_FIELD_SIZE = 7;
    const MAX_HAND_SIZE = 10;
    const INITIAL_HP = 25;

    // 게임 상태
    let gameState = null;

    /**
     * 초기 게임 상태를 생성합니다
     * @returns {object} 초기 게임 상태 객체
     */
    function createInitialState() {
        return {
            turn: 1,
            currentPlayer: 'player',
            winner: null,
            player: createPlayerState(),
            ai: createPlayerState()
        };
    }

    /**
     * 플레이어 상태를 생성합니다
     * @returns {object} 플레이어 상태 객체
     */
    function createPlayerState() {
        return {
            hp: INITIAL_HP,
            elixir: 1,
            maxElixir: 1,
            hand: [],
            field: [],
            deck: [],
            graveyard: []
        };
    }

    /**
     * 덱을 생성합니다 (각 카드 2장씩 = 20장)
     * @returns {array} 셔플된 덱 배열
     */
    function createDeck() {
        try {
            const deck = [];
            const allCards = CardDB.getAll();

            if (!allCards || allCards.length === 0) {
                console.error('createDeck: 카드 데이터가 없습니다');
                return [];
            }

            // 각 카드 2장씩 추가
            for (let cardId of allCards) {
                deck.push(cardId);
                deck.push(cardId);
            }

            return shuffleDeck(deck);
        } catch (error) {
            console.error('createDeck 오류:', error);
            return [];
        }
    }

    /**
     * Fisher-Yates 알고리즘으로 덱을 셔플합니다
     * @param {array} deck - 셔플할 덱 배열
     * @returns {array} 셔플된 덱
     */
    function shuffleDeck(deck) {
        if (!Array.isArray(deck)) {
            console.error('shuffleDeck: 배열이 아닙니다');
            return [];
        }

        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }

    /**
     * 카드를 드로우합니다
     * @param {string} playerType - 'player' 또는 'ai'
     * @returns {boolean} 드로우 성공 여부
     */
    function drawCard(playerType) {
        try {
            // 입력값 검증
            if (playerType !== 'player' && playerType !== 'ai') {
                console.error('drawCard: 잘못된 플레이어 타입', playerType);
                return false;
            }

            if (!gameState || !gameState[playerType]) {
                console.error('drawCard: 게임 상태가 없습니다');
                return false;
            }

            // 덱이 비어있는지 확인
            if (gameState[playerType].deck.length === 0) {
                if (DEBUG) console.log(playerType + '의 덱이 비어있음');
                return false;
            }

            // 손패가 가득 찼는지 확인
            if (gameState[playerType].hand.length >= MAX_HAND_SIZE) {
                if (DEBUG) console.log(playerType + '의 손패가 가득 참');
                return false;
            }

            // 카드 드로우
            const cardId = gameState[playerType].deck.pop();
            const card = CardDB.get(cardId);

            if (!card) {
                console.error('drawCard: 카드를 가져올 수 없음', cardId);
                return false;
            }

            gameState[playerType].hand.push(card);

            if (DEBUG) {
                console.log(playerType + '가 카드 드로우:', card.name);
            }

            return true;
        } catch (error) {
            console.error('drawCard 오류:', error);
            return false;
        }
    }

    /**
     * 게임을 초기화합니다
     */
    function initGame() {
        try {
            if (DEBUG) console.log('=== 게임 초기화 시작 ===');

            // 시작 화면 숨기기
            const startScreen = document.getElementById('start-screen');
            if (startScreen) {
                startScreen.style.display = 'none';
            }

            // 게임 상태 생성
            gameState = createInitialState();

            // 덱 생성
            gameState.player.deck = createDeck();
            gameState.ai.deck = createDeck();

            if (gameState.player.deck.length === 0 || gameState.ai.deck.length === 0) {
                throw new Error('덱 생성 실패');
            }

            // 초기 손패 분배 (선공 3장, 후공 4장)
            for (let i = 0; i < 3; i++) {
                if (!drawCard('player')) {
                    throw new Error('플레이어 초기 드로우 실패');
                }
            }

            for (let i = 0; i < 4; i++) {
                if (!drawCard('ai')) {
                    throw new Error('AI 초기 드로우 실패');
                }
            }

            // UI 렌더링 (UI가 준비되면 실행)
            if (typeof UI !== 'undefined' && typeof UI.render === 'function') {
                UI.render(gameState);
            }

            if (DEBUG) {
                console.log('게임 초기화 완료');
                console.log('플레이어 손패:', gameState.player.hand.length, '장');
                console.log('AI 손패:', gameState.ai.hand.length, '장');
                console.log('플레이어 덱:', gameState.player.deck.length, '장');
                console.log('AI 덱:', gameState.ai.deck.length, '장');
                console.log('초기 HP:', gameState.player.hp);
                console.log('초기 엘릭서:', gameState.player.elixir + '/' + gameState.player.maxElixir);
            }

            // 첫 턴 시작 (플레이어가 선공)
            startTurn();

        } catch (error) {
            console.error('initGame 오류:', error);
            alert('게임 초기화 중 오류가 발생했습니다: ' + error.message);
        }
    }

    /**
     * 턴을 시작합니다
     */
    function startTurn() {
        try {
            const player = gameState.currentPlayer;

            if (DEBUG) {
                console.log('=== ' + player + ' 턴 시작 ===');
            }

            // 엘릭서 충전 (최대 10)
            if (gameState[player].maxElixir < 10) {
                gameState[player].maxElixir++;
            }
            gameState[player].elixir = gameState[player].maxElixir;

            // 카드 드로우
            drawCard(player);

            // 필드 미니언들 공격 가능 상태로 변경
            if (gameState[player].field) {
                gameState[player].field.forEach(card => {
                    card.canAttack = true;
                });
            }

            // UI 업데이트
            if (typeof UI !== 'undefined' && typeof UI.render === 'function') {
                UI.render(gameState);
            }

            // AI 턴이면 1초 후 AI 행동
            if (player === 'ai') {
                setTimeout(function() {
                    if (typeof AI !== 'undefined' && typeof AI.takeTurn === 'function') {
                        AI.takeTurn(gameState);
                    } else {
                        console.log('AI 모듈이 아직 구현되지 않음 - AI 턴 종료');
                        aiEndTurn();
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('startTurn 오류:', error);
        }
    }

    /**
     * 플레이어 턴을 종료합니다
     */
    function endTurn() {
        try {
            // 플레이어 턴인지 확인
            if (!gameState || gameState.currentPlayer !== 'player') {
                console.log('플레이어 턴이 아닙니다');
                return;
            }

            if (DEBUG) {
                console.log('=== 플레이어 턴 종료 ===');
            }

            // 턴 종료 시 효과 처리 (포코의 힐 등)
            if (typeof Effects !== 'undefined' && typeof Effects.processEndTurnEffects === 'function') {
                Effects.processEndTurnEffects(gameState, 'player');
            }

            // 턴 전환
            gameState.currentPlayer = 'ai';
            gameState.turn++;

            // UI 업데이트
            if (typeof UI !== 'undefined' && typeof UI.render === 'function') {
                UI.render(gameState);
            }

            // AI 턴 시작
            startTurn();

        } catch (error) {
            console.error('endTurn 오류:', error);
        }
    }

    /**
     * AI 턴을 종료합니다
     */
    function aiEndTurn() {
        try {
            if (DEBUG) {
                console.log('=== AI 턴 종료 ===');
            }

            // 턴 종료 시 효과 처리
            if (typeof Effects !== 'undefined' && typeof Effects.processEndTurnEffects === 'function') {
                Effects.processEndTurnEffects(gameState, 'ai');
            }

            // 턴 전환
            gameState.currentPlayer = 'player';

            // UI 업데이트
            if (typeof UI !== 'undefined' && typeof UI.render === 'function') {
                UI.render(gameState);
            }

            // 플레이어 턴 시작
            startTurn();

        } catch (error) {
            console.error('aiEndTurn 오류:', error);
        }
    }

    /**
     * 손패에서 카드를 필드에 플레이합니다
     * @param {number} cardIndex - 손패 카드 인덱스
     * @returns {boolean} 플레이 성공 여부
     */
    function playCard(cardIndex) {
        try {
            // 입력값 검증
            if (typeof cardIndex !== 'number' || cardIndex < 0) {
                console.error('playCard: 잘못된 입력값', cardIndex);
                return false;
            }

            // 플레이어 턴인지 확인
            if (!gameState || gameState.currentPlayer !== 'player') {
                console.log('플레이어 턴이 아닙니다');
                return false;
            }

            const hand = gameState.player.hand;

            // 손패 범위 체크
            if (cardIndex >= hand.length) {
                console.error('playCard: 범위 벗어남', cardIndex);
                return false;
            }

            const card = hand[cardIndex];

            // 엘릭서 체크
            if (card.cost > gameState.player.elixir) {
                console.log('엘릭서가 부족합니다 (필요:', card.cost, '/ 보유:', gameState.player.elixir + ')');
                return false;
            }

            // 필드 가득 참 체크
            if (gameState.player.field.length >= MAX_FIELD_SIZE) {
                console.log('필드가 가득 찼습니다 (최대 7장)');
                return false;
            }

            // 엘릭서 소모
            gameState.player.elixir -= card.cost;

            // 손패에서 제거하고 필드에 추가
            const playedCard = hand.splice(cardIndex, 1)[0];
            playedCard.canAttack = false; // 기본적으로 공격 불가

            // 특수 능력 처리
            if (playedCard.ability === 'charge') {
                playedCard.canAttack = true; // 돌진은 즉시 공격 가능
            }
            if (playedCard.ability === 'taunt') {
                playedCard.hasTaunt = true; // 도발 설정
            }

            gameState.player.field.push(playedCard);

            if (DEBUG) {
                console.log('카드 플레이:', playedCard.name, '(비용:', card.cost + ')');
            }

            // Battlecry 효과 처리
            if (typeof Effects !== 'undefined' && typeof Effects.processBattlecry === 'function') {
                Effects.processBattlecry(gameState, playedCard, 'player');
            }

            // UI 업데이트
            if (typeof UI !== 'undefined' && typeof UI.render === 'function') {
                UI.render(gameState);
            }

            return true;

        } catch (error) {
            console.error('playCard 오류:', error);
            return false;
        }
    }

    /**
     * 필드 미니언으로 공격합니다
     * @param {number} attackerIndex - 공격자 필드 인덱스
     * @param {string} targetType - 'player' 또는 'field'
     * @param {number} targetIndex - 타겟 필드 인덱스 (targetType이 'field'일 때)
     * @returns {boolean} 공격 성공 여부
     */
    function attack(attackerIndex, targetType, targetIndex) {
        try {
            // 플레이어 턴인지 확인
            if (!gameState || gameState.currentPlayer !== 'player') {
                console.log('플레이어 턴이 아닙니다');
                return false;
            }

            // 공격자 확인
            const attacker = gameState.player.field[attackerIndex];
            if (!attacker) {
                console.error('attack: 공격자가 존재하지 않음');
                return false;
            }

            // 공격 가능 여부 확인
            if (!attacker.canAttack) {
                console.log('이 미니언은 아직 공격할 수 없습니다');
                return false;
            }

            // 도발 체크
            const hasTaunt = gameState.ai.field.some(function(card) {
                return card.hasTaunt;
            });

            if (targetType === 'player') {
                // 플레이어 직접 공격
                if (hasTaunt) {
                    console.log('도발 미니언을 먼저 처리하세요');
                    return false;
                }

                gameState.ai.hp -= attacker.attack;
                attacker.canAttack = false;

                if (DEBUG) {
                    console.log(attacker.name + '이(가) AI에게 직접 공격:', attacker.attack, '데미지');
                }

                // 승리 조건 체크
                checkWinCondition();

            } else if (targetType === 'field') {
                // 미니언 대 미니언 전투
                const target = gameState.ai.field[targetIndex];
                if (!target) {
                    console.error('attack: 대상이 존재하지 않음');
                    return false;
                }

                // 도발 체크 (도발이 있는데 도발 아닌 대상 공격 시)
                if (hasTaunt && !target.hasTaunt) {
                    console.log('도발 미니언을 먼저 처리하세요');
                    return false;
                }

                if (DEBUG) {
                    console.log(attacker.name + ' vs ' + target.name + ' 전투');
                }

                // 동시 데미지 처리
                target.health -= attacker.attack;
                attacker.health -= target.attack;
                attacker.canAttack = false;

                // 바리의 공격 시 범위 데미지 처리
                if (attacker.ability === 'attack_aoe_damage' &&
                    typeof Effects !== 'undefined' &&
                    typeof Effects.processAttackEffects === 'function') {
                    Effects.processAttackEffects(gameState, attacker, 'player');
                }

                // 사망 체크
                if (typeof Effects !== 'undefined' && typeof Effects.checkDeaths === 'function') {
                    Effects.checkDeaths(gameState, 'player');
                    Effects.checkDeaths(gameState, 'ai');
                }

            } else {
                console.error('attack: 잘못된 targetType', targetType);
                return false;
            }

            // UI 업데이트
            if (typeof UI !== 'undefined' && typeof UI.render === 'function') {
                UI.render(gameState);
            }

            return true;

        } catch (error) {
            console.error('attack 오류:', error);
            return false;
        }
    }

    /**
     * 승리/패배 조건을 체크합니다
     */
    function checkWinCondition() {
        try {
            if (gameState.player.hp <= 0 && gameState.ai.hp <= 0) {
                gameState.winner = 'draw';
                endGame('무승부입니다!');
            } else if (gameState.player.hp <= 0) {
                gameState.winner = 'ai';
                endGame('패배했습니다...');
            } else if (gameState.ai.hp <= 0) {
                gameState.winner = 'player';
                endGame('승리했습니다!');
            }
        } catch (error) {
            console.error('checkWinCondition 오류:', error);
        }
    }

    /**
     * 게임을 종료합니다
     * @param {string} message - 종료 메시지
     */
    function endGame(message) {
        try {
            if (typeof UI !== 'undefined' && typeof UI.render === 'function') {
                UI.render(gameState);
            }

            setTimeout(function() {
                alert(message);

                const restartBtn = document.getElementById('restart-btn');
                if (restartBtn) {
                    restartBtn.style.display = 'block';
                }

                const endTurnBtn = document.getElementById('end-turn-btn');
                if (endTurnBtn) {
                    endTurnBtn.disabled = true;
                }
            }, 500);

        } catch (error) {
            console.error('endGame 오류:', error);
        }
    }

    /**
     * 게임을 재시작합니다
     */
    function restartGame() {
        try {
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.style.display = 'none';
            }

            const endTurnBtn = document.getElementById('end-turn-btn');
            if (endTurnBtn) {
                endTurnBtn.disabled = false;
            }

            initGame();

        } catch (error) {
            console.error('restartGame 오류:', error);
        }
    }

    // 공개 API
    window.Game = {
        /**
         * 게임을 초기화합니다
         */
        init: initGame,

        /**
         * 현재 게임 상태를 반환합니다 (읽기 전용)
         * @returns {object} 게임 상태 객체
         */
        getState: function() {
            return gameState;
        },

        /**
         * 손패에서 카드를 플레이합니다
         */
        playCard: playCard,

        /**
         * 필드 미니언으로 공격합니다
         */
        attack: attack,

        /**
         * 플레이어 턴을 종료합니다
         */
        endTurn: endTurn,

        /**
         * AI 턴을 종료합니다
         */
        aiEndTurn: aiEndTurn,

        /**
         * 게임을 재시작합니다
         */
        restart: restartGame,

        /**
         * 승리 조건을 체크합니다
         */
        checkWin: checkWinCondition,

        /**
         * 디버그 모드 상태를 반환합니다
         * @returns {boolean} 디버그 모드 여부
         */
        isDebug: function() {
            return DEBUG;
        }
    };

    // 초기화 로그
    if (DEBUG) {
        console.log('Game 모듈 로드 완료');
    }

})();
