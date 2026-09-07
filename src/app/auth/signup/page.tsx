"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    try {
      await fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: email.split("@")[0] }),
      });
    } catch {
      // Silent fail — email is non-critical
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f8f6] px-4 py-12 antialiased">
        <div className="w-full max-w-md rounded-[20px] border border-[#f0e9e1] bg-white p-8 sm:p-10 shadow-[0_16px_40px_rgba(12,23,84,0.06)] text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eaebf8] text-2xl text-[#2545ff]">
            ✉️
          </div>
          <h1 className="font-editorial text-3xl font-normal text-[#0c1754]">
            Revisá tu correo
          </h1>
          <p className="mt-2 text-xs text-[#222222]/80 leading-relaxed">
            Te enviamos un enlace de confirmación a <strong>{email}</strong>. Hacé clic para activar tu cuenta de StarPress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9f8f6] px-4 py-12 antialiased">
      <div className="w-full max-w-md rounded-[20px] border border-[#f0e9e1] bg-white p-8 sm:p-10 shadow-[0_16px_40px_rgba(12,23,84,0.06)]">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0c1754] text-white font-bold text-xs">
              ★
            </span>
            <span className="text-lg font-bold tracking-tight text-[#0c1754]">
              Star<span className="text-[#2545ff]">Press</span>
            </span>
          </Link>
          <h1 className="font-editorial text-3xl font-normal text-[#0c1754]">
            Creá tu cuenta
          </h1>
          <p className="mt-1 text-xs text-[#969696]">
            Empezá a gestionar y lucir tus reseñas en menos de 2 minutos.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#f0e9e1] bg-[#f9f8f6] px-4 py-3 text-xs font-semibold text-[#0c1754] shadow-xs hover:bg-white hover:border-[#cccccc] transition cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar con Google
        </button>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#f0e9e1]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-[#969696]">
              o con tu correo
            </span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#969696]">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 rounded-xl border border-[#f0e9e1] bg-[#f9f8f6] px-4 text-xs text-[#171417] placeholder:text-[#969696] focus:border-[#2545ff] focus:bg-white focus:outline-none"
              placeholder="nombre@tuempresa.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#969696]">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-11 rounded-xl border border-[#f0e9e1] bg-[#f9f8f6] px-4 text-xs text-[#171417] placeholder:text-[#969696] focus:border-[#2545ff] focus:bg-white focus:outline-none"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#2545ff] py-3 text-xs font-semibold text-white shadow-xs hover:bg-[#1a38e8] active:scale-[0.98] disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta Gratuita"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[#969696]">
          ¿Ya tenés una cuenta?{" "}
          <Link href="/auth/login" className="font-semibold text-[#2545ff] hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
