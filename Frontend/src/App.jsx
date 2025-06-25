import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import InvestorDashboard from './pages/InvestorDashboard';
import EntrepreneurDashboard from './pages/EntrepreneurDashboard';
import Chat from './pages/Chat';
import Conversations from './pages/Conversations';
import Connections from './pages/Connections';
import { useAuth } from './context/AuthContext';

const RedirectToDashboard = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile/:userId"
              element={<PrivateRoute component={Profile} />}
            />
            <Route
              path="/dashboard/investor"
              element={<PrivateRoute component={InvestorDashboard} />}
            />
            <Route
              path="/dashboard/entrepreneur"
              element={<PrivateRoute component={EntrepreneurDashboard} />}
            />
            <Route
              path="/chat/:userId"
              element={<PrivateRoute component={Chat} />}
            />
            <Route
              path="/messages"
              element={<PrivateRoute component={Conversations} />}
            />
            <Route
              path="/connections"
              element={<PrivateRoute component={Connections} />}
            />
            <Route path="/" element={<RedirectToDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
