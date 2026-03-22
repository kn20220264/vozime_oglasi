import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdDetail() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeImg, setActiveImg] = useState(0);
  const [messageBody, setMessageBody] = useState("");
  const [showMessageForm, setShowMessageForm] = useState(false);

  const { data: ad, isLoading } = useQuery({
    queryKey: ["ad", slug],
    queryFn: () => api.get(`/ads/${slug}`).then((r) => r.data.data),
  });

  const favMutation = useMutation({
    mutationFn: () => api.post(`/favorites/${ad.id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["ad", slug]);
      toast.success(
        res.data.favorited ? "Dodano u omiljene" : "Uklonjeno iz omiljenih",
      );
    },
  });

  const messageMutation = useMutation({
    mutationFn: () =>
      api.post("/messages", {
        receiver_id: ad.seller.id,
        ad_id: ad.id,
        body: messageBody,
      }),
    onSuccess: () => {
      toast.success("Poruka poslana!");
      setMessageBody("");
      setShowMessageForm(false);
    },
  });

  const reportMutation = useMutation({
    mutationFn: (reason) => api.post("/reports", { ad_id: ad.id, reason }),
    onSuccess: () => toast.success("Oglas prijavljen"),
  });

  if (isLoading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
      </div>
    );

  if (!ad)
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl text-gray-400">Oglas nije pronadjen</p>
        <Link
          to="/ads"
          className="mt-4 inline-block text-[#FF0026] font-semibold"
        >
          Nazad na oglase
        </Link>
      </div>
    );

  const images = ad.images?.length
    ? ad.images
    : [{ url: "https://placehold.co/800x500/e5e7eb/9ca3af?text=Nema+slike" }];

  const getImageSrc = (img) => {
    if (!img?.url)
      return "https://placehold.co/800x500/e5e7eb/9ca3af?text=Nema+slike";
    if (img.url.startsWith("http")) return img.url;
    return `http://localhost:8000${img.url}`;
  };

  const specs = [
    { label: "Godiste", value: ad.year },
    {
      label: "Kilometraza",
      value: ad.mileage ? `${Number(ad.mileage).toLocaleString()} km` : null,
    },
    { label: "Gorivo", value: ad.fuel_type },
    { label: "Mjenjac", value: ad.transmission },
    { label: "Karoserija", value: ad.body_type },
    { label: "Snaga", value: ad.power_kw ? `${ad.power_kw} kW` : null },
    { label: "Kubikaza", value: ad.engine_cc ? `${ad.engine_cc} cc` : null },
    { label: "Pogon", value: ad.drive_type },
    { label: "Vrata", value: ad.doors },
    { label: "Sjedista", value: ad.seats },
    { label: "Boja (ext)", value: ad.color_exterior },
    { label: "Boja (int)", value: ad.color_interior },
    { label: "Stanje", value: ad.condition },
    { label: "Ostecenje", value: ad.damage },
    { label: "Emisija", value: ad.emission_class?.toUpperCase() },
    { label: "Vlasnici", value: ad.owners_count },
    { label: "Registrovan do", value: ad.registered_until },
    { label: "VIN", value: ad.vin },
  ].filter((s) => s.value != null && s.value !== "");

  const boolSpecs = [
    { label: "Servisna knjiga", show: ad.has_service_book },
    { label: "Garancija", show: ad.has_warranty },
    { label: "Prihvata zamjenu", show: ad.accepts_exchange },
    { label: "Uvoz", show: ad.import },
  ].filter((s) => s.show);

  const hasEquipment =
    ad.equipment &&
    typeof ad.equipment === "object" &&
    Object.keys(ad.equipment).length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
        <Link to="/" className="hover:text-[#FF0026]">
          Pocetna
        </Link>
        <span>/</span>
        <Link to="/ads" className="hover:text-[#FF0026]">
          Oglasi
        </Link>
        <span>/</span>
        <span className="text-gray-600 truncate">{ad.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="relative bg-gray-100 aspect-video">
              <img
                src={getImageSrc(images[activeImg])}
                alt={ad.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/800x500/e5e7eb/9ca3af?text=Nema+slike";
                }}
              />
              {ad.featured && (
                <span className="absolute top-4 left-4 bg-[#FF0026] text-white text-xs font-bold px-3 py-1 rounded-full">
                  ISTAKNUTO
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${activeImg === i ? "border-[#FF0026]" : "border-transparent"}`}
                  >
                    <img
                      src={getImageSrc(img)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/80x56/e5e7eb/9ca3af?text=x";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-black text-[#12142D]">
                  {ad.title}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {ad.city?.name} · {ad.views_count} pregleda · objavljeno{" "}
                  {ad.created_ago}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-[#FF0026]">
                  {Number(ad.price).toLocaleString()} EUR
                </p>
                {ad.price_negotiable && (
                  <p className="text-sm text-green-600 font-semibold">
                    po dogovoru
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#12142D] mb-4">
              Specifikacije
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specs.map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                  <p className="text-sm font-semibold text-[#12142D] capitalize">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
            {boolSpecs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {boolSpecs.map((s, i) => (
                  <span
                    key={i}
                    className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium"
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {hasEquipment && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#12142D] mb-4">Oprema</h2>
              {Object.entries(ad.equipment).map(([category, items]) =>
                Array.isArray(items) && items.length > 0 ? (
                  <div key={category} className="mb-4 last:mb-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item, i) => (
                        <span
                          key={i}
                          className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          )}

          {ad.description && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#12142D] mb-4">Opis</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {ad.description}
              </p>
            </div>
          )}

          {user && user.id !== ad.seller?.id && (
            <div className="text-right">
              <button
                onClick={() => reportMutation.mutate("lazno")}
                className="text-xs text-gray-400 hover:text-red-500 transition"
              >
                Prijavi oglas
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              Prodavac
            </h3>
            <Link
              to={`/users/${ad.seller?.id}`}
              className="flex items-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {ad.seller?.avatar ? (
                  <img
                    src={`http://localhost:8000/storage/${ad.seller.avatar}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-gray-400">
                    {ad.seller?.name?.[0]}
                  </span>
                )}
              </div>
              <div>
                <p className="font-bold text-[#12142D] group-hover:text-[#FF0026] transition">
                  {ad.seller?.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {ad.seller?.role}
                </p>
              </div>
            </Link>

            {ad.seller?.phone && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm font-semibold text-[#12142D]">
                  Tel: {ad.seller.phone}
                </p>
              </div>
            )}

            {ad.seller?.company && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                {ad.seller.company.address && (
                  <p className="text-xs text-gray-500">
                    Adresa: {ad.seller.company.address}
                  </p>
                )}
                {ad.seller.company.working_hours && (
                  <p className="text-xs text-gray-500">
                    Radno vrijeme: {ad.seller.company.working_hours}
                  </p>
                )}
                {ad.seller.company.website && (
                  <a
                    href={ad.seller.company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#FF0026] hover:underline"
                  >
                    Website
                  </a>
                )}
              </div>
            )}

            <div className="mt-4 space-y-2">
              {user ? (
                <>
                  <button
                    onClick={() => setShowMessageForm(!showMessageForm)}
                    className="w-full bg-[#FF0026] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition text-sm"
                  >
                    Posalji poruku
                  </button>
                  <button
                    onClick={() => favMutation.mutate()}
                    className={`w-full font-bold py-3 rounded-xl transition text-sm border-2 ${
                      ad.is_favorited
                        ? "border-[#FF0026] text-[#FF0026] bg-red-50"
                        : "border-gray-200 text-gray-600 hover:border-[#FF0026] hover:text-[#FF0026]"
                    }`}
                  >
                    {ad.is_favorited ? "U omiljenim" : "Dodaj u omiljene"}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block w-full bg-[#FF0026] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition text-sm text-center"
                >
                  Prijavi se za kontakt
                </Link>
              )}
            </div>

            {showMessageForm && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Zainteresovan/a sam za vase vozilo..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                  rows={4}
                />
                <button
                  onClick={() => messageMutation.mutate()}
                  disabled={!messageBody.trim()}
                  className="mt-2 w-full bg-[#12142D] hover:bg-gray-800 text-white font-bold py-2.5 rounded-xl transition text-sm disabled:opacity-50"
                >
                  Posalji
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Lokacija
            </h3>
            <p className="font-semibold text-[#12142D]">{ad.city?.name}</p>
            {ad.city?.region && (
              <p className="text-xs text-gray-400 mt-0.5">{ad.city.region}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              Vozilo
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Marka</span>
                <span className="font-semibold">{ad.make?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Model</span>
                <span className="font-semibold">{ad.model?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Kategorija</span>
                <span className="font-semibold">{ad.category?.name}</span>
              </div>
              {ad.seller?.member_since && (
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-400">Clan od</span>
                  <span className="font-semibold">
                    {ad.seller.member_since}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
