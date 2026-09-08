#!/usr/bin/env python3
# ============================================
# HOW TO ADD NEW TIKTOK VIDEOS (no Kiro needed)
#
# 1. Paste new TikTok URLs into NEW_URLS below
# 2. Open Terminal, cd to this folder, run:
#       python3 fetch-tiktok-titles.py
# 3. It fetches titles, prepends new entries to
#    VIDEO_DB.tiktok in videos.js automatically
# 4. Open GitHub Desktop → commit → push
# ============================================

import urllib.request, json, time, re, sys, os

# ── PASTE NEW URLS HERE ──────────────────────
NEW_URLS = [
    # "https://www.tiktok.com/@thegerchverse/video/XXXXXXXXXXXXXXX",
]
# ─────────────────────────────────────────────

VIDEOS_JS = os.path.join(os.path.dirname(__file__), "videos.js")
ACCOUNT   = "@thegerchverse"

def clean_title(raw):
    """Strip boilerplate, keep only the real title."""
    cut = len(raw)
    for marker in ["🥛", "💻", " #", "\n"]:
        p = raw.find(marker)
        if p != -1 and p < cut:
            cut = p
    return raw[:cut].strip().rstrip(".-– ") or "[title unavailable]"

def fetch_title(url):
    api = f"https://www.tiktok.com/oembed?url={url}"
    try:
        req = urllib.request.Request(api, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode())
            return clean_title(data.get("title", ""))
    except Exception as e:
        print(f"  WARNING: could not fetch {url} — {e}", file=sys.stderr)
        return "[fetch error]"

def get_existing_ids(content):
    return set(re.findall(r'\{ id: "(\d+)"', content))

def guess_characters(title, vid_id):
    """Basic character tagging from title keywords."""
    chars = ["amit"]
    t = title.lower()
    if "gadha" in t:            chars.append("gadha")
    if "big tex" in t:          chars.append("bigtex")
    if "amit jr" in t:          chars.append("amitjr")
    if "amit's mother" in t or "amitsmother" in t or "mom!" == title.strip():
        chars.append("amitsmother")
    if "dark amit" in t:        chars.append("darkamit")
    if "light amit" in t:       chars.append("lightamit")
    if "evil amit" in t:        chars.append("evilamit")
    if "gerchlander" in t:      chars.append("gerchlander")
    if "hannah" in t:           chars.append("hannah")
    return list(dict.fromkeys(chars))  # dedupe, preserve order

if not NEW_URLS or all(u.strip().startswith("#") for u in NEW_URLS):
    print("No new URLs found. Add them to NEW_URLS at the top of this script.")
    sys.exit(0)

# Load videos.js
with open(VIDEOS_JS, encoding="utf-8") as f:
    content = f.read()

existing_ids = get_existing_ids(content)
new_entries  = []

for url in NEW_URLS:
    url = url.strip()
    if not url or url.startswith("#"):
        continue
    vid_id = url.rstrip("/").split("/")[-1]
    if vid_id in existing_ids:
        print(f"  SKIP (already exists): {vid_id}")
        continue
    title = fetch_title(url)
    chars = guess_characters(title, vid_id)
    safe_title = title.replace('"', "'")
    chars_js = json.dumps(chars)
    entry = f'  {{ id: "{vid_id}", oneLiner: "{safe_title}", characters: {chars_js} }}, // {title}'
    new_entries.append(entry)
    print(f"  + {vid_id}: {title}")
    time.sleep(0.2)

if not new_entries:
    print("Nothing new to add.")
    sys.exit(0)

# Prepend new entries right after "VIDEO_DB.tiktok = ["
insert_marker = "VIDEO_DB.tiktok = ["
insert_pos = content.find(insert_marker)
if insert_pos == -1:
    print("ERROR: Could not find VIDEO_DB.tiktok in videos.js", file=sys.stderr)
    sys.exit(1)

insert_at = insert_pos + len(insert_marker)
new_block  = "\n" + "\n".join(new_entries) + "\n"
new_content = content[:insert_at] + new_block + content[insert_at:]

with open(VIDEOS_JS, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"\nDone. Added {len(new_entries)} new video(s) to videos.js.")
print("Next: open GitHub Desktop, commit, and push.")
