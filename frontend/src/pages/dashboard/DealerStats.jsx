import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export default function DealerStats() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["profile-stats"],
    queryFn: () => api.get("/profile/stats").then((r) => r.data),
  });

  const chartData = statsData
    ? [
        { name: "Aktivni",    value: statsData.summary.active,   color: "#22c55e" },
        { name: "Na čekanju", value: statsData.summary.pending,  color: "#f59e0b" },
        { name: "Prodati",    value: statsData.summary.sold,     color: "#3b82f6" },
        { name: "Istekli",   value: statsData.summary.expired,  color: "#9ca3af" },
        { name: "Odbijeni",  value: statsData.summary.rejected, color: "#ef4444" },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#12142D]">Statistike oglasa</h1>
        <p className="text-gray-400 text-sm mt-1">Pregled aktivnosti vaših oglasa</p>
      </div>

      {/* Summary kartice */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-black text-[#12142D]">{statsData?.summary.total ?? 0}</p>
          <p className="text-sm text-gray-400 mt-1">Ukupno oglasa</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-black text-green-600">{statsData?.summary.active ?? 0}</p>
          <p className="text-sm text-gray-400 mt-1">Aktivni</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-black text-blue-600">{statsData?.summary.sold ?? 0}</p>
          <p className="text-sm text-gray-400 mt-1">Prodati</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-black text-[#FF0026]">{statsData?.summary.total_views ?? 0}</p>
          <p className="text-sm text-gray-400 mt-1">Ukupno pregleda</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#12142D] mb-5">Status oglasa</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={40}>
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top oglasi */}
      {statsData?.top_ads?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#12142D] mb-4">Top oglasi po pregledima</h2>
          <div className="space-y-2">
            {statsData.top_ads.map((ad, i) => (
              <div key={ad.id} className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-lg font-black text-gray-300 w-6 flex-shrink-0">#{i + 1}</span>
                <span className="text-sm text-[#12142D] font-medium truncate flex-1">{ad.title}</span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400">{ad.views_count} pregleda</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    ad.status === "active"  ? "bg-green-100 text-green-700" :
                    ad.status === "sold"    ? "bg-blue-100 text-blue-700" :
                    ad.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {ad.status === "active"  ? "Aktivan"     :
                     ad.status === "sold"    ? "Prodat"      :
                     ad.status === "pending" ? "Na čekanju"  :
                     ad.status === "expired" ? "Istekao"     :
                     ad.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
