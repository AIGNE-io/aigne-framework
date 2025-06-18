import { WsServer } from "@arcblock/ws";

const logger = console;

logger.debug = () => null;

function createWebsocketServer() {
  const wsServer = new WsServer({
    logger,
    pathname: "/websocket",
  });

  return wsServer;
}

export default createWebsocketServer();
