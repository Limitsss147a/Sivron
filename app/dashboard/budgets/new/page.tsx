'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/use-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { ArrowLeft, Save, Send, FileText, UploadCloud } from 'lucide-react'
import Link from 'next/link'

export default function NewBudgetPage() {
  const router = useRouter()
  const { profile, isLoading: profileLoading } = useProfile()
  const [title, setTitle] = useState('')
  const [notaDinasFile, setNotaDinasFile] = useState<File | null>(null)
  const [rkaDpaFile, setRkaDpaFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(asDraft: boolean) {
    if (!title.trim()) {
      toast.error('Judul pengajuan wajib diisi')
      return
    }

    if (!notaDinasFile) {
      toast.error('File Nota Dinas wajib diunggah')
      return
    }

    if (!rkaDpaFile) {
      toast.error('File RKA/DPA wajib diunggah')
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    try {
      // Get active fiscal year
      const { data: fiscalYear } = await supabase
        .from('fiscal_years')
        .select('id')
        .eq('is_active', true)
        .single()

      if (!fiscalYear) {
        toast.error('Tidak ada tahun anggaran aktif')
        return
      }

      // Create budget
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          title,
          institution_id: profile!.institution_id,
          fiscal_year_id: fiscalYear.id,
          submitted_by: profile!.id,
          status: 'draft', // Always draft initially
          submission_date: asDraft ? null : new Date().toISOString(),
          total_amount: 0,
        })
        .select()
        .single()

      if (budgetError) throw budgetError

      // Insert budget documents
      const docsToUpload = []
      
      const notaExt = notaDinasFile.name.split('.').pop()
      const notaFileName = `${budget.id}/nota_dinas_${Math.random().toString(36).substring(2, 9)}.${notaExt}`
      const { error: notaUploadError } = await supabase.storage.from('budget_documents').upload(notaFileName, notaDinasFile)
      if (notaUploadError) {
        console.error('Nota Dinas upload error:', notaUploadError)
        toast.error('Gagal mengunggah file Nota Dinas: ' + notaUploadError.message)
      } else {
        docsToUpload.push({
          budget_id: budget.id,
          file_name: notaDinasFile.name,
          file_path: notaFileName,
          file_type: notaDinasFile.type || 'application/octet-stream',
          file_size: notaDinasFile.size,
          document_type: 'nota_dinas',
          uploaded_by: profile!.id
        })
      }

      const rkaExt = rkaDpaFile.name.split('.').pop()
      const rkaFileName = `${budget.id}/rka_dpa_${Math.random().toString(36).substring(2, 9)}.${rkaExt}`
      const { error: rkaUploadError } = await supabase.storage.from('budget_documents').upload(rkaFileName, rkaDpaFile)
      if (rkaUploadError) {
        console.error('RKA/DPA upload error:', rkaUploadError)
        toast.error('Gagal mengunggah file RKA/DPA: ' + rkaUploadError.message)
      } else {
        docsToUpload.push({
          budget_id: budget.id,
          file_name: rkaDpaFile.name,
          file_path: rkaFileName,
          file_type: rkaDpaFile.type || 'application/octet-stream',
          file_size: rkaDpaFile.size,
          document_type: 'rka_dpa',
          uploaded_by: profile!.id
        })
      }

      if (docsToUpload.length > 0) {
        const { error: docsInsertError } = await supabase.from('budget_documents').insert(docsToUpload)
        if (docsInsertError) {
          console.error('Documents insert error:', docsInsertError)
        }
      }

      if (!asDraft) {
        const { error: updateError } = await supabase
          .from('budgets')
          .update({ status: 'submitted' })
          .eq('id', budget.id)
        if (updateError) throw updateError
      }

      toast.success(asDraft ? 'Pengajuan berhasil disimpan sebagai draft' : 'Pengajuan RKA/DPA berhasil diajukan')
      router.push('/dashboard/budgets')
    } catch (error: any) {
      console.error('Error saving budget:', error?.message || error)
      toast.error(`Gagal menyimpan: ${error?.message || 'Terjadi kesalahan sistem'}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (profileLoading) return <div className="flex h-64 items-center justify-center"><Spinner className="h-8 w-8" /></div>

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/budgets"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buat Pengajuan RKA/DPA Baru</h1>
          <p className="text-muted-foreground">Silakan melengkapi dokumen pengajuan RKA/DPA</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SKPD Pengusul</CardTitle>
          <CardDescription>Informasi Instansi yang mengajukan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Instansi / SKPD</Label>
            <Input value={profile?.institution?.name || ''} disabled className="bg-muted text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Judul Pengajuan *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pengajuan RKA-DPA TA 2026"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dokumen Pendukung</CardTitle>
          <CardDescription>Unggah file Nota Dinas dan RKA/DPA yang bersangkutan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>1. Nota Dinas *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20 text-center hover:bg-muted/40 transition-colors">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                {notaDinasFile ? (
                  <div className="text-sm">
                    <p className="font-medium text-primary truncate max-w-[200px]">{notaDinasFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(notaDinasFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Pilih file dokumen</p>
                )}
                <div className="mt-4">
                  <Label htmlFor="nota_dinas_upload" className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-3">
                    <UploadCloud className="mr-2 h-3 w-3" />
                    Pilih File
                  </Label>
                  <Input id="nota_dinas_upload" type="file" className="hidden" onChange={(e) => setNotaDinasFile(e.target.files?.[0] || null)} disabled={isSaving} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>2. RKA/DPA *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20 text-center hover:bg-muted/40 transition-colors">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                {rkaDpaFile ? (
                  <div className="text-sm">
                    <p className="font-medium text-emerald-600 truncate max-w-[200px]">{rkaDpaFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(rkaDpaFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Pilih file dokumen</p>
                )}
                <div className="mt-4">
                  <Label htmlFor="rka_dpa_upload" className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-3">
                    <UploadCloud className="mr-2 h-3 w-3" />
                    Pilih File
                  </Label>
                  <Input id="rka_dpa_upload" type="file" className="hidden" onChange={(e) => setRkaDpaFile(e.target.files?.[0] || null)} disabled={isSaving} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSaving}>
          {isSaving ? <Spinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
          Simpan Draft
        </Button>
        <Button onClick={() => handleSubmit(false)} disabled={isSaving}>
          {isSaving ? <Spinner className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
          Ajukan Sekarang
        </Button>
      </div>
    </div>
  )
}
