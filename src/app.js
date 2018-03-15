import express from "express";
import bodyParser from "body-parser";
import rp from 'request-promise'

import cors from "./config/cors";

const SHA256 = require("crypto-js/sha256");
const port = process.env.PORT || 5000;
const blockchain = express();

/* ---------- */
/* Middelware */
/* ---------- */
blockchain.use(bodyParser.json());
blockchain.use(bodyParser.urlencoded({ extended: true }));
blockchain.use(cors);

/* ------- */
/* Classes */
/* ------- */
class Transaction{
  constructor(fromAddress, toAddress, amount){
      this.fromAddress = fromAddress;
      this.toAddress = toAddress;
      this.amount = amount;
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
      this.previousHash = previousHash;
      this.timestamp = timestamp;
      this.transactions = transactions;
      this.hash = this.calculateHash();
      this.nonce = 0;
  }

  calculateHash() {
      return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  mineBlock(difficulty) {
      while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
          this.nonce++;
          this.hash = this.calculateHash();
      }

      console.log("BLOCK MINED: " + this.hash);
  }
}

class Blockchain{
  /**
   * @param {*} genesisNode URL on which you start the blockchain. Is set to port 4000 with global var.
   */
  constructor(genesisNode) {
      this.chain = [this.createGenesisBlock()];
      this.nodes = [+genesisNode]
      this.difficulty = 4;
      this.pendingTransactions = [];
      this.miningReward = 100;
  }

  registerNode(port) {
      if (!this.nodes.includes(port)) {
          this.nodes.push(port);

          // Implement gossiping to share info on new nodes constantly
          // To complex to implement here
      }
  }

  retrieveNodes() {
      return this.nodes;
  }

  updateBlockchain(newChain) {
      this.chain = newChain;
  }

  createGenesisBlock() {
      return new Block(Date.parse("2017-01-01"), [], "0");
  }

  getLatestBlock() {
      return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress){
      let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
      block.mineBlock(this.difficulty);

      console.log('Block successfully mined!');
      this.chain.push(block);

      this.pendingTransactions = [
          new Transaction(null, miningRewardAddress, this.miningReward)
      ];
  }

  createTransaction(transaction){
      this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address){
      let balance = 0;

      for(const block of this.chain){
          for(const trans of block.transactions){
              if(trans.fromAddress === address){
                  balance -= trans.amount;
              }

              if(trans.toAddress === address){
                  balance += trans.amount;
              }
          }
      }

      return balance;
  }

  isChainValid() {
      for (let i = 1; i < this.chain.length; i++){
          const currentBlock = this.chain[i];
          const previousBlock = this.chain[i - 1];

          if (currentBlock.hash !== currentBlock.calculateHash()) {
              return false;
          }

          if (currentBlock.previousHash !== previousBlock.hash) {
              return false;
          }
      }

      return true;
  }
}

/* ---------------- */
/* Global Variables */
/* ---------------- */
let codeCoin;

/* ------- */
/* Helpers */
/* ------- */
async function findLongestBlockchain() {
    let promiseArray = [];
    let newChain = [];

    codeCoin.nodes.map(node => {
        // Get length of each blockchain
        let promise = rp.get({
            uri: `http://localhost:${node}/blockchain/length`,
            json: true
        })

        promiseArray.push(promise);
    })

    let nodes = await Promise.all(promiseArray);
    
    let longestBlockchainNode = { chainLength: 0 };
    
    // Find node which holds longest chain
    nodes.map(node => {
        if (longestBlockchainNode.chainLength < node.chainLength) longestBlockchainNode = node;
    });

    let longestChain = await rp.get({
        uri: `http://localhost:${+longestBlockchainNode.port}/blockchain`,
        json: true
    });

    codeCoin.updateBlockchain(longestChain.chain);
}

/* --------------- */
/* REST API Routes */
/* --------------- */

/**
 * Add new transaction to blockchain.
 * @param {string} fromAddress 
 * @param {string} toAddress
 * @param {int} amount
 */
const addTransaction = (req, res) => {
  codeCoin.createTransaction(new Transaction(req.body.fromAddress, req.body.toAddress, req.body.amount));

  res.send("Transaction added to pending transactions.");
};

/**
 * Mine pending transactions and create new transaction for mining reward.
 * @param {string} rewardAddress
 */
const mine = async (req, res) => {
    codeCoin.minePendingTransactions(req.body.rewardAddress);

    // Notify other blockchains a new block is added
    let promiseArray = [];

    codeCoin.nodes.map(node => {
        let promise = rp.get({
            uri: `http://localhost:${node}/events/blockchain/update`,
            json: true
        });

        promiseArray.push(promise);
    })

    await Promise.all(promiseArray);

    res.send("Mining finished. Reward Transaction created.");
};

const printBlockchain = (req, res) => {
  const stringifiedChain = JSON.stringify(codeCoin.chain);
  res.send(stringifiedChain);
};

/**
 * Mine pending transactions and create new transaction for mining reward.
 * @param {int} port Port to start new blockchain node on.
 */
const registerNode = (req, res) => {
  codeCoin.registerNode(req.body.port);
  res.send("Node added!");
};

// If length of blockchain is larger as one -> it is a valid node
const lengthBlockchain = (req, res) => {
    res.json({chainLength: codeCoin.chain.length, port});
}

const retrieveBlockchain = (req, res) => {
    res.json({chain: codeCoin.chain});
}

const retrieveNodes = (req, res) => {
    res.json({nodes: codeCoin.retrieveNodes()});
}

const resolveBlockchain = (req, res) => {
    findLongestBlockchain();
    
    res.json({message: "Success!"});
}

const updateBlockchain = (req, res) => {
    findLongestBlockchain();

    res.json({message: "Success!"});
}

blockchain.get("/blockchain", retrieveBlockchain);
blockchain.get("/blockchain/resolve", resolveBlockchain);
blockchain.get("/blockchain/print", printBlockchain);
blockchain.get("/blockchain/length", lengthBlockchain);
blockchain.get("/events/blockchain/update", updateBlockchain);
blockchain.post("/transactions", addTransaction);
blockchain.post("/mine", mine);
blockchain
    .route("/nodes")
        .post(registerNode)
        .get(retrieveNodes);

/* --------- */
/* Serve API */
/* --------- */
const instance = blockchain.listen(port, () => {
    codeCoin = new Blockchain(port);
    
    console.log(`Node listening on port ${port}!`);
});
