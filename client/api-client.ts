import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
  timeout?: number; // Optional timeout
}

export const fetcher = async <T>(endpoint: string): Promise<T> => {
    const token = Cookies.get('auth_token');
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
  
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
  
      const result = await response.json();
      
      // Handle different response formats
      if (Array.isArray(result)) {
        return result as T; // Direct array response
      } else if (result?.data?.products && Array.isArray(result.data.products)) {
        return result.data.products as T; // Nested products array
      } else if (result?.data && Array.isArray(result.data)) {
        return result.data as T; // Standard Laravel format
      } else {
        throw new Error('Invalid API response format');
      }
      
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  };