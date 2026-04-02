'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/use-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { ArrowLeft, Save, FileText, UploadCloud, Download } from 'lucide-react'
import Link from 'next/link'

export default function EditBudgetPage() {
  const params = useParams()
  const router = useRouter()
  const { profile, isLoading: profileLoading } = useProfile()
  const budgetId = params.id as string

  const [budget, setBudget] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [notaDinasFile, setNotaDinasFile] = useState<File | null>(null)
  const [rkaDpaFile, setRkaDpaFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchBudget() }, [budgetId])

  async function fetchBudget() {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('budgets').select('*, institution:institutions(name)').eq('id', budgetId).single()
    if (error || !data) {
      toast.error('Pengajuan tidak ditemukan')
      router.push('/dashboard/budgets')
      return
    }
    setBudget(data)
    setTitle(data.title)
    setIsLoading(false)
  }

  async function handleSubmit() {
    if (!title.trim()) { toast.error('Judul pengajuan wajib diisi'); return }
    setIsSaving(true)
    const supabase = createClient()

    try {
      const updates = { 
        title, 
        updated_at: new Date().toISOString(),
        status: 'submitted',
        review_bapperida: 'pending',
        review_setda: 'pending',
        review_anggaran: 'pending',
        review_aset: 'pending'
      }
      const { error: budgetError } = await supabase.from('budgets').update(updates).eq('id', budgetId)
      if (budgetError) throw budgetError

      const docsToUpload = []
      
      if (notaDinasFile) {
        const notaExt = notaDinasFile.name.split('.').pop()
        const notaFileName = `${budgetId}/nota_dinas_${Math.random().toString(36).substring(2, 9)}.${notaExt}`
        const { error: notaUploadError } = await supabase.storage.from('budget_documents').upload(notaFileName, notaDinasFile)
        if (!notaUploadError) {
          docsToUpload.push({ budget_id: budgetId, file_name: notaDinasFile.name, file_path: notaFileName, file_type: notaDinasFile.type || 'application/pdf', file_size: notaDinasFile.size, document_type: 'nota_dinas', uploaded_by: profile!.id })
        }
      }

      if (rkaDpaFile) {
        const rkaExt = rkaDpaFile.name.split('.').pop()
        const rkaFileName = `${budgetId}/rka_dpa_${Math.random().toString(36).substring(2, 9)}.${rkaExt}`
        const { error: rkaUploadError } = await supabase.storage.from('budget_documents').upload(rkaFileName, rkaDpaFile)
        if (!rkaUploadError) {
          docsToUpload.push({ budget_id: budgetId, file_name: rkaDpaFile.name, file_path: rkaFileName, file_type: rkaDpaFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', file_size: rkaDpaFile.size, document_type: 'rka_dpa', uploaded_by: profile!.id })
        }
      }

      if (docsToUpload.length > 0) {
        // Optional: delete old documents before inserting new ones
        await supabase.from('budget_documents').insert(docsToUpload)
      }

      toast.success('Pengajuan RKA/DPA berhasil diperbarui')
      router.push(`/dashboard/budgets/${budgetId}`)
    } catch (error: any) {
      toast.error(`Gagal menyimpan: ${error?.message || 'Terjadi kesalahan'}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (profileLoading || isLoading) return <div className="flex h-64 items-center justify-center"><Spinner className="h-8 w-8" /></div>
  if (budget?.status !== 'draft' && budget?.status !== 'revision') {
    return <div className="flex flex-col items-center justify-center py-20"><p>Pengajuan ini tidak dapat diedit karena sedang diproses atau sudah disetujui.</p></div>
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href={`/dashboard/budgets/${budgetId}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Pengajuan RKA/DPA</h1>
          <p className="text-muted-foreground">Perbarui informasi dan dokumen pengajuan</p>
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
            <Input value={budget.institution?.name || ''} disabled className="bg-muted text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Judul Pengajuan *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perbarui Dokumen (Opsional)</CardTitle>
          <CardDescription>Unggah file baru jika perlu mengganti dokumen sebelumnya.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>1. Nota Dinas</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                {notaDinasFile ? (
                  <div className="text-sm">
                    <p className="font-medium text-primary truncate max-w-[200px]">{notaDinasFile.name}</p>
                  </div>
                ) : <p className="text-xs text-muted-foreground">Biarkan kosong jika tidak direvisi</p>}
                <div className="mt-4">
                  <Label htmlFor="nota_dinas_upload" className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-3">
                    <UploadCloud className="mr-2 h-3 w-3" /> Pilih File
                  </Label>
                  <Input id="nota_dinas_upload" type="file" className="hidden" onChange={(e) => setNotaDinasFile(e.target.files?.[0] || null)} disabled={isSaving} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>2. RKA/DPA</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                {rkaDpaFile ? (
                   <div className="text-sm">
                     <p className="font-medium text-emerald-600 truncate max-w-[200px]">{rkaDpaFile.name}</p>
                   </div>
                ) : <p className="text-xs text-muted-foreground">Biarkan kosong jika tidak direvisi</p>}
                <div className="mt-4">
                  <Label htmlFor="rka_dpa_upload" className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-3">
                    <UploadCloud className="mr-2 h-3 w-3" /> Pilih File
                  </Label>
                  <Input id="rka_dpa_upload" type="file" className="hidden" onChange={(e) => setRkaDpaFile(e.target.files?.[0] || null)} disabled={isSaving} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          Simpan Perubahan
        </Button>
      </div>
    </div>
  )
}
