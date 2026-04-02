-- Menambahkan kolom admin_role untuk mendukung pemisahan posisi Admin
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS admin_role VARCHAR(50);

-- Jadikan semua admin yang sudah ada saat ini sebagai superadmin agar tidak ada yang error
UPDATE profiles
SET admin_role = 'superadmin'
WHERE role = 'admin';
