# -*- coding: utf-8 -*-
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
v2_path = os.path.join(ROOT, "stats-v2.html")
stats_path = os.path.join(ROOT, "stats.html")

with open(v2_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace test nav links with standard live nav link
old_nav_block = """        <a href="stats.html" title="Открыть старую версию (для сравнения)">Игровая (старая)</a>
        <a href="stats-v2.html" class="nav-active-v2">🎮 Игровая v2</a>"""

new_nav_block = """        <a href="stats.html" class="nav-active-v2" style="color:var(--accent); text-shadow:0 0 10px var(--accent-soft); font-weight:700;">🎮 Игровая</a>"""

assert old_nav_block in content, "old_nav_block not found in stats-v2.html"
content = content.replace(old_nav_block, new_nav_block)

# Add legacy link to footer
old_footer = """            <footer class="hub-footer">
                <button type="button" class="footer-db-btn" id="btn-open-db-inspector" title="Проверить состояние локальной базы данных">
                    <span>🗄️ База данных:</span>
                    <strong id="lab-db-summary">загрузка...</strong>
                </button>
            </footer>"""

new_footer = """            <footer class="hub-footer" style="gap:12px; flex-wrap:wrap;">
                <button type="button" class="footer-db-btn" id="btn-open-db-inspector" title="Проверить состояние базы данных">
                    <span>🗄️ База данных:</span>
                    <strong id="lab-db-summary">загрузка...</strong>
                </button>
                <a href="stats-legacy.html" class="footer-db-btn" style="text-decoration:none;" title="Открыть старый дизайн игровой (архив)">⏳ Старый дизайн (архив)</a>
            </footer>"""

assert old_footer in content, "old_footer not found in stats-v2.html"
content = content.replace(old_footer, new_footer)

with open(stats_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Successfully generated {stats_path} ({len(content)} chars)")
