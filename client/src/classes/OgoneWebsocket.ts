import * as Websocket from 'ws';

export default abstract class OgoneWebsocket {
  public static server: Websocket.Server = new Websocket.Server({
    port: 3441,
  });
  public static ws?: Websocket;
  static startConnection() {
    console.warn('trying to start a connection')
    OgoneWebsocket.server.on('connection', (ws) => {
      console.warn('connected !!!!')
      OgoneWebsocket.ws = ws;
    })
  }
}
