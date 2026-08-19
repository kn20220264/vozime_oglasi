import { useState } from "react";
import toast from "react-hot-toast";

// Share dugmad za oglas — kopiraj link, WhatsApp, Viber, Facebook, native share
export default function ShareButtons({ title = "", url = "" }) {
  const [open, setOpen] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const text = title ? `${title} — VozimeOglasi` : "VozimeOglasi";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link kopiran!");
    } catch {
      toast.error("Kopiranje nije uspjelo.");
    }
    setOpen(false);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url: shareUrl });
      } catch {
        /* korisnik odustao */
      }
      setOpen(false);
      return true;
    }
    return false;
  };

  const links = [
    {
      label: "WhatsApp",
      icon: "💬",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
    },
    {
      label: "Viber",
      icon: "📱",
      href: `viber://forward?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
    },
    {
      label: "Facebook",
      icon: "📘",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "Instagram",
      icon: "📸",
      // Instagram nema web share URL — kopiramo link i otvaramo Instagram
      onClick: async () => {
        await copyLink();
        window.open("https://www.instagram.com/", "_blank", "noopener");
      },
    },
    {
      label: "Email",
      icon: "✉️",
      href: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={async () => {
          // Na mobilnom pokušaj native share; inače otvori meni
          const shared = await nativeShare();
          if (!shared) setOpen((p) => !p);
        }}
        className="w-full border border-gray-200 hover:border-[#12142D] text-gray-600 hover:text-[#12142D] font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 12.684a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Podijeli oglas
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
            >
              <span>🔗</span> Kopiraj link
            </button>
            {links.map((l) =>
              l.onClick ? (
                <button
                  key={l.label}
                  onClick={l.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <span>{l.icon}</span> {l.label}
                </button>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <span>{l.icon}</span> {l.label}
                </a>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
