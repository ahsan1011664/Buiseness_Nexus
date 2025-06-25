import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('none'); // none, pending, connected

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axiosInstance.get(`/profile/${userId}`);
        setProfile(response.data);
        setFormData(response.data);

        // Check connection status
        if (response.data.connections.some(conn => conn._id === user._id)) {
          setConnectionStatus('connected');
        } else {
          // Check if there's a pending request
          const requestsResponse = await axiosInstance.get('/collaboration/requests');
          const isPending = requestsResponse.data.some(
            req => (req.senderId === user._id && req.receiverId === userId) ||
                  (req.senderId === userId && req.receiverId === user._id)
          );
          setConnectionStatus(isPending ? 'pending' : 'none');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user._id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.put('/profile', formData);
      setProfile(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      console.error('Profile update error:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await axiosInstance.post('/connections/request', {
        receiverId: userId
      });
      setConnectionStatus('pending');
      toast.success('Connection request sent!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send connection request';
      toast.error(errorMessage);
    }
  };

  const handleMessage = () => {
    window.location.href = `/chat/${userId}`;
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

  const isOwnProfile = user?._id === profile?._id;

  return (
    <DashboardLayout>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="p-6 bg-indigo-50 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {isEditing ? 'Edit Profile' : profile?.name}
              </h1>
              <p className="text-indigo-600 font-medium capitalize">{profile?.role}</p>
            </div>
            {isOwnProfile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
            {user._id !== userId && (
              <div className="flex space-x-4">
                {connectionStatus === 'none' && (
                  <button
                    onClick={handleConnect}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Connect
                  </button>
                )}
                {connectionStatus === 'pending' && (
                  <button
                    disabled
                    className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                  >
                    Request Pending
                  </button>
                )}
                {connectionStatus === 'connected' && (
                  <button
                    onClick={handleMessage}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Message
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {profile.role === 'entrepreneur' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Startup Name</label>
                    <input
                      type="text"
                      name="startup.name"
                      value={formData.startup?.name || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Startup Description</label>
                    <textarea
                      name="startup.description"
                      value={formData.startup?.description || ''}
                      onChange={handleInputChange}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Industry</label>
                    <select
                      name="startup.industry"
                      value={formData.startup?.industry || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select an industry</option>
                      <option value="SaaS">SaaS</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="Fintech">Fintech</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Biotech">Biotech</option>
                      <option value="Clean Energy">Clean Energy</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="EdTech">EdTech</option>
                      <option value="IoT">IoT</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Funding Needed</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="startup.fundingNeeded"
                        value={formData.startup?.fundingNeeded || ''}
                        onChange={handleInputChange}
                        className="pl-7 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {profile.role === 'investor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Investment Interests</label>
                    <input
                      type="text"
                      name="investorProfile.investmentInterests"
                      value={formData.investorProfile?.investmentInterests?.join(', ') || ''}
                      onChange={(e) => handleInputChange({
                        target: {
                          name: 'investorProfile.investmentInterests',
                          value: e.target.value.split(',').map(s => s.trim())
                        }
                      })}
                      placeholder="Separate interests with commas"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum Investment</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="investorProfile.minimumInvestment"
                        value={formData.investorProfile?.minimumInvestment || ''}
                        onChange={handleInputChange}
                        className="pl-7 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className={`bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors ${
                    saveLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {profile.bio && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">About</h2>
                  <p className="text-gray-600">{profile.bio}</p>
                </div>
              )}

              {profile.role === 'entrepreneur' && profile.startup && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Startup</h2>
                  <h3 className="text-indigo-600 font-medium mb-2">{profile.startup.name}</h3>
                  <p className="text-gray-600 mb-4">{profile.startup.description}</p>
                  {profile.startup.industry && (
                    <p className="text-sm text-gray-500 mb-2">
                      Industry: {profile.startup.industry}
                    </p>
                  )}
                  {profile.startup.fundingNeeded && (
                    <p className="text-sm text-gray-500">
                      Funding Needed: ${profile.startup.fundingNeeded.toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {profile.role === 'investor' && profile.investorProfile && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Investment Profile</h2>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Investment Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.investorProfile.investmentInterests?.map((interest, index) => (
                        <span
                          key={index}
                          className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  {profile.investorProfile.minimumInvestment && (
                    <p className="text-sm text-gray-600">
                      Minimum Investment: ${profile.investorProfile.minimumInvestment.toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {profile.connections?.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Connections</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.connections.map((connection) => (
                      <div key={connection._id} className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-1">{connection.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{connection.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile; 