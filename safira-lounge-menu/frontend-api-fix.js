// Frontend API URLs für die funktionierende /safira API

// In src/services/api.ts ändern:

const API_BASE_URL = 'http://test.safira-lounge.de/api-fixed.php';

// Alle API-Calls anpassen:
export const getProducts = async () => {
  const response = await api.get('?action=products');
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('?action=health');
  return response.data;
};

export const getConfig = async () => {
  const response = await api.get('?action=settings');
  return response.data;
};

// Test-Connection für diagnostic:
export const testConnection = async () => {
  const response = await api.get('?action=test-connection');
  return response.data;
};