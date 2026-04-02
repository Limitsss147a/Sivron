-- Add 4 admin review fields to budgets table
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS review_bapperida VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS review_setda VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS review_anggaran VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS review_aset VARCHAR(50) DEFAULT 'pending';
