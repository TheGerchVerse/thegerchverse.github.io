# Gerchverse Project Context

## Owner
Novice developer. Always use plain English. No jargon unless explained.

## Site
- Live at: thegerchverse.com
- Repo: https://github.com/TheGerchVerse/thegerchverse.github.io
- Local path: /Users/MykellRyu/Desktop/thegerchverse.github.io
- Hosted on GitHub Pages. Push to main = live in ~1 min.

## What the site is
Dark corporate satire / absurdist AI-generated video universe. Tone: deadpan institutional, dry, never winking. Key phrases: "insolent cow", Q5/Q6 profits, milk slap, Sora terminated for insolence, TikTok purgatory.

## Platform status
- **Sora**: shut down. Videos archived locally, not yet on site. Will become Canon (YouTube) section eventually.
- **TikTok**: current active platform. Off-canon content. Two accounts:
  - @memelourde — main lore/canon
  - @thegerchverse — off-canon
- **YouTube**: migration destination for Sora archive. Not yet populated.

## Adding new TikTok videos (standard workflow)
User pastes TikTok URLs. Kiro should:

1. Fetch titles via oEmbed API:
   ```
   https://www.tiktok.com/oembed?url=https://www.tiktok.com/@thegerchverse/video/{ID}
   ```
   Clean title = everything before the first `🥛`, `💻`, ` #`, or `\n`. Strip trailing `.-– `.

2. Skip `/photo/` URLs (not supported). Skip duplicate IDs already in `videos.js`.

3. Prepend new entries to the TOP of `VIDEO_DB.tiktok` in `videos.js` (newest first):
   ```js
   { id: "XXXXX", oneLiner: "Clean title", characters: ["amit"] }, // Full original title
   ```

4. Tag `characters` array based on title keywords:
   - gadha, bigtex, amitjr, amitsmother, darkamit, lightamit, evilamit, gerchlander, hannah, leon

5. `git add videos.js && git commit -m "Add N new TikTok videos" && git push`

## Key files
- `videos.js` — all video data. `VIDEO_DB.tiktok` = TikTok array (newest first). `VIDEO_DB.solo` = Sora archive (hidden). `CHARACTERS` = character metadata.
- `character-loader.js` — renders character pages. Sora sections hidden via comment. TikTok section renders with pagination + live oEmbed thumbnail fetch.
- `characters/amit.html` — only character page currently live with videos.
- `fam.html` — character grid. Only Amit links to his page; all others → character-unavailable.html.
- `fetch-tiktok-titles.py` — helper script. Add URLs to `NEW_URLS`, run `python3 fetch-tiktok-titles.py`, it auto-writes to `videos.js`.
- `index.html` — homepage. Has TikTok purgatory memo, YouTube embeds, creator cards.

## Characters (key ones)
- **Amit Gaur** — CEO Gerchan Farms, main character, navy Nehru jacket. Catchphrase: "You insolent cow!"
- **Gadha** — divine bovine, nourisher of planets
- **Big Tex Wang** — Texas rancher
- **Amit Jr. (Q6)** — accidental pop star son
- **Amit's Mother** — immortal architect, neglectful parent
- **Dark Amit / Light Amit / Evil Amit** — Amit variants
- **Gerchlander** — super toddler corporate demigod
- **Mediocrates** — CAPO, approves everything without reading it
- **Hannah Delvey** — luxury confidence scam architect

## Humor/tone notes
- Institutional absurdism. Bureaucratic language applied to unhinged premises.
- Q5 = a fiscal quarter beyond Q4. Q6 = beyond that.
- "Insolent cow" is the primary insult/term of endearment.
- Sora shutdown is treated as a corporate tragedy/insolence.
- TikTok = purgatory between Sora and YouTube.
- All AI tools (Sora, Seedance, Kling, Pixverse, Dreamina) are referenced site-wide in disclaimers.
