import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';

const InvestorDashboard = () => {
  const { user } = useAuth();
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalConnections: 0,
    pendingRequests: 0,
    unreadMessages: 0,
    totalInvestments: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const entrepreneursResponse = await axiosInstance.get('/users/entrepreneurs');
        setEntrepreneurs(entrepreneursResponse.data);

        const [connectionsRes, requestsRes, messagesRes] = await Promise.all([
          axiosInstance.get('/connections'),
          axiosInstance.get('/connections/requests/pending/count'),
          axiosInstance.get('/chat/unread/count')
        ]);

        setStats({
          totalConnections: connectionsRes.data.length,
          pendingRequests: requestsRes.data.count,
          unreadMessages: messagesRes.data.count,
          totalInvestments: user.investorProfile?.totalInvestments || 0
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
  }, [user.investorProfile?.totalInvestments]);

  const handleCollaborationRequest = async (entrepreneurId) => {
    try {
      await axiosInstance.post('/connections/request', {
        receiverId: entrepreneurId,
        message: `I'm interested in learning more about your startup.`
      });
      toast.success('Collaboration request sent successfully!');
      
      const requestsRes = await axiosInstance.get('/connections/requests/pending/count');
      setStats(prev => ({
        ...prev,
        pendingRequests: requestsRes.data.count
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send collaboration request';
      toast.error(errorMessage);
      console.error('Collaboration request error:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 animate-spin border-t-blue-600"></div>
            <div className="mt-4 text-gray-600 text-sm font-medium">Loading your dashboard...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
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

        {/* Investment Profile */}
        {user?.investorProfile ? (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Investment Profile</h2>
                <p className="text-gray-500 mt-1">Your investment preferences and criteria</p>
              </div>
              <Link
                to={`/profile/${user._id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-300"
              >
                Edit Profile
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <p className="text-sm font-semibold text-blue-900 mb-3">Investment Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {user.investorProfile.investmentInterests?.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-blue-800 shadow-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                {user.investorProfile.minimumInvestment && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                    <p className="text-sm font-semibold text-green-900 mb-3">Minimum Investment</p>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-green-700">
                        ${user.investorProfile.minimumInvestment.toLocaleString()}
                      </span>
                      <span className="ml-2 text-sm text-green-600">USD</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-800">Complete Your Profile</h3>
                <p className="mt-1 text-amber-700">
                  Set up your investment profile to get matched with relevant startups and opportunities.{' '}
                  <Link to={`/profile/${user._id}`} className="font-medium text-amber-900 underline hover:text-amber-700 transition-colors duration-200">
                    Update Profile
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Entrepreneurs Listing */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Discover Entrepreneurs</h2>
              <p className="text-gray-500 mt-1">Connect with promising startups and founders</p>
            </div>
          </div>
          
          {entrepreneurs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entrepreneurs.map((entrepreneur) => (
                <div 
                  key={entrepreneur._id} 
                  className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                          {entrepreneur.name[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {entrepreneur.name}
                          </h3>
                          <p className="text-sm text-gray-500">{entrepreneur.entrepreneurProfile?.startupName}</p>
                        </div>
                      </div>
                      {entrepreneur.entrepreneurProfile?.industry && (
                        <span className="px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
                          {entrepreneur.entrepreneurProfile.industry}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {entrepreneur.entrepreneurProfile?.pitchSummary || 'No pitch summary available'}
                    </p>

                    <div className="space-y-3">
                      {entrepreneur.entrepreneurProfile?.fundingStage && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500">Stage:</span>
                          <span className="ml-2 font-medium text-gray-900">{entrepreneur.entrepreneurProfile.fundingStage}</span>
                        </div>
                      )}
                      {entrepreneur.entrepreneurProfile?.fundingNeeded && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500">Seeking:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            ${entrepreneur.entrepreneurProfile.fundingNeeded.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <Link
                        to={`/profile/${entrepreneur._id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => handleCollaborationRequest(entrepreneur._id)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300"
                      >
                        Connect
                        <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No entrepreneurs found</h3>
              <p className="mt-1 text-gray-500">Check back later for new opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvestorDashboard; 