const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const checkAuth = require("../middleware/auth");

// 1. Yeni Sipariş Oluştur (Satıcı Yapar)
router.post("/create", checkAuth, orderController.createOrder);

// 2. Sipariş Durumu/Kargo Güncelle (Satıcı Yapar)
router.put("/:orderId/status", checkAuth, orderController.updateOrderStatus);

// 3. Satıcı Kendi Satışlarını Görür
router.get("/seller", checkAuth, orderController.getSellerOrders);

// 4. Alıcı Kendi Siparişlerini Görür
router.get("/buyer", checkAuth, orderController.getBuyerOrders);

module.exports = router;