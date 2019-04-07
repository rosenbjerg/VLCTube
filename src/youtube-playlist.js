const fetch = require('node-fetch');

const trRegex = /<tr.*?data-title="([^"]+)".*?data-video-id="([^"]+)".*?>/g;
async function fetchPlaylistInfo(id) {
    const url = `https://www.youtube.com/playlist?list=${id}`;
    const html = await fetch(url).then(response => response.text());
    const items = [];

    let match;
    while (match = trRegex.exec(html)) {
        items.push({ title: match[1], id: match[2] });
    }
    return items;
}


module.exports = { fetchPlaylistInfo };