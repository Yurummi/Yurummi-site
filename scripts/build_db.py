#!/usr/bin/env python3
"""
Yurummi Static Database Compiler (scripts/build_db.py)
------------------------------------------------------
Reads human-readable JSON tables in db/tables/*.json, validates data,
computes exact statistics into db/tables/manifest.json, and compiles
compact zero-CORS JS chunks into db/chunks/*.js for offline file:// loading
alongside pure JSON fetch() on http(s)://.
"""

import json
import os
import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABLES_DIR = os.path.join(ROOT, "db", "tables")
CHUNKS_DIR = os.path.join(ROOT, "db", "chunks")

MEDIA_TABLES = [
    "media_anime",
    "media_films",
    "media_shelf",
    "media_marvel",
    "media_dc",
    "media_series",
    "media_cartoons",
    "media_manga",
]

GAME_TABLES = [
    "games_steam",
    "games_custom",
    "games_hltb",
]

TOOL_IDS = {1325860, 280680, 431960, 365670, 2942, 1905180, 2135, 629520, 1814730, 1949770, 2784840, 343510, 882000, 1677740}
TOOL_TITLE_KEYWORDS = [
    "vtube studio", "krita", "wallpaper engine", "blender", "soundpad",
    "obs studio", "rock simulator", "egg", "aseprite", "fps monitor",
    "sharex", "voicemeeter"
]
TOOL_GENRE_KW = [
    "софт", "инструменты", "утилиты", "дизайн", "иллюстрация", "анимация",
    "vtuber", "utilities", "software", "design & illustration",
    "animation & modeling", "audio production", "web publishing"
]
GAME_GENRE_KW = [
    "экшен", "приключения", "ролевая", "rpg", "хоррор", "платформер",
    "головоломка", "шутер", "стратегия", "гонки", "выживание"
]


def is_tool(game: dict) -> bool:
    aid = int(game.get("id", 0) or 0)
    if aid in TOOL_IDS:
        return True
    title = (game.get("title") or "").lower()
    if any(k in title for k in TOOL_TITLE_KEYWORDS):
        return True
    genres = [str(g).lower() for g in (game.get("genres") or [])]
    has_tool = any(any(tk in g for tk in TOOL_GENRE_KW) for g in genres)
    has_game = any(any(gk in g for gk in GAME_GENRE_KW) for g in genres)
    return has_tool and not has_game


def read_json(name: str):
    path = os.path.join(TABLES_DIR, f"{name}.json")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def write_chunk(name: str, payload) -> int:
    os.makedirs(CHUNKS_DIR, exist_ok=True)
    compact = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    js_content = f"window.__YURUMMI_DB_INGEST__&&window.__YURUMMI_DB_INGEST__({json.dumps(name)},{compact});\n"
    out_path = os.path.join(CHUNKS_DIR, f"{name}.js")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    return os.path.getsize(out_path)


