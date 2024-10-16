const mongoose = require('mongoose');
const messages = require('../utils/messages');


const connectToDB = async() => {
    try {
        await mongoose.connect(process.env.DATABASE_URL)
        .then(() => {
            console.log('Connecté à MongoDB');
        });
    } catch (err) {
        console.error({message: messages[lang].ERROR_DB_CONNECTION}, err);
        process.exit(1);
    }
};

module.exports = connectToDB;