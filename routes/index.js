const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const EC = require("elliptic");
const ec = new EC.ec("secp256k1");

const db = require("../utils/db");
const Wallet = require('../models/wallet.model.js');
const Transaction = require('../models/transaction.model.js');



router.post("/create-wallet", (req, res) => {
  const newWallet = new Wallet();
  const privateKey = newWallet.getPrivateKey();
  const publicKey = newWallet.getPublicKey();
  db.get("wallets").push({ address: publicKey, balance: newWallet.balance }).write();
  return res.json({ privateKey, address: publicKey });
});

router.post("/access-wallet", async (req, res) => {
  const myCoin = req.app.locals.myCoin;
  const privateKey = req.body.privateKey;
  const keyPair = ec.keyFromPrivate(privateKey);
  const publicKey = keyPair.getPublic("hex");

  const wallet = await db.get("wallets").find({ address: publicKey }).value();
  if (!wallet || !wallet.address) {
    return res.json({ status: false});
  }

  const balance = myCoin.getBalanceOfAddress(publicKey)
  wallet.balance = balance;

  return res.json({ status: true, wallet });
});

router.get("/balance", async (req, res) => {
  const myCoin = req.app.locals.myCoin;
  const publicKey = req.query.wallet;

  const balance = myCoin.getBalanceOfAddress(publicKey)

  return res.json({ status: true, balance });
});

router.post("/send", async (req, res) => {
  const myCoin = req.app.locals.myCoin;
  const privateKey = req.body.privateKey;
  const toAddress = req.body.toAddress;
  const amount = req.body.amount;

  const keyPair = ec.keyFromPrivate(privateKey);
  const fromAddress = keyPair.getPublic("hex");
  const balance = myCoin.getBalanceOfAddress(fromAddress);
  if(amount < 0 || amount > balance){
    return res.json({ status: false, msg: "Amount invalid." });
  }

  const tx = new Transaction(fromAddress, toAddress, amount)
  tx.signTransaction(keyPair);
  if(!myCoin.addTransaction(tx))
    return res.json({ status: false, msg: "Invalid." });

  return res.json({ status: true, txid: tx.txHash });
});

router.get("/transactions", async (req, res) => {
  const myCoin = req.app.locals.myCoin;
  const wallet = req.query.wallet;
  const transactions = myCoin.getTransactionsOfAddress(wallet);
  return res.json({ transactions });
});

router.get("/pending-transactions", async (req, res) => {
  const myCoin = req.app.locals.myCoin;
  const wallet = req.query.wallet;
  const transactions = myCoin.getPendingTransactionsOfAddress(wallet);
  return res.json({ transactions });
});

router.post("/mining", async (req, res) => {
  const myCoin = req.app.locals.myCoin;
  const rewardWallet = req.body.wallet;
  myCoin.minePendingTransactions(rewardWallet);
  return res.json({ status: true });
});

router.get("/blocks", async (req, res) => {
  const myCoin = req.app.locals.myCoin;
  const all = myCoin.getAllBlock();
  return res.json({ all });
});


module.exports = router;
