import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";

// Pop-up reklama pri ulasku na sajt.
// Prikazuje se jednom po sesiji (sessionStorage), 1.5s nakon učitavanja.
export default function PopupBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("popup_banner_seen") === "1"
  );

  const { data } = useQuery({
    queryKey: ["banners", "popup"],
    queryFn: () => axios.get("/banners?position=popup").then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
    enabled: !dismissed,
  });

  const banner = data?.[0];

  useEffect(() => {
    if (!banner || dismissed) return;
    const t = setTimeout(() => {
      setVisible(true);
      axios.post(`/banners/${banner.id}/view`).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [banner, dismissed]);

  const close = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("popup_banner_seen", "1");
  };

  const handleClick = () => {
    axios.post(`/banners/${banner.id}/click`).catch(() => {});
    if (banner.link_url) window.open(banner.link_url, "_blank", "noopener");
    close();
  };

  if (!visible || !banner) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition text-lg leading-none"
          aria-label="Zatvori reklamu"
        >
          ✕
        </button>
        <button onClick={handleClick} className="block w-full text-left cursor-pointer">
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full max-h-[70vh] object-contain bg-gray-50"
          />
        </button>
        <div className="px-4 py-2 text-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Reklama</span>
        </div>
      </div>
    </div>
  );
}
