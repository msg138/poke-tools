import axios, { AxiosInstance } from 'axios';
import { saveToken, getSavedToken } from './storage';

let axiosInstance: AxiosInstance | null = null;
let cacheRequests = JSON.parse((typeof window === 'undefined' ? null : window.localStorage.getItem('cache_requests')) || '{}');

const cacheKey = (resource, count) => `cache-${resource}-${count}`;

const api = async (method: 'get' | 'post' | 'delete' | 'put', path: string, data?: any, noCache = false) => {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
        'x-auth': getSavedToken(),
      },
    })
  }
  if (axiosInstance && (!axiosInstance.defaults.headers['x-auth'])) {
    const token = getSavedToken();
    if (!token) {
      window.location = '/login';
      console.error('No token');
      return;
    }
    axiosInstance.defaults.headers['x-auth'] = token;
  }
  const finalPath = `/api${path}`;
  const resource = `${method}-${finalPath}`
  if (method === 'get' && !noCache && cacheRequests[resource]) {
    const cacheKeys = cacheRequests[resource];
    let totalData = '';
    for (const key of cacheKeys) {
      totalData += window.localStorage.getItem(key);
    }
    return JSON.parse(totalData);
  }
  try {
    let result;
    if (method === 'delete') {
      result = await axiosInstance.delete(finalPath, { data });
    } else {
      result = await axiosInstance[method](finalPath, data);
    }
    if (method === 'get' && !noCache) {
      const dataToCache = JSON.stringify({
        data: result.data,
      });
      if (dataToCache.length > 5 * 1024 * 1024) {
        console.warn('Unable to cache request of ', dataToCache.length / 1024 / 1024, 'kb : ', resource);
        return result;
      }
      const cacheKeys = [];
      let currentData = '';
      for (const character of dataToCache) {
        currentData += character;
        if (currentData.length > 10240) {
          const newKey = cacheKey(resource, cacheKeys.length);
          localStorage.setItem(newKey, currentData);
          currentData = '';
          cacheKeys.push(newKey);
        }
      }
      if (currentData.length > 0) {
        const newKey = cacheKey(resource, cacheKeys.length);
        localStorage.setItem(newKey, currentData);
        currentData = '';
        cacheKeys.push(newKey);
      }

      cacheRequests[resource] = cacheKeys;
      localStorage.setItem('cache_requests', JSON.stringify(cacheRequests));
    }
    return result;

  } catch(error) {
    if (error?.response?.data?.message === 'Unable to verify') {
      saveToken(null);
      window.location = '/login';
    }
    console.log(error);
  }
};

export const clearCache = () => {
  cacheRequests = {};
  localStorage.setItem('cache_requests', '{}');
}

export default api;

