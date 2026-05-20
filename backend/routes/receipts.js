const express = require('express');
const router = express.Router();
const { getReceipts, getReceipt, createReceipt, updateReceipt, deleteReceipt, getFolders } = require('../controllers/receiptController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/folders', protect, getFolders);
router.route('/').get(protect, getReceipts).post(protect, upload.single('file'), createReceipt);
router.route('/:id').get(protect, getReceipt).put(protect, upload.single('file'), updateReceipt).delete(protect, deleteReceipt);

module.exports = router;
