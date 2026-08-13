import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";

// Bočni ad placement — ubaci <SidebarBanner /> u sidebar bilo koje stranice.
// Rotira kroz sve aktivne "sidebar" banere.
export default function SidebarBanner({ className = "" }) {
  const viewed = useRef(new Set());

  const { data } = useQuery({
    queryKey: ["banners", "sidebar"],
    queryFn: () => axios.get("/banners?position=sidebar").then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  });

  const banners = data ?? [];

  useEffect(() => {
    banners.forEach((b) => {
      if (!viewed.current.has(b.id)) {
        viewed.current.add(b.id);
        axios.post(`/banners/${b.id}/view`).catch(() => {});
      }
    });
  }, [banners]);

  if (banners.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {banners.map((b) => (
        <a
          key={b.id}
          href={b.link_url || "#"}
          target={b.link_url ? "_blank" : undefined}
          rel="noreferrer"
          onClick={() => axios.post(`/banners/${b.id}/click`).catch(() => {})}
          className="block rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition"
        >
          <img src={b.image} alt={b.title} className="w-full object-cover" />
          <div className="px-3 py-1.5 bg-gray-50 text-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Reklama</span>
          </div>
        </a>
      ))}
    </div>
  );
}
