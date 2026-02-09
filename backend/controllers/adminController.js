const User = require("../models/user");
const Product = require("../models/Product");
const { Op } = require("sequelize");
const Badge = require("../models/Badge");
const bcrypt = require('bcrypt');
const Message = require('../models/Message'); 
const AdminLog = require('../models/AdminLog');
const { updateSellerScore, updateResponseRate } = require("../utils/helpers");

const createLog = async (adminId, type, message, req) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        await AdminLog.create({
            adminId: adminId,
            actionType: type,
            description: message,
            ipAddress: ip
        });
    } catch (error) {
        console.error("Log oluşturulamadı:", error);
    }
};

exports.getPendingSellers = async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: {
        role: "seller",
        [Op.or]: [
          { isApproved: false },
          { isUpdatePending: true }, 
        ],
      },
      attributes: [
        "id", "name", "surname", "email", "brandName", "category", "tc_no", "createdAt",
        "isApproved", "isUpdatePending",
        
        "profileImage", "logoUrl", "coverImage", "storyImage", "siftahNote", 
        "instagram", "website", "twitter", "facebook", "youtube", "linkedin",

        "pendingName",
        "pendingSurname",
        "pendingBrandName",
        "pendingProfileImage",
        "pendingLogoUrl",
        "pendingCoverImage",
        "pendingStoryImage",
        "pendingSiftahNote",
        "pendingInstagram",
        "pendingWebsite",
        "pendingTwitter",
        "pendingFacebook",
        "pendingYoutube",
        "pendingLinkedin"
      ],
    });
    res.status(200).json(sellers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Veriler alınamadı." });
  }
};

exports.approveSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await User.findByPk(id);
    await User.update({ isApproved: true }, { where: { id } });

    await createLog(req.userData.userId, "ONAY", `${seller.name} ${seller.surname} (ID: ${id}) adlı satıcıyı onayladı.`, req);

    res.status(200).json({ message: "Satıcı onaylandı! Artık giriş yapabilir." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Onaylama hatası." });
  }
};

exports.rejectSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await User.findByPk(id);
    await User.destroy({ where: { id } }); 
    await createLog(req.userData.userId, "RET", `${seller.name} ${seller.surname} başvurusunu reddetti ve sildi.`, req);
    res.status(200).json({ message: "Başvuru reddedildi ve silindi." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Silme hatası." });
  }
};

exports.getApprovedSellers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit; 

    const { search } = req.query;
    let whereClause = { role: "seller", isApproved: true };

    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { surname: { [Op.like]: `%${search}%` } },
          { brandName: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: sellers } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      limit: limit,
      offset: offset, 
      order: [['createdAt', 'DESC']] 
    });

    const sellersWithStats = await Promise.all(
      sellers.map(async (seller) => {
        const sellerJson = seller.toJSON();

        sellerJson.productCount = await Product.count({
          where: { sellerId: seller.id },
        });

        if (!sellerJson.averageRating) {
             const products = await Product.findAll({
              where: { sellerId: seller.id },
              include: [{ model: require("../models/Review"), attributes: ["rating"] }],
            });

            let totalRating = 0;
            let reviewCount = 0;

            products.forEach((prod) => {
              if (prod.Reviews && prod.Reviews.length > 0) {
                prod.Reviews.forEach((rev) => {
                  totalRating += rev.rating;
                  reviewCount++;
                });
              }
            });
            sellerJson.averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : "Yeni";
        }

        return sellerJson;
      })
    );

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      sellers: sellersWithStats
    });

  } catch (error) {
    console.error("Aktif Satıcı Hatası:", error);
    res.status(500).json({ message: "Aktif satıcılar alınamadı." });
  }
};

exports.updateBadges = async (req, res) => {
  try {
    const { id } = req.params;
    const { badges } = req.body;
    
    const seller = await User.findByPk(id);

    await User.update({ badges: badges }, { where: { id } });
    const badgeStr = badges.join(", ");
    await createLog(req.userData.userId, "ROZET", `${seller.brandName} mağazasına rozet atadı: [${badgeStr}]`, req);

    res.status(200).json({ message: "Rozetler güncellendi!" });
  } catch (error) {
    console.error("Rozet Hatası:", error);
    res.status(500).json({ message: "Rozet güncelleme hatası." });
  }
};

