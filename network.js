const http = require("http");
const net = require("net");

const HTTP_PORT = process.env.HTTP_PORT || 3001;
const P2P_PORT = process.env.P2P_PORT || 6001;
const INITIAL_PEERS = process.env.PEERS ? process.env.PEERS.split(",") : [];

const SOCKETS = [];

const MessageType = {
  QUERY_LATEST: 0,
  QUERY_ALL: 1,
  RESPONSE_BLOCKCHAIN: 2
};

function bodyParser(req) {
  return new Promise((resolve, reject) => {
    const body = [];
    req
      .on("data", chunk => {
        body.push(chunk);
      })
      .on("end", () => {
        resolve(Buffer.concat(body).toString());
      })
      .on("error", err => {
        reject(err);
      });
  });
}

function handleBlocksRequest(req, res, ctx) {
  Promise.all(ctx.blockchain.chain).then(chain => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(chain));
  });
}

async function handleMineBlockRequest(req, res, ctx) {
  const data = JSON.parse(await bodyParser(req));
  const newBlock = await ctx.blockchain.generateNextBlock(data);
  ctx.blockchain.addBlock(newBlock);
  console.log(`block added: ${JSON.stringify(newBlock, null, 2)}`);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(chain));
}

function createHttpRequestHandler(ctx) {
  return async (req, res) => {
    if (/^\/blocks\/?$/.test(req.url)) {
      handleBlocksRequest(req, res, ctx);
    } else if (/^\/mineblock\/?$/.test(req.url)) {
      handleMineBlockRequest(req, res, ctx);
    } else {
      res.statusCode = 401;
      res.end();
    }
  };
}

function createP2PConnectionHandler(ctx) {
  return async socket => {
    SOCKETS.push(socket);

    console.log("P2P client connected");

    socket.on("end", () => {
      console.log("P2P client disconnected");
    });

    socket.on("data", data => {
      try {
        const message = JSON.parse(data);
        console.log(
          `Received P2P message: ${JSON.stringify(message, null, 2)}`
        );
        switch (message.type) {
          case MessageType.QUERY_LATEST:
            break;
          case MessageType.QUERY_ALL:
            break;
          case MessageType.RESPONSE_BLOCKCHAIN:
            break;
          default:
            break;
        }
      } catch (e) {
        console.log("Received invalid P2P message");
      }
    });
  };
}

function initHttpServer(ctx) {
  http.createServer(createHttpRequestHandler(ctx)).listen(HTTP_PORT);
  console.log(`HTTP server listening on port: ${HTTP_PORT}`);
}

function initP2PServer(ctx) {
  net.createServer(createP2PConnectionHandler(ctx)).listen(P2P_PORT);
  console.log(`P2P server listening on port: ${P2P_PORT}`);
}

module.exports = {
  initHttpServer,
  initP2PServer
};
