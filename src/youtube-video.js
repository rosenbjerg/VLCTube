const ytdl = require('ytdl-core');
const fs = require('fs');

async function fetchFullInfo(id, qualityPreferences, x264only) {
    const ytInfo = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${id}`);
    const streams = selectStreams(ytInfo.formats, x264only);
    fs.writeFileSync("streams.json", JSON.stringify(streams));
    const video = getPreferredVideoStream(streams.video, qualityPreferences);
    const audio = streams.audio[0];

    const channel = ytInfo.author.name;
    const title = ytInfo.player_response.videoDetails.title;

    return { channel, title, video, audio };
}

async function fetchVideoInfo(id) {
    const ytInfo = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${id}`);
    const title = ytInfo.player_response.videoDetails.title;
    return { title, id };
}

function getPreferredVideoStream(videoStreams, qualityPreferences) {
    for (const quality of qualityPreferences) {
        const stream = videoStreams.find(stream => stream.quality_label === quality);
        if (stream) return stream;
    }
    return videoStreams[0];
}

function selectStreams(allFormats, x264only) {
    let adaptiveVideoFormats = allFormats.filter(f => f.quality_label !== undefined).map(f => {
        f.quality_label += f.fps === 60 ? '60' : '';
        return f;
    });
    let adaptiveAudioFormats = allFormats.filter(f => f.audio_sample_rate !== undefined);
    if (x264only) {
        adaptiveVideoFormats = adaptiveVideoFormats.filter(f => f.type.startsWith('video/mp4'));
        adaptiveAudioFormats = adaptiveAudioFormats.filter(f => f.type.startsWith('audio/mp4'));
    }
    return {
        video: adaptiveVideoFormats,
        audio: adaptiveAudioFormats
    };
}

module.exports = { fetchVideoInfo, fetchFullInfo };