exports.approveUpdate = async (req, res) => {
  try {
    const seller = await User.findByPk(req.params.id);
    if (!seller) return res.status(404).json({ message: "Satıcı bulunamadı." });

    if (seller.pendingName) seller.name = seller.pendingName;
    if (seller.pendingSurname) seller.surname = seller.pendingSurname;
    if (seller.pendingBrandName) seller.brandName = seller.pendingBrandName;
    if (seller.pendingProfileImage) seller.profileImage = seller.pendingProfileImage;
    if (seller.pendingLogoUrl) seller.logoUrl = seller.pendingLogoUrl;

    if (seller.pendingCoverImage) seller.coverImage = seller.pendingCoverImage;
    if (seller.pendingStoryImage) seller.storyImage = seller.pendingStoryImage;
    if (seller.pendingSiftahNote) seller.siftahNote = seller.pendingSiftahNote;
    
    if (seller.pendingFeaturedProductId !== null && seller.pendingFeaturedProductId !== undefined) {
        seller.featuredProductId = seller.pendingFeaturedProductId;
    }

    if (seller.pendingInstagram) seller.instagram = seller.pendingInstagram;
    if (seller.pendingWebsite) seller.website = seller.pendingWebsite;
    if (seller.pendingTwitter) seller.twitter = seller.pendingTwitter;
    if (seller.pendingFacebook) seller.facebook = seller.pendingFacebook;
    if (seller.pendingYoutube) seller.youtube = seller.pendingYoutube;
    if (seller.pendingLinkedin) seller.linkedin = seller.pendingLinkedin;

    seller.pendingName = null;
    seller.pendingSurname = null;
    seller.pendingBrandName = null;
    seller.pendingProfileImage = null;
    seller.pendingLogoUrl = null;
    
    seller.pendingCoverImage = null;
    seller.pendingStoryImage = null;
    seller.pendingSiftahNote = null;
    seller.pendingFeaturedProductId = null;

    seller.pendingInstagram = null;
    seller.pendingWebsite = null;
    seller.pendingTwitter = null;
    seller.pendingFacebook = null;
    seller.pendingYoutube = null;
    seller.pendingLinkedin = null;

    seller.isUpdatePending = false;

    await seller.save();

    await createLog(req.userData.userId, "GÜNCELLEME-ONAY", `${seller.brandName || seller.name} satıcısının profil güncellemelerini onayladı.`, req);

    res.status(200).json({ message: "Tüm güncellemeler başarıyla onaylandı ve yayınlandı." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Onaylama hatası." });
  }
};

exports.rejectUpdate = async (req, res) => {
  try {
    const seller = await User.findByPk(req.params.id);
    if (!seller) return res.status(404).json({ message: "Satıcı bulunamadı." });

    seller.pendingName = null;
    seller.pendingSurname = null;
    seller.pendingBrandName = null;
    seller.pendingProfileImage = null;
    seller.pendingLogoUrl = null;
    
    seller.pendingCoverImage = null;
    seller.pendingStoryImage = null;
    seller.pendingSiftahNote = null;
    seller.pendingFeaturedProductId = null;

    seller.pendingInstagram = null;
    seller.pendingWebsite = null;
    seller.pendingTwitter = null;
    seller.pendingFacebook = null;
    seller.pendingYoutube = null;
    seller.pendingLinkedin = null;

    seller.isUpdatePending = false;

    await seller.save();

    await createLog(req.userData.userId, "GÜNCELLEME-RET", `${seller.brandName || seller.name} satıcısının profil güncellemelerini reddetti.`, req);

    res.status(200).json({ message: "Güncelleme talebi reddedildi ve temizlendi." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Reddetme hatası." });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.count({
      where: { role: { [Op.ne]: "admin" } },
    });

    const totalProducts = await Product.count();

    const pendingCount = await User.count({
      where: {
        role: "seller",
        [Op.or]: [{ isApproved: false }, { isUpdatePending: true }],
      },
    });

    const activeSellers = await User.count({
        where: {
            role: "seller",
            isApproved: true
        }
    });

    res.status(200).json({
      totalUsers,
      totalProducts,
      pendingCount,
      activeSellers
    });
  } catch (error) {
    console.error("İstatistik Hatası:", error);
    res.status(500).json({ message: "İstatistikler alınamadı." });
  }
};

exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.findAll();
    res.status(200).json(badges);
  } catch (error) {
    res.status(500).json({ message: "Rozetler alınamadı." });
  }
};

