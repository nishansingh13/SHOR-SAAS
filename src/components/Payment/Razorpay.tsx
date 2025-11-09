import { useState } from 'react';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: any) => {
      open: () => void;
    };
  }
}

function Razorpay() {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (amount: number) => {
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

      const keyResponse = await fetch(`${API_BASE}/orders/key`);
      const keyData = await keyResponse.json();
      const key = keyData.key;

      const response = await fetch(`${API_BASE}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount, // amount in rupees
          currency: 'INR',
        }),
      });

      const data = await response.json();
      if (!data.success) {
        alert('Failed to create order');
        setLoading(false);
        return;
      }

      const { order } = data;

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Your Company Name',
        description: 'Test Transaction',
        order_id: order.id,
        handler: function (response: RazorpayResponse) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          console.log(response);
        },
        prefill: {
          name: 'John Doe',
          email: 'john@example.com',
          contact: '9999999999',
        },
        notes: {
          address: 'Razorpay Corporate Office',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Razorpay Payment Integration</h2>
      <button
        onClick={() => handlePayment(500)}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay ₹500'}
      </button>
      <p>This is a demo integration using test mode.</p>
    </div>
  );
}

export default Razorpay;