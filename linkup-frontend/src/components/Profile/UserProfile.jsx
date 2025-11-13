import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, postAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = currentUser?.id === parseInt(userId);

  useEffect(() => {
    // If viewing own profile, redirect to /profile
    if (isOwnProfile) {
      navigate('/profile', { replace: true });
      return;
    }
    fetchUserData();
  }, [userId, isOwnProfile]);

  const fetchUserData = async () => {
    try {
      const [userRes, postsRes] = await Promise.all([
        userAPI.getUserProfile(userId),
        postAPI.getUserPosts(userId)
      ]);

      if (userRes.data.success) setUser(userRes.data.data);
      if (postsRes.data.success) setPosts(postsRes.data.data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (user.isFollowing) {
        await userAPI.unfollowUser(userId);
      } else {
        await userAPI.followUser(userId);
      }
      fetchUserData();
    } catch (err) {
      alert('Action failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20">
              {/* Avatar */}
              <div className="relative mb-4 md:mb-0 md:mr-6">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.username} className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                {user.prime && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {user.firstname} {user.lastname}
                </h1>
                <p className="text-gray-600 mb-2">@{user.username}</p>
                {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

                {/* Stats */}
                <div className="flex items-center justify-center md:justify-start space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user.followersCount || 0}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user.followingCount || 0}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <div className="mt-4 md:mt-0 md:ml-4">
                <button
                  onClick={handleFollowToggle}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                    user.isFollowing
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                  }`}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts</h2>
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">No posts yet</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <div 
                  key={post.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  {post.imageUrl && (
                    <div className="aspect-square overflow-hidden">
                      <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-gray-800 line-clamp-2 mb-3">{post.caption}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        {post.likesCount}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        {post.commentsCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}