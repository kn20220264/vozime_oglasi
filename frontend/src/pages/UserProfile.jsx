import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import AdCard from "../components/AdCard";
import { useState } from "react";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: () => api.get(`/users/${id}`).then((r) => r.data.data),
  });

  const { data: adsData, isLoading: adsLoading } = useQuery({
    queryKey: ["user-ads", id, page],
    queryFn: () =>
      api.get(`/users/${id}/ads?page=${page}`).then((r) => r.data),
    enabled: !!id,
    keepPreviousData: true,
  });

  const ads = adsData?.data ?? [];
  const meta = adsData?.meta;

  if (userLoading)
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-2xl mb-6" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-56 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );

  if (!userData)
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl text-gray-400">Korisnik nije pronađen</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-[#FF0026] font-semibold"
        >
          ← Nazad
        </button>
      </div>
    );

  const isDealer = userData.role === "dealer";
  const profile = userData.profile;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ══ PROFIL HEADER ══ */}
        <div className={`rounded-2xl shadow-sm overflow-hidden mb-8 ${isDealer ? "bg-[#12142D]" : "bg-white"}`}>
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Avatar / Logo */}
            <div className="flex-shrink-0">
              {isDealer && profile?.logo ? (
                <div className="w-24 h-24 rounded-2xl bg-white overflow-hidden flex items-center justify-center p-2 shadow">
                  <img
                    src={`http://localhost:8000/storage/${profile.logo}`}
                    alt={profile.company_name}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              ) : (
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow
                  ${isDealer ? "bg-[#FF0026] text-white" : "bg-gray-100 text-gray-400"}`}>
                  {(profile?.company_name ?? userData.name)?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className={`text-2xl font-black ${isDealer ? "text-white" : "text-[#12142D]"}`}>
                  {isDealer ? (profile?.company_name ?? userData.name) : userData.name}
                </h1>
                {isDealer && (
                  <span className="bg-[#FFEA00] text-[#12142D] text-xs font-black px-2 py-0.5 rounded">
                    AUTO PLAC
                  </span>
                )}
              </div>

              <div className={`flex flex-wrap gap-3 text-sm ${isDealer ? "text-[#6674A3]" : "text-gray-500"}`}>
                {profile?.city && <span>📍 {profile.city}</span>}
                <span>📋 {userData.ads_count} aktivnih oglasa</span>
                {!isDealer && <span>👤 Privatni prodavac</span>}
              </div>

              {isDealer && profile?.description && (
                <p className="text-[#6674A3] text-sm mt-2 line-clamp-2">
                  {profile.description}
                </p>
              )}
            </div>

            {/* Dealer kontakt info */}
            {isDealer && (
              <div className="flex-shrink-0 space-y-1.5 text-right">
                {profile?.working_hours && (
                  <p className="text-[#6674A3] text-xs">🕐 {profile.working_hours}</p>
                )}
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#FF0026] text-xs hover:underline block"
                  >
                    🌐 {profile.website}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Dealer info bar */}
          {isDealer && (profile?.working_hours || profile?.website) && (
            <div className="border-t border-[#1B2B5A] px-6 py-3 flex flex-wrap gap-4 bg-[#0f1124]">
              {profile.working_hours && (
                <span className="text-xs text-[#6674A3] flex items-center gap-1.5">
                  🕐 <span>{profile.working_hours}</span>
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#FF0026] hover:underline flex items-center gap-1.5"
                >
                  🌐 <span>{profile.website}</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* ══ OGLASI ══ */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#FF0026] rounded-full" />
            <h2 className="text-lg font-black text-[#12142D]">
              Oglasi{" "}
              {meta?.total != null && (
                <span className="text-gray-400 font-normal text-base">({meta.total})</span>
              )}
            </h2>
          </div>
        </div>

        {adsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-56 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : ads.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>

            {/* Paginacija */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:border-[#FF0026] hover:text-[#FF0026] transition"
                >
                  ← Prethodna
                </button>
                <span className="text-sm text-gray-500 px-3">
                  {page} / {meta.last_page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page === meta.last_page}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:border-[#FF0026] hover:text-[#FF0026] transition"
                >
                  Sljedeća →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-semibold">Nema aktivnih oglasa</p>
          </div>
        )}
      </div>
    </div>
  );
}