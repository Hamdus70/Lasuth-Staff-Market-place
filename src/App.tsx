import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
import { UserProfile, Listing, Offer, Transaction, ChatMessage, HandoverZone, ListingCategory, ItemCondition, Order, OrderStatus, OrderItem, InAppNotification, WishlistItem } from "./types";
import { MOCK_LISTINGS, HANDOVER_ZONES, CATEGORIES, MASTER_CATALOG, SUBCATEGORIES } from "./mockData";
import AuthScreen from "./components/AuthScreen";
import ListingCard from "./components/ListingCard";
import ListingForm from "./components/ListingForm";
import ProductDetail from "./components/ProductDetail";
import ChatPanel from "./components/ChatPanel";
import HandoversList from "./components/HandoversList";
import ArchitectureDashboard from "./components/ArchitectureDashboard";
import CartAndOrders from "./components/CartAndOrders";
import SecurityPanel from "./components/SecurityPanel";
import FrozenStateDashboard from "./components/FrozenStateDashboard";
import CheckoutPlayground from "./components/CheckoutPlayground";
import { Hospital, ShieldCheck, Plus, MessageSquare, ShoppingBag, Landmark, LogOut, Search, SlidersHorizontal, Sparkles, Cpu, ArrowLeft, ArrowRight, ShoppingCart, Bell, Phone, X, Clock, Shield, User } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("lasuth_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthScreen, setShowAuthScreen] = useState<boolean>(false);
  const [pendingIntent, setPendingIntent] = useState<any | null>(null);
  const [paymentSession, setPaymentSession] = useState<any | null>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Navigation states
  const [activeTab, setActiveTab] = useState<"browse" | "chat" | "handovers" | "architecture" | "orders" | "security">("browse");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All Subcategories");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All Departments");

  // Dynamically extract active departments from listings
  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    listings.forEach(l => {
      if (l.sellerDepartment) depts.add(l.sellerDepartment);
    });
    // Ensure standard hospital departments are available
    depts.add("Nursing Services");
    depts.add("Surgery & Clinical Medicine");
    depts.add("Pharmacy Department");
    depts.add("Hospital Administration");
    return Array.from(depts).sort();
  }, [listings]);

  // Shopping Cart & E-Commerce states
  const [cart, setCart] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);


  // Listen to Listings globally (available to anyone, including Guest)
  useEffect(() => {
    const unsubscribeListings = onSnapshot(collection(db, "listings"), (snapshot) => {
      const items: Listing[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Listing);
      });
      
      // Sort by creation date descending
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // If Firestore is completely empty, populate mock data to make it look active immediately!
      if (items.length === 0) {
        populateMockDatabase();
      } else {
        setListings(items);
      }
    });

    return () => {
      unsubscribeListings();
    };
  }, []);

  // Sync state with Firestore in real-time when authenticated (for private/operational collections)
  useEffect(() => {
    if (!currentUser) return;

    // 2. Listen to Offers
    const unsubscribeOffers = onSnapshot(collection(db, "offers"), (snapshot) => {
      const items: Offer[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Offer);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOffers(items);
    });

    // 3. Listen to Transactions
    const unsubscribeTransactions = onSnapshot(collection(db, "transactions"), (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(items);
    });

    // 4. Listen to Messages
    const unsubscribeMessages = onSnapshot(collection(db, "messages"), (snapshot) => {
      const items: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(items);
    });

    // 5. Listen to Orders
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Order);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(items);
    });

    // 6. Listen to Notifications
    const unsubscribeNotifications = onSnapshot(collection(db, "notifications"), (snapshot) => {
      const items: InAppNotification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.recipientId === currentUser.uid) {
          items.push({ id: doc.id, ...data } as InAppNotification);
        }
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(items);
    });

    // 7. Listen to Wishlist
    const unsubscribeWishlist = onSnapshot(collection(db, "wishlist"), (snapshot) => {
      const items: WishlistItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === currentUser.uid) {
          items.push({ id: doc.id, ...data } as WishlistItem);
        }
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setWishlist(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "wishlist");
    });

    return () => {
      unsubscribeOffers();
      unsubscribeTransactions();
      unsubscribeMessages();
      unsubscribeOrders();
      unsubscribeNotifications();
      unsubscribeWishlist();
    };
  }, [currentUser]);

  // Establish real-time WebSocket connection for chat & instant presence updates
  useEffect(() => {
    if (!currentUser) {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      return;
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}`;
    console.log("Connecting to LASUTH WebSocket:", wsUrl);
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection established!");
      ws.send(JSON.stringify({ type: "register", userId: currentUser.uid }));
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "presence_change") {
          const { userId, isOnline } = data;
          setOnlineUsers((prev) => {
            const exists = prev.includes(userId);
            if (isOnline && !exists) {
              return [...prev, userId];
            } else if (!isOnline && exists) {
              return prev.filter((id) => id !== userId);
            }
            return prev;
          });
        } else if (data.type === "chat_message") {
          console.log("Instant Live Chat Message received via WS:", data.message);
        } else if (data.type === "notification") {
          console.log("Instant Live Notification alert received via WS:", data.notification);
        } else if (data.type === "order_state_change") {
          console.log("Instant Live Order State Change received via WS:", data.orderId, data.status);
        }
      } catch (err) {
        console.error("Error decoding client WS package:", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [currentUser]);

  // Helper: Intercept restricted action if Guest (unauthenticated)
  const handleProtectedAction = (action: "add_to_cart" | "direct_buy" | "submit_offer" | "chat" | "reveal_phone" | "post_item" | "view_tab" | "wishlist", payload?: any) => {
    if (!currentUser) {
      setPendingIntent({ action, payload });
      setShowAuthScreen(true);
      return true; // Was protected & intercepted
    }
    return false; // Free to proceed
  };

  // Helper: Intercept tab switches if Guest (unauthenticated)
  const handleTabChange = (tab: "browse" | "chat" | "handovers" | "architecture" | "orders" | "security") => {
    if (tab === "browse" || tab === "architecture") {
      setActiveTab(tab);
    } else {
      if (handleProtectedAction("view_tab", { tab })) return;
      setActiveTab(tab);
    }
  };

  // Helper: Post successful authentication, resume the pending intent
  const handleAuthSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    localStorage.setItem("lasuth_user", JSON.stringify(profile));
    setShowAuthScreen(false);

    if (pendingIntent) {
      const { action, payload } = pendingIntent;
      
      if (action === "add_to_cart" && payload?.listing) {
        // Automatically add to cart
        setCart((prev) => {
          if (prev.some((item) => item.id === payload.listing.id)) return prev;
          return [...prev, payload.listing];
        });
        // Select listing to maintain view context
        setSelectedListing(payload.listing);
      } else if (action === "direct_buy" && payload?.listing) {
        // Direct purchase
        handleInitiateDirectBuy(payload.listing);
        setSelectedListing(payload.listing);
      } else if (action === "reveal_phone" && payload?.listing) {
        // Return to item details with phone revealed
        setSelectedListing(payload.listing);
      } else if (action === "post_item") {
        setShowCreateModal(true);
      } else if (action === "chat") {
        setActiveTab("chat");
      } else if (action === "view_tab" && payload?.tab) {
        setActiveTab(payload.tab);
      } else if (action === "wishlist" && payload?.listing) {
        handleToggleWishlist(payload.listing);
      }
      
      setPendingIntent(null);
    }
  };

  // Wishlist Handler: Toggle save status in Firestore
  const handleToggleWishlist = async (listing: Listing) => {
    if (handleProtectedAction("wishlist", { listing })) return;
    if (!currentUser) return;

    const wishlistId = `${currentUser.uid}_${listing.id}`;
    const wishlistDocRef = doc(db, "wishlist", wishlistId);
    const isSaved = wishlist.some((item) => item.listingId === listing.id);

    try {
      if (isSaved) {
        await deleteDoc(wishlistDocRef);
      } else {
        const wishlistItem: WishlistItem = {
          id: wishlistId,
          userId: currentUser.uid,
          listingId: listing.id,
          createdAt: new Date().toISOString()
        };
        await setDoc(wishlistDocRef, wishlistItem);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `wishlist/${wishlistId}`);
    }
  };

  // Seed the Firestore DB on first load for optimal demonstration
  const populateMockDatabase = async () => {
    console.log("Seeding Firestore database with default LASUTH listings...");
    try {
      for (const item of MOCK_LISTINGS) {
        await setDoc(doc(db, "listings", item.id), item);
      }
    } catch (error) {
      console.error("Error populating default listings:", error);
    }
  };

  // Handler: Create listing
  const handleCreateListing = async (newListing: Listing) => {
    try {
      await setDoc(doc(db, "listings", newListing.id), newListing);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to post listing:", error);
    }
  };

  // Handler: Propose/Submit a counter-offer
  const handleOfferSubmit = async (offer: Offer) => {
    if (handleProtectedAction("submit_offer", { offer })) return;
    try {
      await setDoc(doc(db, "offers", offer.id), offer);
    } catch (error) {
      console.error("Failed to submit bargaining offer:", error);
    }
  };

  // Shopping Cart & Order Checkout Pipeline Handlers
  const handleAddToCart = (listing: Listing) => {
    if (handleProtectedAction("add_to_cart", { listing })) return;
    if (cart.some((item) => item.id === listing.id)) return;
    setCart((prev) => [...prev, listing]);
  };

  const handleRemoveFromCart = (listingId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== listingId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCheckout = async (handoverZone: HandoverZone) => {
    if (!currentUser || cart.length === 0) return;

    try {
      const orderId = "order_" + Date.now();
      const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
      const handoverPIN = `L-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder: Order = {
        id: orderId,
        buyerId: currentUser.uid,
        buyerName: currentUser.displayName,
        buyerPhone: currentUser.phone || "08031234567",
        items: cart.map((item) => ({
          listingId: item.id,
          title: item.title,
          price: item.price,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          sellerPhone: item.sellerPhone || "08031234567",
          sellerWard: item.sellerDepartment,
          sellerDepartment: item.sellerDepartment,
          imageUrl: item.imageUrl,
        })),
        handoverZone,
        handoverCode: handoverPIN,
        status: "Pending",
        totalAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Save the Order to Firestore
      await setDoc(doc(db, "orders", orderId), newOrder);

      // 2. Mark listings as Sold in database
      for (const item of cart) {
        await updateDoc(doc(db, "listings", item.id), { status: "sold" });
      }

      // 3. Create transactional in-app notifications for sellers
      for (const item of cart) {
        const notifId = "notif_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        const notif: InAppNotification = {
          id: notifId,
          recipientId: item.sellerId,
          title: "New E-Commerce Order",
          message: `Colleague ${currentUser.displayName} checked out your item "${item.title}". Please fulfill it in your Checkout Ledger.`,
          type: "info",
          orderId: orderId,
          read: false,
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, "notifications", notifId), notif);

        // Real-time notification dispatch via WebSocket
        if (socket && socket.readyState === 1) {
          socket.send(JSON.stringify({
            type: "notification",
            recipientId: item.sellerId,
            notification: notif,
          }));
        }
      }

      // Initialize the secure checkout payment session with Paystack logic (₦50 split fee)
      try {
        const payInitRes = await fetch("/api/payments/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalAmount,
            email: currentUser.email,
            buyerId: currentUser.uid,
            sellerId: cart[0]?.sellerId,
            orderId
          })
        });
        const payInitData = await payInitRes.json();
        
        if (payInitData.success) {
          setPaymentSession({
            reference: payInitData.reference,
            amount: payInitData.buyerTotal,
            feeApplied: payInitData.feeApplied,
            email: currentUser.email,
            buyerId: currentUser.uid,
            sellerId: cart[0]?.sellerId,
            orderId
          });
        }
      } catch (payErr) {
        console.error("Failed to initialize transaction gateway:", payErr);
      }

      // Clear local shopping cart and open checkout tab
      setCart([]);
      setShowCartModal(false);
      setActiveTab("orders");
    } catch (err) {
      console.error("Error executing checkout pipeline:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      // Update state in Firestore
      await updateDoc(doc(db, "orders", orderId), { 
        status,
        updatedAt: new Date().toISOString()
      });

      const orderDoc = orders.find(o => o.id === orderId);
      if (!orderDoc) return;

      // Notify the counterparty
      const notifId = "notif_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      const isBuyer = orderDoc.buyerId === currentUser?.uid;
      const recipientId = isBuyer ? orderDoc.items[0]?.sellerId : orderDoc.buyerId;

      const notif: InAppNotification = {
        id: notifId,
        recipientId,
        title: `Order Status Changed`,
        message: `Your order (${orderId}) status is now updated to "${status}".`,
        type: "success",
        orderId,
        read: false,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "notifications", notifId), notif);

      // Real-time notify via WebSocket
      if (socket && socket.readyState === 1) {
        socket.send(JSON.stringify({
          type: "order_state_change",
          recipientId,
          orderId,
          status,
        }));
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const handleVerifyOrderHandover = (orderId: string, enteredCode: string): boolean => {
    const orderDoc = orders.find((o) => o.id === orderId);
    if (!orderDoc) return false;

    if (orderDoc.handoverCode.trim().toUpperCase() === enteredCode.trim().toUpperCase()) {
      // Complete state transition
      handleUpdateOrderStatus(orderId, "Released/Fulfilled");
      return true;
    }

    return false;
  };

  const handleMarkNotificationsAsRead = async () => {
    if (!currentUser) return;
    try {
      const unreadNotifs = notifications.filter((n) => !n.read);
      for (const n of unreadNotifs) {
        await updateDoc(doc(db, "notifications", n.id), { read: true });
      }
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  // Handler: Accept standard buyer offer and initiate secure transaction
  const handleAcceptOffer = async (offer: Offer, handoverZone: HandoverZone) => {
    try {
      // 1. Update Offer Status
      await updateDoc(doc(db, "offers", offer.id), { status: "accepted" });

      // 2. Generate Transaction
      const randomPIN = `L-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTx: Transaction = {
        id: "tx_" + Date.now(),
        listingId: offer.listingId,
        listingTitle: offer.listingTitle,
        listingImage: offer.listingImage,
        price: offer.offerPrice,
        sellerId: offer.sellerId,
        sellerName: offer.sellerName,
        buyerId: offer.buyerId,
        buyerName: offer.buyerName,
        handoverZone,
        handoverCode: randomPIN,
        status: "pending_handover",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "transactions", newTx.id), newTx);

      // 3. Mark Listing status to sold in database
      await updateDoc(doc(db, "listings", offer.listingId), { status: "sold" });

      // Automatically transition to handovers panel for instant access
      setActiveTab("handovers");
    } catch (error) {
      console.error("Error accepting offer:", error);
    }
  };

  // Handler: Decline bargain
  const handleDeclineOffer = async (offer: Offer) => {
    try {
      await updateDoc(doc(db, "offers", offer.id), { status: "declined" });
    } catch (error) {
      console.error("Failed to decline offer:", error);
    }
  };

  // Handler: Send private coordination message
  const handleSendMessage = async (chatId: string, text: string) => {
    if (!currentUser) return;
    try {
      const newMsg: ChatMessage = {
        id: "msg_" + Date.now(),
        chatId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        text,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "messages", newMsg.id), newMsg);
    } catch (error) {
      console.error("Failed to post message:", error);
    }
  };

  // Handler: Verify Handover PIN and complete the swap
  const handleCompleteTransaction = async (transactionId: string) => {
    try {
      const tx = transactions.find((t) => t.id === transactionId);
      if (!tx) return;

      // 1. Update Transaction to completed
      await updateDoc(doc(db, "transactions", transactionId), {
        status: "completed",
        completedAt: new Date().toISOString(),
      });

      // 2. Clear any other pending offers for this item
      const duplicateOffers = offers.filter((o) => o.listingId === tx.listingId && o.status === "pending");
      for (const offer of duplicateOffers) {
        await updateDoc(doc(db, "offers", offer.id), { status: "cancelled" });
      }
    } catch (error) {
      console.error("Error finalizing transaction:", error);
    }
  };

  // Direct Buy (bypass bargaining and purchase immediately at list price)
  const handleInitiateDirectBuy = async (listing: Listing) => {
    if (handleProtectedAction("direct_buy", { listing })) return;
    if (!currentUser) return;

    try {
      // Create instant approved offer
      const instantOfferId = "offer_" + Date.now();
      const newOffer: Offer = {
        id: instantOfferId,
        listingId: listing.id,
        listingTitle: listing.title,
        listingImage: listing.imageUrl,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        buyerId: currentUser.uid,
        buyerName: currentUser.displayName,
        originalPrice: listing.price,
        offerPrice: listing.price,
        status: "accepted",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "offers", instantOfferId), newOffer);

      // Generate random handover code
      const randomPIN = `L-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTx: Transaction = {
        id: "tx_" + Date.now(),
        listingId: listing.id,
        listingTitle: listing.title,
        listingImage: listing.imageUrl,
        price: listing.price,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        buyerId: currentUser.uid,
        buyerName: currentUser.displayName,
        handoverZone: "Main Hospital Cafeteria", // Default safe zone
        handoverCode: randomPIN,
        status: "pending_handover",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "transactions", newTx.id), newTx);

      // Mark product as sold
      await updateDoc(doc(db, "listings", listing.id), { status: "sold" });

      setSelectedListing(null);
      setActiveTab("handovers");
    } catch (error) {
      console.error("Direct buy failed:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lasuth_user");
    setCurrentUser(null);
    setSelectedListing(null);
    setSelectedCatalogItemId(null);
    setCart([]);
    setActiveTab("browse");
    setShowAuthScreen(true);
    setPendingIntent(null);
  };

  const getTransparencyScore = (item: Listing) => {
    let score = 40; // Base score
    if (item.sellerWard) score += 20;
    if (item.sellerDepartment) score += 20;
    if (item.sellerId === "nurse_janet" || item.sellerId === "doctor_olumide" || item.sellerId === "pharmacist_amaka") {
      score += 20; // 100% score
    } else {
      score += 15; // 95% score
    }
    return Math.min(score, 100);
  };

  // Dynamically sanitize listings on the frontend if the user is a Guest
  const sanitizedListings = useMemo(() => {
    const isAuth = !!currentUser;
    return listings.map((l) => ({
      ...l,
      sellerPhone: isAuth ? l.sellerPhone : "[SIGN-IN TO VIEW]",
    }));
  }, [listings, currentUser]);

  const sanitizedSelectedListing = useMemo(() => {
    if (!selectedListing) return null;
    const isAuth = !!currentUser;
    return {
      ...selectedListing,
      sellerPhone: isAuth ? selectedListing.sellerPhone : "[SIGN-IN TO VIEW]",
    };
  }, [selectedListing, currentUser]);

  // Filter listings based on search and category inputs
  const filteredListings = sanitizedListings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sellerDepartment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Badge notification counts
  const pendingOffersCount = offers.filter(
    (o) => o.status === "pending" && (o.sellerId === currentUser?.uid || o.buyerId === currentUser?.uid)
  ).length;

  const pendingHandoversCount = transactions.filter(
    (t) => t.status === "pending_handover" && (t.sellerId === currentUser?.uid || t.buyerId === currentUser?.uid)
  ).length;

  if (showAuthScreen) {
    return (
      <AuthScreen 
        onAuthSuccess={handleAuthSuccess} 
        onCancel={() => setShowAuthScreen(false)} 
      />
    );
  }

  if (currentUser && currentUser.status === "FROZEN_FLAGGED") {
    return (
      <FrozenStateDashboard 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onUpdateUser={(updated) => setCurrentUser(updated)} 
      />
    );
  }

  return (
    <div id="lasuth-app-root" className="min-h-screen bg-brand-bg flex flex-col font-sans text-brand-text-main pb-16 md:pb-0">
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className="bg-brand-primary-dark text-white shadow-md sticky top-0 z-40 border-b-3 border-brand-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo and Brand */}
            <button
              onClick={() => {
                setSelectedListing(null);
                setSelectedCatalogItemId(null);
                setActiveTab("browse");
              }}
              className="flex items-center space-x-3 text-left focus:outline-none cursor-pointer"
            >
              <div className="bg-white text-brand-primary-dark font-black px-2 py-0.5 rounded text-xs tracking-wider">
                LASUTH
              </div>
              <div>
                <h1 className="font-extrabold tracking-tight text-sm leading-none flex items-center gap-1">
                  STAFF MARKETPLACE
                </h1>
                <span className="text-[9px] text-brand-accent uppercase tracking-widest font-bold">
                  Internal Closed Portal
                </span>
              </div>
            </button>

            {/* Central Search Bar in Header */}
            <div className="hidden md:flex flex-grow max-w-sm mx-6 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/50">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (activeTab !== "browse" || selectedListing) {
                    setSelectedListing(null);
                    setActiveTab("browse");
                  }
                }}
                placeholder="Search stethoscopes, scrubs, electronics..."
                className="w-full pl-9 pr-4 py-1.5 bg-white/15 hover:bg-white/20 focus:bg-white focus:text-slate-950 focus:outline-none placeholder:text-white/60 text-xs rounded-lg transition-all"
              />
            </div>

            {/* Right: Active user detail and actions */}
            <div className="flex items-center space-x-4">
              
              {currentUser ? (
                <>
                  {/* User credentials banner */}
                  <div className="hidden lg:flex flex-col text-right">
                    <span className="text-xs font-bold text-white leading-none">
                      {currentUser.displayName}
                    </span>
                    <span className="text-[10px] text-white/70 font-medium">
                      {currentUser.department} • Staff ID: {currentUser.staffId}
                    </span>
                  </div>

                  {/* Verified Clinical Stamp */}
                  <div className="hidden sm:flex items-center space-x-1 bg-brand-accent/20 border border-brand-accent/45 text-brand-accent px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Validated Staff</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Guest banner with Login Action */}
                  <button
                    onClick={() => setShowAuthScreen(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Sign In / Onboard</span>
                  </button>
                </>
              )}

              {/* In-App Notification Center Bell */}
              <button
                onClick={() => {
                  if (handleProtectedAction("view_tab", { tab: "browse" })) return;
                  setShowNotificationsModal(true);
                  handleMarkNotificationsAsRead();
                }}
                className="relative p-2 text-white bg-slate-800 hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-lg cursor-pointer flex items-center justify-center border border-slate-700"
                title="In-App Notification Alerts"
              >
                <Bell className="h-4 w-4 text-brand-accent" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-black text-[7px] h-3.5 w-3.5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Shopping Cart button */}
              <button
                onClick={() => {
                  if (handleProtectedAction("view_tab", { tab: "browse" })) return;
                  setShowCartModal(true);
                }}
                className="relative p-2 text-white bg-slate-800 hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-lg cursor-pointer flex items-center justify-center border border-slate-700"
                title="My Resale Shopping Cart"
              >
                <ShoppingCart className="h-4 w-4 text-emerald-400" />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white font-extrabold text-[8px] h-4.5 w-4.5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Sell button */}
              <button
                onClick={() => {
                  if (handleProtectedAction("post_item")) return;
                  setShowCreateModal(true);
                }}
                className="bg-brand-accent hover:bg-brand-accent-hover text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Post Item</span>
              </button>

              {/* Logout button */}
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-rose-950/40 hover:text-rose-400 rounded-lg transition-all cursor-pointer text-white/70"
                  title="Sign Out of Portal"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE LOWER NAV BAR */}
      <div className="md:hidden bg-brand-primary-dark border-t border-slate-800 text-white py-2.5 px-4 fixed bottom-0 left-0 right-0 z-40 flex justify-around shadow-lg">
        <button
          onClick={() => {
            setSelectedListing(null);
            handleTabChange("browse");
          }}
          className={`flex flex-col items-center space-y-1 text-[10px] font-bold ${
            activeTab === "browse" && !selectedListing ? "text-brand-accent" : "text-white/60"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Market</span>
        </button>

        <button
          onClick={() => {
            setSelectedListing(null);
            handleTabChange("chat");
          }}
          className={`flex flex-col items-center space-y-1 text-[10px] font-bold relative ${
            activeTab === "chat" ? "text-brand-accent" : "text-white/60"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Negotiate</span>
          {pendingOffersCount > 0 && (
            <span className="absolute -top-1 right-2 bg-indigo-500 text-white text-[7px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
              {pendingOffersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setSelectedListing(null);
            handleTabChange("handovers");
          }}
          className={`flex flex-col items-center space-y-1 text-[10px] font-bold relative ${
            activeTab === "handovers" ? "text-brand-accent" : "text-white/60"
          }`}
        >
          <Landmark className="h-4 w-4" />
          <span>Swaps</span>
          {pendingHandoversCount > 0 && (
            <span className="absolute -top-1 right-0 bg-emerald-500 text-white text-[7px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
              {pendingHandoversCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setSelectedListing(null);
            handleTabChange("architecture");
          }}
          className={`flex flex-col items-center space-y-1 text-[10px] font-bold relative ${
            activeTab === "architecture" ? "text-brand-accent" : "text-white/60"
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>System Scale</span>
        </button>
      </div>

      {/* 2. MAIN LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl w-full mx-auto md:px-4 lg:px-8 py-6 gap-6">
        
        {/* SIDEBAR (Desktop only) */}
        <aside className="w-[240px] shrink-0 bg-white border border-brand-border rounded-2xl p-6 hidden md:flex flex-col justify-between shadow-sm h-fit">
          <div className="space-y-6">
            
            {/* Category Navigation */}
            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-text-muted mb-3">
                Categories
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => {
                      setSelectedListing(null);
                      setSelectedCategory("All Categories");
                      setSelectedSubcategory("All Subcategories");
                      setActiveTab("browse");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      activeTab === "browse" && !selectedListing && selectedCategory === "All Categories"
                        ? "bg-blue-50 text-brand-primary"
                        : "text-brand-text-main hover:bg-slate-50"
                    }`}
                  >
                    <span>All Listings</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                      {listings.filter(l => l.status !== "sold").length}
                    </span>
                  </button>
                </li>
                {CATEGORIES.map((cat) => {
                  const isCatSelected = selectedCategory === cat;
                  const count = listings.filter((l) => l.category === cat && l.status !== "sold").length;
                  const catSubcategories = SUBCATEGORIES[cat as ListingCategory] || [];
                  return (
                    <li key={cat} className="space-y-1">
                      <button
                        onClick={() => {
                          setSelectedListing(null);
                          setSelectedCategory(cat);
                          setSelectedSubcategory("All Subcategories");
                          setActiveTab("browse");
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          activeTab === "browse" && !selectedListing && selectedCategory === cat
                            ? "bg-blue-50 text-brand-primary font-bold"
                            : "text-brand-text-main hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {count > 0 && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                            {count}
                          </span>
                        )}
                      </button>

                      {/* Nested subcategory menu */}
                      {isCatSelected && (
                        <ul className="pl-4 pr-1 py-1 space-y-1 border-l border-slate-100 ml-3 animate-slide-down">
                          <li>
                            <button
                              onClick={() => setSelectedSubcategory("All Subcategories")}
                              className={`w-full text-left px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                                selectedSubcategory === "All Subcategories"
                                  ? "text-teal-600 font-extrabold"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              All {cat.split(",")[0]}
                            </button>
                          </li>
                          {catSubcategories.map((sub) => {
                            const subCount = listings.filter(
                              (l) => l.category === cat && l.subcategory === sub && l.status !== "sold"
                            ).length;
                            return (
                              <li key={sub}>
                                <button
                                  onClick={() => setSelectedSubcategory(sub)}
                                  className={`w-full text-left px-2 py-1 rounded text-[10px] font-medium transition-all flex items-center justify-between ${
                                    selectedSubcategory === sub
                                      ? "text-teal-600 font-extrabold"
                                      : "text-slate-500 hover:text-slate-800"
                                  }`}
                                >
                                  <span className="truncate">{sub}</span>
                                  {subCount > 0 && (
                                    <span className="text-[9px] text-slate-400">({subCount})</span>
                                  )}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Account & Transaction Navigation */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-text-muted mb-3">
                My Account
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => {
                      setSelectedListing(null);
                      handleTabChange("chat");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      activeTab === "chat"
                        ? "bg-blue-50 text-brand-primary font-bold"
                        : "text-brand-text-main hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-brand-text-muted" />
                      <span>Negotiations</span>
                    </div>
                    {pendingOffersCount > 0 && (
                      <span className="bg-indigo-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                        {pendingOffersCount}
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedListing(null);
                      handleTabChange("handovers");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      activeTab === "handovers"
                        ? "bg-blue-50 text-brand-primary font-bold"
                        : "text-brand-text-main hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Landmark className="h-3.5 w-3.5 text-brand-text-muted" />
                      <span>Safe Swaps</span>
                    </div>
                    {pendingHandoversCount > 0 && (
                      <span className="bg-emerald-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                        {pendingHandoversCount}
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedListing(null);
                      handleTabChange("orders");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      activeTab === "orders"
                        ? "bg-blue-50 text-brand-primary font-bold"
                        : "text-brand-text-main hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-3.5 w-3.5 text-brand-text-muted" />
                      <span>Checkout Orders</span>
                    </div>
                    {currentUser && orders.filter(o => o.status === "Pending" && (o.buyerId === currentUser.uid || o.items[0]?.sellerId === currentUser.uid)).length > 0 && (
                      <span className="bg-amber-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                        {orders.filter(o => o.status === "Pending" && (o.buyerId === currentUser?.uid || o.items[0]?.sellerId === currentUser?.uid)).length}
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedListing(null);
                      handleTabChange("architecture");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      activeTab === "architecture"
                        ? "bg-blue-50 text-brand-primary font-bold"
                        : "text-brand-text-main hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-brand-text-muted" />
                      <span>System Scale</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedListing(null);
                      handleTabChange("security");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      activeTab === "security"
                        ? "bg-blue-50 text-brand-primary font-bold"
                        : "text-brand-text-main hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-brand-text-muted" />
                      <span>Security & Bank</span>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Secure Portal Stamp */}
          <div className="mt-8 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-left">
            <div className="text-xs text-emerald-800 font-bold flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Secure Portal
            </div>
            <p className="text-[10px] text-emerald-700 mt-1 leading-relaxed">
              Verified LASUTH employees only. All trades recorded for staff safety.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-grow flex flex-col min-w-0">
          
          {/* Banner Alert informing about Hospital policy */}
          <div className="bg-white border border-brand-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-brand-primary tracking-wide uppercase flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-brand-accent animate-pulse" />
                Institutional Safety Auto-Moderator Active
              </h3>
              <p className="text-[11px] text-brand-text-muted leading-relaxed">
                Every resale product is automatically screened by our institutional AI. No prescription drugs, laboratory instruments, or state hospital resources may be listed.
              </p>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold border border-emerald-200 px-3 py-1 rounded-xl whitespace-nowrap">
              Lagos State Approved
            </span>
          </div>

          {/* Dynamic view switcher */}
          {selectedListing ? (
            /* A. PRODUCT DETAIL VIEW */
            <ProductDetail
              listing={sanitizedSelectedListing!}
              currentUser={currentUser}
              onBack={() => setSelectedListing(null)}
              onOfferSubmit={handleOfferSubmit}
              onInitiateDirectBuy={handleInitiateDirectBuy}
              onAddToCart={handleAddToCart}
              onlineUsers={onlineUsers}
              onRevealPhone={(listing) => handleProtectedAction("reveal_phone", { listing })}
              isWishlisted={wishlist.some((item) => item.listingId === selectedListing.id)}
              onToggleWishlist={handleToggleWishlist}
            />
          ) : activeTab === "browse" && selectedCatalogItemId ? (
            /* B.1 AGGREGATED VIEW FOR SELECTED ITEM */
            <div className="space-y-6">
              {(() => {
                const catalogItem = MASTER_CATALOG.find(item => item.id === selectedCatalogItemId);
                if (!catalogItem) return null;

                const activeMatching = sanitizedListings.filter(
                  (l) => l.catalogItemId === selectedCatalogItemId && l.status !== "sold"
                ).sort((a, b) => getTransparencyScore(b) - getTransparencyScore(a));

                return (
                  <div className="space-y-6 animate-fade-in">
                    {/* Breadcrumbs / Back button */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setSelectedCatalogItemId(null)}
                        className="flex items-center space-x-2 text-slate-600 hover:text-brand-primary font-bold text-xs cursor-pointer bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/60 shadow-sm"
                      >
                        <ArrowLeft className="h-4 w-4 text-slate-500" />
                        <span>Back to Catalog</span>
                      </button>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                        Unified Discovery ID: {catalogItem.id}
                      </span>
                    </div>

                    {/* Catalog Item Header Panel */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md flex flex-col md:flex-row gap-6 items-start">
                      <div className="h-40 w-full md:w-56 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                        <img src={catalogItem.imageUrl} alt={catalogItem.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-3 flex-grow">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-slate-900 text-white font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {catalogItem.category}
                          </span>
                          <span className="bg-teal-50 text-teal-800 border border-teal-100 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                            Reference Fair Value: ₦{catalogItem.avgPrice.toLocaleString()}
                          </span>
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                          {catalogItem.title}
                        </h2>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                          {catalogItem.description}
                        </p>
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-semibold">
                            Currently Listed: <strong className="text-brand-primary font-black">{activeMatching.length} verified vendors</strong>
                          </span>
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-brand-primary text-white text-[10px] font-extrabold tracking-wide uppercase px-3.5 py-2 rounded-xl hover:bg-brand-primary-dark transition-all cursor-pointer shadow-sm flex items-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Resell This Item</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sellers Listing Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                          Active LASUTH Staff Resellers (Sorted by P2P Transparency Rating)
                        </h3>
                        <span className="text-[10px] text-slate-400 italic">
                          *Rankings updated in real-time
                        </span>
                      </div>

                      {activeMatching.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 shadow-sm">
                          <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-2 animate-pulse" />
                          <h4 className="font-bold text-slate-700 text-xs">No active resales for this catalog item</h4>
                          <p className="text-[10px] max-w-sm mx-auto mt-1">
                            Be the first staff member to resell this item! Click "Resell This Item" above to publish your listing instantly.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeMatching.map((item) => {
                            const score = getTransparencyScore(item);
                            return (
                              <div
                                key={item.id}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-teal-200 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                              >
                                <div className="space-y-2 flex-1">
                                  {/* Seller Info Header */}
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-extrabold text-xs text-slate-800">
                                      {item.sellerName}
                                    </span>
                                    <span className="bg-blue-50 text-brand-primary border border-blue-100 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      🏥 {item.sellerDepartment}
                                    </span>
                                    {item.sellerWard && (
                                      <span className="bg-teal-50 text-teal-800 border border-teal-100 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        📍 Ward: {item.sellerWard}
                                      </span>
                                    )}
                                  </div>

                                  {/* Custom reselling notes */}
                                  <p className="text-xs text-slate-600 line-clamp-2">
                                    {item.description}
                                  </p>

                                  <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                    <span>Condition: <strong className="text-slate-700">{item.condition}</strong></span>
                                    <span>Listed: <strong className="text-slate-700">{new Date(item.createdAt).toLocaleDateString()}</strong></span>
                                  </div>
                                </div>

                                {/* Price, transparency rating & call to actions */}
                                <div className="flex md:flex-col items-end gap-3 md:gap-1.5 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                                  <div className="flex-1 md:flex-none text-left md:text-right">
                                    <span className="block text-[8px] font-semibold uppercase text-slate-400">Reseller Price</span>
                                    <span className="text-base font-black text-slate-900 font-mono">
                                      ₦{item.price.toLocaleString()}
                                    </span>
                                  </div>

                                  {/* Transparency Rating Tag */}
                                  <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end">
                                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                      <span className="text-xs font-bold text-emerald-700 font-mono">{score}% Rating</span>
                                    </div>
                                    <span className="block text-[7px] text-slate-400 font-semibold uppercase tracking-widest">Transparency</span>
                                  </div>

                                  <button
                                    onClick={() => setSelectedListing(item)}
                                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                                  >
                                    <span>Select Reseller</span>
                                    <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : activeTab === "browse" ? (
            /* B.2 MASTER CATALOG INDEX (BROWSE) */
            <div className="space-y-6">
              
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-brand-border flex flex-col shadow-sm">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Catalog Groups</span>
                  <span className="text-lg font-black text-brand-primary mt-1">
                    {CATEGORIES.length} Active
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-brand-border flex flex-col shadow-sm">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Verified Sellers</span>
                  <span className="text-lg font-black text-brand-primary mt-1">
                    {Array.from(new Set(listings.map((l) => l.sellerId))).length + 18} Staff
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-brand-border flex flex-col shadow-sm">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Safe Swaps Completed</span>
                  <span className="text-lg font-black text-brand-primary mt-1">
                    {transactions.filter((t) => t.status === "completed").length + 6} Secured
                  </span>
                </div>
              </div>

              {/* Search and multi-level filtering panel (Jumia-inspired) */}
              <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Search text */}
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search master catalog items by title, category, or subcategory..."
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  {/* Vendor Department Dropdown */}
                  <div className="w-full md:w-64">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer font-semibold"
                    >
                      <option value="All Departments">All Vendor Departments</option>
                      {availableDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Multi-Level Taxonomy Filter Row */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  {/* Category Chip Selector / Dropdown */}
                  <div className="flex-1">
                    <label className="block text-[10px] font-extrabold text-brand-text-muted uppercase tracking-wider mb-1.5">
                      Main Category
                    </label>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        onClick={() => {
                          setSelectedCategory("All Categories");
                          setSelectedSubcategory("All Subcategories");
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          selectedCategory === "All Categories"
                            ? "bg-teal-600 text-white shadow-sm"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        All Categories
                      </button>
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedSubcategory("All Subcategories");
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            selectedCategory === cat
                              ? "bg-teal-600 text-white shadow-sm"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Subcategory Selector */}
                  {selectedCategory !== "All Categories" && (
                    <div className="w-full sm:w-64 animate-fade-in">
                      <label className="block text-[10px] font-extrabold text-brand-text-muted uppercase tracking-wider mb-1.5">
                        Subcategory
                      </label>
                      <select
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer font-semibold"
                      >
                        <option value="All Subcategories">All {selectedCategory.split(",")[0]} Subcategories</option>
                        {(SUBCATEGORIES[selectedCategory as ListingCategory] || []).map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid of Unified Catalog Items */}
              {(() => {
                const filteredCatalog = MASTER_CATALOG.filter((item) => {
                  const matchesSearch =
                    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (item.subcategory && item.subcategory.toLowerCase().includes(searchTerm.toLowerCase()));
                  const matchesCategory =
                    selectedCategory === "All Categories" || item.category === selectedCategory;
                  const matchesSubcategory =
                    selectedSubcategory === "All Subcategories" || item.subcategory === selectedSubcategory;
                  
                  // Department filter checks if there is any listing for this master item by a seller from that department
                  const matchesDepartment =
                    selectedDepartment === "All Departments" ||
                    listings.some(l => l.catalogItemId === item.id && l.sellerDepartment === selectedDepartment && l.status !== "sold");
                    
                  return matchesSearch && matchesCategory && matchesSubcategory && matchesDepartment;
                });

                if (filteredCatalog.length === 0) {
                  return (
                    <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center text-slate-400 shadow-md">
                      <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto stroke-[1.2] mb-3 animate-pulse" />
                      <h4 className="font-bold text-slate-700 text-sm">No catalog items fit specifications</h4>
                      <p className="text-xs max-w-sm mx-auto mt-1">
                        Try typing a different keyword (e.g. "Coca-Cola" or "Stethoscope") to browse active hospital categories.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCatalog.map((item) => {
                      const activeListings = listings.filter(
                        (l) => l.catalogItemId === item.id && l.status !== "sold"
                      );
                      const sellersCount = activeListings.length;
                      const startingPrice = sellersCount > 0 
                        ? Math.min(...activeListings.map((l) => l.price))
                        : null;

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedCatalogItemId(item.id)}
                          className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand-accent transition-all duration-300 flex flex-col justify-between overflow-hidden relative group cursor-pointer"
                        >
                          {/* Image */}
                          <div className="relative h-44 bg-slate-50 overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[8px] font-semibold tracking-wide uppercase">
                              {item.category}
                            </span>
                            
                            {sellersCount > 0 ? (
                              <span className="absolute bottom-3 right-3 bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                ● {sellersCount} {sellersCount === 1 ? "reseller" : "resellers"} active
                              </span>
                            ) : (
                              <span className="absolute bottom-3 right-3 bg-slate-100 text-slate-500 text-[9px] font-semibold px-2 py-0.5 rounded-full">
                                No active resales
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <h3 className="font-extrabold text-slate-800 text-sm leading-snug group-hover:text-brand-primary transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                {item.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                              <div>
                                <span className="block text-[8px] text-slate-400 uppercase font-bold">Resale Price Range</span>
                                <span className="text-sm font-extrabold text-slate-900">
                                  {startingPrice !== null ? `From ₦${startingPrice.toLocaleString()}` : `Ref Value: ₦${item.avgPrice.toLocaleString()}`}
                                </span>
                              </div>
                              <span className="text-brand-primary text-xs font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                                Browse Resellers &rarr;
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : activeTab === "chat" ? (
            /* C. PRIVATE NEGOTIATION ROOM */
            <ChatPanel
              currentUser={currentUser}
              offers={offers}
              listings={sanitizedListings}
              onAcceptOffer={handleAcceptOffer}
              onDeclineOffer={handleDeclineOffer}
              onSendMessage={handleSendMessage}
              messages={messages}
            />
          ) : activeTab === "handovers" ? (
            /* D. SECURE HANDOVER COORDINATION PANEL */
            <HandoversList
              currentUser={currentUser}
              transactions={transactions}
              onCompleteTransaction={handleCompleteTransaction}
            />
          ) : activeTab === "orders" ? (
            /* E. E-COMMERCE ORDERS LEDGER */
            <CartAndOrders
              currentUser={currentUser}
              cart={cart}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onCheckout={handleCheckout}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onVerifyOrderHandover={handleVerifyOrderHandover}
              onlineUsers={onlineUsers}
              notifications={notifications}
              onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
              viewMode="orders"
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              listings={sanitizedListings}
            />
          ) : activeTab === "security" ? (
            /* F. ACCOUNT SECURITY & LEDGER SETTLEMENT PANEL */
            <SecurityPanel
              currentUser={currentUser}
              orders={orders}
              onUpdateCurrentUser={(profile) => setCurrentUser(profile)}
            />
          ) : (
            /* G. SYSTEM ARCHITECTURE & SCALABILITY DASHBOARD */
            <ArchitectureDashboard />
          )}
        </main>
      </div>

      {/* 3. WIZARD CREATION MODAL */}
      {showCreateModal && (
        <ListingForm
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateListing}
        />
      )}

      {/* 5. SHOPPING CART MODAL DRAWER */}
      {showCartModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <CartAndOrders
            currentUser={currentUser}
            cart={cart}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onVerifyOrderHandover={handleVerifyOrderHandover}
            onlineUsers={onlineUsers}
            notifications={notifications}
            onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
            viewMode="cart"
            onClose={() => setShowCartModal(false)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            listings={sanitizedListings}
          />
        </div>
      )}

      {/* 6. IN-APP NOTIFICATIONS DRAWER MODAL */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 max-w-md w-full relative space-y-4">
            <button
              onClick={() => setShowNotificationsModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-brand-accent/15 text-brand-accent rounded-xl">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs">Notification Alerts Matrix</h3>
                <p className="text-[10px] text-slate-400">Live order status and checkout updates</p>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 font-medium">No alerts recorded on your account.</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">{notif.message}</p>
                      <span className="block text-[8px] text-slate-400 font-medium">
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowNotificationsModal(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Acknowledge Matrix Alerts
            </button>
          </div>
        </div>
      )}

      {/* SECURE CHECKOUT PAYMENT GATEWAY MODAL */}
      {paymentSession && (
        <CheckoutPlayground
          session={paymentSession}
          onClose={() => setPaymentSession(null)}
          onSuccess={() => {
            setPaymentSession(null);
            setActiveTab("orders");
          }}
        />
      )}

      {/* 4. FOOTER STATUS BAR */}
      <footer className="bg-white border-t border-brand-border py-3 px-6 hidden md:flex items-center justify-between text-[11px] text-brand-text-muted mt-auto z-10 shrink-0">
        <div>
          System Status: <span className="text-brand-accent font-extrabold uppercase">SECURE</span> • Encrypted Closed Network
        </div>
        <div>
          Lagos State University Teaching Hospital Internal Network © {new Date().getFullYear()}
        </div>
        <div>
          Terms of Staff Accountability • Help Desk Ext. 4402
        </div>
      </footer>
    </div>
  );
}
