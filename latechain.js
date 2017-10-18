const crypto = require("crypto");

const DEFAULT_GENESIS_DATA = "genesis block";
const DEFAULT_DIFFICULTY = 16;
const BYTE_LENGTH = 8;

function Module(
  difficultyScore = DEFAULT_DIFFICULTY,
  genesisData = DEFAULT_GENESIS_DATA
) {
  this.genesisData = genesisData;
  this.chain = [];
  this.setDifficultyScore(difficultyScore);
}

function Block(
  index,
  previousHash,
  timestamp,
  data,
  hash,
  difficultyScore,
  nonce
) {
  this.index = index;
  this.previousHash = previousHash;
  this.timestamp = timestamp;
  this.data = data;
  this.hash = hash;
  this.difficultyScore = difficultyScore;
  this.nonce = nonce;
}

function calculateHashForBlock(block) {
  return crypto
    .createHash("sha256")
    .update(block.index.toString())
    .update(block.previousHash.toString())
    .update(block.timestamp.toString())
    .update(block.data.toString())
    .update(block.difficultyScore.toString())
    .update(block.nonce.toString())
    .digest("hex");
}

function getLatestBlock(chain) {
  if (chain && chain.length > 0) {
    return chain[chain.length - 1];
  }
  return null;
}

function difficultyOfChain(chain) {
  return chain.reduce(
    (block, currentValue) => currentValue + block.difficultyScore,
    0
  );
}

function checkProofOfWork(proofOfWork, difficultyScore) {
  const neededMaskBytes = Math.ceil(difficultyScore / BYTE_LENGTH);
  const usePartialMask = difficultyScore % BYTE_LENGTH !== 0;
  const partialBitMask = parseInt(
    "1".repeat(difficultyScore % BYTE_LENGTH).padEnd(BYTE_LENGTH, "0"),
    2
  );

  return new Buffer(proofOfWork, "hex") // Convert hex digest into buffer
    .slice(0, neededMaskBytes) // Take only the needed bytes
    .every((byte, byteIdx, array) => {
      if (usePartialMask && byteIdx === array.length - 1) {
        return (byte & partialBitMask) === 0;
      }
      return byte === 0x00;
    });
}

function isValidNewBlock(newBlock, previousBlock) {
  if (previousBlock.index + 1 !== newBlock.index) {
    console.info("invalid index");
    return false;
  } else if (previousBlock.hash !== newBlock.previousHash) {
    console.info("invalid previoushash");
    return false;
  } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
    console.info("invalid hash");
    return false;
  } else if (!checkProofOfWork(newBlock.hash, newBlock.difficultyScore)) {
    console.info("invalid proof of work");
    return false;
  }

  return true;
}

Module.prototype.setDifficultyScore = function(newDifficultyScore) {
  this.difficultyScore = newDifficultyScore;
};

Module.prototype.generateNextBlock = async function(data) {
  const previousBlock = getLatestBlock(this.chain);
  const nextIndex = (previousBlock && previousBlock.index + 1) || 0;
  const previousHash = (previousBlock && previousBlock.hash) || 0;
  const nextTimestamp = Math.floor(new Date().getTime() / 1000);

  const newBlock = new Block(
    nextIndex,
    previousHash,
    nextTimestamp,
    data,
    null,
    this.difficultyScore,
    0
  );

  newBlock.hash = calculateHashForBlock(newBlock);
  while (!checkProofOfWork(newBlock.hash, newBlock.difficultyScore)) {
    newBlock.nonce++;
    newBlock.hash = calculateHashForBlock(newBlock);
  }

  return newBlock;
};

Module.prototype.isValidChain = function(chain) {
  return chain.every((block, index, array) => {
    if (index > 0) {
      return isValidNewBlock(block, array[index - 1]);
    } else {
      // Dealing with the genesis block
      return (
        block.index === 0 &&
        block.previousHash === 0 &&
        block.data === this.genesisData
      );
    }
  });
};

Module.prototype.generateGenesisBlock = function() {
  return this.generateNextBlock(this.genesisData);
};

Module.prototype.addBlock = function(block) {
  this.chain.push(block);
};

Module.prototype.replaceChain = function(newChain) {
  if (isValidChain(newChain) && newChain.length > this.chain.length) {
    console.info(
      "Received blockchain is valid. Replacing current blockchain with received blockchain"
    );
    this.chain = newChain;
  } else {
    console.info("Received blockchain invalid");
  }
};

module.exports = Module;
