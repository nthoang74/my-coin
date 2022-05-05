const Block = require("./block.model");
const Transaction = require("./transaction.model");


class Chain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 50;
    }

    createGenesisBlock() {
        return new Block(0, Date.parse("2017-01-01"), [], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) {
        if(!transaction.fromAddress || !transaction.toAddress || !transaction.isValid()){
            return false;
        }

        this.pendingTransactions.push(transaction);
        return true;
    }

    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }
    getBalanceOfAddress(address){
        let balance = 100;

        for(let i = 0; i < this.chain.length; i++){
            const transactions = this.chain[i].transactions;
            for(let j = 0; j < transactions.length; j++){

                if(transactions[j].fromAddress === address){
                    balance -= transactions[j].amount;
                }

                if(transactions[j].toAddress === address){
                    balance += transactions[j].amount;
                }
            }
        }
        return balance;
    }

    getTransactionsOfAddress(address){
        let transactionsRes = [];

        for(let i = 0; i < this.chain.length; i++){
            const transactions = this.chain[i].transactions;
            for(let j = 0; j < transactions.length; j++){

                if(transactions[j].fromAddress === address){
                    transactionsRes.push(transactions[j]);
                }
                if(transactions[j].toAddress === address){
                    transactionsRes.push(transactions[j]);
                }
            }
        }

        return transactionsRes;
    }

    getPendingTransactionsOfAddress(address){
        let transactionsRes = [];

        for(let i = 0; i < this.pendingTransactions.length; i++){
            const transaction = this.pendingTransactions[i];

            if(transaction.fromAddress === address){
                transactionsRes.push(transaction);
            }
            if(transaction.toAddress === address){
                transactionsRes.push(transaction);
            }
        }

        return transactionsRes;
    }

    // getAllBlock(){
    //   return this.chain;
    // }
}

module.exports = Chain;
