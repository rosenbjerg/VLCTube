
const { spawn } = require('child_process');
const fetch = require('node-fetch');

async function playVideo(url, qualityPreferences, whenDone) {
    const id = extractId(url);
    const videoInfo = await fetchVideoInfo(id);
    const playerResponse = parseVideoInfoApiResponse(videoInfo);
        

    const streams = selectStreams(playerResponse);
    const video = getPreferredVideoStream(streams, qualityPreferences);
    const audio = streams.filter(af => af.mimeType.includes('audio'))[0];

    const author = playerResponse.videoDetails.author.split('+').join(' ');
    const title = playerResponse.videoDetails.title.split('+').join(' ');
    const current = `${author}: ${title} (${video.quality})`;

    const childProcess = spawn('vlc', [
        '--play-and-exit', '--embedded-video', '--fullscreen', '--one-instance',
        '--no-qt-name-in-title', '--no-video-title-show',
        `--input-slave=${audio.url}`, video.url
    ])
    childProcess.on('exit', whenDone);
    return { current, childProcess };
}
function getPreferredVideoStream(streams, qualityPreferences) {
    const videoStreams = streams.filter(af => af.mimeType.includes('video'));
    for (const quality of qualityPreferences) {
        const stream = videoStreams.find(stream => stream.quality === quality);
        if (stream) return stream;
    }
    return videoStreams[0];
}

const idRegex = /v=([a-zA-Z0-9_-]+)/;
function extractId(url) {
    const match = idRegex.exec(url);
    if (match)
        return match[1];
    throw new Error("Unable to find video ID in URL - example of valid url: https://www.youtube.com/watch?v=qwXYq-71t0U");
}

async function fetchVideoInfo(id) {
    const response = await fetch(`https://www.youtube.com/get_video_info?video_id=${id}`);
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
        const key = equal[0]
        const value = decodeURIComponent(equal[1]);
        stats[key] = value;
    }
    return JSON.parse(stats['player_response']);
}

function selectStreams(playerResponse) {
    const adaptiveFormats = playerResponse.streamingData.adaptiveFormats;
    return adaptiveFormats
                .filter(af => af.mimeType.includes('mp4'))
                .map(af => ({
                    url: af.url,
                    quality: af.qualityLabel,
                    mimeType: af.mimeType
                }));
}

module.exports = { playVideo, extractId };