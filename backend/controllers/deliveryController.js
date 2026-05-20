const Delivery = require('../models/Delivery');

exports.getDeliveries = async (req, res, next) => {
  try {
    const { status, platform, search } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (platform) query.platform = platform;
    if (search) query.$text = { $search: search };

    const deliveries = await Delivery.find(query).sort({ orderDate: -1 });
    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (err) { next(err); }
};

exports.getDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({ _id: req.params.id, user: req.user._id });
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({ success: true, data: delivery });
  } catch (err) { next(err); }
};

exports.createDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: delivery });
  } catch (err) { next(err); }
};

exports.updateDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({ success: true, data: delivery });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'delivered') update.deliveredDate = new Date();

    const delivery = await Delivery.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, update, { new: true }
    );
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({ success: true, data: delivery });
  } catch (err) { next(err); }
};

exports.deleteDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({ success: true, message: 'Delivery deleted' });
  } catch (err) { next(err); }
};
