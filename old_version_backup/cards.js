// Brawl Cards - Card Database
(function() {
    'use strict';

    // Phase 1: 기본 10장 카드 데이터
    const cardDatabase = {
        'shelly': {
            id: 'shelly',
            name: '쉘리',
            cost: 3,
            attack: 3,
            health: 4,
            description: '양옆 적에게 산탄 발사!',
            ability: 'battlecry_damage_adjacent',
            abilityValue: 1,
            rarity: 'common',
            image: 'images/brawlers/shelly.png'
        },
        'nita': {
            id: 'nita',
            name: '니타',
            cost: 3,
            attack: 2,
            health: 3,
            description: '브루스와 함께라면 두렵지 않아!',
            ability: 'deathrattle_summon',
            abilityValue: { attack: 2, health: 2, name: '곰' },
            rarity: 'common',
            image: 'images/brawlers/nita.png'
        },
        'colt': {
            id: 'colt',
            name: '콜트',
            cost: 3,
            attack: 4,
            health: 2,
            description: '빠른 연사로 적을 제압!',
            ability: 'charge',
            abilityValue: null,
            rarity: 'common',
            image: 'images/brawlers/colt.png'
        },
        'bull': {
            id: 'bull',
            name: '불',
            cost: 2,
            attack: 2,
            health: 3,
            description: '이리 와봐! 내가 상대해주지!',
            ability: 'taunt',
            abilityValue: null,
            rarity: 'common',
            image: 'images/brawlers/bull.png'
        },
        'el_primo': {
            id: 'el_primo',
            name: '엘 프리모',
            cost: 4,
            attack: 3,
            health: 5,
            description: '엘 프리모가 날아간다!',
            ability: 'taunt',
            abilityValue: null,
            rarity: 'common',
            image: 'images/brawlers/el_primo.png'
        },
        'poco': {
            id: 'poco',
            name: '포코',
            cost: 3,
            attack: 1,
            health: 4,
            description: '음악으로 치유하는 해골 마리아치!',
            ability: 'end_turn_heal_allies',
            abilityValue: 1,
            rarity: 'common',
            image: 'images/brawlers/poco.png'
        },
        'barley': {
            id: 'barley',
            name: '바리',
            cost: 3,
            attack: 2,
            health: 2,
            description: '로봇의 로켓 포격!',
            ability: 'attack_aoe_damage',
            abilityValue: 1,
            rarity: 'common',
            image: 'images/brawlers/barley.png'
        },
        'jessie': {
            id: 'jessie',
            name: '제시',
            cost: 2,
            attack: 3,
            health: 2,
            description: '터렛으로 정확한 사격!',
            ability: 'none',
            abilityValue: null,
            rarity: 'common',
            image: 'images/brawlers/jessie.png'
        },
        'dynamike': {
            id: 'dynamike',
            name: '다이너마이크',
            cost: 4,
            attack: 2,
            health: 3,
            description: '다이너마이트 파티!',
            ability: 'battlecry_random_damage',
            abilityValue: 2,
            rarity: 'common',
            image: 'images/brawlers/dynamike.png'
        },
        'bo': {
            id: 'bo',
            name: '보',
            cost: 2,
            attack: 1,
            health: 1,
            description: '폭발 화살로 정찰!',
            ability: 'battlecry_draw_card',
            abilityValue: 1,
            rarity: 'common',
            image: 'images/brawlers/bo.png'
        }
    };

    // 공개 API
    window.CardDB = {
        /**
         * 카드 ID로 카드 데이터를 가져옵니다 (깊은 복사)
         * @param {string} id - 카드 ID
         * @returns {object|null} 카드 객체 또는 null
         */
        get: function(id) {
            if (typeof id !== 'string') {
                console.error('CardDB.get: ID는 문자열이어야 합니다', id);
                return null;
            }

            if (!cardDatabase[id]) {
                console.error('CardDB.get: 존재하지 않는 카드', id);
                return null;
            }

            // 깊은 복사로 원본 데이터 보호
            return JSON.parse(JSON.stringify(cardDatabase[id]));
        },

        /**
         * 모든 카드 ID 배열을 반환합니다
         * @returns {array} 카드 ID 배열
         */
        getAll: function() {
            return Object.keys(cardDatabase);
        },

        /**
         * 총 카드 종류 수를 반환합니다
         * @returns {number} 카드 종류 수
         */
        getCount: function() {
            return Object.keys(cardDatabase).length;
        }
    };

    // 초기화 로그
    if (typeof console !== 'undefined') {
        console.log('CardDB 초기화 완료:', Object.keys(cardDatabase).length, '종류의 카드');
    }

})();
