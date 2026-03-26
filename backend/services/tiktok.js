const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// Actor ID for TikTok Trends Scraper by Clockworks
const ACTOR_ID = 'clockworks~tiktok-trends-scraper';

/**
 * Scrape TikTok trending hashtags
 */
async function scrapeTrendingHashtags({ countryCode = 'US', timeRange = '7', resultsPerPage = 50 } = {}) {
  const input = {
    adsScrapeHashtags: true,
    resultsPerPage,
    adsCountryCode: countryCode,
    adsTimeRange: timeRange,
    adsRankType: 'popular',
    adsScrapeSounds: false,
    adsScrapeCreators: false,
    adsScrapeVideos: false,
    adsSoundsCountryCode: countryCode,
    adsCreatorsCountryCode: countryCode,
    adsVideosCountryCode: countryCode,
    adsSortCreatorsBy: 'follower',
    adsSortVideosBy: 'vv',
  };

  const run = await client.actor(ACTOR_ID).call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

/**
 * Scrape TikTok trending sounds
 */
async function scrapeTrendingSounds({ countryCode = 'US', timeRange = '7', resultsPerPage = 50 } = {}) {
  const input = {
    adsScrapeHashtags: false,
    adsScrapeSounds: true,
    adsSoundsCountryCode: countryCode,
    adsTimeRange: timeRange,
    resultsPerPage,
    adsRankType: 'popular',
    adsScrapeCreators: false,
    adsScrapeVideos: false,
    adsCountryCode: countryCode,
    adsCreatorsCountryCode: countryCode,
    adsVideosCountryCode: countryCode,
    adsSortCreatorsBy: 'follower',
    adsSortVideosBy: 'vv',
  };

  const run = await client.actor(ACTOR_ID).call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

/**
 * Scrape TikTok trending videos
 */
async function scrapeTrendingVideos({ countryCode = 'US', timeRange = '7', resultsPerPage = 50, sortBy = 'vv' } = {}) {
  const input = {
    adsScrapeHashtags: false,
    adsScrapeSounds: false,
    adsScrapeCreators: false,
    adsScrapeVideos: true,
    adsVideosCountryCode: countryCode,
    adsTimeRange: timeRange,
    resultsPerPage,
    adsSortVideosBy: sortBy,
    adsRankType: 'popular',
    adsCountryCode: countryCode,
    adsSoundsCountryCode: countryCode,
    adsCreatorsCountryCode: countryCode,
    adsSortCreatorsBy: 'follower',
  };

  const run = await client.actor(ACTOR_ID).call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

/**
 * Scrape TikTok trending creators
 */
async function scrapeTrendingCreators({ countryCode = 'US', timeRange = '7', resultsPerPage = 50, sortBy = 'follower' } = {}) {
  const input = {
    adsScrapeHashtags: false,
    adsScrapeSounds: false,
    adsScrapeCreators: true,
    adsCreatorsCountryCode: countryCode,
    adsTimeRange: timeRange,
    resultsPerPage,
    adsSortCreatorsBy: sortBy,
    adsScrapeVideos: false,
    adsRankType: 'popular',
    adsCountryCode: countryCode,
    adsSoundsCountryCode: countryCode,
    adsVideosCountryCode: countryCode,
    adsSortVideosBy: 'vv',
  };

  const run = await client.actor(ACTOR_ID).call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

/**
 * Scrape all TikTok trends at once (hashtags + sounds + videos + creators)
 */
async function scrapeAllTrends({ countryCode = 'US', timeRange = '7', resultsPerPage = 30 } = {}) {
  const input = {
    adsScrapeHashtags: true,
    adsScrapeSounds: true,
    adsScrapeCreators: true,
    adsScrapeVideos: true,
    adsCountryCode: countryCode,
    adsSoundsCountryCode: countryCode,
    adsCreatorsCountryCode: countryCode,
    adsVideosCountryCode: countryCode,
    adsTimeRange: timeRange,
    resultsPerPage,
    adsRankType: 'popular',
    adsSortCreatorsBy: 'follower',
    adsSortVideosBy: 'vv',
  };

  const run = await client.actor(ACTOR_ID).call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

module.exports = {
  scrapeTrendingHashtags,
  scrapeTrendingSounds,
  scrapeTrendingVideos,
  scrapeTrendingCreators,
  scrapeAllTrends,
};
