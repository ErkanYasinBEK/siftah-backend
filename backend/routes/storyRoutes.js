// routes/storyRoutes.js
const express = require("express");
const router = express.Router();
const storyController = require("../controllers/storyController");
const checkAuth = require("../middleware/auth"); 
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/webp") {
        cb(null, true);
    } else {
        cb(new Error("Desteklenmeyen dosya formatı! Sadece resim yükleyebilirsiniz."), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 
    }
});

router.post("/add", checkAuth, upload.single("coverImage"), storyController.addStory);

router.get("/public", storyController.getAllStoriesPublic);

router.get("/:id", storyController.getStoryById);

router.post("/like/:id", checkAuth, storyController.toggleLike);

router.post("/view/:id", storyController.incrementView);

module.exports = router;