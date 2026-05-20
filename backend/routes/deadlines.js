const express = require('express');
const router = express.Router();
const { getDeadlines, getDeadline, createDeadline, updateDeadline, completeDeadline, deleteDeadline } = require('../controllers/deadlineController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getDeadlines).post(protect, createDeadline);
router.route('/:id').get(protect, getDeadline).put(protect, updateDeadline).delete(protect, deleteDeadline);
router.patch('/:id/complete', protect, completeDeadline);

module.exports = router;
