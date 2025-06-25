const User = require('../models/User');

// Get all entrepreneurs
exports.getEntrepreneurs = async (req, res) => {
  try {
    const entrepreneurs = await User.find({ 
      role: 'entrepreneur',
      _id: { $ne: req.user._id } // Exclude the current user
    })
    .select('name email role entrepreneurProfile')
    .populate('entrepreneurProfile');

    res.json(entrepreneurs);
  } catch (error) {
    console.error('Error fetching entrepreneurs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 