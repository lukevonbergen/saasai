"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useProfileCheck() {
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (!data || error) {
        setShouldShowModal(true);
      }

      setLoading(false);
    };

    checkProfile();
  }, []);

  return { shouldShowModal, setShouldShowModal, loading };
}