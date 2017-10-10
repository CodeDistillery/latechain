const http = require("http");
// const net = require("net");

const HTTP_PORT = process.env.HTTP_PORT || 3001;
// const P2P_PORT = process.env.P2P_PORT || 6001;
// const INITIAL_PEERS = process.env.PEERS ? process.env.PEERS.split(",") : [];

// const SOCKETS = [];

function handleBlocksRequest(req, res, ctx) {
  Promise.all(ctx.blockchain.chain).then(chain => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(chain));
  });
}

function createRequestHandler(blockchain) {
  return async (req, res) => {
    if (/^\/blocks\/?$/.test(req.url))
      handleBlocksRequest(req, res, { blockchain });
  };
}

function initServer(blockchain) {
  const server = http.createServer(createRequestHandler(blockchain));
  server.listen(HTTP_PORT);
  console.log(`HTTP server listening on port: ${HTTP_PORT}`);
}

module.exports = {
  initServer
};
