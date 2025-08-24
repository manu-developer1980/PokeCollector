import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Calendar,
  Users,
  Star,
  Crown,
  Zap,
  Check,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { useStripeAdmin, type StripePlan, type StripeProduct, type StripePrice } from "@/hooks/useStripeAdmin";
import { useAdminSubscription } from "@/hooks/useAdminSubscription";
import { useAdmin } from "@/hooks/useAdmin";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { supabase } from "../../../../supabase/supabase";
import { PlanChangeModal } from "./PlanChangeModal";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_period: "monthly" | "yearly" | "lifetime";
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  max_collections: number;
  max_cards_per_collection: number;
  priority_support: boolean;
  advanced_analytics: boolean;
  custom_themes: boolean;
  api_access: boolean;
  stripe_price_id?: string;
  created_at: string;
  updated_at: string;
  subscriber_count: number;
}

interface Subscription {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  plan_id: string;
  plan_name: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

const PricingManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    plans,
    products,
    prices,
    isLoading,
    error,
    fetchStripePlans,
    createProduct,
    updateProduct,
    createPrice,
    updatePrice,
    syncPlans,
    fetchStripeSubscriptions,
    cancelStripeSubscription,
    reactivateStripeSubscription,
  } = useStripeAdmin();
  
  const {
    changePlan,
    isChangingPlan,
  } = useAdminSubscription();
  
  // Import admin loading state
  const { isLoading: isAdminLoading } = useAdmin();
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"plans" | "subscriptions">("plans");
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState<string>("");
  const [newPlan, setNewPlan] = useState<Partial<PricingPlan>>({
    name: "",
    description: "",
    price: 0,
    currency: "EUR",
    billing_period: "monthly",
    features: [],
    is_active: true,
    is_popular: false,
    max_collections: 10,
    max_cards_per_collection: 100,
    priority_support: false,
    advanced_analytics: false,
    custom_themes: false,
    api_access: false,
  });

  // Load data from Stripe
  useEffect(() => {
    // Don't load data if admin is still loading
    if (isAdminLoading) {
      return;
    }

    const loadData = async () => {
      try {
        const fetchedPlans = await fetchStripePlans();
        // Planes obtenidos desde Stripe
        
        // Fetch real subscriptions from Stripe
        const stripeSubscriptions = await fetchStripeSubscriptions();
        
        // Get unique Stripe customer IDs
        const stripeCustomerIds = [...new Set(
          stripeSubscriptions
            .filter(sub => sub && sub.stripeCustomerId)
            .map(sub => sub.stripeCustomerId)
        )];

        // Map Stripe customer IDs to user UUIDs
        const customerToUserMap = new Map<string, string>();
        if (stripeCustomerIds.length > 0) {
          const { data: subscriptionData, error } = await supabase
            .from('subscriptions')
            .select('user_id, customer_id')
            .in('customer_id', stripeCustomerIds);

          if (!error && subscriptionData) {
            subscriptionData.forEach(sub => {
              if (sub.customer_id && sub.user_id) {
                customerToUserMap.set(sub.customer_id, sub.user_id);
              }
            });
          }
        }
        
        // Convert Stripe subscriptions to our format with proper user IDs
        const formattedSubscriptions: Subscription[] = (stripeSubscriptions || [])
          .filter(sub => sub && sub.id && sub.stripeCustomerId) // Filter out null/undefined subscriptions
          .map(sub => {
            const realUserId = customerToUserMap.get(sub.stripeCustomerId) || '';
            return {
              id: sub.id || '',
              user_id: realUserId,
              user_email: sub.user?.email || 'N/A',
              user_name: sub.user?.name || 'N/A',
              plan_id: sub.plan?.name || 'N/A',
              plan_name: sub.plan?.name || 'N/A',
              status: (sub.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete") || "incomplete",
              current_period_start: sub.currentPeriodStart || '',
              current_period_end: sub.currentPeriodEnd || '',
              cancel_at_period_end: sub.cancelAtPeriodEnd || false,
              stripe_subscription_id: sub.stripeSubscriptionId || '',
              created_at: sub.createdAt || new Date().toISOString(),
              updated_at: sub.createdAt || new Date().toISOString(),
            };
          })
          .filter(sub => sub.user_id); // Only include subscriptions with valid user IDs

        setSubscriptions(formattedSubscriptions);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al cargar los datos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchStripePlans, fetchStripeSubscriptions, isAdminLoading, toast]);

  const handleSyncPlans = async () => {
    try {
      await syncPlans();
      toast({
        title: "Éxito",
        description: "Planes sincronizados con Stripe",
      });
    } catch (error) {
      console.error("Error syncing plans:", error);
      toast({
        title: "Error",
        description: "Error al sincronizar planes con Stripe",
        variant: "destructive",
      });
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.description || newPlan.price <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create product first
      const product = await createProduct({
        name: newPlan.name,
        description: newPlan.description,
        metadata: {
          features: JSON.stringify(newPlan.features),
          popular: newPlan.is_popular?.toString() || 'false',
          max_collections: newPlan.max_collections?.toString() || '10',
          max_cards_per_collection: newPlan.max_cards_per_collection?.toString() || '100',
          priority_support: newPlan.priority_support?.toString() || 'false',
          advanced_analytics: newPlan.advanced_analytics?.toString() || 'false',
          custom_themes: newPlan.custom_themes?.toString() || 'false',
          api_access: newPlan.api_access?.toString() || 'false',
        },
      });

      if (product) {
        // Create price for the product
        await createPrice({
          product: product.id,
          unit_amount: Math.round(newPlan.price * 100), // Convert to cents
          currency: newPlan.currency,
          recurring: newPlan.billing_period !== "lifetime" ? {
            interval: newPlan.billing_period === "monthly" ? "month" : "year",
          } : undefined,
        });

        // Reset form
        setNewPlan({
          name: "",
          description: "",
          price: 0,
          currency: "EUR",
          billing_period: "monthly",
          features: [],
          is_active: true,
          is_popular: false,
          max_collections: 10,
          max_cards_per_collection: 100,
          priority_support: false,
          advanced_analytics: false,
          custom_themes: false,
          api_access: false,
        });
        setIsCreateDialogOpen(false);

        // Refresh plans
        await fetchStripePlans();

        toast({
          title: "Éxito",
          description: "Plan creado correctamente en Stripe",
        });
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      toast({
        title: "Error",
        description: "Error al crear el plan en Stripe",
        variant: "destructive",
      });
    }
  };

  const handleEditPlan = (plan: StripePlan) => {
    // Check if plan and product exist
    if (!plan || !plan.product) {
      console.error("Invalid plan data:", plan);
      toast({
        title: "Error",
        description: "Datos del plan inválidos",
        variant: "destructive",
      });
      return;
    }

    // Convert Stripe plan to editing format
    const features = plan.product?.metadata?.features ? 
      JSON.parse(plan.product.metadata.features) : [];
    
    const editingPlanData: PricingPlan = {
      id: plan.product.id || '',
      name: plan.product.name || '',
      description: plan.product.description || '',
      price: (plan.price?.unit_amount || 0) / 100,
      currency: plan.price?.currency || 'EUR',
      billing_period: plan.price?.recurring?.interval === 'month' ? 'monthly' : 'yearly',
      features: features,
      is_active: plan.product.active || false,
      is_popular: plan.product.metadata?.popular === 'true',
      max_collections: parseInt(plan.product.metadata?.max_collections || '10'),
      max_cards_per_collection: parseInt(plan.product.metadata?.max_cards_per_collection || '100'),
      priority_support: plan.product.metadata?.priority_support === 'true',
      advanced_analytics: plan.product.metadata?.advanced_analytics === 'true',
      custom_themes: plan.product.metadata?.custom_themes === 'true',
      api_access: plan.product.metadata?.api_access === 'true',
      stripe_price_id: plan.price?.id || '',
      created_at: plan.product?.created ? new Date(plan.product.created * 1000).toISOString() : new Date().toISOString(),
      updated_at: plan.product?.updated ? new Date(plan.product.updated * 1000).toISOString() : new Date().toISOString(),
      subscriber_count: 0, // This would come from your database
    };
    
    setEditingPlan(editingPlanData);
    setIsEditDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      // Update product in Stripe
      const stripeProduct = products.find(p => p.name === editingPlan.name);
      if (stripeProduct) {
        await updateProduct(stripeProduct.id, {
          name: editingPlan.name,
          description: editingPlan.description,
          metadata: {
            features: JSON.stringify(editingPlan.features),
            popular: editingPlan.is_popular.toString(),
            max_collections: editingPlan.max_collections.toString(),
            max_cards_per_collection: editingPlan.max_cards_per_collection.toString(),
            priority_support: editingPlan.priority_support.toString(),
            advanced_analytics: editingPlan.advanced_analytics.toString(),
            custom_themes: editingPlan.custom_themes.toString(),
            api_access: editingPlan.api_access.toString(),
          },
        });
      }

      setEditingPlan(null);
      setIsEditDialogOpen(false);

      // Refresh plans
      await fetchStripePlans();

      toast({
        title: "Éxito",
        description: "Plan actualizado correctamente en Stripe",
      });
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el plan en Stripe",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      // Note: In Stripe integration, you typically don't delete products/prices
      // Instead, you would archive them or set them as inactive
      const product = products.find(p => p && p.id === planId);
      if (product && product.id) {
        await updateProduct(product.id, { active: false });
        await fetchStripePlans(); // Refresh the plans
        toast({
          title: "Éxito",
          description: "Plan desactivado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: "No se encontró el producto",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deactivating plan:", error);
      toast({
        title: "Error",
        description: "No se pudo desactivar el plan",
        variant: "destructive",
      });
    }
  };

  const handleTogglePlanStatus = async (planId: string) => {
    try {
      const product = products.find(p => p && p.id === planId);
      if (product && product.id) {
        await updateProduct(product.id, { active: !product.active });
        await fetchStripePlans(); // Refresh the plans
        toast({
          title: "Éxito",
          description: "Estado del plan actualizado",
        });
      } else {
        toast({
          title: "Error",
          description: "No se encontró el producto",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling plan status:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del plan",
        variant: "destructive",
      });
    }
  };

  const addFeature = (features: string[], setFeatures: (features: string[]) => void) => {
    setFeatures([...features, ""]);
  };

  const updateFeature = (index: number, value: string, features: string[], setFeatures: (features: string[]) => void) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index: number, features: string[], setFeatures: (features: string[]) => void) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      await cancelStripeSubscription(subscriptionId);
      // Refresh subscriptions
      const stripeSubscriptions = await fetchStripeSubscriptions();
      const formattedSubscriptions: Subscription[] = stripeSubscriptions
        .filter(sub => sub && sub.id) // Filter out null/undefined subscriptions
        .map(sub => ({
         id: sub.id || '',
         user_id: sub.stripeCustomerId || '',
         user_email: sub.user?.email || 'N/A',
         user_name: sub.user?.name || 'N/A',
         plan_id: sub.plan?.name || '',
         plan_name: sub.plan?.name || '',
         status: sub.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete",
         current_period_start: sub.currentPeriodStart || '',
         current_period_end: sub.currentPeriodEnd || '',
         cancel_at_period_end: sub.cancelAtPeriodEnd || false,
         stripe_subscription_id: sub.stripeSubscriptionId || '',
         created_at: sub.createdAt || '',
         updated_at: sub.createdAt || '',
       }));
      setSubscriptions(formattedSubscriptions);
      
      toast({
        title: "Éxito",
        description: "Suscripción cancelada correctamente",
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast({
        title: "Error",
        description: "Error al cancelar la suscripción",
        variant: "destructive",
      });
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      await reactivateStripeSubscription(subscriptionId);
      // Refresh subscriptions
      const stripeSubscriptions = await fetchStripeSubscriptions();
      const formattedSubscriptions: Subscription[] = stripeSubscriptions
        .filter(sub => sub && sub.id) // Filter out null/undefined subscriptions
        .map(sub => ({
         id: sub.id || '',
         user_id: sub.stripeCustomerId || '',
         user_email: sub.user?.email || 'N/A',
         user_name: sub.user?.name || 'N/A',
         plan_id: sub.plan?.name || '',
         plan_name: sub.plan?.name || '',
         status: sub.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete",
         current_period_start: sub.currentPeriodStart || '',
         current_period_end: sub.currentPeriodEnd || '',
         cancel_at_period_end: sub.cancelAtPeriodEnd || false,
         stripe_subscription_id: sub.stripeSubscriptionId || '',
         created_at: sub.createdAt || '',
         updated_at: sub.createdAt || '',
       }));
      setSubscriptions(formattedSubscriptions);
      
      toast({
        title: "Éxito",
        description: "Suscripción reactivada correctamente",
      });
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      toast({
        title: "Error",
        description: "Error al reactivar la suscripción",
        variant: "destructive",
      });
    }
  };

  const handleChangePlan = async () => {
    if (!selectedSubscription || !selectedNewPlan) {
      toast({
        title: "Error",
        description: "Por favor selecciona un plan",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the selected plan to get its plan_type using the correct structure
      const selectedPlan = plans.find(plan => 
        plan.price && 
        plan.price.id === selectedNewPlan
      );
      
      if (!selectedPlan || !selectedPlan.product) {
        throw new Error("No se encontró el plan seleccionado");
      }

      // Try to get plan_type from metadata, or use the product name as fallback
      let planType = selectedPlan.product.metadata?.plan_type;
      
      if (!planType) {
        // Fallback: try to determine plan type from product name
        const productName = selectedPlan.product.name?.toLowerCase() || '';
        if (productName.includes('pro') || productName.includes('premium')) {
          planType = 'pro';
        } else if (productName.includes('basic') || productName.includes('starter')) {
          planType = 'basic';
        } else if (productName.includes('enterprise') || productName.includes('business')) {
          planType = 'enterprise';
        } else {
          // Use the price ID as plan type if nothing else works
          planType = selectedNewPlan;
        }
      }

      // console.log('Changing plan:', {
      //   userId: selectedSubscription.user_id,
      //   planType,
      //   selectedPlan: selectedPlan.product?.name
      // });

      await changePlan(selectedSubscription.user_id, planType, "Cambio manual desde administración");
      
      // Refresh subscriptions
      const stripeSubscriptions = await fetchStripeSubscriptions();
      const formattedSubscriptions: Subscription[] = stripeSubscriptions
        .filter(sub => sub && sub.id)
        .map(sub => ({
          id: sub.id || '',
          user_id: sub.stripeCustomerId || '',
          user_email: sub.user?.email || 'N/A',
          user_name: sub.user?.name || 'N/A',
          plan_id: sub.plan?.name || '',
          plan_name: sub.plan?.name || '',
          status: sub.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete",
          current_period_start: sub.currentPeriodStart || '',
          current_period_end: sub.currentPeriodEnd || '',
          cancel_at_period_end: sub.cancelAtPeriodEnd || false,
          stripe_subscription_id: sub.stripeSubscriptionId || '',
          created_at: sub.createdAt || '',
          updated_at: sub.createdAt || '',
        }));
      setSubscriptions(formattedSubscriptions);
      
      setIsChangePlanDialogOpen(false);
      setSelectedSubscription(null);
      setSelectedNewPlan("");
      
      toast({
        title: "Éxito",
        description: `Plan cambiado correctamente a ${selectedPlan.product?.name || 'plan seleccionado'}`,
      });
    } catch (error) {
      console.error("Error changing plan:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar el plan",
        variant: "destructive",
      });
    }
  };

  const openChangePlanDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setSelectedNewPlan("");
    setIsChangePlanDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Activa", variant: "default" as const },
      canceled: { label: "Cancelada", variant: "secondary" as const },
      past_due: { label: "Vencida", variant: "destructive" as const },
      trialing: { label: "Prueba", variant: "outline" as const },
      incomplete: { label: "Incompleta", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Gestión de Precios y Suscripciones</h3>
          <p className="text-sm text-gray-600">
            Administra planes de precios y suscripciones de usuarios
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "plans" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("plans")}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Planes de Precios
        </Button>
        <Button
          variant={activeTab === "subscriptions" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("subscriptions")}
        >
          <Users className="h-4 w-4 mr-2" />
          Suscripciones
        </Button>
      </div>

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          {/* Create Plan Button and Sync */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleSyncPlans} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sincronizar con Stripe
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Plan</DialogTitle>
                  <DialogDescription>
                    Define un nuevo plan de precios para los usuarios
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Plan</Label>
                    <Input
                      id="name"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                      placeholder="Ej: Plan Pro"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newPlan.price}
                        onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                      />
                      <Select value={newPlan.currency} onValueChange={(value) => setNewPlan({...newPlan, currency: value})}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing_period">Período de Facturación</Label>
                    <Select value={newPlan.billing_period} onValueChange={(value: any) => setNewPlan({...newPlan, billing_period: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                        <SelectItem value="lifetime">De por vida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max_collections">Máximo de Colecciones</Label>
                    <Input
                      id="max_collections"
                      type="number"
                      value={newPlan.max_collections}
                      onChange={(e) => setNewPlan({...newPlan, max_collections: parseInt(e.target.value)})}
                      placeholder="-1 para ilimitado"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-4">
                    <Label>Características</Label>
                    {newPlan.features?.map((feature, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value, newPlan.features || [], (features) => setNewPlan({...newPlan, features}))}
                          placeholder="Describe una característica"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(index, newPlan.features || [], (features) => setNewPlan({...newPlan, features}))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addFeature(newPlan.features || [], (features) => setNewPlan({...newPlan, features}))}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Característica
                    </Button>
                  </div>
                  
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newPlan.is_active}
                        onCheckedChange={(checked) => setNewPlan({...newPlan, is_active: checked})}
                      />
                      <Label>Plan Activo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newPlan.is_popular}
                        onCheckedChange={(checked) => setNewPlan({...newPlan, is_popular: checked})}
                      />
                      <Label>Plan Popular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newPlan.priority_support}
                        onCheckedChange={(checked) => setNewPlan({...newPlan, priority_support: checked})}
                      />
                      <Label>Soporte Prioritario</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newPlan.api_access}
                        onCheckedChange={(checked) => setNewPlan({...newPlan, api_access: checked})}
                      />
                      <Label>Acceso a API</Label>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreatePlan}>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Plan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.filter(plan => plan && plan.product).map((plan) => {
              const features = plan.product?.metadata?.features ? 
                          JSON.parse(plan.product.metadata.features) : [];
              const isPopular = plan.product?.metadata?.popular === "true";
              
              return (
                <Card key={plan.price?.id || plan.product?.id || Math.random()} className={`relative ${isPopular ? 'ring-2 ring-primary' : ''}`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{plan.product?.name || 'Plan sin nombre'}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{plan.product?.description || ''}</p>
                        <div className="text-xs text-gray-500 mt-1 font-mono">
                          {plan.product?.id || 'ID no disponible'}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Desactivar plan?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción desactivará el plan "{plan.product?.name || 'Plan'}" en Stripe. Los suscriptores existentes no se verán afectados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              {plan.product?.id && (
                                <AlertDialogAction onClick={() => plan.product?.id && handleDeletePlan(plan.product.id)}>
                                  Desactivar
                                </AlertDialogAction>
                              )}
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {((plan.price?.unit_amount || 0) / 100).toFixed(2)} {(plan.price?.currency || 'EUR').toUpperCase()}
                          <span className="text-sm font-normal text-gray-600">
                            /{plan.price?.recurring?.interval === "month" ? "mes" : "año"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Badge variant={plan.product?.active ? "default" : "secondary"}>
                            {plan.product?.active ? "Activo" : "Inactivo"}
                          </Badge>
                          {plan.product?.id && (
                            <Switch
                              checked={plan.product?.active || false}
                              onCheckedChange={() => handleTogglePlanStatus(plan.product.id)}
                            />
                          )}
                        </div>
                        <div 
                          className="text-sm text-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => plan.product?.id && window.open(`https://dashboard.stripe.com/products/${plan.product.id}`, '_blank')}
                          title="Ver en Stripe Dashboard"
                        >
                          <Badge variant="outline">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Stripe
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Período Actual</TableHead>
                    <TableHead>Cancelación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subscription.user_name}</div>
                          <div className="text-sm text-gray-500">{subscription.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{subscription.plan_name}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(subscription.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(subscription.current_period_start).toLocaleDateString()}</div>
                          <div className="text-gray-500">
                            hasta {new Date(subscription.current_period_end).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {subscription.cancel_at_period_end ? (
                          <Badge variant="destructive">Se cancela al final</Badge>
                        ) : (
                          <Badge variant="outline">Renovación automática</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {subscription.stripe_subscription_id && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              title="Ver en Stripe Dashboard"
                              onClick={() => window.open(`https://dashboard.stripe.com/subscriptions/${subscription.stripe_subscription_id}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          {subscription.status === 'active' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              title="Cambiar Plan"
                              onClick={() => openChangePlanDialog(subscription)}
                            >
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          )}
                          {subscription.status === 'active' && !subscription.cancel_at_period_end ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Cancelar suscripción?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción cancelará la suscripción de {subscription.user_name} al final del período actual.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleCancelSubscription(subscription.stripe_subscription_id!)}
                                  >
                                    Confirmar Cancelación
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : subscription.cancel_at_period_end ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReactivateSubscription(subscription.stripe_subscription_id!)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plan de Stripe</DialogTitle>
            <DialogDescription>
              Modifica los detalles del plan. Los cambios se aplicarán en Stripe.
            </DialogDescription>
          </DialogHeader>
          
          {editingPlan && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>ID Stripe:</strong> {editingPlan.id}
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Los precios no se pueden modificar una vez creados en Stripe. Para cambiar el precio, crea un nuevo plan.
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Nombre del Plan</Label>
                  <Input
                    id="edit_name"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_price">Precio (Solo lectura)</Label>
                  <Input
                    id="edit_price"
                    type="number"
                    step="0.01"
                    value={editingPlan.price}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="edit_description">Descripción</Label>
                  <Textarea
                    id="edit_description"
                    value={editingPlan.description}
                    onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <Label>Características</Label>
                  {editingPlan.features.map((feature, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value, editingPlan.features, (features) => setEditingPlan({...editingPlan, features}))}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index, editingPlan.features, (features) => setEditingPlan({...editingPlan, features}))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addFeature(editingPlan.features, (features) => setEditingPlan({...editingPlan, features}))}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Característica
                  </Button>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-popular"
                      checked={editingPlan.is_popular}
                      onCheckedChange={(checked) => setEditingPlan({...editingPlan, is_popular: checked})}
                    />
                    <Label htmlFor="edit-popular">Plan Popular</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-active"
                      checked={editingPlan.is_active}
                      onCheckedChange={(checked) => setEditingPlan({...editingPlan, is_active: checked})}
                    />
                    <Label htmlFor="edit-active">Plan Activo</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSavePlan} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Actualizar en Stripe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={isChangePlanDialogOpen} onOpenChange={setIsChangePlanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Plan de Suscripción</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo plan para {selectedSubscription?.user_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm">
                <strong>Usuario:</strong> {selectedSubscription?.user_name}
              </div>
              <div className="text-sm text-gray-600">
                <strong>Plan actual:</strong> {selectedSubscription?.plan_name}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-plan">Nuevo Plan</Label>
              <Select value={selectedNewPlan} onValueChange={setSelectedNewPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    // Filter plans that have valid structure: product, active, and price
                    const filteredPlans = plans.filter(plan => 
                      plan && 
                      plan.product && 
                      plan.product.active && 
                      plan.price && 
                      plan.price.id
                    );
                    
                    if (filteredPlans.length === 0) {
                      return (
                        <SelectItem value="no-plans" disabled>
                          No hay planes disponibles
                        </SelectItem>
                      );
                    }
                    
                    return filteredPlans.map((plan) => {
                      const price = plan.price; // Use the price property
                      const planName = plan.product?.name || 'Plan sin nombre';
                      const priceAmount = ((price?.unit_amount || 0) / 100).toFixed(2);
                      const currency = (price?.currency || 'EUR').toUpperCase();
                      const interval = price?.recurring?.interval === "month" ? "mes" : "año";
                      const displayText = `${planName} - ${priceAmount} ${currency}/${interval}`;
                      
                      return (
                        <SelectItem 
                          key={price.id} 
                          value={price.id}
                        >
                          {displayText}
                        </SelectItem>
                      );
                    });
                  })()}
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Nota:</strong> El cambio se aplicará inmediatamente y se prorrateará el costo.
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsChangePlanDialogOpen(false)}
              disabled={isChangingPlan}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleChangePlan} 
              disabled={isChangingPlan || !selectedNewPlan}
            >
              {isChangingPlan ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowUpDown className="h-4 w-4 mr-2" />
              )}
              Cambiar Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Change Loading Modal */}
      <PlanChangeModal 
        isOpen={isChangingPlan} 
        message="Actualizando plan de suscripción..." 
      />
    </div>
  );
};

export default PricingManagement;