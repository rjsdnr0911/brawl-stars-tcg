// Brawl Cards - UI Rendering System
(function() {
    'use strict';

    // 선택된 공격자 카드 인덱스 (null = 선택 없음)
    let selectedAttackerIndex = null;

    /**
     * 전체 게임 화면을 렌더링합니다
     * @param {object} gameState - 게임 상태 객체
     */
    function render(gameState) {
        if (!gameState) {
            console.warn('UI.render: gameState가 없습니다');
            return;
        }

        try {
            renderPlayerArea(gameState.player, 'player');
            renderPlayerArea(gameState.ai, 'ai');
            renderTurnInfo(gameState);
        } catch (error) {
            console.error('UI.render 오류:', error);
        }
    }

    /**
     * 플레이어 영역을 렌더링합니다
     * @param {object} player - 플레이어 상태
     * @param {string} playerType - 'player' 또는 'ai'
     */
    function renderPlayerArea(player, playerType) {
        try {
            if (!player) {
                console.error('renderPlayerArea: player가 없습니다');
                return;
            }

            renderHP(player.hp, playerType);
            renderElixir(player.elixir, player.maxElixir, playerType);
            renderHand(player.hand, playerType);
            renderField(player.field, playerType);
        } catch (error) {
            console.error('renderPlayerArea 오류:', error);
        }
    }

    /**
     * HP를 렌더링합니다
     * @param {number} hp - 현재 HP
     * @param {string} playerType - 'player' 또는 'ai'
     */
    function renderHP(hp, playerType) {
        const hpEl = document.getElementById(playerType + '-hp');
        if (hpEl) {
            hpEl.textContent = hp;
            hpEl.className = 'hp' + (hp <= 10 ? ' low-hp' : '');

            // AI HP 클릭 시 직접 공격
            if (playerType === 'ai') {
                hpEl.onclick = function() {
                    if (selectedAttackerIndex === null) {
                        console.log('먼저 공격할 미니언을 선택하세요');
                        return;
                    }

                    // 직접 공격 실행
                    if (typeof Game !== 'undefined' && typeof Game.attack === 'function') {
                        const success = Game.attack(selectedAttackerIndex, 'player', null);
                        if (success) {
                            selectedAttackerIndex = null; // 선택 해제
                        }
                    }
                };
                hpEl.style.cursor = 'pointer';
            }
        }
    }

    /**
     * 엘릭서를 렌더링합니다
     * @param {number} current - 현재 엘릭서
     * @param {number} max - 최대 엘릭서
     * @param {string} playerType - 'player' 또는 'ai'
     */
    function renderElixir(current, max, playerType) {
        const elixirEl = document.getElementById(playerType + '-elixir');
        if (elixirEl) {
            elixirEl.textContent = current + '/' + max;
        }
    }

    /**
     * 손패를 렌더링합니다
     * @param {array} hand - 손패 배열
     * @param {string} playerType - 'player' 또는 'ai'
     */
    function renderHand(hand, playerType) {
        const handEl = document.getElementById(playerType + '-hand');
        if (!handEl) return;

        handEl.innerHTML = '';

        if (!hand || hand.length === 0) {
            return;
        }

        if (playerType === 'ai') {
            // AI 손패는 카드 뒷면만 표시
            for (let i = 0; i < hand.length; i++) {
                const cardBack = createCardBack();
                handEl.appendChild(cardBack);
            }
        } else {
            // 플레이어 손패는 실제 카드 표시
            hand.forEach((card, index) => {
                const cardEl = createCardElement(card, index, 'player');
                handEl.appendChild(cardEl);
            });
        }
    }

    /**
     * 필드를 렌더링합니다
     * @param {array} field - 필드 배열
     * @param {string} playerType - 'player' 또는 'ai'
     */
    function renderField(field, playerType) {
        const fieldEl = document.getElementById(playerType + '-field');
        if (!fieldEl) return;

        fieldEl.innerHTML = '';

        if (!field || field.length === 0) {
            return;
        }

        field.forEach((card, index) => {
            const cardEl = createCardElement(card, index, playerType + '-field');
            fieldEl.appendChild(cardEl);
        });
    }

    /**
     * 카드 엘리먼트를 생성합니다
     * @param {object} card - 카드 객체
     * @param {number} index - 카드 인덱스
     * @param {string} area - 카드가 위치한 영역
     * @returns {HTMLElement} 카드 div 엘리먼트
     */
    function createCardElement(card, index, area) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card ' + card.rarity;
        cardDiv.dataset.index = index;
        cardDiv.dataset.area = area;

        // 카드 HTML 구조
        cardDiv.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-image">
                <img src="${card.image}" alt="${card.name}" onerror="this.style.display='none'">
            </div>
            <div class="card-name">${card.name}</div>
            <div class="card-description">${card.description}</div>
            <div class="card-stats">
                <span class="attack">${card.attack}</span>
                <span class="health">${card.health}</span>
            </div>
        `;

        // 플레이어 손패 카드는 클릭 이벤트 추가
        if (area === 'player') {
            cardDiv.onclick = function() {
                if (typeof Game !== 'undefined' && typeof Game.playCard === 'function') {
                    Game.playCard(index);
                } else {
                    console.log('카드 클릭:', card.name, '(Game.playCard가 아직 구현되지 않음)');
                }
            };
            cardDiv.style.cursor = 'pointer';
        }

        // 필드 카드는 공격 가능 표시
        if (area.includes('-field')) {
            if (card.canAttack) {
                cardDiv.classList.add('can-attack');
            }
            if (card.hasTaunt) {
                cardDiv.classList.add('has-taunt');
            }

            // 플레이어 필드 카드 클릭 - 공격자 선택/해제
            if (area === 'player-field') {
                cardDiv.onclick = function() {
                    if (!card.canAttack) {
                        console.log('이 미니언은 아직 공격할 수 없습니다');
                        return;
                    }

                    // 같은 카드 다시 클릭 시 선택 해제
                    if (selectedAttackerIndex === index) {
                        selectedAttackerIndex = null;
                        console.log('선택 해제');
                    } else {
                        // 새로운 카드 선택
                        selectedAttackerIndex = index;
                        console.log(card.name + ' 선택 (공격 대상을 클릭하세요)');
                    }

                    // UI 업데이트
                    if (typeof Game !== 'undefined' && typeof Game.getState === 'function') {
                        render(Game.getState());
                    }
                };
                cardDiv.style.cursor = card.canAttack ? 'pointer' : 'default';

                // 선택된 카드 표시
                if (selectedAttackerIndex === index) {
                    cardDiv.classList.add('selected');
                }
            }

            // AI 필드 카드 클릭 - 공격 대상
            if (area === 'ai-field') {
                cardDiv.onclick = function() {
                    if (selectedAttackerIndex === null) {
                        console.log('먼저 공격할 미니언을 선택하세요');
                        return;
                    }

                    // 공격 실행
                    if (typeof Game !== 'undefined' && typeof Game.attack === 'function') {
                        const success = Game.attack(selectedAttackerIndex, 'field', index);
                        if (success) {
                            selectedAttackerIndex = null; // 선택 해제
                        }
                    }
                };
                cardDiv.style.cursor = 'pointer';
            }
        }

        return cardDiv;
    }

    /**
     * 카드 뒷면 엘리먼트를 생성합니다
     * @returns {HTMLElement} 카드 뒷면 div 엘리먼트
     */
    function createCardBack() {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card card-back';
        cardDiv.innerHTML = '<div class="card-back-image">?</div>';
        return cardDiv;
    }

    /**
     * 턴 정보를 렌더링합니다
     * @param {object} gameState - 게임 상태
     */
    function renderTurnInfo(gameState) {
        const turnEl = document.getElementById('turn-info');
        if (turnEl) {
            const turnText = 'Turn ' + gameState.turn;
            const playerText = gameState.currentPlayer === 'player' ? 'Your Turn' : 'AI Turn';
            turnEl.textContent = turnText + ' - ' + playerText;
        }
    }

    /**
     * 이벤트 리스너를 초기화합니다
     */
    function initEventListeners() {
        const endTurnBtn = document.getElementById('end-turn-btn');
        if (endTurnBtn) {
            endTurnBtn.onclick = function() {
                if (typeof Game !== 'undefined' && typeof Game.endTurn === 'function') {
                    Game.endTurn();
                } else {
                    console.log('End Turn 버튼 클릭 (Game.endTurn이 아직 구현되지 않음)');
                }
            };
        }

        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.onclick = function() {
                if (typeof Game !== 'undefined' && typeof Game.restart === 'function') {
                    Game.restart();
                } else {
                    console.log('Restart 버튼 클릭 (Game.restart가 아직 구현되지 않음)');
                }
            };
        }
    }

    // 공개 API
    window.UI = {
        /**
         * 게임 화면을 렌더링합니다
         */
        render: render,

        /**
         * 이벤트 리스너를 초기화합니다
         */
        initEventListeners: initEventListeners
    };

    // 페이지 로드 완료 시 이벤트 리스너 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEventListeners);
    } else {
        initEventListeners();
    }

    console.log('UI 모듈 로드 완료');

})();
