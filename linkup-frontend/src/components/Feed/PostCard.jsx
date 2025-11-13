import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { commentAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function PostCard({ post, onLike }) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const isOwnPost = currentUser?.id === post.user.id;

  const fetchComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const response = await commentAPI.getComments(post.id);
        if (response.data.success) {
          setComments(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load comments');
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await commentAPI.addComment(post.id, { 
        content: newComment,
        postId: post.id
      });
      if (response.data.success) {
        setComments([...comments, response.data.data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment', err);
      alert('Failed to add comment. Please try again.');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleProfileClick = () => {
    if (isOwnPost) {
      navigate('/profile');
    } else {
      navigate(`/user/${post.user.id}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div 
          onClick={handleProfileClick}
          className="flex items-center space-x-3 group cursor-pointer"
        >
          {post.user.imageUrl ? (
            <img src={post.user.imageUrl} alt={post.user.username} className="w-12 h-12 rounded-full object-cover ring-2 ring-white group-hover:ring-indigo-100 transition-all" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {post.user.username[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center">
              <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {post.user.firstname} {post.user.lastname}
              </p>
              {post.user.prime && (
                <svg className="w-4 h-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-500">@{post.user.username} · {formatTime(post.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Post Image - Clickable to open full view */}
      {post.imageUrl && (
        <div 
          className="relative bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => navigate(`/post/${post.id}`)}
        >
          <img src={post.imageUrl} alt="Post" className="w-full h-auto object-cover" />
        </div>
      )}

      {/* Post Content */}
      <div className="p-4">
        <p 
          className="text-gray-800 mb-4 leading-relaxed cursor-pointer hover:text-gray-900"
          onClick={() => navigate(`/post/${post.id}`)}
        >
          {post.caption}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors group"
            >
              {post.isLiked ? (
                <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              <span className="font-medium">{post.likesCount}</span>
            </button>

            <button
              onClick={fetchComments}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">{post.commentsCount}</span>
            </button>
          </div>

          <button 
            className="text-gray-600 hover:text-indigo-600 transition-colors"
            onClick={() => navigate(`/post/${post.id}`)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-4 animate-fadeIn">
            {loadingComments ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                {comments.map(comment => (
                  <div key={comment.id} className="flex space-x-3 bg-gray-50 rounded-lg p-3">
                    <div className="shrink-0">
                      {comment.user.imageUrl ? (
                        <img src={comment.user.imageUrl} alt={comment.user.username} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {comment.user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-gray-900">{comment.user.username}</span>
                        {comment.user.prime && (
                          <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {/* Add Comment */}
                <div className="flex space-x-3 pt-3 border-t border-gray-100">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(e)}
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-colors"
                  >
                    Post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}