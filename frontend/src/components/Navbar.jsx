import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const token = localStorage.getItem("token");
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => axios.get("/me").then((r) => r.data),
    retry: false,
    enabled: !!token,
  });

  const { data: notifData, refetch: refetchNotif } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => axios.get("/notifications").then((r) => r.data),
    enabled: !!token,
    refetchInterval: 30000, // provjeri svake 30 sekundi
  });

  const unreadCount = notifData?.unread_count ?? 0;
  const notifications = notifData?.data ?? [];

  const markAllRead = useMutation({
    mutationFn: () => axios.post("/notifications/read-all"),
    onSuccess: () => refetchNotif(),
  });

  const markOneRead = useMutation({
    mutationFn: (id) => axios.post(`/notifications/${id}/read`),
    onSuccess: () => refetchNotif(),
  });

  const logout = useMutation({
    mutationFn: () => axios.post("/logout"),
    onSuccess: () => {
      localStorage.removeItem("token");
      qc.clear();
      navigate("/");
      toast.success("Odjavljeni ste.");
    },
  });

  // Zatvori dropdown kad se klikne van njega
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-brand-dark shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-brand-red px-3 py-1 rounded-lg">
              <span className="text-white font-black text-xl tracking-tight">VOZIME</span>
            </div>
            <span className="text-brand-yellow font-bold text-lg tracking-wide hidden sm:block">
              OGLASI
            </span>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Pretraži vozila..."
                onKeyDown={(e) => e.key === "Enter" && navigate(`/search?q=${e.target.value}`)}
                className="w-full bg-brand-navy text-white placeholder-brand-slate rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-red hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition">
                Traži
              </button>
            </div>
          </div>

          {/* Desno */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Bell ikonica sa notifikacijama */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-brand-slate hover:text-white transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-brand-red text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown notifikacija */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-bold text-[#12142D] text-sm">Notifikacije</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllRead.mutate()}
                            className="text-xs text-[#FF0026] hover:underline font-medium"
                          >
                            Označi sve kao pročitano
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-gray-400 text-sm">
                            Nema notifikacija
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                if (!notif.read_at) markOneRead.mutate(notif.id);
                                setShowNotifications(false);
                              }}
                              className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${
                                !notif.read_at ? "bg-red-50" : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.read_at ? "bg-[#FF0026]" : "bg-gray-300"}`} />
                                <div>
                                  <p className="text-sm text-[#12142D]">{notif.data?.message}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(notif.created_at).toLocaleDateString("sr-Latn")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="px-4 py-2 border-t border-gray-100">
                        <Link
                          to="/dashboard/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs text-[#FF0026] hover:underline font-medium"
                        >
                          Sve notifikacije →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/dashboard"
                  className="text-brand-slate hover:text-white text-sm font-medium transition hidden sm:block"
                >
                  Moj nalog
                </Link>
                <Link
                  to="/dashboard/ads/create"
                  className="bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition"
                >
                  + Oglas
                </Link>
                <button
                  onClick={() => logout.mutate()}
                  className="text-brand-slate hover:text-white text-sm transition"
                >
                  Odjava
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-brand-slate hover:text-white text-sm font-medium transition"
                >
                  Prijava
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-yellow hover:bg-yellow-400 text-brand-dark px-4 py-2 rounded-xl text-sm font-bold transition"
                >
                  Registracija
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
