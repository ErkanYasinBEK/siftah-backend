const User = require("../models/user");
const Product = require("../models/Product");
const Follow = require("../models/Follow");
const Badge = require("../models/Badge");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../config/db.js");
const xss = require("xss");

async function enrichBadges(badgeNames) {
  if (!badgeNames || !Array.isArray(badgeNames) || badgeNames.length === 0)
    return [];

  try {
    const allDefinitions = await Badge.findAll();

    return badgeNames.map((name) => {
      const cleanName = name.trim();
      const def = allDefinitions.find((d) => d.label.trim() === cleanName);

      if (def) {
        return { label: def.label, color: def.color, icon: def.icon };
      }

      console.log(
        `⚠️ Rozet Eşleşmedi: Kullanıcıdaki '${name}' ismi veritabanında bulunamadı. Varsayılan (Mavi) basılıyor.`
      );

      return { label: name, color: "blue", icon: "fa-solid fa-star" };
    });
  } catch (error) {
    console.error("Rozet işleme hatası:", error);
    return badgeNames.map((name) => ({
      label: name,
      color: "blue",
      icon: "fa-solid fa-star",
    }));
  }
}

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userData.userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Product,
          attributes: [
            "id", "title", "price", "discountPrice", "images", 
            "isApproved", "rejectionReason", "description", "stock", 
            "category", "viewCount", "createdAt", "isShowcase"
          ],
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Profil bilgileri alınamadı." });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.userData.userId;
    
    const story = req.body.story ? xss(req.body.story.trim()) : null;
    const siftahNote = req.body.siftahNote ? xss(req.body.siftahNote.trim()) : null;
    
    let featuredProductId = req.body.featuredProductId;
    if (featuredProductId === "" || featuredProductId === "null") {
        featuredProductId = null;
    }

    const instagram = req.body.instagram ? xss(req.body.instagram.trim()) : null;
    const website = req.body.website ? xss(req.body.website.trim()) : null;
    const twitter = req.body.twitter ? xss(req.body.twitter.trim()) : null;
    const facebook = req.body.facebook ? xss(req.body.facebook.trim()) : null;
    const youtube = req.body.youtube ? xss(req.body.youtube.trim()) : null;
    const linkedin = req.body.linkedin ? xss(req.body.linkedin.trim()) : null;

    let updateData = {
      story,
      siftahNote,
      featuredProductId,
      instagram,
      website,
      twitter,
      facebook,
      youtube,
      linkedin,
    };

    if (req.files) {
      if (req.files["coverImage"]) {
        updateData.coverImage = "uploads/" + req.files["coverImage"][0].filename;
      }
      if (req.files["storyImage"]) {
        updateData.storyImage = "uploads/" + req.files["storyImage"][0].filename;
      }
    }

    await User.update(updateData, { where: { id: userId } });

    res.status(200).json({ message: "Profil ve sosyal medya hesapları güncellendi!" });
  } catch (error) {
    console.error("Profil Güncelleme Hatası:", error);
    res.status(500).json({ message: "Güncelleme başarısız." });
  }
};



exports.getAllSellersPublic = async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: { role: "seller" },
      attributes: { exclude: ["password", "email", "phone"] },
      include: [
        {
          model: Product,
          limit: 4,
          order: [["isShowcase", "DESC"], ["createdAt", "DESC"]],
          where: { isApproved: true },
          attributes: ["id", "title", "price", "discountPrice", "images", "category", "isApproved", "isShowcase"],
        },
      ],
    });

    const sellersWithDetails = await Promise.all(
      sellers.map(async (seller) => {
        const sellerJson = seller.toJSON();
        sellerJson.productCount = await Product.count({ where: { sellerId: seller.id } });
        sellerJson.badges = await enrichBadges(seller.badges);
        return sellerJson;
      })
    );

    res.status(200).json(sellersWithDetails);
  } catch (error) {
    console.error("Vitrin verileri hatası:", error);
    res.status(500).json({ message: "Vitrin verileri alınamadı." });
  }
};

