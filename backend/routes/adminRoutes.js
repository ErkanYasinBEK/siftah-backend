const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const checkAuth = require("../middleware/auth");

const checkAdmin = (req, res, next) => {
  if (!req.userData || req.userData.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Erişim Reddedildi! Sadece Admin girebilir." });
  }
  next();
};

router.get("/pending", checkAuth, checkAdmin, adminController.getPendingSellers);
router.get("/approved", checkAuth, checkAdmin, adminController.getApprovedSellers);
router.put("/approve/:id", checkAuth, checkAdmin, adminController.approveSeller);
router.delete("/reject/:id", checkAuth, checkAdmin, adminController.rejectSeller);

router.post("/approve-update/:id", checkAuth, checkAdmin, adminController.approveUpdate);
router.post("/reject-update/:id", checkAuth, checkAdmin, adminController.rejectUpdate);

router.post('/create-admin', checkAuth, checkAdmin, adminController.createSubAdmin);
router.get('/list-admins', checkAuth, checkAdmin, adminController.getAllAdmins);
router.put('/update-admin/:id', checkAuth, checkAdmin, adminController.updateSubAdmin);
router.delete('/delete-admin/:id', checkAuth, checkAdmin, adminController.deleteSubAdmin);

router.get("/badges/list", checkAuth, checkAdmin, adminController.getAllBadges);
router.post("/badges/add", checkAuth, checkAdmin, adminController.createBadge);
router.put("/badge/:id", checkAuth, checkAdmin, adminController.updateBadges); // Kullanıcıya rozet ver
router.delete("/badges/delete/:id", checkAuth, checkAdmin, adminController.deleteBadge);

router.get("/stats", checkAuth, checkAdmin, adminController.getStats);
router.get('/logs', checkAuth, checkAdmin, adminController.getAdminLogs);

router.get('/messages/all', checkAuth, checkAdmin, adminController.getAllAuditConversations);
router.get('/messages/detail/:user1Id/:user2Id', checkAuth, checkAdmin, adminController.getAuditChatDetails);

router.get("/fix-scores", checkAuth, checkAdmin, adminController.fixAllScores);
router.get("/reset-products", checkAuth, checkAdmin, adminController.resetAllProducts);

router.get("/products/pending", checkAuth, checkAdmin, adminController.getPendingProducts);
router.get("/products/all-marketplace", checkAuth, checkAdmin, adminController.getAllMarketplaceProducts);

router.put('/approve-product/:id', checkAuth, checkAdmin, adminController.approveProduct);
router.delete('/delete-product/:id', checkAuth, checkAdmin, adminController.deleteProduct);
router.put('/archive-product/:id', checkAuth, checkAdmin, adminController.archiveProduct);

router.get("/users/all-list", checkAuth, checkAdmin, adminController.getAllUsers);
router.put('/users/toggle-ban/:id', checkAuth, checkAdmin, adminController.toggleBanUser);

module.exports = router;