"use strict";

const { app, Menu, Tray } = require('electron');
const { platform } = require('os');
const { playVideo, extractId } = require('./play');
const clipboardy = require('clipboardy');
const pkg = require('../package.json');

const queue = [];
let playing = null;

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
let qualityPreferrence = '1080p60';
let x264only = true;

let tray = null;
app.on('ready', () => {
    tray = new Tray(platform() === 'win32' ? 'assets/vlctube.ico' : 'assets/vlctube.png');
    tray.setIgnoreDoubleClickEvents(true);
    tray.on('click', tray.popUpContextMenu);

    const contextMenu = Menu.buildFromTemplate([
        {label: 'Play from clipboard', click: playFromClipboard },
        {label: 'Enqueue from clipboard', click: enqueueFromClipboard},
        {label: 'Preferred quality', submenu: qualities.map(q => ({label: q, type: 'radio', checked: q === qualityPreferrence, click: () => qualityPreferrence = q}))},
        {label: 'Only play x264 streams', type: 'checkbox', checked: x264only, click: () => (x264only = !x264only)},
        {label: `VLCTube v. ${pkg.version}`, enabled: false},
        {label: 'Quit', role: 'quit'}
    ]);
    tray.setToolTip('VLCTube');
    tray.setContextMenu(contextMenu);
})




const play = async url => {
    try {
        if (playing && playing.childProcess) playing.childProcess.kill();
        const qualityPrefs = qualities.slice(qualities.indexOf(qualityPreferrence));
        playing = await playVideo(url, qualityPrefs, x264only, playNext);
        const queueString = queue.length > 0 ? ' - ' + queue.length + ' in queue' : '';
        tray.setToolTip(playing.current + ' - VLCTube' + queueString);
    }
    catch (e) {
        console.log(e.message);
        playNext();
    }
}


async function playFromClipboard() {
    play(await clipboardy.read());
}

async function enqueueFromClipboard() {
    try {
        const url = await clipboardy.read();
        extractId(url);
        queue.push(url);
        if (!playing && queue.length === 1) playNext();
    }
    catch (e) {
        console.log(e.message);
    }
}

function playNext() {
    if (queue.length > 0) play(queue.pop());
    else {
        playing = null;
        tray.setToolTip('VLCTube');
    }
}

let arg = process.argv.filter(a => a.includes('.youtube.'));
if (arg.length !== 0) play(arg[0]);