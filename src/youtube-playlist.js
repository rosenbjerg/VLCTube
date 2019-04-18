const got = require('got');

const trRegex = /<tr.*?data-title="([^"]+)".*?data-video-id="([^"]+)".*?>/g;
async function fetchPlaylistInfo(id) {
    const url = `https://www.youtube.com/playlist?list=${id}`;
    const response = await got(url);
    const html = response.body;
    const items = [];

    let match;
    while (match = trRegex.exec(html)) {
        items.push({ title: match[1].replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec)), id: match[2] });
    }
    return items;
}


module.exports = { fetchPlaylistInfo };