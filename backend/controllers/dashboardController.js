const Document = require('../models/Document');
const Subscription = require('../models/Subscription');
const HealthRecord = require('../models/HealthRecord');
const Vehicle = require('../models/Vehicle');
const Warranty = require('../models/Warranty');
const Delivery = require('../models/Delivery');
const Deadline = require('../models/Deadline');
const Notification = require('../models/Notification');
const Receipt = require('../models/Receipt');

// @desc   Get dashboard summary
// @route  GET /api/v1/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      expiringDocs,
      activeSubscriptions,
      upcomingDeadlines,
      pendingDeliveries,
      expiringWarranties,
      unreadNotifications,
      recentReceipts,
      totalSubCost,
    ] = await Promise.all([
      Document.find({ user: userId, expiryDate: { $gte: now, $lte: thirtyDaysFromNow } })
        .sort({ expiryDate: 1 }).limit(5).select('title type expiryDate'),
      Subscription.find({ user: userId, status: 'active' })
        .sort({ renewalDate: 1 }).limit(5).select('name cost cycle renewalDate logo category'),
      Deadline.find({ user: userId, status: { $in: ['pending', 'overdue'] }, dueDate: { $gte: now, $lte: thirtyDaysFromNow } })
        .sort({ dueDate: 1 }).limit(5).select('title dueDate priority category'),
      Delivery.find({ user: userId, status: { $in: ['ordered', 'processing', 'shipped', 'out_for_delivery'] } })
        .sort({ estimatedDelivery: 1 }).limit(5).select('itemName platform status estimatedDelivery'),
      Warranty.find({ user: userId, warrantyEndDate: { $gte: now, $lte: thirtyDaysFromNow }, status: 'active' })
        .sort({ warrantyEndDate: 1 }).limit(5).select('productName brand warrantyEndDate'),
      Notification.countDocuments({ user: userId, isRead: false }),
      Receipt.find({ user: userId }).sort({ createdAt: -1 }).limit(5).select('title storeName amount date'),
      Subscription.aggregate([
        { $match: { user: userId, status: 'active' } },
        { $group: { _id: '$cycle', total: { $sum: '$cost' } } },
      ]),
    ]);

    // Calculate monthly subscription spend
    let monthlySubSpend = 0;
    totalSubCost.forEach(item => {
      if (item._id === 'monthly') monthlySubSpend += item.total;
      else if (item._id === 'yearly') monthlySubSpend += item.total / 12;
      else if (item._id === 'quarterly') monthlySubSpend += item.total / 3;
      else if (item._id === 'weekly') monthlySubSpend += item.total * 4;
    });

    // Count overdue deadlines
    const overdueDeadlines = await Deadline.countDocuments({
      user: userId,
      status: 'pending',
      dueDate: { $lt: now },
    });

    // Vehicles with expiring docs
    const vehiclesWithExpiringInsurance = await Vehicle.find({
      user: userId,
      'insurance.expiryDate': { $gte: now, $lte: thirtyDaysFromNow },
    }).select('make model type insurance.expiryDate');

    // Stats counts
    const [totalDocs, totalSubs, totalVehicles, totalDeliveries] = await Promise.all([
      Document.countDocuments({ user: userId }),
      Subscription.countDocuments({ user: userId, status: 'active' }),
      Vehicle.countDocuments({ user: userId }),
      Delivery.countDocuments({ user: userId, status: { $in: ['ordered', 'processing', 'shipped', 'out_for_delivery'] } }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalDocuments: totalDocs,
          activeSubscriptions: totalSubs,
          totalVehicles,
          activeDeliveries: totalDeliveries,
          unreadNotifications,
          monthlySubscriptionSpend: Math.round(monthlySubSpend),
          overdueDeadlines,
        },
        expiringDocs,
        activeSubscriptions,
        upcomingDeadlines,
        pendingDeliveries,
        expiringWarranties,
        vehiclesWithExpiringInsurance,
        recentReceipts,
      },
    });
  } catch (err) { next(err); }
};
