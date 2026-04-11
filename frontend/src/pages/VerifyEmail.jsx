import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import axios from "../api/axios";

export default function VerifyEmail() {
  const { id, hash } = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const expires   = searchParams.get("expires");
    const signature = searchParams.get("signature");

    axios
      .get(`/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [id, hash]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Navbar minimal */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="bg-[#FF0026] px-2.5 py-1 rounded-md">
            <span className="text-white font-black text-lg leading-none">VOZIME</span>
          </div>
          <span className="text-[#12142D] font-bold text-base">OGLASI</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 w-full max-w-md text-center">

          {status === "loading" && (
            <>
              <div className="w-12 h-12 border-4 border-[#FF0026] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
              <p className="text-gray-500 text-sm">Verifikujemo vaš email...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="text-xl font-black text-[#12142D] mb-2">Email verifikovan!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Vaš nalog je aktiviran. Sada se možete prijaviti.
              </p>
              <Link
                to="/login"
                className="block w-full bg-[#FF0026] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition text-sm"
              >
                Prijavite se
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="32" height="32" fill="none" stroke="#dc2626" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
              <h2 className="text-xl font-black text-[#12142D] mb-2">Link nije važeći</h2>
              <p className="text-gray-500 text-sm mb-6">
                Verifikacioni link je istekao ili je nevažeći. Zatražite novi link.
              </p>
              <Link
                to="/login"
                className="block w-full bg-[#FF0026] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition text-sm"
              >
                Nazad na prijavu
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}