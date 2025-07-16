"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CompleteProfileModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    company_name: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id;
    if (!userId) return;

    const { error } = await supabase.from("profiles").insert({
      id: userId,
      ...form,
    });

    if (!error) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white p-6 sm:max-w-md w-full rounded-lg shadow-xl border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Complete your profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">First Name</label>
            <Input
              name="first_name"
              placeholder="John"
              onChange={handleChange}
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Last Name</label>
            <Input
              name="last_name"
              placeholder="Doe"
              onChange={handleChange}
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Company Name</label>
            <Input
              name="company_name"
              placeholder="Flowify Ltd"
              onChange={handleChange}
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Phone Number</label>
            <Input
              name="phone"
              placeholder="+44 7900 123456"
              onChange={handleChange}
              className="bg-white"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full mt-2"
            variant="default"
          >
            Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}