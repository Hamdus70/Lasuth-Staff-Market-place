import React, { useState } from "react";
import { CreditCard, CheckCircle, Shield, ArrowRight, Loader2, RefreshCw } from "lucide-react";

interface CheckoutPlaygroundProps {
  session: {
    reference: string;
    amount: number;
    feeApplied: number;
    email: string;
    buyerId: string;
    sellerId: string;
    orderId: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutPlayground({ session, onClose, onSuccess }: CheckoutPlaygroundProps) {
  const [cardNumber, setCardNumber] = useState("4000 1234 5678 9010");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [pin, setPin] = useState("1952");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"details" | "pin" | "success">("details");
  const [error, setError] = useState("");

  const baseAmount = session.amount - (session.feeApplied || 50);

  const handlePay = async () => {
    setIsProcessing(true);
    setError("");
    
    try {
      // Simulate typical banking processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("pin");
    } catch (err) {
      setError("Payment authorization failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuthorizePIN = async () => {
    if (!pin || pin.length < 4) {
      setError("Please input a valid 4-digit bank card PIN.");
      return;
    }
    
    setIsProcessing(true);
    setError("");

    try {
      // Hit our sandbox payment trigger endpoint to finalize orders and dispatch real-time events
      const response = await fetch("/api/payments/sandbox-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: session.reference,
          metadata: {
            buyerId: session.buyerId,
            sellerId: session.sellerId,
            orderId: session.orderId,
            baseAmount: baseAmount,
            buyerTotal: session.amount,
            sellerPayout: baseAmount - (session.feeApplied || 50)
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setStep("success");
      } else {
        setError("Escrow credit mapping failed.");
      }
    } catch (err) {
      setError("Transaction handshake failed. Secure network timed out.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col relative animate-scale-in">
        
        {/* Paystack Header mockup */}
        <div className="bg-slate-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="h-6 w-6 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-xs text-black">
              P
            </span>
            <div>
              <h3 className="text-xs font-black tracking-tight uppercase flex items-center space-x-1">
                <span>Paystack</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/25">Secure Gateway</span>
              </h3>
              <p className="text-[10px] text-slate-400">Merchant: LASUTH Marketplace Escrow</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 block font-semibold">TOTAL TRANSACTION</span>
            <span className="text-sm font-black text-emerald-400 font-mono">₦{session.amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6 flex-1 flex flex-col justify-between min-h-[300px]">
          
          {step === "details" && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Base Resale Cost:</span>
                  <span className="font-bold font-mono text-slate-800">₦{baseAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Escrow Split Fee:</span>
                  <span className="font-bold font-mono text-emerald-600">+ ₦{session.feeApplied.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-200/60 my-1"></div>
                <div className="flex justify-between text-slate-800 font-bold">
                  <span>Gross Cost:</span>
                  <span className="font-mono text-slate-950">₦{session.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Debit/Credit Card Credentials</h4>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Card Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <input 
                      type="text" 
                      value={cardNumber} 
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Expiry Date</label>
                    <input 
                      type="text" 
                      value={expiry} 
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">CVV Suffix</label>
                    <input 
                      type="password" 
                      value={cvv} 
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-[10px] font-bold text-rose-600 text-center">{error}</p>
              )}

              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePay}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/10"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authorizing transaction...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed with Secure Payment</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === "pin" && (
            <div className="space-y-5 py-4">
              <div className="text-center space-y-1">
                <Shield className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Cardholder PIN Authorization</h4>
                <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Institutional compliance mandates 4-digit card validation for hospital personnel marketplace trades.</p>
              </div>

              <div className="max-w-[120px] mx-auto">
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full text-center py-3 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl text-lg font-black tracking-widest focus:outline-none focus:bg-white text-slate-800"
                />
              </div>

              {error && (
                <p className="text-[10px] font-bold text-rose-600 text-center">{error}</p>
              )}

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleAuthorizePIN}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Validating card PIN...</span>
                    </>
                  ) : (
                    <span>Authorize Transaction</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Back to Card Credentials
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-6 py-6">
              <div className="space-y-2">
                <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-base font-black text-slate-900">₦{session.amount.toLocaleString()} Checkout Successful</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Escrow split fee mapped perfectly. Immutable transaction written to Firestore logs. Seller notified via Websockets.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all"
              >
                Return to Marketplace Ledger
              </button>
            </div>
          )}

        </div>

        {/* Paystack footer */}
        <div className="bg-slate-50 px-6 py-3 flex items-center justify-center space-x-1.5 border-t border-slate-100 text-[9px] text-slate-400 font-medium">
          <Shield className="h-3 w-3 text-slate-400" />
          <span>Paystack Merchant ID: 0448236337 • LASUTH Internal Trades Portal</span>
        </div>
      </div>
    </div>
  );
}
