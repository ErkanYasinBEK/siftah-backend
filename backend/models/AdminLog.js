const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AdminLog = sequelize.define('AdminLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    adminId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    actionType: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true, 
    tableName: 'AdminLogs'
});

module.exports = AdminLog;