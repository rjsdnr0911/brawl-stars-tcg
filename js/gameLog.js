// 브롤스타즈 TCG - 게임 로그 시스템

(function() {
    'use strict';

    const GameLog = {
        logs: [],
        MAX_LOGS: 25,

        addLog: function(message, type) {
            if (typeof message !== 'string' || message.trim() === '') return;

            const timestamp = new Date().toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            this.logs.push({
                message: message.trim(),
                type: type || 'info',
                timestamp: timestamp
            });

            if (this.logs.length > this.MAX_LOGS) {
                this.logs.shift();
            }

            this.render();
        },

        render: function() {
            const logContainer = document.getElementById('game-log-items');
            if (!logContainer) return;

            try {
                const fragment = document.createDocumentFragment();

                this.logs.forEach(log => {
                    const logEl = document.createElement('div');
                    logEl.className = `log-item log-${log.type}`;
                    logEl.innerHTML = `
                        <span class="log-time">${log.timestamp}</span>
                        <span class="log-message">${log.message}</span>
                    `;
                    fragment.appendChild(logEl);
                });

                logContainer.innerHTML = '';
                logContainer.appendChild(fragment);

                logContainer.scrollTop = logContainer.scrollHeight;
            } catch (error) {
                console.error('GameLog render error:', error);
            }
        },

        clear: function() {
            this.logs = [];
            this.render();
        }
    };

    window.GameLog = GameLog;
})();
