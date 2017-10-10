const http = require("http");
const net = require("net");

const HTTP_PORT = process.env.HTTP_PORT || 3001;
const P2P_PORT = process.env.P2P_PORT || 6001;
const INITIAL_PEERS = process.env.PEERS ? process.env.PEERS.split(",") : [];

const SOCKETS = [];

const blockChain = new (require("./latechain"))();

async function test() {
  blockChain.addBlock(await blockChain.generateGenesisBlock());

  blockChain.addBlock(await blockChain.generateNextBlock("testi dataa"));
  blockChain.addBlock(await blockChain.generateNextBlock("testi dataa"));

  blockChain.setDifficultyScore(12);

  blockChain.addBlock(await blockChain.generateNextBlock("testi dataa"));
  blockChain.addBlock(
    await blockChain.generateNextBlock({ some: "object", data: "yes" })
  );

  console.log(blockChain.chain);
  try {
    if (!blockChain.isValidChain(blockChain.chain)) {
      console.log("Chain is not valid!");
    }
  } catch (e) {
    console.error(e);
  }
}

test();

const server = http.createServer(async (req, res) => {});
