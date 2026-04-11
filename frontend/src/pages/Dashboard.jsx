import { NavLink, Outlet, Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const navItems = [
  { to: "/dashboard",            label: "Pregled",          end: true, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { to: "/dashboard/ads",        label: "Moji oglasi",      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { to: "/dashboard/ads/create", label: "Objavi oglas",     icon: "M12 4v16m8-8H4", highlight: true },
  { to: "/dashboard/favorites",  label: "Oglasi koje pratim", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { to: "/dashboard/notifications", label: "Obavjestenja",  icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.437L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { to: "/dashboard/packages",   label: "Krediti / Paketi", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
  { to: "/dashboard/profile",    label: "Podesavanja",      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

// Vidljivo samo dealerima
const dealerNavItems = [
  { to: "/dashboard/stats", label: "Statistike", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

export default function Dashboard() {
  const { user, token, isLoading } = useAuthStore();

  if (isLoading && token && !user) return null;
  if (!token) return <Navigate to="/login" replace />;

  const isDealer = user?.role === "dealer";
  const allNavItems = isDealer
    ? [...navItems.slice(0, -1), ...dealerNavItems, navItems[navItems.length - 1]]
    : navItems;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">

        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          {/* User info */}
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.avatar ? (
                  <img src={`http://localhost:8000/storage/${user.avatar}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-gray-400">{user.name?.[0]}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#12142D] truncate">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {allNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium transition border-l-2 ${
                    item.highlight
                      ? isActive
                        ? "border-[#FF0026] bg-red-50 text-[#FF0026]"
                        : "border-transparent text-[#FF0026] hover:bg-red-50"
                      : isActive
                      ? "border-[#FF0026] bg-red-50 text-[#FF0026]"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-[#12142D]"
                  }`
                }
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>

      </div>
    </div>
  );
}