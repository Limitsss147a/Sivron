import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Shield, CheckCircle2, Mail, ArrowRight } from 'lucide-react'

export default function SignUpSuccessPage() {
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

        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="text-center pb-6">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 border border-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-gray-900">Registrasi Berhasil</h2>
            <div className="w-12 h-1 bg-sky-500 rounded-full mx-auto mt-4 mb-4"></div>
            <p className="text-sm text-gray-500">
              Akun Anda telah ditambahkan ke sistem
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-xl bg-gray-50 p-5 border border-gray-100">
              <div className="flex items-start gap-4">
                <Mail className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-gray-900">Verifikasi Email</h3>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    Link otentikasi telah dikirim ke email Anda. Silakan verifikasi untuk mengaktifkan akses penuh ke portal.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button asChild className="w-full h-14 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold tracking-widest uppercase text-sm transition-transform hover:scale-[1.02]">
                <Link href="/auth/login">
                  LANJUT KE PORTAL LOGIN <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              Tidak menerima email? Cek folder spam atau{' '}
              <Link href="/auth/sign-up" className="text-sky-600 hover:text-red-700 font-medium">
                daftar ulang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
