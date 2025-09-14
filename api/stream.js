const express = require('express');
const router = express.Router();
const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_path = require('ffmpeg-static');
const ytdl = require('@distube/ytdl-core');

router.get('/song/:videoId', (req, res) => {
    res.setHeader('Content-Type', 'audio/mpeg');

    try {
        const stream = ytdl(req.params.videoId, { quality: 'highestaudio' });

        // ✅ Catch errors from ytdl
        stream.on('error', err => {
            console.error('YTDL Error:', err.message);
            return res.status(400).json({ error: 'Video not available for download' });
        });

        const proc = ffmpeg({ source: stream })
            .setFfmpegPath(ffmpeg_path)
            .toFormat('mp3')
            // ✅ Catch ffmpeg errors
            .on('error', err => {
                console.error('FFmpeg Error:', err.message);
                return res.status(500).json({ error: 'Audio processing failed' });
            });

        // Pipe processed audio to client
        proc.pipe(res);

    } catch (err) {
        console.error('Route Error:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
