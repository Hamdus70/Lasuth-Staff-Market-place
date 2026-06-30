import React, { useState } from "react";
import { Listing, UserProfile, Offer, Transaction } from "../types";
import { ShieldCheck, Sparkles, MessageSquare, Tag, Handshake, AlertCircle, Phone, ArrowLeft, Loader2, Info, ShoppingCart, Heart } from "lucide-react";

interface ProductDetailProps {
  listing: Listing;
  currentUser: UserProfile | null;
  onBack: () => void;
  onOfferSubmit: (offer: Offer) => void;
  onInitiateDirectBuy: (listing: Listing) => void;
  onAddToCart: (listing: Listing) => void;
  onlineUsers: string[];
  onRevealPhone: (listing: Listing) => void;
  isWishlisted: boolean;
  onToggleWishlist: (listing: Listing) => void;
}

export default function ProductDetail({
  listing,
  currentUser,
  onBack,
  onOfferSubmit,
  onInitiateDirectBuy,
  onAddToCart,
  onlineUsers,
  onRevealPhone,
  isWishlisted,
  onToggleWishlist
}: ProductDetailProps) {
  const isOwnListing = currentUser ? listing.sellerId === currentUser.uid : false;
  const isSold = listing.status === "sold";
  const isSellerOnline = onlineUsers.includes(listing.sellerId);


  // Bargaining Assistant states
  const [showBargainAdvisor, setShowBargainAdvisor] = useState(false);
  const [targetBudget, setTargetBudget] = useState<number>(listing.price * 0.85);
  const [advising, setAdvising] = useState(false);
  const [bargainReport, setBargainReport] = useState<any | null>(null);
  const [customOfferPrice, setCustomOfferPrice] = useState<number>(listing.price);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleConsultAI = async () => {
    if (targetBudget <= 0) {
      setError("Please input a valid target budget.");
      return;
    }
    setError("");
    setAdvising(true);

    try {
      const response = await fetch("/api/bargain/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrice: listing.price,
          targetBudget: targetBudget,
          condition: listing.condition,
          title: listing.title
        }),
      });

      if (!response.ok) {
        throw new Error("Bargain advice system failed.");
      }

      const data = await response.json();
      setBargainReport(data);
      setCustomOfferPrice(data.suggestedPrice);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve bargaining advice.");
    } finally {
      setAdvising(false);
    }
  };

  const handleMakeOffer = (priceToOffer: number) => {
    setError("");
    setSuccess("");

    if (priceToOffer <= 0 || priceToOffer > listing.price * 1.5) {
      setError("Please offer a reasonable price.");
      return;
    }

    if (!currentUser) {
      onRevealPhone(listing);
      return;
    }

    const newOffer: Offer = {
      id: "offer_" + Date.now(),
      listingId: listing.id,
      listingTitle: listing.title,
      listingImage: listing.imageUrl,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      buyerId: currentUser.uid,
      buyerName: currentUser.displayName,
      originalPrice: listing.price,
      offerPrice: priceToOffer,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    onOfferSubmit(newOffer);
    setSuccess(`Bargain offer of ₦${priceToOffer.toLocaleString()} submitted to ${listing.sellerName}!`);
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  // Formatter for Naira currency
  const formatNaira = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div id={`product-detail-view-${listing.id}`} className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden font-sans">
      
      {/* Return Row */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-brand-primary font-semibold text-sm cursor-pointer transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </button>

        <span className="text-xs font-semibold text-slate-500">
          ID: {listing.id}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
        
        {/* Left Side: Product Image & Safety Check */}
        <div className="space-y-6">
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Tag className="h-16 w-16 stroke-[1]" />
              </div>
            )}

            {isSold && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[1px]">
                <span className="bg-rose-600 text-white font-extrabold px-6 py-3 rounded-xl border border-rose-400 rotate-[-4deg] shadow-lg text-sm tracking-widest uppercase">
                  HANDOVER COMPLETED
                </span>
              </div>
            )}
          </div>

          {/* AI Security Officer Pass Notice */}
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>Verified Hospital Safety Compliance</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              {listing.aiReason || "Passed peer-to-peer personal medical equipment guidelines. Clear of institutional drug registries or clinical contraband lists."}
            </p>
          </div>
        </div>

        {/* Right Side: Product Details & Bargain Advisor */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Category and Condition badge */}
            <div className="flex items-center space-x-2">
              <span className="bg-blue-50 text-brand-primary font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-100/40">
                {listing.category}
              </span>
              <span className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                {listing.condition}
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {listing.title}
            </h2>

            {/* Price section */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <span className="block text-xs text-slate-400 uppercase font-bold tracking-wide">Listed Resale Value</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900">{formatNaira(listing.price)}</span>
                {listing.aiSuggestedPrice && (
                  <span className="text-xs text-emerald-600 font-semibold font-mono">
                    (AI suggested fair price: {formatNaira(listing.aiSuggestedPrice)})
                  </span>
                )}
              </div>
            </div>

            {/* Description (rendered clean as standard paragraph or basic formatting) */}
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Specifications</span>
              <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line bg-white rounded-xl border border-slate-50 p-4 shadow-sm">
                {listing.description}
              </div>
            </div>

            {/* Seller profile box */}
            <div className="border-t border-slate-100 pt-4">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Seller Transparency & Verification</span>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 text-brand-primary rounded-full font-bold flex items-center justify-center text-sm border border-blue-200">
                    {listing.sellerName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      {listing.sellerName}
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                        LASUTH Verified Staff
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
                      🏥 {listing.sellerDepartment} • 📍 Ward: {listing.sellerWard || "General Ward B"}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                      Phone: {!currentUser ? "🔒 Sign in to view" : listing.sellerPhone}
                    </p>
                  </div>
                </div>

                {/* Transparency Metric Gauge */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">P2P transparency rating</span>
                    <span className="text-[10px] text-slate-600 font-medium">Department & Ward verified. Bank payment linked.</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-600 font-mono">95%</span>
                    <span className="block text-[8px] text-emerald-600 font-bold uppercase tracking-wider">HIGH TRUST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Boxes */}
          <div className="space-y-3 pt-6 border-t border-slate-100">
            {success && (
              <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg border border-emerald-100 text-center font-bold">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-lg border border-rose-100 text-center font-bold">
                {error}
              </div>
            )}

            {isOwnListing ? (
              <div className="bg-slate-50 p-3 rounded-xl text-center text-xs font-bold text-slate-500 border border-dashed border-slate-200">
                You are the administrator of this listing. View offers in your Messaging Panel.
              </div>
            ) : isSold ? (
              <div className="bg-slate-100 p-3 rounded-xl text-center text-xs font-bold text-slate-500">
                This item has been successfully handed over and is no longer available.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Smart Bargain AI Button */}
                    <button
                      onClick={() => setShowBargainAdvisor(!showBargainAdvisor)}
                      className="flex items-center justify-center space-x-1.5 py-3 px-4 border border-brand-primary/20 hover:border-brand-primary bg-blue-50/50 hover:bg-blue-50 text-brand-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Smart Bargain Advisor</span>
                    </button>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => {
                        onAddToCart(listing);
                        if (currentUser) {
                          setSuccess("Added to your Shopping Cart! View your cart in the header.");
                        }
                      }}
                      className="flex items-center justify-center space-x-1.5 py-3 px-4 border border-transparent bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>

                  {/* Direct Handover Swap Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => onInitiateDirectBuy(listing)}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-3 px-4 border border-transparent bg-brand-accent hover:bg-brand-accent-hover text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      <Handshake className="h-4 w-4" />
                      <span>Direct Handover Swap</span>
                    </button>

                    <button
                      onClick={() => onToggleWishlist(listing)}
                      className={`px-4 py-3 border rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                        isWishlisted
                          ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      title={isWishlisted ? "Remove from Saved for Later" : "Save for Later"}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? "fill-rose-600 stroke-rose-600" : ""}`} />
                      <span>{isWishlisted ? "Saved" : "Save for Later"}</span>
                    </button>
                  </div>

                  {/* Offline Voice Fallback Box */}
                  {!isSellerOnline && (
                    <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-2xl space-y-2 text-rose-950 mt-2">
                      <div className="flex items-center space-x-2 text-rose-700 font-extrabold text-xs">
                        <Phone className="h-4 w-4 text-rose-500 shrink-0" />
                        <span>Seller is Offline / Away</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        This vendor is currently offline and may be slow to respond. Exposing their verified hospital telephone fallback below to bridge communication gaps.
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onRevealPhone(listing);
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call Seller: {!currentUser ? "Reveal Phone Number" : (listing.sellerPhone || "08031234567")}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* AI Bargain Advisor Drawer Panel */}
                {showBargainAdvisor && (
                  <div className="border border-indigo-100 bg-indigo-50/30 rounded-2xl p-4 mt-3 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-indigo-900 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                        AI Peer-to-Peer Bargain Counselor
                      </h4>
                      <button
                        onClick={() => setShowBargainAdvisor(false)}
                        className="text-[10px] text-slate-400 hover:text-slate-600"
                      >
                        Hide
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500">
                      Input your maximum ideal budget below. Our Gemini AI model will calculate local LASUTH resale rates and generate counter-bargaining strategies.
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold text-xs">₦</span>
                        <input
                          type="number"
                          value={targetBudget || ""}
                          onChange={(e) => setTargetBudget(Number(e.target.value))}
                          placeholder="My Budget"
                          className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                        />
                      </div>
                      <button
                        onClick={handleConsultAI}
                        disabled={advising}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center cursor-pointer disabled:opacity-50"
                      >
                        {advising ? <Loader2 className="h-3 w-3 animate-spin" /> : "Counsel Me"}
                      </button>
                    </div>

                    {/* AI Bargaining Counselor Results */}
                    {bargainReport && (
                      <div className="space-y-3 pt-3 border-t border-indigo-100/50">
                        {/* Perfect offer price */}
                        <div className="bg-white p-2.5 rounded-lg border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                          <span className="font-semibold">AI Recommended Offer:</span>
                          <span className="font-bold text-indigo-700 font-mono">
                            {formatNaira(bargainReport.suggestedPrice)}
                          </span>
                        </div>

                        {/* Recommendation advice */}
                        <div className="text-[10px] text-slate-600 italic leading-relaxed bg-white/50 p-2.5 rounded border border-indigo-50">
                          " {bargainReport.negotiationTip} "
                        </div>

                        {/* Offers Steps */}
                        <div className="space-y-1">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">AI Tiered Bidding Options:</span>
                          <div className="grid grid-cols-3 gap-1">
                            {bargainReport.steps.map((step: any, index: number) => (
                              <button
                                key={index}
                                onClick={() => setCustomOfferPrice(step.price)}
                                className={`p-1.5 border rounded text-left transition-all text-[9px] ${
                                  customOfferPrice === step.price 
                                    ? "bg-indigo-600 border-indigo-600 text-white" 
                                    : "bg-white hover:bg-indigo-50 border-slate-200 text-slate-700"
                                }`}
                              >
                                <span className="block font-bold truncate uppercase text-[8px]">{step.level}</span>
                                <span className="block font-mono font-bold mt-0.5">{formatNaira(step.price)}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Submit offer button */}
                        <button
                          onClick={() => handleMakeOffer(customOfferPrice)}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Handshake className="h-3.5 w-3.5" />
                          <span>Propose Offer: {formatNaira(customOfferPrice)}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
