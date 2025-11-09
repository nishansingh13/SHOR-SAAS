import { useState } from 'react';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentOptions {
  amount: number;
  eventId: string;
  participantData: {
    name: string;
    email: string;
    phone: string;
    ticketName: string;
    quantity: number;
    isVolunteer?: boolean;
    tshirtSize?: string;
  };
  onSuccess?: (response: RazorpayResponse) => void;
  onFailure?: (error: Error) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: any) => {
      open: () => void;
    };
  }
}

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const loadRazorpayScript = (): Promise<boolean> => {
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

  const initiatePayment = async (options: PaymentOptions): Promise<boolean> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      const executePayment = async () => {
        try {
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            const error = new Error('Razorpay SDK failed to load. Please check your internet connection.');
            setError(error.message);
            setLoading(false);
            options.onFailure?.(error);
            reject(error);
            return;
          }

          const orderResponse = await fetch(`${API_BASE}/payments/create-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: options.amount,
              currency: 'INR',
              eventId: options.eventId,
              participantData: options.participantData
            }),
          });

          const orderData = await orderResponse.json();
          if (!orderData.success) {
            const error = new Error(orderData.message || 'Failed to create payment order');
            setError(error.message);
            setLoading(false);
            options.onFailure?.(error);
            reject(error);
            return;
          }

          const { order, key } = orderData;

          const razorpayOptions = {
            key,
            amount: order.amount,
            currency: order.currency,
            name: 'SETU Events',
            description: `Registration for Event`,
            order_id: order.id,
            handler: async function (response: RazorpayResponse) {
              try {
                const verifyResponse = await fetch(`${API_BASE}/payments/verify-payment`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    participantData: options.participantData,
                    eventId: options.eventId
                  }),
                });

                const verifyData = await verifyResponse.json();
                if (verifyData.success) {
                  setLoading(false);
                  options.onSuccess?.(response);
                  resolve(true);
                } else {
                  const error = new Error(verifyData.message || 'Payment verification failed');
                  setError(error.message);
                  setLoading(false);
                  options.onFailure?.(error);
                  reject(error);
                }
              } catch (error) {
                console.error('Payment verification error:', error);
                const errorObj = error instanceof Error ? error : new Error('Payment verification failed');
                setError(errorObj.message);
                setLoading(false);
                options.onFailure?.(errorObj);
                reject(errorObj);
              }
            },
            prefill: {
              name: options.participantData.name,
              email: options.participantData.email,
              contact: options.participantData.phone,
            },
            notes: {
              eventId: options.eventId,
              ticketName: options.participantData.ticketName,
            },
            theme: {
              color: '#059669', // emerald-600
            },
            modal: {
              ondismiss: function() {
                setLoading(false);
                setError('Payment cancelled by user');
                reject(new Error('Payment cancelled by user'));
              }
            }
          };

          const rzp = new window.Razorpay(razorpayOptions);
          rzp.open();
          
        } catch (error) {
          console.error('Payment initiation error:', error);
          const errorObj = error instanceof Error ? error : new Error('Payment failed');
          setError(errorObj.message);
          setLoading(false);
          options.onFailure?.(errorObj);
          reject(errorObj);
        }
      };

      executePayment();
    });
  };

  const verifyPaymentStatus = async (paymentId: string) => {
    try {
      const response = await fetch(`${API_BASE}/payments/status/${paymentId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      return { success: false, error };
    }
  };

  return {
    initiatePayment,
    verifyPaymentStatus,
    loading,
    error,
    setError
  };
};

export default useRazorpay;
