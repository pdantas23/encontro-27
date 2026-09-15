"use client";

import { useEffect } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function AdminIndexPage() {
  useEffect(() => {
    window.location.replace(`${basePath}/admin/dashboard`);
  }, []);
  return null;
}
