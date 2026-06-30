import React, { useState, useEffect } from "react";
import { CATEGORIES, CONDITIONS, MASTER_CATALOG, LASUTH_WARDS } from "../mockData";
import { Listing, UserProfile, ListingCategory, ItemCondition, MasterCatalogItem } from "../types";
import { Sparkles, ShieldCheck, ShieldAlert, Loader2, ArrowRight, HelpCircle, Save, X, Image as ImageIcon, Upload, Check, AlertCircle as AlertIcon } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";

interface ListingFormProps {
  currentUser: UserProfile;
  onClose: () => void;
  onSuccess: (newListing: Listing) => void;
}

// Preset visual assets to make it look premium
const PRESET_IMAGES = [
  { name: "Littmann Stethoscope", url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600" },
  { name: "Medical Scrubs", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600" },
  { name: "Surgical textbook", url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600" },
  { name: "Kitchen Airfryer", url: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=600" },
  { name: "iPad Tablet", url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600" },
  { name: "Clinical Otoscope", url: "https://images.unsplash.com/photo-1603398938378-e54eab446ddd?auto=format&fit=crop&q=80&w=600" }
];

export default function ListingForm({ currentUser, onClose, onSuccess }: ListingFormProps) {
  const [catalogItemId, setCatalogItemId] = useState<string>(MASTER_CATALOG[0].id);
  const [title, setTitle] = useState(MASTER_CATALOG[0].title);
  const [category, setCategory] = useState<ListingCategory>(MASTER_CATALOG[0].category);
  const [condition, setCondition] = useState<ItemCondition>("Gently Used");
  const [price, setPrice] = useState<number>(MASTER_CATALOG[0].avgPrice);
  const [description, setDescription] = useState(MASTER_CATALOG[0].description);
  const [imageUrl, setImageUrl] = useState(MASTER_CATALOG[0].imageUrl);
  const [sellerWard, setSellerWard] = useState<string>(currentUser.ward || LASUTH_WARDS[0]);

  // Cloud Storage Image Upload Pipeline states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleImageFile = (file: File) => {
    if (!file) return;
    
    // Check type
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setUploadError("Invalid file type. Please upload a JPEG or PNG image.");
      return;
    }
    
    // Check size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 5MB.");
      return;
    }
    
    setUploadError("");
    setUploadProgress(0);
    
    const fileRef = ref(storage, `listings/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);
    
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        console.error("Storage upload error:", error);
        setUploadError("Image upload failed: " + error.message);
        setUploadProgress(null);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(downloadUrl);
          setUploadProgress(null);
        } catch (urlErr: any) {
          setUploadError("Failed to retrieve image URL: " + urlErr.message);
          setUploadProgress(null);
        }
      }
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };
  
  // Update fields when catalog item is selected
  const handleCatalogItemChange = (id: string) => {
    setCatalogItemId(id);
    const item = MASTER_CATALOG.find((m) => m.id === id);
    if (item) {
      setTitle(item.title);
      setCategory(item.category);
      setDescription(item.description);
      setImageUrl(item.imageUrl);
      setPrice(item.avgPrice);
    }
  };
  
  // AI Validation phase state
  const [isValidating, setIsValidating] = useState(false);
  const [validationRun, setValidationRun] = useState(false);
  const [aiPassed, setAiPassed] = useState(true);
  const [aiReason, setAiReason] = useState("");
  const [aiSuggestedPrice, setAiSuggestedPrice] = useState<number | null>(null);
  const [aiEnhancedDesc, setAiEnhancedDesc] = useState("");
  const [error, setError] = useState("");

  const handleValidate = async () => {
    if (!title.trim() || price <= 0 || !description.trim()) {
      setError("Please fill out Title, Price, and Description before auditing.");
      return;
    }
    setError("");
    setIsValidating(true);
    setValidationRun(false);

    try {
      const response = await fetch("/api/listings/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price,
          category,
          condition
        }),
      });

      if (!response.ok) {
        throw new Error("Validation service failed. Verify connection.");
      }

      const data = await response.json();
      setAiPassed(data.passedPolicy);
      setAiReason(data.reason);
      setAiSuggestedPrice(data.suggestedPrice);
      setAiEnhancedDesc(data.enhancedDescription);
      setValidationRun(true);
    } catch (err: any) {
      setError(err.message || "Failed to audit listing. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyAIEnhancement = () => {
    if (aiEnhancedDesc) {
      setDescription(aiEnhancedDesc);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationRun || !aiPassed) {
      setError("Item must pass the institutional safety review prior to publication.");
      return;
    }

    const finalImage = imageUrl || PRESET_IMAGES[0].url;
    const selectedCatalogItem = MASTER_CATALOG.find((m) => m.id === catalogItemId);
    const subcategory = selectedCatalogItem?.subcategory;

    const newListing: Listing = {
      id: "list_" + Date.now(),
      catalogItemId,
      title,
      description,
      price: Number(price),
      category,
      subcategory,
      condition,
      sellerId: currentUser.uid,
      sellerName: currentUser.displayName,
      sellerDepartment: currentUser.department,
      sellerWard,
      sellerPhone: currentUser.phone,
      imageUrl: finalImage,
      status: "active",
      aiPassed,
      aiReason,
      aiSuggestedPrice: aiSuggestedPrice || undefined,
      aiEnhancedDesc: aiEnhancedDesc || undefined,
      createdAt: new Date().toISOString(),
    };

    onSuccess(newListing);
  };

  return (
    <div id="listing-form-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
        
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-teal-600" />
              Institutional Safety Listing Portal
            </h3>
            <p className="text-xs text-slate-500">Every item must undergo automatic AI policy check against clinical contraband.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 transition-all text-slate-400 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-lg border border-rose-100 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Decoupled Catalog Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Master Catalog Item
              </label>
              <select
                value={catalogItemId}
                onChange={(e) => handleCatalogItemChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
              >
                {MASTER_CATALOG.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.category}] {item.title} (Avg: ₦{item.avgPrice.toLocaleString()})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Your listing will be aggregated under this catalog item to ensure decoupled discovery.
              </p>
            </div>

            {/* Custom Resale Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product Title / Resale Specifier
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Littmann Classic Stethoscope (Navy)"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Specify your items attributes, color, or sizing here.</p>
            </div>

            {/* Row 2: Category, Condition & Clinical Ward */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Catalog Category
                </label>
                <input
                  type="text"
                  value={category}
                  disabled
                  className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Physical Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ItemCondition)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Your Stationed Ward
                </label>
                <select
                  value={sellerWard}
                  onChange={(e) => setSellerWard(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                >
                  {LASUTH_WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Price in Naira */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Listing Price (₦)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-bold text-sm">
                  ₦
                </span>
                <input
                  type="number"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="25000"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Resale prices are usually evaluated by AI to prevent exploitation.</p>
            </div>

            {/* Row 4: Cloud Media Hosting Pipeline */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Listing Image (Cloud Upload or Preset)
              </label>
              
              {/* Drag and Drop Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                  dragActive ? "border-teal-500 bg-teal-50/30" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                } relative overflow-hidden`}
              >
                <input 
                  type="file"
                  id="image-file-input"
                  accept="image/jpeg,image/png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                
                {uploadProgress !== null ? (
                  <div className="space-y-2 py-2">
                    <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Uploading to Firebase Cloud Storage...</p>
                    <div className="w-full max-w-xs mx-auto bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{uploadProgress}%</span>
                  </div>
                ) : imageUrl ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="h-20 w-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative animate-fade-in">
                      <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                        <Check className="h-5 w-5 text-emerald-600 bg-white rounded-full p-0.5 shadow" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Image uploaded & securely hosted!</p>
                    <label 
                      htmlFor="image-file-input" 
                      className="text-[10px] font-bold text-teal-600 hover:text-teal-700 underline cursor-pointer"
                    >
                      Replace image file
                    </label>
                  </div>
                ) : (
                  <label htmlFor="image-file-input" className="cursor-pointer space-y-1.5 block py-4">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Drag & drop your item photo here</p>
                    <p className="text-[10px] text-slate-400">or click to browse from device (JPEG/PNG, max 5MB)</p>
                  </label>
                )}
                
                {uploadError && (
                  <div className="absolute bottom-2 inset-x-0 flex items-center justify-center space-x-1 text-rose-500 text-[10px] font-bold">
                    <AlertIcon className="h-3 w-3" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Or Select Preset Images for ease */}
              <div>
                <p className="text-[10px] text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Or use a high-quality preset template:</p>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_IMAGES.map((img) => {
                    const isSelected = imageUrl === img.url;
                    return (
                      <button
                        key={img.name}
                        type="button"
                        onClick={() => {
                          setImageUrl(img.url);
                          setUploadError("");
                        }}
                        className={`relative h-11 rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected ? "border-teal-500 ring-2 ring-teal-200 scale-95" : "border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-x-0 bottom-0 bg-slate-900/40 text-[7px] text-white py-0.5 text-center truncate px-0.5">
                          {img.name.split(" ")[1] || img.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 5: Original Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Resale Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give a quick summary of the item, condition, any flaws, and details about sanitation (scrubs/uniforms/scopes)."
                rows={4}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
                required
              />
            </div>

            {/* AI Audit & Safety Check Panel */}
            <div className="border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={handleValidate}
                disabled={isValidating}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-teal-200 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 hover:text-teal-800 text-teal-700 font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Gemini Security Officer is Auditing Policy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Verify Listing with AI Security Auditor</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Validation Result Box */}
            {validationRun && (
              <div className={`p-4 rounded-2xl border ${
                aiPassed ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
              } space-y-3 animate-fade-in`}>
                
                {/* Result Title */}
                <div className="flex items-center space-x-2">
                  {aiPassed ? (
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-rose-600" />
                  )}
                  <h4 className={`text-sm font-bold ${
                    aiPassed ? "text-emerald-800" : "text-rose-800"
                  }`}>
                    {aiPassed ? "✓ Approved for Internal Resale" : "⚠ SECURITY BLOCK: Institutional Policy Violation"}
                  </h4>
                </div>

                {/* Safety justification */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {aiReason}
                </p>

                {aiPassed && (
                  <div className="space-y-3 pt-2 border-t border-emerald-200/50">
                    {/* Fair Value Recommendation */}
                    {aiSuggestedPrice && (
                      <div className="flex items-center justify-between text-xs text-emerald-800 bg-white p-2.5 rounded-lg border border-emerald-100">
                        <span className="font-semibold">AI Suggested Resale Price:</span>
                        <span className="font-extrabold text-sm font-mono text-emerald-700">
                          ₦{aiSuggestedPrice.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Enhanced Description Recommendation */}
                    {aiEnhancedDesc && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase text-slate-400">AI Enhanced Copywriting Suggestion:</span>
                          <button
                            type="button"
                            onClick={handleApplyAIEnhancement}
                            className="text-[10px] font-bold text-teal-700 bg-white hover:bg-teal-50 px-2 py-1 rounded border border-teal-200 transition-all cursor-pointer"
                          >
                            Apply AI Copywriter
                          </button>
                        </div>
                        <div className="bg-white/70 p-3 rounded-lg text-[11px] text-slate-600 font-mono max-h-32 overflow-y-auto border border-emerald-200/40">
                          {aiEnhancedDesc}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Form Actions Footer */}
            {validationRun && aiPassed && (
              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 bg-white hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-md cursor-pointer"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Publish Validated Listing
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