exports.createBadge = async (req, res) => {
  try {
    const { label, color, icon } = req.body; 
    if (!label) return res.status(400).json({ message: "İsim gerekli." });

    const selectedIcon = icon || "fa-solid fa-star";

    await Badge.create({ label, color, icon: selectedIcon });
    res.status(201).json({ message: "Rozet oluşturuldu." });
  } catch (error) {
    res.status(500).json({ message: "Oluşturulamadı." });
  }
};

exports.deleteBadge = async (req, res) => {
  try {
    await Badge.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: "Rozet silindi." });
  } catch (error) {
    res.status(500).json({ message: "Silinemedi." });
  }
};


exports.createSubAdmin = async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta zaten kullanımda." });
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      surname,
      email,
      password: hashedPassword,
      role: "admin", 
      isApproved: true, 
    });

    res.status(201).json({ message: "Yeni yönetici başarıyla oluşturuldu." });
  } catch (error) {
    console.error("Admin oluşturma hatası:", error);
    res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
};

exports.getAllAdmins = async (req, res) => {
    try {
        const requesterId = req.userData.userId; 

        const admins = await User.findAll({
            where: { role: 'admin' },
            attributes: ['id', 'name', 'surname', 'email', 'createdAt'] 
        });

        const safeAdmins = admins.map(admin => {
            const adminData = admin.toJSON();
            
            if (adminData.id === 1 && requesterId !== 1) {
                adminData.email = "Gizli E-posta (***)"; 
            }
            
            return adminData;
        });

        res.status(200).json(safeAdmins);
    } catch (error) {
        console.error("Admin listesi hatası:", error);
        res.status(500).json({ message: "Yöneticiler alınamadı." });
    }
};

exports.updateSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, email } = req.body;
    const requesterId = req.userData.userId; 

    if (Number(id) === 1 && Number(requesterId) !== 1) {
      return res.status(403).json({ message: "Ana yönetici bilgilerini sadece kendisi güncelleyebilir." });
    }

    await User.update(
      { name, surname, email }, 
      { where: { id } }
    );

    await createLog(requesterId, "ADMİN-GÜNCELLEME", `Admin (ID: ${id}) bilgilerini güncelledi.`, req);

    res.status(200).json({ message: "Yönetici bilgileri güncellendi." });
  } catch (error) {
    console.error("Admin güncelleme hatası:", error);
    res.status(500).json({ message: "Güncelleme yapılamadı." });
  }
};

exports.deleteSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.userData.userId;
    
    if (Number(id) === Number(requesterId)) {
        return res.status(400).json({ message: "Kendinizi silemezsiniz." });
    }

    if (Number(id) === 1) {
        return res.status(403).json({ message: "Ana yönetici silinemez!" });
    }

    await User.destroy({ where: { id } });

    await createLog(requesterId, "ADMİN-SİLME", `Bir yöneticiyi sildi (Silinen ID: ${id})`, req);

    res.status(200).json({ message: "Yönetici silindi." });
  } catch (error) {
    console.error("Admin silme hatası:", error);
    res.status(500).json({ message: "Silme işlemi başarısız." });
  }
};

exports.getAllAuditConversations = async (req, res) => {
    try {
        const messages = await Message.findAll({
            limit: 1000,
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'surname', 'role', 'brandName'] },
                { model: User, as: 'receiver', attributes: ['id', 'name', 'surname', 'role', 'brandName'] }
            ]
        });

        const conversations = [];
        const seenPairs = new Set();

        messages.forEach(msg => {
            if(!msg.sender || !msg.receiver) return; 
            const pair = [msg.senderId, msg.receiverId].sort((a, b) => a - b).join('-');

            if (!seenPairs.has(pair)) {
                seenPairs.add(pair);
                conversations.push({
                    id: pair, 
                    sender: {
                        id: msg.sender.id,
                        name: msg.sender.brandName || (msg.sender.name + " " + msg.sender.surname),
                        role: msg.sender.role
                    },
                    receiver: {
                        id: msg.receiver.id,
                        name: msg.receiver.brandName || (msg.receiver.name + " " + msg.receiver.surname),
                        role: msg.receiver.role
                    },
                    lastMessage: msg.content || "Medya/Dosya",
                    date: msg.createdAt
                });
            }
        });

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Audit Log Hatası:", error);
        res.status(500).json({ error: "Sohbet listesi alınamadı." });
    }
};

exports.getAuditChatDetails = async (req, res) => {
    try {
        const { user1Id, user2Id } = req.params;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id }
                ]
            },
            order: [['createdAt', 'ASC']],
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'brandName'] }
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Chat Detay Hatası:", error);
        res.status(500).json({ error: "Mesajlar alınamadı." });
    }
};

exports.getAdminLogs = async (req, res) => {
    try {
        const logs = await AdminLog.findAll({
            limit: 50, 
            order: [['createdAt', 'DESC']], 
            include: [
                { model: User, as: 'admin', attributes: ['name', 'surname'] }
            ]
        });
        res.status(200).json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Loglar alınamadı." });
    }
};

exports.toggleBanUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı." });
        }

        if (user.role === "admin") {
             return res.status(403).json({ error: "Yöneticiler yasaklanamaz!" });
        }

        const newStatus = !user.isBanned;
        user.isBanned = newStatus;
        await user.save();

        const actionText = newStatus ? "YASAKLANDI" : "YASAĞI KALDIRILDI";
        
        await createLog(req.userData.userId, "ERİŞİM", `${user.name} ${user.surname} kullanıcısının durumu değişti: ${actionText}`, req);

        res.status(200).json({ message: `Kullanıcı erişimi güncellendi: ${actionText}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "İşlem başarısız." });
    }
};

exports.approveProduct = async (req, res) => {
    try {
        const { id } = req.params; 
        const product = await Product.findByPk(id);

        if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

        product.isApproved = true;
        await product.save();

        await createLog(req.userData.userId, "ÜRÜN-ONAY", `${product.title} (ID: ${id}) ürününü yayına aldı.`, req);

        res.json({ message: "Ürün onaylandı" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Hata oluştu" });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

        const title = product.title;

        await product.destroy();

        await createLog(req.userData.userId, "ÜRÜN-RET", `${title} (ID: ${id}) ürününü reddetti/sildi.`, req);

        res.json({ message: "Ürün silindi" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Hata oluştu" });
    }
};

exports.archiveProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const product = await Product.findByPk(id);
        if(!product) return res.status(404).json({ error: "Ürün bulunamadı" });

        product.isApproved = false; 
        product.rejectionReason = reason;
        await product.save();

        await createLog(req.userData.userId, "ÜRÜN-ARŞİV", `${product.title} ürününü yayından kaldırdı. Sebep: ${reason}`, req);

        res.json({ message: "Ürün yayından kaldırıldı." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Hata oluştu." });
    }
};


exports.fixAllScores = async (req, res) => {
    if (req.userData.role !== 'admin') {
        return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
    }

    try {
        const sellers = await User.findAll({ where: { role: "seller" } });
        let count = 0;
        for (const seller of sellers) {
            await updateSellerScore(seller.id);
            await updateResponseRate(seller.id);
            count++;
        }
        res.json({ message: "Tüm puanlar ve yanıt oranları yeniden hesaplandı!", updatedSellers: count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Hesaplama hatası" });
    }
};

exports.resetAllProducts = async (req, res) => {
    if (req.userData.role !== 'admin') {
        return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
    }

    try {
        await Product.update({ isApproved: false }, { where: {} });
        res.json({ 
            message: "🧹 Temizlik Yapıldı!", 
            note: "Tüm ürünler 'Onay Bekliyor' (false) durumuna getirildi." 
        });
    } catch (error) {
        res.status(500).json({ error: "Sıfırlama hatası" });
    }
};

// --- ------------------------ ---

exports.getPendingProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isApproved: false },
      include: [
        {
          model: User,
          attributes: ["id", "name", "surname", "brandName", "logoUrl", "profileImage"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(products);
  } catch (error) {
    console.error("Admin Pending Error:", error);
    res.status(500).json({ error: "Listeleme hatası" });
  }
};

exports.getAllMarketplaceProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "surname", "brandName", "logoUrl", "profileImage"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(products);
  } catch (error) {
    console.error("Marketplace Error:", error);
    res.status(500).json({ error: "Ürünler çekilemedi." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        role: { [Op.ne]: "admin" } 
      },
      attributes: [
        "id", "name", "surname", "email", "role", 
        "brandName", "createdAt", "isApproved", 
        "profileImage", "isBanned"
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (error) {
    console.error("Üye Listesi Hatası:", error);
    res.status(500).json({ error: "Üyeler çekilemedi." });
  }
};