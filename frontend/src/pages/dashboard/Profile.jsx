import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    company_name: "",
    pib: "",
    address: "",
    city_id: "",
    description: "",
    website: "",
    working_hours: "",
  });

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/profile").then((r) => r.data),
  });

  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: () => api.get("/cities").then((r) => r.data.data ?? r.data),
  });
  const cities = Array.isArray(citiesData) ? citiesData : [];

  const isDealer = profileData?.user?.role === "dealer";

  const { data: statsData } = useQuery({
    queryKey: ["profile-stats"],
    queryFn: () => api.get("/profile/stats").then((r) => r.data),
    enabled: isDealer,
  });

  useEffect(() => {
    if (profileData) {
      setForm({
        name:          profileData.user?.name ?? "",
        phone:         profileData.user?.phone ?? "",
        company_name:  profileData.profile?.company_name ?? "",
        pib:           profileData.profile?.pib ?? "",
        address:       profileData.profile?.address ?? "",
        city_id:       profileData.profile?.city_id ?? "",
        description:   profileData.profile?.description ?? "",
        website:       profileData.profile?.website ?? "",
        working_hours: profileData.profile?.working_hours ?? "",
      });
    }
  }, [profileData]);

  const updateProfile = useMutation({
    mutationFn: (data) => api.put("/profile", data),
    onSuccess: (res) => {
      toast.success("Profil uspješno ažuriran!");
      qc.setQueryData(["profile"], (old) => ({
        ...old,
        user:    { ...old.user, name: form.name, phone: form.phone },
        profile: res.data.profile,
      }));
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast.error("Greška pri ažuriranju profila."),
  });

  const uploadAvatar = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("avatar", file);
      return api.post("/profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      toast.success("Avatar ažuriran!");
      setUser({ ...user, avatar: res.data.avatar });
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Greška pri uploadu avatara."),
  });

  const uploadLogo = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("logo", file);
      return api.post("/profile/logo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Logo ažuriran!");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Greška pri uploadu loga."),
  });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // Podaci za bar chart
  const chartData = statsData
    ? [
        { name: "Aktivni",   value: statsData.summary.active,   color: "#22c55e" },
        { name: "Na čekanju", value: statsData.summary.pending,  color: "#f59e0b" },
        { name: "Prodati",   value: statsData.summary.sold,     color: "#3b82f6" },
        { name: "Istekli",   value: statsData.summary.expired,  color: "#9ca3af" },
        { name: "Odbijeni",  value: statsData.summary.rejected, color: "#ef4444" },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-[#12142D]">Moj profil</h1>
        <p className="text-gray-400 text-sm mt-1">Ažuriraj svoje podatke</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#12142D] mb-4">Profilna slika</h2>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {profileData?.user?.avatar ? (
              <img
                src={`http://localhost:8000/storage/${profileData.user.avatar}`}
                className="w-full h-full object-cover"
                alt="avatar"
              />
            ) : (
              <span className="text-3xl font-black text-gray-400">
                {form.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <label className="cursor-pointer bg-[#12142D] hover:bg-[#1B2B5A] text-white px-4 py-2 rounded-xl text-sm font-bold transition inline-block">
              {uploadAvatar.isPending ? "Uploading..." : "Promijeni sliku"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { if (e.target.files[0]) uploadAvatar.mutate(e.target.files[0]); }}
                disabled={uploadAvatar.isPending}
              />
            </label>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG ili WebP, max 2MB</p>
          </div>
        </div>
      </div>

      {/* Osnovni podaci */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#12142D] mb-4">Osnovni podaci</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">Ime i prezime</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
              placeholder="Ime i prezime"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">Telefon</label>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
              placeholder="+382 6X XXX XXX"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">Email</label>
            <input
              value={profileData?.user?.email ?? ""}
              disabled
              className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email adresa se ne može mijenjati</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">Grad</label>
            <select
              value={form.city_id}
              onChange={(e) => set("city_id", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white"
            >
              <option value="">Odaberi grad</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">Adresa</label>
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
              placeholder="Ulica i broj"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">O meni</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] resize-none"
              placeholder="Kratki opis..."
            />
          </div>
        </div>
      </div>

      {/* Dealer sekcija */}
      {isDealer && (
        <>
          {/* Logo firme */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#12142D] mb-1">Logo firme</h2>
            <p className="text-xs text-gray-400 mb-4">Prikazuje se na vašem profilu auto placea</p>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200">
                {profileData?.profile?.logo ? (
                  <img
                    src={`http://localhost:8000/storage/${profileData.profile.logo}`}
                    className="w-full h-full object-contain p-1"
                    alt="logo"
                  />
                ) : (
                  <span className="text-xs text-gray-400 text-center px-2">Nema loga</span>
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-[#12142D] hover:bg-[#1B2B5A] text-white px-4 py-2 rounded-xl text-sm font-bold transition inline-block">
                  {uploadLogo.isPending ? "Uploading..." : "Promijeni logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { if (e.target.files[0]) uploadLogo.mutate(e.target.files[0]); }}
                    disabled={uploadLogo.isPending}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG ili WebP, max 2MB</p>
              </div>
            </div>
          </div>

          {/* Podaci firme */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#12142D] mb-1">Podaci firme</h2>
            <p className="text-xs text-gray-400 mb-4">Vidljivo na vašem profilu auto placea</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">Naziv firme</label>
                <input
                  value={form.company_name}
                  onChange={(e) => set("company_name", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                  placeholder="Naziv auto placea"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">PIB</label>
                <input
                  value={form.pib}
                  onChange={(e) => set("pib", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                  placeholder="Poreski identifikacioni broj"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">Website</label>
                <input
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                  placeholder="https://vašafirma.me"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">Radno vrijeme</label>
                <input
                  value={form.working_hours}
                  onChange={(e) => set("working_hours", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                  placeholder="Pon-Pet: 08-18h, Sub: 09-15h"
                />
              </div>
            </div>
          </div>

          {/* Statistike oglasa */}
          
        </>
      )}

      {/* Sačuvaj */}
      <button
        onClick={() => updateProfile.mutate(form)}
        disabled={updateProfile.isPending}
        className="w-full bg-[#FF0026] hover:bg-red-700 text-white font-black py-3.5 rounded-xl transition disabled:opacity-50"
      >
        {updateProfile.isPending ? "Čuvanje..." : "Sačuvaj promjene"}
      </button>
    </div>
  );
}
