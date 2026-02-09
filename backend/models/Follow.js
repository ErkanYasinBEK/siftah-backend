// models/Follow.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user'); // User modelini tanısın diye ekledik

const Follow = sequelize.define('Follow', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Takip Eden Kişi (Örn: Alıcı)
    followerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    // Takip Edilen Kişi (Örn: Satıcı/Mağaza)
    followingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    timestamps: true, // Ne zaman takip ettiğini tutmak için
    tableName: 'Follows'
});

module.exports = Follow;