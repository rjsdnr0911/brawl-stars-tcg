// 브롤스타즈 TCG - UI 렌더링 (Pokemon TCG Pocket 스타일)

(function() {
    'use strict';

    const DEBUG = false;

    // ===== UI 렌더링 =====
    function render(gameState) {
        if (!gameState) {
            console.error('render: gameState가 없습니다');
            return;
        }

        try {
            // 플레이어 영역
            renderPlayerArea(gameState.player, 'player');

            // AI 영역
            renderPlayerArea(gameState.ai, 'ai');

            // 턴 정보
            renderTurnInfo(gameState);

            // 에너지존
            renderEnergyZone(gameState.player);

            // 손패 개수
            updateHandCount(gameState.player);

        } catch (error) {
            console.error('render 오류:', error);
        }
    }

    // ===== 플레이어 영역 렌더링 =====
    function renderPlayerArea(player, playerType) {
        try {
            // 손패 (플레이어만, 패널 내부에)
            if (playerType === 'player') {
                const handEl = document.getElementById('player-hand');
                if (handEl) {
                    handEl.innerHTML = '';

                    // 손패 정렬 적용
                    const sortedHand = sortHandCards(player.hand);

                    sortedHand.forEach((card) => {
                        // 원래 손패에서의 인덱스 찾기 (클릭 이벤트용)
                        const originalIndex = player.hand.indexOf(card);
                        const cardEl = createCardElement(card, playerType, 'hand', originalIndex);
                        handEl.appendChild(cardEl);
                    });
                }
            }
            // AI 손패는 표시하지 않음

            // 배틀존
            const battleEl = document.getElementById(playerType + '-battle');
            if (battleEl) {
                battleEl.innerHTML = '';
                if (player.battleZone) {
                    const cardEl = createCardElement(player.battleZone, playerType, 'battle', 0);
                    battleEl.appendChild(cardEl);
                }
            }

            // 벤치
            const benchEl = document.getElementById(playerType + '-bench');
            if (benchEl) {
                benchEl.innerHTML = '';
                player.bench.forEach((brawler, index) => {
                    if (brawler) {
                        const cardEl = createCardElement(brawler, playerType, 'bench', index);
                        benchEl.appendChild(cardEl);
                    }
                });
            }

            // 점수
            const prizesEl = document.getElementById(playerType + '-prizes');
            if (prizesEl) {
                prizesEl.textContent = player.prizes + ' / 3';
            }

            // 덱 개수
            const deckCountEl = document.getElementById(playerType + '-deck-count');
            if (deckCountEl) {
                deckCountEl.textContent = player.deck.length;
            }

            // 에너지 개수 (상대)
            if (playerType === 'ai') {
                const energyCountEl = document.getElementById('ai-energy-count');
                if (energyCountEl) {
                    energyCountEl.textContent = player.energyZone.length;
                }
            } else {
                const energyCountEl = document.getElementById('player-energy-count');
                if (energyCountEl) {
                    energyCountEl.textContent = player.energyZone.length;
                }
            }

        } catch (error) {
            console.error('renderPlayerArea 오류:', error);
        }
    }

    // ===== 손패 개수 업데이트 =====
    function updateHandCount(player) {
        const handCountEl = document.getElementById('hand-count');
        if (handCountEl) {
            handCountEl.textContent = player.hand.length;
        }
    }

    // ===== 에너지존 렌더링 =====
    function renderEnergyZone(player) {
        const energyItemsEl = document.getElementById('energy-items');
        if (!energyItemsEl) return;

        energyItemsEl.innerHTML = '';

        player.energyZone.forEach((energy, index) => {
            const energyDiv = document.createElement('div');
            energyDiv.className = 'energy-item';
            energyDiv.innerHTML = '<img src="images/ui/ui_energy_brawl.png" alt="Energy" class="energy-icon">';
            energyDiv.dataset.index = index;

            // 드래그 시작
            energyDiv.draggable = true;
            energyDiv.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('energyIndex', index);
                energyDiv.classList.add('dragging');
            });

            energyDiv.addEventListener('dragend', function(e) {
                energyDiv.classList.remove('dragging');
            });

            // 클릭해서 붙이기 (대체 방법)
            energyDiv.addEventListener('click', function() {
                // 에너지 선택 상태 표시
                document.querySelectorAll('.energy-item').forEach(e => e.style.border = 'none');
                energyDiv.style.border = '3px solid yellow';

                // 다음 브롤러 클릭 시 부착
                window.selectedEnergyIndex = index;
                alert('에너지를 붙일 브롤러를 클릭하세요');
            });

            energyItemsEl.appendChild(energyDiv);
        });
    }

    // ===== 브롤러/트레이너 이모지 맵 =====
    const CARD_EMOJIS = {
        // 브롤러
        'shelly': '🔫',
        'bandita_shelly': '💀🔫',
        'colt': '🎯',
        'royal_agent_colt': '🕴️',
        'poco': '🎸',
        'serenade_poco': '🎸✨',
        'nita': '🐻',
        'bull': '🐂',
        // 트레이너
        'super_potion': '💊',
        'brawl_ball': '⚽',
        'speed_boots': '👟',
        'gales_supply': '📦',
        'taras_portal': '🌀',
        'crows_poison': '🧪'
    };

    // ===== 브롤러별 그라디언트 색상 =====
    const CARD_GRADIENTS = {
        'shelly': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'bandita_shelly': 'linear-gradient(135deg, #8e44ad 0%, #c0392b 100%)',
        'colt': 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
        'royal_agent_colt': 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
        'poco': 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)',
        'serenade_poco': 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
        'nita': 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
        'bull': 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
        // 트레이너 기본
        'trainer_item': 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
        'trainer_supporter': 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
    };

    // ===== HP 바 색상 계산 =====
    function getHpBarColor(currentHp, maxHp) {
        if (typeof currentHp !== 'number' || typeof maxHp !== 'number' || maxHp === 0) {
            return 'linear-gradient(90deg, #9ca3af, #6b7280)';
        }

        const percentage = (currentHp / maxHp) * 100;
        if (percentage > 60) return 'linear-gradient(90deg, #4ade80, #22c55e)';
        if (percentage > 30) return 'linear-gradient(90deg, #fbbf24, #f59e0b)';
        return 'linear-gradient(90deg, #f87171, #ef4444)';
    }

    // ===== 손패 정렬 =====
    function sortHandCards(hand) {
        if (!Array.isArray(hand)) return [];

        try {
            return [...hand].sort((a, b) => {
                // 1순위: 카드 타입 (브롤러 우선)
                if (a.cardType !== b.cardType) {
                    return a.cardType === 'brawler' ? -1 : 1;
                }

                // 2순위: 브롤러인 경우 기본/진화 구분 (기본 우선)
                if (a.cardType === 'brawler' && a.isBasic !== b.isBasic) {
                    return a.isBasic ? -1 : 1;
                }

                // 3순위: 이름 가나다순/알파벳순
                return a.name.localeCompare(b.name, 'ko');
            });
        } catch (error) {
            console.error('sortHandCards error:', error);
            return hand;
        }
    }

    // ===== 카드 요소 생성 =====
    function createCardElement(card, playerType, location, index) {
        const div = document.createElement('div');
        div.className = 'card';

        // 브롤러 카드
        if (card.cardType === 'brawler') {
            const imagePath = `images/brawlers/brawler_${card.id}.png`;
            const emoji = CARD_EMOJIS[card.id] || '❓';
            const gradient = CARD_GRADIENTS[card.id] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

            // HP 바 계산
            const hpPercentage = Math.max(0, Math.min(100, (card.hp / card.maxHp) * 100));
            const hpColor = getHpBarColor(card.hp, card.maxHp);

            div.innerHTML = `
                <div class="card-image-container">
                    <img src="${imagePath}" alt="${card.name}" class="card-image" onerror="this.parentElement.innerHTML='<div class=\\'card-emoji-fallback\\'><div class=\\'emoji-icon\\'>${emoji}</div></div>'">
                </div>
                <div class="hp-bar-container">
                    <div class="hp-bar" style="width: ${hpPercentage}%; background: ${hpColor};"></div>
                </div>
                <div class="card-info">
                    <div class="card-name">${card.name}</div>
                    <div class="card-hp">HP: ${card.hp}/${card.maxHp}</div>
                    <div class="card-energy">${getEnergyDisplay(card)}</div>
                    <div class="card-attacks">${getAttacksDisplay(card, playerType, location)}</div>
                </div>
            `;

            // 그라디언트 배경 적용 (이미지 없을 때 사용)
            div.style.setProperty('--card-gradient', gradient);

            // 배치 클릭 이벤트 (플레이어 손패만)
            if (playerType === 'player' && location === 'hand' && card.isBasic) {
                div.onclick = function() {
                    // 배틀존이 비어있으면 배틀존으로, 아니면 벤치로
                    const toBattle = !window.Game.getState().player.battleZone;
                    window.Game.playBrawler(index, toBattle);
                    render(window.Game.getState());
                };
                div.style.cursor = 'pointer';
            }

            // 진화 클릭 이벤트 (진화 카드)
            if (playerType === 'player' && location === 'hand' && !card.isBasic && card.evolvesFrom) {
                div.onclick = function() {
                    tryEvolveBrawler(index, card);
                };
                div.style.cursor = 'pointer';
                div.style.border = '2px solid #9B59B6';  // 진화 카드 표시
            }

            // 에너지 부착 (플레이어 필드 - 드래그 또는 클릭)
            if (playerType === 'player' && location !== 'hand') {
                // 드래그로 에너지 받기
                div.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    div.classList.add('drop-target');
                });

                div.addEventListener('dragleave', function(e) {
                    div.classList.remove('drop-target');
                });

                div.addEventListener('drop', function(e) {
                    e.preventDefault();
                    div.classList.remove('drop-target');

                    const energyIndex = e.dataTransfer.getData('energyIndex');
                    if (energyIndex !== undefined) {
                        attachEnergyToCard(location, index);
                    }
                });

                // 클릭으로 에너지 부착 (선택된 에너지가 있을 때)
                div.addEventListener('click', function(e) {
                    // 대상 선택 모드 우선 처리
                    if (window.targetSelectionActive) {
                        handleTargetSelection(location, index, false);
                        e.stopPropagation();
                        return;
                    }

                    if (window.selectedEnergyIndex !== undefined) {
                        attachEnergyToCard(location, index);
                        window.selectedEnergyIndex = undefined;
                        document.querySelectorAll('.energy-item').forEach(e => e.style.border = 'none');
                    }
                });
            }

            // 상대 필드 브롤러 클릭 (대상 선택용)
            if (playerType === 'ai' && location !== 'hand') {
                div.addEventListener('click', function(e) {
                    if (window.targetSelectionActive) {
                        handleTargetSelection(location, index, true);
                        e.stopPropagation();
                    }
                });
                div.style.cursor = 'pointer';
            }

            // 공격 (플레이어 배틀존)
            if (playerType === 'player' && location === 'battle' && card.canAttack) {
                div.classList.add('can-attack');

                // 클릭하면 공격 패널 표시 (대상 선택 모드가 아닐 때만)
                div.addEventListener('click', function(e) {
                    if (!window.targetSelectionActive) {
                        showAttackPanel(card);
                    } else {
                        // 대상 선택 모드에서는 대상으로 처리
                        handleTargetSelection(location, index, false);
                        e.stopPropagation();
                    }
                });
            }
        }
        // 트레이너 카드
        else if (card.cardType === 'trainer') {
            const imagePath = `images/trainers/trainer_${card.id}.png`;
            const emoji = CARD_EMOJIS[card.id] || '📜';
            const gradient = card.trainerType === 'item' ? CARD_GRADIENTS['trainer_item'] : CARD_GRADIENTS['trainer_supporter'];

            div.innerHTML = `
                <div class="card-image-container">
                    <img src="${imagePath}" alt="${card.name}" class="card-image" onerror="this.parentElement.innerHTML='<div class=\\'card-emoji-fallback\\'><div class=\\'emoji-icon\\'>${emoji}</div></div>'">
                </div>
                <div class="card-info">
                    <div class="card-name">${card.name}</div>
                    <div class="card-type">${card.trainerType === 'item' ? '아이템' : '서포터'}</div>
                    <div class="card-description">${card.description || ''}</div>
                </div>
            `;

            // 그라디언트 배경 적용
            div.style.setProperty('--card-gradient', gradient);

            // 사용 클릭 이벤트
            if (playerType === 'player' && location === 'hand') {
                div.onclick = function() {
                    useTrainerCard(index);
                };
                div.style.cursor = 'pointer';
            }
        }

        // 우클릭으로 카드 상세보기
        div.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showCardModal(card);
        });

        return div;
    }

    // ===== 에너지 붙이기 =====
    function attachEnergyToCard(location, index) {
        try {
            // 파티클 트레일 효과 (에너지존 → 대상 카드)
            if (typeof window.ParticleSystem !== 'undefined') {
                // 에너지존 위치 (시작점)
                const energyZoneEl = document.getElementById('energy-items');
                if (energyZoneEl) {
                    const energyRect = energyZoneEl.getBoundingClientRect();
                    const startX = energyRect.left + energyRect.width / 2;
                    const startY = energyRect.top + energyRect.height / 2;

                    // 대상 카드 위치 (도착점)
                    let targetSelector = null;
                    if (location === 'battle') {
                        targetSelector = '.player-battle .card';
                    } else if (location === 'bench') {
                        targetSelector = `.player-bench .card:nth-child(${index + 1})`;
                    }

                    if (targetSelector) {
                        const targetEl = document.querySelector(targetSelector);
                        if (targetEl) {
                            const targetRect = targetEl.getBoundingClientRect();
                            const endX = targetRect.left + targetRect.width / 2;
                            const endY = targetRect.top + targetRect.height / 2;

                            // 파티클 트레일 생성 (파란색 에너지)
                            window.ParticleSystem.createTrail(startX, startY, endX, endY, '#3498db');
                        }
                    }
                }
            }

            // 실제 에너지 부착
            const result = window.Game.attachEnergy(location, index);
            if (result) {
                render(window.Game.getState());
            }
        } catch (error) {
            console.error('attachEnergyToCard 오류:', error);
        }
    }

    // ===== 공격 패널 표시 =====
    function showAttackPanel(brawler) {
        const attackPanel = document.getElementById('attack-panel');
        const attackOptions = document.getElementById('attack-options');
        const attackerName = document.getElementById('attacker-name');
        const overlay = document.getElementById('overlay');

        if (!brawler || !brawler.attacks) return;

        attackerName.textContent = brawler.name;
        attackOptions.innerHTML = '';

        brawler.attacks.forEach((attack, i) => {
            const btn = document.createElement('button');
            btn.className = 'attack-option-btn';

            const costStr = window.EnergySystem.getEnergyDisplay(attack.cost);
            const canPay = window.EnergySystem.canPayCost(brawler, attack.cost);

            btn.innerHTML = `
                <div>${attack.name}</div>
                <div class="attack-cost">${costStr}</div>
                <div class="attack-damage">피해: ${attack.damage}</div>
            `;

            if (!canPay) {
                btn.disabled = true;
            } else {
                btn.onclick = function() {
                    window.Game.attack(i);
                    attackPanel.classList.remove('active');
                    overlay.classList.remove('active');
                    render(window.Game.getState());
                };
            }

            attackOptions.appendChild(btn);
        });

        attackPanel.classList.add('active');
        overlay.classList.add('active');
    }

    // ===== 에너지 표시 =====
    function getEnergyDisplay(card) {
        if (!card.energy || card.energy.length === 0) {
            return '에너지: 없음';
        }
        return '🔷 x ' + card.energy.length;
    }

    // ===== 공격 표시 (간단히만) =====
    function getAttacksDisplay(card, playerType, location) {
        if (!card.attacks || card.attacks.length === 0) {
            return '';
        }

        // 배틀존 브롤러만 공격 표시
        if (location !== 'battle') {
            return ''; // 벤치는 공격 숨김
        }

        return card.attacks.map((atk, i) => {
            const costStr = window.EnergySystem.getEnergyDisplay(atk.cost);
            return `<div class="attack">${costStr} ${atk.name} ${atk.damage}</div>`;
        }).join('');
    }

    // ===== 트레이너 카드 사용 =====
    function useTrainerCard(handIndex) {
        const player = window.Game.getState().player;
        const card = player.hand[handIndex];

        if (!card || card.cardType !== 'trainer') {
            return;
        }

        // 서포터는 턴당 1회
        if (card.trainerType === 'supporter' && player.supporterUsedThisTurn) {
            alert('이번 턴에 이미 서포터를 사용했습니다');
            return;
        }

        // 파워 큐브 - 배틀존에 자동 부착
        if (card.effect === 'attach_extra_energy') {
            const success = window.Effects.handleTrainerEffect(card.effect, window.Game.getState(), 'battle', 0);
            if (success) {
                player.hand.splice(handIndex, 1);
                render(window.Game.getState());
            }
            return;
        }

        // 대상 선택이 필요한 카드 처리
        if (needsTargetSelection(card.effect)) {
            window.pendingTrainerCard = { handIndex: handIndex, card: card };
            activateTargetSelectionMode(card);
            return;
        }

        // 일반 효과 실행 (대상 선택 불필요)
        const success = window.Effects.handleTrainerEffect(card.effect, window.Game.getState());

        if (success) {
            // 손패에서 제거
            player.hand.splice(handIndex, 1);

            // 서포터 사용 표시
            if (card.trainerType === 'supporter') {
                player.supporterUsedThisTurn = true;
            }

            // UI 업데이트
            render(window.Game.getState());
        }
    }

    // ===== 대상 선택이 필요한지 확인 =====
    function needsTargetSelection(effectName) {
        const targetEffects = [
            'heal_30',                  // 슈퍼 포션
            'full_heal_remove_energy',  // 스파이크의 재생
            'instant_switch',           // 교체 스위치
            'switch_opponent'           // 타라의 포털
        ];
        return targetEffects.includes(effectName);
    }

    // ===== 대상 선택 모드 활성화 =====
    function activateTargetSelectionMode(card) {
        // 손패 패널 닫기
        document.getElementById('hand-panel').classList.remove('active');

        // 안내 메시지
        const effectMessages = {
            'heal_30': '회복할 브롤러를 클릭하세요',
            'full_heal_remove_energy': '최대 회복할 브롤러를 클릭하세요',
            'instant_switch': '배틀존과 교체할 벤치 브롤러를 클릭하세요',
            'switch_opponent': '강제로 불러올 상대 벤치 브롤러를 클릭하세요'
        };

        alert(effectMessages[card.effect] || '대상을 선택하세요');

        // 대상 선택 모드 플래그
        window.targetSelectionActive = true;
    }

    // ===== 대상 선택 완료 처리 =====
    function handleTargetSelection(location, index, isOpponent) {
        if (!window.targetSelectionActive || !window.pendingTrainerCard) {
            return;
        }

        const { handIndex, card } = window.pendingTrainerCard;
        const player = window.Game.getState().player;
        let success = false;

        // 효과별 처리
        if (card.effect === 'switch_opponent') {
            // 상대 벤치 선택
            success = window.Effects.handleTrainerEffect(card.effect, window.Game.getState(), index);
        } else if (card.effect === 'instant_switch') {
            // 내 벤치 선택
            success = window.Effects.handleTrainerEffect(card.effect, window.Game.getState(), index);
        } else {
            // 일반 대상 선택 (location, index)
            success = window.Effects.handleTrainerEffect(card.effect, window.Game.getState(), location, index);
        }

        if (success) {
            // 손패에서 제거
            player.hand.splice(handIndex, 1);

            // 서포터 사용 표시
            if (card.trainerType === 'supporter') {
                player.supporterUsedThisTurn = true;
            }

            // UI 업데이트
            render(window.Game.getState());
        }

        // 대상 선택 모드 종료
        window.targetSelectionActive = false;
        window.pendingTrainerCard = null;
    }

    // ===== 턴 정보 렌더링 =====
    function renderTurnInfo(gameState) {
        if (typeof gameState !== 'object') return;

        const turnInfoEl = document.getElementById('turn-info');
        if (!turnInfoEl) return;

        try {
            const isPlayerTurn = gameState.currentPlayer === 'player';
            const player = isPlayerTurn ? gameState.player : gameState.ai;
            const playerName = isPlayerTurn ? '플레이어' : 'AI';
            const playerColor = isPlayerTurn ? '#3b82f6' : '#ef4444';

            turnInfoEl.innerHTML = `
                <div class="turn-number">턴 ${gameState.turnCount}</div>
                <div class="turn-player-name" style="color: ${playerColor};">
                    ${playerName}
                </div>
                <div class="turn-actions">
                    <div class="turn-action-item ${player.energyAttachedThisTurn ? 'done' : ''}">
                        <span class="action-icon">⚡</span>
                        <span class="action-label">에너지</span>
                    </div>
                    <div class="turn-action-item ${player.supporterUsedThisTurn ? 'done' : ''}">
                        <span class="action-icon">👤</span>
                        <span class="action-label">서포터</span>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('renderTurnInfo error:', error);
        }
    }

    // ===== 카드 드로우 애니메이션 (Pokemon TCG Pocket 스타일) =====
    function playCardDrawAnimation(playerType, card) {
        if (!card) return;

        try {
            // 덱 요소 위치 (시작점)
            const deckEl = document.getElementById(playerType + '-deck-pile');
            if (!deckEl) return;

            const deckRect = deckEl.getBoundingClientRect();

            // 손패 토글 버튼 위치 (목표점 - 플레이어만)
            let targetX, targetY;

            if (playerType === 'player') {
                const handBtn = document.getElementById('hand-toggle-btn');
                if (handBtn) {
                    const handRect = handBtn.getBoundingClientRect();
                    targetX = handRect.left + handRect.width / 2 - deckRect.left - 55;
                    targetY = handRect.top + handRect.height / 2 - deckRect.top - 100;
                } else {
                    // 폴백: 화면 하단 중앙
                    targetX = window.innerWidth / 2 - deckRect.left - 55;
                    targetY = window.innerHeight - 150 - deckRect.top;
                }
            } else {
                // AI는 상단 중앙
                targetX = window.innerWidth / 2 - deckRect.left - 55;
                targetY = -deckRect.top + 100;
            }

            // 임시 카드 요소 생성
            const cardEl = document.createElement('div');
            cardEl.className = 'card card-drawing';
            cardEl.style.left = deckRect.left + 'px';
            cardEl.style.top = deckRect.top + 'px';
            cardEl.style.setProperty('--draw-x', targetX + 'px');
            cardEl.style.setProperty('--draw-y', targetY + 'px');

            // 카드 뒷면 이미지
            cardEl.innerHTML = `
                <div class="card-image-container">
                    <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 40px; border-radius: 5px;">
                        🃏
                    </div>
                </div>
            `;

            document.body.appendChild(cardEl);

            // 애니메이션 완료 후 제거
            setTimeout(() => {
                if (cardEl.parentNode) {
                    cardEl.parentNode.removeChild(cardEl);
                }
            }, 800);

        } catch (error) {
            console.error('playCardDrawAnimation 오류:', error);
        }
    }

    // ===== 진화 시도 (Pokemon TCG Pocket 스타일) =====
    function tryEvolveBrawler(handIndex, evolutionCard) {
        if (!evolutionCard || !evolutionCard.evolvesFrom) {
            console.error('tryEvolveBrawler: 잘못된 진화 카드', evolutionCard);
            return;
        }

        try {
            const player = window.Game.getState().player;

            // 진화 대상 찾기
            let targetBrawler = null;
            let targetLocation = null;
            let targetIndex = -1;
            let cardSelector = null;

            // 배틀존 체크
            if (player.battleZone && player.battleZone.id === evolutionCard.evolvesFrom) {
                targetBrawler = player.battleZone;
                targetLocation = 'battle';
                targetIndex = 0;
                cardSelector = '.player-battle .card';
            }
            // 벤치 체크
            else {
                for (let i = 0; i < player.bench.length; i++) {
                    if (player.bench[i] && player.bench[i].id === evolutionCard.evolvesFrom) {
                        targetBrawler = player.bench[i];
                        targetLocation = 'bench';
                        targetIndex = i;
                        cardSelector = `.player-bench .card:nth-child(${i + 1})`;
                        break;
                    }
                }
            }

            // 진화 대상이 없으면 경고
            if (!targetBrawler) {
                alert(`${evolutionCard.evolvesFrom} 브롤러가 필드에 없습니다. 먼저 기본 브롤러를 배치하세요.`);
                return;
            }

            // 카드 DOM 요소 찾기
            const cardEl = document.querySelector(cardSelector);
            if (!cardEl) {
                console.error('tryEvolveBrawler: 카드 요소를 찾을 수 없음', cardSelector);
                return;
            }

            // 진화 애니메이션 적용
            cardEl.classList.add('card-evolving');

            // 파티클 폭발 효과
            if (typeof window.ParticleSystem !== 'undefined') {
                const rect = cardEl.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                window.ParticleSystem.createEvolutionBurst(centerX, centerY);
            }

            // 애니메이션 완료 후 진화 처리
            setTimeout(() => {
                // 에너지와 상태 이전
                evolutionCard.energy = targetBrawler.energy || [];
                evolutionCard.canAttack = targetBrawler.canAttack || false;
                evolutionCard.hp = targetBrawler.hp; // 현재 HP 유지

                // 필드에서 진화 카드로 교체
                if (targetLocation === 'battle') {
                    player.battleZone = evolutionCard;
                } else {
                    player.bench[targetIndex] = evolutionCard;
                }

                // 손패에서 진화 카드 제거
                player.hand.splice(handIndex, 1);

                // UI 업데이트
                render(window.Game.getState());

                // 진화 완료 메시지
                console.log(`${targetBrawler.name} → ${evolutionCard.name} 진화 완료!`);

            }, 1200);  // CSS 애니메이션 길이와 동일

        } catch (error) {
            console.error('tryEvolveBrawler 오류:', error);
        }
    }

    // ===== 카드 상세보기 모달 =====
    function showCardModal(card) {
        if (!card || typeof card !== 'object') return;

        const modal = document.getElementById('card-modal-panel');
        const overlay = document.getElementById('overlay');

        if (!modal || !overlay) return;

        try {
            const modalContent = modal.querySelector('.card-modal-content');

            let html = '';

            if (card.cardType === 'brawler') {
                const energyInfo = card.energy && card.energy.length > 0
                    ? `🔷 ${card.energy.length}개 부착됨`
                    : '에너지 없음';

                const evolutionInfo = card.evolvesFrom
                    ? `진화: ${card.evolvesFrom} → ${card.name}`
                    : (card.evolvesTo ? `진화 가능: ${card.name} → ${card.evolvesTo}` : '진화 불가');

                html = `
                    <div class="modal-card-large">
                        <img src="images/brawlers/brawler_${card.id}.png" alt="${card.name}"
                             onerror="this.style.display='none'">
                    </div>
                    <div class="modal-card-info">
                        <h2 class="modal-card-name">${card.name}</h2>
                        <div class="modal-info-row">
                            <span class="modal-label">타입:</span>
                            <span class="modal-value">브롤러 (${card.rarity})</span>
                        </div>
                        <div class="modal-info-row">
                            <span class="modal-label">HP:</span>
                            <span class="modal-value">${card.hp} / ${card.maxHp}</span>
                        </div>
                        <div class="modal-info-row">
                            <span class="modal-label">에너지:</span>
                            <span class="modal-value">${energyInfo}</span>
                        </div>
                        <div class="modal-info-row">
                            <span class="modal-label">후퇴 비용:</span>
                            <span class="modal-value">${'🔷'.repeat(card.retreatCost || 0)}</span>
                        </div>
                        <div class="modal-info-row">
                            <span class="modal-label">진화:</span>
                            <span class="modal-value">${evolutionInfo}</span>
                        </div>
                        <div class="modal-attacks-section">
                            <h3>공격</h3>
                            ${card.attacks.map(atk => `
                                <div class="modal-attack-item">
                                    <div class="attack-header">
                                        <span class="attack-name">${atk.name}</span>
                                        <span class="attack-damage">${atk.damage || 0}</span>
                                    </div>
                                    <div class="attack-cost">${window.EnergySystem.getEnergyDisplay(atk.cost)}</div>
                                    ${atk.effect ? `<div class="attack-effect">효과: ${atk.effect}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else if (card.cardType === 'trainer') {
                html = `
                    <div class="modal-card-large">
                        <img src="images/trainers/trainer_${card.id}.png" alt="${card.name}"
                             onerror="this.style.display='none'">
                    </div>
                    <div class="modal-card-info">
                        <h2 class="modal-card-name">${card.name}</h2>
                        <div class="modal-info-row">
                            <span class="modal-label">타입:</span>
                            <span class="modal-value">트레이너 (${card.trainerType === 'item' ? '아이템' : '서포터'})</span>
                        </div>
                        <div class="modal-effect-section">
                            <h3>효과</h3>
                            <p>${card.description || card.effect}</p>
                        </div>
                    </div>
                `;
            }

            modalContent.innerHTML = html;
            modal.classList.add('active');
            overlay.classList.add('active');
        } catch (error) {
            console.error('showCardModal error:', error);
        }
    }

    // 전역 노출
    window.UI = {
        render: render,
        showAttackPanel: showAttackPanel,
        playCardDrawAnimation: playCardDrawAnimation,
        showCardModal: showCardModal,
        createCardElement: createCardElement
    };

    if (DEBUG) {
        console.log('UI 시스템 로드 완료');
    }
})();
