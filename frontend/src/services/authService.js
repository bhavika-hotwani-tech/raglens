import api from './api';

// Set this to false to connect directly to the real FastAPI backend
export const USE_MOCK = false;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Creates a mock JWT string for client simulation
 */
function createMockJwt(user) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    })
  );
  const signature = 'mock_signature_' + Math.random().toString(36).substring(2);
  return `${header}.${payload}.${signature}`;
}

export const authService = {
  /**
   * Log in user with email and password
   */
  async login({ email, password }) {
    if (USE_MOCK) {
      await delay(600);

      // Mock validation rule: password 'wrong' simulates invalid credentials
      if (password === 'wrong') {
        throw new Error('Invalid credentials');
      }

      const mockUser = {
        id: 'usr-enterprise-01',
        name: email.split('@')[0] ? email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Sarah Chen',
        email: email || 'sarah.chen@enterprise.ai',
        role: 'Lead AI & Retrieval Engineer',
        organization: 'Acme Global Defense & Health AI',
        avatarUrl: null,
      };

      const token = createMockJwt(mockUser);
      localStorage.setItem('raglens_token', token);
      localStorage.setItem('raglens_user', JSON.stringify(mockUser));

      return { token, user: mockUser };
    }

    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('raglens_token', token);
    localStorage.setItem('raglens_user', JSON.stringify(user));
    return response.data;
  },

  /**
   * Register a new enterprise user account
   */
  async register({ name, email, password }) {
    if (USE_MOCK) {
      await delay(700);

      if (password === 'wrong') {
        throw new Error('Registration failed with provided parameters.');
      }

      const mockUser = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        name: name || 'Enterprise Engineer',
        email: email,
        role: 'AI Systems Architect',
        organization: 'Enterprise Workspace',
        avatarUrl: null,
      };

      const token = createMockJwt(mockUser);
      localStorage.setItem('raglens_token', token);
      localStorage.setItem('raglens_user', JSON.stringify(mockUser));

      return { token, user: mockUser };
    }

    const response = await api.post('/auth/register', { name, email, password });
    const { token, user } = response.data;
    localStorage.setItem('raglens_token', token);
    localStorage.setItem('raglens_user', JSON.stringify(user));
    return response.data;
  },

  /**
   * Get currently logged-in user profile
   */
  async getCurrentUser() {
    if (USE_MOCK) {
      const stored = localStorage.getItem('raglens_user');
      return stored ? JSON.parse(stored) : null;
    }

    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Log out current user and clear local storage credentials
   */
  async logout() {
    if (!USE_MOCK) {
      try {
        await api.post('/auth/logout');
      } catch {
        // Continue clearing client storage regardless
      }
    }
    localStorage.removeItem('raglens_token');
    localStorage.removeItem('raglens_user');
  },

  /**
   * Check if token is present in storage
   */
  getToken() {
    return localStorage.getItem('raglens_token');
  },
};
