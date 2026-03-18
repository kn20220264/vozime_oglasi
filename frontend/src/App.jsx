import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Navbar      from './components/Navbar';
import Home        from './pages/Home';
import Search      from './pages/Search';
import AdDetail    from './pages/AdDetail';
import CreateAd    from './pages/CreateAd';
import EditAd      from './pages/EditAd';
import Dashboard   from './pages/Dashboard';
import Login       from './pages/Login';
import Register    from './pages/Register';
import AdminPanel  from './pages/AdminPanel';
import NotFound    from './pages/NotFound';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 1000 * 60 * 5,
        }
    }
});

// Protected route wrapper
function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
}

// Admin route wrapper
function AdminRoute({ children }) {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    // Real check je na backend-u, ovo je samo UI zaštita
    return children;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                        <Routes>
                            {/* Javne rute */}
                            <Route path="/"           element={<Home />} />
                            <Route path="/search"     element={<Search />} />
                            <Route path="/ads/:slug"  element={<AdDetail />} />
                            <Route path="/login"      element={<Login />} />
                            <Route path="/register"   element={<Register />} />

                            {/* Zaštićene rute */}
                            <Route path="/dashboard" element={
                                <PrivateRoute><Dashboard /></PrivateRoute>
                            } />
                            <Route path="/ads/create" element={
                                <PrivateRoute><CreateAd /></PrivateRoute>
                            } />
                            <Route path="/ads/:slug/edit" element={
                                <PrivateRoute><EditAd /></PrivateRoute>
                            } />

                            {/* Admin */}
                            <Route path="/admin/*" element={
                                <AdminRoute><AdminPanel /></AdminRoute>
                            } />

                            {/* 404 */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                </div>

                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#12142D',
                            color: '#fff',
                            borderRadius: '12px',
                            fontSize: '14px',
                        },
                        success: {
                            iconTheme: { primary: '#FFEA00', secondary: '#12142D' }
                        },
                        error: {
                            iconTheme: { primary: '#FF0026', secondary: '#fff' }
                        },
                    }}
                />
            </BrowserRouter>
        </QueryClientProvider>
    );
}