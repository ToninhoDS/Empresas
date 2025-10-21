
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  MessageSquareText 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PredefinedMessage {
  id: number;
  title: string;
  content: string;
  category: string;
}

const PredefinedMessages = () => {
  const [messages, setMessages] = useState<PredefinedMessage[]>([
    { id: 1, title: "Saudação", content: "Olá! Como posso ajudar?", category: "Geral" },
    { id: 2, title: "Agradecimento", content: "Muito obrigado pelo contato!", category: "Geral" },
    { id: 3, title: "Confirmação", content: "Confirmo o recebimento da sua mensagem.", category: "Confirmação" },
    { id: 4, title: "Informação Adicional", content: "Preciso de mais informações para prosseguir.", category: "Solicitação" },
  ]);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMessage, setCurrentMessage] = useState<PredefinedMessage>({
    id: 0,
    title: '',
    content: '',
    category: ''
  });

  const handleAddMessage = () => {
    setCurrentMessage({
      id: 0,
      title: '',
      content: '',
      category: ''
    });
    setShowAddDialog(true);
  };

  const handleEditMessage = (message: PredefinedMessage) => {
    setCurrentMessage(message);
    setShowEditDialog(true);
  };

  const handleDeleteMessage = (id: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    toast({
      title: "Mensagem excluída",
      description: "A mensagem foi excluída com sucesso.",
    });
  };

  const saveMessage = (isEditing: boolean) => {
    if (!currentMessage.title || !currentMessage.content || !currentMessage.category) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (isEditing) {
      setMessages(prev => prev.map(msg => 
        msg.id === currentMessage.id ? currentMessage : msg
      ));
      setShowEditDialog(false);
      toast({
        title: "Mensagem atualizada",
        description: "A mensagem foi atualizada com sucesso.",
      });
    } else {
      const newId = Math.max(0, ...messages.map(m => m.id)) + 1;
      setMessages(prev => [...prev, { ...currentMessage, id: newId }]);
      setShowAddDialog(false);
      toast({
        title: "Mensagem adicionada",
        description: "A nova mensagem foi adicionada com sucesso.",
      });
    }
  };

  const filteredMessages = searchTerm 
    ? messages.filter(msg => 
        msg.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mensagens Prontas</h1>
          <Button onClick={handleAddMessage}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Mensagem
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Mensagens</CardTitle>
            <CardDescription>
              Crie e organize mensagens pré-definidas para uso rápido em suas conversas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar mensagens..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? (
                        <>Nenhuma mensagem encontrada para "{searchTerm}"</>
                      ) : (
                        <>Nenhuma mensagem cadastrada</>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">{message.title}</TableCell>
                      <TableCell className="truncate max-w-xs">{message.content}</TableCell>
                      <TableCell>{message.category}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditMessage(message)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Adicionar Mensagem */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Mensagem Pronta</DialogTitle>
            <DialogDescription>
              Crie uma nova mensagem para usar em suas conversas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <Input 
                id="title" 
                value={currentMessage.title}
                onChange={(e) => setCurrentMessage({...currentMessage, title: e.target.value})}
                placeholder="Ex: Saudação Inicial"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Categoria
              </label>
              <Input 
                id="category" 
                value={currentMessage.category}
                onChange={(e) => setCurrentMessage({...currentMessage, category: e.target.value})}
                placeholder="Ex: Geral, Vendas, Suporte"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Conteúdo da Mensagem
              </label>
              <Textarea 
                id="content" 
                rows={5}
                value={currentMessage.content}
                onChange={(e) => setCurrentMessage({...currentMessage, content: e.target.value})}
                placeholder="Digite o conteúdo da mensagem aqui..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => saveMessage(false)}>
              <MessageSquareText className="mr-2 h-4 w-4" />
              Salvar Mensagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Mensagem */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Mensagem</DialogTitle>
            <DialogDescription>
              Modifique os detalhes da mensagem selecionada.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                Título
              </label>
              <Input 
                id="edit-title" 
                value={currentMessage.title}
                onChange={(e) => setCurrentMessage({...currentMessage, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-category" className="text-sm font-medium">
                Categoria
              </label>
              <Input 
                id="edit-category" 
                value={currentMessage.category}
                onChange={(e) => setCurrentMessage({...currentMessage, category: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-content" className="text-sm font-medium">
                Conteúdo da Mensagem
              </label>
              <Textarea 
                id="edit-content" 
                rows={5}
                value={currentMessage.content}
                onChange={(e) => setCurrentMessage({...currentMessage, content: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => saveMessage(true)}>
              Atualizar Mensagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PredefinedMessages;
