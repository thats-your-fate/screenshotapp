"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminAssetUploadForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error || "Upload failed.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form
      action={onSubmit}
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1.2fr_1fr_1fr_auto]"
    >
      <Input name="file" type="file" required />
      <Input name="name" placeholder="Optional display name" />
      <select
        name="type"
        defaultValue="OTHER"
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
      >
        <option value="BACKGROUND">BACKGROUND</option>
        <option value="OVERLAY">OVERLAY</option>
        <option value="DEVICE_FRAME">DEVICE_FRAME</option>
        <option value="STICKER">STICKER</option>
        <option value="ICON">ICON</option>
        <option value="LOGO">LOGO</option>
        <option value="OTHER">OTHER</option>
      </select>
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading..." : "Upload"}
      </Button>
      {error ? <p className="text-sm text-rose-600 md:col-span-4">{error}</p> : null}
    </form>
  );
}
