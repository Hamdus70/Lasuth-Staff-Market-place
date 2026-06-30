import React, { useState, useEffect, useRef } from "react";
import { Offer, UserProfile, ChatMessage, Listing, Transaction, HandoverZone } from "../types";
import { MessageSquare, Handshake, CheckCircle2, XCircle, Send, MessageCircle, ArrowRight, ShieldCheck, Phone, HelpCircle } from "lucide-react";

interface ChatPanelProps {
  currentUser: UserProfile;
  offers: Offer[];
  listings: Listing[];
  onAcceptOffer: (offer: Offer, handoverZone: HandoverZone) => void;
  onDeclineOffer: (offer: Offer) => void;
  onSendMessage: (chatId: string, text: string) => void;
  messages: ChatMessage[];
}

export default function ChatPanel({
  currentUser,
  offers,
  listings,
  onAcceptOffer,
  onDeclineOffer,
  onSendMessage,
  messages
}: ChatPanelProps) {
  // Find all offers where the user is either buyer or seller
  const relevantOffers = offers.filter(
    (o) => o.buyerId === currentUser.uid || o.sellerId === currentUser.uid
  );

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [typedMessage, setTypedMessage] = useState("");
  const [selectedHandoverZone, setSelectedHandoverZone] = useState<HandoverZone>("Main Hospital Cafeteria");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Filter messages for the active selected chat
  const activeChatId = selectedOffer ? `${selectedOffer.listingId}_${selectedOffer.buyerId}_${selectedOffer.sellerId}` : "";
  const activeMessages = messages.filter((m) => m.chatId === activeChatId);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedOffer) return;

    onSendMessage(activeChatId, typedMessage.trim());
    setTypedMessage("");
  };

  const handleAccept = (offer: Offer) => {
    onAcceptOffer(offer, selectedHandoverZone);
  };

  const formatNaira = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div id="chat-panel-container" className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto h-[600px] bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden font-sans">
      
      {/* Left Column: Offers list */}
      <div className="border-r border-slate-100 flex flex-col justify-between h-full bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
            <MessageSquare className="h-4 w-4 text-teal-600" />
            <span>Resale Negotiations & Offers</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Active bargains for hospital inventory transactions</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {relevantOffers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <MessageCircle className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-xs font-semibold">No Offers on Ledger</p>
              <p className="text-[10px]">Submit counter-bids or bargains on clinical items to chat.</p>
            </div>
          ) : (
            relevantOffers.map((offer) => {
              const isSeller = offer.sellerId === currentUser.uid;
              const isSelected = selectedOffer?.id === offer.id;
              
              return (
                <button
                  key={offer.id}
                  onClick={() => setSelectedOffer(offer)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col space-y-2 cursor-pointer ${
                    isSelected
                      ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/10"
                      : "bg-white hover:bg-slate-50 border-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-white/20 text-white" : "bg-teal-50 text-teal-700"
                    }`}>
                      {isSeller ? "Incoming Sale Offer" : "My Bid"}
                    </span>
                    <span className="text-[8px] font-mono opacity-85">
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="truncate">
                    <h4 className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-slate-800"}`}>
                      {offer.listingTitle}
                    </h4>
                    <p className={`text-[10px] truncate ${isSelected ? "text-teal-100" : "text-slate-400"}`}>
                      {isSeller ? `From: ${offer.buyerName}` : `Seller: ${offer.sellerName}`}
                    </p>
                  </div>

                  <div className="flex justify-between items-center w-full pt-1.5 border-t border-dashed border-current/20">
                    <div>
                      <p className="text-[8px] uppercase tracking-wide opacity-80">Bid Price</p>
                      <p className="text-xs font-black font-mono">{formatNaira(offer.offerPrice)}</p>
                    </div>

                    <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      offer.status === "pending"
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        : offer.status === "accepted"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Middle + Right Column: Conversation room & Offer action console */}
      <div className="md:col-span-2 flex flex-col justify-between h-full bg-white relative">
        {selectedOffer ? (
          <>
            {/* Active chat header with offer stats & Accept Panel */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col space-y-4">
              
              {/* Product and prices info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">{selectedOffer.listingTitle}</h3>
                  <p className="text-[10px] text-slate-500">
                    Listed original value: {formatNaira(selectedOffer.originalPrice)} • Proposed offer:{" "}
                    <span className="font-bold text-teal-600 font-mono">{formatNaira(selectedOffer.offerPrice)}</span>
                  </p>
                </div>
                <span className="text-[9px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                  {selectedOffer.status}
                </span>
              </div>

              {/* Action Console: Seller accepts/declines proposal */}
              {selectedOffer.status === "pending" && selectedOffer.sellerId === currentUser.uid && (
                <div className="bg-white border border-teal-100 rounded-2xl p-4 shadow-sm space-y-3 animate-slide-in">
                  <div className="flex items-center space-x-1.5 text-teal-700 font-bold text-xs">
                    <ShieldCheck className="h-4.5 w-4.5 text-teal-600" />
                    <span>Approve Bargain & Choose Safe Handover Point</span>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    To accept this offer, pick a designated LASUTH safe handover location below where you can physically swap item and verification code safely.
                  </p>

                  <div className="flex gap-2">
                    <select
                      value={selectedHandoverZone}
                      onChange={(e) => setSelectedHandoverZone(e.target.value as HandoverZone)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Main Hospital Cafeteria">Main Hospital Cafeteria</option>
                      <option value="Fountain Garden Plaza">Fountain Garden Plaza</option>
                      <option value="College of Medicine Lawn">College of Medicine Lawn</option>
                      <option value="Admin Block Foyer">Admin Block Foyer</option>
                      <option value="Main Pharmacy Reception">Main Pharmacy Reception</option>
                      <option value="Accident & Emergency (A&E) Staff Lounge">A&E Staff Lounge</option>
                    </select>

                    <button
                      onClick={() => handleAccept(selectedOffer)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Accept & Generate Code</span>
                    </button>

                    <button
                      onClick={() => onDeclineOffer(selectedOffer)}
                      className="border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Console: Buyer waiting for accept */}
              {selectedOffer.status === "pending" && selectedOffer.buyerId === currentUser.uid && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 text-center text-[10px] text-amber-700 font-semibold leading-relaxed">
                  Bargain Offer Sent! Waiting for {selectedOffer.sellerName} to review. You can coordinate meeting times below.
                </div>
              )}

              {/* Action Console: Accepted offer directions */}
              {selectedOffer.status === "accepted" && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center text-xs text-emerald-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-bold">Deal Approved & Secured!</p>
                      <p className="text-[10px] text-slate-500">Go to Handovers tab to access the secure 4-digit swap PIN.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Private Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
              <span className="block text-center text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-2">
                Secure Hospital Coordination Ledger
              </span>

              {activeMessages.length === 0 ? (
                <div className="text-center text-[10px] text-slate-400 py-10 italic">
                  No messages yet. Send a message to organize handover details.
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${
                        isMe ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <span className="text-[8px] text-slate-400 font-semibold mb-0.5 px-1">
                        {isMe ? "You" : msg.senderName}
                      </span>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? "bg-slate-900 text-white rounded-tr-none"
                            : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[7px] text-slate-300 font-mono mt-0.5 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Messaging Input Footer */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder={`Send a private message to ${
                  selectedOffer.sellerId === currentUser.uid ? selectedOffer.buyerName : selectedOffer.sellerName
                }...`}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <MessageSquare className="h-12 w-12 text-slate-300 stroke-[1.2] mb-3" />
            <h4 className="font-bold text-slate-700 text-sm">Negotiation Room</h4>
            <p className="text-xs max-w-sm mt-1">
              Select an offer from the left-side list to view counter-bid details, agree on physical handover locations, or private-message.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
