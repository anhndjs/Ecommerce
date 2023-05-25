require('dotenv').config();

const { default: mongoose } = require('mongoose');

const dbConnect = () => {
  try {
    const db = mongoose.connect(process.env.dataBase);
    console.log('Connect database');
  } catch (error) {
    console.log(`loi connect ${error}`);
  }
};

module.exports = dbConnect;
