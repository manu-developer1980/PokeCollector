import { useState, useCallback } from "react";
import { useAuth } from "../../supabase/auth";
import { useAdmin } from "./useAdmin";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../supabase/supabase";

export interface StripePrice {
  id: string;
  object: string;
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string;
  custom_unit_amount: null;
  livemode: boolean;
  lookup_key: string | null;
  metadata: Record<string, string>;
  nickname: string | null;
  product: string;
  recurring: {
    aggregate_usage: null;
    interval: string;
    interval_count: number;
    trial_period_days: null;
    usage_type: string;
  } | null;
  tax_behavior: string;
  tiers_mode: null;
  transform_quantity: null;
  type: string;
  unit_amount: number;
  unit_amount_decimal: string;
}

export interface StripeProduct {
  id: string;
  object: string;
  active: boolean;
  attributes: string[];
  created: number;
  default_price: string | null;
  description: string | null;
  features: Array<{
    name: string;
  }>;
  images: string[];
  livemode: boolean;
  metadata: Record<string, string>;
  name: string;
  package_dimensions: null;
  shippable: null;
  statement_descriptor: null;
  tax_code: null;
  type: string;
  unit_label: null;
  updated: number;
  url: null;
}

export interface StripePlan {
  product: StripeProduct;
  price: StripePrice;
}

export interface StripeSubscription {
  id: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  user: {
    name: string;
    email: string;
  };
  plan: {
    name: string;
    price: number;
    currency: string;
    interval: string;
  };
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  metadata: Record<string, string>;
}

