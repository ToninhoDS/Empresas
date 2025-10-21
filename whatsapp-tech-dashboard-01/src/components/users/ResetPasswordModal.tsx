import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Usuario } from '@/types/user';

interface ResetPasswordModalProps {
  usuarioParaResetarSenha: Usuario | null;
  novaSenha: string;
  onSenhaChange: (senha: string) => void;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  usuarioParaResetarSenha,
  novaSenha,
  onSenhaChange,
  onClose,
  onConfirm
}) => {
  if (!usuarioParaResetarSenha) return null;

  return (
    <Dialog 
      open={!!usuarioParaResetarSenha} 
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resetar Senha</DialogTitle>
          <DialogDescription asChild>
            <div>
              <span>Digite a nova senha para o usuário:</span>
              <div className="mt-2 p-4 bg-gray-100 rounded-md">
                <div className="font-medium">{usuarioParaResetarSenha.nome}</div>
                <div className="text-sm text-gray-500">{usuarioParaResetarSenha.email}</div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nova-senha">Nova Senha</Label>
            <Input
              id="nova-senha"
              type="password"
              value={novaSenha}
              onChange={(e) => onSenhaChange(e.target.value)}
              placeholder="Digite a nova senha"
              autoComplete="new-password"
            />
          </div>
        </div>

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
            variant="default"
            onClick={() => onConfirm(usuarioParaResetarSenha.id)}
            disabled={!novaSenha}
          >
            Confirmar Alteração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 