const SONIC_GAMES = [
    { title: "Эра классики", isCategory: true },
    { id: "sonic-1991", title: "Sonic the Hedgehog (1991)" },
    { id: "sonic-2-1992", title: "Sonic the Hedgehog 2 (1992)" },
    { id: "sonic-cd-1993", title: "Sonic CD (1993)" },
    { id: "sonic-3-knuckles", title: "Sonic 3 & Knuckles (1994)" },
    { id: "sonic-4", title: "Sonic 4: Episode I + II" },
    
    { title: "Dreamcast", isCategory: true },
    { id: "sonic-adv-1", title: "Sonic Advance 1" },
    { id: "sonic-adv-2", title: "Sonic Advance 2" },
    { id: "sonic-adv-3", title: "Sonic Advance 3" },
    { id: "sonic-adv-dx", title: "Sonic Adventure DX" },
    { id: "sonic-adv-2-battle", title: "Sonic Adventure 2 + Battle" },
    { id: "sonic-heroes", title: "Sonic Heroes" },
    { id: "shadow-hedgehog", title: "Shadow the Hedgehog" },
    
    { title: "Dark Age", isCategory: true },
    { id: "sonic-rush", title: "Sonic Rush" },
    { id: "sonic-06", title: "Sonic '06" },
    { id: "sonic-rush-adv", title: "Sonic Rush Adventure" },
    { id: "sonic-unleashed", title: "Sonic Unleashed" },
    
    { title: "Современность", isCategory: true },
    { id: "sonic-colors", title: "Sonic Colors" },
    { id: "sonic-x-shadow", title: "Sonic x Shadow Generations" },
    { id: "sonic-lost-world", title: "Sonic Lost World" },
    { id: "sonic-mania", title: "Sonic Mania" },
    { id: "sonic-forces", title: "Sonic Forces" },
    { id: "sonic-frontiers", title: "Sonic Frontiers" },
    { id: "sonic-superstars", title: "Sonic Superstars" }
];

const totalGames = SONIC_GAMES.filter(g => !g.isCategory).length;
// gameStates: { [id]: 'completed' | 'playing' | 'abandoned' }
let gameStates = JSON.parse(localStorage.getItem('sonicProgressStates') || '{}');

// Migrate old data if present
const oldProgress = JSON.parse(localStorage.getItem('sonicProgress') || '[]');
if (oldProgress.length > 0 && Object.keys(gameStates).length === 0) {
    oldProgress.forEach(id => { gameStates[id] = 'completed'; });
    localStorage.setItem('sonicProgressStates', JSON.stringify(gameStates));
}

function saveProgress() {
    localStorage.setItem('sonicProgressStates', JSON.stringify(gameStates));
    updateProgressCounter();
}

function updateProgressCounter() {
    const progressEl = document.getElementById('sonic-progress');
    if (progressEl) {
        const completedCount = Object.values(gameStates).filter(s => s === 'completed').length;
        progressEl.innerText = `${completedCount} / ${totalGames}`;
    }
}

function renderChecklist() {
    const container = document.getElementById('sonic-checklist-content');
    if (!container) return;
    
    let html = '';
    
    SONIC_GAMES.forEach(game => {
        if (game.isCategory) {
            html += `<h4 style="color: #ff3385; margin: 15px 0 5px; border-bottom: 1px solid #444; padding-bottom: 3px;">${game.title}</h4>`;
        } else {
            const state = gameStates[game.id] || 'empty';
            let color = '#fff';
            let circleColor = 'transparent';
            let circleBorder = '#fff';
            let textDecor = 'none';

            if (state === 'completed') {
                color = '#888';
                circleColor = '#4ade80'; // green
                circleBorder = '#4ade80';
                textDecor = 'line-through';
            } else if (state === 'playing') {
                color = '#fbbf24'; // yellow
                circleColor = '#fbbf24';
                circleBorder = '#fbbf24';
            } else if (state === 'abandoned') {
                color = '#f87171'; // red
                circleColor = '#f87171';
                circleBorder = '#f87171';
                textDecor = 'line-through';
            }

            html += `
                <div style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer; user-select: none;" onclick="cycleGameState('${game.id}')">
                    <div style="width: 16px; height: 16px; border-radius: 50%; border: 2px solid ${circleBorder}; background-color: ${circleColor}; margin-right: 12px; flex-shrink: 0; transition: all 0.2s;"></div>
                    <span style="color: ${color}; text-decoration: ${textDecor}; flex-grow: 1; transition: all 0.2s ease;">${game.title}</span>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
    updateProgressCounter();
}

// Global scope for onclick
window.cycleGameState = function(gameId) {
    const currentState = gameStates[gameId] || 'empty';
    // Cycle: empty -> playing -> completed -> abandoned -> empty
    if (currentState === 'empty') {
        gameStates[gameId] = 'playing';
    } else if (currentState === 'playing') {
        gameStates[gameId] = 'completed';
    } else if (currentState === 'completed') {
        gameStates[gameId] = 'abandoned';
    } else {
        delete gameStates[gameId];
    }
    
    saveProgress();
    renderChecklist();
};

document.addEventListener('DOMContentLoaded', () => {
    renderChecklist();
});
