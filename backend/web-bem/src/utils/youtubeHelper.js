const axios = require('axios');
require('dotenv').config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// ... (Fungsi parseDuration yang lama biarkan saja) ...
const parseDuration = (isoDuration) => {
    // Kode lama kamu...
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);
    
    let result = "";
    if (hours > 0) result += `${hours}:`;
    result += `${minutes.toString().padStart(hours > 0 ? 2 : 1, '0')}:`;
    result += seconds.toString().padStart(2, '0');
    return result;
};

// ... (Fungsi getVideoDetails yang lama biarkan saja) ...
const getVideoDetails = async (videoId) => {
    // Kode lama kamu...
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
        const response = await axios.get(url);

        if (response.data.items.length === 0) return null;

        const item = response.data.items[0];
        return {
            youtube_id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail_url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
            channel_name: item.snippet.channelTitle,
            duration: parseDuration(item.contentDetails.duration)
        };
    } catch (error) {
        console.error("YouTube API Error:", error.response?.data || error.message);
        throw new Error("Gagal mengambil data dari YouTube");
    }
};

// ✅ TAMBAHAN BARU: Fungsi Ambil Playlist
const getPlaylistVideos = async (playlistId) => {
    try {
        // 1. Ambil daftar ID video dari playlist
        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
        const res = await axios.get(playlistUrl);
        
        const videoIds = res.data.items.map(item => item.contentDetails.videoId);

        // 2. Ambil detail untuk setiap video (Durasi, dll)
        // Kita pakai Promise.all biar nge-fetch barengan (cepat)
        const videosDetails = await Promise.all(
            videoIds.map(id => getVideoDetails(id))
        );

        return videosDetails.filter(v => v !== null); // Hapus yang null jika ada error

    } catch (error) {
        console.error("Playlist API Error:", error.message);
        throw new Error("Gagal mengambil playlist");
    }
};

module.exports = { getVideoDetails, getPlaylistVideos };