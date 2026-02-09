const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user'); 
const Product = require('./Product'); 

const Review = sequelize.define('Review', {
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // YENİ EKLEDİĞİMİZ ALAN:
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // Varsayılan olarak onaysız olsun
    }
}, { timestamps: true });

Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(Review, { foreignKey: 'productId' });
User.hasMany(Review, { foreignKey: 'userId' });

module.exports = Review;