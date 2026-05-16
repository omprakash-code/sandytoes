"use client";

import Image from "next/image";
import { CheckCircle2, X } from "lucide-react";
import { Minus, Plus } from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Product, Variant } from "./types";
import { getVariantPriceMeta } from "./price";
import type { BookingItemSnapshot } from "@/context/BookingContext";
import { useBooking } from "@/context/BookingContext";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  getNumberDecorationLabel,
  isNumberDecorationProduct,
} from "@/lib/product-numbering";

type Props = {
  product: Product;
  selectedProducts: BookingItemSnapshot[];
};

export default function ProductCard({
  product,
  selectedProducts,
}: Props) {
  const { setBookingItems } = useBooking();
  const isDecorationCategory = product.category === "DECORATION";
  const isNumberDecoration = isNumberDecorationProduct({
    slug: product.slug,
    name: product.name,
  });
  const numberLabel = getNumberDecorationLabel({
    slug: product.slug,
    name: product.name,
  });

  /* -----------------------------
     Normalize variants
  ------------------------------ */
  const variants: Variant[] = Array.isArray(product.variants)
    ? product.variants
    : [];

  const defaultVariant = variants.find((variant) => variant.isDefault) ?? variants[0];

  const [activeVariant, setActiveVariant] =
    useState<Variant | undefined>(defaultVariant);
  const [showLedPrompt, setShowLedPrompt] = useState(false);
  const [draftLedNumber, setDraftLedNumber] = useState("");

  /* -----------------------------
     Existing item lookup
  ------------------------------ */
  const existing = selectedProducts.find(
    (i) =>
      i.productId === product.id &&
      i.variantId === activeVariant?.id
  );

  const quantity = existing?.quantity ?? 0;
  const hasLedNumber = Boolean(existing?.ledNumber?.trim());

  /* -----------------------------
     Local-only update (NO API)
  ------------------------------ */
  const updateQuantity = (nextQty: number) => {
    if (!activeVariant) return;

    setBookingItems((prev) =>
      upsertItem({
        prev,
        product,
        variant: activeVariant,
        quantity: nextQty,
      })
    );
  };

  const maxAllowed = activeVariant
    ? getVariantMaxAllowed(activeVariant, isDecorationCategory)
    : 0;
  const outOfStock = maxAllowed <= 0;
  const reachedLimit = quantity >= maxAllowed && maxAllowed > 0;

  const increment = () => {
    if (outOfStock) {
      toast.error("This item is currently out of stock.");
      return;
    }

    if (reachedLimit) {
      toast.error(
        isDecorationCategory
          ? "Only one unit can be added for this decoration."
          : `You can add up to ${maxAllowed} units for this item.`
      );
      return;
    }

    updateQuantity(isDecorationCategory ? 1 : quantity + 1);
  };
  const decrement = () => updateQuantity(Math.max(quantity - 1, 0));
  const toggleDecoration = () =>
    updateQuantity(quantity > 0 ? 0 : 1);
  const handleAdd = () => {
    increment();
    if (isNumberDecoration) {
      setDraftLedNumber(existing?.ledNumber ?? "");
      setShowLedPrompt(true);
    }
  };
  const openLedPrompt = () => {
    setDraftLedNumber(existing?.ledNumber ?? "");
    setShowLedPrompt(true);
  };
  const updateLedNumber = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 3);

    if (!existing) return;

    setBookingItems((prev) =>
      prev.map((item) =>
        item.productId === product.id && item.variantId === activeVariant?.id
          ? { ...item, ledNumber: clean || undefined }
          : item
      )
    );
  };

  if (!activeVariant) return null;
  const priceMeta = getVariantPriceMeta(activeVariant);

  /* -----------------------------
     Render
  ------------------------------ */
  return (
    <div className="h-full min-w-0 bg-white rounded-xl sm:rounded-2xl border border-black/10 p-2 sm:p-4 flex flex-col hover:shadow-md transition">
      <div className="relative w-full aspect-[4/3] rounded-md sm:rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
          className="object-cover"
        />
      </div>

      <div className="mt-2 sm:mt-3 flex items-start justify-between gap-1.5 sm:gap-2 min-w-0">
        <h4 className="min-w-0 text-xs sm:text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
          {product.name}
        </h4>

        {isNumberDecoration && quantity > 0 && hasLedNumber && (
          <button
            type="button"
            onClick={openLedPrompt}
            className="shrink-0 rounded-full border border-gray-300 bg-gray-50 px-2 py-1 text-[10px] sm:text-[11px] font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            {numberLabel}: {existing?.ledNumber}
          </button>
        )}
      </div>

      {product.description && (
        <p className="hidden text-[11px] sm:text-xs text-gray-500 mt-1 line-clamp-2">
          {product.description}
        </p>
      )}

      {/* Variants */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
        {variants.map((v) => {
          const active = v.id === activeVariant.id;

          return (
            <button
              key={v.id}
              onClick={() => setActiveVariant(v)}
              disabled={variants.length === 1}
              className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] border transition
                ${active
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-700 hover:border-gray-500"
                }
                ${variants.length === 1 ? "cursor-default opacity-80" : ""}
              `}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Price + Controls */}
      <div className="mt-auto pt-2 sm:pt-3 grid grid-cols-[1fr_auto] items-end gap-1.5 sm:gap-2">
        <div>
          <p className="text-[10px] sm:text-xs text-gray-500">Price</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <p className="text-[15px] sm:text-lg font-bold text-gray-900 leading-none">
              ₹{priceMeta.displayPrice}
            </p>
            {priceMeta.hasDiscount && (
              <>
                <p className="text-[10px] sm:text-xs text-gray-400 line-through leading-none">
                  ₹{priceMeta.regularPrice}
                </p>
                <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-emerald-700 leading-none">
                  {priceMeta.savingsPercent}% OFF
                </span>
              </>
            )}
          </div>
          {outOfStock ? (
            <p className="mt-1 text-[10px] sm:text-xs text-gray-500">Out of stock</p>
          ) : null}
        </div>

        <div className="relative h-8 sm:h-9 w-[74px] sm:w-[88px] shrink-0">
          <AnimatePresence initial={false}>
            {quantity === 0 ? (
              <motion.button
                key="add"
                type="button"
                onClick={handleAdd}
                title="Add item"
                aria-label="Add item"
                disabled={outOfStock}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="absolute inset-0 h-full w-full rounded-full bg-black text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-0.5 cursor-pointer select-none shadow-sm hover:shadow-md active:shadow-inner transition-shadow disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
              >
                <Plus size={12} />
                {outOfStock ? "Out" : "Add"}
              </motion.button>
            ) : isDecorationCategory ? (
              <motion.button
                key="added"
                type="button"
                onClick={toggleDecoration}
                title="Remove item"
                aria-label="Remove item"
                disabled={outOfStock && quantity === 0}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="absolute inset-0 h-full w-full rounded-full border border-gray-300 bg-white text-gray-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-0.5 cursor-pointer select-none shadow-sm hover:bg-gray-100 transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              >
                <CheckCircle2 size={12} className="text-black" />
                Added
              </motion.button>
            ) : (
              <motion.div
                key="qty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="absolute inset-0 h-full w-full flex items-center justify-between rounded-full border border-gray-300 bg-white px-0.5 shadow-sm"
              >
                <button
                  type="button"
                  onClick={decrement}
                  title="Decrease quantity"
                  aria-label="Decrease quantity"
                  className="h-5 w-5 sm:h-6 sm:w-6 aspect-square flex items-center justify-center rounded-full border border-gray-200/80 bg-gray-50/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] leading-none cursor-pointer text-gray-700 hover:bg-gray-100 active:bg-gray-200 active:scale-[0.97] transition"
                >
                  <Minus size={10} />
                </button>

                <span className="font-semibold text-[11px] sm:text-xs select-none leading-none">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increment}
                  title="Increase quantity"
                  aria-label="Increase quantity"
                  disabled={outOfStock || reachedLimit}
                  className="h-5 w-5 sm:h-6 sm:w-6 aspect-square flex items-center justify-center rounded-full border border-gray-200/80 bg-gray-50/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] leading-none cursor-pointer text-gray-700 hover:bg-gray-100 active:bg-gray-200 active:scale-[0.97] transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={11} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showLedPrompt && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {numberLabel}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add age/number for this decoration.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLedPrompt(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                value={draftLedNumber}
                onChange={(e) =>
                  setDraftLedNumber(e.target.value.replace(/\D/g, "").slice(0, 3))
                }
                placeholder="e.g. 25"
                className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    updateLedNumber(draftLedNumber);
                    setShowLedPrompt(false);
                  }}
                  className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-gray-900 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -----------------------------
   Pure helper (SAFE)
------------------------------ */
function upsertItem({
  prev,
  product,
  variant,
  quantity,
}: {
  prev: BookingItemSnapshot[];
  product: Product;
  variant: Variant;
  quantity: number;
}): BookingItemSnapshot[] {
  const items = [...prev];
  const priceMeta = getVariantPriceMeta(variant);
  const unitPrice = priceMeta.displayPrice;

  const index = items.findIndex(
    (i) =>
      i.productId === product.id &&
      i.variantId === variant.id
  );

  if (quantity === 0) {
    if (index !== -1) items.splice(index, 1);
    return items;
  }

  const totalPrice = unitPrice * quantity;

  if (index !== -1) {
    items[index] = {
      ...items[index],
      quantity,
      totalPrice,
    };
  } else {
    items.push({
      id: nanoid(), // temp UI id
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      productImage: product.image,
      productSlug: product.slug,
      variantLabel: variant.label,
      category: product.category,
      unitPrice,
      quantity,
      totalPrice,
    });
  }

  return items;
}

function getVariantMaxAllowed(
  variant: Variant,
  isDecorationCategory: boolean
): number {
  const stockCap = Math.max(Number(variant.stock ?? 0), 0);
  if (stockCap <= 0) return 0;

  if (isDecorationCategory) {
    return Math.min(stockCap, 1);
  }
  return stockCap;
}
