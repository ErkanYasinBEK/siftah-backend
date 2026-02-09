const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./user");
const Product = require("./Product");

const Favorite = sequelize.define(
  "Favorite",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    tableName: "Favorites",
  }
);

// İlişkileri burada tanımlayalım ki include ederken hata almayalım
User.hasMany(Favorite, { foreignKey: "userId" });
Favorite.belongsTo(User, { foreignKey: "userId" });

Product.hasMany(Favorite, { foreignKey: "productId" });
Favorite.belongsTo(Product, { foreignKey: "productId" });

module.exports = Favorite;
