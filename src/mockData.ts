import { Listing, UserProfile, MasterCatalogItem, ListingCategory } from "./types";

export const SAMPLE_STAFF_IDS = [
  {
    id: "nurse_janet",
    displayName: "Nurse Janet Balogun",
    staffId: "LASUTH/NR/2024/0981",
    department: "Nursing Services",
    email: "jbalogun@lasuth.org.ng",
    phone: "+234 803 123 4567",
    avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&q=80&w=120",
    roleText: "Nursing Officer II",
    role: "seller" as const,
    oracleNumber: "Oracle-9810",
    verified: true,
    bankLinked: true,
    bankName: "Zenith Bank PLC",
    bankAccountNumber: "1012938475",
    bankAccountName: "JANET BALOGUN"
  },
  {
    id: "doctor_olumide",
    displayName: "Dr. Olumide Coker",
    staffId: "LASUTH/MD/2023/1104",
    department: "Surgery & Clinical Medicine",
    email: "ocoker@lasuth.org.ng",
    phone: "+234 812 987 6543",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120",
    roleText: "Senior Registrar",
    role: "buyer" as const,
    oracleNumber: "Oracle-1104",
    verified: true,
    bankLinked: false
  },
  {
    id: "admin_tunde",
    displayName: "Mr. Tunde Bakare",
    staffId: "LASUTH/AD/2021/0452",
    department: "Hospital Administration",
    email: "tbakare@lasuth.org.ng",
    phone: "+234 905 444 3322",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    roleText: "Assistant Director of Admin",
    role: "admin" as const,
    oracleNumber: "Oracle-4520",
    verified: true,
    bankLinked: false
  },
  {
    id: "pharmacist_amaka",
    displayName: "Pharm. Amaka Eze",
    staffId: "LASUTH/PH/2025/0231",
    department: "Pharmacy Department",
    email: "aeze@lasuth.org.ng",
    phone: "+234 708 555 9876",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
    roleText: "Clinical Pharmacist",
    role: "buyer" as const,
    oracleNumber: "Oracle-2310",
    verified: true,
    bankLinked: false
  }
];

