const fs = require('fs');
const path = require('path');

const filePaths = [
  'app/landing/page.tsx',
  'app/auth/login/page.tsx',
  'app/auth/sign-up/page.tsx',
  'app/auth/sign-up-success/page.tsx',
  'app/auth/error/page.tsx',
  'app/dashboard/layout.tsx',
  'app/dashboard/page.tsx'
];

filePaths.forEach(relPath => {
  const p = path.join(process.cwd(), relPath);
  if (!fs.existsSync(p)) return;
  
  let content = fs.readFileSync(p, 'utf8');

  // Add next/image import if missing
  if (!content.includes("import Image from 'next/image'")) {
    content = content.replace("import Link from 'next/link'", "import Link from 'next/link'\nimport Image from 'next/image'");
  }

  // 1. Replace SIVRON red dots: SIVRON<span className="text-red-500">.</span> -> text-sky-500
  content = content.replace(/text-red-500/g, 'text-sky-500');
  
  // 2. Replace red glow and backgrounds
  content = content.replace(/bg-red-500/g, 'bg-sky-500');
  content = content.replace(/bg-red-600/g, 'bg-sky-600');
  content = content.replace(/bg-red-900/g, 'bg-sky-900');
  content = content.replace(/bg-red-50/g, 'bg-sky-50');
  
  content = content.replace(/text-red-600/g, 'text-sky-600');
  // Revert dangerous replacements if it ruins semantic colors like negative badges
  // (We'll hardcode revert for the rejected card in dashboard/page.tsx after replacing)

  content = content.replace(/border-red-500/g, 'border-sky-500');
  content = content.replace(/border-red-100/g, 'border-sky-100');
  
  content = content.replace(/from-red-600/g, 'from-sky-600');
  content = content.replace(/from-red-900/g, 'from-sky-900');
  content = content.replace(/ring-red-500/g, 'ring-sky-500');
  content = content.replace(/neon-border-red/g, 'neon-border-sky');

  // Insert Logo in landing page
  if (relPath === 'app/landing/page.tsx') {
    content = content.replace(
      /<div className="flex items-center justify-center w-10 h-10 rounded bg-sky-500 text-white font-bold">\s*S\s*<\/div>/,
      '<Image src="/bpkad-logo.png" alt="BPKAD" width={40} height={40} className="object-contain" />'
    );
    content = content.replace(/selection:bg-sky-500/g, 'selection:bg-sky-500');
  }

  // Insert Logo in dashboard layout
  if (relPath === 'app/dashboard/layout.tsx') {
    content = content.replace(
      /<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">\s*<Shield className="h-4 w-4" \/>\s*<\/div>/,
      '<div className="flex h-8 w-8 items-center justify-center bg-white rounded-lg p-1 shadow-sm"><Image src="/bpkad-logo.png" alt="BPKAD" width={24} height={24} className="object-contain" /></div>'
    );
    content = content.replace(
      /<div className="flex h-7 w-7 items-center justify-center rounded bg-sky-600 text-white md:hidden">\s*<Shield className="h-4 w-4" \/>\s*<\/div>/,
      '<div className="flex h-7 w-7 items-center justify-center bg-white rounded p-0.5 shadow-sm md:hidden"><Image src="/bpkad-logo.png" alt="BPKAD" width={20} height={20} className="object-contain" /></div>'
    );
  }

  // Insert Logo in auth pages
  const authFiles = ['app/auth/login/page.tsx', 'app/auth/sign-up/page.tsx'];
  if (authFiles.includes(relPath)) {
    content = content.replace(
      /<div className="flex items-center justify-center w-12 h-12 rounded-full border border-sky-500\/30 bg-sky-500\/10 text-sky-500">\s*<(Shield|Fingerprint) className="h-6 w-6" \/>\s*<\/div>/,
      '<div className="flex items-center justify-center w-16 h-16 bg-white rounded-2xl p-2 shadow-lg mb-4"><Image src="/bpkad-logo.png" alt="BPKAD" width={56} height={56} className="object-contain" /></div>'
    );
    content = content.replace(
      /<div className="flex items-center justify-center w-10 h-10 rounded bg-sky-500 font-bold">\s*S\s*<\/div>/,
      '<div className="flex items-center justify-center w-10 h-10 bg-white rounded p-1 shadow-sm"><Image src="/bpkad-logo.png" alt="BPKAD" width={32} height={32} className="object-contain" /></div>'
    );
  }

  if (relPath === 'app/auth/sign-up-success/page.tsx' || relPath === 'app/auth/error/page.tsx') {
    content = content.replace(
      /<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 font-bold mb-2">\s*S\s*<\/div>/,
       '<div className="flex h-12 w-12 items-center justify-center bg-white rounded p-1 shadow-sm mb-2"><Image src="/bpkad-logo.png" alt="BPKAD" width={40} height={40} className="object-contain" /></div>'
    );
  }

  // Restore destructive red for the Rejected card in dashboard stats and activity
  if (relPath === 'app/dashboard/page.tsx') {
    // "Ditolak" stat card uses red. Since we blindingly replaced red-600 with sky-600 and red-50 to sky-50, we revert them for Ditolak.
    content = content.replace(
      /title: 'Ditolak',\s*value: stats\?\.rejected \|\| 0,\s*icon: XCircle,\s*description: 'Tidak dapat diproses',\s*color: 'text-sky-600',\s*bg: 'bg-sky-50 border-sky-100',\s*gradient: 'from-sky-600',/g,
      "title: 'Ditolak',\n          value: stats?.rejected || 0,\n          icon: XCircle,\n          description: 'Tidak dapat diproses',\n          color: 'text-red-600',\n          bg: 'bg-red-50 border-red-100',\n          gradient: 'from-red-600',"
    );
    // Note: the "Total Anggaran" card was red, but changing it to sky is fine to match the sky accent requested by user.
    // hover table text-red-600
    content = content.replace(/group-hover:text-sky-600/g, 'group-hover:text-sky-600');
    // activity icon
    content = content.replace(/<Activity className="h-5 w-5 text-sky-500" \/>/g, '<Activity className="h-5 w-5 text-sky-500" />');
  }

  fs.writeFileSync(p, content, 'utf8');
});

// Update globals.css to change neon-border-red to neon-border-sky
const globalsFile = path.join(process.cwd(), 'app/globals.css');
if (fs.existsSync(globalsFile)) {
    let g = fs.readFileSync(globalsFile, 'utf8');
    g = g.replace(/\.neon-border-red/g, '.neon-border-sky');
    g = g.replace(/0 0 15px rgba\(239, 68, 68, 0\.5\)/g, '0 0 15px rgba(14, 165, 233, 0.5)');
    g = g.replace(/border-color: rgba\(239, 68, 68, 0\.8\)/g, 'border-color: rgba(14, 165, 233, 0.8)');
    fs.writeFileSync(globalsFile, g, 'utf8');
}

console.log("UI updated!");
