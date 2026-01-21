import { auth } from './client';

/**
 * Gets the current user's Firebase ID token for API authentication
 * This token should be sent in the Authorization header as: Bearer <token>
 *
 * @param forceRefresh - If true, forces a token refresh even if not expired
 * @returns The ID token string, or null if user is not authenticated
 */
export async function getAuthToken(forceRefresh: boolean = false): Promise<string | null> {
  const user = auth.currentUser;

  if (!user) {
    console.warn('getAuthToken: No authenticated user');
    return null;
  }

  try {
    const token = await user.getIdToken(forceRefresh);
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Makes an authenticated fetch request with Firebase ID token
 * Automatically adds Authorization header with Bearer token
 *
 * @param url - The URL to fetch
 * @param options - Standard fetch options (headers will be merged)
 * @returns Promise resolving to the Response object
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('User is not authenticated');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Makes an authenticated API request and returns JSON data
 * Handles errors and throws with descriptive messages
 *
 * @param url - The API endpoint URL
 * @param options - Standard fetch options
 * @returns Promise resolving to the parsed JSON response
 */
export async function authenticatedApiCall<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authenticatedFetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API call failed [${response.status}]: ${errorText}`);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
