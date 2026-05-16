"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Check,
  X,
  Lock,
} from "@/components/icons";

type TermsModalProps = {
  open: boolean;
  onClose: () => void;
  checked: boolean;
  setChecked: (v: boolean) => void;
  onConfirm: () => void;
  advancePay?: number | null;
};

export default function TermsModal({
  open,
  onClose,
  checked,
  setChecked,
  onConfirm,
  advancePay,
}: TermsModalProps) {
  const resolvedAdvancePay =
    typeof advancePay === "number" && Number.isFinite(advancePay)
      ? Math.max(advancePay, 0)
      : null;

  /* -----------------------------
     ESC KEY CLOSE
  ------------------------------ */
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP + HEADER BLUR */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MODAL WRAPPER */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4 py-2 sm:py-4"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-3xl max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl border border-gray-300 bg-white p-2 shadow-2xl sm:p-6 md:p-8">

              {/* CLOSE */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-black transition"
              >
                <X size={20} />
              </button>

              {/* HEADER */}
              <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6 pr-8">
                <FileText className="text-[#FFD700] shrink-0" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
                  TERMS & CONDITIONS
                </h2>
              </div>

              {/* CONTENT */}
              <div className="pr-1 sm:pr-2 text-xs sm:text-sm text-gray-700 space-y-5 sm:space-y-6">
                <ul className="list-disc pl-5 space-y-1.5 sm:space-y-2">
                  <li>Outside food beverages not allowed</li>
                  <li>Smoking/Drinking is NOT allowed inside the theater. If found, a fine of up to ₹2,000 will be charged.</li>
                  <li>Any damage caused to the theater, including decorative materials like balloons, lights, etc., must be reimbursed.</li>
                  <li>Guests are requested to maintain cleanliness inside the theater to avoid cleaning charges.</li>
                  <li>Party poppers, snow sprays, cold fire, and any other similar items are strictly prohibited inside the theater.</li>
                  <li>Pets are strictly not allowed inside the theater.</li>
                  <li>In case of an electricity cut lasting more than 15 minutes, your booking amount will be refunded.</li>
                  <li>Couples under 18 years of age are not allowed to book the theater.</li>
                  <li>Aadhaar card is mandatory. In case of couples, both individuals must present their ID, which will be scanned at reception.</li>
                </ul>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={18} className="text-[#FFD700]" />
                    <h3 className="font-semibold text-black text-sm sm:text-base">
                      REFUND POLICY
                    </h3>
                  </div>

                  <ul className="list-disc pl-5 space-y-1.5 sm:space-y-2">
                    <li>The advance amount is fully refundable if the slot is canceled at least 72 hours before the slot time.</li>
                    <li>If your slot is less than 72 hours away from the time of payment, no refund or slot rescheduling will be possible under any circumstances.</li>
                  </ul>
                </div>
              </div>

              {/* AGREEMENT */}
              <div className="mt-2 sm:mt-6 border border-black/10 rounded-xl p-2 sm:p-4 flex items-center gap-2.5 sm:gap-3">
                <button
                  onClick={() => setChecked(!checked)}
                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition cursor-pointer
                    ${
                      checked
                        ? "bg-[#FFD700] border-[#FFD700] cursor-pointer "
                        : "border-gray-400"
                    }
                  `}
                >
                  {checked && <Check size={14} />}
                </button>

                <p className="text-[10px] sm:text-sm text-gray-700 leading-relaxed">
                  I agree to the{" "}
                  <Link
                    href="/terms-and-conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  of Sandy Toes.
                </p>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={checked ? { scale: 1.04 } : {}}
                whileTap={checked ? { scale: 0.97 } : {}}
                disabled={!checked}
                onClick={checked ? onConfirm : undefined}
                className={`mt-4 sm:mt-6 w-full flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition
                  ${
                    checked
                      ? "bg-[#FFD700] text-black shadow-[0_10px_30px_rgba(255,193,7,0.5)] hover:bg-[#FFD700]/100 cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                <Lock size={16} />
                {resolvedAdvancePay !== null
                  ? `Proceed to Pay ₹${resolvedAdvancePay.toLocaleString()}`
                  : "Proceed to Payment"}
              </motion.button>

              {/* MICRO TRUST TEXT */}
              <p className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-gray-500 text-center">
                🔒 Secure payment · 100% safe & encrypted
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
