import api from '../utils/api';

export const login = async (fullName, password) => {
  try {
    const response = await api.post('/auth/login', { fullName, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const activateAccount = async () => {
  const response = await api.post('/auth/activate');
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post('/auth/reset-password', { token, password });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await api.post('/auth/verify-payment', paymentData);
  return response.data;
};

export const submitTransactionId = async (transactionData) => {
  const response = await api.post('/auth/submit-transaction', transactionData);
  return response.data;
};

// Check pending activation status - NEW ENDPOINT
export const checkPendingActivation = async () => {
  const response = await api.get('/users/pending-activation');
  return response.data;
};