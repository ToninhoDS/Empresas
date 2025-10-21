import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Pencil,
  Trash2, 
  Search, 
  FolderKanban,
  Users,
  ChevronDown,
  Building2,
  FolderTree,
  Image
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import {
  Label
} from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Department {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string;
  logotipo: string;
  status: 'ativo' | 'inativo';
  usersCount: number;
  subdepartments?: Subdepartment[];
}

interface Subdepartment {
  id: string;
  departamento_id: string;
  nome: string;
  descricao: string;
  status: 'ativo' | 'inativo';
  usersCount: number;
}

const Departments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subdepartments, setSubdepartments] = useState<Subdepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddSubdepartmentDialog, setShowAddSubdepartmentDialog] = useState(false);
  const [showEditSubdepartmentDialog, setShowEditSubdepartmentDialog] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [currentSubdepartment, setCurrentSubdepartment] = useState<Subdepartment | null>(null);
  const [showDeleteDepartmentDialog, setShowDeleteDepartmentDialog] = useState(false);
  const [showDeleteSubdepartmentDialog, setShowDeleteSubdepartmentDialog] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [subdepartmentToDelete, setSubdepartmentToDelete] = useState<Subdepartment | null>(null);
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [departmentLogo, setDepartmentLogo] = useState('');
  const [showSubdepartmentDialog, setShowSubdepartmentDialog] = useState(false);
  const [subdepartmentName, setSubdepartmentName] = useState('');
  const [subdepartmentDescription, setSubdepartmentDescription] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');

  useEffect(() => {
    if (user?.empresa_id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar departamentos
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departamentos')
        .select('*')
        .eq('empresa_id', user?.empresa_id)
        .eq('status', 'ativo');

      if (departmentsError) throw departmentsError;

      // Carregar subdepartamentos
      const { data: subdepartmentsData, error: subdepartmentsError } = await supabase
        .from('sub_departamentos')
        .select('*')
        .eq('status', 'ativo');

      if (subdepartmentsError) throw subdepartmentsError;

      // Carregar contagem de usuários
      const { data: usersData, error: usersError } = await supabase
        .from('perfis_usuario')
        .select('departamento_id, sub_departamento_id')
        .eq('empresa_id', user?.empresa_id)
        .eq('ativo', true);

      if (usersError) throw usersError;

      // Processar contagens de usuários
      const departmentCounts = new Map();
      const subdepartmentCounts = new Map();

      usersData?.forEach(user => {
        if (user.departamento_id) {
          departmentCounts.set(
            user.departamento_id, 
            (departmentCounts.get(user.departamento_id) || 0) + 1
          );
        }
        if (user.sub_departamento_id) {
          subdepartmentCounts.set(
            user.sub_departamento_id, 
            (subdepartmentCounts.get(user.sub_departamento_id) || 0) + 1
          );
        }
      });

      // Organizar subdepartamentos por departamento
      const processedDepartments = departmentsData?.map(dept => ({
        ...dept,
        usersCount: departmentCounts.get(dept.id) || 0,
        subdepartments: subdepartmentsData
          ?.filter(sub => sub.departamento_id === dept.id)
          .map(sub => ({
            ...sub,
            usersCount: subdepartmentCounts.get(sub.id) || 0
          }))
      })) || [];

      setDepartments(processedDepartments);
      setSubdepartments(subdepartmentsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle department operations
  const handleAddDepartment = () => {
    setCurrentDepartment(null);
    setDepartmentName('');
    setDepartmentDescription('');
    setDepartmentLogo('');
    setShowDepartmentDialog(true);
  };

  const handleEditDepartment = (department: Department) => {
    setCurrentDepartment(department);
    setDepartmentName(department.nome);
    setDepartmentDescription(department.descricao);
    setDepartmentLogo(department.logotipo || '');
    setShowDepartmentDialog(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setDepartmentToDelete(department);
    setShowDeleteDepartmentDialog(true);
  };

  const confirmDeleteDepartment = async () => {
    if (!departmentToDelete) return;

    try {
      setDepartments(departments.filter(dept => dept.id !== departmentToDelete.id));
      
      toast({
        title: "Sucesso",
        description: "Departamento excluído com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir departamento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o departamento",
        variant: "destructive"
      });
    }

    setShowDeleteDepartmentDialog(false);
    setDepartmentToDelete(null);
  };

  const saveDepartment = async () => {
    if (!departmentName.trim()) {
      toast({
        title: "Erro",
        description: "O nome do departamento é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      if (currentDepartment) {
        // Atualizar departamento existente
        const updatedDepartment = {
          ...currentDepartment,
          nome: departmentName,
          descricao: departmentDescription,
          logotipo: departmentLogo
        };

        setDepartments(departments.map(dept => 
          dept.id === currentDepartment.id ? updatedDepartment : dept
        ));

        toast({
          title: "Sucesso",
          description: "Departamento atualizado com sucesso"
        });
      } else {
        // Criar novo departamento
        const newDepartment: Department = {
          id: String(Date.now()),
          nome: departmentName,
          descricao: departmentDescription,
          logotipo: departmentLogo,
          subdepartments: []
        };

        setDepartments([...departments, newDepartment]);

        toast({
          title: "Sucesso",
          description: "Departamento criado com sucesso"
        });
      }

      setShowDepartmentDialog(false);
      setCurrentDepartment(null);
      setDepartmentName('');
      setDepartmentDescription('');
      setDepartmentLogo('');
    } catch (error) {
      console.error('Erro ao salvar departamento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o departamento",
        variant: "destructive"
      });
    }
  };

  // Handle subdepartment operations
  const handleAddSubdepartment = (departmentId: string) => {
    setCurrentSubdepartment(null);
    setSelectedDepartmentId(departmentId);
    setSubdepartmentName('');
    setSubdepartmentDescription('');
    setShowSubdepartmentDialog(true);
  };

  const handleEditSubdepartment = (subdepartment: Subdepartment, departmentId: string) => {
    setCurrentSubdepartment(subdepartment);
    setSelectedDepartmentId(departmentId);
    setSubdepartmentName(subdepartment.nome);
    setSubdepartmentDescription(subdepartment.descricao);
    setShowSubdepartmentDialog(true);
  };

  const handleDeleteSubdepartment = (subdepartment: Subdepartment) => {
    setSubdepartmentToDelete(subdepartment);
    setShowDeleteSubdepartmentDialog(true);
  };

  const confirmDeleteSubdepartment = async () => {
    if (!subdepartmentToDelete) return;

    try {
      setDepartments(departments.map(dept => ({
        ...dept,
        subdepartments: dept.subdepartments.filter(
          subdept => subdept.id !== subdepartmentToDelete.id
        )
      })));

      toast({
        title: "Sucesso",
        description: "Subdepartamento excluído com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir subdepartamento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o subdepartamento",
        variant: "destructive"
      });
    }

    setShowDeleteSubdepartmentDialog(false);
    setSubdepartmentToDelete(null);
  };

  const saveSubdepartment = async () => {
    if (!subdepartmentName.trim() || !selectedDepartmentId) {
      toast({
        title: "Erro",
        description: "O nome do subdepartamento e departamento são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const newSubdepartment: Subdepartment = {
        id: currentSubdepartment?.id || String(Date.now()),
        nome: subdepartmentName,
        descricao: subdepartmentDescription,
        departamento_id: selectedDepartmentId
      };

      setDepartments(departments.map(dept => {
        if (dept.id === selectedDepartmentId) {
          const updatedSubdepartments = currentSubdepartment
            ? dept.subdepartments.map(subdept => 
                subdept.id === currentSubdepartment.id ? newSubdepartment : subdept
              )
            : [...dept.subdepartments, newSubdepartment];

          return {
            ...dept,
            subdepartments: updatedSubdepartments
          };
        }
        return dept;
      }));

      toast({
        title: "Sucesso",
        description: currentSubdepartment 
          ? "Subdepartamento atualizado com sucesso"
          : "Subdepartamento criado com sucesso"
      });

      setShowSubdepartmentDialog(false);
      setCurrentSubdepartment(null);
      setSelectedDepartmentId('');
      setSubdepartmentName('');
      setSubdepartmentDescription('');
    } catch (error) {
      console.error('Erro ao salvar subdepartamento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o subdepartamento",
        variant: "destructive"
      });
    }
  };

  // Filter departments and subdepartments based on search terms
  const filteredDepartments = searchQuery
    ? departments.filter(dept => {
        const deptMatch = dept.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dept.descricao?.toLowerCase().includes(searchQuery.toLowerCase());
        const subMatch = dept.subdepartments?.some(sub =>
          sub.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return deptMatch || subMatch;
      })
    : departments;

  // Store departments in localStorage for use in Users.tsx
  useEffect(() => {
    localStorage.setItem('departments', JSON.stringify(departments));
  }, [departments]);

  // Atualizar os estilos do Accordion
  const accordionTriggerStyles = {
    base: "flex w-full py-4 px-6 text-left hover:no-underline group/trigger [&[data-state=open]>div>svg]:rotate-180",
    header: "flex items-center w-full gap-4 relative pr-8",
    icon: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-whatsapp-light/10",
    content: "flex flex-col min-w-0 flex-1",
    title: "font-semibold text-base truncate",
    description: "text-sm text-muted-foreground truncate",
    logo: "flex items-center gap-2 text-sm text-muted-foreground",
    stats: "flex items-center gap-2 shrink-0",
    actions: "flex items-center gap-2 shrink-0",
    chevron: "absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform duration-200"
  };

  const accordionContentStyles = {
    base: "px-6 pb-4 pt-2",
    subdepartment: "group grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-all duration-200",
    icon: "flex h-8 w-8 items-center justify-center rounded-lg bg-whatsapp-light/10",
    content: "flex flex-col min-w-0",
    title: "font-medium truncate",
    description: "text-sm text-muted-foreground truncate",
    stats: "flex items-center gap-2 text-sm text-muted-foreground",
    actions: "flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
  };

  const departmentCardStyles = {
    base: "rounded-xl shadow-md overflow-hidden border border-border/50 mb-2 group",
    header: "flex items-center gap-4 flex-1",
    info: "flex items-center gap-6 flex-1",
    stats: "flex items-center gap-2 text-sm text-muted-foreground ml-auto"
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Departamentos</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Departamentos</CardTitle>
            <CardDescription>
              Gerencie os departamentos, subdepartamentos e usuários dos serviços
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handleAddDepartment} 
                    className="bg-whatsapp-light hover:bg-whatsapp-light/90 w-full sm:w-auto"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Novo Departamento
                  </Button>
                  <Button 
                    onClick={() => setShowAddSubdepartmentDialog(true)} 
                    variant="outline" 
                    className="border-whatsapp-light/50 hover:bg-whatsapp-light/10 w-full sm:w-auto"
                  >
                    <FolderTree className="mr-2 h-4 w-4" />
                    Novo Subdepartamento
                  </Button>
                </div>
                
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar departamentos e subdepartamentos..."
                    className="pl-10 w-full bg-background border-border/50 focus-visible:ring-whatsapp-light"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-light" />
                    <span>Carregando departamentos...</span>
                  </div>
                </div>
              ) : filteredDepartments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    {searchQuery ? (
                      <>
                        <Search className="h-8 w-8 text-muted-foreground" />
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">Nenhum resultado encontrado</p>
                          <p className="text-sm text-muted-foreground">
                            Nenhum departamento ou subdepartamento encontrado para "{searchQuery}"
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">Nenhum departamento cadastrado</p>
                          <p className="text-sm text-muted-foreground">
                            Comece criando seu primeiro departamento
                          </p>
                        </div>
                        <Button 
                          onClick={handleAddDepartment}
                          className="bg-whatsapp-light hover:bg-whatsapp-light/90"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Novo Departamento
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <Accordion type="multiple" className="w-full space-y-2">
                  {filteredDepartments.map((department) => (
                    <AccordionItem 
                      key={department.id} 
                      value={department.id}
                      className="rounded-xl border border-border/50 shadow-sm overflow-hidden group"
                    >
                      <AccordionTrigger className={accordionTriggerStyles.base}>
                        <div className={accordionTriggerStyles.header}>
                          <div className={accordionTriggerStyles.icon}>
                            <Building2 className="h-5 w-5 text-whatsapp-light" />
                          </div>
                          
                          <div className={accordionTriggerStyles.content}>
                            <span className={accordionTriggerStyles.title}>{department.nome}</span>
                            <div className="flex items-center gap-4">
                              <span className={accordionTriggerStyles.description}>
                                {department.descricao || "Sem descrição"}
                              </span>
                              {department.logotipo ? (
                                <span className={accordionTriggerStyles.logo}>
                                  <Image className="h-4 w-4" />
                                  {department.logotipo}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground/50">Sem logotipo</span>
                              )}
                            </div>
                          </div>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={accordionTriggerStyles.stats}>
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {department.usersCount} usuários
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{department.usersCount} usuários neste departamento</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <div className={accordionTriggerStyles.actions}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDepartment(department);
                              }}
                              className="hover:bg-whatsapp-light/10"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDepartment(department);
                              }}
                              className="hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>

                          <ChevronDown className={accordionTriggerStyles.chevron} />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className={accordionContentStyles.base}>
                        <AnimatePresence>
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2"
                          >
                            {department.subdepartments && department.subdepartments.length > 0 ? (
                              department.subdepartments.map((subdepartment) => (
                                <motion.div 
                                  key={subdepartment.id}
                                  className="group flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-all duration-200"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-whatsapp-light/10">
                                    <FolderTree className="h-4 w-4 text-whatsapp-light" />
                                  </div>
                                  
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span className="font-medium truncate">{subdepartment.nome}</span>
                                    <span className="text-sm text-muted-foreground truncate">
                                      {subdepartment.descricao || "Sem descrição"}
                                    </span>
                                  </div>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <Users className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm text-muted-foreground">
                                            {subdepartment.usersCount} usuários
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{subdepartment.usersCount} usuários neste subdepartamento</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <div className="flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 shrink-0">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditSubdepartment(subdepartment, department.id);
                                      }}
                                      className="hover:bg-whatsapp-light/10"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSubdepartment(subdepartment);
                                      }}
                                      className="hover:bg-red-500/10"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </motion.div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                Nenhum subdepartamento cadastrado
                              </div>
                            )}
                            <Button
                              onClick={() => handleAddSubdepartment(department.id)}
                              variant="ghost"
                              className="w-full mt-2 border border-dashed border-border hover:border-whatsapp-light hover:bg-whatsapp-light/10"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Adicionar Subdepartamento
                            </Button>
                          </motion.div>
                        </AnimatePresence>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Departamento */}
      <Dialog open={showDepartmentDialog} onOpenChange={setShowDepartmentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentDepartment ? "Editar Departamento" : "Novo Departamento"}
            </DialogTitle>
            <DialogDescription>
              {currentDepartment 
                ? "Atualize as informações do departamento abaixo."
                : "Preencha as informações do novo departamento abaixo."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Nome</Label>
              <Input
                id="dept-name"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="Digite o nome do departamento"
                className="border-whatsapp-light/30 focus-visible:ring-whatsapp-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-desc">Descrição</Label>
              <Input
                id="dept-desc"
                value={departmentDescription}
                onChange={(e) => setDepartmentDescription(e.target.value)}
                placeholder="Digite uma descrição para o departamento"
                className="border-whatsapp-light/30 focus-visible:ring-whatsapp-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-logo">Logotipo</Label>
              <Input
                id="dept-logo"
                value={departmentLogo}
                onChange={(e) => setDepartmentLogo(e.target.value)}
                placeholder="URL do logotipo (opcional)"
                className="border-whatsapp-light/30 focus-visible:ring-whatsapp-light"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDepartmentDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => saveDepartment()}
              className="bg-whatsapp-light hover:bg-whatsapp-light/90"
            >
              {currentDepartment ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Subdepartamento */}
      <Dialog open={showSubdepartmentDialog} onOpenChange={setShowSubdepartmentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentSubdepartment ? "Editar Subdepartamento" : "Novo Subdepartamento"}
            </DialogTitle>
            <DialogDescription>
              {currentSubdepartment 
                ? "Atualize as informações do subdepartamento abaixo."
                : "Preencha as informações do novo subdepartamento abaixo."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subdept-dept">Departamento</Label>
              <Select 
                value={selectedDepartmentId} 
                onValueChange={setSelectedDepartmentId}
              >
                <SelectTrigger className="border-whatsapp-light/30 focus:ring-whatsapp-light">
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdept-name">Nome</Label>
              <Input
                id="subdept-name"
                value={subdepartmentName}
                onChange={(e) => setSubdepartmentName(e.target.value)}
                placeholder="Digite o nome do subdepartamento"
                className="border-whatsapp-light/30 focus-visible:ring-whatsapp-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdept-desc">Descrição</Label>
              <Input
                id="subdept-desc"
                value={subdepartmentDescription}
                onChange={(e) => setSubdepartmentDescription(e.target.value)}
                placeholder="Digite uma descrição para o subdepartamento"
                className="border-whatsapp-light/30 focus-visible:ring-whatsapp-light"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubdepartmentDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => saveSubdepartment()}
              className="bg-whatsapp-light hover:bg-whatsapp-light/90"
            >
              {currentSubdepartment ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão de Departamento */}
      <AlertDialog open={showDeleteDepartmentDialog} onOpenChange={setShowDeleteDepartmentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Departamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o departamento "{departmentToDelete?.nome}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => departmentToDelete && confirmDeleteDepartment()}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmação de Exclusão de Subdepartamento */}
      <AlertDialog open={showDeleteSubdepartmentDialog} onOpenChange={setShowDeleteSubdepartmentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Subdepartamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o subdepartamento "{subdepartmentToDelete?.nome}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => subdepartmentToDelete && confirmDeleteSubdepartment()}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Departments;
