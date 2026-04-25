import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  useUpdateProfile,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [name, setName] = useState(user?.name ?? "");
  const [kitchenName, setKitchenName] = useState(user?.kitchenName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [address, setAddress] = useState(user?.address ?? "");

  useEffect(() => {
    setName(user?.name ?? "");
    setKitchenName(user?.kitchenName ?? "");
    setBio(user?.bio ?? "");
    setAddress(user?.address ?? "");
  }, [user]);

  const update = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast.success("Profile updated");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
    },
  });

  const isChef = user?.role === "chef";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-4xl font-semibold">Your profile</h1>
        <p className="text-muted-foreground mt-1">
          {isChef
            ? "Tell customers about your kitchen — they'll trust you more."
            : "Save your address so checkout takes seconds."}
        </p>
      </motion.div>

      <div className="mt-8 p-6 rounded-2xl bg-card border border-card-border space-y-5">
        <div>
          <Label>Phone</Label>
          <Input value={user?.phone ?? ""} disabled className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5"
          />
        </div>

        {isChef && (
          <>
            <div>
              <Label htmlFor="kitchenName">Kitchen name</Label>
              <Input
                id="kitchenName"
                value={kitchenName}
                onChange={(e) => setKitchenName(e.target.value)}
                placeholder="e.g. Meera's Rasoi"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="bio">About your kitchen</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A line or two about your style, your hometown, your specialties…"
                rows={3}
                className="mt-1.5"
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="address">Default {isChef ? "kitchen" : "delivery"} address</Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="mt-1.5"
          />
        </div>

        <div className="pt-2">
          <Button
            size="lg"
            onClick={() =>
              update.mutate({
                data: {
                  name,
                  kitchenName: kitchenName || undefined,
                  bio: bio || undefined,
                  address: address || undefined,
                },
              })
            }
            disabled={update.isPending}
          >
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
