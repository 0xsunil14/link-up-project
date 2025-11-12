import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postAPI, userAPI } from '../../api/axios';
import { DeleteModal } from '../Common/DeleteModal';

export default function Profile() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [postsRes, followersRes, followingRes] = await Promise.all([
        postAPI.getUserPosts(user.id),
        userAPI.getFollowers(),
        userAPI.getFollowing()
      ]);

      if (postsRes.data.success) setPosts(postsRes.data.data);
      if (followersRes.data.success) setStats(prev => ({ ...prev, followers: followersRes.data.data.length }));
      if (followingRes.data.success) setStats(prev => ({ ...prev, following: followingRes.data.data.length }));
    } catch (err) {
      console.error('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    setDeleteModal({ isOpen: true, postId });
  };

  const confirmDelete = async () => {
    try {
      await postAPI.deletePost(deleteModal.postId);
      setPosts(posts.filter(p => p.id !== deleteModal.postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                <div className="flex items-center justify-center md:justify-start space-x-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <button onClick={() => navigate('/followers')} className="text-center hover:bg-gray-50 px-3 py-1 rounded-lg transition-colors">
                    <div className="text-2xl font-bold text-gray-900">{stats.followers}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </button>
                  <button onClick={() => navigate('/following')} className="text-center hover:bg-gray-50 px-3 py-1 rounded-lg transition-colors">
                    <div className="text-2xl font-bold text-gray-900">{stats.following}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </button>
                </div>
                <div className="stat-item">
                  <button onClick={() => navigate('/suggestions')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
                    <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Discover People
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 md:ml-4">
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Edit Profile
                </button>
                {!user.prime && (
                  <button
                    onClick={() => navigate('/prime')}
                    className="px-6 py-2.5 bg-linear-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold rounded-xl transition-all"
                  >
                    Get Prime
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Posts</h2>
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Share your first moment with the world!</p>
              <button
                onClick={() => navigate('/post/create')}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <div key={post.id} className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  {post.imageUrl && (
                    <div className="aspect-square overflow-hidden">
                      <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-gray-800 line-clamp-2 mb-3">{post.caption}</p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
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
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/post/edit/${post.id}`)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <DeleteModal
                          isOpen={deleteModal.isOpen}
                          onClose={() => setDeleteModal({ isOpen: false, postId: null })}
                          onConfirm={confirmDelete}
                          title="Delete Post?"
                          message="Are you sure you want to delete this post? This action cannot be undone."
                        />
                      </div>
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