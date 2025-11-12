import { useState } from 'react';
import { Link } from 'react-router-dom';
import { commentAPI } from '../../api/axios';

export default function PostCard({ post, onLike }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

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
      postId: post.id  // Add postId explicitly
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <Link to={`/profile/${post.user.id}`} className="flex items-center space-x-3 group">
          <div className="relative">
            {post.user.imageUrl ? (
              <img src={post.user.imageUrl} alt={post.user.username} className="w-12 h-12 rounded-full object-cover ring-2 ring-white group-hover:ring-indigo-100 transition-all" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {post.user.username[0].toUpperCase()}
              </div>
            )}
            {post.user.prime && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {post.user.firstname} {post.user.lastname}
            </p>
            <p className="text-sm text-gray-500">@{post.user.username} · {formatTime(post.createdAt)}</p>
          </div>
        </Link>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="relative bg-gray-100">
          <img src={post.imageUrl} alt="Post" className="w-full h-auto object-cover" />
        </div>
      )}

      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-800 mb-4 leading-relaxed">{post.caption}</p>

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

          <button className="text-gray-600 hover:text-indigo-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
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
                    <div className="flex-shrink-0">
                      {comment.user.imageUrl ? (
                        <img src={comment.user.imageUrl} alt={comment.user.username} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {comment.user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-gray-900">{comment.user.username}</span>
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