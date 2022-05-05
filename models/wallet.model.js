const crypto = require("crypto");
const EC = require("elliptic");
const ec = new EC.ec("secp256k1");

class Wallet {
    constructor(){
        this.keyPair = this.generateKeyPair()
    }
    generateKeyPair() {
        return ec.genKeyPair();
    }
    getPrivateKey() {
        return this.keyPair.getPrivate('hex');
    }
    getPublicKey() {
        return this.keyPair.getPublic('hex');
    }
    getWalletAddress() {
        return this.getPublicKey();
    }
}

module.exports = Wallet;
