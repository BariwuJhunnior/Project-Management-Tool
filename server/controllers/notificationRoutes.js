const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.use(protect); // All notification routes are protected

router.route("/").get(getUserNotifications);

router.route("/mark-all-read").patch(markAllAsRead);

router.route("/:id").delete(deleteNotification);

router.route("/:id/read").patch(markAsRead);

module.exports = router;
