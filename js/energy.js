// 브롤스타즈 TCG - 에너지 시스템
// Pokemon TCG Pocket 스타일: 자동 생성, 수동 부착

(function() {
    'use strict';

    const DEBUG = true;

    // ===== 에너지 시스템 API =====
    const EnergySystem = {
        // 에너지 1개 생성 (랜덤은 아니지만, 모두 동일 타입이므로 단순 생성)
        generate: function() {
            try {
                return {
                    type: window.ENERGY.BRAWL,
                    id: 'energy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
                };
            } catch (error) {
                console.error('EnergySystem.generate 오류:', error);
                return null;
            }
        },

        // 브롤러에 에너지 부착
        attachEnergy: function(brawler, energy) {
            // 입력값 검증
            if (!brawler || typeof brawler !== 'object') {
                console.error('EnergySystem.attachEnergy: 잘못된 brawler');
                return false;
            }

            if (!energy || typeof energy !== 'object') {
                console.error('EnergySystem.attachEnergy: 잘못된 energy');
                return false;
            }

            try {
                // 브롤러에 energy 배열이 없으면 생성
                if (!Array.isArray(brawler.energy)) {
                    brawler.energy = [];
                }

                // 에너지 부착
                brawler.energy.push(energy);

                if (DEBUG) {
                    console.log(brawler.name + '에 에너지 부착 (총: ' + brawler.energy.length + '개)');
                }

                return true;
            } catch (error) {
                console.error('EnergySystem.attachEnergy 오류:', error);
                return false;
            }
        },

        // 브롤러의 에너지 개수 가져오기
        getEnergyCount: function(brawler) {
            if (!brawler || typeof brawler !== 'object') {
                return 0;
            }

            try {
                return Array.isArray(brawler.energy) ? brawler.energy.length : 0;
            } catch (error) {
                console.error('EnergySystem.getEnergyCount 오류:', error);
                return 0;
            }
        },

        // 에너지 비용 체크 (공격 가능한지 확인)
        canPayCost: function(brawler, cost) {
            // 입력값 검증
            if (!brawler || !Array.isArray(cost)) {
                console.error('EnergySystem.canPayCost: 잘못된 입력값');
                return false;
            }

            try {
                const energyCount = this.getEnergyCount(brawler);

                // 브롤 에너지 필요 개수 계산
                const brawlRequired = cost.filter(e => e === window.ENERGY.BRAWL).length;

                // 총 필요 에너지 개수
                const totalRequired = cost.length;

                // 무색은 어떤 에너지로도 지불 가능하므로
                // 현재 에너지가 총 필요 개수보다 많고,
                // 브롤 에너지 필요 개수 이상이면 OK
                return energyCount >= totalRequired && energyCount >= brawlRequired;
            } catch (error) {
                console.error('EnergySystem.canPayCost 오류:', error);
                return false;
            }
        },

        // 에너지 소모 (공격 후)
        discardEnergy: function(brawler, count) {
            // 입력값 검증
            if (!brawler || typeof count !== 'number' || count < 0) {
                console.error('EnergySystem.discardEnergy: 잘못된 입력값');
                return false;
            }

            try {
                if (!Array.isArray(brawler.energy)) {
                    brawler.energy = [];
                    return true; // 버릴 에너지가 없어도 성공
                }

                // count개만큼 에너지 제거
                const actualCount = Math.min(count, brawler.energy.length);
                brawler.energy.splice(0, actualCount);

                if (DEBUG && actualCount > 0) {
                    console.log(brawler.name + '의 에너지 ' + actualCount + '개 소모 (남은: ' + brawler.energy.length + '개)');
                }

                return true;
            } catch (error) {
                console.error('EnergySystem.discardEnergy 오류:', error);
                return false;
            }
        },

        // 모든 에너지 제거 (브롤러 기절 시 등)
        removeAllEnergy: function(brawler) {
            if (!brawler || typeof brawler !== 'object') {
                return false;
            }

            try {
                brawler.energy = [];
                return true;
            } catch (error) {
                console.error('EnergySystem.removeAllEnergy 오류:', error);
                return false;
            }
        },

        // 에너지 시각화 문자열 (UI용)
        getEnergyDisplay: function(cost) {
            if (!Array.isArray(cost)) {
                return '';
            }

            try {
                return cost.map(e => {
                    if (e === window.ENERGY.BRAWL) return '🔷';
                    if (e === window.ENERGY.COLORLESS) return '⚪';
                    return '?';
                }).join('');
            } catch (error) {
                console.error('EnergySystem.getEnergyDisplay 오류:', error);
                return '';
            }
        }
    };

    // 전역 노출
    window.EnergySystem = EnergySystem;

    if (DEBUG) {
        console.log('에너지 시스템 로드 완료');
    }
})();
