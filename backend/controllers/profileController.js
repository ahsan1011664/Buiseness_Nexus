const User = require('../models/User');

// Get user profile by ID
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'name email role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update own profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Prevent password update through this route
    delete updates.email; // Prevent email update through this route
    delete updates.role; // Prevent role update through this route

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recommended startups for investors
exports.getRecommendedStartups = async (req, res) => {
  try {
    // Get the investor's profile to check investment interests
    const investor = await User.findById(req.user.id).select('investorProfile');
    
    // Build the query based on investor's interests
    let query = { role: 'entrepreneur' };
    
    if (investor.investorProfile?.investmentInterests?.length > 0) {
      query['startup.industry'] = { 
        $in: investor.investorProfile.investmentInterests 
      };
    }

    // Find matching startups
    const startups = await User.find(query)
      .select('name startup bio')
      .sort('-createdAt')
      .limit(10);

    res.json(startups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recommended investors for entrepreneurs
exports.getRecommendedInvestors = async (req, res) => {
  try {
    // Get the entrepreneur's startup to check industry
    const entrepreneur = await User.findById(req.user.id).select('startup');
    
    // Build the query based on startup's industry
    let query = { role: 'investor' };
    
    if (entrepreneur.startup?.industry) {
      query['investorProfile.investmentInterests'] = entrepreneur.startup.industry;
    }

    // Find matching investors
    const investors = await User.find(query)
      .select('name investorProfile bio')
      .sort('-createdAt')
      .limit(10);

    res.json(investors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all entrepreneurs (for investors)
exports.getEntrepreneurs = async (req, res) => {
  try {
    const entrepreneurs = await User.find({ role: 'entrepreneur' })
      .select('-password')
      .populate('connections', 'name email role');

    res.json(entrepreneurs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all investors (for entrepreneurs)
exports.getInvestors = async (req, res) => {
  try {
    const investors = await User.find({ role: 'investor' })
      .select('-password')
      .populate('connections', 'name email role');

    res.json(investors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }

};