export const MASTER_CATALOG: MasterCatalogItem[] = [
  // A. Clothing, Fashion & Apparel
  {
    id: "barco_one_scrubs",
    title: "Premium Barco One Medical Scrubs",
    category: "Clothing, Fashion & Apparel",
    subcategory: "Medical Apparels",
    description: "Eco-friendly, moisture-wicking medical scrub set featuring 4-way spandex stretch, anti-static technology, and clinical comfort.",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
    avgPrice: 32000
  },
  {
    id: "clinical_lab_coat",
    title: "Unisex White Clinical Lab Coat",
    category: "Clothing, Fashion & Apparel",
    subcategory: "Medical Apparels",
    description: "Anti-fluid, professional white clinical lab coat. Double stitched seams with multi-pockets ideal for stethoscopes and tablets.",
    imageUrl: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=600",
    avgPrice: 8500
  },
  {
    id: "theatre_caps_pack",
    title: "Reusable Surgical Theatre Caps (5-Pack)",
    category: "Clothing, Fashion & Apparel",
    subcategory: "Medical Apparels",
    description: "Comfortable breathable surgical caps, adjustable straps, friendly patterns for pediatrics, autoclave-safe cotton fabric.",
    imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600",
    avgPrice: 4000
  },
  {
    id: "mens_oxford_shirt",
    title: "Men's Formal Oxford Cotton Shirt",
    category: "Clothing, Fashion & Apparel",
    subcategory: "Corporate & Casual Wear",
    description: "Premium cotton long-sleeved Oxford shirt, perfect for official admin duty, clinical presentations, or outpatient clinics.",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
    avgPrice: 12500
  },
  {
    id: "womens_office_dress",
    title: "Women's Elegant Corporate Shift Dress",
    category: "Clothing, Fashion & Apparel",
    subcategory: "Corporate & Casual Wear",
    description: "Professional knee-length short-sleeve corporate shift dress, breathable fabric suitable for clinical office environments.",
    imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=600",
    avgPrice: 15000
  },
  {
    id: "crocs_medical_clogs",
    title: "Crocs Classic Unisex Medical Clogs",
    category: "Clothing, Fashion & Apparel",
    subcategory: "Footwear",
    description: "Slip-resistant, ultra-cushioned clogs with orthopedic back support. Standard footwear for long theater operations and 24-hr shifts.",
    imageUrl: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=600",
    avgPrice: 18000
  },
  {
    id: "casual_sneakers",
    title: "Ergonomic Ward-Walk Running Sneakers",
    category: "Clothing, Fashion & Apparel",
    subcategory: "Footwear",
    description: "Mesh-ventilated sneakers with memory foam insoles designed for doctors and nurses walking long ICU corridors.",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    avgPrice: 22000
  },
  {
    id: "leather_wrist_watch",
    title: "Minimalist Leather Strap Dress Watch",
    category: "Clothing, Fashion & Apparel",
    subcategory: "Accessories",
    description: "Sleek wristwatch with a sweep second-hand, essential for clinical staff when taking vital pulse/respiration rates manually.",
    imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600",
    avgPrice: 25000
  },
  {
    id: "id_lanyard_holder",
    title: "Heavy Duty Retractable ID Lanyard Badge Reel",
    category: "Clothing, Fashion & Apparel",
    subcategory: "Accessories",
    description: "Reinforced steel wire badge holder, clips securely onto clinical uniforms, protecting LASUTH biometric authorization cards.",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
    avgPrice: 1500
  },

  // B. Food, Beverages & Groceries
  {
    id: "coke_cold",
    title: "Chilled Coca-Cola Pet Bottle (50cl)",
    category: "Food, Beverages & Groceries",
    subcategory: "Cold Drinks & Refreshes",
    description: "Ice-cold refreshing Coca-Cola classic bottle to keep you cool and energized during intensive ward runs.",
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600",
    avgPrice: 500
  },
  {
    id: "eva_water_75cl",
    title: "Chilled Eva Table Water (75cl)",
    category: "Food, Beverages & Groceries",
    subcategory: "Cold Drinks & Refreshes",
    description: "Pure, chilled natural spring water. Crucial for clinical hydration inside hot outpatient clinic cubicles.",
    imageUrl: "https://images.unsplash.com/photo-1608885898957-a599fb1698d6?auto=format&fit=crop&q=80&w=600",
    avgPrice: 300
  },
  {
    id: "fresh_pie",
    title: "Fresh Baked Beef Meat Pie",
    category: "Food, Beverages & Groceries",
    subcategory: "Meals & Snacks",
    description: "Buttery, flaky traditional Nigerian meat pie baked fresh daily and stuffed with perfectly seasoned ground beef and potatoes.",
    imageUrl: "https://images.unsplash.com/photo-1601561966197-4a212374013d?auto=format&fit=crop&q=80&w=600",
    avgPrice: 1500
  },
  {
    id: "rice_chicken_lunch",
    title: "LASUTH Staff Lunch Pack: Jollof Rice & Chicken",
    category: "Food, Beverages & Groceries",
    subcategory: "Meals & Snacks",
    description: "Flavourful Nigerian Jollof Rice served with a jumbo piece of grilled peppered chicken and plantain. Packed sanitarily in a microwaveable pack.",
    imageUrl: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&q=80&w=600",
    avgPrice: 3800
  },
  {
    id: "peak_milk_powder",
    title: "Peak Full Cream Milk Powder (350g)",
    category: "Food, Beverages & Groceries",
    subcategory: "Packaged Provisions",
    description: "Rich, creamy, instant full cream milk powder fortified with vitamins. Ideal pantry supply for clinical staff call rooms.",
    imageUrl: "https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&q=80&w=600",
    avgPrice: 2800
  },
  {
    id: "milo_refill",
    title: "Nestle Milo Chocolate Malt Refill (400g)",
    category: "Food, Beverages & Groceries",
    subcategory: "Packaged Provisions",
    description: "Standard energizing chocolate malt drink mix, fortified with Activ-Go. Keep your stamina high during overnight clinical watches.",
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=600",
    avgPrice: 3100
  },

  // C. Phones, Electronics & Computing
  {
    id: "ipad_air",
    title: "Apple iPad Air (Wi-Fi, 64GB)",
    category: "Phones, Electronics & Computing",
    subcategory: "Mobile Devices",
    description: "Highly performant tablet for taking clinical notes, reviewing laboratory results, radiographies, and on-the-go studies.",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600",
    avgPrice: 240000
  },
  {
    id: "oraimo_power_bank",
    title: "Oraimo Traveler 20000mAh Power Bank",
    category: "Phones, Electronics & Computing",
    subcategory: "Mobile Devices",
    description: "High-speed 20W charging battery pack. Ensures your smart devices never run out of battery during power cuts on the wards.",
    imageUrl: "https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?auto=format&fit=crop&q=80&w=600",
    avgPrice: 18500
  },
  {
    id: "hp_250_g9_laptop",
    title: "HP 250 G9 Core i5 Office Laptop",
    category: "Phones, Electronics & Computing",
    subcategory: "Office & Ward Tech",
    description: "Secure, reliable computing laptop with 8GB RAM, 512GB SSD. Perfect for clinical presentation preparation and statistical researches.",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600",
    avgPrice: 385000
  },
  {
    id: "sandisk_usb_64gb",
    title: "SanDisk Ultra 64GB USB Flash Drive",
    category: "Phones, Electronics & Computing",
    subcategory: "Office & Ward Tech",
    description: "Compact USB 3.0 flash drive. Securely transfer research datasets, department clinical presentations, and PDF medical textbooks.",
    imageUrl: "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?auto=format&fit=crop&q=80&w=600",
    avgPrice: 4500
  },
  {
    id: "rechargeable_desk_fan",
    title: "Rechargeable 12-Inch Ward Desk Fan",
    category: "Phones, Electronics & Computing",
    subcategory: "Office & Ward Tech",
    description: "Quiet portable fan with powerful air delivery and built-in lithium battery. Keeps clinical work desks ventilated during outages.",
    imageUrl: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=600",
    avgPrice: 16500
  },
  {
    id: "bailey_love_surgery",
    title: "Bailey & Love's Short Practice of Surgery",
    category: "Phones, Electronics & Computing",
    subcategory: "Office & Ward Tech",
    description: "The definitive medical and surgical text for training surgeons, clinical students, and surgical ward reference.",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
    avgPrice: 45000
  },
  {
    id: "littmann_stethoscope",
    title: "Littmann Classic III Stethoscope",
    category: "Phones, Electronics & Computing",
    subcategory: "Office & Ward Tech",
    description: "The industry-standard acoustic stethoscope for clinical diagnostic assessments. Precision double-sided chestpiece with tunable diaphragms.",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600",
    avgPrice: 68000
  },
  {
    id: "philips_airfryer",
    title: "Philips Airfryer (2.4L)",
    category: "Phones, Electronics & Computing",
    subcategory: "Office & Ward Tech",
    description: "Healthy cooking companion ideal for clinical staff residences and call room kitchens. Rapid Air technology allows fat-free cooking.",
    imageUrl: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=600",
    avgPrice: 55000
  },

  // D. Health, Beauty & Personal Care
  {
    id: "nivea_body_lotion",
    title: "Nivea Essentially Enriched Body Lotion (500ml)",
    category: "Health, Beauty & Personal Care",
    subcategory: "Skincare",
    description: "Intense moisture lotion infused with deep moisture serum and almond oil. Protects skin against constant medical glove drying effects.",
    imageUrl: "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=600",
    avgPrice: 5500
  },
  {
    id: "smart_collection_perfume",
    title: "Smart Collection Pocket Perfume (15ml)",
    category: "Health, Beauty & Personal Care",
    subcategory: "Deodorants/Perfumes",
    description: "Long-lasting, pocket-friendly concentrated fragrance spray. Keeps clinical personnel fresh during exhausting 12-hour shifts.",
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
    avgPrice: 3500
  },
  {
    id: "hand_sanitizer_500ml",
    title: "Instant Aloe-Vera Hand Sanitizer (500ml)",
    category: "Health, Beauty & Personal Care",
    subcategory: "Hand Sanitizers",
    description: "70% isopropyl alcohol sanitizer gel. Rapidly kills 99.9% of bacteria/viruses. Pump bottle ideal for on-desk clinical triage.",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600",
    avgPrice: 2000
  },
  {
    id: "pocket_disinfectant_wipes",
    title: "Dettol Multi-Surface Disinfectant Wipes (10-Pack)",
    category: "Health, Beauty & Personal Care",
    subcategory: "Pocket-sized Disinfectants",
    description: "Antibacterial wipes ideal for rapid sanitizing of personal ward keys, stethoscope tubes, diagnostic screens, and clinic tablets.",
    imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=600",
    avgPrice: 1500
  }
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "mock_1",
    catalogItemId: "littmann_stethoscope",
    title: "Littmann Classic III Stethoscope (Navy Blue)",
    description: "Selling my spare Littmann Classic III Stethoscope in Navy Blue. Only used for 3 months during pediatric rotation. Acoustic sensitivity is absolutely pristine. Handing it over with original box and extra eartips. Comports with all sanitation policies.",
    price: 68000,
    category: "Phones, Electronics & Computing",
    subcategory: "Office & Ward Tech",
    condition: "Like New",
    sellerId: "doctor_olumide",
    sellerName: "Dr. Olumide Coker",
    sellerDepartment: "Surgery & Clinical Medicine",
    sellerWard: "Surgical Ward C",
    sellerPhone: "+234 812 987 6543",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600",
    status: "active",
    aiPassed: true,
    aiReason: "Approved peer-to-peer personal medical equipment (stethoscope). Clear of institutional inventory lists.",
    aiSuggestedPrice: 70000,
    aiEnhancedDesc: "### Littmann Classic III Stethoscope - Navy Blue\n\nUp for resale is an authentic **Littmann Classic III Stethoscope** in pristine condition. This high-performance diagnostic tool features high acoustic sensitivity perfect for physical assessments.\n\n* **Condition:** Like New (only 3 months light clinical rotation use)\n* **Color:** Navy Blue\n* **Included:** Original box, spare ear tips, instruction manual\n* **Sanitation:** Fully disinfected with medical-grade isopropyl alcohol (70%) prior to handover.\n\nGreat deal for junior doctors, medical students, or nursing colleagues. Meet at the **Main Cafeteria** for secure handover!",
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  },
  {
    id: "mock_2",
    catalogItemId: "barco_one_scrubs",
    title: "Premium Barco One Medical Scrubs (Teal, Medium)",
    description: "Set of two Barco One moisture-wicking scrub suits. Color is Royal Teal, Size Medium. Incredibly soft, breathable, and perfect for long 12-hour shifts. No stains, tears or color fading.",
    price: 32000,
    category: "Clothing, Fashion & Apparel",
    subcategory: "Medical Apparels",
    condition: "Gently Used",
    sellerId: "nurse_janet",
    sellerName: "Nurse Janet Balogun",
    sellerDepartment: "Nursing Services",
    sellerWard: "Maternity Ward B",
    sellerPhone: "+234 803 123 4567",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
    status: "active",
    aiPassed: true,
    aiReason: "Standard personal clinical attire. Clear under hospital policy.",
    aiSuggestedPrice: 30000,
    aiEnhancedDesc: "### Premium Barco One Scrub Sets (Teal)\n\nStay comfortable during those marathon shifts with this premium set of two **Barco One** medical scrubs.\n\n* **What's included:** 2 complete sets (Tops & Pants)\n* **Color:** Teal / Royal Teal\n* **Size:** Medium (unisex fit)\n* **Key details:** Moisture-wicking fabric, 4-way stretch, anti-static technology. Professionally laundered and sanitarily packed for instant clinical use.\n\nSave over 50% compared to importing brand new sets! Ideal for ward rounds or theater duty.",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: "mock_3",
    catalogItemId: "bailey_love_surgery",
    title: "Bailey & Love's Short Practice of Surgery (27th Edition)",
    description: "The gold-standard textbook for surgical training. 27th edition, complete hardcover volume. Has some light highlighter marks on gastrointestinal surgery chapters, but spine is strong and pages are in excellent condition. Mandatory for clinical students and residents.",
    price: 45000,
    category: "Phones, Electronics & Computing",
    subcategory: "Office & Ward Tech",
    condition: "Gently Used",
    sellerId: "doctor_olumide",
    sellerName: "Dr. Olumide Coker",
    sellerDepartment: "Surgery & Clinical Medicine",
    sellerWard: "Surgical Ward C",
    sellerPhone: "+234 812 987 6543",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
    status: "active",
    aiPassed: true,
    aiReason: "Medical reference textbook. Fully approved.",
    aiSuggestedPrice: 42000,
    aiEnhancedDesc: "### Bailey & Love's Short Practice of Surgery - 27th Edition\n\nA absolute must-have reference for surgical residents and clinical students alike. \n\n* **Title:** Bailey & Love's Short Practice of Surgery (27th Ed)\n* **Binding:** Hardcover\n* **Condition:** Excellent (Strong spine, no torn pages, very minor clinical pencil highlights in gastrointestinal sections)\n\nSkip the bookshops and pick this up directly within the hospital gates. Ready for pickup at the **College of Medicine Lawn**.",
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "mock_4",
    catalogItemId: "philips_airfryer",
    title: "Philips Daily Collection Airfryer (2.4L)",
    description: "Selling a Philips Airfryer. Clean, works 100% perfectly. Great for quick fat-free meals in the staff quarters after a busy night shift. Easy to wash. Fits perfectly in small doctor/nurse residence kitchens.",
    price: 55000,
    category: "Phones, Electronics & Computing",
    subcategory: "Office & Ward Tech",
    condition: "Gently Used",
    sellerId: "pharmacist_amaka",
    sellerName: "Pharm. Amaka Eze",
    sellerDepartment: "Pharmacy Department",
    sellerWard: "Main Pharmacy Wing",
    sellerPhone: "+234 708 555 9876",
    imageUrl: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=600",
    status: "active",
    aiPassed: true,
    aiReason: "Standard household kitchen appliance. Approved.",
    aiSuggestedPrice: 50000,
    aiEnhancedDesc: "### Philips Daily Collection Airfryer (2.4L)\n\nSimplify your cooking after intense ward duties with this highly efficient **Philips Airfryer**.\n\n* **Capacity:** 2.4L (Perfect for single-portion meals or pairs)\n* **Technology:** Rapid Air technology for crispy fries and chicken with up to 90% less oil\n* **Bonus:** Fully cleaned, sanitized, and ready for your kitchen counter\n\nA lifesaver for on-call hospital workers in the staff quarters. Easy to use and quick to wash.",
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "mock_5",
    catalogItemId: "ipad_air",
    title: "iPad Air (4th Generation, 64GB, Wi-Fi, Space Gray)",
    description: "Selling my iPad Air 4, 64GB. iPad is in excellent condition, screen has had a screen protector since day one. Comes with original Apple charger and a rugged black case. I used it for reading radiology scans, journal articles, and taking notes. Selling because I upgraded.",
    price: 240000,
    category: "Phones, Electronics & Computing",
    subcategory: "Mobile Devices",
    condition: "Like New",
    sellerId: "admin_tunde",
    sellerName: "Mr. Tunde Bakare",
    sellerDepartment: "Hospital Administration",
    sellerWard: "Admin Block Ground Floor",
    sellerPhone: "+234 905 444 3322",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600",
    status: "active",
    aiPassed: true,
    aiReason: "Personal electronics device. Approved.",
    aiSuggestedPrice: 245000,
    aiEnhancedDesc: "### Apple iPad Air (4th Gen, 64GB, Space Gray)\n\nA powerful, high-resolution tablet ideal for study, clinical notes, or reviewing medical imagery.\n\n* **Model:** iPad Air 4th Generation\n* **Storage:** 64GB\n* **Connectivity:** Wi-Fi\n* **Condition:** Like New (always in protective case with screen guard)\n* **Accessories included:** Original fast charger, high-quality black protective folio case\n\nPerfect for doctors, pharmacists, and managers wanting to paperless-ly manage schedules, read e-journals, or run diagnostic software.",
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "mock_6",
    catalogItemId: "coke_cold",
    title: "Chilled Coca-Cola Classic (35cl Bottle)",
    description: "Super cold Coca-Cola bottles straight from the Nursing lounge refrigerator. Perfect for quick relief during heavy clinical shift rotations.",
    price: 450,
    category: "Food, Beverages & Groceries",
    subcategory: "Cold Drinks & Refreshes",
    condition: "New",
    sellerId: "nurse_janet",
    sellerName: "Nurse Janet Balogun",
    sellerDepartment: "Nursing Services",
    sellerWard: "Maternity Ward B",
    sellerPhone: "+234 803 123 4567",
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600",
    status: "active",
    aiPassed: true,
    aiReason: "Approved standard personal refreshment (Cold drink).",
    aiSuggestedPrice: 400,
    aiEnhancedDesc: "### Chilled Coca-Cola (35cl Bottle)\n\nBeat the heat with ice-cold Coca-Cola straight from our ward staff mini-fridge.",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: "mock_7",
    catalogItemId: "coke_cold",
    title: "Chilled Coca-Cola (35cl Bottle)",
    description: "Ice cold Coke available for immediate pick-up in the pharmacy wing. Refreshing and sweet.",
    price: 500,
    category: "Food, Beverages & Groceries",
    subcategory: "Cold Drinks & Refreshes",
    condition: "New",
    sellerId: "pharmacist_amaka",
    sellerName: "Pharm. Amaka Eze",
    sellerDepartment: "Pharmacy Department",
    sellerWard: "Main Pharmacy Wing",
    sellerPhone: "+234 708 555 9876",
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600",
    status: "active",
    aiPassed: true,
    aiReason: "Approved standard personal refreshment (Cold drink).",
    aiSuggestedPrice: 400,
    aiEnhancedDesc: "### Chilled Coca-Cola (35cl Bottle)\n\nBeat the heat with ice-cold Coca-Cola straight from our ward staff mini-fridge.",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: "mock_8",
    catalogItemId: "fresh_pie",
    title: "Fresh Baked Beef Meat Pie",
    category: "Food, Beverages & Groceries",
    subcategory: "Meals & Snacks",
    description: "Extra flaky and delicious meat pie made with seasoned ground beef. Warm and ready to eat.",
    price: 1400,
    condition: "New",
    sellerId: "nurse_janet",
    sellerName: "Nurse Janet Balogun",
    sellerDepartment: "Nursing Services",
    sellerWard: "Maternity Ward B",
    sellerPhone: "+234 803 123 4567",
    imageUrl: "https://images.unsplash.com/photo-1601561966197-4a212374013d?auto=format&fit=crop&q=80&w=600",
    status: "active",
    aiPassed: true,
    aiReason: "Approved personal pastry/snack resale.",
    aiSuggestedPrice: 1500,
    aiEnhancedDesc: "### Fresh Baked Beef Meat Pie\n\nFreshly baked, deliciously seasoned beef pie perfect for on-the-go snack during clinic.",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  }
];

