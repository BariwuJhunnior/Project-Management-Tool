const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getUserNotifications);
router.patch("/mark-all-read", markAllAsRead);
router.patch("/:id/read", markAsRead);

module.exports = router;
