import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import toast from 'react-hot-toast';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

export default function AdDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [message, setMessage] = useState('');

    const { data: ad, isLoading, error } = useQuery({
        queryKey: ['ad', slug],
        queryFn: () => axios.get(`/ads/${slug}`).then(r => r.data)
    });

    const favMutation = useMutation({
        mutationFn: () => axios.post(`/ads/${ad.id}/favorite`),
        onSuccess: (data) => {
            toast.success(data.data.favorited ? 'Dodano u favorite!' : 'Uklonjeno iz favorita');
            queryClient.invalidateQueries(['ad', slug]);
        },
        onError: () => toast.error('Prijavite se za favorite')
    });

    const msgMutation = useMutation({
        mutationFn: () => axios.post('/messages', {
            ad_id: ad.id,
            receiver_id: ad.user_id,
            body: message
        }),
        onSuccess: () => {
            toast.success('Poruka poslana!');
            setMessage('');
        },
        onError: () => toast.error('Prijavite se da pošaljete poruku')
    });

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
    );

    if (error || !ad) return (
        <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Oglas nije pronađen.</p>
            <Link to="/" className="text-blue-600 mt-4 inline-block hover:underline">← Nazad</Link>
        </div>
    );

    const images = ad.images?.length ? ad.images : [{ path: '/placeholder-car.jpg' }];
    const city = ad.city;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Link to="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">← Nazad na pretragu</Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lijeva kolona */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Galerija */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow">
                        <Swiper
                            modules={[Navigation, Thumbs]}
                            navigation
                            thumbs={{ swiper: thumbsSwiper }}
                            className="h-80 md:h-96"
                        >
                            {images.map((img, i) => (
                                <SwiperSlide key={i}>
                                    <img
                                        src={img.path?.startsWith('http') ? img.path : `http://localhost:8000/storage/${img.path}`}
                                        className="w-full h-full object-cover"
                                        alt={ad.title}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        {images.length > 1 && (
                            <Swiper
                                modules={[Thumbs]}
                                onSwiper={setThumbsSwiper}
                                slidesPerView={5}
                                spaceBetween={4}
                                className="h-20 p-2"
                            >
                                {images.map((img, i) => (
                                    <SwiperSlide key={i} className="cursor-pointer opacity-60 hover:opacity-100 transition">
                                        <img
                                            src={img.path?.startsWith('http') ? img.path : `http://localhost:8000/storage/${img.path}`}
                                            className="w-full h-full object-cover rounded"
                                            alt=""
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </div>

                    {/* Naslov i cijena */}
                    <div className="bg-white rounded-2xl p-6 shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{ad.title}</h1>
                                <p className="text-gray-500 text-sm mt-1">{ad.year} · {ad.mileage?.toLocaleString()} km · {ad.city?.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-blue-600">{ad.price?.toLocaleString()} €</p>
                                {ad.price_negotiable && <span className="text-xs text-green-600 font-medium">Cijena po dogovoru</span>}
                            </div>
                        </div>
                        <button
                            onClick={() => favMutation.mutate()}
                            className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition
                                ${ad.is_favorited ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500'}`}
                        >
                            {ad.is_favorited ? '❤️ U favoritima' : '🤍 Dodaj u favorite'}
                        </button>
                    </div>

                    {/* Tehničke specifikacije */}
                    <div className="bg-white rounded-2xl p-6 shadow">
                        <h2 className="text-lg font-bold mb-4">Tehničke specifikacije</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                ['Marka', ad.make?.name],
                                ['Model', ad.vehicle_model?.name],
                                ['Godina', ad.year],
                                ['Kilometraža', `${ad.mileage?.toLocaleString()} km`],
                                ['Gorivo', ad.fuel_type],
                                ['Mjenjač', ad.transmission],
                                ['Karoserija', ad.body_type],
                                ['Snaga', ad.power_kw ? `${ad.power_kw} kW` : '-'],
                                ['Zapremina motora', ad.engine_cc ? `${ad.engine_cc} ccm` : '-'],
                                ['Pogon', ad.drive_type],
                                ['Boja (ext.)', ad.color_exterior],
                                ['Vrata', ad.doors],
                                ['Broj sjedišta', ad.seats],
                                ['Stanje', ad.condition],
                                ['Oštećenje', ad.damage],
                                ['Euro norma', ad.emission_class],
                                ['Broj vlasnika', ad.owners_count],
                                ['Registrovan do', ad.registered_until],
                                ['Servisna knjiga', ad.has_service_book ? '✅ Da' : '❌ Ne'],
                                ['Garancija', ad.has_warranty ? '✅ Da' : '❌ Ne'],
                                ['Zamjena', ad.accepts_exchange ? '✅ Da' : '❌ Ne'],
                            ].map(([label, val]) => val && (
                                <div key={label} className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-500">{label}</p>
                                    <p className="font-semibold text-gray-800 capitalize">{val}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Oprema */}
                    {ad.equipment?.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow">
                            <h2 className="text-lg font-bold mb-4">Oprema</h2>
                            <div className="flex flex-wrap gap-2">
                                {ad.equipment.map(eq => (
                                    <span key={eq.id} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">{eq.name}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Opis */}
                    {ad.description && (
                        <div className="bg-white rounded-2xl p-6 shadow">
                            <h2 className="text-lg font-bold mb-3">Opis</h2>
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{ad.description}</p>
                        </div>
                    )}

                    {/* Mapa */}
                    {city?.latitude && (
                        <div className="bg-white rounded-2xl p-6 shadow">
                            <h2 className="text-lg font-bold mb-4">Lokacija — {city.name}</h2>
                            <MapContainer
                                center={[city.latitude, city.longitude]}
                                zoom={13}
                                style={{ height: '250px', borderRadius: '12px' }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[city.latitude, city.longitude]}>
                                    <Popup>{ad.title}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    )}
                </div>

                {/* Desna kolona — prodavac + kontakt */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow sticky top-4">
                        <h2 className="font-bold text-lg mb-4">Prodavac</h2>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                {ad.user?.name?.[0]}
                            </div>
                            <div>
                                <p className="font-semibold">{ad.user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{ad.user?.role}</p>
                            </div>
                        </div>

                        {ad.user?.phone && (
                            <a href={`tel:${ad.user.phone}`}
                               className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-3 rounded-xl font-bold mb-3 transition">
                                📞 {ad.user.phone}
                            </a>
                        )}

                        <div className="border-t pt-4 mt-2">
                            <p className="text-sm font-semibold mb-2">Pošaljite poruku</p>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Zdravo, zanima me ovo vozilo..."
                                rows={4}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                            <button
                                onClick={() => msgMutation.mutate()}
                                disabled={!message.trim() || msgMutation.isPending}
                                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition"
                            >
                                {msgMutation.isPending ? 'Slanje...' : 'Pošalji poruku'}
                            </button>
                        </div>

                        <div className="mt-4 text-xs text-gray-400 text-center space-y-1">
                            <p>👁 {ad.views_count} pregleda</p>
                            <p>📅 Objavljeno: {new Date(ad.created_at).toLocaleDateString('sr-ME')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}