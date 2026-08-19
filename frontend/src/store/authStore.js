import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isLoading: true,  // ← dodaj ovo

    login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },

    setUser: (user) => set({ user, isLoading: false }),  // ← isLoading: false
}));

export default useAuthStore;