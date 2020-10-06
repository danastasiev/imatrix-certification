import axios from 'axios';
const BASE_URL = 'https://localhost/api';
export const HEADER_TOKEN = 'x-auth-token';

export const login = async (email = '', password = '') => {
  const { data } = await axios.post(`${BASE_URL}/login`, {name: email, password});
  return data;
};

export const getProducts = async (token) => {
  const {data} = await axios.get(
    `${BASE_URL}/product`,
    {
      headers: {
        [HEADER_TOKEN]: token
      }
    }
  );
  return data;
};

export const getBatches = async (token, productId) => {
  const {data} = await axios.get(
    `${BASE_URL}/device/batch/all/${productId}`,
    {
      headers: {
        [HEADER_TOKEN]: token
      }
    }
  );
  return data;
};

export const createBatch = async (token, productId, amount, type, body) => {
  const {data} = await axios.post(
    `${BASE_URL}/device/batch?productId=${productId}&amount=${amount}&type=${type}`,
    body,
    {
      headers: {
        [HEADER_TOKEN]: token
      }
    }
  );
  return data;
};

export const checkMac = async (token, mac, amount) => {
  try {
    await axios.get(
      `${BASE_URL}/device/mac/available?amount=${amount}&mac=${mac}`,
      {
        headers: {
          [HEADER_TOKEN]: token
        }
      }
    );
    return true;
  } catch(e) {
    return false;
  }
};

export const getBatchDevices = async (token, batchId, { from, to }) => {
  const {data} = await axios.get(
    `${BASE_URL}/device/batch/${batchId}?from=${from}&to=${to}`,
    {
      headers: {
        [HEADER_TOKEN]: token
      }
    }
  );
  return data;
};

export const downloadBatch = async (token, batchId,) => {
  const response = await axios.get(
    `${BASE_URL}/device/batch/download/${batchId}`,
    {
      headers: {
        [HEADER_TOKEN]: token
      }
    }
  );
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `batch-${batchId}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getBatchInfo = async (token, batchId) => {
  const {data} = await axios.get(
    `${BASE_URL}/device/batch/info/${batchId}`,
    {
      headers: {
        [HEADER_TOKEN]: token
      }
    }
  );
  return data;
};