def build():
    all_media = []
    loaded_media = {}
    for t in MEDIA_TABLES:
        rows = read_json(t)
        loaded_media[t] = rows
        all_media.extend(rows)

    steam_data = read_json("games_steam")
    custom_data = read_json("games_custom")
    hltb_data = read_json("games_hltb")

    # Compute exact media stats
    watched = sum(1 for i in all_media if i.get("status") == "watched")
    watching = sum(1 for i in all_media if i.get("status") == "watching")
    planned = sum(1 for i in all_media if i.get("status") == "planned")
    dropped = sum(1 for i in all_media if i.get("status") == "dropped")
    masterpiece = sum(1 for i in all_media if i.get("tier") == "masterpiece" or (isinstance(i.get("rating"), (int, float)) and i["rating"] >= 100))
    with_review = sum(1 for i in all_media if (i.get("review") or "").strip())

    # Compute merged games stats cleanly (including overrides)
    steam_games = steam_data.get("games", [])
    custom_games = custom_data.get("games", [])
    override_map = {int(ov["id"]): ov for ov in custom_data.get("overrides", []) if "id" in ov}
    normalized_steam = []
    existing_ids = set()
    for g in steam_games:
        gid = int(g.get("id", 0))
        existing_ids.add(gid)
        ov = override_map.get(gid)
        normalized_steam.append({**g, **ov} if ov else g)

    extra_custom = [g for g in custom_games if int(g.get("id", 0)) not in existing_ids]
    merged_games = extra_custom + normalized_steam

    non_steam = sum(1 for g in merged_games if g.get("platform") and g.get("platform") != "Steam")
    perfect = sum(1 for g in merged_games if g.get("perfect") is True)
    reviewed_games = sum(1 for g in merged_games if g.get("reviewed") is True or (g.get("reviewText") or "").strip())
    software_cnt = sum(1 for g in merged_games if is_tool(g))
    hours_100 = sum(1 for g in merged_games if (g.get("hours") or 0) >= 100 and not is_tool(g))
    hours_10 = sum(1 for g in merged_games if (g.get("hours") or 0) >= 10 and not is_tool(g))

    # Preserve editable weeklyHighlight & scaleLegend if manifest already exists
    manifest_path = os.path.join(TABLES_DIR, "manifest.json")
    existing_manifest = {}
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, encoding="utf-8") as f:
                existing_manifest = json.load(f)
        except Exception:
            existing_manifest = {}

    weekly_highlight = existing_manifest.get("weeklyHighlight") or {
        "titleMatch": "Топ Ган: Мэверик",
        "badge": "Рекомендация недели",
        "quote": "Круто отснят и ваще эмоции круто передал. На одном дыхании смотрелся."
    }

    scale_legend = existing_manifest.get("scaleLegend") or [
        {"tier": "masterpiece", "icon": "👑", "range": "100+", "label": "Шедевр", "desc": "Превзошло всё! Личный топ"},
        {"tier": "exceeded",    "icon": "🚀", "range": "20–90", "label": "Выше ожиданий", "desc": "Эмоции сильно выше планки"},
        {"tier": "solid",       "icon": "⭐", "range": "10", "label": "База / Ок", "desc": "Выдало ровно то, что нужно"},
        {"tier": "good",        "icon": "👍", "range": "8–9.5", "label": "Хорошо", "desc": "Приятно провести время"},
        {"tier": "mediocre",    "icon": "😐", "range": "5–7", "label": "Проходняк", "desc": "На один раз / так себе"},
    ]

    table_registry = {}
    for t in MEDIA_TABLES:
        rows = loaded_media[t]
        chunk_bytes = write_chunk(t, rows)
        json_bytes = os.path.getsize(os.path.join(TABLES_DIR, f"{t}.json"))
        table_registry[t] = {
            "zone": "media",
            "count": len(rows),
            "json": f"db/tables/{t}.json",
            "chunk": f"db/chunks/{t}.js",
            "jsonBytes": json_bytes,
            "chunkBytes": chunk_bytes,
        }

    for t, data_obj, cnt in [
        ("games_steam", steam_data, len(steam_games)),
        ("games_custom", custom_data, len(custom_games)),
        ("games_hltb", hltb_data, len(hltb_data)),
    ]:
        chunk_bytes = write_chunk(t, data_obj)
        json_bytes = os.path.getsize(os.path.join(TABLES_DIR, f"{t}.json"))
        table_registry[t] = {
            "zone": "games",
            "count": cnt,
            "json": f"db/tables/{t}.json",
            "chunk": f"db/chunks/{t}.js",
            "jsonBytes": json_bytes,
            "chunkBytes": chunk_bytes,
        }

    manifest = {
        "schemaVersion": "2.0",
        "generatedAt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "stats": {
            "media": {
                "total": len(all_media),
                "activeTotal": len(all_media) - len(loaded_media["media_shelf"]),
                "watched": watched,
                "watching": watching,
                "planned": planned,
                "dropped": dropped,
                "masterpiece": masterpiece,
                "withReview": with_review,
                "anime": len(loaded_media["media_anime"]),
                "films": len(loaded_media["media_films"]),
                "shelf": len(loaded_media["media_shelf"]),
                "marvel": len(loaded_media["media_marvel"]),
                "dc": len(loaded_media["media_dc"]),
                "series": len(loaded_media["media_series"]),
                "cartoons": len(loaded_media["media_cartoons"]),
                "manga": len(loaded_media["media_manga"]),
            },
            "games": {
                "total": len(merged_games),
                "steam": len(steam_games),
                "custom": len(extra_custom),
                "nonSteam": non_steam,
                "perfect": perfect,
                "reviewed": reviewed_games,
                "software": software_cnt,
                "over100h": hours_100,
                "hours10": hours_10,
            }
        },
        "weeklyHighlight": weekly_highlight,
        "scaleLegend": scale_legend,
        "tables": table_registry,
    }

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    write_chunk("manifest", manifest)

    # Sync backwards-compatible monolithic js/media-data.js
    media_data_obj = {
        "stats": {
            "total": len(all_media),
            "watched": watched,
            "watching": watching,
            "planned": planned,
            "dropped": dropped,
            "masterpiece": masterpiece,
            "anime": len(loaded_media["media_anime"]),
            "films": len(loaded_media["media_films"]),
            "marvel": len(loaded_media["media_marvel"]),
            "dc": len(loaded_media["media_dc"]),
            "series": len(loaded_media["media_series"]),
            "cartoons": len(loaded_media["media_cartoons"]),
            "manga": len(loaded_media["media_manga"]),
            "games": 0,
        },
        "items": all_media,
    }
    with open(os.path.join(ROOT, "js", "media-data.js"), "w", encoding="utf-8") as f:
        f.write("window.MEDIA_DATA = " + json.dumps(media_data_obj, ensure_ascii=False, indent=2) + ";\n")

    print(f"DB build complete! Media: {manifest['stats']['media']['total']} (active {manifest['stats']['media']['activeTotal']} + shelf {manifest['stats']['media']['shelf']}), Games: {manifest['stats']['games']['total']}")
    print("Compiled chunks in db/chunks/ and tables in db/tables/manifest.json")
    print("Synchronized js/media-data.js")


if __name__ == "__main__":
    build()
