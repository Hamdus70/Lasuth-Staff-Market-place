-- ==========================================================
-- LASUTH Internal Staff Marketplace Database Migration File
-- Target Platform: PostgreSQL (Cloud SQL)
-- Purpose: Biometric Onboarding Schema & Ledger Tracking
-- ==========================================================

-- 1. Append FROZEN_FLAGGED status enum to user table (if it exists as enum)
-- PostgreSQL handles enum addition. We guard with exception block for repeat runs.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum') THEN
        CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'FROZEN_FLAGGED', 'INACTIVE');
    ELSE
        -- Add value if not exists (PostgreSQL 12+)
        ALTER TYPE user_status_enum ADD VALUE IF NOT EXISTS 'FROZEN_FLAGGED';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create Biometric Onboarding & Verification Tracking Table
CREATE TABLE IF NOT EXISTS vendor_biometric_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- references users(id) in full relational database, mapped dynamically to Firestore uid
    lasuth_id_url VARCHAR(255) NOT NULL,
    selfie_biometric_hash TEXT NOT NULL,
    confidence_score NUMERIC(5, 2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    fallback_document_type VARCHAR(50) CHECK (fallback_document_type IN ('NIN', 'PASSPORT', NULL)),
    fallback_document_url VARCHAR(255),
    verification_attempts INT DEFAULT 1,
    admin_reviewed_by UUID, -- references users(id)
    admin_review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP    
);

-- 3. High-Performance Index for fast lookup during onboarding checks
CREATE INDEX IF NOT EXISTS idx_vendor_verification_user ON vendor_biometric_verifications(user_id);

-- 4. Ledger Tracking for hospital ICT infrastructure ₦50 split fee clearing
CREATE TABLE IF NOT EXISTS split_fee_ledger_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) NOT NULL,
    seller_id UUID NOT NULL,
    buyer_id UUID NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    split_fee_amount NUMERIC(12, 2) DEFAULT 50.00,
    net_payout NUMERIC(12, 2) NOT NULL,
    cleared_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_split_fee_seller ON split_fee_ledger_logs(seller_id);
