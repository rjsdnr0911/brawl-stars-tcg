// 브롤스타즈 TCG - 카드 데이터베이스
// Pokemon TCG Pocket 스타일

(function() {
    'use strict';

    const DEBUG = true;

    // ===== 에너지 타입 상수 =====
    const ENERGY = {
        BRAWL: 'brawl',      // 🔷 브롤 에너지
        COLORLESS: 'colorless' // ⚪ 무색
    };

    // ===== 브롤러 카드 데이터 =====
    const BRAWLER_CARDS = {
        // ===== Shelly 진화 라인 =====
        'shelly': {
            id: 'shelly',
            name: 'Shelly',
            cardType: 'brawler',
            rarity: 'common',
            isBasic: true,
            hp: 40,
            maxHp: 40,
            retreatCost: 1,
            evolvesTo: 'bandita_shelly',
            attacks: [
                {
                    name: '샷건 폭발',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 25,
                    energyDiscard: 0,
                    effect: null
                }
            ]
        },
        'bandita_shelly': {
            id: 'bandita_shelly',
            name: 'Bandita Shelly',
            cardType: 'brawler',
            rarity: 'common',
            isBasic: false,
            evolvesFrom: 'shelly',
            hp: 60,
            maxHp: 60,
            retreatCost: 1,
            attacks: [
                {
                    name: '샷건 폭발',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 40,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '운명의 샷건',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 0,
                    energyDiscard: 0,
                    effect: 'coin_flip',
                    coinFlips: 3,
                    baseDamage: 20
                }
            ]
        },

        // ===== Colt 진화 라인 =====
        'colt': {
            id: 'colt',
            name: 'Colt',
            cardType: 'brawler',
            rarity: 'common',
            isBasic: true,
            hp: 36,
            maxHp: 36,
            retreatCost: 1,
            evolvesTo: 'royal_agent_colt',
            attacks: [
                {
                    name: '연속 사격',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 20,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '운명의 사격',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 0,
                    energyDiscard: 0,
                    effect: 'coin_flip', // 동전 2번 던져서 앞면당 +15 피해
                    coinFlips: 2,
                    baseDamage: 15
                }
            ]
        },
        'royal_agent_colt': {
            id: 'royal_agent_colt',
            name: 'Royal Agent Colt',
            cardType: 'brawler',
            rarity: 'common',
            isBasic: false,
            evolvesFrom: 'colt',
            hp: 50,
            maxHp: 50,
            retreatCost: 1,
            attacks: [
                {
                    name: '연속 사격',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 30,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '관통 탄환',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 40,
                    energyDiscard: 0,
                    effect: 'bench_damage' // 상대 벤치에도 10 피해
                }
            ]
        },

        // ===== Nita (진화 없음) =====
        'nita': {
            id: 'nita',
            name: 'Nita',
            cardType: 'brawler',
            rarity: 'common',
            isBasic: true,
            hp: 50,
            maxHp: 50,
            retreatCost: 2,
            attacks: [
                {
                    name: '충격파',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 20,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '브루스 소환',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 0,
                    energyDiscard: 0,
                    effect: 'summon_bruce' // 벤치에 브루스 소환
                },
                {
                    name: '팀워크 공격',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 20,
                    energyDiscard: 0,
                    effect: 'bench_bonus_damage', // 상대 벤치 1마리당 +10 피해
                    bonusPerBench: 10
                }
            ]
        },

        // ===== Poco 진화 라인 =====
        'poco': {
            id: 'poco',
            name: 'Poco',
            cardType: 'brawler',
            rarity: 'rare',
            isBasic: true,
            hp: 50,
            maxHp: 50,
            retreatCost: 1,
            evolvesTo: 'serenade_poco',
            attacks: [
                {
                    name: '음파 공격',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 10,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '힐링 멜로디',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 0,
                    energyDiscard: 0,
                    effect: 'heal_all_10' // 모든 아군 +10 HP
                }
            ]
        },
        'serenade_poco': {
            id: 'serenade_poco',
            name: 'Serenade Poco',
            cardType: 'brawler',
            rarity: 'rare',
            isBasic: false,
            evolvesFrom: 'poco',
            hp: 70,
            maxHp: 70,
            retreatCost: 1,
            attacks: [
                {
                    name: '음파 공격',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 20,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '운명의 세레나데',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 0,
                    energyDiscard: 0,
                    effect: 'coin_flip_heal', // 동전 2번, 앞면당 아군 전체 15 힐
                    coinFlips: 2,
                    healAmount: 15
                }
            ]
        },

        // ===== Bull (진화 없음) =====
        'bull': {
            id: 'bull',
            name: 'Bull',
            cardType: 'brawler',
            rarity: 'rare',
            isBasic: true,
            hp: 70,
            maxHp: 70,
            retreatCost: 3,
            attacks: [
                {
                    name: '샷건',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 40,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '전력 돌격',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 30,
                    energyDiscard: 0,
                    effect: 'energy_count_bonus', // 부착된 에너지 1개당 +10 피해
                    bonusPerEnergy: 10
                }
            ]
        },

        // ===== 브루스 (토큰) =====
        'bruce': {
            id: 'bruce',
            name: '브루스',
            cardType: 'brawler',
            rarity: 'token',
            isBasic: true,
            hp: 30,
            maxHp: 30,
            retreatCost: 1,
            attacks: [
                {
                    name: '할퀴기',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 20,
                    energyDiscard: 0,
                    effect: null
                }
            ]
        },

        // ===== Phase 2 브롤러 =====

        // ===== Edgar (Mythic, 암살자) =====
        'edgar': {
            id: 'edgar',
            name: 'Edgar',
            cardType: 'brawler',
            rarity: 'mythic',
            isBasic: true,
            hp: 50,
            maxHp: 50,
            retreatCost: 1,
            attacks: [
                {
                    name: '연속 펀치',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 30,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '역전의 일격',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 30,
                    energyDiscard: 0,
                    effect: 'hp_threshold_bonus', // HP 50% 이하일 때 +20 피해
                    bonusIfLowHp: 20
                }
            ]
        },

        // ===== Mortis (Mythic, 암살자) =====
        'mortis': {
            id: 'mortis',
            name: 'Mortis',
            cardType: 'brawler',
            rarity: 'mythic',
            isBasic: true,
            hp: 55,
            maxHp: 55,
            retreatCost: 1,
            attacks: [
                {
                    name: '대시 공격',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 35,
                    energyDiscard: 0,
                    effect: 'lifesteal_half'
                },
                {
                    name: '영혼 수확',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 50,
                    energyDiscard: 0,
                    effect: 'lifesteal_full'
                }
            ]
        },

        // ===== Byron (Mythic, 힐러/딜러) =====
        'byron': {
            id: 'byron',
            name: 'Byron',
            cardType: 'brawler',
            rarity: 'mythic',
            isBasic: true,
            hp: 45,
            maxHp: 45,
            retreatCost: 1,
            attacks: [
                {
                    name: '힐링 샷',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 0,
                    energyDiscard: 0,
                    effect: 'heal_ally_30'
                },
                {
                    name: '독 주사',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 20,
                    energyDiscard: 0,
                    effect: 'poison_10'
                }
            ]
        },

        // ===== Bea (Epic, 저격수) =====
        'bea': {
            id: 'bea',
            name: 'Bea',
            cardType: 'brawler',
            rarity: 'epic',
            isBasic: true,
            hp: 42,
            maxHp: 42,
            retreatCost: 1,
            attacks: [
                {
                    name: '벌침',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 25,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '슈퍼 충전 샷',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 60,
                    energyDiscard: 0,
                    effect: null
                }
            ]
        },

        // ===== Bibi (Epic, 근접 전사) =====
        'bibi': {
            id: 'bibi',
            name: 'Bibi',
            cardType: 'brawler',
            rarity: 'epic',
            isBasic: true,
            hp: 60,
            maxHp: 60,
            retreatCost: 2,
            attacks: [
                {
                    name: '배트 스윙',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 35,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '홈런!',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 50,
                    energyDiscard: 0,
                    effect: 'knockback'
                }
            ]
        },

        // ===== Piper (Epic, 원거리 저격수) =====
        'piper': {
            id: 'piper',
            name: 'Piper',
            cardType: 'brawler',
            rarity: 'epic',
            isBasic: true,
            hp: 40,
            maxHp: 40,
            retreatCost: 1,
            attacks: [
                {
                    name: '저격',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 30,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '완벽한 조준',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 60,
                    energyDiscard: 0,
                    effect: 'ignore_bench'
                }
            ]
        },

        // ===== Dynamike (Super Rare, 폭발물) =====
        'dynamike': {
            id: 'dynamike',
            name: 'Dynamike',
            cardType: 'brawler',
            rarity: 'super_rare',
            isBasic: true,
            hp: 45,
            maxHp: 45,
            retreatCost: 1,
            attacks: [
                {
                    name: '다이너마이트',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 30,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '대폭발',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 40,
                    energyDiscard: 0,
                    effect: 'splash_15'
                }
            ]
        },

        // ===== Barley (Rare, 제어) =====
        'barley': {
            id: 'barley',
            name: 'Barley',
            cardType: 'brawler',
            rarity: 'rare',
            isBasic: true,
            hp: 45,
            maxHp: 45,
            retreatCost: 1,
            attacks: [
                {
                    name: '병 던지기',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 20,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '몰로토프 칵테일',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 25,
                    energyDiscard: 0,
                    effect: 'burn_10'
                }
            ]
        },

        // ===== Jessie (Super Rare, 소환사) =====
        'jessie': {
            id: 'jessie',
            name: 'Jessie',
            cardType: 'brawler',
            rarity: 'super_rare',
            isBasic: true,
            hp: 50,
            maxHp: 50,
            retreatCost: 1,
            attacks: [
                {
                    name: '전기 총',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 25,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '터렛 소환',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 0,
                    energyDiscard: 0,
                    effect: 'summon_turret'
                }
            ]
        },

        // ===== Penny (Super Rare, 소환사) =====
        'penny': {
            id: 'penny',
            name: 'Penny',
            cardType: 'brawler',
            rarity: 'super_rare',
            isBasic: true,
            hp: 50,
            maxHp: 50,
            retreatCost: 1,
            attacks: [
                {
                    name: '가방 대포',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 25,
                    energyDiscard: 0,
                    effect: null
                },
                {
                    name: '캐논 설치',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 0,
                    energyDiscard: 0,
                    effect: 'summon_cannon'
                }
            ]
        },

        // ===== Scrappy (토큰 - Jessie의 터렛) =====
        'scrappy': {
            id: 'scrappy',
            name: 'Scrappy',
            cardType: 'brawler',
            rarity: 'token',
            isBasic: true,
            hp: 40,
            maxHp: 40,
            retreatCost: 1,
            attacks: [
                {
                    name: '레이저',
                    cost: [ENERGY.BRAWL, ENERGY.COLORLESS],
                    damage: 20,
                    energyDiscard: 0,
                    effect: null
                }
            ]
        },

        // ===== Old Lobber (토큰 - Penny의 캐논) =====
        'old_lobber': {
            id: 'old_lobber',
            name: 'Old Lobber',
            cardType: 'brawler',
            rarity: 'token',
            isBasic: true,
            hp: 50,
            maxHp: 50,
            retreatCost: 2,
            attacks: [
                {
                    name: '캐논볼',
                    cost: [ENERGY.BRAWL, ENERGY.BRAWL],
                    damage: 30,
                    energyDiscard: 0,
                    effect: 'splash_10'
                }
            ]
        }
    };

    // ===== 트레이너 카드 데이터 =====
    const TRAINER_CARDS = {
        // ===== 아이템 카드 (무제한 사용) =====
        'super_potion': {
            id: 'super_potion',
            name: '슈퍼 포션',
            cardType: 'trainer',
            trainerType: 'item',
            effect: 'heal_30',
            description: '아군 브롤러 1명 HP +30 회복'
        },
        'brawl_ball': {
            id: 'brawl_ball',
            name: '브롤 볼',
            cardType: 'trainer',
            trainerType: 'item',
            effect: 'search_basic',
            description: '덱에서 기본 브롤러 1장을 손으로'
        },
        'speed_boots': {
            id: 'speed_boots',
            name: '스피드 부츠',
            cardType: 'trainer',
            trainerType: 'item',
            effect: 'reduce_retreat',
            description: '이번 턴 후퇴 비용 -1'
        },

        // ===== 서포터 카드 (턴당 1회) =====
        'gales_supply': {
            id: 'gales_supply',
            name: '게일의 보급',
            cardType: 'trainer',
            trainerType: 'supporter',
            effect: 'discard_draw_5',
            description: '손패 전부 버리고 5장 드로우'
        },
        'taras_portal': {
            id: 'taras_portal',
            name: '타라의 포탈',
            cardType: 'trainer',
            trainerType: 'supporter',
            effect: 'switch_opponent',
            description: '상대 벤치 브롤러를 강제로 배틀존으로'
        },
        'crows_poison': {
            id: 'crows_poison',
            name: '크로우의 독',
            cardType: 'trainer',
            trainerType: 'supporter',
            effect: 'boost_attack_10',
            description: '이번 턴 공격 +10 피해'
        },

        // ===== Phase 2 아이템 카드 =====
        'brawl_box': {
            id: 'brawl_box',
            name: '브롤 박스',
            cardType: 'trainer',
            trainerType: 'item',
            effect: 'draw_2',
            description: '카드 2장 드로우'
        },
        'mega_box': {
            id: 'mega_box',
            name: '메가 박스',
            cardType: 'trainer',
            trainerType: 'item',
            effect: 'draw_3_skip',
            description: '카드 3장 드로우, 다음 턴 드로우 스킵'
        },
        'power_cube': {
            id: 'power_cube',
            name: '파워 큐브',
            cardType: 'trainer',
            trainerType: 'item',
            effect: 'attach_extra_energy',
            description: '브롤러 1명에게 에너지 1개 추가 부착'
        },
        'shield_gear': {
            id: 'shield_gear',
            name: '실드 기어',
            cardType: 'trainer',
            trainerType: 'item',
            effect: 'reduce_damage_20',
            description: '이번 턴 피해 -20 감소'
        },
        'instant_switch': {
            id: 'instant_switch',
            name: '교체 스위치',
            cardType: 'trainer',
            trainerType: 'item',
            effect: 'instant_switch',
            description: '배틀존-벤치 즉시 교체'
        },

        // ===== Phase 2 서포터 카드 =====
        'stus_strategy': {
            id: 'stus_strategy',
            name: '스튜의 전략',
            cardType: 'trainer',
            trainerType: 'supporter',
            effect: 'search_trainers_2',
            description: '덱에서 트레이너 2장 서치'
        },
        'franks_defense': {
            id: 'franks_defense',
            name: '프랭크의 방어',
            cardType: 'trainer',
            trainerType: 'supporter',
            effect: 'team_buff_defense',
            description: '모든 아군 HP +10, 이번 턴 피해 -10'
        },
        'maxs_rush': {
            id: 'maxs_rush',
            name: '맥스의 돌격',
            cardType: 'trainer',
            trainerType: 'supporter',
            effect: 'power_attack_recoil',
            description: '배틀존 공격 +20, 반동 10'
        },
        'genes_recycle': {
            id: 'genes_recycle',
            name: '진의 재활용',
            cardType: 'trainer',
            trainerType: 'supporter',
            effect: 'recycle_trainers',
            description: '버린 더미에서 트레이너 2장 회수'
        },
        'spikes_regen': {
            id: 'spikes_regen',
            name: '스파이크의 재생',
            cardType: 'trainer',
            trainerType: 'supporter',
            effect: 'full_heal_remove_energy',
            description: '브롤러 1명 HP 최대 회복, 에너지 제거'
        }
    };

    // ===== 카드 데이터베이스 API =====
    const CardDB = {
        // 카드 가져오기 (Deep Copy)
        get: function(cardId) {
            if (!cardId || typeof cardId !== 'string') {
                console.error('CardDB.get: 잘못된 cardId', cardId);
                return null;
            }

            try {
                // 브롤러 카드 확인
                if (BRAWLER_CARDS[cardId]) {
                    return JSON.parse(JSON.stringify(BRAWLER_CARDS[cardId]));
                }

                // 트레이너 카드 확인
                if (TRAINER_CARDS[cardId]) {
                    return JSON.parse(JSON.stringify(TRAINER_CARDS[cardId]));
                }

                console.warn('CardDB.get: 카드 없음', cardId);
                return null;
            } catch (error) {
                console.error('CardDB.get 오류:', error);
                return null;
            }
        },

        // 모든 기본 브롤러 ID 가져오기
        getAllBasicBrawlerIds: function() {
            try {
                return Object.keys(BRAWLER_CARDS).filter(id => {
                    const card = BRAWLER_CARDS[id];
                    return card.isBasic && card.rarity !== 'token';
                });
            } catch (error) {
                console.error('CardDB.getAllBasicBrawlerIds 오류:', error);
                return [];
            }
        },

        // 모든 트레이너 카드 ID 가져오기
        getAllTrainerIds: function() {
            try {
                return Object.keys(TRAINER_CARDS);
            } catch (error) {
                console.error('CardDB.getAllTrainerIds 오류:', error);
                return [];
            }
        },

        // 카드가 기본 브롤러인지 확인
        isBasicBrawler: function(cardId) {
            if (!cardId) return false;
            const card = BRAWLER_CARDS[cardId];
            return card && card.isBasic;
        },

        // 카드가 진화 카드인지 확인
        isEvolution: function(cardId) {
            if (!cardId) return false;
            const card = BRAWLER_CARDS[cardId];
            return card && !card.isBasic && card.evolvesFrom;
        },

        // 진화 전 브롤러 ID 가져오기
        getEvolvesFrom: function(cardId) {
            if (!cardId) return null;
            const card = BRAWLER_CARDS[cardId];
            return card && card.evolvesFrom ? card.evolvesFrom : null;
        }
    };

    // 전역 노출
    window.CardDB = CardDB;
    window.ENERGY = ENERGY;

    if (DEBUG) {
        console.log('카드 데이터베이스 로드 완료');
        console.log('기본 브롤러:', CardDB.getAllBasicBrawlerIds());
        console.log('트레이너 카드:', CardDB.getAllTrainerIds());
    }
})();
