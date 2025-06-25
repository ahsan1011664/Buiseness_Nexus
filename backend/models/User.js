// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['investor', 'entrepreneur'],
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  // Entrepreneur specific fields
  entrepreneurProfile: {
    startupName: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      trim: true
    },
    fundingNeeded: {
      type: Number,
      min: 0
    },
    fundingReceived: {
      type: Number,
      default: 0
    },
    pitchSummary: {
      type: String,
      trim: true
    },
    pitchDeck: {
      type: String,
      default: ''
    },
    fundingStage: {
      type: String,
      enum: ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+'],
      default: 'Pre-seed'
    }
  },
  // Investor specific fields
  investorProfile: {
    investmentInterests: [String],
    portfolioCompanies: [{
      name: String,
      description: String
    }],
    minimumInvestment: {
      type: Number,
      min: 0
    },
    maximumInvestment: {
      type: Number,
      min: 0
    }
  },
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pendingRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
