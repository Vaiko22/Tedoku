import { configureApi } from '@tedoku/shared';

/**
 * Points the shared API client at the backend.
 * Until EXPO_PUBLIC_API_URL is set, every screen runs on placeholder data.
 */
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

configureApi({
  baseUrl: apiUrl ?? '',
  useMocks: !apiUrl,
});
