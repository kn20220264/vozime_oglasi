import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function Register() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await api.post('/register', data);
            login(res.data.user, res.data.token);
            toast.success('Registracija uspješna!');
            navigate('/');
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors).flat().forEach(e => toast.error(e));
            } else {
                toast.error('Greška pri registraciji.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-800">Registracija</h1>
                    <p className="text-gray-500 mt-1">Kreirajte besplatan nalog</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Ime i prezime</label>
                        <input
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Marko Nikolić"
                            {...register('name', { required: 'Ime je obavezno' })}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="vas@email.com"
                            {...register('email', { required: 'Email je obavezan' })}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon</label>
                        <input
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+382 67 123 456"
                            {...register('phone')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tip naloga</label>
                        <select
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            {...register('role')}
                        >
                            <option value="user">Privatno lice</option>
                            <option value="dealer">Auto salon / Diler</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Lozinka</label>
                        <input
                            type="password"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Minimum 8 karaktera"
                            {...register('password', { required: 'Lozinka je obavezna', minLength: { value: 8, message: 'Minimum 8 karaktera' } })}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Potvrdi lozinku</label>
                        <input
                            type="password"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ponovite lozinku"
                            {...register('password_confirmation', {
                                required: 'Potvrda lozinke je obavezna',
                                validate: val => val === watch('password') || 'Lozinke se ne podudaraju',
                            })}
                        />
                        {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition text-lg mt-2"
                    >
                        {loading ? 'Registrovanje...' : 'Kreiraj nalog'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Već imate nalog?{' '}
                    <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                        Prijavite se
                    </Link>
                </p>
            </div>
        </div>
    );
}