const Application = require('../models/Application');
const { STATUSES } = require('../models/Application');
const asyncHandler = require('../middleware/asyncHandler');

const FIELDS = ['company', 'role', 'status', 'appliedDate', 'link', 'notes'];

// Only copy allowed fields, so clients can't set `user` or other fields
const pickFields = (body) =>
  FIELDS.reduce((acc, key) => (body[key] !== undefined ? { ...acc, [key]: body[key] } : acc), {});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/applications?status=Applied&search=google
const getApplications = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (STATUSES.includes(req.query.status)) filter.status = req.query.status;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ company: rx }, { role: rx }];
  }
  const applications = await Application.find(filter).sort({ createdAt: -1 });
  res.json(applications);
});

// GET /api/applications/stats
const getStats = asyncHandler(async (req, res) => {
  const rows = await Application.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  rows.forEach((r) => { counts[r._id] = r.count; });
  res.json({ total: rows.reduce((n, r) => n + r.count, 0), counts });
});

// POST /api/applications
const createApplication = asyncHandler(async (req, res) => {
  const application = await Application.create({ ...pickFields(req.body), user: req.user._id });
  res.status(201).json(application);
});

// PUT /api/applications/:id
const updateApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },   // ownership check
    pickFields(req.body),
    { new: true, runValidators: true }
  );
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }
  res.json(application);
});

// DELETE /api/applications/:id
const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }
  res.json({ message: 'Application deleted' });
});

module.exports = { getApplications, getStats, createApplication, updateApplication, deleteApplication };