const { fetchVideoInfo, fetchFullInfo } = require('./youtube-video');
const { fetchPlaylistInfo } = require('./youtube-playlist');

async function info(url) {
    const identifier = extractIdentifier(url);
    if (identifier.type === 'video')
        return [ await fetchVideoInfo(identifier.value) ];
    else if (identifier.type === 'playlist')
        return await fetchPlaylistInfo(identifier.value);
}

async function streams(id, qualityPreferences, x264only) {
    return await fetchFullInfo(id, qualityPreferences, x264only);
}


const videoIdRegex = /v=([a-zA-Z0-9_-]+)/;
const playlistIdRegex = /list=([^&]+)/;
function extractIdentifier(url) {
    let match = videoIdRegex.exec(url);
    if (match) return { value: match[1], type: 'video' };

    match = playlistIdRegex.exec(url);
    if (match) return { value: match[1], type: 'playlist' };

    throw new Error("Unable to find an ID in URL");
}

module.exports = { info, streams };