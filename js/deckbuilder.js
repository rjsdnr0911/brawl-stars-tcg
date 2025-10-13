// 브롤스타즈 TCG - 덱 빌더 시스템
// Phase 2-3: 기본 덱 + 커스텀 덱 구성

(function() {
    'use strict';

    const DEBUG = true;
    const MAX_DECK_SIZE = 20;
    const MAX_CARD_COPIES = 2;
    const STORAGE_KEY = 'brawl_tcg_deck';

    const DeckBuilder = {
        currentDeck: [],  // [{id: 'shelly', count: 2}, ...]

        // ===== 초기화 =====
        init: function() {
            try {
                if (DEBUG) console.log('덱 빌더 초기화...');

                // localStorage에서 'default' 덱 로드 시도
                const saved = this.loadDeck('default');
                if (saved && saved.length === 20) {
                    this.currentDeck = this.convertToDeckObject(saved);
                    if (DEBUG) console.log('저장된 덱 로드 완료');
                } else {
                    // 저장된 덱이 없으면 기본 프리셋 사용
                    this.currentDeck = this.getPreset('default');
                    this.saveDeck('default');
                    if (DEBUG) console.log('기본 덱 로드 완료');
                }

                // 카드 풀을 먼저 렌더링 (UI가 완전히 준비된 후)
                setTimeout(() => {
                    this.renderCardPools();
                    if (DEBUG) console.log('카드 풀 렌더링 완료');
                }, 100);

                this.renderUI();
            } catch (error) {
                console.error('DeckBuilder.init 오류:', error);
            }
        },

        // ===== 카드 추가 =====
        addCard: function(cardId) {
            if (!cardId || typeof cardId !== 'string') {
                console.error('addCard: 잘못된 cardId');
                return false;
            }

            try {
                // 토큰 카드는 추가 불가
                const card = window.CardDB.get(cardId);
                if (!card) {
                    console.error('addCard: 카드를 찾을 수 없음');
                    return false;
                }

                if (card.rarity === 'token') {
                    console.log('토큰 카드는 덱에 넣을 수 없습니다');
                    return false;
                }

                // 기존에 있는 카드인지 확인
                const existing = this.currentDeck.find(item => item.id === cardId);
                if (existing) {
                    if (existing.count < MAX_CARD_COPIES) {
                        existing.count++;
                        if (DEBUG) console.log(card.name + ' 추가 (총 ' + existing.count + '장)');
                        this.renderUI();
                        return true;
                    } else {
                        console.log('최대 2장까지만 가능합니다');
                        return false;
                    }
                }

                // 덱이 가득 찼는지 확인
                const totalCount = this.currentDeck.reduce((sum, item) => sum + item.count, 0);
                if (totalCount >= MAX_DECK_SIZE) {
                    console.log('덱이 가득 찼습니다 (20/20)');
                    return false;
                }

                // 새 카드 추가
                this.currentDeck.push({id: cardId, count: 1});
                if (DEBUG) console.log(card.name + ' 추가 (1장)');
                this.renderUI();
                return true;
            } catch (error) {
                console.error('addCard 오류:', error);
                return false;
            }
        },

        // ===== 카드 제거 =====
        removeCard: function(cardId) {
            if (!cardId || typeof cardId !== 'string') {
                console.error('removeCard: 잘못된 cardId');
                return false;
            }

            try {
                const existing = this.currentDeck.find(item => item.id === cardId);
                if (!existing) {
                    console.log('덱에 해당 카드가 없습니다');
                    return false;
                }

                const card = window.CardDB.get(cardId);
                existing.count--;

                if (existing.count <= 0) {
                    this.currentDeck = this.currentDeck.filter(item => item.id !== cardId);
                }

                if (DEBUG) console.log(card.name + ' 제거 (남은 수: ' + Math.max(0, existing.count) + '장)');
                this.renderUI();
                return true;
            } catch (error) {
                console.error('removeCard 오류:', error);
                return false;
            }
        },

        // ===== 덱 유효성 검증 =====
        validateDeck: function(deckObject) {
            if (!Array.isArray(deckObject)) {
                console.error('validateDeck: 잘못된 deckObject');
                return { valid: false, errors: ['덱 데이터 오류'] };
            }

            try {
                const errors = [];

                // 1. 정확히 20장인지 확인
                const totalCount = deckObject.reduce((sum, item) => sum + item.count, 0);
                if (totalCount !== 20) {
                    errors.push('덱은 정확히 20장이어야 합니다 (현재: ' + totalCount + '장)');
                }

                // 2. 각 카드가 2장 이하인지 확인
                deckObject.forEach(item => {
                    if (item.count > 2) {
                        const card = window.CardDB.get(item.id);
                        if (card) {
                            errors.push(card.name + '은(는) 최대 2장까지만 가능합니다');
                        }
                    }
                });

                // 3. 기본 브롤러가 최소 1장 있는지 확인
                const hasBasicBrawler = deckObject.some(item => {
                    const card = window.CardDB.get(item.id);
                    return card && card.cardType === 'brawler' && card.isBasic;
                });
                if (!hasBasicBrawler) {
                    errors.push('기본 브롤러가 최소 1장 필요합니다');
                }

                // 4. 진화 카드가 있으면 기본 브롤러도 있어야 함
                deckObject.forEach(item => {
                    const card = window.CardDB.get(item.id);
                    if (card && card.evolvesFrom) {
                        const hasBase = deckObject.some(d => d.id === card.evolvesFrom);
                        if (!hasBase) {
                            const baseCard = window.CardDB.get(card.evolvesFrom);
                            if (baseCard) {
                                errors.push(card.name + '을(를) 사용하려면 ' + baseCard.name + '이(가) 필요합니다');
                            }
                        }
                    }
                });

                // 5. 토큰 카드는 덱에 넣을 수 없음
                deckObject.forEach(item => {
                    const card = window.CardDB.get(item.id);
                    if (card && card.rarity === 'token') {
                        errors.push(card.name + '은(는) 토큰이므로 덱에 넣을 수 없습니다');
                    }
                });

                return { valid: errors.length === 0, errors: errors };
            } catch (error) {
                console.error('validateDeck 오류:', error);
                return { valid: false, errors: ['유효성 검사 중 오류 발생'] };
            }
        },

        // ===== 덱 저장 (localStorage) =====
        saveDeck: function(deckName) {
            if (!deckName || typeof deckName !== 'string') {
                console.error('saveDeck: 잘못된 deckName');
                return false;
            }

            try {
                const deckArray = this.convertToArray(this.currentDeck);
                const cardIds = deckArray.map(card => card.id);
                const data = JSON.stringify(cardIds);
                localStorage.setItem(STORAGE_KEY + '_' + deckName, data);
                if (DEBUG) console.log('덱 저장 완료:', deckName);
                return true;
            } catch (error) {
                console.error('saveDeck 오류:', error);
                return false;
            }
        },

        // ===== 덱 불러오기 (localStorage) =====
        loadDeck: function(deckName) {
            if (!deckName || typeof deckName !== 'string') {
                console.error('loadDeck: 잘못된 deckName');
                return null;
            }

            try {
                const data = localStorage.getItem(STORAGE_KEY + '_' + deckName);
                if (!data) {
                    if (DEBUG) console.log('저장된 덱이 없습니다:', deckName);
                    return null;
                }

                const cardIds = JSON.parse(data);
                if (!Array.isArray(cardIds)) {
                    console.error('loadDeck: 잘못된 데이터 형식');
                    return null;
                }

                const deckArray = cardIds.map(id => window.CardDB.get(id)).filter(card => card !== null);
                if (DEBUG) console.log('덱 불러오기 완료:', deckName, '(', deckArray.length, '장)');
                return deckArray;
            } catch (error) {
                console.error('loadDeck 오류:', error);
                return null;
            }
        },

        // ===== DeckObject를 카드 배열로 변환 =====
        convertToArray: function(deckObject) {
            if (!Array.isArray(deckObject)) {
                console.error('convertToArray: 잘못된 deckObject');
                return [];
            }

            try {
                const deck = [];
                deckObject.forEach(item => {
                    for (let i = 0; i < item.count; i++) {
                        const card = window.CardDB.get(item.id);
                        if (card) {
                            deck.push(card);
                        }
                    }
                });
                return deck;
            } catch (error) {
                console.error('convertToArray 오류:', error);
                return [];
            }
        },

        // ===== 카드 배열을 DeckObject로 변환 =====
        convertToDeckObject: function(deckArray) {
            if (!Array.isArray(deckArray)) {
                console.error('convertToDeckObject: 잘못된 deckArray');
                return [];
            }

            try {
                const deckMap = {};
                deckArray.forEach(card => {
                    if (!card || !card.id) return;

                    if (!deckMap[card.id]) {
                        deckMap[card.id] = { id: card.id, count: 0 };
                    }
                    deckMap[card.id].count++;
                });
                return Object.values(deckMap);
            } catch (error) {
                console.error('convertToDeckObject 오류:', error);
                return [];
            }
        },

        // ===== 프리셋 덱 가져오기 =====
        getPreset: function(presetName) {
            if (!presetName || typeof presetName !== 'string') {
                console.error('getPreset: 잘못된 presetName');
                presetName = 'default';
            }

            try {
                const presets = {
                    // game.js createDefaultDeck()와 동일
                    'default': [
                        {id: 'shelly', count: 2},
                        {id: 'bandita_shelly', count: 1},
                        {id: 'colt', count: 1},
                        {id: 'nita', count: 1},
                        {id: 'poco', count: 2},
                        {id: 'serenade_poco', count: 1},
                        {id: 'bull', count: 2},
                        {id: 'super_potion', count: 2},
                        {id: 'brawl_ball', count: 2},
                        {id: 'speed_boots', count: 1},
                        {id: 'gales_supply', count: 2},
                        {id: 'taras_portal', count: 1},
                        {id: 'crows_poison', count: 2}
                    ],
                    // 밸런스형 덱
                    'balanced': [
                        {id: 'shelly', count: 2},
                        {id: 'bandita_shelly', count: 1},
                        {id: 'colt', count: 2},
                        {id: 'nita', count: 2},
                        {id: 'poco', count: 2},
                        {id: 'bull', count: 1},
                        {id: 'super_potion', count: 2},
                        {id: 'brawl_ball', count: 2},
                        {id: 'brawl_box', count: 2},
                        {id: 'gales_supply', count: 2},
                        {id: 'taras_portal', count: 1},
                        {id: 'crows_poison', count: 1}
                    ],
                    // 공격형 덱
                    'aggro': [
                        {id: 'shelly', count: 2},
                        {id: 'bandita_shelly', count: 2},
                        {id: 'edgar', count: 2},
                        {id: 'bibi', count: 2},
                        {id: 'bull', count: 2},
                        {id: 'maxs_rush', count: 2},
                        {id: 'power_cube', count: 2},
                        {id: 'instant_switch', count: 2},
                        {id: 'crows_poison', count: 2},
                        {id: 'brawl_box', count: 2}
                    ],
                    // 컨트롤형 덱
                    'control': [
                        {id: 'poco', count: 2},
                        {id: 'serenade_poco', count: 2},
                        {id: 'byron', count: 2},
                        {id: 'piper', count: 2},
                        {id: 'jessie', count: 1},
                        {id: 'penny', count: 1},
                        {id: 'super_potion', count: 2},
                        {id: 'spikes_regen', count: 2},
                        {id: 'franks_defense', count: 2},
                        {id: 'shield_gear', count: 2},
                        {id: 'taras_portal', count: 2}
                    ]
                };

                const preset = presets[presetName] || presets['default'];
                if (DEBUG) console.log('프리셋 로드:', presetName);
                return JSON.parse(JSON.stringify(preset)); // Deep copy
            } catch (error) {
                console.error('getPreset 오류:', error);
                return [];
            }
        },

        // ===== 프리셋 덱 로드 =====
        loadPreset: function(presetName) {
            if (!presetName || typeof presetName !== 'string') {
                console.error('loadPreset: 잘못된 presetName');
                return false;
            }

            try {
                this.currentDeck = this.getPreset(presetName);
                if (DEBUG) console.log('프리셋 덱 로드 완료:', presetName);
                this.renderUI();
                return true;
            } catch (error) {
                console.error('loadPreset 오류:', error);
                return false;
            }
        },

        // ===== UI 렌더링 =====
        renderUI: function() {
            try {
                // 덱 카운트 업데이트
                const totalCount = this.currentDeck.reduce((sum, item) => sum + item.count, 0);
                const deckCountEl = document.getElementById('deck-count');
                if (deckCountEl) {
                    deckCountEl.textContent = totalCount;
                }

                // 현재 덱 렌더링
                const currentDeckEl = document.getElementById('current-deck');
                if (currentDeckEl) {
                    if (this.currentDeck.length === 0) {
                        currentDeckEl.innerHTML = '<p style="color: #999;">덱이 비어있습니다</p>';
                    } else {
                        const deckHtml = this.currentDeck.map(item => {
                            const card = window.CardDB.get(item.id);
                            if (!card) return '';

                            return '<div class="deck-card-item">' +
                                '<span>' + card.name + ' (' + item.count + '/2)</span>' +
                                '<button onclick="window.DeckBuilder.removeCard(\'' + item.id + '\')">제거</button>' +
                                '</div>';
                        }).join('');
                        currentDeckEl.innerHTML = deckHtml;
                    }
                }

                // 게임 시작 버튼 활성화 여부
                const validation = this.validateDeck(this.currentDeck);
                const startBtn = document.getElementById('start-game-btn');
                if (startBtn) {
                    if (validation.valid) {
                        startBtn.disabled = false;
                        startBtn.style.opacity = '1';
                        startBtn.style.cursor = 'pointer';
                    } else {
                        startBtn.disabled = true;
                        startBtn.style.opacity = '0.5';
                        startBtn.style.cursor = 'not-allowed';
                    }
                }

                // 카드 풀이 비어있으면 렌더링
                const brawlerGrid = document.getElementById('brawler-grid');
                const trainerGrid = document.getElementById('trainer-grid');
                if (brawlerGrid && trainerGrid) {
                    // 그리드가 비어있으면 렌더링
                    if (!brawlerGrid.hasChildNodes() || !trainerGrid.hasChildNodes()) {
                        if (DEBUG) console.log('카드 풀 다시 렌더링...');
                        this.renderCardPools();
                    }
                }
            } catch (error) {
                console.error('renderUI 오류:', error);
            }
        },

        // ===== 카드 풀 렌더링 =====
        renderCardPools: function() {
            try {
                if (DEBUG) console.log('renderCardPools 시작...');

                // 브롤러 카드 (기본 + 진화, 토큰 제외)
                // Phase 1 + Phase 2 브롤러 ID 목록
                const allBrawlerIds = [
                    // Phase 1
                    'shelly', 'bandita_shelly', 'colt', 'royal_agent_colt',
                    'nita', 'poco', 'serenade_poco', 'bull',
                    // Phase 2
                    'edgar', 'mortis', 'byron', 'bea', 'bibi', 'piper',
                    'dynamike', 'barley', 'jessie', 'penny'
                ].filter(id => {
                    const card = window.CardDB.get(id);
                    return card && card.rarity !== 'token';
                });

                if (DEBUG) console.log('브롤러 카드 수:', allBrawlerIds.length);

                // 트레이너 카드
                const trainerIds = window.CardDB.getAllTrainerIds ?
                    window.CardDB.getAllTrainerIds() : [];

                if (DEBUG) console.log('트레이너 카드 수:', trainerIds.length);

                // 브롤러 그리드
                const brawlerGrid = document.getElementById('brawler-grid');
                if (brawlerGrid) {
                    const brawlerHtml = allBrawlerIds.map(id => {
                        const card = window.CardDB.get(id);
                        if (!card) return '';

                        const rarityIcon = card.isBasic ? '⭐' : '✨';
                        return '<div class="card-grid-item" onclick="window.DeckBuilder.addCard(\'' + id + '\')">' +
                            '<div class="card-name">' + rarityIcon + ' ' + card.name + '</div>' +
                            '<div class="card-hp">HP: ' + card.hp + '</div>' +
                            '</div>';
                    }).join('');
                    brawlerGrid.innerHTML = brawlerHtml;
                    if (DEBUG) console.log('브롤러 그리드 렌더링 완료:', brawlerGrid.children.length, '개');
                } else {
                    console.error('brawler-grid 요소를 찾을 수 없습니다');
                }

                // 트레이너 그리드
                const trainerGrid = document.getElementById('trainer-grid');
                if (trainerGrid) {
                    const trainerHtml = trainerIds.map(id => {
                        const card = window.CardDB.get(id);
                        if (!card) return '';

                        const typeIcon = card.trainerType === 'item' ? '📦' : '👤';
                        return '<div class="card-grid-item" onclick="window.DeckBuilder.addCard(\'' + id + '\')">' +
                            '<div class="card-name">' + typeIcon + ' ' + card.name + '</div>' +
                            '<div class="card-desc">' + (card.description || '') + '</div>' +
                            '</div>';
                    }).join('');
                    trainerGrid.innerHTML = trainerHtml;
                    if (DEBUG) console.log('트레이너 그리드 렌더링 완료:', trainerGrid.children.length, '개');
                } else {
                    console.error('trainer-grid 요소를 찾을 수 없습니다');
                }
            } catch (error) {
                console.error('renderCardPools 오류:', error);
            }
        },

        // ===== 게임 시작 =====
        startGame: function() {
            try {
                const validation = this.validateDeck(this.currentDeck);
                if (!validation.valid) {
                    alert('덱 구성 오류:\n' + validation.errors.join('\n'));
                    return false;
                }

                // 덱 저장
                this.saveDeck('default');

                // 덱 빌더 패널 닫기
                const deckbuilderPanel = document.getElementById('deckbuilder-panel');
                const overlay = document.getElementById('overlay');
                if (deckbuilderPanel) {
                    deckbuilderPanel.classList.remove('active');
                }
                if (overlay) {
                    overlay.classList.remove('active');
                }

                // 게임 시작
                if (typeof window.Game !== 'undefined') {
                    window.Game.init();
                } else {
                    console.error('Game 객체를 찾을 수 없습니다');
                    return false;
                }

                return true;
            } catch (error) {
                console.error('startGame 오류:', error);
                return false;
            }
        }
    };

    // 전역 노출
    window.DeckBuilder = DeckBuilder;

    if (DEBUG) {
        console.log('덱 빌더 시스템 로드 완료');
    }
})();
