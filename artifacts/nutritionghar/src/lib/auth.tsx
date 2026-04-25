import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect, type ReactNode } from "react";

export function useAuth() {
  const { data, isLoading, refetch } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), staleTime: 30_000 },
  });
  return {
    user: data?.user ?? null,
    isLoading,
    refetch,
  };
}

export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: "customer" | "chef";
}) {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      const next = encodeURIComponent(location);
      const role = requireRole === "chef" ? "&role=chef" : "";
      navigate(`/login?next=${next}${role}`, { replace: true });
      return;
    }
    if (requireRole && user.role !== requireRole) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, requireRole, location, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return null;
  if (requireRole && user.role !== requireRole) return null;
  return <>{children}</>;
}
