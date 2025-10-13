// 브롤스타즈 TCG - 트레이너 카드 및 공격 효과

(function() {
    'use strict';

    const DEBUG = true;

    // ===== 공격 효과 처리 =====
    const AttackEffects = {
        // 벤치 피해 (Royal Agent Colt)
        bench_damage: function(attacker, opponent, gameState) {
            try {
                if (opponent.bench.length > 0) {
                    // 랜덤 벤치 브롤러에게 10 피해
                    const target = opponent.bench[Math.floor(Math.random() * opponent.bench.length)];
                    target.hp -= 10;

                    if (DEBUG) console.log(target.name + '에게 벤치 피해 10');

                    // 기절 확인
                    if (target.hp <= 0) {
                        const index = opponent.bench.indexOf(target);
                        if (index !== -1) {
                            opponent.bench.splice(index, 1);
                            if (DEBUG) console.log(target.name + ' 벤치에서 기절');
                        }
                    }
                }
            } catch (error) {
                console.error('bench_damage 효과 오류:', error);
            }
        },

        // 브루스 소환 (Nita)
        summon_bruce: function(attacker, opponent, gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                // 벤치가 가득 찼는지 확인
                if (player.bench.length >= 3) {
                    console.log('벤치가 가득 찼습니다');
                    return;
                }

                // 브루스 생성
                const bruce = window.CardDB.get('bruce');
                if (bruce) {
                    bruce.energy = [];
                    bruce.canAttack = false;
                    player.bench.push(bruce);
                    if (DEBUG) console.log('브루스 소환!');
                }
            } catch (error) {
                console.error('summon_bruce 효과 오류:', error);
            }
        },

        // 전체 힐 +10 (Poco)
        heal_all_10: function(attacker, opponent, gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                // 배틀존 힐
                if (player.battleZone) {
                    player.battleZone.hp = Math.min(
                        player.battleZone.hp + 10,
                        player.battleZone.maxHp
                    );
                }

                // 벤치 힐
                player.bench.forEach(b => {
                    if (b) {
                        b.hp = Math.min(b.hp + 10, b.maxHp);
                    }
                });

                if (DEBUG) console.log('모든 아군 브롤러 HP +10');
            } catch (error) {
                console.error('heal_all_10 효과 오류:', error);
            }
        },

        // 전체 힐 +20 (Serenade Poco)
        heal_all_20: function(attacker, opponent, gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                // 배틀존 힐
                if (player.battleZone) {
                    player.battleZone.hp = Math.min(
                        player.battleZone.hp + 20,
                        player.battleZone.maxHp
                    );
                }

                // 벤치 힐
                player.bench.forEach(b => {
                    if (b) {
                        b.hp = Math.min(b.hp + 20, b.maxHp);
                    }
                });

                if (DEBUG) console.log('모든 아군 브롤러 HP +20');
            } catch (error) {
                console.error('heal_all_20 효과 오류:', error);
            }
        }
    };

    // ===== 트레이너 카드 효과 처리 =====
    const TrainerEffects = {
        // 슈퍼 포션 - HP +30 회복
        heal_30: function(gameState, targetLocation, targetIndex) {
            try {
                const player = gameState[gameState.currentPlayer];
                let target = null;

                if (targetLocation === 'battle') {
                    target = player.battleZone;
                } else if (targetLocation === 'bench' && targetIndex >= 0) {
                    target = player.bench[targetIndex];
                }

                if (!target) {
                    console.log('대상을 선택해주세요');
                    return false;
                }

                target.hp = Math.min(target.hp + 30, target.maxHp);
                if (DEBUG) console.log(target.name + ' HP +30 회복');

                return true;
            } catch (error) {
                console.error('heal_30 효과 오류:', error);
                return false;
            }
        },

        // 브롤 볼 - 덱에서 기본 브롤러 1장 손으로
        search_basic: function(gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                // 덱에서 기본 브롤러 찾기
                const basicIndex = player.deck.findIndex(card =>
                    card.cardType === 'brawler' && card.isBasic
                );

                if (basicIndex === -1) {
                    console.log('덱에 기본 브롤러가 없습니다');
                    return false;
                }

                const card = player.deck.splice(basicIndex, 1)[0];
                player.hand.push(card);

                if (DEBUG) console.log('덱에서 ' + card.name + ' 손으로');

                // 덱 셔플
                player.deck = shuffleArray(player.deck);

                return true;
            } catch (error) {
                console.error('search_basic 효과 오류:', error);
                return false;
            }
        },

        // 스피드 부츠 - 후퇴 비용 -1 (이번 턴)
        reduce_retreat: function(gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                if (!player.battleZone) {
                    console.log('배틀존에 브롤러가 없습니다');
                    return false;
                }

                player.battleZone.retreatCostReduction = 1;
                if (DEBUG) console.log('이번 턴 후퇴 비용 -1');

                return true;
            } catch (error) {
                console.error('reduce_retreat 효과 오류:', error);
                return false;
            }
        },

        // 박사의 연구 - 손패 전부 버리고 5장 드로우
        discard_draw_5: function(gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                // 손패 전부 버리기
                player.hand = [];

                // 5장 드로우
                for (let i = 0; i < 5; i++) {
                    if (player.deck.length > 0) {
                        const card = player.deck.shift();
                        player.hand.push(card);
                    }
                }

                if (DEBUG) console.log('손패 버리고 5장 드로우');

                return true;
            } catch (error) {
                console.error('discard_draw_5 효과 오류:', error);
                return false;
            }
        },

        // 사브리나 - 상대 벤치 브롤러 강제 배틀존 이동
        switch_opponent: function(gameState, targetIndex) {
            try {
                const opponent = gameState[gameState.currentPlayer === 'player' ? 'ai' : 'player'];

                if (opponent.bench.length === 0) {
                    console.log('상대 벤치가 비어있습니다');
                    return false;
                }

                if (targetIndex < 0 || targetIndex >= opponent.bench.length) {
                    console.log('잘못된 대상입니다');
                    return false;
                }

                // 현재 배틀존 브롤러를 벤치로
                if (opponent.battleZone) {
                    opponent.bench.push(opponent.battleZone);
                }

                // 선택한 벤치 브롤러를 배틀존으로
                opponent.battleZone = opponent.bench.splice(targetIndex, 1)[0];

                if (DEBUG) console.log('상대 브롤러 강제 교체!');

                return true;
            } catch (error) {
                console.error('switch_opponent 효과 오류:', error);
                return false;
            }
        },

        // 지오바니 - 이번 턴 공격 +10
        boost_attack_10: function(gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                if (!player.battleZone) {
                    console.log('배틀존에 브롤러가 없습니다');
                    return false;
                }

                player.battleZone.attackBoost = 10;
                if (DEBUG) console.log('이번 턴 공격 +10');

                return true;
            } catch (error) {
                console.error('boost_attack_10 효과 오류:', error);
                return false;
            }
        },

        // ===== Phase 2 트레이너 효과 =====

        // 브롤 박스 - 카드 2장 드로우
        draw_2: function(gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                for (let i = 0; i < 2; i++) {
                    if (player.deck.length > 0) {
                        const card = player.deck.shift();
                        player.hand.push(card);
                    }
                }

                if (DEBUG) console.log('카드 2장 드로우');
                return true;
            } catch (error) {
                console.error('draw_2 효과 오류:', error);
                return false;
            }
        },

        // 메가 박스 - 카드 3장 드로우, 다음 턴 드로우 스킵
        draw_3_skip: function(gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                for (let i = 0; i < 3; i++) {
                    if (player.deck.length > 0) {
                        const card = player.deck.shift();
                        player.hand.push(card);
                    }
                }

                player.skipNextDraw = true;
                if (DEBUG) console.log('카드 3장 드로우, 다음 턴 드로우 스킵');

                return true;
            } catch (error) {
                console.error('draw_3_skip 효과 오류:', error);
                return false;
            }
        },

        // 파워 큐브 - 에너지 추가 부착
        attach_extra_energy: function(gameState, brawlerLocation, brawlerIndex) {
            try {
                const player = gameState[gameState.currentPlayer];
                let brawler = null;

                if (brawlerLocation === 'battle') {
                    brawler = player.battleZone;
                } else if (brawlerLocation === 'bench' && brawlerIndex >= 0) {
                    brawler = player.bench[brawlerIndex];
                }

                if (!brawler) {
                    console.log('대상을 선택해주세요');
                    return false;
                }

                if (player.energyZone.length === 0) {
                    console.log('에너지존에 에너지가 없습니다');
                    return false;
                }

                const energy = player.energyZone.shift();
                window.EnergySystem.attachEnergy(brawler, energy);

                if (DEBUG) console.log('에너지 추가 부착');
                return true;
            } catch (error) {
                console.error('attach_extra_energy 효과 오류:', error);
                return false;
            }
        },

        // 실드 기어 - 이번 턴 피해 -20 감소
        reduce_damage_20: function(gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                if (!player.battleZone) {
                    console.log('배틀존에 브롤러가 없습니다');
                    return false;
                }

                player.battleZone.damageReduction = 20;
                if (DEBUG) console.log('이번 턴 피해 -20 감소');

                return true;
            } catch (error) {
                console.error('reduce_damage_20 효과 오류:', error);
                return false;
            }
        },

        // 교체 스위치 - 배틀존-벤치 즉시 교체
        instant_switch: function(gameState, benchIndex) {
            try {
                const player = gameState[gameState.currentPlayer];

                if (!player.battleZone) {
                    console.log('배틀존에 브롤러가 없습니다');
                    return false;
                }

                if (player.bench.length === 0) {
                    console.log('벤치가 비어있습니다');
                    return false;
                }

                if (benchIndex < 0 || benchIndex >= player.bench.length) {
                    console.log('잘못된 벤치 인덱스입니다');
                    return false;
                }

                // 배틀존과 벤치 브롤러 교체
                const temp = player.battleZone;
                player.battleZone = player.bench[benchIndex];
                player.bench[benchIndex] = temp;

                if (DEBUG) console.log('배틀존-벤치 즉시 교체');
                return true;
            } catch (error) {
                console.error('instant_switch 효과 오류:', error);
                return false;
            }
        },

        // 스튜의 전략 - 덱에서 트레이너 2장 서치
        search_trainers_2: function(gameState) {
            try {
                const player = gameState[gameState.currentPlayer];
                let count = 0;

                // 덱 뒤에서부터 트레이너 카드 찾기
                for (let i = player.deck.length - 1; i >= 0 && count < 2; i--) {
                    if (player.deck[i].cardType === 'trainer') {
                        const card = player.deck.splice(i, 1)[0];
                        player.hand.push(card);
                        count++;
                    }
                }

                if (DEBUG) console.log('트레이너 ' + count + '장 서치');

                // 덱 셔플
                player.deck = shuffleArray(player.deck);

                return true;
            } catch (error) {
                console.error('search_trainers_2 효과 오류:', error);
                return false;
            }
        },

        // 프랭크의 방어 - 팀 버프 (힐 +10, 피해 -10)
        team_buff_defense: function(gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                // 배틀존 버프
                if (player.battleZone) {
                    player.battleZone.hp = Math.min(
                        player.battleZone.hp + 10,
                        player.battleZone.maxHp
                    );
                    player.battleZone.damageReduction = 10;
                }

                // 벤치 힐
                player.bench.forEach(b => {
                    if (b) {
                        b.hp = Math.min(b.hp + 10, b.maxHp);
                    }
                });

                if (DEBUG) console.log('팀 버프: 모든 아군 HP +10, 배틀존 피해 -10');
                return true;
            } catch (error) {
                console.error('team_buff_defense 효과 오류:', error);
                return false;
            }
        },

        // 맥스의 돌격 - 공격 +20, 반동 10
        power_attack_recoil: function(gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                if (!player.battleZone) {
                    console.log('배틀존에 브롤러가 없습니다');
                    return false;
                }

                player.battleZone.attackBoost = 20;
                player.battleZone.recoilDamage = 10;

                if (DEBUG) console.log('공격 +20, 반동 10');
                return true;
            } catch (error) {
                console.error('power_attack_recoil 효과 오류:', error);
                return false;
            }
        },

        // 진의 재활용 - 버린 더미에서 트레이너 2장 회수
        recycle_trainers: function(gameState) {
            try {
                const player = gameState[gameState.currentPlayer];

                if (!player.discardPile || player.discardPile.length === 0) {
                    console.log('버린 카드 더미가 비어있습니다');
                    return false;
                }

                let count = 0;
                // 버린 더미 뒤에서부터 트레이너 카드 찾기
                for (let i = player.discardPile.length - 1; i >= 0 && count < 2; i--) {
                    if (player.discardPile[i].cardType === 'trainer') {
                        const card = player.discardPile.splice(i, 1)[0];
                        player.hand.push(card);
                        count++;
                    }
                }

                if (DEBUG) console.log('트레이너 ' + count + '장 회수');
                return true;
            } catch (error) {
                console.error('recycle_trainers 효과 오류:', error);
                return false;
            }
        },

        // 스파이크의 재생 - HP 최대 회복, 에너지 제거
        full_heal_remove_energy: function(gameState, brawlerLocation, brawlerIndex) {
            try {
                const player = gameState[gameState.currentPlayer];
                let brawler = null;

                if (brawlerLocation === 'battle') {
                    brawler = player.battleZone;
                } else if (brawlerLocation === 'bench' && brawlerIndex >= 0) {
                    brawler = player.bench[brawlerIndex];
                }

                if (!brawler) {
                    console.log('대상을 선택해주세요');
                    return false;
                }

                // HP 최대 회복
                brawler.hp = brawler.maxHp;

                // 에너지 전부 제거
                brawler.energy = [];

                if (DEBUG) console.log(brawler.name + ' HP 최대 회복, 에너지 제거');
                return true;
            } catch (error) {
                console.error('full_heal_remove_energy 효과 오류:', error);
                return false;
            }
        }
    };

    // ===== 셔플 함수 =====
    function shuffleArray(arr) {
        if (!Array.isArray(arr)) return arr;
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ===== 효과 API =====
    const Effects = {
        handleAttackEffect: function(effectName, attacker, opponent, gameState) {
            if (AttackEffects[effectName]) {
                AttackEffects[effectName](attacker, opponent, gameState);
            } else {
                console.warn('알 수 없는 공격 효과:', effectName);
            }
        },

        handleTrainerEffect: function(effectName, gameState, ...args) {
            if (TrainerEffects[effectName]) {
                return TrainerEffects[effectName](gameState, ...args);
            } else {
                console.warn('알 수 없는 트레이너 효과:', effectName);
                return false;
            }
        }
    };

    // 전역 노출
    window.Effects = Effects;

    if (DEBUG) {
        console.log('효과 시스템 로드 완료');
    }
})();
