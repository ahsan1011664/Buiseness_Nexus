import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import DashboardLayout from '../components/DashboardLayout';
import axiosInstance from '../utils/axiosConfig';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axiosInstance.get('/chat/conversations/recent');
        setConversations(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch conversations');
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

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
      <div className="bg-white shadow rounded-lg">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="divide-y">
          {conversations.map((conversation) => (
            <Link
              key={conversation.user._id}
              to={`/chat/${conversation.user._id}`}
              className="block hover:bg-gray-50 transition-colors"
            >
              <div className="p-4 flex items-start space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {conversation.user.profilePicture ? (
                    <img
                      src={conversation.user.profilePicture}
                      alt={conversation.user.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-800 font-medium text-lg">
                        {conversation.user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.user.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(conversation.lastMessage.timestamp), 'MMM d, HH:mm')}
                    </p>
                  </div>
                  <p className={`text-sm text-gray-500 truncate ${conversation.lastMessage.unread ? 'font-semibold' : ''}`}>
                    {conversation.lastMessage.message}
                  </p>
                </div>

                {/* Unread indicator */}
                {conversation.lastMessage.unread && (
                  <div className="flex-shrink-0">
                    <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full"></div>
                  </div>
                )}
              </div>
            </Link>
          ))}

          {conversations.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Conversations; 