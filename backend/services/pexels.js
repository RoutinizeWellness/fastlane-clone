const axios = require('axios');
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const BASE = 'https://api.pexels.com';

const headers = { Authorization: PEXELS_KEY };

async function searchPhotos(query, perPage = 6) {
  if (!PEXELS_KEY) return getMockPhotos(query, perPage);
  try {
    const { data } = await axios.get(`${BASE}/v1/search`, {
      headers, params: { query, per_page: perPage, orientation: 'landscape' }
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
      headers, params: { query, per_page: perPage, orientation: 'landscape' }
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
  return searchVideos('viral trending social media creator', 12);
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

function getMockPhotos(query, n) {
  const ids = [1181695, 3184465, 3184339, 3184292, 1181467, 3184430, 3184338, 3184360];
  return Array.from({ length: n }, (_, i) => ({
    id: ids[i % ids.length],
    url: `https://images.pexels.com/photos/${ids[i % ids.length]}/pexels-photo-${ids[i % ids.length]}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750`,
    thumb: `https://images.pexels.com/photos/${ids[i % ids.length]}/pexels-photo-${ids[i % ids.length]}.jpeg?auto=compress&cs=tinysrgb&w=400`,
    photographer: 'Pexels',
    alt: query
  }));
}

function getMockVideos(query, n) {
  const vids = [
    { id: 1, thumbnail: 'https://images.pexels.com/videos/3048651/pictures/preview-0.jpg', url: 'https://www.pexels.com/video/3048651/', duration: 15, user: 'Creator' },
    { id: 2, thumbnail: 'https://images.pexels.com/videos/2098881/pictures/preview-0.jpg', url: 'https://www.pexels.com/video/2098881/', duration: 20, user: 'Creator' },
    { id: 3, thumbnail: 'https://images.pexels.com/videos/1093662/pictures/preview-0.jpg', url: 'https://www.pexels.com/video/1093662/', duration: 12, user: 'Creator' },
  ];
  return Array.from({ length: n }, (_, i) => vids[i % vids.length]);
}

module.exports = { searchPhotos, searchVideos, getTrendingVideos, getPhotosBySlide };
