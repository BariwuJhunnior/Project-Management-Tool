const Notification = require("../models/Notification");

/**
 * Creates a notification record and emits a live Socket.io event.
 */
const createAndSendNotification = async (
  req,
  { recipient, type, task, project, message },
) => {
  const sender = req.user._id;

  // Prevent notifying oneself
  if (recipient.toString() === sender.toString()) return;

  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      task,
      project,
      message,
    });

    await notification.populate("sender", "name email role");

    // Emit live event via Socket.io to the recipient's room
    const io = req.app.get("socketio");
    if (io) {
      io.to(`user:${recipient}`).emit("notification:new", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error generating notification:", error);
  }
};

module.exports = { createAndSendNotification };
