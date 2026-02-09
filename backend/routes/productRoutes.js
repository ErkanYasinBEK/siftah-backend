const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const checkAuth = require('../middleware/auth'); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads")); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/webp") {
        cb(null, true);
    } else {
        cb(new Error("Desteklenmeyen dosya formatı! Sadece resim yükleyebilirsiniz."), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } 
});

router.get('/', productController.getAllProducts);
router.get('/related/:id', productController.getRelatedProducts); 
router.post('/:id/view', productController.incrementView);
router.get('/:id', productController.getProductById);
router.post('/add', checkAuth, upload.array('images', 5), productController.addProduct);
router.put('/:id/showcase', checkAuth, productController.toggleShowcase);
// router.put('/:id', checkAuth, upload.array('images', 5), productController.updateProduct);
router.post('/:id', checkAuth, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', checkAuth, productController.deleteProduct);
router.get('/public', productController.getAllProducts);

module.exports = router;