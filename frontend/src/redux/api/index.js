import axios from 'axios';
import store from '../store';
import { logout as logoutAction } from '../actions';

const BASE_URL = 'https://cert.imatrixsys.com/api';
export const HEADER_TOKEN = 'x-auth-token';

const getToken = () => store.getState().auth.token;
const logout = () => store.dispatch(logoutAction());

const GET = 'get';
const POST = 'post';
const PUT = 'put';
const DELETE = 'delete';

const request = async (url, funcConstant, data, customHeaders = {}) => {
  let response;
  const token = getToken();
  const headers = { ...customHeaders, [HEADER_TOKEN]: token };
  try {
    switch (funcConstant) {
      case GET:
        response = await axios.get(url, { headers });
        break;
      case POST:
        response = await axios.post(url, data, { headers });
        break;
      case PUT:
        response = await axios.put(url, data, { headers });
        break;
      case DELETE:
        response = await axios.put(url, data, { headers });
        break;
    }
    return response;
  } catch (e) {
    if (e.response.status === 401) {
      logout();
      return;
    }
    throw e;
  }
};
export const login = async (email = '', password = '') => {
  const { data } = await axios.post(`${BASE_URL}/login`, { email, password });
  return data;
};

export const getProducts = async () => {
  const { data } = await request(`${BASE_URL}/product`, GET);
  return data;
};

export const getBatches = async (productId) => {
  const { data } = await request(`${BASE_URL}/device/batch/all/${productId}`, GET);
  return data;
};

export const createBatch = async (productId, amount, type, body) => {
  const { data } = await request(
    `${BASE_URL}/device/batch?productId=${productId}${amount ? `&amount=${amount}` : ``}&type=${type}`,
    POST,
    body
  );
  return data;
};

export const checkMac = async (mac, amount) => {
  try {
    await request(
      `${BASE_URL}/device/mac/available?mac=${mac}${amount ? `&amount=${amount}` : ''}`,
      GET
    );
    return true;
  } catch (e) {
    return false;
  }
};

export const getBatchDevices = async (batchId, { from, to }) => {
  const { data } = await request(
    `${BASE_URL}/device/batch/${batchId}?from=${from}&to=${to}`,
    GET
  );
  return data;
};

export const downloadBatch = async (batchId) => {
  const response = await request(
    `${BASE_URL}/device/batch/download/${batchId}`,
    GET
  );
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `batch-${batchId}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getBatchInfo = async (batchId) => {
  const { data } = await request(
    `${BASE_URL}/device/batch/info/${batchId}`,
    GET
  );
  return data;
};

export const createBatchFromFile = async (file, productId, description) => {
  const { data } = await request(
    `${BASE_URL}/device/batch/upload`,
    POST,
    file,
    {
      description,
      'Content-Type': 'multipart/form-data',
      productid: productId
    }
  );
  return data;
};