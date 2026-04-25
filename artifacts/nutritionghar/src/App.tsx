import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import DishDetail from "@/pages/DishDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Subscriptions from "@/pages/Subscriptions";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import ChefDashboard from "@/pages/chef/Dashboard";
import ChefDishes from "@/pages/chef/Dishes";
import ChefOrders from "@/pages/chef/Orders";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu" component={Menu} />
      <Route path="/dish/:id" component={DishDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/login" component={Login} />
      <Route path="/subscriptions">
        <ProtectedRoute>
          <Subscriptions />
        </ProtectedRoute>
      </Route>
      <Route path="/checkout">
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </Route>
      <Route path="/orders">
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      </Route>
      <Route path="/orders/:id">
        <ProtectedRoute>
          <OrderDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/chef">
        <ProtectedRoute requireRole="chef">
          <ChefDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/chef/dishes">
        <ProtectedRoute requireRole="chef">
          <ChefDishes />
        </ProtectedRoute>
      </Route>
      <Route path="/chef/orders">
        <ProtectedRoute requireRole="chef">
          <ChefOrders />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />
            <main className="flex-1">
              <AppRoutes />
            </main>
            <footer className="border-t border-border py-8 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <div>
                  <span className="font-serif text-sm text-foreground">NutritionGhar</span>
                  {" — Healthy. Homemade. Heartfelt."}
                </div>
                <div>Made for the homemakers of India.</div>
              </div>
            </footer>
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              className: "rounded-xl",
            }}
          />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
