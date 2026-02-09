const jwt = require('jsonwebtoken');
const User = require('../models/user'); 
const authController = require('../controllers/authController');
const checkAuth = require('../middleware/auth');

module.exports = async (req, res, next) => { 
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { userId: decodedToken.id, role: decodedToken.role };

        User.update({ lastActiveAt: new Date() }, { where: { id: decodedToken.id } }).catch(err => {
            console.error("Aktiflik güncellenemedi:", err);
        });

        next();
        
    } catch (error) {
        res.status(401).json({ message: "Yetkisiz erişim! Lütfen giriş yapın." });
    }
};