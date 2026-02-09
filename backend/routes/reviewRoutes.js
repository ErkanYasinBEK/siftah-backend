const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const checkAuth = require("../middleware/auth"); 

router.post("/", checkAuth, reviewController.addReview);

router.get("/check/:productId", checkAuth, reviewController.checkReview);

router.delete("/:id", checkAuth, reviewController.deleteReview);

router.put("/:id", checkAuth, reviewController.updateReview);

module.exports = router;