// 4. TEK SATICI DETAYI GETİR (ROZET + TAKİP DESTEKLİ)
exports.getSellerById = async (req, res) => {
  try {
    const { id } = req.params;
    let currentUserId = null;
    
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          currentUserId = decoded.userId;
        } catch (err) {}
      }
    }

    const seller = await User.findByPk(id, {
      attributes: [
        "id", "name", "surname", "brandName", "category", "experience", "logoUrl", 
        "profileImage", "createdAt", "siftahNote", "story", "coverImage", "storyImage", 
        "featuredProductId", "badges", "lastActiveAt", "isApproved", "instagram", 
        "website", "twitter", "facebook", "youtube", "linkedin"
      ],
      include: [
        {
          model: Product,
          where: { isApproved: true }, 
          required: false, 
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!seller) {
      return res.status(404).json({ message: "Satıcı bulunamadı." });
    }

    const sellerData = seller.toJSON();

    sellerData.followersCount = await Follow.count({
      where: { followingId: id },
    });
    sellerData.isFollowing = false;
    if (currentUserId) {
      const followCheck = await Follow.findOne({
        where: { followerId: currentUserId, followingId: id },
      });
      if (followCheck) sellerData.isFollowing = true;
    }

    sellerData.badges = await enrichBadges(seller.badges);

    res.status(200).json(sellerData);
  } catch (error) {
    console.error("Profil Detay Hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};


exports.updateIdentity = async (req, res) => {
  try {
    const user = await User.findByPk(req.userData.userId);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    let requiresApproval = false;

    const newName = req.body.name ? xss(req.body.name.trim()) : null;
    const newSurname = req.body.surname ? xss(req.body.surname.trim()) : null;
    const newBrandName = req.body.brandName ? xss(req.body.brandName.trim()) : null;

    if (newName && newName !== user.name) {
      user.pendingName = newName;
      requiresApproval = true;
    }
    if (newSurname && newSurname !== user.surname) {
      user.pendingSurname = newSurname;
      requiresApproval = true;
    }
    if (newBrandName && newBrandName !== user.brandName) {
      user.pendingBrandName = newBrandName;
      requiresApproval = true;
    }

    if (req.files) {
      if (req.files.profileImage) {
        user.pendingProfileImage = req.files.profileImage[0].path.replace(/\\/g, "/");
        requiresApproval = true;
      }
      if (req.files.logo) {
        user.pendingLogoUrl = req.files.logo[0].path.replace(/\\/g, "/");
        requiresApproval = true;
      }
    }

    if (requiresApproval) {
      user.isUpdatePending = true;
    }

    if (req.body.instagram !== undefined) user.instagram = req.body.instagram ? xss(req.body.instagram.trim()) : null;
    if (req.body.website !== undefined) user.website = req.body.website ? xss(req.body.website.trim()) : null;
    if (req.body.twitter !== undefined) user.twitter = req.body.twitter ? xss(req.body.twitter.trim()) : null;
    if (req.body.facebook !== undefined) user.facebook = req.body.facebook ? xss(req.body.facebook.trim()) : null;
    if (req.body.youtube !== undefined) user.youtube = req.body.youtube ? xss(req.body.youtube.trim()) : null;
    if (req.body.linkedin !== undefined) user.linkedin = req.body.linkedin ? xss(req.body.linkedin.trim()) : null;

    await user.save();

    res.status(200).json({ 
      message: requiresApproval 
        ? "Kimlik bilgileri onay için Admin'e gönderildi. Sosyal medya hesapları güncellendi." 
        : "Bilgiler başarıyla güncellendi." 
    });

  } catch (error) {
    console.error("Update Identity Error:", error);
    res.status(500).json({ message: "Güncelleme isteği oluşturulamadı." });
  }
};


exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userData.userId; 
        const name = req.body.name ? xss(req.body.name.trim()) : null;
        const surname = req.body.surname ? xss(req.body.surname.trim()) : null;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }

        user.name = name;
        user.surname = surname;
        await user.save();

        res.status(200).json({ message: "Profil güncellendi.", user: { name: user.name, surname: user.surname } });

    } catch (error) {
        console.error("Profil Update Hatası:", error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

exports.updateIdentityRequest = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const name = req.body.name ? xss(req.body.name.trim()) : null;
    const surname = req.body.surname ? xss(req.body.surname.trim()) : null;
    const brandName = req.body.brandName ? xss(req.body.brandName.trim()) : null;
    const siftahNote = req.body.siftahNote ? xss(req.body.siftahNote.trim()) : null;
    
    let featuredProductId = req.body.featuredProductId;
    if (featuredProductId === "" || featuredProductId === "null") {
        featuredProductId = null;
    }

    const instagram = req.body.instagram ? xss(req.body.instagram.trim()) : null;
    const website = req.body.website ? xss(req.body.website.trim()) : null;
    const twitter = req.body.twitter ? xss(req.body.twitter.trim()) : null;
    const facebook = req.body.facebook ? xss(req.body.facebook.trim()) : null;
    const youtube = req.body.youtube ? xss(req.body.youtube.trim()) : null;
    const linkedin = req.body.linkedin ? xss(req.body.linkedin.trim()) : null;

    const files = req.files || {};

    const updates = {
      isUpdatePending: true,
      pendingName: name,
      pendingSurname: surname,
      pendingBrandName: brandName,
      pendingSiftahNote: siftahNote,
      pendingFeaturedProductId: featuredProductId,
      pendingInstagram: instagram,
      pendingWebsite: website,
      pendingTwitter: twitter,
      pendingFacebook: facebook,
      pendingYoutube: youtube,
      pendingLinkedin: linkedin,
    };

    if (files.profileImage && files.profileImage.length > 0) {
      updates.pendingProfileImage = files.profileImage[0].path.replace(/\\/g, "/");
    }
    if (files.logo && files.logo.length > 0) {
      updates.pendingLogoUrl = files.logo[0].path.replace(/\\/g, "/");
    }
    if (files.coverImage && files.coverImage.length > 0) {
      updates.pendingCoverImage = files.coverImage[0].path.replace(/\\/g, "/");
    }
    if (files.storyImage && files.storyImage.length > 0) {
      updates.pendingStoryImage = files.storyImage[0].path.replace(/\\/g, "/");
    }

    await User.update(updates, { where: { id: userId } });

    res.status(200).json({
      success: true,
      message: "Tüm değişiklik talepleriniz alındı. Admin onayından sonra vitrininizde görünecektir.",
    });
  } catch (error) {
    console.error("Kimlik güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası oluştu.", error: error.message });
  }
};