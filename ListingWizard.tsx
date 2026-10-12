"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FACILITIES, formatRupiah } from "@/lib/utils";

export type WizardData = {
  title: string;
  description: string;
  type: "SALE" | "RENT";
  categoryId: string;
  price: string;
  negotiable: boolean;
  province: string;
  city: string;
  district: string;
  village: string;
  address: string;
  latitude: string;
  longitude: string;
  landArea: string;
  buildingArea: string;
  width: string;
  length: string;
  floor: string;
  yearBuilt: string;
  electricity: string;
  water: string;
  condition: "NEW" | "USED";
  facilities: string[];
  images: string[];
  primaryIndex: number;
  videoUrl: string;
};

export const emptyWizard: WizardData = {
  title: "", description: "", type: "SALE", categoryId: "", price: "", negotiable: true,
  province: "", city: "", district: "", village: "", address: "", latitude: "", longitude: "",
  landArea: "", buildingArea: "", width: "", length: "", floor: "1", yearBuilt: "",
  electricity: "", water: "", condition: "USED", facilities: [], images: [], primaryIndex: 0, videoUrl: "",
};

const STEPS = ["Informasi dasar", "Lokasi", "Spesifikasi", "Fasilitas", "Foto & video"];

// Didefinisikan di luar komponen agar input tidak di-remount (kehilangan fokus) setiap ketikan.
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
const num = (v: string) => (v.trim() === "" ? null : Number(v));

