// import AsyncStorage from '@react-native-async-storage/async-storage';

// export interface User {
//   id: string;
//   email: string;
//   firstName?: string;
//   lastName?: string;
//   [key: string]: any;
// }

// export const AuthService = {
//   /**
//    * Get the stored authentication token
//    */
//   async getToken(): Promise<string | null> {
//     try {
//       return await AsyncStorage.getItem('token');
//     } catch (error) {
//       console.error('Error getting token:', error);
//       return null;
//     }
//   },

//   /**
//    * Get the stored user data
//    */
//   async getUser(): Promise<User | null> {
//     try {
//       const userString = await AsyncStorage.getItem('user');
//       if (userString) {
//         return JSON.parse(userString);
//       }
//       return null;
//     } catch (error) {
//       console.error('Error getting user:', error);
//       return null;
//     }
//   },

//   /**
//    * Check if user is authenticated
//    */
//   async isAuthenticated(): Promise<boolean> {
//     const token = await this.getToken();
//     return token !== null;
//   },

//   /**
//    * Store authentication data
//    */
//   async setAuth(token: string, user: User): Promise<void> {
//     try {
//       await AsyncStorage.setItem('token', token);
//       await AsyncStorage.setItem('user', JSON.stringify(user));
//     } catch (error) {
//       console.error('Error setting auth:', error);
//       throw error;
//     }
//   },

//   /**
//    * Clear authentication data (logout)
//    */
//   async clearAuth(): Promise<void> {
//     try {
//       await AsyncStorage.removeItem('token');
//       await AsyncStorage.removeItem('user');
//     } catch (error) {
//       console.error('Error clearing auth:', error);
//       throw error;
//     }
//   },
// };

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string; // Added role field
  [key: string]: any;
}

export const AuthService = {
  /**
   * Get the stored authentication token
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  /**
   * Get the stored user data
   */
  async getUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        return JSON.parse(userString);
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },

  /**
   * Check if user is an admin
   */
  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getUser();
      return user?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  /**
   * Get user role
   */
  async getUserRole(): Promise<string | null> {
    try {
      const user = await this.getUser();
      return user?.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },

  /**
   * Store authentication data
   */
  async setAuth(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error setting auth:', error);
      throw error;
    }
  },

  /**
   * Clear authentication data (logout)
   */
  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing auth:', error);
      throw error;
    }
  },
};