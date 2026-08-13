import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const checks = {
    length:  form.password.length >= 8,
    letter:  /[a-zA-Z]/.test(form.password),
    special: /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password),
  };
  const passwordValid = checks.length && checks.letter && checks.special;

  const mutation = useMutation({
    mutationFn: () => axios.post("/register", {
      first_name:            form.first_name,
      last_name:             form.last_name,
      email:                 form.email,
      password:              form.password,
      password_confirmation: form.password_confirmation,
    }),
    onSuccess: () => {
      setRegistered(true);
      setRegisteredEmail(form.email);
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((e) => toast.error(e));
      } else {
        toast.error(err.response?.data?.message || "Greška pri registraciji.");
      }
    },
  });

  const handleSubmit = () => {
    if (!form.first_name.trim()) return toast.error("Unesite ime.");
    if (!form.last_name.trim()) return toast.error("Unesite prezime.");
    if (!form.email.trim()) return toast.error("Unesite email adresu.");
    if (!passwordValid) return toast.error("Lozinka ne zadovoljava uslove.");
    if (form.password !== form.password_confirmation) return toast.error("Lozinke se ne podudaraju.");
    if (!form.terms) return toast.error("Morate prihvatiti uslove korišćenja.");
    mutation.mutate();
  };

  const handleGoogleRegister = () => {
    window.location.href = "http://localhost:8000/api/auth/google";
  };

  // ── Ekran nakon uspješne registracije ────────────────────
  if (registered) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
        
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="text-xl font-black text-[#12142D] mb-2">Provjerite email inbox</h2>
            <p className="text-gray-500 text-sm mb-4">Poslali smo verifikacioni link na:</p>
            <p className="font-bold text-[#12142D] mb-6">{registeredEmail}</p>
            <p className="text-gray-500 text-xs mb-6">
              Kliknite na link u emailu da aktivirate nalog. Nakon toga možete se prijaviti.
            </p>
            <Link
              to="/login"
              className="block w-full bg-[#FF0026] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition text-sm"
            >
              Idi na prijavu
            </Link>
            <p className="text-xs text-gray-400 mt-4">
              Niste dobili email?{" "}
              <button
                onClick={() => axios.post("/email/resend", { email: registeredEmail })
                  .then(() => toast.success("Novi link poslan!"))
                  .catch(() => toast.error("Greška."))}
                className="text-[#FF0026] hover:underline font-semibold"
              >
                Pošalji ponovo
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      

      <div className="flex-1 flex items-start justify-center pt-10 px-4 pb-10">
        <div className="flex gap-12 w-full max-w-3xl">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-[460px] overflow-hidden">

            {/* Tabovi */}
            <div className="flex border-b border-gray-200">
              <Link
                to="/login"
                className="flex-1 py-4 text-sm font-semibold text-gray-500 hover:text-gray-700 text-center bg-gray-50 transition"
              >
                Prijava
              </Link>
              <button className="flex-1 py-4 text-sm font-bold text-[#FF0026] border-b-2 border-[#FF0026] bg-white transition">
                Registracija
              </button>
            </div>

            <div className="p-7">
              <h1 className="text-xl font-black text-[#12142D] mb-6">Kreirajte nalog!</h1>

              {/* Google dugme — aktivno */}
              <div className="mb-5">
                <button
                  onClick={handleGoogleRegister}
                  className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition cursor-pointer"
                >
                  <GoogleIcon />
                  Registrujte se putem Google-a
                </button>
              </div>

              {/* Separator */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">ili</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ime</label>
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={(e) => set("first_name", e.target.value)}
                      placeholder="Marko"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prezime</label>
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={(e) => set("last_name", e.target.value)}
                      placeholder="Nikolić"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email adresa</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="vase@email.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lozinka</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="Minimum 8 karaktera"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <PasswordCheck ok={checks.length} label="Najmanje 8 karaktera" />
                      <PasswordCheck ok={checks.letter} label="Sadrži slova" />
                      <PasswordCheck ok={checks.special} label="Sadrži broj ili specijalni karakter" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Potvrdi lozinku</label>
                  <input
                    type="password"
                    value={form.password_confirmation}
                    onChange={(e) => set("password_confirmation", e.target.value)}
                    placeholder="Ponovite lozinku"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] focus:border-transparent transition"
                  />
                  {form.password_confirmation.length > 0 && form.password !== form.password_confirmation && (
                    <p className="text-red-500 text-xs mt-1">Lozinke se ne podudaraju</p>
                  )}
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => set("terms", e.target.checked)}
                    className="mt-0.5 accent-[#FF0026] w-4 h-4 flex-shrink-0"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    Prihvatam{" "}
                    <Link to="/uslovi" className="text-[#FF0026] hover:underline font-semibold">Uslove korišćenja</Link>
                    {" "}i{" "}
                    <Link to="/privatnost" className="text-[#FF0026] hover:underline font-semibold">Politiku privatnosti</Link>
                    {" "}VozimeOglasi platforme.
                  </span>
                </label>

                <button
                  onClick={handleSubmit}
                  disabled={mutation.isPending}
                  className="w-full bg-[#FF0026] hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm mt-1"
                >
                  {mutation.isPending ? "Registrovanje..." : "Kreiraj nalog"}
                </button>
              </div>
            </div>
          </div>

          {/* Desno — prednosti */}
          <div className="hidden md:flex flex-col justify-center pt-4">
            <h2 className="text-xl font-black text-[#12142D] mb-5 leading-snug">
              Prednosti VozimeOglasi<br />naloga
            </h2>
            <ul className="space-y-3">
              {[
                "Sačuvajte omiljene oglase i pronađite ih uvijek",
                "Sačuvajte pretrage i budite prvi obaviješteni",
                "Postavljajte oglase brzo i jednostavno",
                "Pratite status vaših oglasa",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5 flex-shrink-0"><CheckIcon /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center pb-8 text-sm text-gray-500">
        Jeste li diler / auto plac?{" "}
        <Link to="/register/dealer" className="text-[#FF0026] font-semibold hover:underline">
          Registrujte se kao diler
        </Link>
      </div>
    </div>
  );
}

function PasswordCheck({ ok, label }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${ok ? "text-green-600" : "text-gray-400"}`}>
      <span>{ok ? "✓" : "○"}</span>
      <span>{label}</span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}