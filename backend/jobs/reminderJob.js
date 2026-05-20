const cron = require('node-cron');
const Document = require('../models/Document');
const Subscription = require('../models/Subscription');
const Warranty = require('../models/Warranty');
const Deadline = require('../models/Deadline');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail, getReminderEmailHTML } = require('../utils/emailTemplates');

const getDaysLeft = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

const createNotif = async (userId, type, title, message, priority, module, linkedId) => {
  const exists = await Notification.findOne({ user: userId, linkedId, type });
  if (!exists) {
    await Notification.create({ user: userId, type, title, message, priority, linkedModule: module, linkedId });
  }
};

const runDailyReminders = async () => {
  console.log('[CRON] Running daily reminder job at', new Date().toISOString());
  try {
    const users = await User.find({ isVerified: true, 'preferences.emailReminders': true });

    for (const user of users) {
      const userId = user._id;
      const alerts = [];
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // 1. Expiring documents
      const expiringDocs = await Document.find({ user: userId, expiryDate: { $gte: now, $lte: thirtyDays }, reminderSent: false });
      for (const doc of expiringDocs) {
        const days = getDaysLeft(doc.expiryDate);
        await createNotif(userId, 'document_expiry', 'Document Expiring', `${doc.title} expires in ${days} days`, days <= 7 ? 'high' : 'medium', 'documents', doc._id);
        alerts.push({ type: 'Document', title: doc.title, due: `Expires in ${days} days` });
        if (days <= 3) { doc.reminderSent = true; await doc.save(); }
      }

      // 2. Subscription renewals
      const renewingSubs = await Subscription.find({ user: userId, status: 'active', renewalDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } });
      for (const sub of renewingSubs) {
        const days = getDaysLeft(sub.renewalDate);
        await createNotif(userId, 'subscription_renewal', 'Subscription Renewal', `${sub.name} renews in ${days} days (₹${sub.cost})`, 'medium', 'subscriptions', sub._id);
        alerts.push({ type: 'Subscription', title: sub.name, due: `Renews in ${days} days — ₹${sub.cost}` });
      }

      // 3. Expiring warranties
      const expiringWarranties = await Warranty.find({ user: userId, status: 'active', warrantyEndDate: { $gte: now, $lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) } });
      for (const w of expiringWarranties) {
        const days = getDaysLeft(w.warrantyEndDate);
        await createNotif(userId, 'warranty_expiry', 'Warranty Expiring', `Warranty for ${w.productName} expires in ${days} days`, days <= 7 ? 'high' : 'medium', 'warranties', w._id);
        alerts.push({ type: 'Warranty', title: w.productName, due: `Expires in ${days} days` });
      }

      // 4. Upcoming deadlines
      const upcomingDeadlines = await Deadline.find({ user: userId, status: 'pending', dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } });
      for (const dl of upcomingDeadlines) {
        const days = getDaysLeft(dl.dueDate);
        await createNotif(userId, 'deadline', 'Upcoming Deadline', `"${dl.title}" is due in ${days} days`, dl.priority === 'critical' ? 'critical' : 'high', 'deadlines', dl._id);
        alerts.push({ type: 'Deadline', title: dl.title, due: `Due in ${days} days` });
      }

      // 5. Vehicle insurance/PUC expiry
      const vehicles = await Vehicle.find({ user: userId });
      for (const v of vehicles) {
        if (v.insurance?.expiryDate) {
          const days = getDaysLeft(v.insurance.expiryDate);
          if (days >= 0 && days <= 14) {
            await createNotif(userId, 'vehicle_renewal', 'Vehicle Insurance Expiring', `Insurance for ${v.make} ${v.model} expires in ${days} days`, days <= 7 ? 'high' : 'medium', 'vehicles', v._id);
            alerts.push({ type: 'Vehicle', title: `${v.make} ${v.model} Insurance`, due: `Expires in ${days} days` });
          }
        }
        if (v.puc?.expiryDate) {
          const days = getDaysLeft(v.puc.expiryDate);
          if (days >= 0 && days <= 7) {
            await createNotif(userId, 'vehicle_renewal', 'Vehicle PUC Expiring', `PUC for ${v.make} ${v.model} expires in ${days} days`, 'high', 'vehicles', v._id);
            alerts.push({ type: 'Vehicle', title: `${v.make} ${v.model} PUC`, due: `Expires in ${days} days` });
          }
        }
      }

      // Send consolidated email if there are alerts
      if (alerts.length > 0 && user.email) {
        try {
          await sendEmail({
            to: user.email,
            subject: `⚠️ ${alerts.length} Reminder${alerts.length > 1 ? 's' : ''} — Adulting OS`,
            html: getReminderEmailHTML(user.name, alerts),
          });
          console.log(`[CRON] Email sent to ${user.email} with ${alerts.length} alerts`);
        } catch (emailErr) {
          console.error(`[CRON] Failed to send email to ${user.email}:`, emailErr.message);
        }
      }
    }

    // Auto-mark overdue deadlines
    await Deadline.updateMany({ status: 'pending', dueDate: { $lt: now } }, { status: 'overdue' });
    // Auto-mark expired warranties
    await Warranty.updateMany({ status: 'active', warrantyEndDate: { $lt: now } }, { status: 'expired' });

    console.log(`[CRON] Daily job complete. Processed ${users.length} users.`);
  } catch (err) {
    console.error('[CRON] Error in daily reminder job:', err.message);
  }
};

// Run daily at 8:00 AM
cron.schedule('0 8 * * *', runDailyReminders, { timezone: 'Asia/Kolkata' });

// Also export for manual trigger (testing)
module.exports = { runDailyReminders };
