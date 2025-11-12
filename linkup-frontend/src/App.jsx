import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyOTP from './components/Auth/VerifyOTP';
import Feed from './components/Feed/Feed';
import Profile from './components/Profile/Profile';
import EditProfile from './components/Profile/EditProfile';
import CreatePost from './components/Post/CreatePost';
import Followers from './components/Social/Followers';
import Following from './components/Social/Following';
import Suggestions from './components/Social/Suggestions';
import EditPost from './components/Post/EditPost';
import GetPrime from './components/Payment/GetPrime';

function App() {
  return (
   <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Navbar /><Feed /></ProtectedRoute>} />
            <Route path="/feed" element={<ProtectedRoute><Navbar /><Feed /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Navbar /><Profile /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><Navbar /><EditProfile /></ProtectedRoute>} />
            <Route path="/post/create" element={<ProtectedRoute><Navbar /><CreatePost /></ProtectedRoute>} />
            <Route path="/post/edit/:postId" element={<ProtectedRoute><Navbar /><EditPost /></ProtectedRoute>} />
            
            {/* NEW ROUTES */}
            <Route path="/followers" element={<ProtectedRoute><Navbar /><Followers /></ProtectedRoute>} />
            <Route path="/following" element={<ProtectedRoute><Navbar /><Following /></ProtectedRoute>} />
            <Route path="/suggestions" element={<ProtectedRoute><Navbar /><Suggestions /></ProtectedRoute>} />
            <Route path="/prime" element={<ProtectedRoute><Navbar /><GetPrime /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;