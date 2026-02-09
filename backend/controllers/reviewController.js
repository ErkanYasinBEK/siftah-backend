const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/user");
const Order = require("../models/Order");
const { updateSellerScore } = require("../utils/helpers"); 
const xss = require("xss");

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment, orderId } = req.body;
    const userId = req.userData.userId;

    if (!rating || !comment) return res.status(400).json({ error: "Eksik bilgi." });

    const cleanComment = xss(comment.trim());

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

    let review = await Review.findOne({ where: { productId, userId } });

    if (review) {
      review.rating = rating;
      review.comment = cleanComment; 
      await review.save();
    } else {
      review = await Review.create({
        productId,
        userId,
        rating,
        comment: cleanComment, 
        isVerified: true,
      });
    }

    if (orderId) {
      await Order.update({ isRated: true }, { where: { id: orderId } });
    }
    
    updateSellerScore(product.sellerId);

    const reviewWithUser = await Review.findByPk(review.id, {
      include: [{ model: User, attributes: ["name", "surname"] }],
    });

    res.json({ message: "Yorum kaydedildi", review: reviewWithUser });
  } catch (error) {
    console.error("Yorum Hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

exports.checkReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userData.userId;
    const review = await Review.findOne({ where: { productId, userId } });
    if (review) {
      res.json({ found: true, review });
    } else {
      res.json({ found: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: "Bulunamadı" });
    
    if (review.userId !== req.userData.userId) {
        return res.status(403).json({ error: "Bu yorumu silmeye yetkiniz yok." });
    }

    const product = await Product.findByPk(review.productId);
    await review.destroy();
    
    if (product) {
      updateSellerScore(product.sellerId);
    }
    res.json({ message: "Silindi" });
  } catch (error) {
    res.status(500).json({ error: "Hata" });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: "Bulunamadı" });

    if (review.userId !== req.userData.userId) {
        return res.status(403).json({ error: "Bu yorumu düzenlemeye yetkiniz yok." });
    }

    if (req.body.comment) {
        review.comment = xss(req.body.comment.trim());
    }
    if (req.body.rating) {
        review.rating = req.body.rating;
    }

    await review.save();

    const product = await Product.findByPk(review.productId);
    if (product) {
      updateSellerScore(product.sellerId);
    }

    const updatedReview = await Review.findByPk(req.params.id, {
      include: [{ model: User, attributes: ["name", "surname"] }],
    });
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: "Hata" });
  }
};