import * as Websocket from 'ws';

export default abstract class OgoneWebsocket {
  public static server: Websocket.Server = new Websocket.Server({
    port: 3444,
  });
  public static errorServer: Websocket.Server = new Websocket.Server({
    port: 3441,
  });
}
