const Vehicle = require('../models/Vehicle');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

exports.getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) { next(err); }
};

exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, user: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

exports.createVehicle = async (req, res, next) => {
  try {
    const body = { ...req.body, user: req.user._id };
    if (req.body.insurance && typeof req.body.insurance === 'string') body.insurance = JSON.parse(req.body.insurance);
    if (req.body.puc && typeof req.body.puc === 'string') body.puc = JSON.parse(req.body.puc);
    if (req.body.rc && typeof req.body.rc === 'string') body.rc = JSON.parse(req.body.rc);

    const vehicle = await Vehicle.create(body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) { next(err); }
};

exports.addFuelLog = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, user: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    vehicle.fuelLogs.push(req.body);
    await vehicle.save();
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

exports.addServiceHistory = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, user: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    vehicle.serviceHistory.push(req.body);
    await vehicle.save();
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

exports.getVehicleExpenseAnalytics = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, user: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const fuelExpense = vehicle.fuelLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
    const serviceExpense = vehicle.serviceHistory.reduce((sum, s) => sum + (s.cost || 0), 0);
    const challanExpense = vehicle.challans.reduce((sum, c) => sum + (c.amount || 0), 0);

    res.json({ success: true, data: { fuelExpense, serviceExpense, challanExpense, total: fuelExpense + serviceExpense + challanExpense } });
  } catch (err) { next(err); }
};
