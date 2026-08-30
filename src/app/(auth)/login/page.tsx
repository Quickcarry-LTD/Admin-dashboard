"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { HOME, useAuth } from "@/components/AuthProvider";
import Button from "@/components/Button";
import { Input } from "@/components/Field";
import { Alert, Spinner } from "@/components/Feedback";
import { errorMessage } from "@/lib/useAsync";

export default function LoginPage() {
  const { signIn, user, ready } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Someone already signed in has no business on the login screen.
  useEffect(() => {
    if (ready && user) router.replace(HOME);
  }, [ready, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace(HOME);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Image
        src="/logo-icon.png"
        alt=""
        width={378}
        height={253}
        className="mb-6 h-9 w-auto lg:hidden"
        priority
      />
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Sign in</h1>
      <p className="mt-2 text-base leading-relaxed text-secondary-foreground">
        Use your QuickCarry staff account. Merchant, fleet, rider and customer
        logins won&apos;t open this console.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@quickcarry.com"
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && <Alert>{error}</Alert>}

        <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-full">
          {submitting ? <Spinner className="size-4" /> : null}
          {submitting ? "Signing in" : "Sign in"}
          {!submitting && <ArrowRightIcon />}
        </Button>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
        Staff accounts are provisioned directly against the database — there is
        no self-registration for admin roles.
      </p>
    </div>
  );
}
