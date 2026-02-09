const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Badge = sequelize.define(
  "Badge",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "blue",
    },
    icon: {
      type: DataTypes.STRING, 
      allowNull: false,
      defaultValue: "fa-solid fa-star",
    },
  },
  { timestamps: false }
);

module.exports = Badge;
