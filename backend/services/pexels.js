const axios = require('axios');
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const BASE = 'https://api.pexels.com';

const headers = { Authorization: PEXELS_KEY };

async function searchPhotos(query, perPage = 6) {
  if (!PEXELS_KEY) return getMockPhotos(query, perPage);
  try {
    const { data } = await axios.get(`${BASE}/v1/search`, {
      headers, params: { query, per_page: perPage, orientation: 'portrait' }
    });
    return data.photos.map(p => ({
      id: p.id,
      url: p.src.large,
      thumb: p.src.medium,
      photographer: p.photographer,
      alt: p.alt || query
    }));
  } catch { return getMockPhotos(query, perPage); }
}

async function searchVideos(query, perPage = 9) {
  if (!PEXELS_KEY) return getMockVideos(query, perPage);
  try {
    const { data } = await axios.get(`${BASE}/videos/search`, {
      headers, params: { query, per_page: perPage, orientation: 'portrait' }
    });
    return data.videos.map(v => ({
      id: v.id,
      duration: v.duration,
      thumbnail: v.image,
      url: v.video_files.find(f => f.quality === 'sd')?.link || v.video_files[0]?.link,
      user: v.user.name
    }));
  } catch { return getMockVideos(query, perPage); }
}

async function getTrendingVideos() {
  return searchVideos('creator talking camera aesthetic room', 12);
}

async function getPhotosBySlide(slides) {
  const withPhotos = [];
  for (const slide of slides) {
    const query = slide.title || 'business success';
    const photos = await searchPhotos(query, 1);
    withPhotos.push({ ...slide, bgImage: photos[0]?.url || null });
  }
  return withPhotos;
}

// Search specifically for UGC-style content (person talking to camera, lifestyle, authentic feel)
async function searchUGCContent(niche, perPage = 6) {
  const ugcQueries = [
    `person talking camera ${niche}`,
    `young creator filming selfie ${niche}`,
    `lifestyle vlog aesthetic ${niche}`,
    `person smartphone selfie video`,
    `authentic lifestyle creator`
  ];
  const query = ugcQueries[Math.floor(Math.random() * ugcQueries.length)];

  if (!PEXELS_KEY) return getMockVideos(query, perPage);
  try {
    const { data } = await axios.get(`${BASE}/videos/search`, {
      headers, params: { query, per_page: perPage, orientation: 'portrait' }
    });
    return data.videos.map(v => ({
      id: v.id,
      duration: v.duration,
      thumbnail: v.image,
      url: v.video_files.find(f => f.quality === 'sd')?.link || v.video_files[0]?.link,
      user: v.user.name,
      type: 'ugc'
    }));
  } catch { return getMockVideos(query, perPage); }
}

function getMockPhotos(query, n) {
  // Portrait-oriented Pexels photo IDs (people, lifestyle, aesthetic)
  const ids = [3760263, 3760514, 4050315, 4050347, 3771045, 3771089, 4050291, 4050388];
  return Array.from({ length: n }, (_, i) => ({
    id: ids[i % ids.length],
    url: `https://images.pexels.com/photos/${ids[i % ids.length]}/pexels-photo-${ids[i % ids.length]}.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200`,
    thumb: `https://images.pexels.com/photos/${ids[i % ids.length]}/pexels-photo-${ids[i % ids.length]}.jpeg?auto=compress&cs=tinysrgb&w=400`,
    photographer: 'Pexels Creator',
    alt: query
  }));
}

function getMockVideos(query, n) {
  // Portrait-format Pexels video IDs (UGC style, creator content, lifestyle)
  const vids = [
    { id: 5532771, thumbnail: 'https://images.pexels.com/videos/5532771/pictures/preview-0.jpg', url: 'https://www.pexels.com/video/5532771/', duration: 15, user: 'Karolina Grabowska' },
    { id: 4873209, thumbnail: 'https://images.pexels.com/videos/4873209/pictures/preview-0.jpg', url: 'https://www.pexels.com/video/4873209/', duration: 12, user: 'Mikhail Nilov' },
    { id: 5536991, thumbnail: 'https://images.pexels.com/videos/5536991/pictures/preview-0.jpg', url: 'https://www.pexels.com/video/5536991/', duration: 18, user: 'Artem Podrez' },
    { id: 6010489, thumbnail: 'https://images.pexels.com/videos/6010489/pictures/preview-0.jpg', url: 'https://www.pexels.com/video/6010489/', duration: 20, user: 'MART PRODUCTION' },
    { id: 4778611, thumbnail: 'https://images.pexels.com/videos/4778611/pictures/preview-0.jpg', url: 'https://www.pexels.com/video/4778611/', duration: 10, user: 'Monstera' },
    { id: 5739783, thumbnail: 'https://images.pexels.com/videos/5739783/pictures/preview-0.jpg', url: 'https://www.pexels.com/video/5739783/', duration: 14, user: 'Alena Darmel' },
  ];
  return Array.from({ length: n }, (_, i) => vids[i % vids.length]);
}

module.exports = { searchPhotos, searchVideos, getTrendingVideos, getPhotosBySlide, searchUGCContent };
