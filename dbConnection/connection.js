const mongoose = require("mongoose");

const mongoURL = "mongodb://127.0.0.1:27017/gradStock_1";

const connectToMongo = async () => {
  try {
    mongoose.connect(mongoURL, (error, response) => {
      if (error) {
        copnsole.log("mongo connection error", error);
      } else {
        console.log("DB Connection successfully stablist");
      }
    });
  } catch (error) {
    console.log("mongo connection error", error);
  }
};

module.exports = connectToMongo;
