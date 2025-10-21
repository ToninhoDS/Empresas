import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Ban, Pen, KeyRound, Trash2, ShieldAlert, Power, PowerOff } from 'lucide-react';
import { Usuario, Departamento, SubDepartamento } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface UsersTableProps {
  usuarios: Usuario[];
  departamentos: Departamento[];
  subDepartamentos: SubDepartamento[];
  onViewUser: (user: Usuario) => void;
  onEditUser: (user: Usuario) => void;
  onDeleteUser: (user: Usuario) => void;
  onResetPassword: (user: Usuario) => void;
  onToggleActive: (id: number, ativo: boolean) => Promise<void>;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  usuarios,
  departamentos,
  subDepartamentos,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onResetPassword,
  onToggleActive
}) => {
  const { user } = useAuth();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cartão de Ponto</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Departamentos</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((usuario) => (
          <TableRow 
            key={usuario.id}
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => onViewUser(usuario)}
          >
            <TableCell>{usuario.cartao_ponto}</TableCell>
            <TableCell className="flex items-center gap-2">
              {!usuario.ativo && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Ban className="h-4 w-4 text-red-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Usuário Inativo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {usuario.nome}
              {usuario.cargo === 'admin-master' && (
                <ShieldAlert className="h-4 w-4 text-purple-500" />
              )}
            </TableCell>
            <TableCell>{usuario.email}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                usuario.cargo === 'admin-master' ? 'bg-purple-100 text-purple-800' :
                usuario.cargo === 'admin' ? 'bg-blue-100 text-blue-800' :
                usuario.cargo === 'supervisor' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {usuario.cargo}
              </span>
            </TableCell>
            <TableCell>
              {usuario.cargo === 'admin-master' || usuario.cargo === 'admin'
                ? 'TI'
                : departamentos.find(d => d.id === usuario.departamento_id)?.nome || 'Sem departamento'}
              {usuario.sub_departamento_id && 
                ` / ${subDepartamentos.find(sd => sd.id === usuario.sub_departamento_id)?.nome || ''}`}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={usuario.ativo ? "text-green-600" : "text-red-600"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleActive(usuario.id, usuario.ativo);
                        }}
                      >
                        {usuario.ativo ? (
                          <Power className="h-4 w-4" />
                        ) : (
                          <PowerOff className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{usuario.ativo ? 'Desativar Usuário' : 'Ativar Usuário'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditUser(usuario);
                        }}
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar Usuário</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!['admin-master', 'admin'].includes(user?.cargo || '')) {
                            toast({
                              title: "Permissão negada",
                              description: "Apenas admin-master e admin podem resetar senhas",
                              variant: "destructive",
                            });
                            return;
                          }
                          onResetPassword(usuario);
                        }}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Resetar Senha</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteUser(usuario);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir Usuário</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}; 