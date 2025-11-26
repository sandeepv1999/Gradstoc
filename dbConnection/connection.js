const mongoose = require("mongoose");

const mongoURL = process.env.DB_URL

const connectToMongo = async () => {
  try {
    mongoose.connect(mongoURL, (error, response) => {
      if (error) {
        console.log("mongo connection error", error);
      } else {
        console.log("DB Connection successfully stablist");
      }
    });
  } catch (error) {
    console.log("mongo connection error", error);
  }
};

module.exports = connectToMongo;
