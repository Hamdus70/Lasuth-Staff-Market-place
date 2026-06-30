import React from "react";
import { Listing } from "../types";
import { ShieldAlert, ShieldCheck, Tag, ShoppingBag, Eye, Heart } from "lucide-react";

interface ListingCardProps {
  key?: string;
  listing: Listing;
  onViewDetails: (listing: Listing) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (listing: Listing) => void;
}

export default function ListingCard({
  listing,
  onViewDetails,
  isWishlisted = false,
  onToggleWishlist
}: ListingCardProps) {
  const isSold = listing.status === "sold";

  // Formatter for Naira currency
  const formatNaira = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      id={`listing-card-${listing.id}`}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand-accent transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
    >
      {/* Visual Sold Overlay */}
      {isSold && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-white p-4">
          <div className="bg-slate-900 border border-slate-700/80 px-4 py-2 rounded-xl text-center transform rotate-[-6deg] shadow-2xl">
            <span className="block text-xs uppercase font-semibold text-slate-400 tracking-wider">Item Status</span>
            <span className="block text-lg font-bold text-brand-accent tracking-tight">HANDOVER DONE</span>
          </div>
        </div>
      )}

      {/* Product Image Panel */}
      <div className="relative h-48 bg-slate-50 overflow-hidden">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
            <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
          </div>
        )}

        {/* Condition Badge (Floating) */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 border border-slate-100 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm">
          {listing.condition}
        </span>

        {/* Category Badge (Floating Right) */}
        <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-wide uppercase">
          {listing.category.split(" & ")[0]}
        </span>

        {/* Saved for Later Floating Button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(listing);
            }}
            className={`absolute bottom-3 right-3 p-1.5 rounded-full backdrop-blur-md border shadow-sm transition-all duration-200 z-20 cursor-pointer ${
              isWishlisted
                ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                : "bg-white/80 border-slate-100 text-slate-500 hover:bg-white"
            }`}
            title={isWishlisted ? "Remove from Saved for Later" : "Save for Later"}
          >
            <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-rose-600 stroke-rose-600" : ""}`} />
          </button>
        )}
      </div>

      {/* Card Content body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Department & Ward badge & name */}
          <div className="flex flex-col gap-1 text-[10px] text-slate-500 mb-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50 truncate max-w-[170px]">
                {listing.sellerDepartment}
              </span>
              <span className="font-mono text-[9px] text-slate-400">{new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>
            {listing.sellerWard && (
              <div className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100/60 w-fit truncate">
                📍 {listing.sellerWard}
              </div>
            )}
          </div>

          <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-brand-primary transition-colors">
            {listing.title}
          </h3>
          
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[32px]">
            {listing.description}
          </p>
        </div>

        <div>
          {/* Price & AI Status row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Resale Price</span>
              <span className="text-base font-bold text-slate-900">{formatNaira(listing.price)}</span>
            </div>

            {/* AI Moderation Badge */}
            {listing.aiPassed ? (
              <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>AI SAFE</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-rose-600 bg-rose-50 border border-rose-100/50 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>BLOCKED</span>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={() => onViewDetails(listing)}
            className="w-full mt-4 flex items-center justify-center space-x-1.5 py-2 px-4 border border-slate-200 hover:border-brand-primary hover:bg-blue-50 text-slate-700 hover:text-brand-primary font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Review Specifications</span>
          </button>
        </div>
      </div>
    </div>
  );
}
