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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Play,
  Pause,
  Settings,
  RefreshCw,
  Calendar,
  Clock,
  Zap,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  Bot,
  Globe,
  Rss,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Star,
  Hash,
  Image,
  Link,
  Save,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  trigger_type: "schedule" | "keyword" | "event" | "manual";
  schedule_frequency?: "daily" | "weekly" | "monthly";
  schedule_time?: string;
  keywords: string[];
  content_type: "news" | "guide" | "review" | "analysis";
  auto_publish: boolean;
  language: string;
  template_id?: string;
  last_run?: string;
  next_run?: string;
  created_at: string;
  updated_at: string;
  success_count: number;
  error_count: number;
}

interface GeneratedArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  source_url?: string;
  keywords: string[];
  status: "generated" | "reviewed" | "published" | "rejected";
  quality_score: number;
  automation_rule_id: string;
  rule_name: string;
  generated_at: string;
  published_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  featured_image_url?: string;
  estimated_read_time: number;
}

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  content_type: "news" | "guide" | "review" | "analysis";
  template_structure: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  usage_count: number;
}

interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: "rss" | "api" | "scraper";
  is_active: boolean;
  last_check?: string;
  articles_found: number;
  success_rate: number;
}

const NewsAutomation: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [generatedArticles, setGeneratedArticles] = useState<GeneratedArticle[]>([]);
  const [contentTemplates, setContentTemplates] = useState<ContentTemplate[]>([]);
  const [newsSources, setNewsSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rules" | "articles" | "templates" | "sources">("rules");
  const [isCreateRuleDialogOpen, setIsCreateRuleDialogOpen] = useState(false);
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    active: "all",
  });

  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
    name: "",
    description: "",
    is_active: true,
    trigger_type: "schedule",
    schedule_frequency: "daily",
    schedule_time: "09:00",
    keywords: [],
    content_type: "news",
    auto_publish: false,
    language: "es",
  });

  const [newTemplate, setNewTemplate] = useState<Partial<ContentTemplate>>({
    name: "",
    description: "",
    content_type: "news",
    template_structure: "",
    variables: [],
    is_active: true,
  });

  // Mock data - in real implementation, this would come from the API
  useEffect(() => {
    const mockRules: AutomationRule[] = [
      {
        id: "1",
        name: "Noticias Diarias Pokémon",
        description: "Genera artículos diarios sobre noticias de Pokémon",
        is_active: true,
        trigger_type: "schedule",
        schedule_frequency: "daily",
        schedule_time: "09:00",
        keywords: ["pokemon", "nintendo", "game freak", "cartas", "tcg"],
        content_type: "news",
        auto_publish: false,
        language: "es",
        template_id: "1",
        last_run: "2024-01-20T09:00:00Z",
        next_run: "2024-01-21T09:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-20T00:00:00Z",
        success_count: 45,
        error_count: 2,
      },
      {
        id: "2",
        name: "Análisis de Nuevas Cartas",
        description: "Crea análisis cuando se lanzan nuevas cartas",
        is_active: true,
        trigger_type: "keyword",
        keywords: ["nueva carta", "nuevo set", "expansion", "booster"],
        content_type: "analysis",
        auto_publish: false,
        language: "es",
        template_id: "2",
        last_run: "2024-01-18T14:30:00Z",
        created_at: "2024-01-05T00:00:00Z",
        updated_at: "2024-01-18T00:00:00Z",
        success_count: 12,
        error_count: 0,
      },
      {
        id: "3",
        name: "Guías Semanales",
        description: "Genera guías de estrategia semanalmente",
        is_active: false,
        trigger_type: "schedule",
        schedule_frequency: "weekly",
        schedule_time: "10:00",
        keywords: ["estrategia", "deck", "meta", "competitivo"],
        content_type: "guide",
        auto_publish: false,
        language: "es",
        template_id: "3",
        last_run: "2024-01-15T10:00:00Z",
        next_run: "2024-01-22T10:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T00:00:00Z",
        success_count: 8,
        error_count: 1,
      },
    ];

    const mockArticles: GeneratedArticle[] = [
      {
        id: "1",
        title: "Nuevas Cartas Reveladas para la Expansión Temporal Forces",
        content: "La Pokémon Company ha revelado nuevas cartas emocionantes para la próxima expansión Temporal Forces...",
        excerpt: "Descubre las nuevas cartas que llegarán en la expansión Temporal Forces",
        source_url: "https://pokemon.com/news/temporal-forces",
        keywords: ["temporal forces", "nuevas cartas", "expansion"],
        status: "reviewed",
        quality_score: 8.5,
        automation_rule_id: "1",
        rule_name: "Noticias Diarias Pokémon",
        generated_at: "2024-01-20T09:15:00Z",
        featured_image_url: "/images/temporal-forces.jpg",
        estimated_read_time: 3,
      },
      {
        id: "2",
        title: "Análisis del Meta Competitivo: Enero 2024",
        content: "El meta competitivo ha experimentado cambios significativos este mes...",
        excerpt: "Un análisis profundo del estado actual del meta competitivo",
        keywords: ["meta", "competitivo", "analisis", "enero"],
        status: "generated",
        quality_score: 7.8,
        automation_rule_id: "2",
        rule_name: "Análisis de Nuevas Cartas",
        generated_at: "2024-01-20T14:45:00Z",
        estimated_read_time: 5,
      },
      {
        id: "3",
        title: "Guía: Construyendo un Deck Competitivo con Charizard ex",
        content: "Charizard ex se ha convertido en una de las cartas más populares...",
        excerpt: "Aprende a construir un deck competitivo con Charizard ex",
        keywords: ["charizard", "deck", "competitivo", "guia"],
        status: "published",
        quality_score: 9.2,
        automation_rule_id: "3",
        rule_name: "Guías Semanales",
        generated_at: "2024-01-18T10:30:00Z",
        published_at: "2024-01-19T08:00:00Z",
        reviewed_by: "Admin",
        featured_image_url: "/images/charizard-deck.jpg",
        estimated_read_time: 7,
      },
    ];

    const mockTemplates: ContentTemplate[] = [
      {
        id: "1",
        name: "Plantilla de Noticias",
        description: "Plantilla estándar para artículos de noticias",
        content_type: "news",
        template_structure: `# {{title}}

{{excerpt}}

## Detalles de la Noticia

{{content}}

### Fuentes
- {{source_url}}

### Etiquetas
{{keywords}}`,
        variables: ["title", "excerpt", "content", "source_url", "keywords"],
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        usage_count: 45,
      },
      {
        id: "2",
        name: "Plantilla de Análisis",
        description: "Plantilla para análisis detallados",
        content_type: "analysis",
        template_structure: `# {{title}}

## Resumen Ejecutivo
{{excerpt}}

## Análisis Detallado
{{content}}

## Conclusiones
{{conclusions}}

## Impacto en el Meta
{{meta_impact}}`,
        variables: ["title", "excerpt", "content", "conclusions", "meta_impact"],
        is_active: true,
        created_at: "2024-01-05T00:00:00Z",
        usage_count: 12,
      },
      {
        id: "3",
        name: "Plantilla de Guías",
        description: "Plantilla para guías paso a paso",
        content_type: "guide",
        template_structure: `# {{title}}

## Introducción
{{introduction}}

## Requisitos Previos
{{prerequisites}}

## Pasos a Seguir
{{steps}}

## Consejos Adicionales
{{tips}}

## Conclusión
{{conclusion}}`,
        variables: ["title", "introduction", "prerequisites", "steps", "tips", "conclusion"],
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        usage_count: 8,
      },
    ];

    const mockSources: NewsSource[] = [
      {
        id: "1",
        name: "Pokémon Official News",
        url: "https://pokemon.com/news/rss",
        type: "rss",
        is_active: true,
        last_check: "2024-01-20T09:00:00Z",
        articles_found: 156,
        success_rate: 98.5,
      },
      {
        id: "2",
        name: "PokeBeach",
        url: "https://pokebeach.com/feed",
        type: "rss",
        is_active: true,
        last_check: "2024-01-20T09:05:00Z",
        articles_found: 89,
        success_rate: 95.2,
      },
      {
        id: "3",
        name: "Serebii News",
        url: "https://serebii.net/news.rss",
        type: "rss",
        is_active: false,
        last_check: "2024-01-19T09:00:00Z",
        articles_found: 234,
        success_rate: 87.3,
      },
    ];

    setAutomationRules(mockRules);
    setGeneratedArticles(mockArticles);
    setContentTemplates(mockTemplates);
    setNewsSources(mockSources);
    setLoading(false);
  }, []);

  const handleCreateRule = async () => {
    try {
      const ruleToCreate: AutomationRule = {
        ...newRule,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        success_count: 0,
        error_count: 0,
      } as AutomationRule;

      if (newRule.trigger_type === "schedule" && newRule.schedule_frequency && newRule.schedule_time) {
        // Calculate next run time
        const now = new Date();
        const [hours, minutes] = newRule.schedule_time.split(':').map(Number);
        const nextRun = new Date(now);
        nextRun.setHours(hours, minutes, 0, 0);
        
        if (nextRun <= now) {
          if (newRule.schedule_frequency === "daily") {
            nextRun.setDate(nextRun.getDate() + 1);
          } else if (newRule.schedule_frequency === "weekly") {
            nextRun.setDate(nextRun.getDate() + 7);
          } else if (newRule.schedule_frequency === "monthly") {
            nextRun.setMonth(nextRun.getMonth() + 1);
          }
        }
        
        ruleToCreate.next_run = nextRun.toISOString();
      }

      setAutomationRules([ruleToCreate, ...automationRules]);
      setIsCreateRuleDialogOpen(false);
      setNewRule({
        name: "",
        description: "",
        is_active: true,
        trigger_type: "schedule",
        schedule_frequency: "daily",
        schedule_time: "09:00",
        keywords: [],
        content_type: "news",
        auto_publish: false,
        language: "es",
      });

      toast({
        title: "Éxito",
        description: "Regla de automatización creada correctamente",
      });
    } catch (error) {
      console.error("Error creating automation rule:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la regla de automatización",
        variant: "destructive",
      });
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const templateToCreate: ContentTemplate = {
        ...newTemplate,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        usage_count: 0,
      } as ContentTemplate;

      setContentTemplates([templateToCreate, ...contentTemplates]);
      setIsCreateTemplateDialogOpen(false);
      setNewTemplate({
        name: "",
        description: "",
        content_type: "news",
        template_structure: "",
        variables: [],
        is_active: true,
      });

      toast({
        title: "Éxito",
        description: "Plantilla creada correctamente",
      });
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la plantilla",
        variant: "destructive",
      });
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      setAutomationRules(automationRules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, is_active: isActive, updated_at: new Date().toISOString() }
          : rule
      ));

      toast({
        title: "Éxito",
        description: `Regla ${isActive ? 'activada' : 'desactivada'} correctamente`,
      });
    } catch (error) {
      console.error("Error toggling rule:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la regla",
        variant: "destructive",
      });
    }
  };

  const handleRunRule = async (ruleId: string) => {
    try {
      // Simulate running the rule
      const rule = automationRules.find(r => r.id === ruleId);
      if (!rule) return;

      // Update last run time
      setAutomationRules(automationRules.map(r => 
        r.id === ruleId 
          ? { ...r, last_run: new Date().toISOString() }
          : r
      ));

      toast({
        title: "Éxito",
        description: "Regla ejecutada correctamente",
      });
    } catch (error) {
      console.error("Error running rule:", error);
      toast({
        title: "Error",
        description: "No se pudo ejecutar la regla",
        variant: "destructive",
      });
    }
  };

  const handleApproveArticle = async (articleId: string) => {
    try {
      setGeneratedArticles(generatedArticles.map(article => 
        article.id === articleId 
          ? { 
              ...article, 
              status: "published", 
              published_at: new Date().toISOString(),
              reviewed_by: "Admin"
            }
          : article
      ));

      toast({
        title: "Éxito",
        description: "Artículo aprobado y publicado",
      });
    } catch (error) {
      console.error("Error approving article:", error);
      toast({
        title: "Error",
        description: "No se pudo aprobar el artículo",
        variant: "destructive",
      });
    }
  };

  const handleRejectArticle = async (articleId: string) => {
    try {
      setGeneratedArticles(generatedArticles.map(article => 
        article.id === articleId 
          ? { 
              ...article, 
              status: "rejected",
              reviewed_by: "Admin"
            }
          : article
      ));

      toast({
        title: "Éxito",
        description: "Artículo rechazado",
      });
    } catch (error) {
      console.error("Error rejecting article:", error);
      toast({
        title: "Error",
        description: "No se pudo rechazar el artículo",
        variant: "destructive",
      });
    }
  };

  const addKeyword = (keywords: string[], setKeywords: (keywords: string[]) => void, newKeyword: string) => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword]);
    }
  };

  const removeKeyword = (keywords: string[], setKeywords: (keywords: string[]) => void, keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      generated: { label: "Generado", variant: "secondary" as const, icon: Bot },
      reviewed: { label: "Revisado", variant: "default" as const, icon: Eye },
      published: { label: "Publicado", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "Rechazado", variant: "destructive" as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.generated;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getContentTypeBadge = (type: string) => {
    const typeConfig = {
      news: { label: "Noticia", icon: FileText },
      guide: { label: "Guía", icon: FileText },
      review: { label: "Reseña", icon: Star },
      analysis: { label: "Análisis", icon: TrendingUp },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.news;
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
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
          <h3 className="text-lg font-semibold">Automatización de Noticias</h3>
          <p className="text-sm text-gray-600">
            Gestiona la creación automática de artículos y noticias sobre Pokémon
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Ejecutar Todas
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reglas Activas</p>
                <p className="text-2xl font-bold">{automationRules.filter(r => r.is_active).length}</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Artículos Generados</p>
                <p className="text-2xl font-bold">{generatedArticles.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes de Revisión</p>
                <p className="text-2xl font-bold">{generatedArticles.filter(a => a.status === "generated").length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Publicados Hoy</p>
                <p className="text-2xl font-bold">{generatedArticles.filter(a => a.status === "published").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Reglas
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Artículos
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Rss className="h-4 w-4" />
            Fuentes
          </TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {automationRules.length} reglas configuradas
            </div>
            <Dialog open={isCreateRuleDialogOpen} onOpenChange={setIsCreateRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Regla
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Regla de Automatización</DialogTitle>
                  <DialogDescription>
                    Configura una nueva regla para generar contenido automáticamente
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule_name">Nombre</Label>
                    <Input
                      id="rule_name"
                      value={newRule.name}
                      onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                      placeholder="Nombre de la regla"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content_type">Tipo de Contenido</Label>
                    <Select value={newRule.content_type} onValueChange={(value: any) => setNewRule({...newRule, content_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="news">Noticia</SelectItem>
                        <SelectItem value="guide">Guía</SelectItem>
                        <SelectItem value="review">Reseña</SelectItem>
                        <SelectItem value="analysis">Análisis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="trigger_type">Tipo de Activación</Label>
                    <Select value={newRule.trigger_type} onValueChange={(value: any) => setNewRule({...newRule, trigger_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="schedule">Programada</SelectItem>
                        <SelectItem value="keyword">Por Palabras Clave</SelectItem>
                        <SelectItem value="event">Por Evento</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newRule.trigger_type === "schedule" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frecuencia</Label>
                        <Select value={newRule.schedule_frequency} onValueChange={(value: any) => setNewRule({...newRule, schedule_frequency: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diaria</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="time">Hora</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newRule.schedule_time}
                          onChange={(e) => setNewRule({...newRule, schedule_time: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newRule.description}
                      onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                      rows={2}
                      placeholder="Descripción de la regla"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label>Palabras Clave</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newRule.keywords?.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {keyword}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeKeyword(newRule.keywords || [], (keywords) => setNewRule({...newRule, keywords}), keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Nueva palabra clave"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          addKeyword(newRule.keywords || [], (keywords) => setNewRule({...newRule, keywords}), input.value);
                          input.value = '';
                        }
                      }}
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newRule.is_active}
                        onCheckedChange={(checked) => setNewRule({...newRule, is_active: checked})}
                      />
                      <Label>Regla activa</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newRule.auto_publish}
                        onCheckedChange={(checked) => setNewRule({...newRule, auto_publish: checked})}
                      />
                      <Label>Publicación automática</Label>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateRuleDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateRule}>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Regla
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {automationRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{rule.name}</h4>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                        {getContentTypeBadge(rule.content_type)}
                      </div>
                      
                      <p className="text-sm text-gray-600">{rule.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {rule.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Tipo:</span>
                          <div className="font-medium capitalize">{rule.trigger_type}</div>
                        </div>
                        {rule.schedule_frequency && (
                          <div>
                            <span className="text-gray-500">Frecuencia:</span>
                            <div className="font-medium capitalize">{rule.schedule_frequency}</div>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Éxitos:</span>
                          <div className="font-medium text-green-600">{rule.success_count}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Errores:</span>
                          <div className="font-medium text-red-600">{rule.error_count}</div>
                        </div>
                      </div>
                      
                      {rule.next_run && (
                        <div className="text-sm">
                          <span className="text-gray-500">Próxima ejecución:</span>
                          <div className="font-medium">{new Date(rule.next_run).toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      />
                      <Button variant="outline" size="sm" onClick={() => handleRunRule(rule.id)}>
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {generatedArticles.length} artículos generados
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="generated">Generados</SelectItem>
                  <SelectItem value="reviewed">Revisados</SelectItem>
                  <SelectItem value="published">Publicados</SelectItem>
                  <SelectItem value="rejected">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4">
            {generatedArticles.map((article) => (
              <Card key={article.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{article.title}</h4>
                        {getStatusBadge(article.status)}
                        <Badge variant="outline" className={`${getQualityColor(article.quality_score)}`}>
                          {article.quality_score}/10
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">{article.excerpt}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {article.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Regla:</span>
                          <div className="font-medium">{article.rule_name}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Generado:</span>
                          <div className="font-medium">{new Date(article.generated_at).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Tiempo de lectura:</span>
                          <div className="font-medium">{article.estimated_read_time} min</div>
                        </div>
                        {article.reviewed_by && (
                          <div>
                            <span className="text-gray-500">Revisado por:</span>
                            <div className="font-medium">{article.reviewed_by}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {article.status === "generated" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleApproveArticle(article.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRejectArticle(article.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {contentTemplates.length} plantillas disponibles
            </div>
            <Dialog open={isCreateTemplateDialogOpen} onOpenChange={setIsCreateTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Plantilla</DialogTitle>
                  <DialogDescription>
                    Crea una plantilla para generar contenido automáticamente
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template_name">Nombre</Label>
                      <Input
                        id="template_name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                        placeholder="Nombre de la plantilla"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="template_type">Tipo</Label>
                      <Select value={newTemplate.content_type} onValueChange={(value: any) => setNewTemplate({...newTemplate, content_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="news">Noticia</SelectItem>
                          <SelectItem value="guide">Guía</SelectItem>
                          <SelectItem value="review">Reseña</SelectItem>
                          <SelectItem value="analysis">Análisis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template_description">Descripción</Label>
                    <Textarea
                      id="template_description"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                      rows={2}
                      placeholder="Descripción de la plantilla"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template_structure">Estructura de la Plantilla</Label>
                    <Textarea
                      id="template_structure"
                      value={newTemplate.template_structure}
                      onChange={(e) => setNewTemplate({...newTemplate, template_structure: e.target.value})}
                      rows={10}
                      placeholder="Usa {{variable}} para variables dinámicas"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateTemplateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Plantilla
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {contentTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{template.name}</h4>
                        {getContentTypeBadge(template.content_type)}
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">{template.description}</p>
                      
                      <div className="text-sm">
                        <span className="text-gray-500">Variables:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.variables.map((variable, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-500">Usos:</span>
                        <span className="font-medium ml-2">{template.usage_count}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {newsSources.length} fuentes configuradas
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Fuente
            </Button>
          </div>

          <div className="grid gap-4">
            {newsSources.map((source) => (
              <Card key={source.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{source.name}</h4>
                        <Badge variant={source.is_active ? "default" : "secondary"}>
                          {source.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                        <Badge variant="outline" className="uppercase">
                          {source.type}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <Link className="h-4 w-4 inline mr-1" />
                        {source.url}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Artículos encontrados:</span>
                          <div className="font-medium">{source.articles_found}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Tasa de éxito:</span>
                          <div className="font-medium">{source.success_rate}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Última verificación:</span>
                          <div className="font-medium">
                            {source.last_check ? new Date(source.last_check).toLocaleString() : "Nunca"}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsAutomation;