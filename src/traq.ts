import axios from 'axios';
const channelId = process.env.BOT_CHANNEL_ID || '';
const botAccessToken = process.env.BOT_ACCESS_TOKEN || '';

const client = axios.create({
  baseURL: 'https://q.trap.jp/api/1.0',
  timeout: 1000,
  headers: { Authorization: `Bearer ${botAccessToken}` },
});

export const getMyChannel = () => {
  client
    .get('/channels')
    .then((res) => {
      console.log(res.data.filter((v: any) => v.name === 'JichouP'));
    })
    .catch((e) => console.log(e));
};

export const postMessage = (text: string) => {
  client.post(`/channels/${channelId}/messages?embed=1`, { text });
};

export const postStamp = (stamp: string) => {
  client.post('');
};

export const putTopic = (text: string) => {
  client.put(`/channels/${channelId}/topic`, { text });
};
