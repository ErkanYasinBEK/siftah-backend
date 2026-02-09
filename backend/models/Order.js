const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "shipped", "completed", "cancelled"),
    defaultValue: "pending",
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // 👈 EKLENDİ: Eskilere 1 yazar
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0, // 👈 EKLENDİ: Eskilere 0.00 yazar, hata vermez
  },
  trackingCompany: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyerNote: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isRated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Order;
