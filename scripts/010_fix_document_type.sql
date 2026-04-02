-- Fix budget_documents document_type constraint
ALTER TABLE budget_documents 
DROP CONSTRAINT IF EXISTS budget_documents_document_type_check;

-- Optionally, add the new constraint
ALTER TABLE budget_documents 
ADD CONSTRAINT budget_documents_document_type_check 
CHECK (document_type IN ('rab', 'tor', 'rkakl', 'supporting', 'other', 'nota_dinas', 'rka_dpa'));

-- Drop unused table (Rincian Anggaran items)
DROP TABLE IF EXISTS budget_items CASCADE;
