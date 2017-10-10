const crypto = require("crypto");

const DIFFICULTY_SCORE = 8;

const BYTE_LENGTH = 8;
const NEEDED_MASK_BYTES = Math.ceil(DIFFICULTY_SCORE / BYTE_LENGTH);
const USE_PARTIAL_MASK = DIFFICULTY_SCORE % BYTE_LENGTH !== 0;
const PARTIAL_BIT_MASK = parseInt(
  "1".repeat(DIFFICULTY_SCORE % BYTE_LENGTH).padEnd(BYTE_LENGTH, "0"),
  2
);

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

function generateNextBlock(data) {
  const previousBlock = getLatestBlock();
  const nextIndex = (previousBlock && previousBlock.index + 1) || 0;
  const previousHash = (previousBlock && previousBlock.hash) || 0;
  const nextTimestamp = Math.floor(new Date().getTime() / 1000);
  const nextHash = calculateHash(
    nextIndex,
    previousHash,
    nextTimestamp,
    data,
    DIFFICULTY_SCORE
  );
  const proofOfWork = generateProofOfWork(nextHash, DIFFICULTY_SCORE);
  return new Block(
    nextIndex,
    previousHash,
    nextTimestamp,
    data,
    nextHash,
    DIFFICULTY_SCORE,
    proofOfWork
  );
}

function generateProofOfWork(challenge, difficultyScore) {
  console.info("Generating proofOfWork...");
  let challengeLength = Buffer.byteLength(challenge, "hex");
  let proofOfWork;
  let i = 0;
  do {
    i++;
    proofOfWork = crypto.randomBytes(challengeLength).toString("hex");
  } while (!checkProofOfWork(challenge, proofOfWork, difficultyScore));
  console.info(`Found proper proof on iteration ${i}`);
  return proofOfWork;
}

function checkProofOfWork(challenge, proofOfWork, difficultyScore) {
  return crypto
    .createHash("sha256")
    .update(challenge)
    .update(proofOfWork)
    .digest()
    .slice(0, NEEDED_MASK_BYTES) // Take only the needed bytes
    .every((byte, byteIdx, array) => {
      if (USE_PARTIAL_MASK && byteIdx === array.length - 1) {
        return (byte & PARTIAL_BIT_MASK) === 0;
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
      !checkProofOfWork(hash, newBlock.proofOfWork, newBlock.difficultyScore)
    ) {
      console.info("invalid proof of work");
      return false;
    }
  }
  return true;
}

function isValidChain(chain) {
  return chain.every((block, index, array) => {
    if (index > 0) {
      return isValidNewBlock(block, array[index - 1]);
    } else {
      // Dealing with the genesis block
      // TODO: How?
      return true;
    }
  });
}

function difficultyOfChain(chain) {
  return chain.reduce(
    (block, currentValue) => currentValue + block.difficultyScore,
    0
  );
}

function getLatestBlock() {
  return blockChain[blockChain.length - 1];
}

function getGenesisBlock() {
  return new Block(
    0,
    "0",
    1465154705,
    "my genesis block!!",
    "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7",
    0,
    ""
  );
}

var blockChain = [getGenesisBlock()];

function replaceChain(newChain) {
  if (isValidChain(newChain) && newChain.length > blockChain.length) {
    console.info(
      "Received blockchain is valid. Replacing current blockchain with received blockchain"
    );
    blockchain = newBlocks;
  } else {
    console.info("Received blockchain invalid");
  }
}

blockChain.push(generateNextBlock("kikkelis kokkelis"));
blockChain.push(generateNextBlock("kikkelis kokkelis"));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));
blockChain.push(generateNextBlock({ some: "acculi", data: "yes" }));

console.log(blockChain);

// try {
//   console.log(isValidChain(blockChain));
// } catch (e) {
//   console.error(e);
// }
