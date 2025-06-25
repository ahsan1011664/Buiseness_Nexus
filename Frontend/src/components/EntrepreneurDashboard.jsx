import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DashboardLayout from './DashboardLayout';
import axiosInstance from '../utils/axiosConfig';

const EntrepreneurDashboard = () => {
  const [collaborationRequests, setCollaborationRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConnections: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    totalMessages: 0
  });

  const fetchCollaborationRequests = async () => {
    try {
      const response = await axiosInstance.get('/connections/requests');
      const requests = response.data;
      setCollaborationRequests(requests);
      
      // Update stats based on requests
      const pending = requests.filter(req => req.status === 'pending').length;
      const accepted = requests.filter(req => req.status === 'accepted').length;
      
      setStats(prev => ({
        ...prev,
        pendingRequests: pending,
        acceptedRequests: accepted
      }));
    } catch (error) {
      console.error('Error fetching collaboration requests:', error);
      toast.error('Failed to fetch collaboration requests');
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await axiosInstance.get('/connections');
      setConnections(response.data);
      setStats(prev => ({
        ...prev,
        totalConnections: response.data.length
      }));
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to fetch connections');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCollaborationRequests(),
        fetchConnections()
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleRequestAction = async (requestId, status) => {
    try {
      await axiosInstance.patch(`/connections/request/${requestId}`, { status });
      toast.success(`Request ${status} successfully`);
      
      // Refresh data
      await Promise.all([
        fetchCollaborationRequests(),
        fetchConnections()
      ]);
    } catch (error) {
      console.error(`Error ${status}ing request:`, error);
      toast.error(`Failed to ${status} request`);
    }
  };

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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Connections</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalConnections}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingRequests}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Accepted Requests</h3>
            <p className="text-3xl font-bold text-green-600">{stats.acceptedRequests}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Messages</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalMessages}</p>
          </div>
        </div>

        {/* Collaboration Requests Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Investor Collaboration Requests</h2>
            
            {collaborationRequests.length > 0 ? (
              <div className="space-y-4">
                {collaborationRequests.map((request) => (
                  <div 
                    key={request._id} 
                    className={`border rounded-lg p-6 ${
                      request.status === 'pending' 
                        ? 'bg-yellow-50 border-yellow-200'
                        : request.status === 'accepted'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.sender.name}
                          <span className={`ml-3 text-sm px-2 py-1 rounded ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </h3>
                        <p className="text-sm text-gray-600">{request.sender.email}</p>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRequestAction(request._id, 'accepted')}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRequestAction(request._id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>

                    {request.sender.investorProfile && (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <span className="text-gray-600">Investment Range:</span>
                          <span className="ml-2 font-medium">
                            ${request.sender.investorProfile.minimumInvestment?.toLocaleString()} - 
                            ${request.sender.investorProfile.maximumInvestment?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600">Interests:</span>
                          <div className="ml-2 flex flex-wrap gap-1">
                            {request.sender.investorProfile.investmentInterests?.map((interest, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                        {request.message && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">{request.message}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex justify-end space-x-3">
                      <Link
                        to={`/profile/${request.sender._id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        View Profile
                      </Link>
                      {request.status === 'accepted' && (
                        <Link
                          to={`/chat/${request.sender._id}`}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          Message
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No collaboration requests yet</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EntrepreneurDashboard; 