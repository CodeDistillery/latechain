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
  proofOfWork
) {
  this.index = index;
  this.previousHash = previousHash;
  this.timestamp = timestamp;
  this.data = data;
  this.hash = hash;
  this.difficultyScore = difficultyScore;
  this.proofOfWork = proofOfWork;
}

function calculateHash(index, previousHash, timestamp, data, difficultyScore) {
  return crypto
    .createHash("sha256")
    .update(index.toString())
    .update(previousHash.toString())
    .update(timestamp.toString())
    .update(data.toString())
    .update(difficultyScore.toString())
    .digest("hex");
}

function calculateHashForBlock(block) {
  return calculateHash(
    block.index,
    block.previousHash,
    block.timestamp,
    block.data,
    block.difficultyScore
  );
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

function checkProofOfWork(challenge, proofOfWork, difficultyScore) {
  const neededMaskBytes = Math.ceil(difficultyScore / BYTE_LENGTH);
  const usePartialMask = difficultyScore % BYTE_LENGTH !== 0;
  const partialBitMask = parseInt(
    "1".repeat(difficultyScore % BYTE_LENGTH).padEnd(BYTE_LENGTH, "0"),
    2
  );

  return crypto
    .createHash("sha256")
    .update(challenge)
    .update(proofOfWork)
    .digest()
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
  } else {
    const hash = calculateHashForBlock(newBlock);
    if (hash !== newBlock.hash) {
      console.info("invalid hash");
      return false;
    } else if (
      !checkProofOfWork(
        newBlock.hash,
        newBlock.proofOfWork,
        newBlock.difficultyScore
      )
    ) {
      console.info("invalid proof of work");
      return false;
    }
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
  const nextHash = calculateHash(
    nextIndex,
    previousHash,
    nextTimestamp,
    data,
    this.difficultyScore
  );

  return new Block(
    nextIndex,
    previousHash,
    nextTimestamp,
    data,
    nextHash,
    this.difficultyScore,
    await this.generateProofOfWork(nextHash)
  );
};

Module.prototype.generateProofOfWork = function(challenge) {
  const difficultyScore = this.difficultyScore;
  const challengeLength = Buffer.byteLength(challenge, "hex");
  let proofOfWork;
  let i = 0;

  return new Promise(resolve => {
    console.info(
      `Generating proofOfWork with difficulty of ${difficultyScore}`
    );
    do {
      i++;
      proofOfWork = crypto.randomBytes(challengeLength).toString("hex");
    } while (!checkProofOfWork(challenge, proofOfWork, difficultyScore));
    console.info(`Found proper proof on iteration ${i}`);
    resolve(proofOfWork);
  });
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
