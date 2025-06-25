import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';

const EntrepreneurDashboard = () => {
  const { user } = useAuth();
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalConnections: 0,
    pendingRequests: 0,
    unreadMessages: 0,
    totalFunding: 0
  });

  const handleConnect = async (investorId) => {
    try {
      await axiosInstance.post('/connections/request', {
        receiverId: investorId,
        message: `I'm interested in connecting to discuss potential investment opportunities.`
      });
      toast.success('Connection request sent successfully!');
      
      // Refresh stats to update pending requests count
      const requestsRes = await axiosInstance.get('/connections/requests/pending/count');
      setStats(prev => ({
        ...prev,
        pendingRequests: requestsRes.data.count
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send connection request';
      toast.error(errorMessage);
      console.error('Connection request error:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch recommended investors
        const investorsResponse = await axiosInstance.get('/profile/investors/recommended');
        setInvestors(investorsResponse.data);

        // Fetch stats
        const [connectionsRes, requestsRes, messagesRes] = await Promise.all([
          axiosInstance.get('/connections'),
          axiosInstance.get('/connections/requests/pending/count'),
          axiosInstance.get('/chat/unread/count')
        ]);

        setStats({
          totalConnections: connectionsRes.data.length,
          pendingRequests: requestsRes.data.count,
          unreadMessages: messagesRes.data.count,
          totalFunding: user.entrepreneurProfile?.fundingReceived || 0
        });

      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch dashboard data';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.entrepreneurProfile?.fundingReceived]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-3">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Your investment journey continues. Explore promising startups and grow your portfolio.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-full">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connections</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalConnections}</p>
              </div>
            </div>
          </div> */}

           <Link 
            to="/connections" 
            className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Network</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalConnections}</p>
                <p className="text-xs text-blue-600 mt-1 group-hover:translate-x-2 transition-transform duration-300">
                  View connections →
                </p>
              </div>
            </div>
          </Link>
          <Link 
            to="/connections" 
            className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingRequests}</p>
                <p className="text-xs text-amber-600 mt-1 group-hover:translate-x-2 transition-transform duration-300">
                  View requests →
                </p>
              </div>
            </div>
          </Link>
          <Link 
            to="/messages" 
            className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Messages</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.unreadMessages}</p>
                <p className="text-xs text-green-600 mt-1 group-hover:translate-x-2 transition-transform duration-300">
                  View messages →
                </p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Investments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalInvestments}</p>
                <p className="text-xs text-purple-600 mt-1">Total portfolio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Startup Info */}
        {user?.entrepreneurProfile ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Startup</h2>
              <Link
                to={`/profile/${user._id}`}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Edit Profile →
              </Link>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-indigo-600">{user.entrepreneurProfile.startupName}</h3>
                <p className="text-gray-600 mt-2">{user.entrepreneurProfile.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-indigo-900">Industry</p>
                  <p className="text-indigo-700 mt-1">{user.entrepreneurProfile.industry || 'Not specified'}</p>
                </div>
                {user.entrepreneurProfile.fundingNeeded && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Funding Goal</p>
                    <p className="text-green-700 mt-1">${user.entrepreneurProfile.fundingNeeded.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Complete your startup profile to get matched with potential investors.{' '}
                  <Link to={`/profile/${user._id}`} className="font-medium underline">
                    Update Profile
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Investors */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommended Investors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investors.map((investor) => (
              <div key={investor._id} className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900">{investor.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{investor.bio}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Investment Interests</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {investor.investorProfile?.investmentInterests?.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <Link
                    to={`/profile/${investor._id}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleConnect(investor._id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Connect
                  </button>
                </div>
              </div>
            ))}
            {investors.length === 0 && (
              <div className="col-span-3 bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">No recommended investors at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EntrepreneurDashboard; 