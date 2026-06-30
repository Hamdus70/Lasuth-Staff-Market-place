import React, { useState } from "react";
import { Transaction, UserProfile } from "../types";
import { ShieldCheck, Lock, Unlock, Key, CheckCircle, AlertTriangle, AlertCircle, Phone, Landmark, MapPin, Sparkles } from "lucide-react";

interface HandoversListProps {
  currentUser: UserProfile;
  transactions: Transaction[];
  onCompleteTransaction: (transactionId: string) => void;
}

export default function HandoversList({
  currentUser,
  transactions,
  onCompleteTransaction
}: HandoversListProps) {
  // Filter transactions involving this user
  const relevantTransactions = transactions.filter(
    (t) => t.buyerId === currentUser.uid || t.sellerId === currentUser.uid
  );

  const [enteredCodes, setEnteredCodes] = useState<{ [txId: string]: string }>({});
  const [errors, setErrors] = useState<{ [txId: string]: string }>({});
  const [successTxId, setSuccessTxId] = useState<string | null>(null);

  const handleVerifyCode = (tx: Transaction) => {
    const txId = tx.id;
    const code = enteredCodes[txId]?.trim().toUpperCase();

    setErrors((prev) => ({ ...prev, [txId]: "" }));

    if (!code) {
      setErrors((prev) => ({ ...prev, [txId]: "Please enter the buyer's handover code." }));
      return;
    }

    if (code === tx.handoverCode.toUpperCase()) {
      onCompleteTransaction(txId);
      setSuccessTxId(txId);
      setTimeout(() => {
        setSuccessTxId(null);
      }, 5000);
    } else {
      setErrors((prev) => ({ ...prev, [txId]: "Invalid Security Code. Inspect item and ask buyer for correct code." }));
    }
  };

  const handleCodeChange = (txId: string, value: string) => {
    setEnteredCodes((prev) => ({ ...prev, [txId]: value }));
  };

  const formatNaira = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div id="handovers-panel-container" className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-2">
        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-1.5">
          <ShieldCheck className="h-5.5 w-5.5 text-emerald-600" />
          LASUTH Safe Swap Coordination & Verification Ledger
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          To protect Lagos State University Teaching Hospital staff and secure institutional accountability, all swaps must happen inside designated hospital safe zones. Hand over the secure code ONLY when physically inspecting and taking possession of goods.
        </p>
      </div>

      <div className="space-y-4">
        {relevantTransactions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 shadow-md">
            <Lock className="h-12 w-12 text-slate-300 mx-auto stroke-[1.2] mb-3 animate-pulse" />
            <h4 className="font-bold text-slate-700 text-sm">No Active Handover Swaps</h4>
            <p className="text-xs max-w-sm mx-auto mt-1">
              Active handovers appear here once a direct swap is initiated or a bargaining offer is approved by the seller.
            </p>
          </div>
        ) : (
          relevantTransactions.map((tx) => {
            const isBuyer = tx.buyerId === currentUser.uid;
            const isPending = tx.status === "pending_handover";
            const isCompleted = tx.status === "completed";
            const isJustSucceeded = successTxId === tx.id;

            return (
              <div
                key={tx.id}
                id={`transaction-ledger-${tx.id}`}
                className={`bg-white rounded-3xl border shadow-md overflow-hidden transition-all duration-300 ${
                  isJustSucceeded
                    ? "border-emerald-500 ring-2 ring-emerald-100 scale-[1.01]"
                    : "border-slate-100"
                }`}
              >
                {/* Status top bar */}
                <div className={`px-6 py-2.5 flex justify-between items-center text-xs font-semibold ${
                  isCompleted 
                    ? "bg-emerald-50 text-emerald-800" 
                    : "bg-amber-50 text-amber-800"
                }`}>
                  <span className="flex items-center gap-1.5 font-sans">
                    <MapPin className="h-4 w-4" />
                    DESIGNATED SWAP ZONE: <strong className="font-extrabold">{tx.handoverZone}</strong>
                  </span>
                  <span className="uppercase font-mono tracking-widest text-[10px]">
                    {tx.status.replace("_", " ")}
                  </span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left block: Product summary */}
                  <div className="space-y-2">
                    <span className="block text-[8px] font-bold uppercase text-slate-400 tracking-wider">Product Ledger Entry</span>
                    <h4 className="font-black text-slate-900 text-sm">{tx.listingTitle}</h4>
                    <p className="text-xs text-slate-500 font-semibold font-mono">
                      Swap Value: <span className="text-teal-600 font-black">{formatNaira(tx.price)}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Date: {new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>

                  {/* Middle block: Contact details */}
                  <div className="space-y-2 border-t md:border-t-0 md:border-x border-slate-50 pt-4 md:pt-0 md:px-6">
                    <span className="block text-[8px] font-bold uppercase text-slate-400 tracking-wider">Counterparty Credentials</span>
                    <div className="text-xs space-y-1.5 font-sans text-slate-700">
                      <p>
                        Role: <strong>{isBuyer ? "Seller" : "Buyer"}</strong>
                      </p>
                      <p>
                        Name: <strong className="text-slate-900">{isBuyer ? tx.sellerName : tx.buyerName}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Right block: Secure swap code verification panel */}
                  <div className="space-y-4">
                    {isPending ? (
                      isBuyer ? (
                        /* Buyer Security Box (Displays code) */
                        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3 shadow-inner">
                          <div className="flex items-center space-x-2 text-amber-400">
                            <Lock className="h-4.5 w-4.5 text-amber-500" />
                            <span className="text-xs font-bold font-sans uppercase">Handover Verification Key</span>
                          </div>

                          <div className="text-center bg-slate-950/80 border border-slate-800/60 py-3 rounded-xl">
                            <span className="text-2xl font-black font-mono tracking-widest text-teal-400 select-all">
                              {tx.handoverCode}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 text-center leading-relaxed font-sans">
                            ⚠ DO NOT share this code over chat. Show this code to the seller physically in person ONLY after inspecting the items.
                          </p>
                        </div>
                      ) : (
                        /* Seller Security Box (Inputs code) */
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3">
                          <div className="flex items-center space-x-1.5 text-slate-800 font-bold text-xs">
                            <Key className="h-4.5 w-4.5 text-slate-600" />
                            <span>Verify Buyer Handover Code</span>
                          </div>

                          <p className="text-[10px] text-slate-500 leading-normal font-sans">
                            Once the buyer physically inspects and approves the item at the safe zone, ask them for their 4-digit code.
                          </p>

                          {errors[tx.id] && (
                            <p className="text-[10px] text-rose-600 font-bold">{errors[tx.id]}</p>
                          )}

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={enteredCodes[tx.id] || ""}
                              onChange={(e) => handleCodeChange(tx.id, e.target.value)}
                              placeholder="L-XXXX"
                              maxLength={6}
                              className="w-1/2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-teal-500 uppercase text-center text-slate-800"
                            />
                            <button
                              onClick={() => handleVerifyCode(tx)}
                              className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
                            >
                              Finalize Swap
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      /* Completed state */
                      <div className="bg-emerald-50 text-emerald-800 rounded-2xl p-4 border border-emerald-100 flex flex-col items-center justify-center text-center space-y-1">
                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                        <span className="text-xs font-extrabold uppercase font-sans">SWAP SECURED</span>
                        <p className="text-[10px] text-slate-500">
                          Accountability record logged at LASUTH gates.
                        </p>
                        {tx.completedAt && (
                          <span className="text-[8px] font-mono text-slate-400 mt-1">
                            {new Date(tx.completedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Celebration alert banner */}
                {isJustSucceeded && (
                  <div className="px-6 py-3 bg-emerald-600 text-white font-semibold text-xs flex items-center justify-between animate-pulse">
                    <span className="flex items-center gap-1.5 font-sans">
                      <Sparkles className="h-4.5 w-4.5" />
                      Hooray! Secure handover successfully validated. Item is officially marked as SOLD.
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
