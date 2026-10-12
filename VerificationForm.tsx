"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

async function up(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/upload", { method: "POST", body: fd });
  const j = (await r.json()) as { url?: string; error?: string };
  if (!r.ok || !j.url) throw new Error(j.error ?? "Gagal mengunggah.");
  return j.url;
}

export function VerificationForm({ defaultName, defaultPhone }: { defaultName: string; defaultPhone: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const f = new FormData(e.currentTarget);
      const ktp = f.get("ktp") as File;
      const selfie = f.get("selfie") as File;
      const doc = f.get("doc") as File;
      if (!ktp?.size || !selfie?.size) throw new Error("Foto KTP dan selfie wajib diunggah.");
      const [ktpUrl, selfieUrl, docUrl] = await Promise.all([up(ktp), up(selfie), doc?.size ? up(doc) : Promise.resolve(null)]);
      const r = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: f.get("fullName"), phone: f.get("phone"), ktpUrl, selfieUrl, docUrl }),
      });
      if (!r.ok) throw new Error(((await r.json()) as { error?: string }).error ?? "Gagal mengajukan.");
      router.refresh();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      <div><label className="label">Nama lengkap (sesuai KTP)</label><input name="fullName" required defaultValue={defaultName} className="input" /></div>
      <div><label className="label">Nomor HP</label><input name="phone" required defaultValue={defaultPhone} className="input" /></div>
      <div><label className="label">Foto KTP</label><input name="ktp" type="file" accept="image/jpeg,image/png,image/webp" required /></div>
      <div><label className="label">Selfie dengan KTP</label><input name="selfie" type="file" accept="image/jpeg,image/png,image/webp" required /></div>
      <div><label className="label">Dokumen pendukung (opsional, mis. sertifikat/surat sewa)</label><input name="doc" type="file" accept="image/jpeg,image/png,image/webp" /></div>
      <button className="btn-primary" disabled={busy}>{busy ? "Mengirim..." : "Ajukan Verifikasi"}</button>
    </form>
  );
}
