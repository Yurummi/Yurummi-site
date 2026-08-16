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
let completedGames = JSON.parse(localStorage.getItem('sonicProgress') || '[]');

function saveProgress() {
    localStorage.setItem('sonicProgress', JSON.stringify(completedGames));
    updateProgressCounter();
}

function updateProgressCounter() {
    const progressEl = document.getElementById('sonic-progress');
    if (progressEl) {
        progressEl.innerText = `${completedGames.length} / ${totalGames}`;
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
            const isChecked = completedGames.includes(game.id) ? 'checked' : '';
            html += `
                <div style="display: flex; align-items: center; margin-bottom: 5px; cursor: pointer;">
                    <input type="checkbox" id="${game.id}" value="${game.id}" ${isChecked} style="margin-right: 10px; cursor: pointer; accent-color: #ffd700;" onchange="toggleGame('${game.id}')">
                    <label for="${game.id}" style="cursor: pointer; color: ${isChecked ? '#888' : '#fff'}; text-decoration: ${isChecked ? 'line-through' : 'none'}; flex-grow: 1; transition: all 0.2s ease;">${game.title}</label>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
    updateProgressCounter();
}

// Global scope for onclick
window.toggleGame = function(gameId) {
    if (completedGames.includes(gameId)) {
        completedGames = completedGames.filter(id => id !== gameId);
    } else {
        completedGames.push(gameId);
    }
    saveProgress();
    renderChecklist();
};

document.addEventListener('DOMContentLoaded', () => {
    renderChecklist();
});
