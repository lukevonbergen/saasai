"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    company_name: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          company_name: data.company_name || "",
          phone: data.phone || "",
        });
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update(form)
      .eq("id", userId);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }

    setSaving(false);
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Update your profile information</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Profile Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="bg-white"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className={`mt-4 transition-all ${
              saved ? "bg-green-600 hover:bg-green-600" : ""
            }`}
          >
            {saving ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
            ) : saved ? (
              "✓ Saved"
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}