export const useStripeAdmin = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<StripePlan[]>([]);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [prices, setPrices] = useState<StripePrice[]>([]);

  // Helper function to get access token from session
  const getAccessToken = async (): Promise<string | null> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      console.error("Error getting session:", error);
      return null;
    }
    return session.access_token;
  };

  const fetchStripePlans = useCallback(async (): Promise<StripePlan[]> => {
    if (isAdminLoading) {
      throw new Error("Verificando permisos de administrador...");
    }
    if (!isAdmin || !user) {
      throw new Error("No tienes permisos para acceder a esta función");
    }

    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("No se pudo obtener el token de acceso");
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-admin/plans`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los planes de Stripe");
      }

      const data = await response.json();
      const plansData = data.plans || [];
      setPlans(plansData);
      return plansData;
    } catch (error) {
      console.error("Error fetching Stripe plans:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes de Stripe",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user, toast]);

  const fetchStripeProducts = useCallback(async (): Promise<StripeProduct[]> => {
    if (isAdminLoading) {
      throw new Error("Verificando permisos de administrador...");
    }
    if (!isAdmin || !user) {
      throw new Error("No tienes permisos para acceder a esta función");
    }

    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("No se pudo obtener el token de acceso");
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-admin/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los productos de Stripe");
      }

      const data = await response.json();
      const productsData = data.products || [];
      setProducts(productsData);
      return productsData;
    } catch (error) {
      console.error("Error fetching Stripe products:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos de Stripe",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user, toast]);

  const fetchStripePrices = useCallback(async (): Promise<StripePrice[]> => {
    if (isAdminLoading) {
      throw new Error("Verificando permisos de administrador...");
    }
    if (!isAdmin || !user) {
      throw new Error("No tienes permisos para acceder a esta función");
    }

    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("No se pudo obtener el token de acceso");
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-admin/prices`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los precios de Stripe");
      }

      const data = await response.json();
      const pricesData = data.prices || [];
      setPrices(pricesData);
      return pricesData;
    } catch (error) {
      console.error("Error fetching Stripe prices:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los precios de Stripe",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user, toast]);

  const createStripeProduct = useCallback(
    async (productData: {
      name: string;
      description?: string;
      features?: string[];
      metadata?: Record<string, string>;
    }): Promise<StripeProduct> => {
      if (isAdminLoading) {
        throw new Error("Verificando permisos de administrador...");
      }
      if (!isAdmin || !user) {
        throw new Error("No tienes permisos para acceder a esta función");
      }

      setLoading(true);
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("No se pudo obtener el token de acceso");
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-admin/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...productData,
            action: "create-product"
          }),
        });

        if (!response.ok) {
          throw new Error("Error al crear el producto en Stripe");
        }

        const data = await response.json();
        toast({
          title: "Éxito",
          description: "Producto creado en Stripe correctamente",
        });
        return data.product;
      } catch (error) {
        console.error("Error creating Stripe product:", error);
        toast({
          title: "Error",
          description: "No se pudo crear el producto en Stripe",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, user, toast]
  );

  const createStripePrice = useCallback(
    async (priceData: {
      product: string;
      unit_amount: number;
      currency: string;
      recurring?: {
        interval: "month" | "year";
        interval_count?: number;
      };
      metadata?: Record<string, string>;
      lookup_key?: string;
    }): Promise<StripePrice> => {
      if (isAdminLoading) {
        throw new Error("Verificando permisos de administrador...");
      }
      if (!isAdmin || !user) {
        throw new Error("No tienes permisos para acceder a esta función");
      }

      setLoading(true);
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("No se pudo obtener el token de acceso");
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-admin/prices`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            action: "create-price",
            ...priceData
          }),
        });

        if (!response.ok) {
          throw new Error("Error al crear el precio en Stripe");
        }

        const data = await response.json();
        toast({
          title: "Éxito",
          description: "Precio creado en Stripe correctamente",
        });
        return data.price;
      } catch (error) {
        console.error("Error creating Stripe price:", error);
        toast({
          title: "Error",
          description: "No se pudo crear el precio en Stripe",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, user, toast]
  );

  const updateStripeProduct = useCallback(
    async (
      productId: string,
      updateData: {
        name?: string;
        description?: string;
        active?: boolean;
        metadata?: Record<string, string>;
      }
    ): Promise<StripeProduct> => {
      if (isAdminLoading) {
        throw new Error("Verificando permisos de administrador...");
      }
      if (!isAdmin || !user) {
        throw new Error("No tienes permisos para acceder a esta función");
      }

      setLoading(true);
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("No se pudo obtener el token de acceso");
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-admin/products/${productId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar el producto en Stripe");
        }

        const data = await response.json();
        toast({
          title: "Éxito",
          description: "Producto actualizado en Stripe correctamente",
        });
        return data.product;
      } catch (error) {
        console.error("Error updating Stripe product:", error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el producto en Stripe",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, user, toast]
  );

  const updateStripePrice = useCallback(
    async (
      priceId: string,
      updateData: {
        active?: boolean;
        metadata?: Record<string, string>;
        lookup_key?: string;
      }
    ): Promise<StripePrice> => {
      if (isAdminLoading) {
        throw new Error("Verificando permisos de administrador...");
      }
      if (!isAdmin || !user) {
        throw new Error("No tienes permisos para acceder a esta función");
      }

      setLoading(true);
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("No se pudo obtener el token de acceso");
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-admin/prices/${priceId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar el precio en Stripe");
        }

        const data = await response.json();
        toast({
          title: "Éxito",
          description: "Precio actualizado en Stripe correctamente",
        });
        return data.price;
      } catch (error) {
        console.error("Error updating Stripe price:", error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el precio en Stripe",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, user, toast]
  );

  const syncLocalPlansWithStripe = useCallback(async (): Promise<void> => {
    if (isAdminLoading) {
      throw new Error("Verificando permisos de administrador...");
    }
    if (!isAdmin || !user) {
      throw new Error("No tienes permisos para acceder a esta función");
    }

    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("No se pudo obtener el token de acceso");
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-admin/prices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action: "get-plans" }),
      });

      if (!response.ok) {
        throw new Error("Error al sincronizar los planes con Stripe");
      }

      toast({
        title: "Éxito",
        description: "Planes sincronizados con Stripe correctamente",
      });
    } catch (error) {
      console.error("Error syncing plans with Stripe:", error);
      toast({
        title: "Error",
        description: "No se pudieron sincronizar los planes con Stripe",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user, toast]);

  const fetchStripeSubscriptions = useCallback(async (): Promise<StripeSubscription[]> => {
    if (isAdminLoading) {
      throw new Error("Verificando permisos de administrador...");
    }
    if (!isAdmin || !user) {
      throw new Error("No tienes permisos para acceder a esta función");
    }

    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("No se pudo obtener el token de acceso");
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-subscriptions/subscriptions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error al obtener las suscripciones de Stripe: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const subscriptions = data.subscriptions || [];
      
      return subscriptions;
    } catch (error) {
      console.error("Error fetching Stripe subscriptions:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cargar las suscripciones de Stripe",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user, toast, isAdminLoading]);

  const cancelStripeSubscription = useCallback(
    async (subscriptionId: string): Promise<void> => {
      if (isAdminLoading) {
        throw new Error("Verificando permisos de administrador...");
      }
      if (!isAdmin || !user) {
        throw new Error("No tienes permisos para acceder a esta función");
      }

      setLoading(true);
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("No se pudo obtener el token de acceso");
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-subscriptions/cancel-subscription`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ subscriptionId }),
        });

        if (!response.ok) {
          throw new Error("Error al cancelar la suscripción en Stripe");
        }

        toast({
          title: "Éxito",
          description: "Suscripción cancelada correctamente",
        });
      } catch (error) {
        console.error("Error canceling Stripe subscription:", error);
        toast({
          title: "Error",
          description: "No se pudo cancelar la suscripción",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, user, toast]
  );

  const reactivateStripeSubscription = useCallback(
    async (subscriptionId: string): Promise<void> => {
      if (isAdminLoading) {
        throw new Error("Verificando permisos de administrador...");
      }
      if (!isAdmin || !user) {
        throw new Error("No tienes permisos para acceder a esta función");
      }

      setLoading(true);
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("No se pudo obtener el token de acceso");
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-subscriptions/reactivate-subscription`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ subscriptionId }),
        });

        if (!response.ok) {
          throw new Error("Error al reactivar la suscripción en Stripe");
        }

        toast({
          title: "Éxito",
          description: "Suscripción reactivada correctamente",
        });
      } catch (error) {
        console.error("Error reactivating Stripe subscription:", error);
        toast({
          title: "Error",
          description: "No se pudo reactivar la suscripción",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, user, toast]
  );

  return {
    // State
    loading,
    isLoading: loading,
    plans,
    products,
    prices,
    error: null,
    
    // Functions
    fetchStripePlans,
    fetchStripeProducts,
    fetchStripePrices,
    
    // Aliases for PricingManagement compatibility
    createProduct: createStripeProduct,
    createPrice: createStripePrice,
    updateProduct: updateStripeProduct,
    updatePrice: updateStripePrice,
    syncPlans: syncLocalPlansWithStripe,
    
    // Original function names
    createStripeProduct,
    createStripePrice,
    updateStripeProduct,
    updateStripePrice,
    syncLocalPlansWithStripe,
    fetchStripeSubscriptions,
    cancelStripeSubscription,
    reactivateStripeSubscription,
  };
};