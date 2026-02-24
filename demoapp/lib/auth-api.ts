import axios from 'axios';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';

export const authClient = axios.create({
  baseURL: AUTH_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const getUsers = async (token: string) => {
  return authClient.get('/api/admin/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const deleteUser = async (token: string, userId: string) => {
  return authClient.delete(`/api/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getOAuthClients = async (token: string) => {
  return authClient.get('/api/oauth/clients', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const createOAuthClient = async (token: string, data: any) => {
  return authClient.post('/api/oauth/clients', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const deleteOAuthClient = async (token: string, clientId: string) => {
  return authClient.delete(`/api/oauth/clients/${clientId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
