import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const PLACEHOLDERS = [
  'Mali gradski auto, ne troši mnogo, do 8.000€...',
  'BMW X5 dizel, ne stariji od 2019, do 30.000€...',
  'Familijski karavan, automatik, do 15.000€...',
  'Električni auto do 25.000€...',
  'Honda motocikl, do 5.000€...',
];

export default function AISearchBar({ hideMeta = false }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const typingRef = useRef(null);

  useEffect(() => {
    const target = PLACEHOLDERS[placeholderIndex];
    let i = 0;
    setDisplayedPlaceholder('');

    const typeInterval = setInterval(() => {
      if (i < target.length) {
        setDisplayedPlaceholder(target.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        typingRef.current = setTimeout(() => {
          let j = target.length;
          const deleteInterval = setInterval(() => {
            if (j > 0) {
              setDisplayedPlaceholder(target.slice(0, j - 1));
              j--;
            } else {
              clearInterval(deleteInterval);
              setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDERS.length);
            }
          }, 18);
        }, 2200);
      }
    }, 38);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(typingRef.current);
    };
  }, [placeholderIndex]);

  const handleSearch = async () => {
    if (!query.trim() || query.trim().length < 3) {
      setError('Upiši najmanje 3 karaktera.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/ai-search', { query: query.trim() });
      const { filters, fallback } = res.data;

      if (fallback || !filters || Object.keys(filters).length === 0) {
        navigate('/search');
        return;
      }

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.set(key, value);
        }
      });

      navigate(`/search?${params.toString()}`);
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Previše zahtjeva. Pokušaj ponovo za nekoliko sekundi.');
      } else {
        navigate('/search');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{ width: '100%' }}>

      {/* Input wrapper */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'white',
        border: '2px solid',
        borderColor: error ? '#FF0026' : '#E5E7EB',
        borderRadius: 14,
        padding: '4px 4px 4px 16px',
        gap: 8,
        transition: 'border-color .2s, box-shadow .2s',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder={displayedPlaceholder || 'Opiši vozilo koje tražiš...'}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontFamily: "'Gomme Sans', sans-serif",
            fontSize: '15px',
            color: '#12142D',
            background: 'transparent',
            padding: '10px 0',
          }}
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            background: loading ? '#6674A3' : '#FF0026',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            transition: 'background .2s',
          }}
        >
          {loading ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p style={{
          fontFamily: "'Gomme Sans', sans-serif",
          fontSize: '12px',
          color: '#FF0026',
          marginTop: 6,
          marginLeft: 4,
        }}>
          {error}
        </p>
      )}

      {!hideMeta && !error && (
        <p style={{
          fontFamily: "'Gomme Sans', sans-serif",
          fontSize: '11px',
          color: '#9CA3AF',
          marginTop: 6,
          marginLeft: 4,
        }}>
          Npr. "dizel SUV do 20.000€, ne stariji od 2018, max 100.000 km"
        </p>
      )}
    </div>
  );
}