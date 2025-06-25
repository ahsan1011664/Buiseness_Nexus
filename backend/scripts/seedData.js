const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/business-nexus');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});

    // Create mock investors
    const investors = [
      {
        name: 'John Smith',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'investor',
        bio: 'Experienced angel investor with a focus on tech startups.',
        investorProfile: {
          investmentInterests: ['SaaS', 'AI/ML', 'Fintech'],
          minimumInvestment: 50000,
          maximumInvestment: 500000,
          portfolioCompanies: [
            {
              name: 'TechCorp',
              description: 'Leading provider of cloud solutions'
            },
            {
              name: 'AI Solutions',
              description: 'AI-powered analytics platform'
            }
          ]
        }
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'investor',
        bio: 'Venture capitalist specializing in early-stage startups.',
        investorProfile: {
          investmentInterests: ['Healthcare', 'Biotech', 'Clean Energy'],
          minimumInvestment: 100000,
          maximumInvestment: 1000000,
          portfolioCompanies: [
            {
              name: 'HealthTech',
              description: 'Digital health platform'
            }
          ]
        }
      }
    ];

    // Create mock entrepreneurs
    const entrepreneurs = [
      {
        name: 'Mike Wilson',
        email: 'mike@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'entrepreneur',
        bio: 'Serial entrepreneur with multiple successful exits.',
        startup: {
          name: 'EcoTech Solutions',
          description: 'Developing sustainable energy solutions for residential buildings.',
          industry: 'Clean Energy',
          fundingNeeded: 250000,
          pitchDeck: 'https://example.com/pitch-deck'
        }
      },
      {
        name: 'Lisa Chen',
        email: 'lisa@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'entrepreneur',
        bio: 'Tech innovator with a passion for AI.',
        startup: {
          name: 'AI Education',
          description: 'AI-powered personalized learning platform for K-12 students.',
          industry: 'AI/ML',
          fundingNeeded: 500000,
          pitchDeck: 'https://example.com/pitch-deck'
        }
      },
      {
        name: 'David Park',
        email: 'david@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'entrepreneur',
        bio: 'Fintech expert with banking background.',
        startup: {
          name: 'FinanceFlow',
          description: 'Blockchain-based payment solution for small businesses.',
          industry: 'Fintech',
          fundingNeeded: 750000,
          pitchDeck: 'https://example.com/pitch-deck'
        }
      }
    ];

    // Insert mock data
    await User.insertMany([...investors, ...entrepreneurs]);
    console.log('Mock data seeded successfully');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 