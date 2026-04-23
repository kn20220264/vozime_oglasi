import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

function VehicleImage({ hue = 220, shade = 22 }) {
  const bg     = `oklch(${shade}% 0.07 ${hue})`;
  const accent = `oklch(${Math.min(shade + 18, 72)}% 0.11 ${hue})`;
  const shadow = `oklch(${Math.max(shade - 10, 6)}% 0.05 ${hue})`;
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '16/9',
      background: `linear-gradient(160deg, ${bg} 0%, ${shadow} 100%)`,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(45deg, transparent 0 18px, ${accent}22 18px 19px)`,
      }} />
      <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', padding: '10%' }}>
        <path d="M20 95 Q25 75 45 72 L70 55 Q85 48 110 48 L145 50 Q165 55 178 72 L188 80 Q195 85 192 95 L20 95 Z"
          fill={accent} opacity="0.55"/>
        <rect x="30" y="92" width="150" height="5" rx="2" fill={shadow}/>
        <circle cx="55" cy="100" r="12" fill={shadow}/>
        <circle cx="55" cy="100" r="6" fill={accent} opacity="0.4"/>
        <circle cx="160" cy="100" r="12" fill={shadow}/>
        <circle cx="160" cy="100" r="6" fill={accent} opacity="0.4"/>
        <path d="M75 72 L108 55 L140 58 L158 72 Z" fill={bg} opacity="0.4"/>
      </svg>
      <span style={{
        position: 'absolute', bottom: 8, right: 10,
        fontSize: 8, letterSpacing: '0.15em', fontWeight: 700,
        color: 'rgba(255,255,255,0.28)',
      }}>VO · FOTO</span>
    </div>
  );
}

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const GaugeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 14 17 9"/><path d="M6.4 20a10 10 0 1 1 11.2 0"/>
  </svg>
);
const FuelIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 22h12V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M15 8h3a2 2 0 0 1 2 2v7a2 2 0 0 0 4 0v-9l-3-3"/>
  </svg>
);
const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

function hueFromTitle(title = '') {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) % 360;
  return h;
}

export default function AdCard({ ad, queryKey }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [favorited, setFavorited] = useState(ad.is_favorited ?? false);
  const [imgError, setImgError] = useState(false);

  const hue    = hueFromTitle(ad.title);
  const imgSrc = ad.primary_image ? `http://localhost:8000${ad.primary_image}` : null;
  const showImg = imgSrc && !imgError;

  const favMutation = useMutation({
    mutationFn: () => api.post(`/favorites/${ad.id}`),
    onMutate:   () => setFavorited(f => !f),
    onSuccess:  (res) => {
      if (queryKey) queryClient.invalidateQueries(queryKey);
      toast.success(res.data.favorited ? 'Dodano u omiljene' : 'Uklonjeno iz omiljenih');
    },
    onError: () => {
      setFavorited(f => !f);
      toast.error('Prijavite se da biste sačuvali oglas');
    },
  });

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Prijavite se da biste sačuvali oglas'); return; }
    favMutation.mutate();
  };

  return (
    <Link
      to={`/ads/${ad.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
      {/* Medija */}
      <div className="relative overflow-hidden rounded-t-2xl">
        {showImg ? (
          <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
            <img
              src={imgSrc}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <VehicleImage hue={hue} shade={22} />
        )}

        {ad.featured && (
          <span className="absolute top-3 left-3 bg-[#FFEA00] text-[#12142D] text-xs font-black px-2.5 py-1 rounded-lg tracking-wide shadow">
            ISTAKNUTO
          </span>
        )}

        <button
          onClick={handleFav}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200
            ${favorited ? 'bg-[#FF0026] text-white' : 'bg-white/90 text-gray-400 hover:bg-white hover:text-[#FF0026]'}`}
          aria-label="Dodaj u omiljene"
        >
          {favorited ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.7 1-1a5.5 5.5 0 0 0 0-7.7z"/>
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.7 1-1a5.5 5.5 0 0 0 0-7.7z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-3">

        {/* Naslov */}
        <h3 className="font-bold text-[#12142D] text-base leading-snug line-clamp-2 group-hover:text-[#FF0026] transition-colors">
          {ad.title}
        </h3>

        {/* Cijena */}
        <p className="text-xl font-black text-[#FF0026]">
          {Number(ad.price).toLocaleString()} €
          {ad.price_negotiable && (
            <span className="text-xs text-green-600 font-medium ml-2">po dogovoru</span>
          )}
        </p>

        {/* Specifikacije */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {ad.year && (
            <span className="flex items-center gap-1.5">
              <CalendarIcon /> {ad.year}
            </span>
          )}
          {ad.mileage != null && (
            <span className="flex items-center gap-1.5">
              <GaugeIcon /> {Number(ad.mileage).toLocaleString()} km
            </span>
          )}
          {ad.fuel_type && (
            <span className="flex items-center gap-1.5">
              <FuelIcon /> {ad.fuel_type}
            </span>
          )}
        </div>

        {/* Grad — odvojen separatorom */}
        {ad.city?.name && (
          <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
            <PinIcon /> {ad.city.name}
          </div>
        )}

      </div>
    </Link>
  );
}