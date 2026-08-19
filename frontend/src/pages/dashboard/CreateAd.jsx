import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useMultipleFilterOptions, CATEGORY_SLUGS } from "../../hooks/useFilterOptions";
import PromoteModal from "../../components/PromoteModal";

export default function CreateAd() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [createdAd, setCreatedAd] = useState(null); // { id, title } after successful creation
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedMakeId, setSelectedMakeId] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    category_id: "",
    make_id: "",
    model_id: "",
    city_id: "",
    title: "",
    description: "",
    price: "",
    price_negotiable: false,
    year: "",
    mileage: "",
    fuel_type: "",
    transmission: "",
    body_type: "",
    power_kw: "",
    engine_cc: "",
    color_exterior: "",
    color_interior: "",
    drive_type: "",
    doors: "",
    seats: "",
    condition: "polovnjak",
    damage: "neosteceno",
    emission_class: "",
    owners_count: "",
    registered_until: "",
    vin: "",
    has_service_book: false,
    has_warranty: false,
    accepts_exchange: false,
    import: false,
    trailer_coupling: "",
  });
  const [vehicleHistory, setVehicleHistory] = useState([]);

  const VEHICLE_HISTORY_OPTIONS = [
    { value: "prvi_vlasnik",           label: "Prvi vlasnik" },
    { value: "kupljen_nov_cg",         label: "Kupljen nov u Crnoj Gori" },
    { value: "servisna_knjiga",        label: "Servisna knjiga" },
    { value: "restauriran",            label: "Restauriran" },
    { value: "oldtimer",               label: "Oldtimer" },
    { value: "u_garanciji",            label: "Garancija" },
    { value: "garaziran",              label: "Garažiran" },
    { value: "prilagodjen_invalidima", label: "Prilagođen invalidima" },
    { value: "tuning",                 label: "Tuning" },
  ];

  const toggleHistory = (value) =>
    setVehicleHistory((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  // Kategorija slug za filter API
  const categorySlug = CATEGORY_SLUGS[form.category_id] ?? null;

  // Dohvati sve filter opcije odjednom za odabranu kategoriju
  const { data: filters } = useMultipleFilterOptions(
    ['fuel_type', 'body_type', 'transmission', 'drive_type',
     'condition', 'damage', 'emission_class', 'color_exterior', 'color_interior'],
    categorySlug
  );

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.data ?? r.data),
  });

  const { data: makes } = useQuery({
    queryKey: ["makes", form.category_id],
    queryFn: () =>
      api.get("/makes", { params: { category_id: form.category_id } })
        .then((r) => r.data.data ?? r.data),
    enabled: !!form.category_id,
  });

  const { data: models } = useQuery({
    queryKey: ["models", selectedMakeId],
    queryFn: () => api.get(`/makes/${selectedMakeId}/models`).then((r) => r.data.data ?? r.data),
    enabled: !!selectedMakeId,
  });

  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: () => api.get("/cities").then((r) => r.data.data ?? r.data),
  });

  const { data: equipment } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => api.get("/equipment").then((r) => r.data.data ?? r.data),
  });

  const { data: imageLimitData } = useQuery({
    queryKey: ["image-limit"],
    queryFn: () => api.get("/image-limit").then((r) => r.data),
  });
  const maxImages = imageLimitData?.max_images ?? 5;

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === "vin" && (!val || val.length !== 17)) return;
        if (typeof val === "boolean") {
          formData.append(key, val ? "1" : "0");
          return;
        }
        if (val !== "" && val !== null) formData.append(key, val);
      });
      selectedEquipment.forEach((id) => formData.append("equipment[]", id));
      vehicleHistory.forEach((v) => formData.append("vehicle_history[]", v));
      images.forEach((img) => formData.append("images[]", img));
      return api.post("/ads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      toast.success("Oglas objavljen! Ceka moderaciju.");
      const ad = res.data?.data ?? res.data;
      setCreatedAd({ id: ad?.id, title: ad?.title ?? form.title });
      setStep(5);
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(err.response?.data?.message ?? "Greska pri objavljivanju oglasa");
      }
    },
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // ─── Uvoz oglasa sa AutoDilera ─────────────────────────────
  const [importUrl, setImportUrl] = useState("");
  const [importMeta, setImportMeta] = useState(null);
  const importMutation = useMutation({
    mutationFn: () =>
      api.post("/ads/import-url", { url: importUrl.trim() }).then((r) => r.data),
    onSuccess: (data) => {
      const f = data.form ?? {};
      // Selecti porede vrijednosti kao stringove — kastuj ID-jeve i numeričke selecte
      const asString = ["category_id", "make_id", "model_id", "city_id", "doors", "seats", "year"];
      const merged = {};
      Object.entries(f).forEach(([k, v]) => {
        if (v === null || v === undefined || v === "") return;
        merged[k] = asString.includes(k) ? String(v) : v;
      });
      setForm((prev) => ({ ...prev, ...merged }));
      if (merged.make_id) setSelectedMakeId(merged.make_id);
      if (Array.isArray(data.vehicle_history) && data.vehicle_history.length) setVehicleHistory(data.vehicle_history);
      if (Array.isArray(data.equipment) && data.equipment.length) setSelectedEquipment(data.equipment);
      setImportMeta(data.meta ?? null);
      setStep(1);
      toast.success("Podaci su uvezeni — provjeri polja i dodaj svoje fotografije.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Uvoz nije uspio. Provjeri link i pokušaj ponovo."),
  });

  const toggleEquipment = (id) => {
    setSelectedEquipment((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > maxImages) {
      toast.error(`Vaš paket dozvoljava najviše ${maxImages} slika po oglasu`);
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const equipmentByCategory = Array.isArray(equipment)
    ? equipment.reduce((acc, eq) => {
        const cat = eq.category ?? "Ostalo";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(eq);
        return acc;
      }, {})
    : equipment && typeof equipment === "object"
      ? equipment
      : {};

  const equipmentCategoryLabels = {
    safety: "Sigurnost",
    comfort: "Udobnost",
    multimedia: "Multimedija",
    exterior: "Eksterijer",
    assistance: "Asistencija",
  };

  const steps = ["Osnovno", "Detalji", "Oprema", "Slike i opis", "Promocija"];

  const canNext = () => {
    if (step === 1)
      return (
        form.category_id && form.make_id && form.model_id && form.city_id &&
        form.title && form.title.length >= 10 && form.price && form.year && form.mileage !== ""
      );
    if (step === 2)
      return (
        form.fuel_type && form.transmission && form.body_type && form.condition &&
        form.damage && form.drive_type && form.doors && form.seats &&
        form.power_kw && form.color_exterior
      );
    if (step === 3) return true;
    if (step === 4) return form.description && form.description.length >= 30;
    return true;
  };

  const getMissingFields = () => {
    if (step === 1) {
      const missing = [];
      if (!form.category_id) missing.push("Kategorija");
      if (!form.make_id) missing.push("Marka");
      if (!form.model_id) missing.push("Model");
      if (!form.city_id) missing.push("Grad");
      if (!form.title || form.title.length < 10) missing.push("Naslov (min. 10 karaktera)");
      if (!form.price) missing.push("Cijena");
      if (!form.year) missing.push("Godiste");
      if (form.mileage === "") missing.push("Kilometraza");
      return missing;
    }
    if (step === 2) {
      const missing = [];
      if (!form.fuel_type) missing.push("Gorivo");
      if (!form.transmission) missing.push("Mjenjac");
      if (!form.body_type) missing.push("Karoserija");
      if (!form.drive_type) missing.push("Pogon");
      if (!form.doors) missing.push("Broj vrata");
      if (!form.seats) missing.push("Broj sjedista");
      if (!form.power_kw) missing.push("Snaga (kW)");
      if (!form.color_exterior) missing.push("Boja karoserije");
      return missing;
    }
    if (step === 4) {
      if (!form.description || form.description.length < 30)
        return ["Opis (min. 30 karaktera)"];
    }
    return [];
  };

  // Helper: generiši select iz filter opcija
  const FilterSelect = ({ label, field, options = [], required = false, placeholder = "Odaberi" }) => (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
        {label} {required && "*"}
      </label>
      <select
        value={form[field]}
        onChange={(e) => set(field, e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id ?? opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  // Boja selector (vizuelni)
  const ColorSelect = ({ label, field, options = [] }) => (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{label} *</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => set(field, opt.value)}
            title={opt.label}
            className={`relative w-8 h-8 rounded-full border-2 transition ${
              form[field] === opt.value ? "border-[#FF0026] scale-110" : "border-gray-200 hover:border-gray-400"
            }`}
            style={{ backgroundColor: opt.metadata?.hex ?? "#e5e7eb" }}
          >
            {form[field] === opt.value && (
              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">✓</span>
            )}
          </button>
        ))}
        {form[field] && (
          <span className="text-xs text-gray-500 self-center ml-1">
            {options.find(o => o.value === form[field])?.label ?? form[field]}
          </span>
        )}
      </div>
    </div>
  );

  const missingFields = getMissingFields();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#12142D]">Objavi oglas</h1>
        <p className="text-gray-400 text-sm mt-1">Popunite podatke o vozilu</p>
      </div>

      {/* Uvoz sa AutoDilera */}
      {step <= 4 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-dashed border-gray-300">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-sm font-bold text-[#12142D]">Imaš oglas na AutoDileru?</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Nalijepi link svog oglasa i sva polja se popunjavaju automatski.
                Fotografije se ne prenose (imaju AutoDiler watermark) — njih dodaješ sam u koraku 4.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://autodiler.me/automobili/..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
            />
            <button
              type="button"
              onClick={() => importUrl.trim() && importMutation.mutate()}
              disabled={importMutation.isPending || !importUrl.trim()}
              className="bg-[#12142D] hover:bg-[#1B2B5A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap"
            >
              {importMutation.isPending ? "Uvozim..." : "Uvezi"}
            </button>
          </div>
          {importMeta && (
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p className="text-green-600 font-semibold">
                ✓ Uvezeno: {importMeta.source?.make} {importMeta.source?.model}
                {importMeta.source?.category ? ` (${importMeta.source.category})` : ""}
              </p>
              {importMeta.unmapped?.length > 0 && (
                <p>
                  Nije prepoznato, izaberi ručno:{" "}
                  {importMeta.unmapped.map((u) => `${u.label}: ${u.value}`).join(" · ")}
                </p>
              )}
              {importMeta.unmatched_equipment?.length > 0 && (
                <p>
                  Oprema koju nemamo u šifarniku ({importMeta.unmatched_equipment.length}):{" "}
                  {importMeta.unmatched_equipment.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Steps */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${i < steps.length - 1 ? "flex-1" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                step > i + 1 ? "bg-green-500 text-white" :
                step === i + 1 ? "bg-[#FF0026] text-white" :
                "bg-gray-200 text-gray-500"
              }`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? "text-[#12142D]" : "text-gray-400"}`}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 ${step > i + 1 ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">

        {/* STEP 1 — Osnovno */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#12142D] mb-4">Osnovni podaci</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Kategorija *</label>
                <select
                  value={form.category_id}
                  onChange={(e) => {
                    set("category_id", e.target.value);
                    // Marka i model zavise od kategorije — resetuj ih
                    set("make_id", "");
                    set("model_id", "");
                    setSelectedMakeId("");
                    // Reset filter polja kad se promijeni kategorija
                    set("fuel_type", "");
                    set("body_type", "");
                    set("transmission", "");
                    set("drive_type", "");
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white"
                >
                  <option value="">Odaberi kategoriju</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Grad *</label>
                <select value={form.city_id} onChange={(e) => set("city_id", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi grad</option>
                  {cities?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Marka *</label>
                <select value={form.make_id}
                  onChange={(e) => { set("make_id", e.target.value); set("model_id", ""); setSelectedMakeId(e.target.value); }}
                  disabled={!form.category_id}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white disabled:opacity-50">
                  <option value="">{form.category_id ? "Odaberi marku" : "Prvo odaberi kategoriju"}</option>
                  {makes?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Model *</label>
                <select value={form.model_id} onChange={(e) => set("model_id", e.target.value)}
                  disabled={!selectedMakeId}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white disabled:opacity-50">
                  <option value="">Odaberi model</option>
                  {models?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Godiste *</label>
                <select value={form.year} onChange={(e) => set("year", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi godiste</option>
                  {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Kilometraza *</label>
                <input type="number" value={form.mileage} onChange={(e) => set("mileage", e.target.value)}
                  placeholder="npr. 85000"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Naslov oglasa * (min. 10 karaktera)</label>
              <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
                placeholder="npr. Volkswagen Golf 7 1.6 TDI 2018"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              {form.title && form.title.length < 10 && (
                <p className="text-xs text-red-500 mt-1">Jos {10 - form.title.length} karaktera</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Cijena (EUR) *</label>
                <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
                  placeholder="npr. 12500"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.price_negotiable}
                    onChange={(e) => set("price_negotiable", e.target.checked)}
                    className="w-4 h-4 accent-[#FF0026]" />
                  <span className="text-sm text-gray-600">Cijena po dogovoru</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Detalji vozila */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#12142D] mb-4">Tehnicke karakteristike</h2>

            {/* Info ako kategorija nije odabrana */}
            {!form.category_id && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
                Odaberite kategoriju u koraku 1 za filtriranje relevantnih opcija.
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <FilterSelect
                label="Gorivo" field="fuel_type" required
                options={filters?.fuel_type ?? []}
              />
              <FilterSelect
                label="Mjenjac" field="transmission" required
                options={filters?.transmission ?? []}
              />
              <FilterSelect
                label="Karoserija" field="body_type" required
                options={filters?.body_type ?? []}
              />
              <FilterSelect
                label="Pogon" field="drive_type" required
                options={filters?.drive_type ?? []}
              />

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Snaga (kW) *</label>
                <input type="number" value={form.power_kw} onChange={(e) => set("power_kw", e.target.value)}
                  placeholder="npr. 110"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Kubikaza (cc)</label>
                <input type="number" value={form.engine_cc} onChange={(e) => set("engine_cc", e.target.value)}
                  placeholder="npr. 1598"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Vrata *</label>
                <select value={form.doors} onChange={(e) => set("doors", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi</option>
                  {[2, 3, 4, 5].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Sjedista *</label>
                <select value={form.seats} onChange={(e) => set("seats", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi</option>
                  {[2, 4, 5, 6, 7, 8, 9].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <FilterSelect
                label="Emisija" field="emission_class"
                options={filters?.emission_class ?? []}
              />

              <FilterSelect
                label="Stanje" field="condition" required
                options={filters?.condition ?? []}
              />

              <FilterSelect
                label="Ostecenje" field="damage" required
                options={filters?.damage ?? []}
              />

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Broj vlasnika</label>
                <input type="number" value={form.owners_count} onChange={(e) => set("owners_count", e.target.value)}
                  placeholder="npr. 1"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Registrovan do</label>
                <input type="date" value={form.registered_until} onChange={(e) => set("registered_until", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">VIN broj (opciono)</label>
                <input type="text" value={form.vin} onChange={(e) => set("vin", e.target.value)}
                  placeholder="17 karaktera"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                {form.vin && form.vin.length > 0 && form.vin.length !== 17 && (
                  <p className="text-xs text-red-500 mt-1">VIN mora imati tacno 17 karaktera ({form.vin.length}/17)</p>
                )}
              </div>
            </div>

            {/* Boje */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <ColorSelect
                label="Boja karoserije"
                field="color_exterior"
                options={filters?.color_exterior ?? []}
              />
              <ColorSelect
                label="Boja enterijera"
                field="color_interior"
                options={filters?.color_interior ?? []}
              />
            </div>

            {/* Boolean opcije */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { key: "has_service_book", label: "Servisna knjiga" },
                { key: "has_warranty",     label: "Garancija" },
                { key: "accepts_exchange", label: "Prihvata zamjenu" },
                { key: "import",           label: "Uvoz" },
              ].map(({ key, label }) => (
                <label key={key} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${
                  form[key] ? "border-[#FF0026] bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                  <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)}
                    className="w-4 h-4 accent-[#FF0026]" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>

            {/* Istorija vozila */}
            <div className="pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Istorija vozila</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {VEHICLE_HISTORY_OPTIONS.map(({ value, label }) => (
                  <label key={value} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${
                    vehicleHistory.includes(value) ? "border-[#FF0026] bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <input type="checkbox" checked={vehicleHistory.includes(value)} onChange={() => toggleHistory(value)}
                      className="w-4 h-4 accent-[#FF0026]" />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Kuka za prikolicu */}
            <div className="pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kuka za prikolicu</p>
              <div className="flex flex-wrap gap-2">
                {["", "Fiksna", "Odvojna", "Okretna"].map((opt) => (
                  <button
                    key={opt || "none"}
                    type="button"
                    onClick={() => set("trailer_coupling", opt)}
                    className={`text-sm px-4 py-2 rounded-full border-2 transition font-medium ${
                      form.trailer_coupling === opt
                        ? "border-[#FF0026] bg-red-50 text-[#FF0026]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt || "Nema"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Oprema */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#12142D] mb-4">Oprema vozila</h2>
            <p className="text-sm text-gray-400">Opciono — odaberite opremu koja se nalazi u vozilu.</p>
            {Object.entries(equipmentByCategory).map(([cat, items]) => (
              <div key={cat}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{equipmentCategoryLabels[cat] ?? cat}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((eq) => (
                    <button key={eq.id} type="button" onClick={() => toggleEquipment(eq.id)}
                      className={`text-sm px-3 py-1.5 rounded-full border-2 transition font-medium ${
                        selectedEquipment.includes(eq.id)
                          ? "border-[#FF0026] bg-red-50 text-[#FF0026]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      {eq.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {selectedEquipment.length > 0 && (
              <p className="text-sm text-green-600 font-medium">Odabrano: {selectedEquipment.length} stavki</p>
            )}
          </div>
        )}

        {/* STEP 4 — Slike i opis */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#12142D] mb-4">Slike i opis</h2>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Slike (max {maxImages})</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-[#FF0026] transition bg-gray-50">
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500">Klikni da dodas slike</span>
                <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
              </label>

              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden group">
                      <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        x
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-black bg-opacity-50 text-white py-0.5">Glavna</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Opis vozila * (min. 30 karaktera)</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Opisi stanje vozila, historiju, razlog prodaje..." rows={6}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] resize-none" />
              {form.description && form.description.length < 30 && (
                <p className="text-xs text-red-500 mt-1">Jos {30 - form.description.length} karaktera</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 5 — Promocija (post-creation) */}
        {step === 5 && (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto">
              ✓
            </div>
            <div>
              <h2 className="text-xl font-black text-[#12142D]">Oglas je objavljen!</h2>
              <p className="text-gray-500 text-sm mt-1">Ceka moderaciju i uskoro ce biti aktivan.</p>
            </div>

            <div className="bg-[#FFEA00]/10 border border-[#FFEA00] rounded-2xl p-5 text-left space-y-3">
              <p className="font-black text-[#12142D]">Zelite li promovirati ovaj oglas?</p>
              <p className="text-sm text-gray-600">
                Promovisani oglasi se prikazuju iznad ostalih i na naslovnoj stranici — vise pregleda, brza prodaja.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={() => setShowPromoteModal(true)}
                  className="flex-1 bg-[#12142D] hover:bg-[#1B2B5A] text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  ⭐ Promoviši oglas
                </button>
                <button
                  onClick={() => navigate("/dashboard/ads")}
                  className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-bold py-3 rounded-xl text-sm transition"
                >
                  Preskoči, later
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard/ads")}
              className="text-sm text-gray-400 hover:text-gray-600 transition underline"
            >
              Idi na moje oglase
            </button>
          </div>
        )}

        {/* Navigation */}
        {step < 5 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          {!canNext() && missingFields.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs font-semibold text-red-500 mb-1">Popunite obavezna polja:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {missingFields.map((f) => (
                  <li key={f} className="text-xs text-red-400">{f}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setStep((s) => s - 1)} disabled={step === 1}
              className="px-6 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-gray-300 transition disabled:opacity-30">
              Nazad
            </button>

            {step < 4 ? (
              <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}
                className="px-6 py-2.5 bg-[#FF0026] hover:bg-red-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
                Dalje
              </button>
            ) : (
              <button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending || !canNext()}
                className="px-8 py-2.5 bg-[#FF0026] hover:bg-red-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
                {mutation.isPending ? "Objavljujem..." : "Objavi oglas"}
              </button>
            )}
          </div>
        </div>
        )}
      </div>

      {showPromoteModal && createdAd && (
        <PromoteModal
          adId={createdAd.id}
          adTitle={createdAd.title}
          packageType="ad_boost"
          onClose={() => setShowPromoteModal(false)}
          onSuccess={() => { setShowPromoteModal(false); navigate("/dashboard/ads"); }}
        />
      )}
    </div>
  );
}