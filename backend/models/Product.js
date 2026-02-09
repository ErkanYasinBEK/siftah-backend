const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user'); 

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT, 
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false
    },
    discountPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true 
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    images: {
        type: DataTypes.JSON, 
        allowNull: true,
        defaultValue: [] 
    },
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0 
    },
    isFeatured: { 
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isShowcase:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
    }    
}, {
    timestamps: true
});

User.hasMany(Product, { foreignKey: 'sellerId' });
Product.belongsTo(User, { foreignKey: 'sellerId' });

module.exports = Product;