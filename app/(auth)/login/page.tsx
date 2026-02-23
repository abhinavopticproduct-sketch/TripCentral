import Link from "next/link";
import { AuthForm } from "@/components/forms/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthForm mode="login" />
        <p className="mt-4 text-center text-sm text-slate-600">
          No account yet? <Link href="/signup" className="font-medium text-brand">Sign up</Link>
        </p>
      </div>
    </main>
  );
}