export const HANDOVER_ZONES = [
  "Main Hospital Cafeteria",
  "Fountain Garden Plaza",
  "College of Medicine Lawn",
  "Admin Block Foyer",
  "Main Pharmacy Reception",
  "Accident & Emergency (A&E) Staff Lounge"
];

export const CATEGORIES: ListingCategory[] = [
  "Clothing, Fashion & Apparel",
  "Food, Beverages & Groceries",
  "Phones, Electronics & Computing",
  "Health, Beauty & Personal Care"
];

export const SUBCATEGORIES: Record<ListingCategory, string[]> = {
  "Clothing, Fashion & Apparel": [
    "Medical Apparels",
    "Corporate & Casual Wear",
    "Footwear",
    "Accessories"
  ],
  "Food, Beverages & Groceries": [
    "Cold Drinks & Refreshes",
    "Meals & Snacks",
    "Packaged Provisions"
  ],
  "Phones, Electronics & Computing": [
    "Mobile Devices",
    "Office & Ward Tech"
  ],
  "Health, Beauty & Personal Care": [
    "Skincare",
    "Deodorants/Perfumes",
    "Hand Sanitizers",
    "Pocket-sized Disinfectants",
    "Hair Care"
  ]
};

export const CONDITIONS = ["New", "Open Box", "Like New", "Gently Used", "Fair"];

export const LASUTH_WARDS = [
  "Maternity Ward A",
  "Maternity Ward B",
  "Surgical Ward C",
  "Surgical Ward D",
  "Pediatric Ward I",
  "Pediatric Ward II",
  "Emergency Ward I",
  "Emergency Ward II",
  "Intensive Care Unit (ICU)",
  "Male Medical Ward",
  "Female Medical Ward",
  "Main Pharmacy Wing",
  "Admin Block Ground Floor",
  "Admin Block First Floor",
  "Outpatient Department (OPD)"
];
