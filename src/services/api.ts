/**
 * Base Simulated API Client with latency simulation and error boundaries
 */

const LATENCY_MS = 250;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const api = {
  get: async <T>(fetcher: () => T, customLatency = LATENCY_MS): Promise<ApiResponse<T>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: fetcher(),
        });
      }, customLatency);
    });
  },

  post: async <T, B>(endpoint: string, body: B, result: T): Promise<ApiResponse<T>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: result,
          message: `Acción realizada con éxito en ${endpoint}`,
        });
      }, LATENCY_MS);
    });
  },
};
