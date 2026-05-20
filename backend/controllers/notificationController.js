const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const { isRead, type, page = 1, limit = 30 } = req.query;
    const query = { user: req.user._id };
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, count: notifications.length, total, unreadCount, data: notifications });
  } catch (err) { next(err); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
};

exports.clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ user: req.user._id, isRead: true });
    res.json({ success: true, message: 'Cleared all read notifications' });
  } catch (err) { next(err); }
};
