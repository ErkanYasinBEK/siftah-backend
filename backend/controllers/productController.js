const Product = require("../models/Product");
const User = require("../models/user");
const Review = require("../models/Review");
const { Op } = require("sequelize");
const xss = require("xss");

exports.addProduct = async (req, res) => {
  try {
    const title = req.body.title ? xss(req.body.title.trim()) : "";
    const description = req.body.description ? xss(req.body.description.trim()) : "";
    const category = req.body.category ? xss(req.body.category.trim()) : "";
    
    const price = req.body.price;
    const stock = req.body.stock;

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => "uploads/" + file.filename);
    }

    const sellerId = req.userData.userId;

    const newProduct = await Product.create({
      title,
      description,
      price,
      category,
      stock: stock,
      images: imagePaths, 
      sellerId: sellerId,
      isApproved: false, 
    });

    res.status(201).json({
      message: "Ürün başarıyla eklendi!",
      product: newProduct,
    });
  } catch (error) {
    console.error("Ürün Ekleme Hatası:", error);
    res.status(500).json({ message: "Ürün eklenirken bir hata oluştu." });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        isApproved: true, 
      },
      order: [["createdAt", "DESC"]], 
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Ürünleri Getirme Hatası:", error);
    res.status(500).json({ message: "Ürünler yüklenemedi." });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "surname", "brandName", "phone", "badges", "isApproved", "logoUrl", "profileImage", "averageRating", "totalReviews"],
        },
        {
          model: Review,
          include: [{ model: User, attributes: ["id", "name", "surname"] }],
        },
      ],
      order: [[Review, "createdAt", "DESC"]],
    });

    if (!product) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server hatası" });
  }
};

exports.incrementView = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Ürün yok" });
    await product.increment("viewCount");
    res.json({ message: "Görüntülenme artırıldı", views: product.viewCount });
  } catch (error) {
    res.status(500).json({ error: "Hata" });
  }
};

exports.getRelatedProducts = async (req, res) => {
  try {
    const currentProductId = req.params.id;
    const currentProduct = await Product.findByPk(currentProductId);
    if (!currentProduct) return res.status(404).json({ error: "Ürün bulunamadı" });

    const relatedProducts = await Product.findAll({
      where: {
        category: currentProduct.category,
        id: { [Op.ne]: currentProductId },
        isApproved: true,
      },
      limit: 10,
      include: [
        { model: User, attributes: ["brandName", "name", "surname", "averageRating"] },
        { model: Review, attributes: ["rating"] },
      ],
    });
    res.json(relatedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Benzer ürünler alınamadı" });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const title = req.body.title ? xss(req.body.title.trim()) : undefined;
    const description = req.body.description ? xss(req.body.description.trim()) : undefined;
    const category = req.body.category ? xss(req.body.category.trim()) : undefined;
    
    const { price, stock } = req.body;
    
    let discountPrice = req.body.discountPrice;
    if (discountPrice === "" || discountPrice === "null" || discountPrice === 0) {
        discountPrice = null;
    }

    const product = await Product.findOne({
      where: { id: id, sellerId: req.userData.userId },
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: "Ürün bulunamadı veya bu işlemi yapmaya yetkiniz yok." });
    }

    let finalImages = product.images || [];

    if (req.files && req.files.length > 0) {
      finalImages = req.files.map((file) => "uploads/" + file.filename);
    }

    await product.update({
      title: title || product.title,
      price: price || product.price,
      discountPrice: discountPrice,
      description: description || product.description,
      category: category || product.category,
      stock: stock || product.stock,
      images: finalImages,
      isApproved: false, 
    });

    res.status(200).json({ message: "Ürün güncellendi ve tekrar onaya gönderildi!", images: finalImages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Güncelleme hatası." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.destroy({
      where: { id: id, sellerId: req.userData.userId },
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Ürün bulunamadı veya yetkiniz yok." });
    }

    res.status(200).json({ message: "Ürün silindi." });
  } catch (error) {
    res.status(500).json({ message: "Silme hatası." });
  }
};


exports.toggleShowcase = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.userData.userId;

    const product = await Product.findOne({
      where: { id: id, sellerId: sellerId },
    });

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    if (product.isShowcase) {
      await product.update({ isShowcase: false });
      return res.status(200).json({ 
          message: "Ürün vitrinden kaldırıldı.", 
          isShowcase: false 
      });
    }

    const showcaseCount = await Product.count({
      where: { sellerId: sellerId, isShowcase: true },
    });

    if (showcaseCount >= 4) {
      return res.status(400).json({ 
          message: "Maksimum 4 ürünü vitrine ekleyebilirsiniz. Önce birini çıkarın." 
      });
    }

    await product.update({ isShowcase: true });
    
    res.status(200).json({ 
        message: "Ürün vitrine eklendi! 🌟", 
        isShowcase: true 
    });

  } catch (error) {
    console.error("Vitrin Hatası:", error);
    res.status(500).json({ message: "İşlem başarısız." });
  }
};