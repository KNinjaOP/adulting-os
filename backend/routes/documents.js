const express = require('express');
const router = express.Router();
const { getDocuments, getDocument, createDocument, updateDocument, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.route('/').get(protect, getDocuments).post(protect, upload.single('file'), createDocument);
router.route('/:id').get(protect, getDocument).put(protect, upload.single('file'), updateDocument).delete(protect, deleteDocument);

module.exports = router;
