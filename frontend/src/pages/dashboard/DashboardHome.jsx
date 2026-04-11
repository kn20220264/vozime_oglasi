import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

export default function DashboardHome() {
  const { user } = useAuthStore();

  const { data: myAds } = useQuery({
    queryKey: ["my-ads"],
    queryFn: () => api.get("/my-ads").then((r) => r.data.data),
  });

  const { data: favorites } = useQuery({
    queryKey: ["my-favorites"],
    queryFn: () => api.get("/favorites").then((r) => r.data.data),
  });

  const { data: notifications } = useQuery({
    queryKey: ["my-notifications"],
    queryFn: () => api.get("/notifications").then((r) => r.data.data),
  });

  const activeAds = myAds?.filter((a) => a.status === "active")?.length ?? 0;
  const pendingAds = myAds?.filter((a) => a.status === "pending")?.length ?? 0;
  const totalFavorites = favorites?.length ?? 0;
  const unreadNotifications = notifications?.filter((n) => !n.read_at)?.length ?? 0;

  const stats = [
    { label: "Aktivni oglasi", value: activeAds, to: "/dashboard/ads", color: "bg-green-50 text-green-700" },
    { label: "Na cekanju", value: pendingAds, to: "/dashboard/ads", color: "bg-yellow-50 text-yellow-700" },
    { label: "Omiljeni", value: totalFavorites, to: "/dashboard/favorites", color: "bg-blue-50 text-blue-700" },
    { label: "Obavjestenja", value: unreadNotifications, to: "/dashboard/notifications", color: "bg-red-50 text-red-700" },
  ];

  const quickActions = [
    { label: "Objavi oglas", to: "/dashboard/ads/create", desc: "Dodaj novo vozilo" },
    { label: "Moji oglasi", to: "/dashboard/ads", desc: "Upravljaj oglasima" },
    { label: "Kupi paket", to: "/dashboard/packages", desc: "Istakni oglas" },
    { label: "Uredi profil", to: "/dashboard/profile", desc: "Azuriraj podatke" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#12142D]">Dobrodosli, {user?.name}!</h1>
        <p className="text-gray-400 text-sm mt-1">Pregled vaseg naloga</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Link key={i} to={s.to} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <p className="text-3xl font-black text-[#12142D]">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-2 inline-block ${s.color}`}>
              Pogledaj
            </span>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-bold text-[#12142D] mb-3">Brze akcije</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((a, i) => (
            <Link
              key={i}
              to={a.to}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF0026] transition">
                <div className="w-2 h-2 bg-[#FF0026] rounded-full group-hover:bg-white transition" />
              </div>
              <div>
                <p className="font-bold text-[#12142D] text-sm group-hover:text-[#FF0026] transition">{a.label}</p>
                <p className="text-xs text-gray-400">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent ads */}
      {myAds?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-[#12142D]">Posljednji oglasi</h2>
            <Link to="/dashboard/ads" className="text-sm text-[#FF0026] font-semibold">Svi oglasi</Link>
          </div>
          <div className="space-y-2">
            {myAds.slice(0, 3).map((ad) => (
              <div key={ad.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-[#12142D] truncate">{ad.title}</p>
                  <p className="text-xs text-gray-400">{ad.views_count} pregleda · {ad.created_ago}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    ad.status === "active" ? "bg-green-100 text-green-700" :
                    ad.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {ad.status}
                  </span>
                  <p className="font-bold text-[#FF0026]">{Number(ad.price).toLocaleString()} EUR</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}