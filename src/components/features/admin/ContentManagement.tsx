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
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  Image,
  Video,
  Link,
  Eye,
  EyeOff,
  Calendar,
  User,
  Tag,
  Search,
  Filter,
  Upload,
  Download,
  Globe,
  Languages,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: "page" | "post" | "news" | "guide" | "faq";
  status: "published" | "draft" | "archived";
  language: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  views: number;
  is_featured: boolean;
}

interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  alt_text?: string;
  caption?: string;
  uploaded_by: string;
  uploaded_at: string;
}

const ContentManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"content" | "media">("content");
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    language: "all",
  });
  const [newContent, setNewContent] = useState<Partial<ContentItem>>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    type: "page",
    status: "draft",
    language: "es",
    tags: [],
    is_featured: false,
  });

  // Error handling wrapper for async operations
  const safeAsyncOperation = async (operation: () => Promise<void>, errorMessage: string) => {
    try {
      await operation();
    } catch (error) {
      console.error(errorMessage, error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Mock data - in real implementation, this would come from the API
  useEffect(() => {
    const mockContents: ContentItem[] = [
      {
        id: "1",
        title: "Guía para Principiantes",
        slug: "guia-principiantes",
        content: "Esta es una guía completa para principiantes en el coleccionismo de cartas Pokémon...",
        excerpt: "Aprende los conceptos básicos del coleccionismo de cartas Pokémon",
        type: "guide",
        status: "published",
        language: "es",
        featured_image: "/images/guide-beginners.jpg",
        meta_title: "Guía para Principiantes - PokeCollector",
        meta_description: "Aprende todo sobre el coleccionismo de cartas Pokémon con nuestra guía completa",
        tags: ["principiantes", "guía", "coleccionismo"],
        author_id: "admin_1",
        author_name: "Admin",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T00:00:00Z",
        published_at: "2024-01-01T00:00:00Z",
        views: 1250,
        is_featured: true,
      },
      {
        id: "2",
        title: "Nuevas Cartas de la Serie Escarlata y Púrpura",
        slug: "nuevas-cartas-escarlata-purpura",
        content: "La nueva serie Escarlata y Púrpura trae cartas increíbles...",
        excerpt: "Descubre las nuevas cartas de la serie más reciente",
        type: "news",
        status: "published",
        language: "es",
        featured_image: "/images/scarlet-violet.jpg",
        meta_title: "Nuevas Cartas Escarlata y Púrpura",
        meta_description: "Conoce las nuevas cartas de la serie Escarlata y Púrpura",
        tags: ["noticias", "escarlata", "púrpura", "nuevas cartas"],
        author_id: "admin_1",
        author_name: "Admin",
        created_at: "2024-01-10T00:00:00Z",
        updated_at: "2024-01-10T00:00:00Z",
        published_at: "2024-01-10T00:00:00Z",
        views: 890,
        is_featured: false,
      },
      {
        id: "3",
        title: "Preguntas Frecuentes",
        slug: "preguntas-frecuentes",
        content: "Aquí encontrarás respuestas a las preguntas más comunes...",
        excerpt: "Respuestas a las preguntas más frecuentes sobre PokeCollector",
        type: "faq",
        status: "published",
        language: "es",
        tags: ["faq", "ayuda", "preguntas"],
        author_id: "admin_1",
        author_name: "Admin",
        created_at: "2024-01-05T00:00:00Z",
        updated_at: "2024-01-20T00:00:00Z",
        published_at: "2024-01-05T00:00:00Z",
        views: 2100,
        is_featured: false,
      },
    ];

    const mockMedia: MediaItem[] = [
      {
        id: "1",
        filename: "guide-beginners.jpg",
        original_name: "guia-principiantes.jpg",
        mime_type: "image/jpeg",
        size: 245760,
        url: "/images/guide-beginners.jpg",
        alt_text: "Guía para principiantes",
        caption: "Imagen destacada de la guía para principiantes",
        uploaded_by: "Admin",
        uploaded_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        filename: "scarlet-violet.jpg",
        original_name: "escarlata-purpura.jpg",
        mime_type: "image/jpeg",
        size: 189440,
        url: "/images/scarlet-violet.jpg",
        alt_text: "Cartas Escarlata y Púrpura",
        caption: "Nuevas cartas de la serie Escarlata y Púrpura",
        uploaded_by: "Admin",
        uploaded_at: "2024-01-10T00:00:00Z",
      },
    ];

    setContents(mockContents);
    setMedia(mockMedia);
    setLoading(false);
  }, []);

  const handleCreateContent = async () => {
    try {
      const contentToCreate: ContentItem = {
        ...newContent,
        id: Date.now().toString(),
        author_id: "admin_1",
        author_name: "Admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
      } as ContentItem;

      if (newContent.status === "published") {
        contentToCreate.published_at = new Date().toISOString();
      }

      setContents([contentToCreate, ...contents]);
      setIsCreateDialogOpen(false);
      setNewContent({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        type: "page",
        status: "draft",
        language: "es",
        tags: [],
        is_featured: false,
      });

      toast({
        title: "Éxito",
        description: "Contenido creado correctamente",
      });
    } catch (error) {
      console.error("Error creating content:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el contenido",
        variant: "destructive",
      });
    }
  };

  const handleEditContent = (content: ContentItem) => {
    setEditingContent({ ...content });
    setIsEditDialogOpen(true);
  };

  const handleSaveContent = async () => {
    if (!editingContent) return;

    try {
      const updatedContent = {
        ...editingContent,
        updated_at: new Date().toISOString(),
      };

      if (editingContent.status === "published" && !editingContent.published_at) {
        updatedContent.published_at = new Date().toISOString();
      }

      setContents(contents.map(c => c.id === editingContent.id ? updatedContent : c));
      setIsEditDialogOpen(false);
      setEditingContent(null);

      toast({
        title: "Éxito",
        description: "Contenido actualizado correctamente",
      });
    } catch (error) {
      console.error("Error updating content:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el contenido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      setContents(contents.filter(c => c.id !== contentId));
      toast({
        title: "Éxito",
        description: "Contenido eliminado correctamente",
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el contenido",
        variant: "destructive",
      });
    }
  };

  const generateSlug = (title: string) => {
    if (!title || typeof title !== 'string') return '';
    return title
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const addTag = (tags: string[], setTags: (tags: string[]) => void, newTag: string) => {
    if (!newTag || typeof newTag !== 'string' || !Array.isArray(tags)) return;
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
  };

  const removeTag = (tags: string[], setTags: (tags: string[]) => void, tagToRemove: string) => {
    if (!Array.isArray(tags) || !tagToRemove) return;
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: "Publicado", variant: "default" as const },
      draft: { label: "Borrador", variant: "secondary" as const },
      archived: { label: "Archivado", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      page: { label: "Página", icon: FileText },
      post: { label: "Artículo", icon: FileText },
      news: { label: "Noticia", icon: FileText },
      guide: { label: "Guía", icon: FileText },
      faq: { label: "FAQ", icon: FileText },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.page;
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredContents = contents.filter(content => {
    if (!content) return false;
    
    const safeTitle = content.title || '';
    const safeContent = content.content || '';
    const safeTags = Array.isArray(content.tags) ? content.tags : [];
    const safeSearchTerm = searchTerm || '';
    
    const matchesSearch = safeTitle.toLowerCase().includes(safeSearchTerm.toLowerCase()) ||
                         safeContent.toLowerCase().includes(safeSearchTerm.toLowerCase()) ||
                         safeTags.some(tag => tag && tag.toLowerCase().includes(safeSearchTerm.toLowerCase()));
    
    const matchesType = filters.type === "all" || content.type === filters.type;
    const matchesStatus = filters.status === "all" || content.status === filters.status;
    const matchesLanguage = filters.language === "all" || content.language === filters.language;

    return matchesSearch && matchesType && matchesStatus && matchesLanguage;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <h3 className="text-lg font-semibold">Gestión de Contenidos</h3>
          <p className="text-sm text-gray-600">
            Administra páginas, artículos, noticias y archivos multimedia
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Contenido
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Multimedia
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Filters and Create Button */}
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar contenido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="page">Páginas</SelectItem>
                  <SelectItem value="post">Artículos</SelectItem>
                  <SelectItem value="news">Noticias</SelectItem>
                  <SelectItem value="guide">Guías</SelectItem>
                  <SelectItem value="faq">FAQ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="published">Publicados</SelectItem>
                  <SelectItem value="draft">Borradores</SelectItem>
                  <SelectItem value="archived">Archivados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.language} onValueChange={(value) => setFilters({...filters, language: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los idiomas</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">Inglés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Contenido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Contenido</DialogTitle>
                  <DialogDescription>
                    Crea una nueva página, artículo o noticia
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newContent.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setNewContent({
                          ...newContent, 
                          title,
                          slug: generateSlug(title)
                        });
                      }}
                      placeholder="Título del contenido"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={newContent.slug}
                      onChange={(e) => setNewContent({...newContent, slug: e.target.value})}
                      placeholder="url-del-contenido"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={newContent.type} onValueChange={(value: any) => setNewContent({...newContent, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page">Página</SelectItem>
                        <SelectItem value="post">Artículo</SelectItem>
                        <SelectItem value="news">Noticia</SelectItem>
                        <SelectItem value="guide">Guía</SelectItem>
                        <SelectItem value="faq">FAQ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={newContent.status} onValueChange={(value: any) => setNewContent({...newContent, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="archived">Archivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="excerpt">Extracto</Label>
                    <Textarea
                      id="excerpt"
                      value={newContent.excerpt}
                      onChange={(e) => setNewContent({...newContent, excerpt: e.target.value})}
                      rows={2}
                      placeholder="Breve descripción del contenido"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="content">Contenido</Label>
                    <Textarea
                      id="content"
                      value={newContent.content}
                      onChange={(e) => setNewContent({...newContent, content: e.target.value})}
                      rows={8}
                      placeholder="Contenido completo..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Meta Título (SEO)</Label>
                    <Input
                      id="meta_title"
                      value={newContent.meta_title || ''}
                      onChange={(e) => setNewContent({...newContent, meta_title: e.target.value})}
                      placeholder="Título para SEO"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Descripción (SEO)</Label>
                    <Input
                      id="meta_description"
                      value={newContent.meta_description || ''}
                      onChange={(e) => setNewContent({...newContent, meta_description: e.target.value})}
                      placeholder="Descripción para SEO"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label>Etiquetas</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newContent.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeTag(newContent.tags || [], (tags) => setNewContent({...newContent, tags}), tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nueva etiqueta"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            addTag(newContent.tags || [], (tags) => setNewContent({...newContent, tags}), input.value);
                            input.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex items-center space-x-2">
                    <Switch
                      checked={newContent.is_featured}
                      onCheckedChange={(checked) => setNewContent({...newContent, is_featured: checked})}
                    />
                    <Label>Contenido destacado</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateContent}>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Contenido
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Content Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Vistas</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContents.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {content.title}
                            {content.is_featured && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                <Star className="h-3 w-3 mr-1" />
                                Destacado
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">/{content.slug}</div>
                          {content.excerpt && (
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {content.excerpt}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(content.type)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(content.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{content.author_name}</div>
                          <div className="text-gray-500">{content.language.toUpperCase()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Eye className="h-4 w-4 mr-1" />
                          {content.views}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(content.updated_at).toLocaleDateString()}</div>
                          {content.published_at && (
                            <div className="text-gray-500">
                              Pub: {new Date(content.published_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditContent(content)}>
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
                                <AlertDialogTitle>¿Eliminar contenido?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente "{content.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteContent(content.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {media.length} archivos multimedia
            </div>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Subir Archivo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {media.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {item.mime_type.startsWith('image/') ? (
                    <img 
                      src={item.url} 
                      alt={item.alt_text || item.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <FileText className="h-8 w-8 mb-2" />
                      <span className="text-xs">{item.mime_type}</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="font-medium text-sm truncate" title={item.original_name}>
                      {item.original_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(item.size)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.uploaded_at).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Content Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Contenido</DialogTitle>
            <DialogDescription>
              Modifica el contenido existente
            </DialogDescription>
          </DialogHeader>
          
          {editingContent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_title">Título</Label>
                <Input
                  id="edit_title"
                  value={editingContent.title}
                  onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_slug">Slug (URL)</Label>
                <Input
                  id="edit_slug"
                  value={editingContent.slug}
                  onChange={(e) => setEditingContent({...editingContent, slug: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_status">Estado</Label>
                <Select value={editingContent.status} onValueChange={(value: any) => setEditingContent({...editingContent, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_type">Tipo</Label>
                <Select value={editingContent.type} onValueChange={(value: any) => setEditingContent({...editingContent, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page">Página</SelectItem>
                    <SelectItem value="post">Artículo</SelectItem>
                    <SelectItem value="news">Noticia</SelectItem>
                    <SelectItem value="guide">Guía</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="edit_excerpt">Extracto</Label>
                <Textarea
                  id="edit_excerpt"
                  value={editingContent.excerpt}
                  onChange={(e) => setEditingContent({...editingContent, excerpt: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="edit_content">Contenido</Label>
                <Textarea
                  id="edit_content"
                  value={editingContent.content}
                  onChange={(e) => setEditingContent({...editingContent, content: e.target.value})}
                  rows={8}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveContent}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManagement;