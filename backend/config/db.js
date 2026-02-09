const { Sequelize } = require("sequelize");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS, 
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
    }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Veritabanı bağlantısı başarılı! (PostgreSQL)");
  } catch (error) {
    console.error("❌ Veritabanı Bağlantı Hatası:", error.message);
  }
};

module.exports = { sequelize, connectDB };