import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Usuario, Departamento, SubDepartamento, UserFormValues } from '@/types/user';
import { UseFormReturn } from 'react-hook-form';

interface UserEditModalProps {
  editingUser: Usuario | null;
  form: UseFormReturn<UserFormValues>;
  departamentos: Departamento[];
  subDepartamentos: SubDepartamento[];
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  editingUser,
  form,
  departamentos,
  subDepartamentos,
  onClose,
  onSubmit
}) => {
  if (!editingUser) return null;

  return (
    <Dialog open={!!editingUser} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Altere os dados do usuário {editingUser?.nome}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="space-y-4">
              <FormLabel>Departamentos</FormLabel>
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-4">
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
                                const newValue = checked
                                  ? [...currentValue, dep.id]
                                  : currentValue.filter((id) => id !== dep.id);
                                field.onChange(newValue);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {dep.nome}
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    {form.watch('departments')?.includes(dep.id) && (
                      <div className="ml-6 space-y-2">
                        {subDepartamentos
                          .filter(sub => sub.departamento_id === dep.id)
                          .map((sub) => (
                            <FormField
                              key={sub.id}
                              control={form.control}
                              name={`subdepartments.${dep.id}` as keyof UserFormValues}
                              render={({ field }) => {
                                const currentValue = (field.value || []) as number[];
                                return (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={currentValue.includes(sub.id)}
                                        onCheckedChange={(checked) => {
                                          const newValue = checked
                                            ? [...currentValue, sub.id]
                                            : currentValue.filter((id) => id !== sub.id);
                                          form.setValue(`subdepartments.${dep.id}` as keyof UserFormValues, newValue);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {sub.nome}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 