const express = require('express');
const router = express.Router();
const { getSubscriptions, getSubscription, createSubscription, updateSubscription, deleteSubscription, getSubscriptionAnalytics } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/analytics', protect, getSubscriptionAnalytics);
router.route('/').get(protect, getSubscriptions).post(protect, createSubscription);
router.route('/:id').get(protect, getSubscription).put(protect, updateSubscription).delete(protect, deleteSubscription);

module.exports = router;