export function ListingWizard({
  categories,
  initial = emptyWizard,
  listingId,
}: {
  categories: { id: string; name: string }[];
  initial?: WizardData;
  listingId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<WizardData>(initial);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof WizardData>(k: K, v: WizardData[K]) => setD((x) => ({ ...x, [k]: v }));
  const preview = step === STEPS.length;

  function validate(s: number): string {
    if (s === 0) {
      if (d.title.trim().length < 5) return "Judul minimal 5 karakter.";
      if (d.description.trim().length < 20) return "Deskripsi minimal 20 karakter.";
      if (!Number(d.price) || Number(d.price) <= 0) return "Harga harus diisi.";
    }
    if (s === 1) {
      if (!d.province.trim() || !d.city.trim() || !d.district.trim()) return "Provinsi, kota/kabupaten, dan kecamatan wajib diisi.";
      if (d.address.trim().length < 5) return "Alamat wajib diisi.";
    }
    if (s === 4 && d.images.length === 0) return "Unggah minimal 1 foto.";
    return "";
  }

  function next() {
    const e = validate(step);
    setErr(e);
    if (!e) setStep(step + 1);
  }

  async function upload(files: FileList | File[]) {
    setUploading(true);
    setErr("");
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      if (d.images.length + urls.length >= 20) {
        setErr("Maksimal 20 foto.");
        break;
      }
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = (await r.json()) as { url?: string; error?: string };
      if (!r.ok || !j.url) {
        setErr(j.error ?? "Gagal mengunggah.");
        continue;
      }
      urls.push(j.url);
    }
    setD((x) => ({ ...x, images: [...x.images, ...urls] }));
    setUploading(false);
  }

  async function uploadVideo(f: File) {
    setUploading(true);
    setErr("");
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const j = (await r.json()) as { url?: string; error?: string };
    setUploading(false);
    if (!r.ok || !j.url) return setErr(j.error ?? "Gagal mengunggah video.");
    set("videoUrl", j.url);
  }

  function removeImage(i: number) {
    setD((x) => {
      const images = x.images.filter((_, k) => k !== i);
      let primaryIndex = x.primaryIndex;
      if (i === primaryIndex) primaryIndex = 0;
      else if (i < primaryIndex) primaryIndex -= 1;
      return { ...x, images, primaryIndex };
    });
  }

  function locate() {
    navigator.geolocation?.getCurrentPosition(
      (p) => setD((x) => ({ ...x, latitude: p.coords.latitude.toFixed(6), longitude: p.coords.longitude.toFixed(6) })),
      () => setErr("Tidak dapat mengambil lokasi. Isi koordinat secara manual atau lewati."),
    );
  }

  async function submit() {
    for (let s = 0; s < STEPS.length; s++) {
      const e = validate(s);
      if (e) {
        setErr(e);
        return setStep(s);
      }
    }
    setBusy(true);
    setErr("");
    const payload = {
      title: d.title, description: d.description, type: d.type,
      categoryId: d.categoryId || null, price: Number(d.price), negotiable: d.negotiable,
      province: d.province, city: d.city, district: d.district, village: d.village || null, address: d.address,
      latitude: num(d.latitude), longitude: num(d.longitude),
      landArea: num(d.landArea), buildingArea: num(d.buildingArea), width: num(d.width), length: num(d.length),
      floor: Number(d.floor) || 1, yearBuilt: num(d.yearBuilt),
      electricity: d.electricity || null, water: d.water || null, condition: d.condition,
      facilities: d.facilities, images: d.images, primaryIndex: d.primaryIndex, videoUrl: d.videoUrl || null,
    };
    const r = await fetch(listingId ? `/api/listings/${listingId}` : "/api/listings", {
      method: listingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = (await r.json()) as { error?: string };
    setBusy(false);
    if (!r.ok) return setErr(j.error ?? "Gagal menyimpan listing.");
    router.push("/dashboard/listings");
    router.refresh();
  }

  return (
    <div className="card p-6">
      <ol className="mb-6 flex gap-2 overflow-x-auto text-xs font-semibold">
        {[...STEPS, "Preview"].map((s, i) => (
          <li key={s} className={`whitespace-nowrap rounded-full px-3 py-1.5 ${i === step ? "bg-brand text-white" : i < step ? "bg-brand-50 text-brand" : "bg-navy-100 text-navy-500"}`}>
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {err && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}

      {step === 0 && (
        <div className="space-y-4">
          <F label="Judul"><input className="input" value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="Kios Strategis Dekat Pasar" /></F>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Jenis">
              <select className="input" value={d.type} onChange={(e) => set("type", e.target.value as "SALE" | "RENT")}>
                <option value="SALE">Dijual</option>
                <option value="RENT">Disewa</option>
              </select>
            </F>
            <F label="Kategori">
              <select className="input" value={d.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="">Pilih kategori</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </F>
          </div>
          <F label={d.type === "RENT" ? "Harga sewa per tahun (Rp)" : "Harga (Rp)"}>
            <input className="input" inputMode="numeric" value={d.price} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} />
            {d.price && <p className="mt-1 text-xs text-navy-500">{formatRupiah(Number(d.price))}</p>}
          </F>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.negotiable} onChange={(e) => set("negotiable", e.target.checked)} /> Harga bisa dinegosiasikan</label>
          <F label="Deskripsi"><textarea className="input" rows={5} value={d.description} onChange={(e) => set("description", e.target.value)} /></F>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Provinsi"><input className="input" value={d.province} onChange={(e) => set("province", e.target.value)} placeholder="Jawa Tengah" /></F>
            <F label="Kabupaten/Kota"><input className="input" value={d.city} onChange={(e) => set("city", e.target.value)} placeholder="Kabupaten Semarang" /></F>
            <F label="Kecamatan"><input className="input" value={d.district} onChange={(e) => set("district", e.target.value)} /></F>
            <F label="Kelurahan"><input className="input" value={d.village} onChange={(e) => set("village", e.target.value)} /></F>
          </div>
          <F label="Alamat lengkap"><input className="input" value={d.address} onChange={(e) => set("address", e.target.value)} /></F>
          <div>
            <p className="label">Pin lokasi (opsional)</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <input className="input" placeholder="Latitude" value={d.latitude} onChange={(e) => set("latitude", e.target.value)} />
              <input className="input" placeholder="Longitude" value={d.longitude} onChange={(e) => set("longitude", e.target.value)} />
              <button type="button" className="btn-outline" onClick={locate}>📍 Gunakan lokasi saya</button>
            </div>
            <p className="mt-1 text-xs text-navy-500">Koordinat hanya dipakai untuk peta dan tidak ditampilkan kepada pengunjung.</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Luas tanah (m²)"><input className="input" inputMode="decimal" value={d.landArea} onChange={(e) => set("landArea", e.target.value)} /></F>
          <F label="Luas bangunan (m²)"><input className="input" inputMode="decimal" value={d.buildingArea} onChange={(e) => set("buildingArea", e.target.value)} /></F>
          <F label="Panjang (m)"><input className="input" inputMode="decimal" value={d.length} onChange={(e) => set("length", e.target.value)} /></F>
          <F label="Lebar (m)"><input className="input" inputMode="decimal" value={d.width} onChange={(e) => set("width", e.target.value)} /></F>
          <F label="Jumlah lantai"><input className="input" inputMode="numeric" value={d.floor} onChange={(e) => set("floor", e.target.value)} /></F>
          <F label="Tahun bangunan"><input className="input" inputMode="numeric" value={d.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)} /></F>
          <F label="Listrik"><input className="input" value={d.electricity} onChange={(e) => set("electricity", e.target.value)} placeholder="2200 VA" /></F>
          <F label="Air"><input className="input" value={d.water} onChange={(e) => set("water", e.target.value)} placeholder="PDAM" /></F>
          <F label="Kondisi">
            <select className="input" value={d.condition} onChange={(e) => set("condition", e.target.value as "NEW" | "USED")}>
              <option value="NEW">Baru</option>
              <option value="USED">Bekas</option>
            </select>
          </F>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FACILITIES.map((f) => (
            <label key={f.key} className="card flex items-center gap-2 p-3 text-sm">
              <input
                type="checkbox"
                checked={d.facilities.includes(f.key)}
                onChange={(e) => set("facilities", e.target.checked ? [...d.facilities, f.key] : d.facilities.filter((x) => x !== f.key))}
              />
              {f.label}
            </label>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
            className={`cursor-pointer rounded-xl2 border-2 border-dashed p-8 text-center ${drag ? "border-brand bg-brand-50" : "border-navy-100"}`}
          >
            <p className="font-semibold">{uploading ? "Mengunggah..." : "Seret foto ke sini atau klik untuk memilih"}</p>
            <p className="text-sm text-navy-500">JPG/PNG/WEBP, maks 5 MB, hingga 20 foto ({d.images.length}/20)</p>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
          </div>
          {d.images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {d.images.map((src, i) => (
                <div key={src} className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 ${i === d.primaryIndex ? "border-brand" : "border-transparent"}`}>
                  <Image src={src} alt={`Foto ${i + 1}`} fill sizes="200px" className="object-cover" unoptimized />
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-navy/60 p-1 text-[11px] text-white">
                    <button type="button" onClick={() => set("primaryIndex", i)}>{i === d.primaryIndex ? "★ Utama" : "Jadikan utama"}</button>
                    <button type="button" onClick={() => removeImage(i)}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div>
            <p className="label">Video (opsional, MP4/WEBM maks 40 MB)</p>
            <input type="file" accept="video/mp4,video/webm" onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])} />
            {d.videoUrl && <p className="mt-1 text-xs text-emerald-600">Video terunggah ✓</p>}
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Preview listing</h2>
          <div className="card overflow-hidden">
            {d.images[d.primaryIndex] && (
              <div className="relative aspect-[16/9]"><Image src={d.images[d.primaryIndex]} alt="" fill className="object-cover" unoptimized /></div>
            )}
            <div className="space-y-1 p-4">
              <span className="badge bg-brand text-white">{d.type === "SALE" ? "DIJUAL" : "DISEWA"}</span>
              <h3 className="text-xl font-bold">{d.title}</h3>
              <p className="text-xl font-extrabold text-brand">{formatRupiah(Number(d.price) || 0)}</p>
              <p className="text-sm text-navy-500">📍 {d.address}, {d.district}, {d.city}, {d.province}</p>
              <p className="whitespace-pre-line pt-2 text-sm text-navy-500">{d.description}</p>
              <p className="pt-2 text-sm">Fasilitas: {d.facilities.join(", ") || "-"}</p>
            </div>
          </div>
          <p className="text-sm text-navy-500">Listing akan berstatus <b>PENDING</b> sampai disetujui admin.</p>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button className="btn-outline" disabled={step === 0 || busy} onClick={() => { setErr(""); setStep(step - 1); }}>← Kembali</button>
        {preview ? (
          <button className="btn-primary" disabled={busy || uploading} onClick={submit}>{busy ? "Mengirim..." : "Kirim untuk Verifikasi"}</button>
        ) : (
          <button className="btn-primary" disabled={uploading} onClick={next}>{step === STEPS.length - 1 ? "Lihat Preview →" : "Lanjut →"}</button>
        )}
      </div>
    </div>
  );
}
