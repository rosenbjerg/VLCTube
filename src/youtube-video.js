const fetch = require('node-fetch');

async function fetchFullInfo(id, qualityPreferences, x264only) {
    const videoInfo = await downloadVideoInfo(id);
    const playerResponse = parseVideoInfoApiResponse(videoInfo);

    const streams = selectStreams(playerResponse, x264only);
    const video = getPreferredVideoStream(streams, qualityPreferences);
    const audio = streams.filter(af => af.mimeType.includes('audio'))[0];

    const channel = playerResponse.videoDetails.author.split('+').join(' ');
    const title = playerResponse.videoDetails.title.split('+').join(' ');

    return { channel, title, video, audio };
}

async function fetchVideoInfo(id) {
    const videoInfo = await downloadVideoInfo(id);
    const playerResponse = parseVideoInfoApiResponse(videoInfo);
    const title = playerResponse.videoDetails.title.split('+').join(' ');
    return { title, id };
}

function getPreferredVideoStream(streams, qualityPreferences) {
    const videoStreams = streams.filter(af => af.mimeType.includes('video'));
    for (const quality of qualityPreferences) {
        const stream = videoStreams.find(stream => stream.quality === quality);
        if (stream) return stream;
    }
    return videoStreams[0];
}

async function downloadVideoInfo(id) {
    const response = await fetch(`https://www.youtube.com/get_video_info?video_id=${id}&eurl=https://youtube.googleapis.com/v/${id}&gl=US&hl=en`);
    if (response.ok)
        return await response.text();
    else
        throw new Error("Could not fetch video info")
}

function parseVideoInfoApiResponse(content) {
    const attributes = content.split('&');
    const stats = {};
    for (const attr of attributes) {
        const equal = attr.split('=');
        const key = equal[0];
        stats[key] = decodeURIComponent(equal[1]);
    }
    return JSON.parse(stats['player_response']);
}

function selectStreams(playerResponse, x264only) {
    if (!playerResponse.streamingData || !playerResponse.streamingData.adaptiveFormats) {
        throw new Error('No adaptive format streams found')
    }
    let adaptiveFormats = playerResponse.streamingData.adaptiveFormats;
    if (x264only) adaptiveFormats = adaptiveFormats.filter(af => af.mimeType.includes('mp4'));
    return adaptiveFormats.map(af => ({
        url: af.url,
        quality: af.qualityLabel,
        mimeType: af.mimeType
    }));
}

module.exports = { fetchVideoInfo, fetchFullInfo };