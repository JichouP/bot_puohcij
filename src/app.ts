import express from 'express';
import { traQ } from './type';
import dotenv from 'dotenv';
import {
  getCurrentPlaying,
  getSpotify,
  getSpotifyCallback,
  spotifyInit,
} from './spotify';
import { postMessage, putTopic } from './traq';

dotenv.config();

const app = express();
const router = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/traq', router);

router.post('/', async (req, res, next) => {
  switch (req.headers['x-traq-bot-event'] as traQ.Event) {
    case 'PING':
      res.status(204).send();
      next();
      break;
    case 'JOINED':
      res.status(204).send();
      next();
      break;
    case 'LEFT':
      res.status(204).send();
      next();
      break;
    case 'MESSAGE_CREATED':
      if (req.body.message.text === 'np') {
        const {
          isPlaying,
          name,
          previewUrl,
          artists,
          album,
        } = await getCurrentPlaying();
        if (isPlaying) {
          if (album) {
            postMessage(
              `『[${name}](${album.external_urls.spotify})${artists &&
                artists.length &&
                ` ― [${artists.map((v) => v.name).join(', ')}](${
                  artists[0].external_urls.spotify
                })`}』を再生しています．\n[視聴する](${previewUrl})`
            );
          } else {
            postMessage(
              `『${name}${artists &&
                artists.length &&
                ` ― [${artists.map((v) => v.name).join(', ')}](${
                  artists[0].external_urls.spotify
                })`}』を再生しています．\n[視聴する](${previewUrl})`
            );
          }
        } else {
          postMessage(`再生中の音楽はありません．`);
        }
      }
      res.status(204).send();
      next();
      break;
    default:
      res.status(400).send();
      break;
  }
});

router.get('/spotify', getSpotify);
router.get('/spotify/callback', getSpotifyCallback);

let nowPlaying: string;

const tick = async (): Promise<void> => {
  const { isPlaying, name, artists } = await getCurrentPlaying();
  if (isPlaying) {
    if (nowPlaying !== name) {
      nowPlaying = String(name);
      putTopic(
        `『${name}${artists &&
          artists.length &&
          ` ― ${artists.map((v) => v.name).join(', ')}`}』を再生中`
      );
    }
  } else {
    if (nowPlaying !== '') {
      nowPlaying = '';
      putTopic(`再生中の音楽はありません．`);
    }
  }
};

const init = async (): Promise<void> => {
  app.listen(parseInt(process.env.EXPRESS_PORT || '3000'), () => {
    spotifyInit();
    setInterval(tick, 10000);
    console.log(`listening on port ${process.env.EXPRESS_PORT || '3000'}`);
  });
};

init();
