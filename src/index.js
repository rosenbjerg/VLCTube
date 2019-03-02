"use strict";

const { app, Menu, Tray } = require('electron');
const { platform } = require('os');
const { playVideo, extractId } = require('./play');
const clipboardy = require('clipboardy');
const pkg = require('../package.json');

let tray = null;
app.on('ready', () => {
    tray = new Tray(platform() === 'win32' ? 'assets/vlctube.ico' : 'assets/vlctube.png');
    tray.setIgnoreDoubleClickEvents(true);
    tray.on('click', tray.popUpContextMenu);

    const contextMenu = Menu.buildFromTemplate([
        {label: 'Play from clipboard', click: playFromClipboard },
        {label: 'Enqueue from clipboard', click: enqueueFromClipboard},
        {label: `VLCTube v. ${pkg.version}`, enabled: false},
        {label: 'Quit', role: 'quit'}
    ]);
    tray.setToolTip('VLCTube');
    tray.setContextMenu(contextMenu);
})



const qualityPreferences = ['1080p60', '1080p', '720p60', '720p'];

const queue = [];
let playing = null;

const play = async url => {
    try {
        if (playing && playing.childProcess) playing.childProcess.kill();
        playing = await playVideo(url, qualityPreferences, playNext);
        tray.setToolTip(playing.current + ' - VLCTube');
    }
    catch (e) {
        console.log(e.message);
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


