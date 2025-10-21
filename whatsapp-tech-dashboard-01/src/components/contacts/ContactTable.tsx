import React, { useState, useEffect } from 'react';
import { Contact } from '@/types/contact';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ContactDetailsModal from './ContactDetailsModal';

interface ContactTableProps {
  contacts: Contact[];
  searchTerm?: string;
  selectedContactId?: string | null;
}

const ContactTable: React.FC<ContactTableProps> = ({ contacts, searchTerm = '', selectedContactId = null }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Efeito para abrir automaticamente o modal quando um contato é selecionado via URL
  useEffect(() => {
    if (selectedContactId) {
      const contact = contacts.find(c => c.id === selectedContactId);
      if (contact) {
        setSelectedContact(contact);
        setIsModalOpen(true);
      }
    }
  }, [selectedContactId, contacts]);

  const handleOpenModal = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

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

  const normalizePhoneNumber = (phone: string): string => {
    // Remove espaços, traços, parênteses e sinais de mais
    return phone.replace(/[\s\-\(\)\+]/g, '');
  };

  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const normalizedSearchPhone = normalizePhoneNumber(searchLower);
    const normalizedContactPhone = normalizePhoneNumber(contact.phoneNumber);

    // Verifica se o termo de busca é um número de telefone (contém apenas dígitos)
    const isSearchingPhone = /^\d+$/.test(normalizedSearchPhone);
    
    // Se estiver buscando por telefone, verifica se o final do número corresponde
    const phoneMatches = isSearchingPhone 
      ? normalizedContactPhone.endsWith(normalizedSearchPhone)
      : normalizedContactPhone.includes(normalizedSearchPhone);

    // Busca por nome (case insensitive)
    const nameMatches = contact.name.toLowerCase().includes(searchLower);
    
    // Busca por especialidade (case insensitive)
    const specialtyMatches = contact.specialty.toLowerCase().includes(searchLower);
    
    return nameMatches || phoneMatches || specialtyMatches;
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Última Mensagem</TableHead>
              <TableHead>Última Interação</TableHead>
              <TableHead>Total de Mensagens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow 
                key={contact.id}
                onClick={() => handleOpenModal(contact)}
                className={`cursor-pointer hover:bg-gray-50 ${selectedContactId === contact.id ? 'bg-blue-50' : ''}`}
              >
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.phoneNumber}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    {contact.specialty}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{contact.lastMessage}</TableCell>
                <TableCell>{formatLastMessageTime(contact.lastMessageTime)}</TableCell>
                <TableCell>{contact.totalMessages}</TableCell>
              </TableRow>
            ))}
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhum contato encontrado para "{searchTerm}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default ContactTable;
