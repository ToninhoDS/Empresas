import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Usuario } from '@/types/user';

interface DeleteUserModalProps {
  usuarioParaExcluir: Usuario | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  usuarioParaExcluir,
  onClose,
  onConfirm
}) => {
  if (!usuarioParaExcluir) return null;

  return (
    <Dialog open={!!usuarioParaExcluir} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription asChild>
            <div>
              <span>Tem certeza que deseja excluir este usuário?</span>
              <div className="mt-2 p-4 bg-gray-100 rounded-md">
                <div className="font-medium">{usuarioParaExcluir.nome}</div>
                <div className="text-sm text-gray-500">{usuarioParaExcluir.email}</div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(usuarioParaExcluir.id)}
          >
            Confirmar exclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 