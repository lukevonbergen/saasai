"use client";

import { useProfileCheck } from "@/lib/hooks/useProfileCheck";
import CompleteProfileModal from "./CompleteProfileModal";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const { shouldShowModal, setShouldShowModal, loading } = useProfileCheck();

  if (loading) return null;

  return (
    <>
      <CompleteProfileModal open={shouldShowModal} setOpen={setShouldShowModal} />
      {children}
    </>
  );
}