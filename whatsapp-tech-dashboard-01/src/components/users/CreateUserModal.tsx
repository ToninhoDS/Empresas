import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Departamento, SubDepartamento, UserFormValues, Empresa } from '@/types/user';
import { UseFormReturn } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';

interface CreateUserModalProps {
  showDialog: boolean;
  form: UseFormReturn<UserFormValues>;
  departamentos: Departamento[];
  subDepartamentos: SubDepartamento[];
  empresa: Empresa | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  showDialog,
  form,
  departamentos,
  subDepartamentos,
  empresa,
  onClose,
  onSubmit
}) => {
  return (
    <Dialog 
      open={showDialog} 
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Novo Usuário
            {empresa && (
              <span className="text-sm font-normal text-gray-500">
                • {empresa.nome}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Adicione um novo usuário ao sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="timeCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cartão de Ponto</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={6} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Função</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin-master">Admin Master</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="admim-supervisor">Admin Supervisor</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="supervisor-agent">Supervisor Agent</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Deixe em branco para senha padrão" />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Se não informada, será "123456"
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue="ativo"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status do usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel className="mb-2 block">Departamentos</FormLabel>
                    <div className="max-h-[250px] overflow-y-auto border rounded-md p-4">
                      <div className="mb-4">
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={departamentos.length > 0 && form.watch('departments')?.length === departamentos.length}
                              onCheckedChange={(checked) => {
                                const allDepartmentIds = departamentos.map(dep => dep.id);
                                if (checked) {
                                  form.setValue('departments', allDepartmentIds);
                                } else {
                                  // Verificar se há subdepartamentos selecionados
                                  const hasSelectedSubs = Object.values(form.watch('subdepartments') || {}).some(
                                    subs => subs && subs.length > 0
                                  );
                                  
                                  if (hasSelectedSubs) {
                                    toast({
                                      title: "Ação não permitida",
                                      description: "Desmarque primeiro os subdepartamentos selecionados antes de remover os departamentos.",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  form.setValue('departments', []);
                                  form.setValue('subdepartments', {});
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-medium">
                            Marcar Todos
                          </FormLabel>
                        </FormItem>
                      </div>

                      {departamentos.map((dep) => (
                        <div key={dep.id} className="space-y-2 mb-4">
                          <FormField
                            control={form.control}
                            name="departments"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(dep.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      // Verificar se há subdepartamentos selecionados antes de desmarcar
                                      if (!checked && form.watch(`subdepartments.${dep.id}`)?.length > 0) {
                                        toast({
                                          title: "Ação não permitida",
                                          description: "Desmarque primeiro os subdepartamentos antes de remover o departamento.",
                                          variant: "destructive",
                                        });
                                        return;
                                      }
                                      
                                      const newValue = checked
                                        ? [...currentValue, dep.id]
                                        : currentValue.filter((id) => id !== dep.id);
                                      field.onChange(newValue);
                                      
                                      // Limpar subdepartamentos quando desmarcar o departamento
                                      if (!checked) {
                                        const currentSubdeps = form.watch('subdepartments');
                                        delete currentSubdeps[dep.id];
                                        form.setValue('subdepartments', currentSubdeps);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {dep.nome}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                    <FormMessage>
                      {form.formState.errors.departments?.message}
                    </FormMessage>
                  </div>

                  <div>
                    <FormLabel className="mb-2 block">Sub Departamentos</FormLabel>
                    <div className="max-h-[250px] overflow-y-auto border rounded-md p-4">
                      {/* Checkbox global para todos os subdepartamentos */}
                      <div className="mb-4">
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={
                                form.watch('departments')?.length > 0 &&
                                form.watch('departments')?.every(depId => {
                                  const subDeps = subDepartamentos.filter(sub => sub.departamento_id === depId);
                                  if (subDeps.length === 0) return true;
                                  const selectedSubs = form.watch(`subdepartments.${depId}`) || [];
                                  return selectedSubs.length === subDeps.length;
                                })
                              }
                              onCheckedChange={(checked) => {
                                const selectedDeps = form.watch('departments') || [];
                                const newSubdeps = { ...form.watch('subdepartments') };
                                
                                selectedDeps.forEach(depId => {
                                  const subDeps = subDepartamentos.filter(sub => sub.departamento_id === depId);
                                  if (subDeps.length > 0) {
                                    newSubdeps[depId] = checked ? subDeps.map(sub => sub.id) : [];
                                  }
                                });
                                
                                form.setValue('subdepartments', newSubdeps);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-medium">
                            Marcar Todos os Sub Departamentos
                          </FormLabel>
                        </FormItem>
                      </div>

                      {form.watch('departments')?.map((depId) => {
                        const subDeps = subDepartamentos.filter(sub => sub.departamento_id === depId);
                        if (subDeps.length === 0) return null;

                        return (
                          <div key={depId} className="space-y-2 mb-4">
                            <div className="font-medium text-sm text-gray-500">
                              {departamentos.find(d => d.id === depId)?.nome}
                            </div>
                            
                            <div className="ml-4 space-y-2">
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={
                                      subDeps.length > 0 && 
                                      form.watch(`subdepartments.${depId}`)?.length === subDeps.length
                                    }
                                    onCheckedChange={(checked) => {
                                      const allSubDepIds = subDeps.map(sub => sub.id);
                                      form.setValue(
                                        `subdepartments.${depId}`, 
                                        checked ? allSubDepIds : []
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  Marcar Todos
                                </FormLabel>
                              </FormItem>

                              {subDeps.map((sub) => (
                                <FormField
                                  key={sub.id}
                                  control={form.control}
                                  name={`subdepartments.${depId}`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={(field.value || []).includes(sub.id)}
                                          onCheckedChange={(checked) => {
                                            const currentValue = field.value || [];
                                            const newValue = checked
                                              ? [...currentValue, sub.id]
                                              : currentValue.filter((id) => id !== sub.id);
                                            form.setValue(`subdepartments.${depId}`, newValue);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {sub.nome}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Criar Usuário</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 