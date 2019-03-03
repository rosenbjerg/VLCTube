# VLCTube

### A tray-icon app to launch YouTube videos, from a url, in VLC media player

The app is a simple tray-icon daemon that you can use to quickly open a YouTube video in VLC media player, in high quality.

- Can use all the quality options available for a YouTube video, not just 720p as VLC directly supports opening
- Support for enqueueing videos that will automatically start when VLC closes from the previous video ending
- Defaults to use the x264 streams, instead of AV1/VP9, for improved hardware decoding support
  - Uses much less CPU than the player on youtube.com on devices without AV1/VP9 hardware support, of which there are many(!) 
  - Defaults to 1080p60 streams, since it is the highest quality that x264 streams are available in, on YouTube
- Uses the get_video_info API to get the adaptive stream formats
- Support for setting a preferred quality, so you can set it to select the 720p60 stream even though a 1080p60 stream is also available (maximum wanted quality)

## Installation
- Clone this repository and navigate inside the VLCTube directory
- Run `yarn install` or `npm install` to install dependencies
- Run `yarn start` or `npm start` to open the Electron tray-app

## Usage
- Click on the tray icon to open the menu
  - `Play from clipboard` grabs the URL from the clipboard and plays it immediately
  - `Enqueue from clipboard` grabs the URL from the clipboard and adds it to the queue. Automatically starts playback when a video is enqueued to an empty queue and nothing is playing
  - `Preferred quality` opens a submenu where you can set the preferred quality
  - `Only play x264 streams` toggles whether to only play x264 streams or also include the AV1/VP9 streams