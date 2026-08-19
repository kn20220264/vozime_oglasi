import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="text-8xl font-black text-red-600 mb-4">404</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Stranica nije pronađena</h1>
            <p className="text-gray-500 mb-8">Stranica koju tražite ne postoji.</p>
            <button
                onClick={() => navigate('/')}
                className="bg-gray-900 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-bold transition"
            >
                Nazad na početnu
            </button>
        </div>
    );
}