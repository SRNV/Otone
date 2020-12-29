import * as Websocket from 'ws';

export default abstract class OgoneWebsocket {
  public static server: Websocket.Server = new Websocket.Server({
    port: 3441,
  });
  public static ws?: Websocket;
  static startConnection() {
    OgoneWebsocket.server.on('connection', (ws) => {
      OgoneWebsocket.ws = ws;
    })
  }
}
