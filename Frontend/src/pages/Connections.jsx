import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';

const ConnectionCard = ({ connection, isPending, onAccept, onReject }) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
    <div className="p-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-semibold">
            {connection.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
            connection.online ? 'bg-green-500' : 'bg-gray-300'
          }`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{connection.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{connection.role}</p>
          {connection.company && (
            <p className="text-sm text-gray-600 mt-1">{connection.company}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {isPending ? (
          <div className="flex space-x-2">
            <button
              onClick={() => onAccept(connection._id)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Accept</span>
            </button>
            <button
              onClick={() => onReject(connection._id)}
              className="flex-1 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Decline</span>
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link
              to={`/profile/${connection._id}`}
              className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors duration-200 text-center"
            >
              View Profile
            </Link>
            <Link
              to={`/chat/${connection._id}`}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center"
            >
              Message
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
);

const Connections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('connections');

  const fetchConnections = async () => {
    try {
      const [connectionsRes, pendingRes] = await Promise.all([
        axiosInstance.get('/connections'),
        axiosInstance.get('/connections/requests/pending')
      ]);
      setConnections(connectionsRes.data);
      setPendingRequests(pendingRes.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch connections';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchConnections();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleRequest = async (requestId, action) => {
    try {
      await axiosInstance.post(`/connections/request/${requestId}/${action}`);
      toast.success(`Connection request ${action}ed successfully`);
      fetchConnections();
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to ${action} request`;
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your network...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">Your Network</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your connections and pending requests
              </p>
            </div>
            {/* Tabs */}
            <div className="px-6 flex space-x-8">
              <button
                onClick={() => setActiveTab('connections')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'connections'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Connections ({connections.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200 relative`}
              >
                Pending Requests
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
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

            {activeTab === 'pending' && (
              <div className="space-y-6">
                {pendingRequests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingRequests.map((request) => (
                      <ConnectionCard
                        key={request._id}
                        connection={request.from}
                        isPending={true}
                        onAccept={() => handleRequest(request._id, 'accept')}
                        onReject={() => handleRequest(request._id, 'reject')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      When someone sends you a connection request, it will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="space-y-6">
                {connections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {connections.map((connection) => (
                      <ConnectionCard
                        key={connection._id}
                        connection={connection}
                        isPending={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No connections yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start building your network by connecting with other professionals.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Connections; 