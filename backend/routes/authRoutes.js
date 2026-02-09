const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
const checkAuth = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../uploads'); 

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📂 'uploads' klasörü oluşturuldu (veya zaten vardı).");
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

router.post('/register', upload.fields([
    { name: 'logo', maxCount: 1 }, 
    { name: 'profileImage', maxCount: 1 }
]), authController.register);

router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password', authController.resetPassword);

router.put('/change-password', checkAuth, authController.changePassword);

module.exports = router;