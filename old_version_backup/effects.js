// Brawl Cards - Card Effects Handler
(function() {
    'use strict';

    // 카드 능력별 핸들러 함수들
    const abilityHandlers = {
        /**
         * 쉘리 - 양옆 적에게 데미지
         */
        'battlecry_damage_adjacent': function(gameState, card, playerType) {
            const opponent = playerType === 'player' ? 'ai' : 'player';
            const field = gameState[opponent].field;

            if (!field || field.length === 0) return;

            // 첫 번째와 두 번째 미니언에게 데미지
            if (field.length > 0) {
                field[0].health -= card.abilityValue;
            }
            if (field.length > 1) {
                field[1].health -= card.abilityValue;
            }

            checkDeaths(gameState, opponent);
        },

        /**
         * 니타 - 사망 시 토큰 소환
         */
        'deathrattle_summon': function(gameState, card, playerType) {
            const field = gameState[playerType].field;

            // 필드가 가득 차지 않았으면 토큰 소환
            if (field.length < 7) {
                const token = {
                    id: 'bear_token',
                    name: card.abilityValue.name,
                    cost: 0,
                    attack: card.abilityValue.attack,
                    health: card.abilityValue.health,
                    description: '토큰',
                    ability: 'none',
                    rarity: 'token',
                    image: '',
                    canAttack: false
                };
                field.push(token);
            }
        },

        /**
         * 콜트 - 돌진 (즉시 공격 가능)
         */
        'charge': function(gameState, card, playerType) {
            card.canAttack = true;
        },

        /**
         * 불, 엘프리모 - 도발
         */
        'taunt': function(gameState, card, playerType) {
            card.hasTaunt = true;
        },

        /**
         * 포코 - 턴 종료 시 아군 전체 힐
         */
        'end_turn_heal_allies': function(gameState, playerType) {
            const field = gameState[playerType].field;

            if (!field) return;

            field.forEach(function(minion) {
                minion.health += 1;
            });
        },

        /**
         * 바리 - 공격 시 범위 데미지
         */
        'attack_aoe_damage': function(gameState, card, playerType) {
            const opponent = playerType === 'player' ? 'ai' : 'player';
            const field = gameState[opponent].field;

            if (!field) return;

            field.forEach(function(minion) {
                minion.health -= card.abilityValue;
            });

            checkDeaths(gameState, opponent);
        },

        /**
         * 다이너마이크 - 무작위 적 2체에 데미지
         */
        'battlecry_random_damage': function(gameState, card, playerType) {
            const opponent = playerType === 'player' ? 'ai' : 'player';
            const field = gameState[opponent].field;

            if (!field || field.length === 0) return;

            // 최대 2번 무작위 타겟에 데미지
            for (let i = 0; i < 2; i++) {
                if (field.length === 0) break;

                const randomIndex = Math.floor(Math.random() * field.length);
                field[randomIndex].health -= card.abilityValue;
            }

            checkDeaths(gameState, opponent);
        },

        /**
         * 보 - 카드 드로우
         */
        'battlecry_draw_card': function(gameState, card, playerType) {
            // 덱에 카드가 있고 손패가 가득 차지 않았으면 드로우
            if (gameState[playerType].deck.length > 0 &&
                gameState[playerType].hand.length < 10) {
                const cardId = gameState[playerType].deck.pop();
                const drawnCard = CardDB.get(cardId);
                if (drawnCard) {
                    gameState[playerType].hand.push(drawnCard);
                }
            }
        },

        /**
         * 제시 - 능력 없음
         */
        'none': function(gameState, card, playerType) {
            // 아무것도 하지 않음
        }
    };

    /**
     * Battlecry 효과를 처리합니다
     * @param {object} gameState - 게임 상태
     * @param {object} card - 카드 객체
     * @param {string} playerType - 'player' 또는 'ai'
     */
    function processBattlecry(gameState, card, playerType) {
        try {
            if (!card || !card.ability) return;

            // battlecry로 시작하는 능력만 처리
            if (card.ability.startsWith('battlecry')) {
                const handler = abilityHandlers[card.ability];
                if (handler) {
                    handler(gameState, card, playerType);
                    console.log(card.name + '의 Battlecry 발동:', card.ability);
                }
            }
        } catch (error) {
            console.error('processBattlecry 오류:', error);
        }
    }

    /**
     * Deathrattle 효과를 처리합니다
     * @param {object} gameState - 게임 상태
     * @param {object} card - 카드 객체
     * @param {string} playerType - 'player' 또는 'ai'
     */
    function processDeathrattle(gameState, card, playerType) {
        try {
            if (!card || !card.ability) return;

            // deathrattle로 시작하는 능력만 처리
            if (card.ability.startsWith('deathrattle')) {
                const handler = abilityHandlers[card.ability];
                if (handler) {
                    handler(gameState, card, playerType);
                    console.log(card.name + '의 Deathrattle 발동:', card.ability);
                }
            }
        } catch (error) {
            console.error('processDeathrattle 오류:', error);
        }
    }

    /**
     * 턴 종료 시 효과를 처리합니다
     * @param {object} gameState - 게임 상태
     * @param {string} playerType - 'player' 또는 'ai'
     */
    function processEndTurnEffects(gameState, playerType) {
        try {
            const field = gameState[playerType].field;

            if (!field) return;

            // 턴 종료 시 발동하는 능력 처리
            field.forEach(function(card) {
                if (card.ability === 'end_turn_heal_allies') {
                    abilityHandlers[card.ability](gameState, playerType);
                    console.log(card.name + '의 턴 종료 효과 발동');
                }
            });
        } catch (error) {
            console.error('processEndTurnEffects 오류:', error);
        }
    }

    /**
     * 체력 0 이하 미니언을 제거하고 Deathrattle 처리
     * @param {object} gameState - 게임 상태
     * @param {string} playerType - 'player' 또는 'ai'
     */
    function checkDeaths(gameState, playerType) {
        try {
            const field = gameState[playerType].field;

            if (!field) return;

            const deadCards = [];

            // 역순으로 순회하며 사망한 카드 찾기
            for (let i = field.length - 1; i >= 0; i--) {
                if (field[i].health <= 0) {
                    const deadCard = field.splice(i, 1)[0];
                    deadCards.push(deadCard);

                    // 묘지에 추가
                    if (deadCard.id) {
                        gameState[playerType].graveyard.push(deadCard.id);
                    }

                    console.log(deadCard.name + ' 사망');
                }
            }

            // 사망한 카드들의 Deathrattle 처리
            deadCards.forEach(function(card) {
                processDeathrattle(gameState, card, playerType);
            });

        } catch (error) {
            console.error('checkDeaths 오류:', error);
        }
    }

    /**
     * 공격 시 발동 효과를 처리합니다 (바리)
     * @param {object} gameState - 게임 상태
     * @param {object} card - 공격하는 카드
     * @param {string} playerType - 'player' 또는 'ai'
     */
    function processAttackEffects(gameState, card, playerType) {
        try {
            if (!card || !card.ability) return;

            // 공격 시 발동하는 능력
            if (card.ability === 'attack_aoe_damage') {
                const handler = abilityHandlers[card.ability];
                if (handler) {
                    handler(gameState, card, playerType);
                    console.log(card.name + '의 공격 효과 발동');
                }
            }
        } catch (error) {
            console.error('processAttackEffects 오류:', error);
        }
    }

    // 공개 API
    window.Effects = {
        /**
         * Battlecry 효과 처리
         */
        processBattlecry: processBattlecry,

        /**
         * Deathrattle 효과 처리
         */
        processDeathrattle: processDeathrattle,

        /**
         * 턴 종료 시 효과 처리
         */
        processEndTurnEffects: processEndTurnEffects,

        /**
         * 사망 체크 및 처리
         */
        checkDeaths: checkDeaths,

        /**
         * 공격 시 효과 처리
         */
        processAttackEffects: processAttackEffects,

        /**
         * 내부 핸들러 접근 (디버그용)
         */
        abilityHandlers: abilityHandlers
    };

    console.log('Effects 모듈 로드 완료');

})();
