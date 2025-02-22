import { google } from 'googleapis';
import ErrorResponse from './errorResponse.js';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

export const getVideoDetails = async (videoId) => {
  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: [videoId]
    });

    if (!response.data.items.length) {
      throw new ErrorResponse('Video not found', 404);
    }

    const video = response.data.items[0];
    return {
      youtubeId: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      thumbnail: video.snippet.thumbnails.high.url,
      duration: video.contentDetails.duration,
      viewCount: parseInt(video.statistics.viewCount, 10)
    };
  } catch (error) {
    throw new ErrorResponse('Failed to fetch video details', 500);
  }
};

export const getChannelVideos = async (channelId, maxResults = 50) => {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      channelId,
      maxResults,
      order: 'date',
      type: ['video']
    });

    return response.data.items.map(item => ({
      youtubeId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      thumbnail: item.snippet.thumbnails.high.url
    }));
  } catch (error) {
    throw new ErrorResponse('Failed to fetch channel videos', 500);
  }
}; 