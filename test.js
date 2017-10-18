const blockchain = new (require("./latechain"))();
const network = require("./network");

async function test() {
  blockchain.addBlock(await blockchain.generateGenesisBlock());

  blockchain.addBlock(await blockchain.generateNextBlock("testi dataa"));
  blockchain.addBlock(await blockchain.generateNextBlock("testi dataa"));
  blockchain.addBlock(await blockchain.generateNextBlock("testi dataa"));

  blockchain.setDifficultyScore(20);

  blockchain.addBlock(await blockchain.generateNextBlock("testi dataa"));

  // blockchain.addBlock(await blockchain.generateNextBlock("testi dataa"));
  // blockchain.addBlock(
  //   await blockchain.generateNextBlock({ some: "object", data: "yes" })
  // );

  console.log(blockchain.chain);

  try {
    if (!blockchain.isValidChain(blockchain.chain)) {
      console.log("Chain is not valid!");
    }
  } catch (e) {
    console.error(e);
  }
}

// network.initHttpServer({ blockchain });
// network.initP2PServer();

test();
