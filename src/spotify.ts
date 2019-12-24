import axios from 'axios';
import Store from './store';
import { Request, Response /* , NextFunction*/ } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUrl = process.env.SPOTIFY_REDIRECT_URL || '';

const store = new Store();

export const spotifyInit = (): void => {
  store.updateBearerToken();
  store.updateAccessToken();
  setInterval(() => {
    store.updateBearerToken();
    store.updateAccessToken();
  }, 1000 * 60 * 55);
};

export const getSpotify = (
  req: Request<ParamsDictionary>,
  res: Response
  // next: NextFunction
): void => {
  const scopes = 'user-read-currently-playing';
  res.redirect(
    'https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' +
      clientId +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' +
      encodeURIComponent(redirectUrl)
  );
};

export const getSpotifyCallback = (
  req: Request<ParamsDictionary>,
  res: Response
  // next: NextFunction
): void => {
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', req.query.code);
  params.append('redirect_uri', redirectUrl);
  axios
    .post('https://accounts.spotify.com/api/token', params, {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
    })
    .then((res) => {
      const {
        access_token: accessToken,
        refresh_token: refreshToken,
      } = res.data as { access_token: string; refresh_token: string };
      store.setAccessToken(accessToken);
      store.setRefreshToken(refreshToken);
    })
    .catch((e) => {
      console.log(e.response.data);
    });
  res.status(200).send('ok');
};

export const getCurrentPlaying = (): Promise<{
  isPlaying: boolean;
  name?: string;
  previewUrl?: string;
  artists?: {
    external_urls: {
      spotify: string;
    };
    name: string;
  }[];
  album?: { external_urls: { spotify: string } };
}> =>
  new Promise<{
    isPlaying: boolean;
    name?: string;
    previewUrl?: string;
    artists?: {
      external_urls: {
        spotify: string;
      };
      name: string;
    }[];
    album?: { external_urls: { spotify: string } };
  }>((resolve) => {
    axios
      .get('https://api.spotify.com/v1/me/player/currently-playing', {
        timeout: 1000,
        headers: {
          Authorization: `Bearer ${store.accessToken}`,
        },
      })
      .then((res) => {
        if (res.data.is_playing) {
          resolve({
            isPlaying: true,
            name: res.data.item.name,
            previewUrl: res.data.item.preview_url,
            artists: res.data.item.artists,
            album: res.data.item.album,
          });
        }
        resolve({
          isPlaying: res.data.isPlaying,
        });
      })
      .catch((e) => {
        console.log(e.response.data);
      });
  });
