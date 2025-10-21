
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Search, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  User,
  AlertCircle,
  MessageSquareDashed,
  Hourglass
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  department: string;
  avatar?: string;
  status: 'online' | 'busy' | 'offline';
  openConversations: number;
  closedToday: number;
  averageResponseTime: string;
  satisfactionRate: number;
}

interface Conversation {
  id: number;
  agentId: number;
  agentName: string;
  customerName: string;
  phoneNumber: string;
  startTime: string;
  status: 'open' | 'closed';
  lastMessageTime: string;
  waitingTime?: string;
}

const TeamSupervision = () => {
  const [activeTab, setActiveTab] = useState('team');
  const [searchTerm, setSearchTerm] = useState('');
  const [userDepartment, setUserDepartment] = useState('');
  const [userName, setUserName] = useState('');
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { 
      id: 1, 
      name: "João Santos", 
      email: "joao@santacasa.com", 
      department: "Ambulatório",
      status: 'online',
      openConversations: 3,
      closedToday: 12,
      averageResponseTime: "2m 30s",
      satisfactionRate: 92
    },
    { 
      id: 2, 
      name: "Ana Oliveira", 
      email: "ana@santacasa.com", 
      department: "Ambulatório",
      status: 'online',
      openConversations: 5,
      closedToday: 8,
      averageResponseTime: "3m 15s",
      satisfactionRate: 88
    },
    { 
      id: 3, 
      name: "Carlos Mendes", 
      email: "carlos@santacasa.com", 
      department: "Ambulatório",
      status: 'busy',
      openConversations: 7,
      closedToday: 5,
      averageResponseTime: "5m 45s",
      satisfactionRate: 75
    },
    { 
      id: 4, 
      name: "Patricia Lima", 
      email: "patricia@santacasa.com", 
      department: "Ambulatório",
      status: 'offline',
      openConversations: 0,
      closedToday: 10,
      averageResponseTime: "2m 50s",
      satisfactionRate: 90
    },
  ]);

  const [activeConversations, setActiveConversations] = useState<Conversation[]>([
    {
      id: 1,
      agentId: 1,
      agentName: "João Santos",
      customerName: "Roberto Silva",
      phoneNumber: "11 98765-4321",
      startTime: "09:15",
      status: "open",
      lastMessageTime: "09:45",
      waitingTime: "5m"
    },
    {
      id: 2,
      agentId: 1,
      agentName: "João Santos",
      customerName: "Mariana Costa",
      phoneNumber: "11 91234-5678",
      startTime: "10:02",
      status: "open",
      lastMessageTime: "10:10"
    },
    {
      id: 3,
      agentId: 2,
      agentName: "Ana Oliveira",
      customerName: "Luiz Fernando",
      phoneNumber: "11 97890-1234",
      startTime: "08:30",
      status: "open",
      lastMessageTime: "10:15",
      waitingTime: "20m"
    },
    {
      id: 4,
      agentId: 3,
      agentName: "Carlos Mendes",
      customerName: "Juliana Pereira",
      phoneNumber: "11 93456-7890",
      startTime: "09:50",
      status: "open",
      lastMessageTime: "10:05",
      waitingTime: "10m"
    }
  ]);

  useEffect(() => {
    // Get user info from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserDepartment(userData.department || '');
      setUserName(userData.name || '');
      
      // Filter team members to only show those in the supervisor's department
      if (userData.department) {
        setTeamMembers(prev => 
          prev.filter(member => member.department === userData.department)
        );
      }
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredTeamMembers = searchTerm 
    ? teamMembers.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : teamMembers;

  const filteredConversations = searchTerm
    ? activeConversations.filter(conv =>
        conv.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.phoneNumber.includes(searchTerm)
      )
    : activeConversations;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Supervisão de Equipe</h1>
          <Badge variant="outline" className="text-sm font-normal">
            Departamento: {userDepartment || 'Não definido'}
          </Badge>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="team" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="team" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Equipe
            </TabsTrigger>
            <TabsTrigger value="conversations" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Conversas Ativas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="team" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Membros da Equipe</CardTitle>
                <CardDescription>
                  Gerencie e acompanhe o desempenho da sua equipe de atendimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTeamMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? (
                      <>Nenhum membro da equipe encontrado para "{searchTerm}"</>
                    ) : (
                      <>Nenhum membro na equipe</>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {filteredTeamMembers.map((member) => (
                      <Card key={member.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-4 flex items-center space-x-4">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${getStatusColor(member.status)} border-2 border-white`}></span>
                            </div>
                            <div>
                              <h3 className="font-medium">{member.name}</h3>
                              <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-100 bg-gray-50 p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 flex items-center">
                                  <MessageSquare className="mr-1 h-3 w-3" />
                                  Conversas Abertas
                                </p>
                                <p className="font-medium">{member.openConversations}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 flex items-center">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Atendimentos Hoje
                                </p>
                                <p className="font-medium">{member.closedToday}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 flex items-center">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Tempo Médio Resposta
                                </p>
                                <p className="font-medium">{member.averageResponseTime}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Satisfação</p>
                                <div className="flex items-center space-x-2">
                                  <Progress value={member.satisfactionRate} className="h-2" />
                                  <span className="text-xs font-medium">{member.satisfactionRate}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="conversations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversas Ativas</CardTitle>
                <CardDescription>
                  Acompanhe todas as conversas abertas pela sua equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Atendente</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Última Mensagem</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConversations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? (
                            <>Nenhuma conversa encontrada para "{searchTerm}"</>
                          ) : (
                            <>Não há conversas ativas no momento</>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredConversations.map((conv) => (
                        <TableRow key={conv.id}>
                          <TableCell className="font-medium">{conv.agentName}</TableCell>
                          <TableCell>{conv.customerName}</TableCell>
                          <TableCell>{conv.phoneNumber}</TableCell>
                          <TableCell>{conv.startTime}</TableCell>
                          <TableCell>{conv.lastMessageTime}</TableCell>
                          <TableCell>
                            {conv.waitingTime ? (
                              <div className="flex items-center">
                                <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                                <span className="text-amber-700">Aguardando ({conv.waitingTime})</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <MessageSquareDashed className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-green-700">Em atendimento</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-sm text-gray-500 flex items-center mt-4">
          <Hourglass className="mr-2 h-4 w-4" />
          <span>Dados atualizados em tempo real. As estatísticas são coletadas automaticamente.</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamSupervision;
