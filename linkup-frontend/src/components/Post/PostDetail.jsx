import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postAPI, commentAPI } from '../../api/axios';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        postAPI.getPost(postId),
        commentAPI.getComments(postId)
      ]);

      if (postRes.data.success) setPost(postRes.data.data);
      if (commentsRes.data.success) setComments(commentsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch post details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (post.isLiked) {
        await postAPI.unlikePost(postId);
      } else {
        await postAPI.likePost(postId);
      }
      fetchPostDetails();
    } catch (err) {
      console.error('Like action failed');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await commentAPI.addComment(postId, { 
        content: newComment,
        postId: postId
      });
      if (response.data.success) {
        setComments([...comments, response.data.data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Post Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Post Header */}
          <div className="p-6 border-b border-gray-100">
            <Link to={`/user/${post.user.id}`} className="flex items-center space-x-3 group">
              <div className="relative">
                {post.user.imageUrl ? (
                  <img 
                    src={post.user.imageUrl} 
                    alt={post.user.username} 
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-white group-hover:ring-indigo-100 transition-all" 
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
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
                <p className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                  {post.user.firstname} {post.user.lastname}
                </p>
                <p className="text-sm text-gray-500">@{post.user.username} · {formatTime(post.createdAt)}</p>
              </div>
            </Link>
          </div>

          {/* Post Image */}
          {post.imageUrl && (
            <div className="bg-gray-100">
              <img 
                src={post.imageUrl} 
                alt="Post" 
                className="w-full h-auto max-h-[600px] object-contain mx-auto" 
              />
            </div>
          )}

          {/* Post Content & Actions */}
          <div className="p-6">
            <p className="text-gray-800 text-lg mb-6 leading-relaxed whitespace-pre-wrap">{post.caption}</p>

            {/* Like & Comment Stats */}
            <div className="flex items-center space-x-6 py-4 border-y border-gray-100 mb-4">
              <span className="text-gray-600 font-medium">{post.likesCount} likes</span>
              <span className="text-gray-600 font-medium">{comments.length} comments</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
              <button
                onClick={handleLike}
                className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all hover:bg-gray-50"
              >
                {post.isLiked ? (
                  <>
                    <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="text-red-500">Liked</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-gray-600">Like</span>
                  </>
                )}
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Comments</h3>
              
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    disabled={submittingComment}
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingComment ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="flex space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <Link to={`/user/${comment.user.id}`} className="shrink-0">
                        {comment.user.imageUrl ? (
                          <img 
                            src={comment.user.imageUrl} 
                            alt={comment.user.username} 
                            className="w-10 h-10 rounded-full object-cover" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {comment.user.username[0].toUpperCase()}
                          </div>
                        )}
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Link 
                            to={`/user/${comment.user.id}`} 
                            className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                          >
                            {comment.user.firstname} {comment.user.lastname}
                          </Link>
                          {comment.user.prime && (
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          )}
                          <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}