const https = require('https');

const UNSPLASH_API_URL = 'https://api.unsplash.com';
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

function unsplashRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${UNSPLASH_API_URL}${path}`;
    const options = {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
        'Accept-Version': 'v1',
      },
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse Unsplash response'));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Search photos by query
 */
async function searchPhotos({ query, page = 1, perPage = 20, orientation = null, color = null }) {
  let path = `/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
  if (orientation) path += `&orientation=${orientation}`;
  if (color) path += `&color=${color}`;
  return unsplashRequest(path);
}

/**
 * Get a random photo (optionally filtered by query/topic)
 */
async function getRandomPhoto({ query = null, orientation = null, count = 1 } = {}) {
  let path = `/photos/random?count=${count}`;
  if (query) path += `&query=${encodeURIComponent(query)}`;
  if (orientation) path += `&orientation=${orientation}`;
  return unsplashRequest(path);
}

/**
 * Get a specific photo by ID
 */
async function getPhoto(id) {
  return unsplashRequest(`/photos/${id}`);
}

/**
 * List editorial photos (curated)
 */
async function listEditorialPhotos({ page = 1, perPage = 20, orderBy = 'popular' } = {}) {
  return unsplashRequest(`/photos?page=${page}&per_page=${perPage}&order_by=${orderBy}`);
}

/**
 * Search collections
 */
async function searchCollections({ query, page = 1, perPage = 10 }) {
  return unsplashRequest(`/search/collections?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
}

/**
 * List topics (curated collections)
 */
async function listTopics({ page = 1, perPage = 10, orderBy = 'featured' } = {}) {
  return unsplashRequest(`/topics?page=${page}&per_page=${perPage}&order_by=${orderBy}`);
}

/**
 * Get photos from a topic
 */
async function getTopicPhotos(topicIdOrSlug, { page = 1, perPage = 20, orientation = null } = {}) {
  let path = `/topics/${topicIdOrSlug}/photos?page=${page}&per_page=${perPage}`;
  if (orientation) path += `&orientation=${orientation}`;
  return unsplashRequest(path);
}

module.exports = {
  searchPhotos,
  getRandomPhoto,
  getPhoto,
  listEditorialPhotos,
  searchCollections,
  listTopics,
  getTopicPhotos,
};
