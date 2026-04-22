import { Link } from 'react-router-dom';

export default function AdCard({ ad }) {
    const img = ad.primary_image
        ? `http://localhost:8000${ad.primary_image}`
        : 'https://placehold.co/600x400/e5e7eb/9ca3af?text=Nema+slike';

    return (
        <Link to={`/ads/${ad.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
            
            {/* Slika */}
            <div className="relative overflow-hidden h-48 bg-gray-100">
                <img
                    src={img}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = 'https://placehold.co/600x400/e5e7eb/9ca3af?text=Nema+slike'; }}
                />
                {ad.featured && (
                    <span className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-lg">
                        ISTAKNUTO
                    </span>
                )}
            </div>

            {/* Sadržaj */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-[#12142D] text-sm leading-tight line-clamp-2 group-hover:text-[#FF0026] transition-colors">
                    {ad.title}
                </h3>

                {/* Specs */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                        ad.year,
                        ad.mileage ? `${Number(ad.mileage).toLocaleString()} km` : null,
                        ad.fuel_type,
                        ad.transmission,
                    ].filter(Boolean).map((spec, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md capitalize">
                            {spec}
                        </span>
                    ))}
                </div>

                {/* Cijena i info */}
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100 mt-3">
                    <div>
                        <p className="text-xl font-black text-[#FF0026]">
                            {Number(ad.price).toLocaleString()} €
                        </p>
                        {ad.price_negotiable && (
                            <p className="text-xs text-green-600 font-medium">po dogovoru</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-medium">{ad.city?.name}</p>
                        <p className="text-xs text-gray-400">{ad.views_count} pregleda</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}