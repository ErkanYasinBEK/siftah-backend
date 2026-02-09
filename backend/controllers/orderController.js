const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/user");

exports.createOrder = async (req, res) => {
  try {
    const sellerId = req.userData.userId;
    const { productId, buyerId, buyerNote, price, quantity } = req.body;

    const product = await Product.findOne({ where: { id: productId, sellerId } });
    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı veya sizin değil." });
    }

    const newOrder = await Order.create({
      sellerId,
      buyerId,
      productId,
      buyerNote,
      price: price || product.price,
      quantity: quantity || 1,
      status: "pending"
    });

    res.status(201).json({ message: "Sipariş oluşturuldu.", order: newOrder });
  } catch (error) {
    console.error("Sipariş Oluşturma Hatası:", error);
    res.status(500).json({ message: "Sipariş oluşturulamadı." });
  }
};

// 2. Satıcı: Kargo Bilgisi Girer
exports.updateOrderStatus = async (req, res) => {
  
  try {
    const userId = req.userData.userId;
    const { orderId } = req.params;
    const { status, trackingCompany, trackingNumber } = req.body;

    const order = await Order.findOne({ 
        where: { 
            id: orderId,
            [require("sequelize").Op.or]: [{ sellerId: userId }, { buyerId: userId }] 
        } 
    });
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı." });

    if (status) order.status = status;
    if (trackingCompany) order.trackingCompany = trackingCompany;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();

    res.status(200).json({ message: "Sipariş durumu güncellendi.", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Güncelleme hatası." });
  }
};

// 3. Satıcı: Kendi Siparişlerini Görür
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.userData.userId;
    const orders = await Order.findAll({
      where: { sellerId },
      include: [
        { model: User, as: "Buyer", attributes: ["id", "name", "surname"] }, 
        { model: Product, attributes: ["id", "title", "image", "price"] } 
      ],
      order: [["createdAt", "DESC"]]
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Siparişler getirilemedi." });
  }
};

exports.getBuyerOrders = async (req, res) => {
    try {
        // 🔥 DÜZELTME BURADA: req.user.id YERİNE req.userData.userId YAZDIK
        const userId = req.userData.userId; 

        const orders = await Order.findAll({
            where: { buyerId: userId },
            include: [
                { 
                    model: Product, 
                }, 
                { 
                    model: User, 
                    as: 'Seller',
                    attributes: ['id', 'name', 'surname', 'brandName'] 
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        console.error("Sipariş Çekme Hatası:", error); 
        res.status(500).json({ message: "Sunucu hatası" });
    }
};