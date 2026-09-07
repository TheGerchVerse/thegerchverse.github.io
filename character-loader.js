// CHARACTER-LOADER.JS - Renders character pages from videos.js
// ============================================

const VIDEOS_PER_PAGE = 6;
let currentSoloPage = 1;
let currentMultiPage = 1;
let currentTiktokPage = 1;

function getCharacterKey() {
  const bodyKey = document.body.dataset.character;
  if (bodyKey) return bodyKey;
  
  const path = window.location.pathname;
  const match = path.match(/\/characters\/(\w+)\.html/);
  return match ? match[1] : null;
}

function initCharacterPage() {
  const charKey = getCharacterKey();
  
  if (!charKey || !CHARACTERS[charKey]) {
    console.error('Character not found:', charKey);
    document.getElementById('solo-videos-grid').innerHTML = 
      '<div class="error-message">Character not found. Check the URL or data-character attribute.</div>';
    return;
  }
  
  const character = CHARACTERS[charKey];

  // Sora videos — preserved in data but hidden from display for now.
  // Will be re-enabled as Canon (YouTube) section once videos are uploaded.
  // const soloVideos = VIDEO_DB.solo[charKey] || [];
  // const multiVideos = getMultiVideosForCharacter(charKey);

  // TikTok purgatory videos for this character
  const tiktokVideos = getTiktokVideosForCharacter(charKey);

  renderHeader(character, tiktokVideos.length);
  hideSoraSections();
  renderTiktokVideos(tiktokVideos, charKey);
  document.title = `${character.name} | Gerch-Verse`;
}

// Hides the Sora solo/multi sections — data is preserved, just not shown.
// Remove this call when YouTube upload is ready.
function hideSoraSections() {
  const soloSection = document.querySelector('.video-section:not(#tiktok-videos-section)');
  const multiSection = document.getElementById('multi-videos-section');
  if (soloSection) soloSection.style.display = 'none';
  if (multiSection) multiSection.style.display = 'none';
}

function getTiktokVideosForCharacter(charKey) {
  if (!VIDEO_DB.tiktok) return [];
  return VIDEO_DB.tiktok.filter(v => v.characters && v.characters.includes(charKey));
}

function renderHeader(character, tiktokCount) {
  const headerEl = document.getElementById('character-header');
  if (!headerEl) return;
  
  headerEl.innerHTML = `
    <img src="${character.avatar}" alt="${character.name}" class="char-avatar" 
         onerror="this.src='../images/default-avatar.jpg'">
    <div class="char-info">
      <h1>${character.name}</h1>
      <p class="char-handle">${character.handle}</p>
      <p class="char-role">${character.role}</p>
      <div class="char-stats">
        <span class="stat">${tiktokCount} TikTok Purgatory Videos</span>
      </div>
    </div>
  `;
  
  document.documentElement.style.setProperty('--char-color', character.color);
}

