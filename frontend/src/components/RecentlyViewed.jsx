import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AdCard from './AdCard';

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);
  const [prevDisabled, setPrevDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    setItems(stored);
  }, []);

  const loop = items.length > 4;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop,
    align: 'start',
    slidesToScroll: 1,
  });

  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
    setPrevDisabled(!api.canScrollPrev());
    setNextDisabled(!api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('select', onSelect).on('reinit', onSelect);
  }, [emblaApi, onSelect]);

  if (items.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[#12142D]"
          style={{ fontFamily: "'Gomme Sans', sans-serif" }}>
          Nedavno pregledano
        </h2>
        <div className="flex items-center gap-3">
          {items.length > 1 && (
            <div className="flex gap-1.5">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!loop && prevDisabled}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition text-lg
                  ${(!loop && prevDisabled)
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 text-gray-400 hover:border-[#FF0026] hover:text-[#FF0026]'}`}
              >‹</button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                disabled={!loop && nextDisabled}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition text-lg
                  ${(!loop && nextDisabled)
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 text-gray-400 hover:border-[#FF0026] hover:text-[#FF0026]'}`}
              >›</button>
            </div>
          )}
          <button
            onClick={() => { localStorage.removeItem('recently_viewed'); setItems([]); }}
            className="text-xs text-gray-400 hover:text-[#FF0026] transition"
            style={{ fontFamily: "'Gomme Sans', sans-serif" }}
          >
            Obriši istoriju
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 overflow-hidden">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex items-stretch" style={{ marginLeft: '-16px' }}>
            {items.map(item => (
              <div key={item.id} className="flex-none pl-4 h-full" style={{ width: '25%' }}>
                <div className="h-full">
                  <AdCard ad={item} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indikatori */}
        {items.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-4">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`rounded-full transition-all duration-200
                  ${i === selectedIndex
                    ? 'w-5 h-1.5 bg-[#FF0026]'
                    : 'w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}