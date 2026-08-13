import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const token = localStorage.getItem("token");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const isHome = location.pathname === '/';

  // Scroll listener — kad se skrola navbar dobija tamnu pozadinu
  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

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
    refetchInterval: 30000,
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

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = () => {
    if (!user) return "?";
    const name = user.name || user.email || "";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  // Na home: transparentan → taman kad se scrolla
  // Na ostalim stranicama: uvijek taman sticky
  const navBg = isHome
    ? scrolled ? 'bg-[#12142D]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    : 'bg-[#12142D] shadow-lg';

  const navPosition = isHome ? 'absolute' : 'sticky';

  return (
    <nav className={`${navBg} ${navPosition} top-0 left-0 right-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/images/bijeli.png" alt="VozimeOglasi" className="h-24
             w-auto" />
          </Link>

          {/* Autoplaci link */}
          <Link
            to="/autoplaci"
            className="hidden md:flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition px-3 py-2 rounded-lg hover:bg-white/10 flex-shrink-0 ml-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Autoplaci
          </Link>

          {/* Pretraga */}
          <Link
            to="/search"
            title="Pretraga"
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition px-3 py-2 rounded-lg hover:bg-white/10 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <span className="hidden md:inline">Pretraga</span>
          </Link>

          {/* Pomoć / Q&A */}
          <Link
            to="/pitanja"
            title="Česta pitanja"
            className="hidden lg:flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition px-3 py-2 rounded-lg hover:bg-white/10 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pomoć
          </Link>

          {/* Desno */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-white/60 hover:text-white transition rounded-lg hover:bg-white/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-[#FF0026] text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-bold text-[#12142D] text-sm">Notifikacije</h3>
                        {unreadCount > 0 && (
                          <button onClick={() => markAllRead.mutate()} className="text-xs text-[#FF0026] hover:underline font-medium">
                            Označi sve kao pročitano
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-gray-400 text-sm">Nema notifikacija</div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => { if (!notif.read_at) markOneRead.mutate(notif.id); setShowNotifications(false); }}
                              className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${!notif.read_at ? "bg-red-50" : ""}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.read_at ? "bg-[#FF0026]" : "bg-gray-300"}`} />
                                <div>
                                  <p className="text-sm text-[#12142D]">{notif.data?.message}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{new Date(notif.created_at).toLocaleDateString("sr-Latn")}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="px-4 py-2 border-t border-gray-100">
                        <Link to="/dashboard/notifications" onClick={() => setShowNotifications(false)} className="text-xs text-[#FF0026] hover:underline font-medium">
                          Sve notifikacije →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar + dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/10 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FF0026] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-black">{getInitials()}</span>
                    </div>
                    <span className="text-white text-sm font-medium hidden sm:block max-w-[100px] truncate">
                      {user.name?.split(" ")[0] || "Nalog"}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-white/50 transition-transform hidden sm:block ${showUserMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs font-black text-[#12142D] truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF0026] transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Moj profil
                      </Link>
                      <Link to="/dashboard/ads" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF0026] transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Moji oglasi
                      </Link>
                      <Link to="/dashboard/favorites" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF0026] transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        Favoriti
                      </Link>
                      <Link to="/dashboard/packages" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF0026] transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        Moj paket
                      </Link>
                      <div className="border-t border-gray-100 mt-1">
                        <button onClick={() => { setShowUserMenu(false); logout.mutate(); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#FF0026] hover:bg-red-50 transition w-full text-left">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Odjavi se
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Postavi oglas */}
                <Link to="/dashboard/ads/create" className="bg-[#FF0026] hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-base leading-none">+</span>
                  <span className="hidden sm:inline">Postavi oglas</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium transition px-3 py-2 rounded-lg hover:bg-white/10">
                  Prijava
                </Link>
                <Link to="/register" className="text-white/70 hover:text-white text-sm font-medium transition px-3 py-2 rounded-lg hover:bg-white/10 border border-white/20 hover:border-white/40">
                  Registracija
                </Link>
                <Link to="/register" className="bg-[#FF0026] hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-base leading-none">+</span>
                  <span className="hidden sm:inline">Postavi oglas</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}