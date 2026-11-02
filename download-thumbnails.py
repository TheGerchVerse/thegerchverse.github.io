#!/usr/bin/env python3
# ============================================
# TIKTOK THUMBNAIL DOWNLOADER
# ============================================
#
# WHEN TO RUN THIS:
#   After adding new TikTok videos via fetch-tiktok-titles.py
#   (or after asking Kiro to add new videos for you)
#
# HOW TO RUN (in Terminal):
#   cd ~/Desktop/thegerchverse.github.io
#   python3 download-thumbnails.py
#
# WHAT IT DOES:
#   - Reads all video IDs from videos.js
#   - Downloads a thumbnail for each one via yt-dlp
#   - Saves them to the thumbnails/ folder as tt-{id}.jpg
#   - Skips any video that already has a thumbnail downloaded
#   - Takes ~5-10 min for 500+ videos, instant for a few new ones
#
# AFTER THIS RUNS:
#   Run: python3 update-thumb-refs.py
#   Then: git add thumbnails/ videos.js && git commit -m "Add thumbnails" && git push
#   (Or just ask Kiro to do it all for you)
# ============================================

import subprocess, os, re, shutil, time, sys

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
VIDEOS_JS    = os.path.join(SCRIPT_DIR, "videos.js")
THUMBS_DIR   = os.path.join(SCRIPT_DIR, "thumbnails")
YTDLP        = "/Users/MykellRyu/Library/Python/3.9/bin/yt-dlp"
TMP_DIR      = "/tmp/gerch_thumbs"

os.makedirs(THUMBS_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

# Extract all TikTok video IDs from videos.js (skip photo type entries)
with open(VIDEOS_JS, encoding="utf-8") as f:
    content = f.read()

# Match entries in VIDEO_DB.tiktok that are NOT photo type
# Pattern: { id: "XXXXX", ... } where line does NOT contain type: "photo"
all_entries = re.findall(r'\{ id: "(\d+)"[^}]*\}', content)

# Find the tiktok section start
tiktok_start = content.find("VIDEO_DB.tiktok")
tiktok_content = content[tiktok_start:] if tiktok_start != -1 else ""
tiktok_entries = re.findall(r'\{ id: "(\d+)"([^}]*)\}', tiktok_content)

ids = []
for vid_id, rest in tiktok_entries:
    if 'type: "photo"' not in rest:
        thumb_path = os.path.join(THUMBS_DIR, f"tt-{vid_id}.jpg")
        if os.path.exists(thumb_path):
            # Already downloaded
            continue
        ids.append(vid_id)

print(f"Found {len(ids)} thumbnails to download (skipping already downloaded)")

errors = []
for i, vid_id in enumerate(ids):
    dest = os.path.join(THUMBS_DIR, f"tt-{vid_id}.jpg")
    tmp_base = os.path.join(TMP_DIR, vid_id)

    sys.stderr.write(f"\r[{i+1}/{len(ids)}] {vid_id}")
    sys.stderr.flush()

    try:
        result = subprocess.run([
            YTDLP,
            "--write-thumbnail",
            "--skip-download",
            "--no-warnings",
            "--quiet",
            "-o", f"{tmp_base}.%(ext)s",
            f"https://www.tiktok.com/@thegerchverse/video/{vid_id}"
        ], capture_output=True, text=True, timeout=30)

        # Find whatever file was written (could be .image, .jpg, .webp etc)
        for ext in [".jpg", ".jpeg", ".image", ".webp", ".png"]:
            tmp_file = tmp_base + ext
            if os.path.exists(tmp_file):
                shutil.move(tmp_file, dest)
                break
        else:
            errors.append(vid_id)

    except Exception as e:
        errors.append(vid_id)

    time.sleep(0.5)  # Be polite to TikTok's servers

sys.stderr.write("\n")
print(f"\nDone. Downloaded thumbnails for {len(ids) - len(errors)} videos.")
if errors:
    print(f"Failed ({len(errors)}): {', '.join(errors[:10])}{'...' if len(errors) > 10 else ''}")
print(f"\nNext: run python3 update-thumb-refs.py to update videos.js")
