import Link from "next/link";
import { AuthForm } from "@/components/forms/AuthForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthForm mode="signup" />
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-medium text-brand">Log in</Link>
        </p>
      </div>
    </main>
  );
}