const Story = require("../models/Story");
const User = require("../models/user");
const StoryLike = require("../models/StoryLike");

// 1. Yeni Hikaye Ekle (Satıcı Paneli İçin)
exports.addStory = async (req, res) => {
  try {
    const { title, content } = req.body;
    // Resim varsa yolunu al, yoksa null
    const coverImage = req.file ? "uploads/" + req.file.filename : null;
    const sellerId = req.userData.userId; // Auth middleware'den gelen ID

    const newStory = await Story.create({
      title,
      content,
      coverImage,
      sellerId,
    });

    res.status(201).json({ message: "Hikaye paylaşıldı!", story: newStory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hikaye eklenirken hata oluştu." });
  }
};

// 2. Tüm Hikayeleri Getir (Vitrin Sayfası İçin)
exports.getAllStoriesPublic = async (req, res) => {
  try {
    const stories = await Story.findAll({
      include: {
        model: User,
        attributes: ["id", "name", "brandName", "profileImage", "logoUrl"], // Yazarın bilgileri
      },
      order: [["createdAt", "DESC"]], // En yeni en üstte
    });
    res.status(200).json(stories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hikayeler yüklenemedi." });
  }
};


exports.getStoryById = async (req, res) => {
  try {
    const storyId = req.params.id;
    
    // Şimdilik hikayeyi ve beğeni sayısını çekelim
    const story = await Story.findByPk(storyId, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "brandName", "profileImage", "logoUrl", "isApproved"],
        },
        {
          model: StoryLike,
          attributes: ["userId"]
        }
      ],
    });

    if (!story) return res.status(404).json({ message: "Hikaye bulunamadı." });
    
    res.status(200).json(story);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hata oluştu." });
  }
};


// 4. Hikaye Beğen / Beğeni Kaldır (Toggle)
exports.toggleLike = async (req, res) => {
    try {
        const storyId = req.params.id;
        const userId = req.userData.userId; // Auth middleware'den gelir

        const existingLike = await StoryLike.findOne({ where: { storyId, userId } });

        if (existingLike) {
            await existingLike.destroy(); // Beğeniyi kaldır
            res.status(200).json({ action: 'unliked', message: "Beğeni kaldırıldı" });
        } else {
            await StoryLike.create({ storyId, userId }); // Beğeni ekle
            res.status(200).json({ action: 'liked', message: "Hikaye beğenildi" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "İşlem başarısız." });
    }
};

// 5. Görüntülenme Sayısını Artır
exports.incrementView = async (req, res) => {
    try {
        const story = await Story.findByPk(req.params.id);
        if(!story) return res.status(404).json({message:"Yok"});
        
        // Story modelinde 'viewCount' adında bir kolon olduğunu varsayıyoruz
        // Eğer yoksa Model dosyana ekle: viewCount: { type: DataTypes.INTEGER, defaultValue: 0 }
        story.viewCount = (story.viewCount || 0) + 1;
        await story.save();
        
        res.status(200).json({ views: story.viewCount });
    } catch (error) {
        res.status(500).json({ message: "Hata" });
    }
};