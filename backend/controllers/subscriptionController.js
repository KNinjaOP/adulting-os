const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');

exports.getSubscriptions = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (category) query.category = category;

    let subs = await Subscription.find(query).sort({ renewalDate: 1 });
    if (search) subs = subs.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    let monthlyTotal = 0;
    subs.filter(s => s.status === 'active').forEach(s => {
      if (s.cycle === 'monthly') monthlyTotal += s.cost;
      else if (s.cycle === 'yearly') monthlyTotal += s.cost / 12;
      else if (s.cycle === 'quarterly') monthlyTotal += s.cost / 3;
      else if (s.cycle === 'weekly') monthlyTotal += s.cost * 4;
    });

    res.json({
      success: true, count: subs.length, data: subs,
      analytics: { monthlyTotal: Math.round(monthlyTotal), yearlyTotal: Math.round(monthlyTotal * 12) }
    });
  } catch (err) { next(err); }
};

exports.getSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
};

exports.createSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.create({ ...req.body, user: req.user._id });
    const daysLeft = Math.ceil((new Date(sub.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) {
      await Notification.create({
        user: req.user._id, type: 'subscription_renewal',
        title: 'Subscription Renewing Soon',
        message: `${sub.name} renews in ${daysLeft} days (₹${sub.cost})`,
        priority: 'medium', linkedModule: 'subscriptions', linkedId: sub._id,
      });
    }
    res.status(201).json({ success: true, data: sub });
  } catch (err) { next(err); }
};

exports.updateSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
};

exports.deleteSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.json({ success: true, message: 'Subscription deleted' });
  } catch (err) { next(err); }
};

exports.getSubscriptionAnalytics = async (req, res, next) => {
  try {
    const byCategory = await Subscription.aggregate([
      { $match: { user: req.user._id, status: 'active' } },
      { $group: { _id: '$category', total: { $sum: '$cost' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    res.json({ success: true, data: { byCategory } });
  } catch (err) { next(err); }
};
