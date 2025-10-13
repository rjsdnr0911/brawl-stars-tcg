// Brawl Cards - AI Logic
(function() {
    'use strict';

    const MAX_ACTIONS = 20; // 무한 루프 방지
    const MISTAKE_RATE = 0.2; // 20% 실수 확률

    /**
     * AI 턴을 실행합니다
     * @param {object} gameState - 게임 상태
     */
    function takeTurn(gameState) {
        try {
            if (!gameState) {
                console.error('AI.takeTurn: gameState가 없습니다');
                return;
            }

            console.log('=== AI 턴 시작 ===');

            let actionsThisTurn = 0;

            // 가능한 행동을 반복적으로 수행
            while (actionsThisTurn < MAX_ACTIONS) {
                const possibleActions = calculatePossibleActions(gameState);

                // 더 이상 할 수 있는 행동이 없으면 종료
                if (possibleActions.length === 0) {
                    console.log('AI: 더 이상 가능한 행동 없음');
                    break;
                }

                // 가치 순으로 정렬 (높은 것부터)
                possibleActions.sort(function(a, b) {
                    return b.value - a.value;
                });

                // 최선의 행동 선택 (20% 확률로 차선책 선택)
                let chosenAction = possibleActions[0];
                if (Math.random() < MISTAKE_RATE && possibleActions.length > 1) {
                    chosenAction = possibleActions[1];
                    console.log('AI: 실수! 차선책 선택');
                }

                console.log('AI 행동:', chosenAction);

                // 행동 실행
                const success = executeAction(gameState, chosenAction);
                if (!success) {
                    console.warn('AI: 행동 실행 실패, 턴 종료');
                    break;
                }

                actionsThisTurn++;
            }

            if (actionsThisTurn >= MAX_ACTIONS) {
                console.warn('AI: 최대 행동 수 도달');
            }

            console.log('=== AI 턴 종료 (행동 수: ' + actionsThisTurn + ') ===');

            // AI 턴 종료 (약간의 딜레이 후)
            setTimeout(function() {
                if (typeof Game !== 'undefined' && typeof Game.aiEndTurn === 'function') {
                    Game.aiEndTurn();
                }
            }, 500);

        } catch (error) {
            console.error('AI.takeTurn 오류:', error);
            // 에러가 나도 턴은 종료해야 함
            if (typeof Game !== 'undefined' && typeof Game.aiEndTurn === 'function') {
                Game.aiEndTurn();
            }
        }
    }

    /**
     * 가능한 모든 행동을 계산합니다
     * @param {object} gameState - 게임 상태
     * @returns {array} 가능한 행동 배열
     */
    function calculatePossibleActions(gameState) {
        try {
            const actions = [];

            // 카드 플레이 행동
            const playCardActions = calculatePlayCardActions(gameState);
            actions.push.apply(actions, playCardActions);

            // 공격 행동
            const attackActions = calculateAttackActions(gameState);
            actions.push.apply(actions, attackActions);

            return actions;
        } catch (error) {
            console.error('calculatePossibleActions 오류:', error);
            return [];
        }
    }

    /**
     * 카드 플레이 가능한 행동을 계산합니다
     * @param {object} gameState - 게임 상태
     * @returns {array} 카드 플레이 행동 배열
     */
    function calculatePlayCardActions(gameState) {
        try {
            const actions = [];
            const hand = gameState.ai.hand;
            const elixir = gameState.ai.elixir;
            const fieldSize = gameState.ai.field.length;

            // 필드가 가득 찼으면 카드 플레이 불가
            if (fieldSize >= 7) {
                return actions;
            }

            // 손패의 각 카드를 검사
            if (!hand || hand.length === 0) {
                return actions;
            }

            for (let i = 0; i < hand.length; i++) {
                const card = hand[i];

                // 엘릭서가 충분하면 플레이 가능
                if (card.cost <= elixir) {
                    const value = evaluateCardPlay(gameState, card);
                    actions.push({
                        type: 'play_card',
                        cardIndex: i,
                        card: card,
                        value: value
                    });
                }
            }

            return actions;
        } catch (error) {
            console.error('calculatePlayCardActions 오류:', error);
            return [];
        }
    }

    /**
     * 카드 플레이의 가치를 평가합니다
     * @param {object} gameState - 게임 상태
     * @param {object} card - 평가할 카드
     * @returns {number} 카드 플레이의 가치
     */
    function evaluateCardPlay(gameState, card) {
        try {
            if (!card) return 0;

            // 기본 가치: 공격력 + 체력
            let value = (card.attack || 0) + (card.health || 0);

            // 능력에 따른 가치 추가
            if (card.ability === 'taunt') {
                value += 3;
            }
            if (card.ability === 'charge') {
                value += 2;
            }
            if (card.ability && card.ability.indexOf('battlecry') >= 0) {
                value += 2;
            }
            if (card.ability && card.ability.indexOf('deathrattle') >= 0) {
                value += 1;
            }

            // 코스트 대비 가치 정규화
            if (card.cost > 0) {
                value = value / card.cost * 10;
            }

            // 상황에 따른 보너스
            if (gameState.ai.hp < 10) {
                // HP가 낮으면 도발 미니언 우선
                if (card.ability === 'taunt') {
                    value += 5;
                }
            }

            return value;
        } catch (error) {
            console.error('evaluateCardPlay 오류:', error);
            return 0;
        }
    }

    /**
     * 공격 가능한 행동을 계산합니다
     * @param {object} gameState - 게임 상태
     * @returns {array} 공격 행동 배열
     */
    function calculateAttackActions(gameState) {
        try {
            const actions = [];
            const aiField = gameState.ai.field;
            const playerField = gameState.player.field;

            if (!aiField || aiField.length === 0) {
                return actions;
            }

            // AI 필드의 각 미니언을 검사
            for (let i = 0; i < aiField.length; i++) {
                const attacker = aiField[i];

                // 공격할 수 없으면 건너뛰기
                if (!attacker.canAttack) {
                    continue;
                }

                // 적에게 도발 미니언이 있는지 체크
                const hasTaunt = playerField && playerField.length > 0 &&
                                 playerField.some(function(card) { return card.hasTaunt; });

                // 적 미니언 공격 옵션
                if (playerField && playerField.length > 0) {
                    for (let j = 0; j < playerField.length; j++) {
                        const target = playerField[j];

                        // 도발이 있으면 도발 미니언만 공격 가능
                        if (hasTaunt && !target.hasTaunt) {
                            continue;
                        }

                        const value = evaluateAttack(attacker, target);
                        actions.push({
                            type: 'attack_minion',
                            attackerIndex: i,
                            targetIndex: j,
                            value: value
                        });
                    }
                }

                // 상대 플레이어 직접 공격 옵션 (도발이 없거나 필드가 비었을 때만)
                if (!hasTaunt || !playerField || playerField.length === 0) {
                    const faceValue = (attacker.attack || 0) * 2; // 직접 공격은 높은 가치
                    actions.push({
                        type: 'attack_face',
                        attackerIndex: i,
                        value: faceValue
                    });
                }
            }

            return actions;
        } catch (error) {
            console.error('calculateAttackActions 오류:', error);
            return [];
        }
    }

    /**
     * 공격의 가치를 평가합니다
     * @param {object} attacker - 공격자
     * @param {object} target - 대상
     * @returns {number} 공격의 가치
     */
    function evaluateAttack(attacker, target) {
        try {
            if (!attacker || !target) return 0;

            let value = 0;

            const attackerAttack = attacker.attack || 0;
            const attackerHealth = attacker.health || 0;
            const targetAttack = target.attack || 0;
            const targetHealth = target.health || 0;

            // 상대를 죽일 수 있으면 높은 가치
            if (attackerAttack >= targetHealth) {
                value += 10;
                // 죽인 미니언의 가치도 추가
                value += targetAttack + targetHealth;
            }

            // 공격 후 생존 가능성 평가
            if (attackerHealth > targetAttack) {
                // 공격자가 살아남음
                value += 5;
            } else if (attackerHealth === targetAttack) {
                // 교환 (둘 다 죽음)
                value += 2;
            } else {
                // 공격자가 죽음 (손해지만 상대도 피해입음)
                value -= 3;
            }

            return value;
        } catch (error) {
            console.error('evaluateAttack 오류:', error);
            return 0;
        }
    }

    /**
     * 선택한 행동을 실행합니다
     * @param {object} gameState - 게임 상태
     * @param {object} action - 실행할 행동
     * @returns {boolean} 성공 여부
     */
    function executeAction(gameState, action) {
        try {
            if (!gameState || !action) {
                return false;
            }

            if (action.type === 'play_card') {
                // 카드 플레이
                const hand = gameState.ai.hand;
                const cardIndex = action.cardIndex;

                if (!hand || cardIndex < 0 || cardIndex >= hand.length) {
                    console.error('executeAction: 잘못된 카드 인덱스');
                    return false;
                }

                const card = hand[cardIndex];

                // 재검증
                if (card.cost > gameState.ai.elixir) {
                    console.warn('executeAction: 엘릭서 부족');
                    return false;
                }
                if (gameState.ai.field.length >= 7) {
                    console.warn('executeAction: 필드 가득 참');
                    return false;
                }

                // 엘릭서 소모
                gameState.ai.elixir -= card.cost;

                // 손패에서 카드 제거
                const playedCard = hand.splice(cardIndex, 1)[0];
                playedCard.canAttack = false;

                // 특수 능력 적용
                if (playedCard.ability === 'charge') {
                    playedCard.canAttack = true;
                }
                if (playedCard.ability === 'taunt') {
                    playedCard.hasTaunt = true;
                }

                // 필드에 추가
                gameState.ai.field.push(playedCard);

                // Battlecry 처리
                if (typeof Effects !== 'undefined' && typeof Effects.processBattlecry === 'function') {
                    Effects.processBattlecry(gameState, playedCard, 'ai');
                }

                // UI 업데이트
                if (typeof UI !== 'undefined' && typeof UI.render === 'function') {
                    UI.render(gameState);
                }

                console.log('AI: ' + playedCard.name + ' 플레이');
                return true;

            } else if (action.type === 'attack_minion') {
                // 미니언 공격
                const attackerIndex = action.attackerIndex;
                const targetIndex = action.targetIndex;

                if (!gameState.ai.field[attackerIndex] || !gameState.player.field[targetIndex]) {
                    console.error('executeAction: 잘못된 공격 대상');
                    return false;
                }

                const attacker = gameState.ai.field[attackerIndex];
                const target = gameState.player.field[targetIndex];

                if (!attacker.canAttack) {
                    console.warn('executeAction: 공격할 수 없는 미니언');
                    return false;
                }

                // 동시 피해
                target.health -= attacker.attack;
                attacker.health -= target.attack;
                attacker.canAttack = false;

                // 사망 체크
                if (typeof Effects !== 'undefined' && typeof Effects.checkDeaths === 'function') {
                    Effects.checkDeaths(gameState, 'ai');
                    Effects.checkDeaths(gameState, 'player');
                }

                // UI 업데이트
                if (typeof UI !== 'undefined' && typeof UI.render === 'function') {
                    UI.render(gameState);
                }

                console.log('AI: ' + attacker.name + ' → ' + target.name + ' 공격');
                return true;

            } else if (action.type === 'attack_face') {
                // 상대 플레이어 직접 공격
                const attackerIndex = action.attackerIndex;

                if (!gameState.ai.field[attackerIndex]) {
                    console.error('executeAction: 잘못된 공격자');
                    return false;
                }

                const attacker = gameState.ai.field[attackerIndex];

                if (!attacker.canAttack) {
                    console.warn('executeAction: 공격할 수 없는 미니언');
                    return false;
                }

                // 플레이어에게 피해
                gameState.player.hp -= attacker.attack;
                attacker.canAttack = false;

                // UI 업데이트
                if (typeof UI !== 'undefined' && typeof UI.render === 'function') {
                    UI.render(gameState);
                }

                // 승리 조건 체크
                if (typeof Game !== 'undefined' && typeof Game.checkWin === 'function') {
                    Game.checkWin();
                }

                console.log('AI: ' + attacker.name + ' → 플레이어 직접 공격');
                return true;
            }

            return false;
        } catch (error) {
            console.error('executeAction 오류:', error);
            return false;
        }
    }

    // 공개 API
    window.AI = {
        /**
         * AI 턴 실행
         */
        takeTurn: takeTurn
    };

    console.log('AI 모듈 로드 완료');

})();
