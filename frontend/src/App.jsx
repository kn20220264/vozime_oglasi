import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";
import api from "./api/axios";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import SearchFilters from "./pages/SearchFilters";
import AdDetail from "./pages/AdDetail";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/dashboard/DashboardHome";
import CreateAd from "./pages/dashboard/CreateAd";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import MyAds from "./pages/dashboard/MyAds";
import EditAd from "./pages/dashboard/EditAd";
import Favorites from "./pages/dashboard/Favorites";
import Profile from "./pages/dashboard/Profile";
import DealerStats from "./pages/dashboard/DealerStats";
import ModeratorPanel from "./pages/ModeratorPanel";
import Packages from "./pages/dashboard/Packages";
import UserProfile from "./pages/UserProfile";
import GoogleCallback from "./pages/GoogleCallback";
import VerifyEmail from "./pages/VerifyEmail";
import Notifications from "./pages/dashboard/Notifications";
import DealerRegister from "./pages/DealerRegister";
import Dealers from "./pages/Dealers";
import Compare from "./pages/Compare";
import QA from "./pages/QA";
import PopupBanner from "./components/PopupBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
      staleTime: 1000 * 60 * 5,
    },
  },
});

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AuthInit() {
  const { token, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    api.get("/me")
      .then((r) => setUser(r.data))
      .catch(() => {
        logout();
        setUser(null);
      });
  }, []);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInit />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <PopupBanner />
          <main className="flex-1">
            <Routes>
              {/* Javne rute */}
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/search/filters" element={<SearchFilters />} />
              <Route path="/ads/:slug" element={<AdDetail />} />
              <Route path="/users/:id" element={<UserProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/dealer" element={<DealerRegister />} />
              <Route path="/autoplaci" element={<Dealers />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/pitanja" element={<QA />} />

              {/* Google OAuth callback */}
              <Route path="/auth/google/callback" element={<GoogleCallback />} />

              {/* Email verifikacija */}
              <Route path="/email/verify/:id/:hash" element={<VerifyEmail />} />

              {/* Dashboard — nested rute */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="ads" element={<MyAds />} />
                <Route path="ads/create" element={<CreateAd />} />
                <Route path="ads/:slug/edit" element={<EditAd />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<Profile />} />
                <Route path="stats" element={<DealerStats />} />
                <Route path="packages" element={<Packages />} />
              </Route>

              {/* Admin */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />

              {/* Moderator */}
              <Route
                path="/moderator/*"
                element={
                  <PrivateRoute>
                    <ModeratorPanel />
                  </PrivateRoute>
                }
              />

              {/* 404 — mora biti zadnja */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#12142D",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#FFEA00", secondary: "#12142D" },
            },
            error: {
              iconTheme: { primary: "#FF0026", secondary: "#fff" },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}