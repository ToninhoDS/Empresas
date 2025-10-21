import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, List } from 'lucide-react';
import { Usuario, Departamento, SubDepartamento } from '@/types/user';

interface UserViewModalProps {
  viewingUser: Usuario | null;
  departamentos: Departamento[];
  subDepartamentos: SubDepartamento[];
  onClose: () => void;
  onEdit: (user: Usuario) => void;
}

export const UserViewModal: React.FC<UserViewModalProps> = ({
  viewingUser,
  departamentos,
  subDepartamentos,
  onClose,
  onEdit
}) => {
  if (!viewingUser) return null;

  return (
    <Dialog open={!!viewingUser} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
          <DialogDescription>
            Informações completas sobre {viewingUser?.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Informações Básicas</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Nome:</span>
                  <p className="font-medium">{viewingUser?.nome}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="font-medium">{viewingUser?.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Cartão de Ponto:</span>
                  <p className="font-medium">{viewingUser?.cartao_ponto}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Função:</span>
                  <p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      viewingUser?.cargo === 'admin-master' ? 'bg-purple-100 text-purple-800' :
                      viewingUser?.cargo === 'admin' ? 'bg-blue-100 text-blue-800' :
                      viewingUser?.cargo === 'supervisor' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {viewingUser?.cargo}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      viewingUser?.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {viewingUser?.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Departamentos e Subdepartamentos</h4>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {departamentos.map((dep) => {
                  const isSelected = dep.id === viewingUser?.departamento_id;
                  const associatedSubDeps = subDepartamentos
                    .filter(sub => sub.departamento_id === dep.id)
                    .filter(sub => sub.id === viewingUser?.sub_departamento_id);

                  if (!isSelected && associatedSubDeps.length === 0) return null;

                  return (
                    <div key={dep.id} className="border rounded-md p-3 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{dep.nome}</span>
                      </div>
                      {associatedSubDeps.length > 0 && (
                        <div className="mt-2 ml-6 space-y-1">
                          {associatedSubDeps.map(sub => (
                            <div key={sub.id} className="flex items-center gap-2">
                              <List className="h-4 w-4 text-gray-500" />
                              <span>{sub.nome}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="default" onClick={() => {
            onEdit(viewingUser);
            onClose();
          }}>
            Editar Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 