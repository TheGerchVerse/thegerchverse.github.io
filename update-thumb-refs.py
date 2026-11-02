#!/usr/bin/env python3
# ============================================
# THUMBNAIL REFERENCE UPDATER
# ============================================
#
# WHEN TO RUN THIS:
#   Right after download-thumbnails.py finishes
#
# HOW TO RUN (in Terminal):
#   cd ~/Desktop/thegerchverse.github.io
#   python3 update-thumb-refs.py
#
# WHAT IT DOES:
#   - Looks at every video entry in videos.js
#   - If a matching tt-{id}.jpg exists in thumbnails/
#     it adds thumb: "tt-{id}.jpg" to that entry
#   - Skips entries that already have a thumb field
#   - Skips photo posts
#
# AFTER THIS RUNS:
#   git add thumbnails/ videos.js
#   git commit -m "Add thumbnails for new videos"
#   git push
#   (Or just ask Kiro to do it all for you)
# ============================================

import os, re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEOS_JS  = os.path.join(SCRIPT_DIR, "videos.js")
THUMBS_DIR = os.path.join(SCRIPT_DIR, "thumbnails")

with open(VIDEOS_JS, encoding="utf-8") as f:
    content = f.read()

def add_thumb(match):
    vid_id = match.group(1)
    rest   = match.group(2)
    # Skip if already has thumb or is a photo
    if 'thumb:' in rest or 'type: "photo"' in rest:
        return match.group(0)
    thumb_path = os.path.join(THUMBS_DIR, f"tt-{vid_id}.jpg")
    if os.path.exists(thumb_path):
        # Insert thumb field before the closing }
        new_rest = rest.rstrip() + f', thumb: "tt-{vid_id}.jpg" '
        return f'{{ id: "{vid_id}"{new_rest}}}'
    return match.group(0)

new_content = re.sub(r'\{ id: "(\d+)"([^}]*)\}', add_thumb, content)

count = new_content.count('thumb: "tt-')
with open(VIDEOS_JS, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"Updated {count} entries with local thumbnail references.")
print("Next: git add thumbnails/ videos.js && git commit -m 'Add TikTok thumbnails' && git push")
