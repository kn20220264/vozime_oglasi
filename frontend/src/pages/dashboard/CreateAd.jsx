import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function CreateAd() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.data),
  });

  const { data: makes } = useQuery({
    queryKey: ["makes"],
    queryFn: () => api.get("/makes").then((r) => r.data.data),
  });

  const { data: models } = useQuery({
    queryKey: ["models", selectedMakeId],
    queryFn: () =>
      api.get(`/makes/${selectedMakeId}/models`).then((r) => r.data.data),
    enabled: !!selectedMakeId,
  });

  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: () => api.get("/cities").then((r) => r.data.data),
  });

  const { data: equipment } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => api.get("/equipment").then((r) => r.data.data),
  });

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
      images.forEach((img) => formData.append("images[]", img));

      return api.post("/ads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Oglas objavljen! Ceka moderaciju.");
      navigate(`/dashboard/ads`);
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error("Greska pri objavljivanju oglasa");
      }
    },
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleEquipment = (id) => {
    setSelectedEquipment((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      toast.error("Maksimalno 10 slika");
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (i) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  const equipmentByCategory =
    equipment && !Array.isArray(equipment)
      ? equipment
      : Array.isArray(equipment)
      ? equipment.reduce((acc, eq) => {
          if (!acc[eq.category]) acc[eq.category] = [];
          acc[eq.category].push(eq);
          return acc;
        }, {})
      : {};

  const steps = ["Osnovno", "Detalji", "Oprema", "Slike i opis"];

  const canNext = () => {
    if (step === 1)
      return (
        form.category_id &&
        form.make_id &&
        form.model_id &&
        form.city_id &&
        form.title &&
        form.title.length >= 10 &&
        form.price &&
        form.year &&
        form.mileage !== ""
      );

    if (step === 2)
      return (
        form.fuel_type &&
        form.transmission &&
        form.body_type &&
        form.condition &&
        form.damage &&
        form.drive_type &&
        form.doors &&
        form.seats &&
        form.power_kw &&
        form.color_exterior
      );

    if (step === 3) return true;

    if (step === 4)
      return form.description && form.description.length >= 30;

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

  const missingFields = getMissingFields();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#12142D]">Objavi oglas</h1>
        <p className="text-gray-400 text-sm mt-1">Popunite podatke o vozilu</p>
      </div>

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
                <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi kategoriju</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Grad *</label>
                <select value={form.city_id} onChange={(e) => set("city_id", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi grad</option>
                  {cities?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Marka *</label>
                <select value={form.make_id} onChange={(e) => { set("make_id", e.target.value); set("model_id", ""); setSelectedMakeId(e.target.value); }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi marku</option>
                  {makes?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Model *</label>
                <select value={form.model_id} onChange={(e) => set("model_id", e.target.value)} disabled={!selectedMakeId} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white disabled:opacity-50">
                  <option value="">Odaberi model</option>
                  {models?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Godiste *</label>
                <select value={form.year} onChange={(e) => set("year", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi godiste</option>
                  {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Kilometraza *</label>
                <input type="number" value={form.mileage} onChange={(e) => set("mileage", e.target.value)} placeholder="npr. 85000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Naslov oglasa * (min. 10 karaktera)</label>
              <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="npr. Volkswagen Golf 7 1.6 TDI 2018" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              {form.title && form.title.length < 10 && (
                <p className="text-xs text-red-500 mt-1">Jos {10 - form.title.length} karaktera</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Cijena (EUR) *</label>
                <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="npr. 12500" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.price_negotiable} onChange={(e) => set("price_negotiable", e.target.checked)} className="w-4 h-4 accent-[#FF0026]" />
                  <span className="text-sm text-gray-600">Cijena po dogovoru</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Detalji */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#12142D] mb-4">Tehnicke karakteristike</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Gorivo *</label>
                <select value={form.fuel_type} onChange={(e) => set("fuel_type", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi</option>
                  {["benzin","dizel","hibrid","elektro","plin","benzin+plin"].map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Mjenjac *</label>
                <select value={form.transmission} onChange={(e) => set("transmission", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi</option>
                  {["manuelni","automatik","poluautomatik"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Karoserija *</label>
                <select value={form.body_type} onChange={(e) => set("body_type", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi</option>
                  {["sedan","karavan","suv","hatchback","coupe","kabrio","van","pickup"].map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Pogon *</label>
                <select value={form.drive_type} onChange={(e) => set("drive_type", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi</option>
                  {["prednji","zadnji","4x4"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Snaga (kW) *</label>
                <input type="number" value={form.power_kw} onChange={(e) => set("power_kw", e.target.value)} placeholder="npr. 110" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Kubikaza (cc)</label>
                <input type="number" value={form.engine_cc} onChange={(e) => set("engine_cc", e.target.value)} placeholder="npr. 1598" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Vrata *</label>
                <select value={form.doors} onChange={(e) => set("doors", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi</option>
                  {[2,3,4,5].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Sjedista *</label>
                <select value={form.seats} onChange={(e) => set("seats", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi</option>
                  {[2,4,5,6,7,8,9].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Emisija</label>
                <select value={form.emission_class} onChange={(e) => set("emission_class", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="">Odaberi</option>
                  {["euro3","euro4","euro5","euro6"].map((e) => <option key={e} value={e}>{e.toUpperCase()}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Boja karoserije *</label>
                <input type="text" value={form.color_exterior} onChange={(e) => set("color_exterior", e.target.value)} placeholder="npr. Crna" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Boja enterijera</label>
                <input type="text" value={form.color_interior} onChange={(e) => set("color_interior", e.target.value)} placeholder="npr. Crna" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Broj vlasnika</label>
                <input type="number" value={form.owners_count} onChange={(e) => set("owners_count", e.target.value)} placeholder="npr. 1" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Stanje *</label>
                <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="polovnjak">Polovnjak</option>
                  <option value="novo">Novo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Ostecenje *</label>
                <select value={form.damage} onChange={(e) => set("damage", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                  <option value="neosteceno">Neosteceno</option>
                  <option value="osteceno">Osteceno</option>
                  <option value="nije_vozno">Nije vozno</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Registrovan do</label>
                <input type="date" value={form.registered_until} onChange={(e) => set("registered_until", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">VIN broj (opciono)</label>
                <input type="text" value={form.vin} onChange={(e) => set("vin", e.target.value)} placeholder="17 karaktera" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                {form.vin && form.vin.length > 0 && form.vin.length !== 17 && (
                  <p className="text-xs text-red-500 mt-1">VIN mora imati tacno 17 karaktera ({form.vin.length}/17)</p>
                )}
              </div>
            </div>

            {/* Boolean opcije */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { key: "has_service_book", label: "Servisna knjiga" },
                { key: "has_warranty", label: "Garancija" },
                { key: "accepts_exchange", label: "Prihvata zamjenu" },
                { key: "import", label: "Uvoz" },
              ].map(({ key, label }) => (
                <label key={key} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${form[key] ? "border-[#FF0026] bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} className="w-4 h-4 accent-[#FF0026]" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
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
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{cat}</p>
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
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Slike (max 10)</label>
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

        {/* Navigation buttons */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          {/* Prikaz nedostajucih polja */}
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
      </div>
    </div>
  );
}