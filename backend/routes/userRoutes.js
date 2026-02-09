const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkAuth = require("../middleware/auth"); 
const multer = require("multer");
const path = require("path");
const Follow = require("../models/Follow"); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.get("/me", checkAuth, userController.getMyProfile);

router.put(
  "/me",
  checkAuth,
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'storyImage', maxCount: 1 } 
  ]),
  userController.updateMyProfile
);

router.put('/update-identity', checkAuth, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }, 
    { name: 'storyImage', maxCount: 1 }
]), userController.updateIdentityRequest);

router.get("/sellers/public", userController.getAllSellersPublic);

router.post("/:id/follow", checkAuth, async (req, res) => {
  await Follow.sync({ alter: true });

  try {
    const followingId = req.params.id; 
    const followerId = req.userData.userId; 

    if (Number(followingId) === Number(followerId)) {
      return res.status(400).json({ message: "Kendini takip edemezsin." });
    }

    const existingFollow = await Follow.findOne({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      await existingFollow.destroy();
      const newCount = await Follow.count({ where: { followingId } });

      return res.status(200).json({
        success: true,
        isFollowing: false,
        followersCount: newCount,
      });
    } else {
      await Follow.create({ followerId, followingId });
      const newCount = await Follow.count({ where: { followingId } });

      return res.status(200).json({
        success: true,
        isFollowing: true,
        followersCount: newCount,
      });
    }
  } catch (error) {
    console.error("Takip İşlemi Hatası:", error);
    res.status(500).json({ message: "İşlem başarısız." });
  }
});

router.get("/:id", userController.getSellerById);

router.put('/profile', checkAuth, userController.updateProfile);

module.exports = router;