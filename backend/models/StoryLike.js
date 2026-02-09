const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const StoryLike = sequelize.define("StoryLike", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  storyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

module.exports = StoryLike;