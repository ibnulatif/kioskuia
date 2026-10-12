"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const errorText: Record<string, string> = {
  google_not_configured: "Login Google belum dikonfigurasi.",
  google_failed: "Login dengan Google gagal. Coba lagi.",
  blocked: "Akun Anda diblokir.",
};

function GoogleButton({ label }: { label: string }) {
  return (
    <a href="/api/auth/google" className="btn-outline w-full">
      <span className="font-bold text-brand">G</span> {label}
    </a>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function redirectFor(role: string, next: string | null) {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return role === "ADMIN" ? "/admin" : role === "SELLER" ? "/dashboard" : "/";
}

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [error, setError] = useState(errorText[sp.get("error") ?? ""] ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: f.get("email"), password: f.get("password"), remember: f.get("remember") === "on" }),
    });
    const j = (await r.json()) as { error?: string; role?: string };
    setBusy(false);
    if (!r.ok) return setError(j.error ?? "Gagal masuk.");
    router.push(redirectFor(j.role ?? "USER", sp.get("next")));
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Field label="Email"><input name="email" type="email" required autoComplete="email" className="input" /></Field>
      <Field label="Password"><input name="password" type="password" required autoComplete="current-password" className="input" /></Field>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="remember" /> Remember me</label>
        <Link href="/help" className="text-brand">Lupa password?</Link>
      </div>
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Memproses..." : "Masuk"}</button>
      <GoogleButton label="Masuk dengan Google" />
      <p className="text-center text-sm text-navy-500">
        Belum punya akun? <Link href="/register" className="font-semibold text-brand">Daftar</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState(sp.get("role") === "SELLER" ? "SELLER" : "USER");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone"),
        password: f.get("password"),
        confirmPassword: f.get("confirmPassword"),
        role,
        terms: f.get("terms") === "on",
      }),
    });
    const j = (await r.json()) as { error?: string; role?: string };
    setBusy(false);
    if (!r.ok) return setError(j.error ?? "Gagal mendaftar.");
    router.push(redirectFor(j.role ?? "USER", null));
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        {[["USER", "Pencari kios"], ["SELLER", "Penjual / pemilik"]].map(([v, l]) => (
          <button type="button" key={v} onClick={() => setRole(v)} className={`btn ${role === v ? "bg-brand text-white" : "border border-navy-100"}`}>{l}</button>
        ))}
      </div>
      <Field label="Nama lengkap"><input name="name" required className="input" autoComplete="name" /></Field>
      <Field label="Email"><input name="email" type="email" required className="input" autoComplete="email" /></Field>
      <Field label="Nomor WhatsApp"><input name="phone" type="tel" required placeholder="08123456789" className="input" /></Field>
      <Field label="Password"><input name="password" type="password" required minLength={8} className="input" autoComplete="new-password" /></Field>
      <Field label="Konfirmasi password"><input name="confirmPassword" type="password" required minLength={8} className="input" autoComplete="new-password" /></Field>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="terms" required className="mt-1" />
        <span>Saya menyetujui <Link href="/terms" className="text-brand">Syarat & Ketentuan KIOSKU</Link>.</span>
      </label>
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Memproses..." : "Daftar"}</button>
      <GoogleButton label="Daftar dengan Google" />
      <p className="text-center text-sm text-navy-500">
        Sudah punya akun? <Link href="/login" className="font-semibold text-brand">Masuk</Link>
      </p>
    </form>
  );
}
