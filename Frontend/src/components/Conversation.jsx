import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

const Conversation = ({ conversation }) => {
  const { user } = useAuth();
  const otherUser = conversation.participants.find(p => p._id !== user._id);
  const lastMessage = conversation.lastMessage;
  const unreadCount = conversation.unreadCount;
  const isOnline = otherUser?.isOnline;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      // Show day name for last week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Show date for older messages
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (message, length = 60) => {
    if (!message) return '';
    return message.length > length ? `${message.substring(0, length)}...` : message;
  };

  return (
    <Link
      to={`/chat/${otherUser._id}`}
      className="block group hover:bg-gray-50 transition-colors duration-200"
    >
      <div className="flex items-center p-4 space-x-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-medium shadow-sm">
            {otherUser?.name?.[0]?.toUpperCase()}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {otherUser.name}
            </h3>
            {lastMessage && (
              <span className="text-xs text-gray-500">
                {formatTimestamp(lastMessage.timestamp)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-600 truncate">
              {truncateMessage(lastMessage?.message || 'Start a conversation')}
            </p>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full min-w-[1.25rem] h-5">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

Conversation.propTypes = {
  conversation: PropTypes.shape({
    participants: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        isOnline: PropTypes.bool,
      })
    ).isRequired,
    lastMessage: PropTypes.shape({
      message: PropTypes.string,
      timestamp: PropTypes.string,
    }),
    unreadCount: PropTypes.number,
  }).isRequired,
};

export default Conversation; 