// ============================================
// TIKTOK PURGATORY SECTION
// ============================================
function renderTiktokVideos(videos, charKey) {
  const sectionEl = document.getElementById('tiktok-videos-section');
  const gridEl = document.getElementById('tiktok-videos-grid');
  const paginationEl = document.getElementById('tiktok-pagination');
  const countEl = document.getElementById('tiktok-count');

  if (!sectionEl || !gridEl) return;
  if (countEl) countEl.textContent = videos.length;

  if (videos.length === 0) {
    sectionEl.style.display = 'none';
    return;
  }

  sectionEl.style.display = 'block';

  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const startIdx = (currentTiktokPage - 1) * VIDEOS_PER_PAGE;
  const endIdx = startIdx + VIDEOS_PER_PAGE;
  const visibleVideos = videos.slice(startIdx, endIdx);

  let html = '';
  for (const video of visibleVideos) {
    html += renderTiktokCard(video);
  }
  gridEl.innerHTML = html;

  if (paginationEl) {
    if (totalPages > 1) {
      paginationEl.style.display = 'flex';
      window.tiktokPagination = new SmartPagination('tiktok-pagination', {
        currentPage: currentTiktokPage,
        totalPages: totalPages,
        onPageChange: (page) => {
          currentTiktokPage = page;
          renderTiktokVideos(videos, charKey);
          document.getElementById('tiktok-videos-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    } else {
      paginationEl.style.display = 'none';
    }
  }
}

// TikTok card — links to TikTok, no local thumbnail needed
function renderTiktokCard(video) {
  const url = `https://www.tiktok.com/@thegerchverse/video/${video.id}`;
  return `
    <div class="video-cell">
      <a href="${url}" target="_blank" rel="noopener" class="video-card">
        <div class="card-media card-placeholder-tiktok">
          <span>📱 TikTok</span>
        </div>
        <span class="card-badge card-badge-tiktok">↗ TikTok</span>
        <div class="card-caption-overlay">
          <span class="caption-text">${video.oneLiner}</span>
        </div>
      </a>
      <div class="costar-row"></div>
    </div>
  `;
}

function renderSoloVideos(videos, charKey) {
  const gridEl = document.getElementById('solo-videos-grid');
  const paginationEl = document.getElementById('solo-pagination');
  const countEl = document.getElementById('solo-count');
  
  if (!gridEl) return;
  if (countEl) countEl.textContent = videos.length;
  
  if (videos.length === 0) {
    gridEl.innerHTML = '<div class="empty-message">No solo videos yet. Check back soon!</div>';
    if (paginationEl) paginationEl.style.display = 'none';
    return;
  }
  
  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const startIdx = (currentSoloPage - 1) * VIDEOS_PER_PAGE;
  const endIdx = startIdx + VIDEOS_PER_PAGE;
  const visibleVideos = videos.slice(startIdx, endIdx);
  
  // Build HTML string properly
  let html = '';
  for (const video of visibleVideos) {
    html += renderVideoCard(video);
  }
  gridEl.innerHTML = html;
  
    if (paginationEl) {
    if (totalPages > 1) {
      paginationEl.style.display = 'flex';
      // Use SmartPagination
      window.soloPagination = new SmartPagination('solo-pagination', {
        currentPage: currentSoloPage,
        totalPages: totalPages,
        onPageChange: (page) => {
          currentSoloPage = page;
          renderSoloVideos(videos, charKey);
          document.getElementById('solo-videos-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    } else {
      paginationEl.style.display = 'none';
    }
  }
}

function renderMultiVideos(videos, charKey) {
  const sectionEl = document.getElementById('multi-videos-section');
  const gridEl = document.getElementById('multi-videos-grid');
  const paginationEl = document.getElementById('multi-pagination');
  const countEl = document.getElementById('multi-count');
  
  if (!sectionEl || !gridEl) return;
  if (countEl) countEl.textContent = videos.length;
  
  if (videos.length === 0) {
    sectionEl.style.display = 'none';
    return;
  }
  
  sectionEl.style.display = 'block';
  
  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const startIdx = (currentMultiPage - 1) * VIDEOS_PER_PAGE;
  const endIdx = startIdx + VIDEOS_PER_PAGE;
  const visibleVideos = videos.slice(startIdx, endIdx);
  
  // Build HTML string properly
  let html = '';
  for (const video of visibleVideos) {
    const coStars = video.characters.filter(c => c !== charKey);
    html += renderVideoCard(video, coStars);
  }
  gridEl.innerHTML = html;
  
  if (paginationEl) {
    if (totalPages > 1) {
      paginationEl.style.display = 'flex';
      // Use SmartPagination
      window.multiPagination = new SmartPagination('multi-pagination', {
        currentPage: currentMultiPage,
        totalPages: totalPages,
        onPageChange: (page) => {
          currentMultiPage = page;
          renderMultiVideos(videos, charKey);
          document.getElementById('multi-videos-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    } else {
      paginationEl.style.display = 'none';
    }
  }
}

// ============================================
// RENDER VIDEO CARD - FIXED STRUCTURE
// ============================================
function renderVideoCard(video, coStars = null) {
  const thumbPath = video.thumb ? `../thumbnails/${video.thumb}` : '';
  const hasThumb = video.thumb && !video.thumb.includes('[VIDEO_ID]');
  
  // Build co-stars row HTML (separate from card)
  let coStarsHtml = '';
  if (coStars && coStars.length > 0) {
    let avatarsHtml = '';
    for (const charKey of coStars) {
      const char = CHARACTERS[charKey];
      if (!char) continue;
      avatarsHtml += `
        <a href="./${charKey}.html" class="costar-avatar-link" title="${char.name}">
          <img src="${char.avatar}" alt="${char.name}" class="costar-avatar" 
               onerror="this.src='../images/default-avatar.jpg'"
               style="border-color: ${char.color}">
        </a>
      `;
    }
    coStarsHtml = `<div class="costar-row">${avatarsHtml}</div>`;
  } else {
    // Empty placeholder to maintain spacing
    coStarsHtml = '<div class="costar-row"></div>';
  }
  
  // Card is just the thumbnail with overlay caption
  const cardHtml = `
    <a href="https://sora.chatgpt.com/p/${video.id}" target="_blank" rel="noopener" class="video-card">
      <div class="card-media">
        ${hasThumb 
          ? `<img src="${thumbPath}" alt="${video.oneLiner}" loading="lazy" 
               onerror="this.style.display='none';this.parentNode.innerHTML='<div class=\\'card-placeholder\\'>THUMB<br>SOON</div>'">`
          : `<div class="card-placeholder">THUMB<br>SOON</div>`
        }
      </div>
      <span class="card-badge">↗ Sora</span>
      <div class="card-caption-overlay">"${video.oneLiner}"</div>
    </a>
  `;
  
  // Return card + co-stars row wrapped together
  return `<div class="video-cell">${cardHtml}${coStarsHtml}</div>`;
}

function getMultiVideosForCharacter(charKey) {
  return VIDEO_DB.multi.filter(video => video.characters.includes(charKey));
}

function changeSoloPage(direction) {
  const charKey = getCharacterKey();
  const videos = VIDEO_DB.solo[charKey] || [];
  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  
  currentSoloPage += direction;
  if (currentSoloPage < 1) currentSoloPage = 1;
  if (currentSoloPage > totalPages) currentSoloPage = totalPages;
  
  renderSoloVideos(videos, charKey);
  document.getElementById('solo-videos-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function changeMultiPage(direction) {
  const charKey = getCharacterKey();
  const videos = getMultiVideosForCharacter(charKey);
  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  
  currentMultiPage += direction;
  if (currentMultiPage < 1) currentMultiPage = 1;
  if (currentMultiPage > totalPages) currentMultiPage = totalPages;
  
  renderMultiVideos(videos, charKey);
  document.getElementById('multi-videos-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCharacterPage);
} else {
  initCharacterPage();
}