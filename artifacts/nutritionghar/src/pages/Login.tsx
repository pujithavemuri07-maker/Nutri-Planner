import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import {
  useSendOtp,
  useVerifyOtp,
  getGetMeQueryKey,
  type UserRole,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const HERO_IMG =
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=70&auto=format&fit=crop";

export default function Login() {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");
  const initialRole = (params.get("role") as UserRole | null) ?? "customer";
  const next = params.get("next");

  const [role, setRole] = useState<UserRole>(initialRole);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (initialRole === "chef") setRole("chef");
  }, [initialRole]);

  const sendOtp = useSendOtp({
    mutation: {
      onSuccess: (data) => {
        setDemoOtp(data.demoOtp);
        setOtp(data.demoOtp);
        setStep("otp");
        toast.success("OTP sent", {
          description: `Demo OTP: ${data.demoOtp} (auto-filled)`,
        });
      },
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : "Could not send OTP"),
    },
  });

  const verifyOtp = useVerifyOtp({
    mutation: {
      onSuccess: async (data) => {
        await qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast.success(`Welcome, ${data.user.name}`);
        const dest = next
          ? decodeURIComponent(next)
          : data.user.role === "chef"
            ? "/chef"
            : "/";
        navigate(dest);
      },
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : "Verification failed"),
    },
  });

  const onSendOtp = () => {
    const trimmed = phone.replace(/\s+/g, "");
    if (trimmed.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (!name.trim()) {
      toast.error("Please share your name");
      return;
    }
    sendOtp.mutate({ data: { phone: trimmed } });
  };

  const onVerify = () => {
    if (otp.length < 4) {
      toast.error("Enter the 4-digit OTP");
      return;
    }
    verifyOtp.mutate({
      data: {
        phone: phone.replace(/\s+/g, ""),
        otp,
        role,
        name: name.trim(),
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="hidden lg:block relative">
        <img src={HERO_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/30" />
        <div className="relative z-10 h-full flex flex-col justify-end p-10 text-white">
          <h2 className="font-serif text-4xl font-semibold leading-tight max-w-sm">
            "Cooking for someone else's family is my favourite kind of love."
          </h2>
          <div className="mt-3 text-sm opacity-90">— Meera, NutritionGhar home chef</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mx-auto">
              <ChefHat className="h-6 w-6" />
            </div>
            <h1 className="font-serif text-3xl font-semibold mt-3">
              Welcome to NutritionGhar
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in with your phone number to continue.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-muted mb-6">
            <button
              onClick={() => setRole("customer")}
              className={`py-2.5 rounded-full text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors ${
                role === "customer" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              <ShoppingBag className="h-4 w-4" /> I want to eat
            </button>
            <button
              onClick={() => setRole("chef")}
              className={`py-2.5 rounded-full text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors ${
                role === "chef" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              <ChefHat className="h-4 w-4" /> I want to cook
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Meera Sharma"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="mt-1.5"
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={onSendOtp}
                  disabled={sendOtp.isPending}
                >
                  {sendOtp.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  No real SMS is sent. A random OTP will appear on the next screen — or just type{" "}
                  <span className="font-mono font-semibold">1234</span> to skip straight in.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="space-y-4"
              >
                <div className="rounded-xl bg-accent/15 border border-accent/30 p-4 text-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Your random OTP</span>
                    <span className="font-mono text-lg font-bold tracking-widest">{demoOtp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Universal demo bypass</span>
                    <span className="font-mono text-lg font-bold tracking-widest">1234</span>
                  </div>
                  <div className="text-xs text-muted-foreground pt-1">
                    Use either code — the random one is pre-filled below.
                  </div>
                </div>
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="mt-1.5 tracking-[0.5em] text-center text-lg font-mono"
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={onVerify}
                  disabled={verifyOtp.isPending}
                >
                  {verifyOtp.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Verify & continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <button
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setDemoOtp(null);
                  }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  Use a different number
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
