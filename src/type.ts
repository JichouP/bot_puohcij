export declare namespace traQ {
  type Event =
    | 'PING'
    | 'JOINED'
    | 'LEFT'
    | 'MESSAGE_CREATED'
    | 'DIRECT_MESSAGE_CREATED'
    | 'CHANNEL_CREATED'
    | 'CHANNEL_TOPIC_CHANGED'
    | 'USER_CREATED'
    | 'STAMP_CREATED';
  interface Headers {
    'x-traq-bot-event': Event;
    'x-traq-bot-request-id': string;
    'x-traq-bot-token': string;
  }
}
