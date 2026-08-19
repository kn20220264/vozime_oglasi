import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications").then((r) => r.data),
    // Uvijek svjeza lista — globalni staleTime bi inace prikazao kesiranu (praznu) verziju
    staleTime: 0,
    refetchOnMount: "always",
  });

  const markAllRead = useMutation({
    mutationFn: () => api.post("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Sva obavjestenja oznacena kao procitana");
    },
  });

  const markRead = useMutation({
    mutationFn: (id) => api.post(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#12142D]">Obavjestenja</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{unreadCount} neprocitanih</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="text-sm text-[#FF0026] font-semibold hover:underline"
          >
            Oznaci sve kao procitano
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-3">🔔</div>
          <h3 className="font-bold text-gray-800 text-lg mb-1">Nema obavjestenja</h3>
          <p className="text-gray-400 text-sm">Ovdje ce se prikazivati vasa obavjestenja</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const data = n.data ?? {};
            const isUnread = !n.read_at;
            return (
              <div
                key={n.id}
                onClick={() => isUnread && markRead.mutate(n.id)}
                className={`bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3 transition cursor-pointer hover:shadow-md ${
                  isUnread ? "border-l-4 border-[#FF0026]" : ""
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isUnread ? "bg-[#FF0026]" : "bg-gray-200"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isUnread ? "font-semibold text-[#12142D]" : "text-gray-600"}`}>
                    {data.message ?? "Novo obavjestenje"}
                  </p>
                  {data.ad_title && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{data.ad_title}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-1">{new Date(n.created_at).toLocaleString("sr-Latn")}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}