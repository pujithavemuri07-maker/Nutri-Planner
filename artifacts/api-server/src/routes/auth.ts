import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, otpsTable } from "@workspace/db";
import {
  SendOtpBody,
  VerifyOtpBody,
  UpdateProfileBody,
} from "@workspace/api-zod";
import {
  attachUser,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  getSessionToken,
  deleteSession,
  requireAuth,
} from "../lib/auth";
import { serializeUser } from "../lib/serializers";

const router: IRouter = Router();

router.use(attachUser);

const OTP_TTL_MS = 1000 * 60 * 10; // 10 minutes
function generateOtp(): string {
  // For the demo we use a fixed-pattern code that's easy to read
  return Math.floor(1000 + Math.random() * 9000).toString();
}

router.post("/auth/send-otp", async (req, res): Promise<void> => {
  const parsed = SendOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const phone = parsed.data.phone.replace(/\s+/g, "");
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await db
    .insert(otpsTable)
    .values({ phone, code, expiresAt })
    .onConflictDoUpdate({
      target: otpsTable.phone,
      set: { code, expiresAt },
    });

  req.log.info({ phone }, "Issued demo OTP");
  res.json({ success: true, demoOtp: code });
});

router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const parsed = VerifyOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const phone = parsed.data.phone.replace(/\s+/g, "");
  const [otpRow] = await db
    .select()
    .from(otpsTable)
    .where(eq(otpsTable.phone, phone));

  if (!otpRow) {
    res.status(400).json({ error: "No OTP found for this phone" });
    return;
  }
  if (otpRow.expiresAt.getTime() < Date.now()) {
    res.status(400).json({ error: "OTP expired" });
    return;
  }
  if (otpRow.code !== parsed.data.otp) {
    res.status(400).json({ error: "Incorrect OTP" });
    return;
  }

  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, phone));

  if (!user) {
    const name = parsed.data.name?.trim() || "Friend";
    const role = parsed.data.role;
    const [created] = await db
      .insert(usersTable)
      .values({ phone, name, role })
      .returning();
    user = created;
  } else if (parsed.data.role && user.role !== parsed.data.role) {
    // Allow updating role if account is fresh and they have no orders/dishes.
    // Keep simple for the demo.
  }

  await db.delete(otpsTable).where(eq(otpsTable.phone, phone));

  const token = await createSession(user.id);
  setSessionCookie(res, token);

  res.json({ user: serializeUser(user) });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const token = getSessionToken(req);
  if (token) await deleteSession(token);
  clearSessionCookie(res);
  res.json({ success: true });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.currentUser) {
    res.json({ user: null });
    return;
  }
  res.json({ user: serializeUser(req.currentUser) });
});

router.patch(
  "/auth/profile",
  requireAuth,
  async (req, res): Promise<void> => {
    const parsed = UpdateProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const updates = parsed.data;
    const [updated] = await db
      .update(usersTable)
      .set({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.kitchenName !== undefined && {
          kitchenName: updates.kitchenName,
        }),
        ...(updates.bio !== undefined && { bio: updates.bio }),
        ...(updates.address !== undefined && { address: updates.address }),
      })
      .where(eq(usersTable.id, req.currentUser!.id))
      .returning();
    res.json(serializeUser(updated));
  },
);

export default router;
