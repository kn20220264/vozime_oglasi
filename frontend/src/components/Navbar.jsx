import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const token = localStorage.getItem("token");
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => axios.get("/me").then((r) => r.data),
    retry: false,
    enabled: !!token,
  });

  const logout = useMutation({
    mutationFn: () => axios.post("/logout"),
    onSuccess: () => {
      localStorage.removeItem("token");
      qc.clear();
      navigate("/");
      toast.success("Odjavljeni ste.");
    },
  });

  return (
    <nav className="bg-brand-dark shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-brand-red px-3 py-1 rounded-lg">
              <span className="text-white font-black text-xl tracking-tight">
                VOZIME
              </span>
            </div>
            <span className="text-brand-yellow font-bold text-lg tracking-wide hidden sm:block">
              OGLASI
            </span>
          </Link>

          {/* Search bar — centralni */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Pretraži vozila..."
                className="w-full bg-brand-navy text-white placeholder-brand-slate rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-red hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition">
                Traži
              </button>
            </div>
          </div>

          {/* Desno */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-brand-slate hover:text-white text-sm font-medium transition hidden sm:block"
                >
                  Moj nalog
                </Link>
                <Link
                  to="/dashboard/ads/create"
                  className="bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition"
                >
                  + Oglas
                </Link>
                <button
                  onClick={() => logout.mutate()}
                  className="text-brand-slate hover:text-white text-sm transition"
                >
                  Odjava
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-brand-slate hover:text-white text-sm font-medium transition"
                >
                  Prijava
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-yellow hover:bg-yellow-400 text-brand-dark px-4 py-2 rounded-xl text-sm font-bold transition"
                >
                  Registracija
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
