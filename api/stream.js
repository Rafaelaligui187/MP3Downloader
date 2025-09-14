const express = require('express');
const router = express.Router();
const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_path = require('ffmpeg-static');
const ytdl = require('@distube/ytdl-core');

router.get('/song/:videoId', (req, res) => {
    res.setHeader('Content-Type', 'audio/mpeg');

    let stream = ytdl(req.params.videoId, {
        quality: 'highestaudio',
        requestOptions: {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.youtube.com/'
            }
        }
    });

    // Handle ytdl errors (like 403 bot check)
    stream.on('error', err => {
        console.error('YTDL Error:', err.message);
        return res.status(400).json({ error: 'YouTube blocked the request or video is unavailable' });
    });

    let proc = ffmpeg({ source: stream })
        .setFfmpegPath(ffmpeg_path)
        .toFormat('mp3');

    let songStream = proc.pipe();

    // Handle ffmpeg errors
    proc.on('error', err => {
        console.error('FFmpeg Error:', err.message);
        return res.status(500).json({ error: 'Error processing audio stream' });
    });

    songStream.pipe(res); // Stream to client
});

module.exports = router;
