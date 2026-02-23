import Link from "next/link";
import { NewTripForm } from "@/components/forms/NewTripForm";

export default function NewTripPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Create Trip</h1>
        <Link href="/dashboard" className="btn-secondary">Back</Link>
      </div>
      <NewTripForm />
    </div>
  );
}