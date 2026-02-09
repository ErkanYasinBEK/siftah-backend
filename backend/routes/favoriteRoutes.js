const express = require("express");
const router = express.Router();
const Favorite = require("../models/Favorite");
const Product = require("../models/Product");
const checkAuth = require("../middleware/auth");

// Tabloyu oluştur (İlk çalıştırma için)
Favorite.sync({ alter: true });

// 1. FAVORİ EKLE / ÇIKAR (Toggle)
router.post("/toggle", checkAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.userData.userId;

    const existing = await Favorite.findOne({ where: { userId, productId } });

    if (existing) {
      await existing.destroy();
      return res
        .status(200)
        .json({
          success: true,
          action: "removed",
          message: "Favorilerden çıkarıldı.",
        });
    } else {
      await Favorite.create({ userId, productId });
      return res
        .status(201)
        .json({
          success: true,
          action: "added",
          message: "Favorilere eklendi.",
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "İşlem başarısız." });
  }
});

// 2. FAVORİLERİMİ GETİR
router.get("/my-favorites", checkAuth, async (req, res) => {
  try {
    const userId = req.userData.userId;

    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: [
            "id",
            "title",
            "price",
            "discountPrice",
            "images",
            "category",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Favoriler yüklenemedi." });
  }
});

// 3. KONTROL ET (Bu ürün favorimde mi?)
router.get("/check/:productId", checkAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userData.userId;
    const exists = await Favorite.findOne({ where: { userId, productId } });
    res.status(200).json({ isFavorite: !!exists });
  } catch (error) {
    res.status(500).json({ isFavorite: false });
  }
});

module.exports = router;
