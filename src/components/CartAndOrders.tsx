import React, { useState, useEffect } from "react";
import { Order, OrderStatus, UserProfile, Listing, InAppNotification, HandoverZone, WishlistItem } from "../types";
import { ShoppingCart, Landmark, ArrowRight, ShieldCheck, Lock, CheckCircle2, Phone, AlertCircle, Trash2, Calendar, ShoppingBag, X, Bell, Volume2, Sparkles, AlertTriangle, Heart, Bookmark } from "lucide-react";

interface CartAndOrdersProps {
  currentUser: UserProfile;
  cart: Listing[];
  onRemoveFromCart: (listingId: string) => void;
  onClearCart: () => void;
  onCheckout: (handoverZone: HandoverZone) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onVerifyOrderHandover: (orderId: string, enteredCode: string) => boolean;
  onlineUsers: string[];
  notifications: InAppNotification[];
  onMarkNotificationsAsRead: () => void;
  viewMode: "cart" | "orders";
  onClose?: () => void;
  wishlist: WishlistItem[];
  onToggleWishlist: (listing: Listing) => void;
  onAddToCart: (listing: Listing) => void;
  listings: Listing[];
}

export default function CartAndOrders({
  currentUser,
  cart,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  orders,
  onUpdateOrderStatus,
  onVerifyOrderHandover,
  onlineUsers,
  notifications,
  onMarkNotificationsAsRead,
  viewMode,
  onClose,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  listings
}: CartAndOrdersProps) {
  const [selectedHandoverZone, setSelectedHandoverZone] = useState<HandoverZone>("Main Hospital Cafeteria");
  const [enteredCodes, setEnteredCodes] = useState<{ [orderId: string]: string }>({});
  const [errors, setErrors] = useState<{ [orderId: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState<{ [orderId: string]: string }>({});
  const [activeSubTab, setActiveSubTab] = useState<"purchases" | "sales" | "wishlist">("purchases");

  const totalCartAmount = cart.reduce((sum, item) => sum + item.price, 0);

  // Filter orders relevant to this user
  const myPurchases = orders.filter((o) => o.buyerId === currentUser.uid);
  const mySales = orders.filter((o) => 
    o.items.some((item) => item.sellerId === currentUser.uid)
  );

  const formatNaira = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleVerifyCode = (order: Order) => {
    const code = enteredCodes[order.id]?.trim().toUpperCase();
    setErrors((prev) => ({ ...prev, [order.id]: "" }));
    setSuccessMsg((prev) => ({ ...prev, [order.id]: "" }));

    if (!code) {
      setErrors((prev) => ({ ...prev, [order.id]: "Please enter the buyer's handover code." }));
      return;
    }

    const success = onVerifyOrderHandover(order.id, code);
    if (success) {
      setSuccessMsg((prev) => ({ ...prev, [order.id]: "Verification successful! Order marked as Released & Fulfilled." }));
    } else {
      setErrors((prev) => ({ ...prev, [order.id]: "Invalid handover code. Please inspect the buyer's screen and try again." }));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto font-sans">
      {/* 1. SHOPPING CART VIEW MODE */}
      {viewMode === "cart" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 space-y-6 max-w-2xl mx-auto relative animate-fade-in">
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-brand-accent/15 text-brand-accent rounded-2xl">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Resale Shopping Cart</h2>
              <p className="text-xs text-slate-400 font-medium">Lagos State University Teaching Hospital Staff Marketplace</p>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <ShoppingBag className="h-16 w-16 text-slate-200 mx-auto stroke-[1]" />
              <h3 className="font-bold text-slate-700 text-sm">Your Cart is Currently Empty</h3>
              <p className="text-xs max-w-sm mx-auto">
                Explore the marketplace listings to add diagnostic tools, textbook guides, medical gear, or office gadgets to your pipeline.
              </p>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="mt-2 bg-brand-primary text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  Start Browsing
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart items list */}
              <div className="max-h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200/50 flex-shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400">
                            <ShoppingBag className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{item.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{item.sellerName} • {item.sellerDepartment}</p>
                        <p className="text-[10px] text-brand-primary font-bold mt-0.5">{formatNaira(item.price)}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => onRemoveFromCart(item.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Remove from Cart"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono text-slate-900">{formatNaira(totalCartAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-black text-slate-900 border-t border-slate-200/60 pt-2">
                  <span>Total Swap Value:</span>
                  <span className="font-mono text-teal-600 text-sm">{formatNaira(totalCartAmount)}</span>
                </div>
              </div>

              {/* Choose Handover Point */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Designated LASUTH Handover Zone
                </label>
                <select
                  value={selectedHandoverZone}
                  onChange={(e) => setSelectedHandoverZone(e.target.value as HandoverZone)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-accent focus:bg-white"
                >
                  <option value="Main Hospital Cafeteria">Main Hospital Cafeteria</option>
                  <option value="Fountain Garden Plaza">Fountain Garden Plaza</option>
                  <option value="College of Medicine Lawn">College of Medicine Lawn</option>
                  <option value="Admin Block Foyer">Admin Block Foyer</option>
                  <option value="Main Pharmacy Reception">Main Pharmacy Reception</option>
                  <option value="Accident & Emergency (A&E) Staff Lounge">Accident & Emergency (A&E) Staff Lounge</option>
                </select>
                <p className="text-[10px] text-slate-400 italic">
                  * Lagos State University Teaching Hospital Safe Exchange Protocol. Exchange in person inside designated secure areas.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClearCart}
                  className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => onCheckout(selectedHandoverZone)}
                  className="w-2/3 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Lock className="h-4 w-4" />
                  <span>Execute Checkout Pipeline</span>
                </button>
              </div>

              {/* Saved for Later (Wishlist) inside Cart Modal */}
              <div className="border-t border-slate-100 pt-4 mt-6">
                <div className="flex items-center space-x-2 text-slate-800 mb-3">
                  <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Saved for Later ({wishlist.length})</span>
                </div>

                {wishlist.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">
                    No items saved for later yet. Tap the heart on listings to track items here.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {wishlist.map((item) => {
                      const listing = listings.find((l) => l.id === item.listingId);
                      if (!listing) return null;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200/50 flex-shrink-0 overflow-hidden">
                              {listing.imageUrl ? (
                                <img
                                  src={listing.imageUrl}
                                  alt={listing.title}
                                  className="h-full w-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400">
                                  <ShoppingBag className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-bold text-slate-700 truncate">{listing.title}</h5>
                              <p className="text-[9px] text-brand-primary font-bold">{formatNaira(listing.price)}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                              onClick={() => {
                                onAddToCart(listing);
                                onToggleWishlist(listing);
                              }}
                              disabled={listing.status === "sold" || cart.some(c => c.id === listing.id)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9px] rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                            >
                              Move to Cart
                            </button>
                            <button
                              onClick={() => onToggleWishlist(listing)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 cursor-pointer"
                              title="Remove"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ORDERS / CHECKOUT LEDGER VIEW MODE */}
      {viewMode === "orders" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Landmark className="h-6 w-6 text-indigo-600" />
                E-Commerce Orders & Checkout Ledger
              </h2>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Track full state-transition history from Pending → Confirmed/Paid → Released/Fulfilled.
              </p>
            </div>

            {/* Tab switchers */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setActiveSubTab("purchases")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === "purchases"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                My Purchases ({myPurchases.length})
              </button>
              <button
                onClick={() => setActiveSubTab("sales")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === "sales"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Incoming Sales ({mySales.length})
              </button>
              <button
                onClick={() => setActiveSubTab("wishlist")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeSubTab === "wishlist"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Heart className={`h-3 w-3 ${activeSubTab === "wishlist" ? "fill-white stroke-white" : "text-slate-400"}`} />
                <span>Saved ({wishlist.length})</span>
              </button>
            </div>
          </div>

          {/* Active List */}
          <div className="space-y-4">
            {activeSubTab === "wishlist" ? (
              wishlist.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 shadow-md">
                  <Bookmark className="h-12 w-12 text-slate-300 mx-auto stroke-[1.2] mb-3" />
                  <h4 className="font-bold text-slate-700 text-sm">No Saved Items Found</h4>
                  <p className="text-xs max-w-sm mx-auto mt-1">
                    Your wishlist is currently empty. Feel free to browse listings and tap the heart icon to save products for later tracking.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => {
                    const listing = listings.find((l) => l.id === item.listingId);
                    if (!listing) return null;

                    const isSold = listing.status === "sold";
                    const isSellerOnline = onlineUsers.includes(listing.sellerId);

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
                      >
                        {/* Sold Overlay */}
                        {isSold && (
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-white p-4">
                            <span className="block text-xs uppercase font-semibold text-slate-400 tracking-wider">Status</span>
                            <span className="block text-base font-bold text-brand-accent">SOLD</span>
                          </div>
                        )}

                        <div className="relative h-40 bg-slate-50 overflow-hidden">
                          {listing.imageUrl ? (
                            <img
                              src={listing.imageUrl}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                              <ShoppingBag className="h-8 w-8" />
                            </div>
                          )}
                          <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-slate-800 border border-slate-100 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase shadow-sm">
                            {listing.condition}
                          </span>
                          <span className="absolute top-2.5 right-2.5 bg-slate-900/85 text-white px-2 py-0.5 rounded-full text-[8px] font-semibold tracking-wide uppercase">
                            {listing.category.split(" & ")[0]}
                          </span>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex justify-between items-center text-[9px] text-slate-400 mb-1">
                              <span className="font-semibold text-brand-primary bg-blue-50 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                                {listing.sellerDepartment}
                              </span>
                              <span>Saved {new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{listing.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{listing.description}</p>
                          </div>

                          <div className="border-t border-slate-50 pt-2.5">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="block text-[8px] text-slate-400 uppercase font-semibold">Resale Price</span>
                                <span className="text-xs font-bold text-slate-900">{formatNaira(listing.price)}</span>
                              </div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                isSellerOnline ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                              }`}>
                                {isSellerOnline ? "● Seller Online" : "○ Offline"}
                              </span>
                            </div>

                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => {
                                  onAddToCart(listing);
                                  onToggleWishlist(listing);
                                }}
                                disabled={isSold || cart.some(c => c.id === listing.id)}
                                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-[10px] rounded-lg transition-all cursor-pointer shadow-sm text-center"
                              >
                                {cart.some(c => c.id === listing.id) ? "In Cart" : "Move to Cart"}
                              </button>
                              <button
                                onClick={() => onToggleWishlist(listing)}
                                className="px-2 py-1.5 border border-slate-200 hover:bg-rose-50 hover:border-rose-100 text-slate-500 hover:text-rose-600 font-bold text-[10px] rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                title="Remove item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : ((activeSubTab === "purchases" ? myPurchases : mySales).length === 0) ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 shadow-md">
                <Lock className="h-12 w-12 text-slate-300 mx-auto stroke-[1.2] mb-3 animate-pulse" />
                <h4 className="font-bold text-slate-700 text-sm">No Active Orders Found</h4>
                <p className="text-xs max-w-sm mx-auto mt-1">
                  Active checkouts appear here as they transition through the secure e-commerce fulfillment steps.
                </p>
              </div>
            ) : (
              (activeSubTab === "purchases" ? myPurchases : mySales).map((order) => {
                const isBuyer = order.buyerId === currentUser.uid;
                const isPending = order.status === "Pending";
                const isPaid = order.status === "Confirmed/Paid";
                const isFulfilled = order.status === "Released/Fulfilled";

                // Seller is considered offline if their ID is not in onlineUsers list
                const mainSellerId = order.items[0]?.sellerId;
                const isSellerOnline = onlineUsers.includes(mainSellerId);

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl border shadow-md overflow-hidden transition-all duration-300 ${
                      isFulfilled ? "border-emerald-100" : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    {/* State timeline top bar */}
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="space-y-1">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">
                          ORDER TRANSACTION ID: <strong className="font-mono text-slate-600 select-all">{order.id}</strong>
                        </span>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs text-slate-500 font-semibold">
                            Placed: {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Unified state timeline visual tracker */}
                      <div className="flex items-center space-x-1 sm:space-x-2 text-[10px] font-bold">
                        <div className={`px-2 py-1 rounded-lg ${isPending ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-400"}`}>
                          1. Pending
                        </div>
                        <ArrowRight className="h-3 w-3 text-slate-300" />
                        <div className={`px-2 py-1 rounded-lg ${isPaid ? "bg-blue-100 text-blue-800" : isFulfilled ? "bg-slate-100 text-emerald-600 font-bold" : "bg-slate-100 text-slate-400"}`}>
                          2. Confirmed/Paid
                        </div>
                        <ArrowRight className="h-3 w-3 text-slate-300" />
                        <div className={`px-2 py-1 rounded-lg ${isFulfilled ? "bg-emerald-100 text-emerald-800 font-black" : "bg-slate-100 text-slate-400"}`}>
                          3. Released/Fulfilled
                        </div>
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left Block: Items list */}
                      <div className="space-y-3">
                        <span className="block text-[8px] font-bold uppercase text-slate-400 tracking-wider">Cart Products ({order.items.length})</span>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-2 min-w-0 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <div className="h-8 w-8 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-slate-400">
                                    <ShoppingBag className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-[11px] font-extrabold text-slate-800 truncate">{item.title}</h4>
                                <p className="text-[9px] text-slate-400 truncate">Seller: {item.sellerName} ({item.sellerDepartment})</p>
                              </div>
                              <span className="text-[10px] font-bold text-slate-600 font-mono shrink-0">{formatNaira(item.price)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                          <span className="text-[10px] font-bold text-slate-400">TOTAL SWAP PRICE:</span>
                          <span className="text-sm font-black text-indigo-600 font-mono">{formatNaira(order.totalAmount)}</span>
                        </div>
                      </div>

                      {/* Middle Block: Handover & Presence details */}
                      <div className="space-y-4 border-t md:border-t-0 md:border-x border-slate-50 pt-4 md:pt-0 md:px-6">
                        <div>
                          <span className="block text-[8px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Fulfillment Zone</span>
                          <span className="bg-teal-50 border border-teal-100 text-teal-800 text-[10px] font-black px-2.5 py-1 rounded-xl block w-fit">
                            📍 {order.handoverZone}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[8px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Counterparty Status</span>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-2">
                            <p className="text-xs text-slate-700">
                              Role: <strong className="font-bold">{isBuyer ? "Vendor/Seller" : "Buyer"}</strong>
                            </p>
                            <p className="text-xs text-slate-700">
                              Name: <strong className="font-extrabold text-slate-900">{isBuyer ? order.items[0]?.sellerName : order.buyerName}</strong>
                            </p>
                            
                            {/* Seller Real-Time Presence state */}
                            {isBuyer && (
                              <div className="flex items-center space-x-1.5 pt-1">
                                <span className={`h-2.5 w-2.5 rounded-full ${isSellerOnline ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSellerOnline ? "text-emerald-600" : "text-slate-400"}`}>
                                  {isSellerOnline ? "ONLINE NOW" : "OFFLINE / AWAY"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Block: State Actions Panel */}
                      <div className="space-y-3">
                        <span className="block text-[8px] font-bold uppercase text-slate-400 tracking-wider">Checkout Execution Area</span>
                        
                        {/* 1. Buyer Flow */}
                        {isBuyer && (
                          <div className="space-y-3">
                            {isPending && (
                              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-2">
                                <p className="text-[10px] text-amber-800 leading-normal font-sans">
                                  Your checkout pipeline is <strong>Pending</strong>. Please confirm you have initiated the linked bank transfer or cash swap with the vendor to activate the code.
                                </p>
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, "Confirmed/Paid")}
                                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition-all cursor-pointer"
                                >
                                  Confirm & Log Payment
                                </button>
                              </div>
                            )}

                            {isPaid && (
                              <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-slate-800 space-y-2.5 shadow-lg">
                                <div className="flex items-center space-x-1.5 text-amber-400">
                                  <Lock className="h-4 w-4" />
                                  <span className="text-[10px] font-bold uppercase tracking-wide">Fulfillment Swap PIN</span>
                                </div>
                                <div className="text-center bg-slate-950 py-2 rounded-lg border border-slate-800/80">
                                  <span className="text-xl font-black font-mono tracking-widest text-teal-400 select-all">
                                    {order.handoverCode}
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-400 text-center leading-normal">
                                  Show this 4-digit verification code to the seller physically at the safe zone ONLY after inspecting the item.
                                </p>
                              </div>
                            )}

                            {isFulfilled && (
                              <div className="bg-emerald-50 text-emerald-800 rounded-xl p-4 border border-emerald-100 flex flex-col items-center justify-center text-center space-y-1">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                <span className="text-xs font-black uppercase tracking-wide">FULFILLED</span>
                                <p className="text-[9px] text-slate-500">
                                  Handover verified. Item is officially yours!
                                </p>
                              </div>
                            )}

                            {/* OFFLINE COMMUNICATION FALLBACK */}
                            {isBuyer && !isFulfilled && (
                              <div className="pt-2 border-t border-dashed border-slate-200">
                                {!isSellerOnline ? (
                                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-2">
                                    <div className="flex items-center gap-1 text-rose-700 font-bold text-[10px]">
                                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                                      <span>Seller is Offline / Away</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 leading-normal">
                                      The seller has not responded or is currently offline. Exposing their verified hospital telephone fallback below to bridge communication gaps.
                                    </p>
                                    <a
                                      href={`tel:${order.items[0]?.sellerPhone || "08031234567"}`}
                                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Phone className="h-3.5 w-3.5" />
                                      <span>Call Seller: {order.items[0]?.sellerPhone}</span>
                                    </a>
                                  </div>
                                ) : (
                                  <p className="text-[9px] text-slate-400 italic text-center">
                                    Seller is online. You can chat with them inside Negotiations tab.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. Seller Flow */}
                        {!isBuyer && (
                          <div className="space-y-3">
                            {isPending && (
                              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-center text-[10px] text-amber-800 font-semibold leading-relaxed">
                                Awaiting buyer payment confirmation. Once the colleague logs their transaction reference, you can enter their handover PIN.
                              </div>
                            )}

                            {isPaid && (
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 space-y-2">
                                <div className="flex items-center space-x-1.5 text-slate-800 font-bold text-xs">
                                  <Lock className="h-4 w-4 text-indigo-600" />
                                  <span>Fulfill Swap PIN Verification</span>
                                </div>
                                <p className="text-[9px] text-slate-500 leading-normal">
                                  Meet the buyer at <strong>{order.handoverZone}</strong>. Once they approve the item, ask them for their 4-digit code.
                                </p>
                                
                                {errors[order.id] && (
                                  <p className="text-[9px] text-rose-600 font-extrabold">{errors[order.id]}</p>
                                )}
                                {successMsg[order.id] && (
                                  <p className="text-[9px] text-emerald-600 font-extrabold">{successMsg[order.id]}</p>
                                )}

                                <div className="flex gap-1.5 pt-1">
                                  <input
                                    type="text"
                                    value={enteredCodes[order.id] || ""}
                                    onChange={(e) => setEnteredCodes((prev) => ({ ...prev, [order.id]: e.target.value }))}
                                    placeholder="L-XXXX"
                                    maxLength={6}
                                    className="w-1/2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase text-center text-slate-800"
                                  />
                                  <button
                                    onClick={() => handleVerifyCode(order)}
                                    className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-lg transition-all cursor-pointer"
                                  >
                                    Verify & Fulfill
                                  </button>
                                </div>
                              </div>
                            )}

                            {isFulfilled && (
                              <div className="bg-emerald-50 text-emerald-800 rounded-xl p-4 border border-emerald-100 flex flex-col items-center justify-center text-center space-y-1">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                <span className="text-xs font-black uppercase tracking-wide">RELEASED & SOLD</span>
                                <p className="text-[9px] text-slate-500">
                                  Payment received, item released safely.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
