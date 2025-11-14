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
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState(false);

  const isOwnProfile = currentUser?.id === parseInt(userId);

  useEffect(() => {
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

  const fetchFollowers = async () => {
    setLoadingSocial(true);
    try {
      const response = await userAPI.getUserFollowers(userId);
      if (response.data.success) {
        setFollowers(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch followers', err);
      setFollowers([]);
    } finally {
      setLoadingSocial(false);
    }
  };

  const fetchFollowing = async () => {
    setLoadingSocial(true);
    try {
      const response = await userAPI.getUserFollowing(userId);
      if (response.data.success) {
        setFollowing(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch following', err);
      setFollowing([]);
    } finally {
      setLoadingSocial(false);
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

  const handleFollowUserInModal = async (targetUserId, isFollowing) => {
    try {
      if (isFollowing) {
        await userAPI.unfollowUser(targetUserId);
      } else {
        await userAPI.followUser(targetUserId);
      }
      // Refresh the current modal's data
      if (showFollowersModal) {
        fetchFollowers();
      }
      if (showFollowingModal) {
        fetchFollowing();
      }
    } catch (err) {
      console.error('Follow action failed');
    }
  };

  const openFollowersModal = () => {
    setShowFollowersModal(true);
    fetchFollowers();
  };

  const openFollowingModal = () => {
    setShowFollowingModal(true);
    fetchFollowing();
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
          <div className="h-48 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20">
              <div className="mb-4 md:mb-0 md:mr-6">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.username} className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.firstname} {user.lastname}
                  </h1>
                  {user.prime && (
                    <svg className="w-6 h-6 ml-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-600 mb-2">@{user.username}</p>
                {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

                <div className="flex items-center justify-center md:justify-start space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <button 
                    onClick={openFollowersModal}
                    className="text-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors group"
                  >
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {user.followersCount || 0}
                    </div>
                    <div className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors">Followers</div>
                  </button>
                  <button 
                    onClick={openFollowingModal}
                    className="text-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors group"
                  >
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {user.followingCount || 0}
                    </div>
                    <div className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors">Following</div>
                  </button>
                </div>
              </div>

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

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowFollowersModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-2xl font-bold text-gray-900">Followers</h2>
              <button 
                onClick={() => setShowFollowersModal(false)} 
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {loadingSocial ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : followers.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No followers yet</h3>
                  <p className="text-gray-600 text-sm">This user hasn't gained any followers yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {followers.map(follower => (
                    <div key={follower.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div 
                        className="flex items-center space-x-3 flex-1 cursor-pointer"
                        onClick={() => {
                          setShowFollowersModal(false);
                          if (follower.id === currentUser.id) {
                            navigate('/profile');
                          } else {
                            navigate(`/user/${follower.id}`);
                          }
                        }}
                      >
                        {follower.imageUrl ? (
                          <img src={follower.imageUrl} alt={follower.username} className="w-12 h-12 rounded-full object-cover ring-2 ring-white" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold ring-2 ring-white">
                            {follower.username[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="font-semibold text-gray-900">{follower.firstname} {follower.lastname}</p>
                            {follower.prime && (
                              <svg className="w-4 h-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">@{follower.username}</p>
                        </div>
                      </div>
                      {follower.id !== currentUser.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowUserInModal(follower.id, follower.isFollowing);
                          }}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            follower.isFollowing
                              ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {follower.isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowFollowingModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="text-2xl font-bold text-gray-900">Following</h2>
              <button 
                onClick={() => setShowFollowingModal(false)} 
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {loadingSocial ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : following.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Not following anyone</h3>
                  <p className="text-gray-600 text-sm">This user hasn't followed anyone yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {following.map(user => (
                    <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div 
                        className="flex items-center space-x-3 flex-1 cursor-pointer"
                        onClick={() => {
                          setShowFollowingModal(false);
                          if (user.id === currentUser.id) {
                            navigate('/profile');
                          } else {
                            navigate(`/user/${user.id}`);
                          }
                        }}
                      >
                        {user.imageUrl ? (
                          <img src={user.imageUrl} alt={user.username} className="w-12 h-12 rounded-full object-cover ring-2 ring-white" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold ring-2 ring-white">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="font-semibold text-gray-900">{user.firstname} {user.lastname}</p>
                            {user.prime && (
                              <svg className="w-4 h-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                        </div>
                      </div>
                      {user.id !== currentUser.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowUserInModal(user.id, user.isFollowing);
                          }}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            user.isFollowing
                              ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {user.isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}