// 브롤스타즈 TCG - AI 시스템

(function() {
    'use strict';

    const DEBUG = true;

    // ===== AI 턴 실행 =====
    function playTurn(gameState) {
        if (DEBUG) console.log('=== AI 턴 시작 ===');

        try {
            const ai = gameState.ai;

            // 1. 기본 브롤러 배치
            setTimeout(() => {
                playBasicBrawler(ai);
            }, 500);

            // 2. 에너지 부착
            setTimeout(() => {
                attachEnergy(ai);
            }, 1000);

            // 3. 공격
            setTimeout(() => {
                attackOpponent(ai, gameState);
            }, 1500);

            // 4. 턴 종료
            setTimeout(() => {
                window.Game.endTurn();
            }, 2000);

        } catch (error) {
            console.error('AI.playTurn 오류:', error);
            window.Game.endTurn();
        }
    }

    // ===== 기본 브롤러 배치 =====
    function playBasicBrawler(ai) {
        try {
            // 손에서 기본 브롤러 찾기
            const basicIndex = ai.hand.findIndex(card =>
                card.cardType === 'brawler' && card.isBasic
            );

            if (basicIndex === -1) return;

            // 배틀존이 비어있으면 배틀존에
            if (!ai.battleZone) {
                const card = ai.hand.splice(basicIndex, 1)[0];
                card.energy = [];
                card.canAttack = false;
                ai.battleZone = card;
                if (DEBUG) console.log('AI: ' + card.name + ' 배틀존 배치');
            }
            // 벤치가 비어있으면 벤치에
            else if (ai.bench.length < 3) {
                const card = ai.hand.splice(basicIndex, 1)[0];
                card.energy = [];
                card.canAttack = false;
                ai.bench.push(card);
                if (DEBUG) console.log('AI: ' + card.name + ' 벤치 배치');
            }

            // UI 업데이트
            if (typeof window.UI !== 'undefined') {
                window.UI.render(window.Game.getState());
            }

        } catch (error) {
            console.error('playBasicBrawler 오류:', error);
        }
    }

    // ===== 에너지 부착 =====
    function attachEnergy(ai) {
        try {
            // 이미 에너지 부착했거나, 에너지가 없으면 패스
            if (ai.energyAttachedThisTurn || ai.energyZone.length === 0) {
                return;
            }

            // 배틀존 브롤러에게 우선 부착
            if (ai.battleZone) {
                const energy = ai.energyZone.shift();
                window.EnergySystem.attachEnergy(ai.battleZone, energy);
                ai.energyAttachedThisTurn = true;
                if (DEBUG) console.log('AI: 에너지 부착');
            }

            // UI 업데이트
            if (typeof window.UI !== 'undefined') {
                window.UI.render(window.Game.getState());
            }

        } catch (error) {
            console.error('attachEnergy 오류:', error);
        }
    }

    // ===== 공격 =====
    function attackOpponent(ai, gameState) {
        try {
            if (!ai.battleZone || !ai.battleZone.canAttack) {
                return;
            }

            // 사용 가능한 공격 찾기
            const attacks = ai.battleZone.attacks;
            for (let i = 0; i < attacks.length; i++) {
                const atk = attacks[i];

                // 에너지 비용 체크
                if (window.EnergySystem.canPayCost(ai.battleZone, atk.cost)) {
                    // 공격 실행
                    const attacker = ai.battleZone;
                    const opponent = gameState.player;

                    if (DEBUG) console.log('AI: ' + attacker.name + '의 ' + atk.name + ' 사용');

                    // 공격 효과 처리
                    if (atk.effect && typeof window.Effects !== 'undefined') {
                        window.Effects.handleAttackEffect(atk.effect, attacker, opponent, gameState);
                    }

                    // 일반 피해
                    if (atk.damage > 0 && opponent.battleZone) {
                        opponent.battleZone.hp -= atk.damage;
                        if (DEBUG) console.log('피해: ' + atk.damage);

                        // 기절 확인
                        if (opponent.battleZone.hp <= 0) {
                            handlePlayerBrawlerKO(opponent);
                        }
                    }

                    // 에너지 소모
                    if (atk.energyDiscard > 0) {
                        window.EnergySystem.discardEnergy(attacker, atk.energyDiscard);
                    }

                    // 공격 사용 표시
                    attacker.canAttack = false;

                    // 승리 조건 체크
                    window.Game.checkWin();

                    break;
                }
            }

            // UI 업데이트
            if (typeof window.UI !== 'undefined') {
                window.UI.render(gameState);
            }

        } catch (error) {
            console.error('attackOpponent 오류:', error);
        }
    }

    // ===== 플레이어 브롤러 기절 처리 =====
    function handlePlayerBrawlerKO(player) {
        try {
            const brawler = player.battleZone;
            player.battleZone = null;

            if (DEBUG) console.log(brawler.name + ' 기절!');

            // AI 점수 추가
            const gameState = window.Game.getState();
            const points = getBrawlerPoints(brawler);
            gameState.ai.prizes += points;

            if (DEBUG) console.log('AI 점수 +' + points + ' (총: ' + gameState.ai.prizes + '점)');

            // 벤치에서 자동 교체
            if (player.bench.length > 0) {
                const newBattler = player.bench.shift();
                player.battleZone = newBattler;
                if (DEBUG) console.log(newBattler.name + ' 배틀존으로 이동');
            }

        } catch (error) {
            console.error('handlePlayerBrawlerKO 오류:', error);
        }
    }

    // ===== 브롤러 점수 계산 =====
    function getBrawlerPoints(brawler) {
        if (!brawler) return 0;

        try {
            if (['mythic', 'legendary', 'ultra_legendary'].includes(brawler.rarity)) {
                return 2;
            }
            if (!brawler.isBasic) {
                return 2;
            }
            return 1;
        } catch (error) {
            console.error('getBrawlerPoints 오류:', error);
            return 1;
        }
    }

    // 전역 노출
    window.AI = {
        playTurn: playTurn
    };

    if (DEBUG) {
        console.log('AI 시스템 로드 완료');
    }
})();
