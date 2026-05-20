const express = require('express');
const router = express.Router();
const { getDeliveries, getDelivery, createDelivery, updateDelivery, updateStatus, deleteDelivery } = require('../controllers/deliveryController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getDeliveries).post(protect, createDelivery);
router.route('/:id').get(protect, getDelivery).put(protect, updateDelivery).delete(protect, deleteDelivery);
router.patch('/:id/status', protect, updateStatus);

module.exports = router;
