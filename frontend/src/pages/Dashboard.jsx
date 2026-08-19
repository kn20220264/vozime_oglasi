import { useState } from "react";
import { NavLink, Link, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";
import useAuthStore from "../store/authStore";

const userNavItems = [
  { to: "/dashboard",               label: "Pregled",            end: true, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { to: "/dashboard/ads",           label: "Moji oglasi",        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { to: "/dashboard/ads/create",    label: "Objavi oglas",       icon: "M12 4v16m8-8H4", highlight: true },
  { to: "/dashboard/favorites",     label: "Oglasi koje pratim", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { to: "/dashboard/notifications", label: "Obavještenja",       icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.437L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { to: "/dashboard/packages",      label: "Paketi",             icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
  { to: "/dashboard/profile",       label: "Podešavanja",        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const dealerNavItems = [
  { to: "/dashboard",               label: "Pregled",            end: true, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { to: "/dashboard/ads",           label: "Moji oglasi",        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { to: "/dashboard/ads/create",    label: "Objavi oglas",       icon: "M12 4v16m8-8H4", highlight: true },
  { to: "/dashboard/favorites",     label: "Oglasi koje pratim", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { to: "/dashboard/stats",         label: "Statistike",         icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { to: "/dashboard/notifications", label: "Obavještenja",       icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.437L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { to: "/dashboard/packages",      label: "Moj paket",          icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { to: "/dashboard/profile",       label: "Profil autoplaca",   icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
];

function SidebarNav({ items, unreadCount, onNavigate }) {
  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition border ${
              isActive
                ? "bg-[#1A1D3A] border-white/[0.06] text-white"
                : item.highlight
                ? "border-transparent text-[#FF0026] hover:bg-[#1A1D3A]"
                : "border-transparent text-[#6674A3] hover:text-white hover:bg-[#1A1D3A]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <svg
                className={`w-5 h-5 flex-shrink-0 ${isActive || item.highlight ? "text-[#FF0026]" : "text-current"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="flex-1 truncate">{item.label}</span>
              {item.to === "/dashboard/notifications" && unreadCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#FF0026] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function DealerPromoCard({ onNavigate }) {
  return (
    <div className="mt-8 bg-[#1A1D3A] border border-white/[0.06] rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-[#FF0026]/10 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-[#FF0026]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>
      <p className="font-bold text-white text-sm">Imate autoplac?</p>
      <p className="text-xs text-[#6674A3] mt-1 leading-relaxed">
        Registrujte svoj autoplac i predstavite kompletnu ponudu kupcima.
      </p>
      <Link
        to="/register/dealer"
        onClick={onNavigate}
        className="mt-4 block text-center bg-[#FF0026] hover:bg-red-700 text-white text-sm font-bold py-2.5 rounded-xl transition"
      >
        Registruj autoplac
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { user, token, isLoading, logout } = useAuthStore();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => axios.get("/notifications").then((r) => r.data),
    enabled: !!token,
  });
  const unreadCount = notifData?.unread_count ?? 0;

  if (isLoading && token && !user) return null;
  if (!token) return <Navigate to="/login" replace />;

  const isDealer = user?.role === "dealer";
  const navItems = isDealer ? dealerNavItems : userNavItems;

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const avatar = (
    <div className="w-8 h-8 rounded-full bg-[#1A1D3A] border border-white/[0.06] flex items-center justify-center flex-shrink-0 overflow-hidden">
      {user?.avatar ? (
        <img src={`http://localhost:8000/storage/${user.avatar}`} className="w-full h-full object-cover" alt="" />
      ) : (
        <span className="text-sm font-bold text-[#6674A3]">{user?.name?.[0]}</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#12142D] text-white">

      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-[#12142D]/95 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-16 lg:h-20 flex items-center gap-3 lg:gap-6">

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl bg-[#1A1D3A] border border-white/[0.06] flex items-center justify-center text-[#6674A3] hover:text-white transition flex-shrink-0"
            aria-label="Otvori meni"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to="/" className="flex-shrink-0">
            <img src="/images/bijeli.png" alt="VozimeOglasi" className="h-7 lg:h-9 w-auto" />
          </Link>

          {/* Search (md i veće) */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-xl mx-auto">
            <div className="relative">
              <svg
                className="w-4 h-4 text-[#6674A3] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pretraži oglase..."
                className="w-full bg-[#1A1D3A] border border-white/[0.06] rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder-[#6674A3] focus:outline-none focus:border-white/20 transition"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 lg:gap-3 ml-auto">

            {/* Pretraga (mobile) */}
            <Link
              to="/search"
              className="md:hidden w-10 h-10 rounded-xl bg-[#1A1D3A] border border-white/[0.06] flex items-center justify-center text-[#6674A3] hover:text-white transition"
              aria-label="Pretraga"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Poruke (uskoro) */}
            <button
              disabled
              title="Uskoro"
              className="hidden sm:flex w-10 h-10 rounded-xl bg-[#1A1D3A] border border-white/[0.06] items-center justify-center text-[#6674A3] opacity-60 cursor-not-allowed"
              aria-label="Poruke"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>

            {/* Obavještenja */}
            <Link
              to="/dashboard/notifications"
              className="relative w-10 h-10 rounded-xl bg-[#1A1D3A] border border-white/[0.06] flex items-center justify-center text-[#6674A3] hover:text-white transition"
              aria-label="Obavještenja"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.437L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF0026]" />
              )}
            </Link>

            {/* User chip */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 bg-[#1A1D3A] border border-white/[0.06] rounded-full pl-1.5 pr-3 py-1.5 hover:border-white/20 transition"
              >
                {avatar}
                <span className="hidden sm:block text-sm font-semibold text-white max-w-[120px] truncate">
                  {user?.name}
                </span>
                <svg className="w-4 h-4 text-[#6674A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h.01M12 12h.01M19 12h.01" />
                </svg>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-[#1A1D3A] border border-white/[0.06] rounded-xl shadow-xl z-50 overflow-hidden py-1">
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white hover:bg-white/[0.04] transition"
                    >
                      <svg className="w-4 h-4 text-[#6674A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profil
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#FF0026] hover:bg-white/[0.04] transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Odjava
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#12142D] border-r border-white/[0.06] p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 px-1">
              <img src="/images/bijeli.png" alt="VozimeOglasi" className="h-7 w-auto" />
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-xl bg-[#1A1D3A] border border-white/[0.06] flex items-center justify-center text-[#6674A3] hover:text-white transition"
                aria-label="Zatvori meni"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarNav items={navItems} unreadCount={unreadCount} onNavigate={() => setDrawerOpen(false)} />
            {!isDealer && <DealerPromoCard onNavigate={() => setDrawerOpen(false)} />}
          </aside>
        </div>
      )}

      {/* Sadržaj */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-10 flex items-start gap-8">

        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28">
          <SidebarNav items={navItems} unreadCount={unreadCount} />
          {!isDealer && <DealerPromoCard />}
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
          <p className="text-center text-xs text-[#6674A3] mt-12 pb-4">VozimeOglasi © 2026</p>
        </main>

      </div>
    </div>
  );
}
