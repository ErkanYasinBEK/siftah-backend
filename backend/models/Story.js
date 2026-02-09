const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Story = sequelize.define("Story", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  coverImage: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
}, {
  timestamps: true,
});

module.exports = Story;