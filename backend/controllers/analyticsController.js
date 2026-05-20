const Receipt = require('../models/Receipt');
const Subscription = require('../models/Subscription');
const HealthRecord = require('../models/HealthRecord');
const Vehicle = require('../models/Vehicle');

exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Monthly receipt spending (last 6 months)
    const monthlySpending = await Receipt.aggregate([
      { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Receipt by category
    const spendingByCategory = await Receipt.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Subscription by category
    const subscriptionByCategory = await Subscription.aggregate([
      { $match: { user: userId, status: 'active' } },
      { $group: { _id: '$category', total: { $sum: '$cost' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Health records by type
    const healthByType = await HealthRecord.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Vehicle expenses
    const vehicles = await Vehicle.find({ user: userId });
    const vehicleExpenses = vehicles.map(v => ({
      name: `${v.make} ${v.model}`,
      fuel: v.fuelLogs.reduce((s, l) => s + (l.totalCost || 0), 0),
      service: v.serviceHistory.reduce((s, h) => s + (h.cost || 0), 0),
    }));

    // Total receipt amount
    const totalSpent = await Receipt.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      data: {
        monthlySpending,
        spendingByCategory,
        subscriptionByCategory,
        healthByType,
        vehicleExpenses,
        totalSpent: totalSpent[0]?.total || 0,
      },
    });
  } catch (err) { next(err); }
};
