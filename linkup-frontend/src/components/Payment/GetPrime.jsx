import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../../api/axios';

export default function GetPrime() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleGetPrime = async () => {
  setLoading(true);
  try {
    // Check if Razorpay script is loaded
    if (typeof window.Razorpay === 'undefined') {
      alert('❌ Payment system not loaded. Please refresh the page and try again.');
      return;
    }

    const response = await paymentAPI.createPrimeOrder();
    
    if (response.data.success) {
      const options = {
        key: response.data.data.key,
        amount: response.data.data.amount,
        currency: response.data.data.currency,
        order_id: response.data.data.orderId,
        name: "LinkUp Prime",
        description: "Premium membership subscription",
        handler: async function (paymentResponse) {
          try {
            await paymentAPI.activatePrime();
            alert('🎉 Prime activated successfully!');
            navigate('/profile');
          } catch (err) {
            alert('❌ Failed to activate prime. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        },
        theme: {
          color: "#4F46E9"
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    }
  } catch (err) {
    console.error('Payment error:', err);
    const errorMsg = err.response?.data?.message || 'Failed to create order. Please try again.';
    alert(`❌ ${errorMsg}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-orange-50 to-red-50 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get LinkUp Prime</h1>
          <p className="text-xl text-gray-600">Unlock exclusive features!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-linear-to-r from-yellow-400 to-orange-500 p-8 text-center">
            <p className="text-white text-lg font-semibold mb-2">Special Offer</p>
            <div className="text-white">
              <span className="text-5xl font-bold">$5</span>
              <span className="text-2xl">/month</span>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Prime Benefits</h3>
            <div className="space-y-4 mb-8">
              {[
                'Verified badge on your profile',
                'Priority customer support',
                'Exclusive prime-only features',
                'Ad-free experience',
                'Advanced analytics',
                'Custom profile themes',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium">{benefit}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleGetPrime}
              disabled={loading}
              className="w-full py-4 bg-linear-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Get Prime Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}