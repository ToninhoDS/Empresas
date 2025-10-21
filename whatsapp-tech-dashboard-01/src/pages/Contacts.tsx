
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateMockContacts } from '@/utils/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Contacts = () => {
  const allContacts = generateMockContacts(20);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ordenar contatos pelo último contato
  const sortedContacts = [...allContacts].sort((a, b) => {
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });
  
  const formatLastMessageTime = (isoString: string) => {
    try {
      return formatDistanceToNow(new Date(isoString), { 
        addSuffix: true,
        locale: ptBR
      });
    } catch (error) {
      return 'Data desconhecida';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Gerenciar Contatos</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Contatos</CardTitle>
            <CardDescription>Visualize e gerencie todos os contatos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por nome, telefone ou especialidade..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button>Adicionar Contato</Button>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="today">Hoje</TabsTrigger>
                <TabsTrigger value="week">Esta Semana</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-4">
                  {sortedContacts.filter(contact => 
                    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    contact.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    contact.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(contact => (
                    <div key={contact.id} className="flex items-start space-x-4 p-4 border rounded-md hover:bg-gray-50">
                      <div className="h-10 w-10 rounded-full bg-whatsapp-light flex items-center justify-center text-white font-semibold">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{contact.name}</h3>
                          <span className="text-sm text-gray-500">{formatLastMessageTime(contact.lastMessageTime)}</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{contact.lastMessage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="today">
                <div className="space-y-4">
                  {sortedContacts.filter(contact => {
                    const today = new Date();
                    const messageDate = new Date(contact.lastMessageTime);
                    return messageDate.toDateString() === today.toDateString() &&
                      (contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       contact.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       contact.specialty?.toLowerCase().includes(searchTerm.toLowerCase()));
                  }).map(contact => (
                    <div key={contact.id} className="flex items-start space-x-4 p-4 border rounded-md hover:bg-gray-50">
                      <div className="h-10 w-10 rounded-full bg-whatsapp-light flex items-center justify-center text-white font-semibold">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{contact.name}</h3>
                          <span className="text-sm text-gray-500">{formatLastMessageTime(contact.lastMessageTime)}</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{contact.lastMessage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="week">
                <div className="space-y-4">
                  {sortedContacts.filter(contact => {
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const messageDate = new Date(contact.lastMessageTime);
                    return messageDate >= weekAgo &&
                      (contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       contact.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       contact.specialty?.toLowerCase().includes(searchTerm.toLowerCase()));
                  }).map(contact => (
                    <div key={contact.id} className="flex items-start space-x-4 p-4 border rounded-md hover:bg-gray-50">
                      <div className="h-10 w-10 rounded-full bg-whatsapp-light flex items-center justify-center text-white font-semibold">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{contact.name}</h3>
                          <span className="text-sm text-gray-500">{formatLastMessageTime(contact.lastMessageTime)}</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{contact.lastMessage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Contacts;
