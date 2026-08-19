import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resendEmail, setResendEmail] = useState("");

  // Provjeri greške koje dolaze iz Google OAuth redirecta
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "google_failed")
      toast.error("Google prijava nije uspjela. Pokušajte ponovo.");
    if (error === "account_disabled") toast.error("Vaš nalog je deaktiviran.");
  }, []);

  const mutation = useMutation({
    mutationFn: () => axios.post("/login", form),
    onSuccess: (res) => {
      login(res.data.user, res.data.token);
      qc.invalidateQueries(["me"]);
      toast.success(`Dobrodošli, ${res.data.user.name}!`);
      const role = res.data.user.role;
      if (role === "admin") navigate("/admin");
      else if (role === "moderator") navigate("/moderator");
      else navigate("/dashboard");
    },
    onError: (err) => {
      if (err.response?.data?.email_unverified) {
        setUnverified(true);
        setResendEmail(form.email);
      } else {
        toast.error(
          err.response?.data?.message || "Pogrešan email ili lozinka.",
        );
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => axios.post("/email/resend", { email: resendEmail }),
    onSuccess: () => toast.success("Verifikacioni email je poslan!"),
    onError: () => toast.error("Greška pri slanju emaila."),
  });

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      

      <div className="flex-1 flex items-start justify-center pt-10 px-4 pb-10">
        <div className="flex gap-12 w-full max-w-3xl">
          {/* Lijevo — kartica */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-[460px] overflow-hidden">
            {/* Tabovi */}
            <div className="flex border-b border-gray-200">
              <button className="flex-1 py-4 text-sm font-bold text-[#FF0026] border-b-2 border-[#FF0026] bg-white transition">
                Prijava
              </button>
              <Link
                to="/register"
                className="flex-1 py-4 text-sm font-semibold text-gray-500 hover:text-gray-700 text-center bg-gray-50 transition"
              >
                Registracija
              </Link>
            </div>

            <div className="p-7">
              <h1 className="text-xl font-black text-[#12142D] mb-6">
                Dobrodošli nazad!
              </h1>

              {/* Google dugme — aktivno */}
              <div className="space-y-3 mb-5">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition cursor-pointer"
                >
                  <GoogleIcon />
                  Prijavi se putem Google-a
                </button>
              </div>

              {/* Separator */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">ili</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Poruka o neverifikovanom emailu */}
              {unverified && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  <p className="font-semibold mb-1">Email nije verifikovan</p>
                  <p className="mb-3">
                    Provjerite inbox za <strong>{resendEmail}</strong> i
                    kliknite na link za verifikaciju.
                  </p>
                  <button
                    onClick={() => resendMutation.mutate()}
                    disabled={resendMutation.isPending}
                    className="text-[#FF0026] font-semibold hover:underline text-xs"
                  >
                    {resendMutation.isPending
                      ? "Šaljemo..."
                      : "Pošalji novi verifikacioni email →"}
                  </button>
                </div>
              )}

              {/* Forma */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email adresa
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="vase@email.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] focus:border-transparent transition"
                    onKeyDown={(e) => e.key === "Enter" && mutation.mutate()}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Lozinka
                    </label>
                    <span
                      className="text-xs text-gray-400 cursor-not-allowed"
                      title="Uskoro dostupno"
                    >
                      Zaboravili ste lozinku?
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      placeholder="Vaša lozinka"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] focus:border-transparent transition"
                      onKeyDown={(e) => e.key === "Enter" && mutation.mutate()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending || !form.email || !form.password}
                  className="w-full bg-[#FF0026] hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm mt-1"
                >
                  {mutation.isPending ? "Prijavljivanje..." : "Prijavi se"}
                </button>
              </div>
            </div>
          </div>

          {/* Desno — prednosti */}
          <div className="hidden md:flex flex-col justify-center pt-4">
            <h2 className="text-xl font-black text-[#12142D] mb-5 leading-snug">
              Prednosti VozimeOglasi
              <br />
              naloga
            </h2>
            <ul className="space-y-3">
              {[
                "Sačuvajte omiljene oglase i pronađite ih uvijek",
                "Sačuvajte pretrage i budite prvi obaviješteni",
                "Postavljajte oglase brzo i jednostavno",
                "Pratite status vaših oglasa",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-gray-700"
                >
                  <span className="text-green-500 mt-0.5 flex-shrink-0">
                    <CheckIcon />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer — dealer link */}
      <div className="text-center pb-8 text-sm text-gray-500">
        Jeste li diler?{" "}
        <Link
          to="/register/dealer"
          className="text-[#FF0026] font-semibold hover:underline"
        >
          Prijavite se kao diler
        </Link>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
