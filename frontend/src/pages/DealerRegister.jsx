import { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "../api/axios";
import toast from "react-hot-toast";


const STEPS = ["Auto Plac", "Obračun", "Kontakt & Nalog", "Paket"];

const EMPTY_FORM = {
  // Korak 1 — auto plac
  company_name: "",
  address: "",
  city_id: "",
  phone: "",
  phone2: "",
  is_brand_representative: false,
  brands_represented: [],
  dealer_categories: [],

  // Korak 2 — obračun
  billing_type: "company",
  billing_company_name: "",
  billing_account_number: "",
  billing_pib: "",
  billing_vat_number: "",
  billing_company_address: "",
  billing_company_city: "",
  billing_company_phone: "",
  billing_company_email: "",
  billing_invoice_email: "",
  billing_personal_name: "",
  billing_personal_surname: "",
  billing_jmbg: "",
  billing_personal_address: "",
  billing_personal_city: "",
  payment_method: "virman",

  // Korak 3 — kontakt + nalog
  contact_name: "",
  contact_surname: "",
  contact_phone: "",
  contact_whatsapp: false,
  contact_viber: false,
  contact_email: "",
  password: "",
  password_confirmation: "",

  // Korak 4 — paket
  package_id: "",
};

export default function DealerRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPw, setShowPw] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: () => axios.get("/cities").then((r) => r.data.data ?? r.data),
  });

  const { data: makesData } = useQuery({
    queryKey: ["makes"],
    queryFn: () => axios.get("/makes").then((r) => r.data.data ?? r.data),
  });

  const { data: packagesData } = useQuery({
    queryKey: ["dealer-packages"],
    queryFn: () => axios.get("/dealer-packages").then((r) => r.data),
  });

  const cities = citiesData?.data ?? citiesData ?? [];
  const makes = makesData?.data ?? makesData ?? [];
  const packages = packagesData?.data ?? [];

  const freeTrial = packages.find((p) => p.name === "Free Trial");
  const paidPackages = packages.filter((p) => p.name !== "Free Trial");

  useEffect(() => {
    if (freeTrial && !form.package_id) {
      set("package_id", freeTrial.id);
    }
  }, [freeTrial?.id]);

  const mutation = useMutation({
    mutationFn: () =>
      axios.post("/register/dealer", {
        ...form,
        brands_represented: form.is_brand_representative
          ? form.brands_represented
          : [],
      }),
    onSuccess: (res) => {
      setRegistrationResult(res.data);
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors)
          .flat()
          .forEach((e) => toast.error(e));
      } else {
        toast.error(err.response?.data?.message || "Greška pri registraciji.");
      }
    },
  });

  // ── Validacija po koracima ──────────────────────────────────────────────

  const validateStep = (s) => {
    if (s === 0) {
      if (!form.company_name.trim()) return "Unesite naziv auto placa.";
      if (!form.address.trim()) return "Unesite adresu.";
      if (!form.city_id) return "Izaberite grad.";
      if (!form.phone.trim()) return "Unesite broj telefona.";
    }
    if (s === 1) {
      if (form.billing_type === "company") {
        if (!form.billing_company_name.trim()) return "Unesite naziv firme.";
        if (!form.billing_account_number.trim()) return "Unesite broj računa.";
        if (!form.billing_pib.trim()) return "Unesite PIB.";
        if (!form.billing_company_address.trim())
          return "Unesite adresu firme.";
      } else {
        if (!form.billing_personal_name.trim()) return "Unesite ime.";
        if (!form.billing_personal_surname.trim()) return "Unesite prezime.";
        if (!form.billing_jmbg.trim()) return "Unesite JMBG.";
        if (!form.billing_personal_address.trim()) return "Unesite adresu.";
      }
    }
    if (s === 2) {
      if (!form.contact_name.trim()) return "Unesite ime kontakt lica.";
      if (!form.contact_surname.trim()) return "Unesite prezime kontakt lica.";
      if (!form.contact_phone.trim()) return "Unesite telefon kontakt lica.";
      if (!form.contact_email.trim()) return "Unesite email adresu.";
      if (!/\S+@\S+\.\S+/.test(form.contact_email))
        return "Nevažeća email adresa.";
      if (form.password.length < 8)
        return "Lozinka mora imati najmanje 8 karaktera.";
      if (form.password !== form.password_confirmation)
        return "Lozinke se ne podudaraju.";
    }
    
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) return toast.error(err);
    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  };

  const back = () => {
    setStep((s) => s - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = () => {
   // const err = validateStep(3);
   // if (err) return toast.error(err);
    mutation.mutate();
  };

  const toggleBrand = (id) => {
    set(
      "brands_represented",
      form.brands_represented.includes(id)
        ? form.brands_represented.filter((b) => b !== id)
        : [...form.brands_represented, id],
    );
  };

  // ── Ekran nakon uspješne registracije ──────────────────────────────────
  if (registrationResult) {
    // Free Trial — bez uplatnice
    if (registrationResult.is_free) {
      return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
          <DealerRegisterHeader />
          <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 w-full max-w-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-[#12142D] mb-2">
                Registracija uspješna!
              </h2>
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2 mb-4">
                <span className="text-green-600 font-bold text-sm">
                  Free Trial — 30 dana aktivirano
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Poslali smo verifikacioni link na:
              </p>
              <p className="font-bold text-[#12142D] mb-6">
                {registrationResult.user.email}
              </p>
              <Link
                to="/login"
                className="block w-full bg-[#FF0026] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition text-sm"
              >
                Idi na prijavu
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Plaćeni paket — prikaži uplatnicu
    const bank = registrationResult.bank_details;
    const pkg = registrationResult.package;
    const ref = registrationResult.reference;

    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
        <DealerRegisterHeader />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg space-y-4">
            {/* Uspješna registracija header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-[#12142D] mb-1">
                Registracija uspješna!
              </h2>
              <p className="text-gray-500 text-sm">
                Nalog je kreiran. Verifikacioni link je poslan na{" "}
                <span className="font-semibold text-[#12142D]">
                  {registrationResult.user.email}
                </span>
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                <span className="text-amber-600 text-sm font-semibold">
                  ⏳ Nalog aktiviran nakon potvrde uplate
                </span>
              </div>
            </div>

            {/* Uplatnica */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#12142D] px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-black text-base">
                    Plaćanje uplatnicom
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Podaci za plaćanje u bilo kojoj banci ili pošti
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Paket</p>
                  <p className="text-white font-black text-sm">{pkg.name}</p>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {/* Iznos */}
                <div className="flex items-center justify-between bg-[#FF0026]/5 border border-[#FF0026]/20 rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold text-gray-600">
                    Iznos za uplatu
                  </span>
                  <span className="text-2xl font-black text-[#FF0026]">
                    {bank.iznos}
                  </span>
                </div>

                {/* Detalji */}
                <div className="space-y-2.5">
                  <UplatnicaRow label="Svrha uplate" value={ref} mono />
                  <UplatnicaRow
                    label="Naziv korisnika"
                    value={bank.naziv_korisnika}
                  />
                  <UplatnicaRow label="Banka" value={bank.banka} />
                  <UplatnicaRow
                    label="Žiro račun"
                    value={bank.ziro_racun}
                    mono
                  />
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mt-2">
                  <p className="text-xs text-blue-700">
                    💡 Obavezno navedite svrhu uplate{" "}
                    <span className="font-black">{ref}</span> kako bismo
                    identifikovali vašu uplatu i aktivirali nalog.
                  </p>
                </div>

                {/* Screenshot dugme */}
                <button
                  onClick={() => window.print()}
                  className="w-full mt-2 border-2 border-[#12142D] text-[#12142D] font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 9V2h12v7" />
                    <rect x="6" y="9" width="12" height="9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  </svg>
                  Odštampaj / Sačuvaj uputstvo
                </button>
              </div>
            </div>

            <Link
              to="/login"
              className="block w-full bg-[#FF0026] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition text-sm text-center"
            >
              Idi na prijavu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      <DealerRegisterHeader />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        {/* Naslov */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black text-[#12142D]">
            Registrujte Auto Plac / Auto Salon
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Popunite sve korake da biste kreirali dealer nalog
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      i < step
                        ? "bg-green-500 text-white"
                        : i === step
                          ? "bg-[#FF0026] text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i < step ? (
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 hidden sm:block ${i === step ? "text-[#FF0026] font-bold" : "text-gray-400"}`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 mb-4 ${i < step ? "bg-green-500" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Kartica sa sadržajem */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {step === 0 && (
            <Step1AutoPlac
              form={form}
              set={set}
              cities={cities}
              makes={makes}
              toggleBrand={toggleBrand}
            />
          )}
          {step === 1 && <Step2Billing form={form} set={set} />}
          {step === 2 && (
            <Step3Contact
              form={form}
              set={set}
              showPw={showPw}
              setShowPw={setShowPw}
            />
          )}
          {step === 3 && (
            <Step4Package
              form={form}
              set={set}
              freeTrial={freeTrial}
              paidPackages={paidPackages}
            />
          )}

          {/* Navigacija */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 0 ? (
              <button
                onClick={back}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                ← Nazad
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                onClick={next}
                className="px-8 py-2.5 bg-[#FF0026] hover:bg-red-700 text-white rounded-xl text-sm font-bold transition"
              >
                Dalje →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="px-8 py-2.5 bg-[#FF0026] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition"
              >
                {mutation.isPending ? "Slanje..." : "Završi registraciju"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Već imate nalog?{" "}
          <Link
            to="/login"
            className="text-[#FF0026] font-semibold hover:underline"
          >
            Prijavite se
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Korak 1: Auto plac info ────────────────────────────────────────────────
function Step1AutoPlac({ form, set, cities, makes, toggleBrand }) {
  return (
    <div className="space-y-5">
      <StepTitle icon="🏢" title="Informacije o Auto Placu" />

      <Field label="Naziv Auto Placa *">
        <input
          type="text"
          value={form.company_name}
          onChange={(e) => set("company_name", e.target.value)}
          placeholder="npr. Auto Plac Nikolić"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Adresa *">
          <input
            type="text"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Ul. Slobode 12"
            className={inputCls}
          />
        </Field>
        <Field label="Grad *">
          <select
            value={form.city_id}
            onChange={(e) => set("city_id", e.target.value)}
            className={inputCls}
          >
            <option value="">Izaberite grad</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Broj telefona 1 *">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+382 67 123 456"
            className={inputCls}
          />
        </Field>
        <Field label="Broj telefona 2 (opciono)">
          <input
            type="tel"
            value={form.phone2}
            onChange={(e) => set("phone2", e.target.value)}
            placeholder="+382 20 123 456"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Kategorije vozila */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Kategorije vozila *{" "}
          <span className="text-gray-400 font-normal">(koje vrste vozila prodajete?)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 1, label: "Automobili", icon: "/src/assets/icons/auto gray icon.png" },
            { id: 2, label: "Motocikli",  icon: "/src/assets/icons/motor gray icon.png" },
            { id: 3, label: "Nautika",    icon: "/src/assets/icons/nautika gray icon.png" },
            { id: 4, label: "Transport",  icon: "/src/assets/icons/transport gray icon.png" },
          ].map((cat) => {
            const selected = form.dealer_categories.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  const cats = selected
                    ? form.dealer_categories.filter((c) => c !== cat.id)
                    : [...form.dealer_categories, cat.id];
                  set("dealer_categories", cats);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                  selected
                    ? "bg-[#FF0026] text-white border-[#FF0026]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={cat.icon}
                  alt={cat.label}
                  className={`w-4 h-4 object-contain ${selected ? "brightness-0 invert" : ""}`}
                />
                {cat.label}
              </button>
            );
          })}
        </div>
        {form.dealer_categories.length === 0 && (
          <p className="text-xs text-red-500 mt-1">Odaberite najmanje jednu kategoriju.</p>
        )}
      </div>

      {/* Zastupnik brenda */}
      <div className="border border-gray-200 rounded-xl p-4">
        <label className="flex items-center gap-3 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={form.is_brand_representative}
            onChange={(e) => set("is_brand_representative", e.target.checked)}
            className="w-4 h-4 accent-[#FF0026]"
          />
          <div>
            <span className="text-sm font-semibold text-[#12142D]">Saloni / Zastupnici</span>
            <p className="text-xs text-gray-400">Označite ukoliko ste zastupnik određene marke vozila</p>
          </div>
        </label>

        {form.is_brand_representative && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-3">Izaberite marke kojih ste zastupnik:</p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {makes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleBrand(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    form.brands_represented.includes(m.id)
                      ? "bg-[#FF0026] text-white border-[#FF0026]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#FF0026]"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ── Korak 2: Obračun ──────────────────────────────────────────────────────
function Step2Billing({ form, set }) {
  return (
    <div className="space-y-5">
      <StepTitle icon="📋" title="Osnovne informacije i plaćanje" />

      {/* Tip obračuna */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            value: "company",
            label: "Firma",
            sub: "Plaćanje preko računa firme",
          },
          {
            value: "personal",
            label: "Fizičko lice",
            sub: "Plaćanje kao privatno lice",
          },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => set("billing_type", opt.value)}
            className={`p-4 rounded-xl border-2 text-left transition ${
              form.billing_type === opt.value
                ? "border-[#FF0026] bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="font-bold text-sm text-[#12142D]">{opt.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
          </button>
        ))}
      </div>

      {form.billing_type === "company" ? (
        <div className="space-y-4">
          <SectionLabel>Podaci o firmi</SectionLabel>
          <Field label="Ime Firme *">
            <input
              type="text"
              value={form.billing_company_name}
              onChange={(e) => set("billing_company_name", e.target.value)}
              placeholder="d.o.o. Nikolić"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Broj računa *">
              <input
                type="text"
                value={form.billing_account_number}
                onChange={(e) => set("billing_account_number", e.target.value)}
                placeholder="520-12345678-90"
                className={inputCls}
              />
            </Field>
            <Field label="PIB *">
              <input
                type="text"
                value={form.billing_pib}
                onChange={(e) => set("billing_pib", e.target.value)}
                placeholder="02123456"
                className={inputCls}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="PDV / Reg. broj (opciono)">
              <input
                type="text"
                value={form.billing_vat_number}
                onChange={(e) => set("billing_vat_number", e.target.value)}
                placeholder="ME12345678"
                className={inputCls}
              />
            </Field>
            <Field label="Telefon firme (opciono)">
              <input
                type="tel"
                value={form.billing_company_phone}
                onChange={(e) => set("billing_company_phone", e.target.value)}
                placeholder="+382 20 123 456"
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Adresa firme *">
            <input
              type="text"
              value={form.billing_company_address}
              onChange={(e) => set("billing_company_address", e.target.value)}
              placeholder="Ul. Slobode 12, Podgorica"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email firme (opciono)">
              <input
                type="email"
                value={form.billing_company_email}
                onChange={(e) => set("billing_company_email", e.target.value)}
                placeholder="firma@email.com"
                className={inputCls}
              />
            </Field>
            <Field label="Email za fakture (opciono)">
              <input
                type="email"
                value={form.billing_invoice_email}
                onChange={(e) => set("billing_invoice_email", e.target.value)}
                placeholder="fakture@email.com"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <SectionLabel>Podaci fizičkog lica</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ime *">
              <input
                type="text"
                value={form.billing_personal_name}
                onChange={(e) => set("billing_personal_name", e.target.value)}
                placeholder="Marko"
                className={inputCls}
              />
            </Field>
            <Field label="Prezime *">
              <input
                type="text"
                value={form.billing_personal_surname}
                onChange={(e) =>
                  set("billing_personal_surname", e.target.value)
                }
                placeholder="Nikolić"
                className={inputCls}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="JMBG *">
              <input
                type="text"
                value={form.billing_jmbg}
                onChange={(e) => set("billing_jmbg", e.target.value)}
                placeholder="0101990123456"
                className={inputCls}
              />
            </Field>
            <Field label="Grad (opciono)">
              <input
                type="text"
                value={form.billing_personal_city}
                onChange={(e) => set("billing_personal_city", e.target.value)}
                placeholder="Podgorica"
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Adresa *">
            <input
              type="text"
              value={form.billing_personal_address}
              onChange={(e) => set("billing_personal_address", e.target.value)}
              placeholder="Ul. Slobode 12, Podgorica"
              className={inputCls}
            />
          </Field>
        </div>
      )}

      {/* Metod plaćanja */}
      <div>
        <SectionLabel>Izaberite metod plaćanja</SectionLabel>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { value: "virman", label: "Virman", icon: "🏦" },
            { value: "card", label: "Kreditna kartica", icon: "💳" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("payment_method", opt.value)}
              className={`p-3 rounded-xl border-2 flex items-center gap-2 transition ${
                form.payment_method === opt.value
                  ? "border-[#FF0026] bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-xl">{opt.icon}</span>
              <span className="font-semibold text-sm text-[#12142D]">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Korak 3: Kontakt lice + nalog ─────────────────────────────────────────
function Step3Contact({ form, set, showPw, setShowPw }) {
  const pwChecks = {
    length: form.password.length >= 8,
    letter: /[a-zA-Z]/.test(form.password),
    special: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password),
  };

  return (
    <div className="space-y-5">
      <StepTitle icon="👤" title="Kontakt lice i kreiranje naloga" />
      <p className="text-xs text-gray-500 -mt-3 pb-1">
        Ove informacije koristimo za komunikaciju sa vašim auto placem. Email
        adresa će biti vaše korisničko ime.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Ime *">
          <input
            type="text"
            value={form.contact_name}
            onChange={(e) => set("contact_name", e.target.value)}
            placeholder="Marko"
            className={inputCls}
          />
        </Field>
        <Field label="Prezime *">
          <input
            type="text"
            value={form.contact_surname}
            onChange={(e) => set("contact_surname", e.target.value)}
            placeholder="Nikolić"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Broj telefona kontakt lica *">
        <div className="flex gap-2">
          <input
            type="tel"
            value={form.contact_phone}
            onChange={(e) => set("contact_phone", e.target.value)}
            placeholder="+382 67 123 456"
            className={`${inputCls} flex-1`}
          />
          <label
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border cursor-pointer text-xs font-semibold transition ${form.contact_whatsapp ? "border-green-500 bg-green-50 text-green-700" : "border-gray-300 text-gray-500 hover:border-gray-400"}`}
          >
            <input
              type="checkbox"
              checked={form.contact_whatsapp}
              onChange={(e) => set("contact_whatsapp", e.target.checked)}
              className="sr-only"
            />
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </label>
          <label
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border cursor-pointer text-xs font-semibold transition ${form.contact_viber ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-300 text-gray-500 hover:border-gray-400"}`}
          >
            <input
              type="checkbox"
              checked={form.contact_viber}
              onChange={(e) => set("contact_viber", e.target.checked)}
              className="sr-only"
            />
            <span className="text-base">📲</span>
            Viber
          </label>
        </div>
      </Field>

      <Field label="Email adresa (korisničko ime) *">
        <input
          type="email"
          value={form.contact_email}
          onChange={(e) => set("contact_email", e.target.value)}
          placeholder="kontakt@autoplac.com"
          className={inputCls}
        />
      </Field>

      <Field label="Lozinka *">
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Minimum 8 karaktera"
            className={`${inputCls} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPw ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {form.password.length > 0 && (
          <div className="mt-2 space-y-1">
            {[
              [pwChecks.length, "Najmanje 8 karaktera"],
              [pwChecks.letter, "Sadrži slova"],
              [pwChecks.special, "Sadrži broj ili specijalni znak"],
            ].map(([ok, label]) => (
              <div
                key={label}
                className={`flex items-center gap-2 text-xs ${ok ? "text-green-600" : "text-gray-400"}`}
              >
                <span>{ok ? "✓" : "○"}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </Field>

      <Field label="Potvrdi lozinku *">
        <input
          type="password"
          value={form.password_confirmation}
          onChange={(e) => set("password_confirmation", e.target.value)}
          placeholder="Ponovite lozinku"
          className={inputCls}
        />
        {form.password_confirmation.length > 0 &&
          form.password !== form.password_confirmation && (
            <p className="text-red-500 text-xs mt-1">
              Lozinke se ne podudaraju
            </p>
          )}
      </Field>
    </div>
  );
}

// ── Korak 4: Izbor paketa ─────────────────────────────────────────────────
function Step4Package({ form, set, freeTrial, paidPackages }) {
  const TIER_COLORS = {
    Bronze: "from-amber-600 to-amber-400",
    Silver: "from-slate-500 to-slate-300",
    Gold: "from-yellow-500 to-yellow-300",
    Platinum: "from-slate-700 to-slate-500",
  };

  return (
    <div className="space-y-6">
      <StepTitle icon="📦" title="Izaberite paket" />

      {/* Free Trial — poseban red */}
      {freeTrial && (
        <button
          type="button"
          onClick={() => set("package_id", freeTrial.id)}
          className={`w-full rounded-xl border-2 px-5 py-3 flex items-center justify-between transition ${
            form.package_id === freeTrial.id
              ? "border-[#FF0026] bg-red-50"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className="text-left">
            <span className="font-black text-[#12142D] text-sm">
              Free Trial — 30 dana besplatno
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              {freeTrial.max_active_ads} aktivnih oglasa ·{" "}
              {freeTrial.gratis_premium_ads} gratis plasirana oglasa
            </p>
          </div>
          <span className="text-green-600 font-black text-lg">GRATIS</span>
        </button>
      )}

      {/* Plaćeni paketi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paidPackages.map((pkg) => {
          const isGold = pkg.name === "Gold";
          const grad = TIER_COLORS[pkg.name] || "from-gray-500 to-gray-300";
          const selected = form.package_id === pkg.id;

          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => set("package_id", pkg.id)}
              className={`relative rounded-xl border-2 p-5 text-left transition flex flex-col gap-2 ${
                selected
                  ? "border-[#FF0026] bg-red-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              {isGold && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-0.5 rounded-full whitespace-nowrap">
                  ★ Najpopularniji izbor
                </span>
              )}
              <div
                className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${grad} text-white text-xs font-black px-2.5 py-1 rounded-lg w-fit`}
              >
                {pkg.name}
              </div>
              <div className="flex items-end gap-1 mt-1">
                <span className="text-2xl font-black text-[#12142D]">
                  {pkg.price}€
                </span>
                <span className="text-gray-400 text-sm mb-0.5">/mj</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 mt-1">
                <li>✓ Listing u kategoriji autoplacevi</li>
                <li>✓ Pretraga unutar profila</li>
                <li>✓ {pkg.max_active_ads} aktivnih oglasa</li>
                <li>✓ {pkg.gratis_premium_ads} gratis plasiranih oglasa</li>
                <li className="text-gray-400">
                  Vrijednost gratis oglasa: {pkg.gratis_premium_ads * 12}€
                </li>
              </ul>
              {selected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[#FF0026] rounded-full flex items-center justify-center">
                  <svg
                    width="10"
                    height="10"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Premium dodaci */}
      <div className="border-t pt-5">
        <p className="text-sm font-bold text-[#12142D] mb-3">
          Dodatne doplate (opciono)
        </p>
        <div className="space-y-3">
          <PremiumAddonCard
            title="Premium 1 — Oznaka prodavca"
            desc="Prikazan pri vrhu stranice autoplaceva"
            price="10€/mj"
            note="Možete dodati naknadno iz dashboard-a"
          />
          <PremiumAddonCard
            title="Premium 2 — Oznaka + Početna stranica"
            desc="Prikazan pri vrhu autoplaceva i na početnoj stranici"
            price="20€/mj"
            note="Možete dodati naknadno iz dashboard-a"
          />
        </div>
      </div>
    </div>
  );
}

// ── Helper komponente ──────────────────────────────────────────────────────

function UplatnicaRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span
        className={`text-sm font-bold text-[#12142D] ${mono ? "font-mono tracking-wider" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function DealerRegisterHeader() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="inline-flex items-center gap-2">
        <div className="bg-[#FF0026] px-2.5 py-1 rounded-md">
          <span className="text-white font-black text-lg leading-none">
            VOZIME
          </span>
        </div>
        <span className="text-[#12142D] font-bold text-base">OGLASI</span>
      </Link>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span className="bg-[#FF0026] text-white text-xs font-bold px-2 py-0.5 rounded">
          DEALER
        </span>
        <span>Registracija</span>
      </div>
    </div>
  );
}

function StepTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xl">{icon}</span>
      <h2 className="text-lg font-black text-[#12142D]">{title}</h2>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">
      {children}
    </p>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function PremiumAddonCard({ title, desc, price, note }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
      <div>
        <p className="text-sm font-bold text-[#12142D]">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
        {note && <p className="text-xs text-blue-500 mt-0.5">{note}</p>}
      </div>
      <span className="font-black text-[#FF0026] text-sm ml-4 whitespace-nowrap">
        {price}
      </span>
    </div>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] focus:border-transparent transition";

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
