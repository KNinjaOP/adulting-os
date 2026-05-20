const Deadline = require('../models/Deadline');
const Notification = require('../models/Notification');

exports.getDeadlines = async (req, res, next) => {
  try {
    const { status, category, priority, search } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) query.$text = { $search: search };

    // Auto-mark overdue
    await Deadline.updateMany(
      { user: req.user._id, status: 'pending', dueDate: { $lt: new Date() } },
      { status: 'overdue' }
    );

    const deadlines = await Deadline.find(query).sort({ dueDate: 1 });
    res.json({ success: true, count: deadlines.length, data: deadlines });
  } catch (err) { next(err); }
};

exports.getDeadline = async (req, res, next) => {
  try {
    const deadline = await Deadline.findOne({ _id: req.params.id, user: req.user._id });
    if (!deadline) return res.status(404).json({ success: false, message: 'Deadline not found' });
    res.json({ success: true, data: deadline });
  } catch (err) { next(err); }
};

exports.createDeadline = async (req, res, next) => {
  try {
    const deadline = await Deadline.create({
      ...req.body, user: req.user._id,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
    });
    const daysLeft = Math.ceil((new Date(deadline.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= deadline.reminderDaysBefore) {
      await Notification.create({
        user: req.user._id, type: 'deadline',
        title: 'Upcoming Deadline',
        message: `"${deadline.title}" is due in ${daysLeft} days`,
        priority: deadline.priority === 'critical' ? 'critical' : 'high',
        linkedModule: 'deadlines', linkedId: deadline._id,
      });
    }
    res.status(201).json({ success: true, data: deadline });
  } catch (err) { next(err); }
};

exports.updateDeadline = async (req, res, next) => {
  try {
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(t => t.trim());
    }
    const deadline = await Deadline.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!deadline) return res.status(404).json({ success: false, message: 'Deadline not found' });
    res.json({ success: true, data: deadline });
  } catch (err) { next(err); }
};

exports.completeDeadline = async (req, res, next) => {
  try {
    const deadline = await Deadline.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );
    if (!deadline) return res.status(404).json({ success: false, message: 'Deadline not found' });
    res.json({ success: true, data: deadline });
  } catch (err) { next(err); }
};

exports.deleteDeadline = async (req, res, next) => {
  try {
    const deadline = await Deadline.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deadline) return res.status(404).json({ success: false, message: 'Deadline not found' });
    res.json({ success: true, message: 'Deadline deleted' });
  } catch (err) { next(err); }
};
