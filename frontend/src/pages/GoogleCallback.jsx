import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Google prijava nije uspjela. Pokušajte ponovo.");
      navigate("/login");
      return;
    }

    if (!token) {
      toast.error("Nevažeći token.");
      navigate("/login");
      return;
    }

    // Dohvati podatke o korisniku sa tokenom
    axios
      .get("/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        login(res.data, token);
        qc.invalidateQueries(["me"]);
        toast.success(`Dobrodošli, ${res.data.name}!`);
        const role = res.data.role;
        if (role === "admin") navigate("/admin");
        else if (role === "moderator") navigate("/moderator");
        else navigate("/dashboard");
      })
      .catch(() => {
        toast.error("Greška pri prijavi. Pokušajte ponovo.");
        navigate("/login");
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#FF0026] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Prijava putem Google-a...</p>
      </div>
    </div>
  );
}