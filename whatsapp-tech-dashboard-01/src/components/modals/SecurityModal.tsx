import { useRouter } from 'next/router';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';

interface SecurityModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

const SecurityModal = ({ isOpen, userId, onClose }: SecurityModalProps) => {
  const router = useRouter();

  const handleUpdateResetSenha = async () => {
    try {
      const { error } = await supabase
        .from('perfis_usuario')
        .update({ reset_senha: false })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar reset_senha:', error);
    }
  };

  const handleTrocarSenha = async () => {
    await handleUpdateResetSenha();
    router.push('/settings?tab=password');
    onClose();
  };

  const handleNaoTrocar = async () => {
    await handleUpdateResetSenha();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Aviso de Segurança</DialogTitle>
          <DialogDescription>
            Sua senha foi redefinida para uma senha padrão. Por segurança, recomendamos que você crie uma nova senha.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleNaoTrocar}
          >
            Não quero alterar agora
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleTrocarSenha}
          >
            Trocar senha agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityModal; 