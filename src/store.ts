import { exec } from 'child_process';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const userId = process.env.SPOTIFY_USER_ID;
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

export default class Store {
  sporifyBearerToken: string | null = null;
  updateBearerToken = () => {
    exec(
      'curl -X "POST" -H "Authorization: Basic ZWM5OWVmOTM0NTg2NGNmN2FhZGY3YmY1NWZlMjMwYmU6NDljMDEwODA3ODJmNDU5ZWI4NTQ0OGI1MGI0NzFmY2Q=" -d grant_type=client_credentials https://accounts.spotify.com/api/token',
      (err, stdout, stderr) => {
        this.sporifyBearerToken = JSON.parse(stdout).access_token;
      }
    );
  };
  refreshToken: string = refreshToken!;
  setRefreshToken = (token: string) => {
    this.refreshToken = token;
  };
  accessToken: string | null = null;
  setAccessToken = (token: string) => {
    this.accessToken = token;
  };
  updateAccessToken = () => {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', this.refreshToken);
    axios
      .post('https://accounts.spotify.com/api/token', params, {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        },
      })
      .then((res) => {
        this.setAccessToken(res.data.access_token);
      })
      .catch((e) => {
        console.log(e.response.data);
      });
  };
}
