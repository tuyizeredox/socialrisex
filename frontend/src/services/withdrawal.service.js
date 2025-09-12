import api from './api';

export const createWithdrawal = async (withdrawalData) => {
  try {
    // Add a flag for first-time withdrawal
    const response = await api.post('/withdrawals', {
      ...withdrawalData,
      isFirstWithdrawal: true // Add this flag
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserWithdrawals = async () => {
  try {
    const response = await api.get('/withdrawals');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllWithdrawals = async () => {
  try {
    const response = await api.get('/admin/withdrawals');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPendingWithdrawals = async () => {
  try {
    const response = await api.get('/admin/withdrawals/pending');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const processWithdrawal = async (id, data) => {
  try {
    const response = await api.put(`/admin/withdrawals/${id}`, data);
    return response.data;
  } catch (error) {
    // Add more specific error handling
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};
