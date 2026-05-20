const express = require('express');
const router = express.Router();
const { getHealthRecords, getHealthRecord, createHealthRecord, updateHealthRecord, deleteHealthRecord, getFamilyMembers } = require('../controllers/healthController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/family-members', protect, getFamilyMembers);
router.route('/').get(protect, getHealthRecords).post(protect, upload.single('file'), createHealthRecord);
router.route('/:id').get(protect, getHealthRecord).put(protect, upload.single('file'), updateHealthRecord).delete(protect, deleteHealthRecord);

module.exports = router;
