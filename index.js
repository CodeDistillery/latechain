const http = require("http");
const net = require("net");

const chainModule = new (require("./latechain"))();

const HTTP_PORT = process.env.HTTP_PORT || 3001;
const P2P_PORT = process.env.P2P_PORT || 6001;
const INITIAL_PEERS = process.env.PEERS ? process.env.PEERS.split(",") : [];

const SOCKETS = [];

chainModule.addBlock(chainModule.generateGenesisBlock());
chainModule.addBlock(chainModule.generateNextBlock("testi dataa"));
chainModule.addBlock(chainModule.generateNextBlock("testi dataa"));
chainModule.setDifficultyScore(12);
chainModule.addBlock(chainModule.generateNextBlock("testi dataa"));
chainModule.addBlock(
  chainModule.generateNextBlock({ some: "object", data: "yes" })
);

console.log(chainModule.chain);

try {
  if (!chainModule.isValidChain(chainModule.chain)) {
    console.log("Chain is not valid!");
  }
} catch (e) {
  console.error(e);
}

const server = http.createServer(async (req, res) => {});
