export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  department: string;
  ward?: string;
  staffId: string;
  phone: string;
  avatarUrl?: string;
  createdAt: string;
  role: "buyer" | "seller" | "admin";
  oracleNumber: string;
  verified: boolean;
  bankLinked?: boolean;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  
  // Biometric status parameters
  status?: "ACTIVE" | "FROZEN_FLAGGED";
  lasuthIdUrl?: string;
  selfieBiometricHash?: string;
  confidenceScore?: number;
  fallbackDocumentType?: "NIN" | "PASSPORT";
  fallbackDocumentUrl?: string;
  fallbackDocSubmitted?: boolean;
  fallbackDocName?: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  type: "MISMATCHED_CREDENTIALS" | "SUSPICIOUS_IP" | "ADMIN_OVERRIDE" | "POLICY_VIOLATION";
  message: string;
  severity: "high" | "medium" | "low";
  staffId?: string;
  oracleNumber?: string;
  ipAddress?: string;
}

export type ListingCategory =
  | "Clothing, Fashion & Apparel"
  | "Food, Beverages & Groceries"
  | "Phones, Electronics & Computing"
  | "Health, Beauty & Personal Care";

export type ItemCondition = "New" | "Open Box" | "Like New" | "Gently Used" | "Fair";

export type ListingStatus = "active" | "sold" | "reported" | "archived";

export interface MasterCatalogItem {
  id: string;
  title: string;
  category: ListingCategory;
  subcategory: string;
  description: string;
  imageUrl: string;
  avgPrice: number;
}

export interface Listing {
  id: string;
  catalogItemId: string; // References the central master catalog
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  subcategory?: string;
  condition: ItemCondition;
  sellerId: string;
  sellerName: string;
  sellerDepartment: string;
  sellerWard: string; // Mandatory department & ward for Seller Transparency
  sellerPhone: string;
  imageUrl?: string;
  status: ListingStatus;
  aiPassed: boolean;
  aiReason?: string;
  aiSuggestedPrice?: number;
  aiEnhancedDesc?: string;
  createdAt: string;
}

export type OfferStatus = "pending" | "accepted" | "declined" | "completed" | "cancelled";

export interface Offer {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  originalPrice: number;
  offerPrice: number;
  status: OfferStatus;
  createdAt: string;
}

export type HandoverZone =
  | "Main Hospital Cafeteria"
  | "Fountain Garden Plaza"
  | "College of Medicine Lawn"
  | "Admin Block Foyer"
  | "Main Pharmacy Reception"
  | "Accident & Emergency (A&E) Staff Lounge";

export type TransactionStatus = "pending_handover" | "completed" | "cancelled";

export interface Transaction {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  price: number;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  handoverZone: HandoverZone;
  handoverCode: string; // 4-digit code generated for security
  status: TransactionStatus;
  createdAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string; // format: listingId_buyerId_sellerId
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessageText?: string;
  lastMessageAt?: string;
}

export type OrderStatus = "Pending" | "Confirmed/Paid" | "Released/Fulfilled";

export interface OrderItem {
  listingId: string;
  title: string;
  price: number;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerWard: string;
  sellerDepartment: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  items: OrderItem[];
  handoverZone: HandoverZone;
  deliveryBlock?: string;
  customCoordinates?: string;
  paymentReference?: string;
  isPaidOnline?: boolean;
  handoverCode: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

