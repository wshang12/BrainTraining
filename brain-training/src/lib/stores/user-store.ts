/**
 * 用户全局状态管理
 * 
 * 使用 Zustand 替代散乱的 useState
 * 提供统一的状态管理和持久化
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mockAuth, type User } from '@/lib/auth';

interface UserState {
  // 用户信息
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // 用户偏好
  preferences: {
    largeText: boolean;
    highContrast: boolean;
    soundEnabled: boolean;
    hapticEnabled: boolean;
    language: 'zh' | 'en';
    theme: 'light' | 'dark' | 'auto';
  };
  
  // 游戏设置
  gameSettings: {
    difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
    autoSave: boolean;
    showTutorial: boolean;
  };
  
  // Actions
  login: (method: 'phone' | 'email', credential: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserState['preferences']>) => void;
  updateGameSettings: (settings: Partial<UserState['gameSettings']>) => void;
  checkAuth: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isLoading: false,
      isAuthenticated: false,
      
      preferences: {
        largeText: false,
        highContrast: false,
        soundEnabled: true,
        hapticEnabled: true,
        language: 'zh',
        theme: 'auto'
      },
      
      gameSettings: {
        difficulty: 'adaptive',
        autoSave: true,
        showTutorial: true
      },
      
      // 登录
      login: async (method, credential) => {
        set({ isLoading: true });
        
        try {
          const session = await mockAuth.login(method, credential);
          set({
            user: session.user,
            isAuthenticated: true,
            isLoading: false
          });
          return true;
        } catch (error) {
          console.error('Login failed:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      // 登出
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await mockAuth.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        } catch (error) {
          console.error('Logout failed:', error);
          set({ isLoading: false });
        }
      },
      
      // 更新用户信息
      updateUser: async (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        set({ isLoading: true });
        
        try {
          const updatedUser = await mockAuth.updateUser(currentUser.id, updates);
          set({
            user: updatedUser,
            isLoading: false
          });
        } catch (error) {
          console.error('Update user failed:', error);
          set({ isLoading: false });
        }
      },
      
      // 更新偏好设置
      updatePreferences: (preferences) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...preferences
          }
        }));
      },
      
      // 更新游戏设置
      updateGameSettings: (settings) => {
        set((state) => ({
          gameSettings: {
            ...state.gameSettings,
            ...settings
          }
        }));
      },
      
      // 检查认证状态
      checkAuth: async () => {
        set({ isLoading: true });
        
        try {
          const user = mockAuth.getCurrentUser();
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false
          });
        } catch (error) {
          console.error('Check auth failed:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      }
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        gameSettings: state.gameSettings
      })
    }
  )
);