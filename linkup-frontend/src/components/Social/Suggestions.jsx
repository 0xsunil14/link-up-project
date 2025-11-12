import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../api/axios';

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await userAPI.getSuggestions();
      if (response.data.success) {
        setSuggestions(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await userAPI.followUser(userId);
      setSuggestions(suggestions.filter(s => s.id !== userId));
    } catch (err) {
      console.error('Follow failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Suggested for you</h1>
          <p className="text-gray-600">People you might know</p>
        </div>
        
        {suggestions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No suggestions available</h3>
            <p className="text-gray-600">Check back later for new people to follow!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map(user => (
              <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div 
                    className="flex items-start space-x-4 flex-1 cursor-pointer"
                    onClick={() => navigate(`/user/${user.id}`)}
                  >
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt={user.username} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{user.firstname} {user.lastname}</p>
                      <p className="text-gray-600 mb-1">@{user.username}</p>
                      {user.bio && <p className="text-gray-700 text-sm">{user.bio}</p>}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleFollow(user.id)}
                    className="ml-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all"
                  >
                    Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}