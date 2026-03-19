import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore'; 

export default function Login() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const setUser = useAuthStore((s) => s.setUser); // ← dodaj ovo
    const [form, setForm] = useState({ email: '', password: '' });

    const mutation = useMutation({
        mutationFn: () => axios.post('/login', form),
        onSuccess: (res) => {
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user); // ← dodaj ovo
            qc.invalidateQueries(['me']);
            toast.success(`Dobrodošli, ${res.data.user.name}!`);
            navigate('/dashboard');
        },
        onError: () => toast.error('Pogrešan email ili lozinka.')
    });

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-7">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="bg-[#FF0026] px-3 py-1 rounded-lg">
                            <span className="text-white font-black text-xl">VOZIME</span>
                        </div>
                        <span className="text-[#12142D] font-bold text-lg">OGLASI</span>
                    </Link>
                    <h1 className="text-xl font-black text-[#12142D]">Prijavite se</h1>
                    <p className="text-gray-400 text-sm mt-1">Dobrodošli nazad</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email adresa</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                            placeholder="vase@email.com"
                            className="form-input w-full"
                            onKeyDown={e => e.key === 'Enter' && mutation.mutate()}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Lozinka</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                            placeholder="Vaša lozinka"
                            className="form-input w-full"
                            onKeyDown={e => e.key === 'Enter' && mutation.mutate()}
                        />
                    </div>

                    <button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !form.email || !form.password}
                        className="w-full bg-[#FF0026] hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm mt-2"
                    >
                        {mutation.isPending ? 'Prijavljivanje...' : 'Prijavite se'}
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Nemate nalog?{' '}
                    <Link to="/register" className="text-[#FF0026] font-semibold hover:underline">
                        Registrujte se
                    </Link>
                </p>
            </div>
        </div>
    );
}