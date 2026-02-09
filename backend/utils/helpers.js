const Product = require("../models/Product");
const Review = require("../models/Review");
const Message = require("../models/Message");
const User = require("../models/user");
const { Op } = require("sequelize");

const updateSellerScore = async (sellerId) => {
  try {
    const products = await Product.findAll({ where: { sellerId: sellerId }, attributes: ["id"] });
    const productIds = products.map((p) => p.id);
    if (productIds.length === 0) return;

    const reviews = await Review.findAll({ where: { productId: { [Op.in]: productIds } }, attributes: ["rating"] });
    const totalReviews = reviews.length;
    let averageRating = 0;

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = (sum / totalReviews).toFixed(1);
    }

    await User.update({ averageRating: averageRating, totalReviews: totalReviews }, { where: { id: sellerId } });
    console.log(`✅ Satıcı (ID: ${sellerId}) Puanı Güncellendi: ${averageRating}`);
  } catch (error) {
    console.error("Puan güncellenemedi:", error);
  }
};

const updateResponseRate = async (sellerId) => {
  try {
    const incomingMessages = await Message.findAll({ where: { receiverId: sellerId }, attributes: ["senderId"], group: ["senderId"] });
    const uniqueCustomers = incomingMessages.length;
    if (uniqueCustomers === 0) return;

    let repliedCount = 0;
    for (const msg of incomingMessages) {
      const customerId = msg.senderId;
      const reply = await Message.findOne({ where: { senderId: sellerId, receiverId: customerId } });
      if (reply) repliedCount++;
    }
    const rate = Math.round((repliedCount / uniqueCustomers) * 100);
    await User.update({ responseRate: rate }, { where: { id: sellerId } });
    console.log(`✅ Satıcı (ID: ${sellerId}) Yanıt Oranı: %${rate}`);
  } catch (error) {
    console.error("Yanıt oranı güncellenemedi:", error);
  }
};

module.exports = { updateSellerScore, updateResponseRate };