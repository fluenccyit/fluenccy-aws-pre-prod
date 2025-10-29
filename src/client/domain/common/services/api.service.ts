class ApiService {
  async get<T>(route: string, allowError?: false): Promise<T>;
  async get<T>(route: string, allowError: true): Promise<T | null>;
  async get<T>(route: string, allowError = false) {
    try {
      const response = await fetch(route);
      const data: T = await response.json();

      return data;
    } catch (error) {
      if (allowError) {
        return null;
      }

      throw error;
    }
  }

  post = async <T>(route: string, body: Dictionary<any>) => {
    const response = await fetch(route, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const data: T = await response.json();

    return data;
  };
}

export const apiService = new ApiService();
