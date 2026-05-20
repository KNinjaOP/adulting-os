const express = require('express');
const router = express.Router();
const { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, addFuelLog, addServiceHistory, getVehicleExpenseAnalytics } = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getVehicles).post(protect, createVehicle);
router.route('/:id').get(protect, getVehicle).put(protect, updateVehicle).delete(protect, deleteVehicle);
router.post('/:id/fuel-log', protect, addFuelLog);
router.post('/:id/service', protect, addServiceHistory);
router.get('/:id/analytics', protect, getVehicleExpenseAnalytics);

module.exports = router;
