const { app, Menu, Tray, nativeImage } = require('electron');
const { platform } = require('os');
const { info, streams } = require('./youtube-api');
const path = require('path');
const clipboardy = require('clipboardy');
const { spawn } = require('child_process');
const pkg = require('../package.json');

const queue = [];

const qualities = [
    '2160p60',
    '2160',
    '1440p60',
    '1440p',
    '1080p60',
    '1080p',
    '720p60',
    '720p',
    '480p'
];
let qualityPreference = '1080p60';
const setQualityPreference = pref => () => qualityPreference = pref;

let x264only = true;
let playing = null;


let tray = null;
app.on('ready', () => {
    const icon = platform() === 'win32' ? 'vlctube.ico' : 'vlctube.png';
    const iconImage = nativeImage.createFromPath(path.join(__dirname, '..', 'assets', icon));
    tray = new Tray(iconImage);
    tray.setIgnoreDoubleClickEvents(true);
    tray.on('click', tray.popUpContextMenu);
    tray.setToolTip('VLCTube');
    tray.setContextMenu(buildMenu());
});
function updateInterface() {
    let tooltip = 'VLCTube' + (queue.length > 0 ? ` - ${queue.length} in queue` : '');
    if (playing) tooltip = `${formatInfo(playing)} - ${tooltip}`;
    tray.setToolTip(tooltip);
    tray.setContextMenu(buildMenu());
}
function buildMenu() {
    return Menu.buildFromTemplate([
        { label: 'Play from clipboard', click: playFromClipboard  },
        { label: 'Enqueue from clipboard', click: enqueueFromClipboard },
        { label: `${queue.length} in queue`, enabled: queue.length !== 0, submenu: queue.map((info, i) => ({ label: info.title, click: onQueueItemClicked(i) })) },
        { label: 'Preferred quality', submenu: qualities.map(q => ({ label: q, type: 'radio', checked: q === qualityPreference, click: setQualityPreference(q) })) },
        { label: 'Only play x264 streams', type: 'checkbox', checked: x264only, click: () => x264only = !x264only },
        { label: `VLCTube v. ${pkg.version}`, enabled: false },
        { label: 'Quit', role: 'quit' }
    ]);
}
function formatInfo(info) {
    return `${info.channel}: ${info.title} (${info.video.quality_label})`;
}

function onQueueItemClicked(index) {
    return () => {
        queue.splice(0, index);
        if (playing && playing.vlc) playing.vlc.kill();
        else start(queue.shift())
    };
}
function onVlcExited() {
    start(queue.shift());
}


async function start(info) {
    if (info) {
        const qualityPreferences = qualities.slice(qualities.indexOf(qualityPreference));
        playing = await streams(info.id, qualityPreferences, x264only);
        startVlc(playing);
    }
    else playing = null;
    updateInterface();
}

async function playFromClipboard() {
    const url = await clipboardy.read();
    const videoInfos = await info(url);
    queue.unshift(videoInfos[0]);
    if (playing && playing.vlc) playing.vlc.kill();
    else start(queue.shift());
}

async function enqueueFromClipboard() {
    const url = await clipboardy.read();
    const videoInfos = await info(url);
    const wasEmpty = queue.length === 0;
    queue.push(...videoInfos);
    if (!playing && wasEmpty) start(queue.shift());
    else updateInterface();
}

function startVlc(info) {
    const vlc = info.vlc = spawn('vlc', [
        '--play-and-exit', '--embedded-video', '--fullscreen', '--one-instance',
        '--no-qt-name-in-title', '--no-video-title-show',
        `--input-slave=${info.audio.url}`, info.video.url
    ]);
    vlc.on('close', onVlcExited);
}