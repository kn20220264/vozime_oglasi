import { useState, useEffect, useRef } from 'react';
import AdCard from './AdCard';

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    setItems(stored);
  }, []);

  if (items.length === 0) return null;

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[#12142D]"
          style={{ fontFamily: "'Gomme Sans', sans-serif" }}>
          Nedavno pregledano
        </h2>
        <div className="flex items-center gap-3">
          {items.length > 4 && (
            <div className="flex gap-1">
              <button onClick={() => scroll(-1)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#FF0026] hover:text-[#FF0026] transition">
                ‹
              </button>
              <button onClick={() => scroll(1)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#FF0026] hover:text-[#FF0026] transition">
                ›
              </button>
            </div>
          )}
          <button
            onClick={() => { localStorage.removeItem('recently_viewed'); setItems([]); }}
            className="text-xs text-gray-400 hover:text-[#FF0026] transition"
            style={{ fontFamily: "'Gomme Sans', sans-serif" }}
          >
            Obriši istoriju vozila
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 relative">
        {/* Fade lijevo */}
        <div className="absolute left-6 top-6 bottom-6 w-8 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, white, transparent)' }} />
        {/* Fade desno */}
        <div className="absolute right-6 top-6 bottom-6 w-8 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, white, transparent)' }} />

        <div
          ref={scrollRef}
          className="grid grid-flow-col auto-cols-[calc(25%-12px)] gap-4 overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map(item => (
            <AdCard key={item.id} ad={item} />
          ))}
        </div>
      </div>
    </div>
  );
}