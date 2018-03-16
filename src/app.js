import express from "express";
import bodyParser from "body-parser";
import rp from 'request-promise'

import cors from "./config/cors";

import { Blockchain, Transaction, Block } from "./blockchain";

const port = process.env.PORT || 5000;
const blockchain = express();

/* ---------- */
/* Middelware */
/* ---------- */
blockchain.use(bodyParser.json());
blockchain.use(bodyParser.urlencoded({ extended: true }));
blockchain.use(cors);

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
  codeCoin.createTransaction(
      new Transaction(req.body.fromAddress, req.body.toAddress, req.body.amount)
  );

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

const getBalance = (req, res) => {
    res.json({ balance: codeCoin.getBalanceOfAddress(req.params.address) })
}

blockchain.get("/blockchain", retrieveBlockchain);
blockchain.get("/blockchain/resolve", resolveBlockchain);
blockchain.get("/blockchain/print", printBlockchain);
blockchain.get("/blockchain/length", lengthBlockchain);

blockchain.get("/balances/:address", getBalance);

blockchain.get("/events/blockchain/update", updateBlockchain);

blockchain.post("/transactions", addTransaction);

blockchain.post("/mine", mine);

blockchain.route("/nodes")
    .post(registerNode)
    .get(retrieveNodes);

/* --------- */
/* Serve API */
/* --------- */
const instance = blockchain.listen(port, () => {
    codeCoin = new Blockchain(port);
    
    console.log(`Node listening on port ${port}!`);
});
