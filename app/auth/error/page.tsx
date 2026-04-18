'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Shield, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Terjadi kesalahan saat autentikasi'

  return (
    <div className="flex min-h-screen w-full items-center justify-center diamond-pattern bg-white p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 font-bold mb-2">
             <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold tracking-tighter">
              SIVRON<span className="text-sky-500">.</span>
            </h1>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-sky-100">
          <div className="text-center pb-6">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 border border-sky-100">
              <AlertTriangle className="h-10 w-10 text-sky-500" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-gray-900">Akses Ditolak</h2>
            <div className="w-12 h-1 bg-sky-500 rounded-full mx-auto mt-4 mb-4"></div>
            <p className="text-sm font-medium text-sky-600">
              {message}
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-xl bg-gray-50 p-5 border border-gray-100">
               <p className="text-xs font-bold tracking-wide uppercase text-gray-500 mb-3">
                 KEMUNGKINAN PENYEBAB:
               </p>
              <ul className="space-y-2 text-xs text-gray-600 list-disc list-inside">
                <li>Sesi otentikasi telah kedaluwarsa</li>
                <li>Kredensial email/sandi tidak valid</li>
                <li>Akun belum melewati proses verifikasi</li>
                <li>Masalah pada Gateway koneksi</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button asChild className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold tracking-widest uppercase text-sm transition-transform hover:scale-[1.02]">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" /> KEMBALI KE LOGIN
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-bold tracking-widest uppercase text-sm text-gray-600">
                <Link href="/auth/sign-up">
                  <RefreshCw className="mr-2 h-4 w-4" /> DAFTAR ULANG
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white diamond-pattern">
        <div className="animate-pulse flex flex-col items-center gap-4">
           <Shield className="w-8 h-8 text-sky-500" />
           <div className="font-mono text-xs tracking-widest text-gray-400">MEMUAT...</div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
