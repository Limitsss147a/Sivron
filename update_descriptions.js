const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'app/layout.tsx',
    find: "description: 'Sistem penganggaran elektronik SIVRON untuk pengelolaan dan pengajuan anggaran pemerintah daerah secara digital, transparan, dan akuntabel.',",
    replace: "description: 'Sistem Verifikasi RKA Online SIVRON untuk pengelolaan dan pengajuan anggaran secara digital, transparan, dan akuntabel.',"
  },
  {
    file: 'app/landing/page.tsx',
    find: "Fiscal Command Center",
    replace: "Sistem Verifikasi RKA Online"
  },
  {
    file: 'app/landing/page.tsx',
    find: "SISTEM INFORMASI ANGGARAN",
    replace: "SISTEM VERIFIKASI RKA ONLINE"
  },
  {
    file: 'app/landing/page.tsx',
    find: "Platform tata kelola fiskal daerah",
    replace: "Sistem verifikasi RKA online"
  },
  {
    file: 'app/landing/page.tsx',
    find: "SIVRON FISCAL COMMAND CENTER",
    replace: "SIVRON SISTEM VERIFIKASI RKA ONLINE"
  },
  {
    file: 'app/dashboard/layout.tsx',
    find: "Command Center",
    replace: "Sistem Verifikasi RKA Online"
  },
  {
    file: 'app/auth/sign-up/page.tsx',
    find: "SIVRON FISCAL COMMAND CENTER",
    replace: "SIVRON SISTEM VERIFIKASI RKA ONLINE"
  },
  {
    file: 'app/auth/login/page.tsx',
    find: "SIVRON FISCAL COMMAND CENTER",
    replace: "SIVRON SISTEM VERIFIKASI RKA ONLINE"
  }
];

replacements.forEach(({ file, find, replace }) => {
  const p = path.join(process.cwd(), file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.split(find).join(replace);
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated ${file}: replaced "${find}" with "${replace}"`);
  }
});
