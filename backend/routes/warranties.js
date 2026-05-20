const express = require('express');
const router = express.Router();
const { getWarranties, getWarranty, createWarranty, updateWarranty, deleteWarranty } = require('../controllers/warrantyController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.route('/').get(protect, getWarranties).post(protect, upload.single('invoice'), createWarranty);
router.route('/:id').get(protect, getWarranty).put(protect, upload.single('invoice'), updateWarranty).delete(protect, deleteWarranty);

module.exports = router;
