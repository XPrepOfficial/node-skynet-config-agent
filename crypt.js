/**
 * AES Encryption
 * */
const crypto = require('crypto');

exports = module.exports = class Crypt {

    constructor(generatorAlgo, generatorSecret) {
        this.generatorAlgo = generatorAlgo;
        this.generatorSecret = generatorSecret;
    }

    encrypt(data) {
        let json = JSON.stringify({payload: data});
        try {
            let cipher = crypto.createCipher(this.generatorAlgo, this.generatorSecret);
            return cipher.update(json, 'binary', 'hex') + cipher.final('hex');
        } catch (c) {
            return new Error(c);
        }
    }

    decrypt(cryptText) {
        let data = null;
        try {
            let decipher = crypto.createDecipher(this.generatorAlgo, this.generatorSecret);
            data = JSON.parse(decipher.update(cryptText, 'hex') + decipher.final());
        } catch (c) {
            c.message = "Unable to decode the cryptext. Tampered input! Or Invalid Secret! " + c.message;
            return new Error(c);
        }
        if (data && data.payload) {
            return data.payload;
        } else {
            return new Error("Unable to parse. Bad data or secret.");
        }
    }
};
