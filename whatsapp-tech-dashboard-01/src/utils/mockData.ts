
import { Contact } from '@/types/contact';

export const generateMockContacts = (count: number = 20): Contact[] => {
  const specialties: string[] = ['Medicina', 'Direito', 'Engenharia', 'Marketing', 'Tecnologia', 'Educação', 'Finanças', 'Saúde', 'Arte', 'Comércio'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `contact-${i + 1}`,
    name: `Contato ${i + 1}`,
    phoneNumber: `+55 11 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
    lastMessage: `Esta é a última mensagem do contato ${i + 1}...`,
    lastMessageTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    totalMessages: Math.floor(Math.random() * 100),
    specialty: specialties[Math.floor(Math.random() * specialties.length)],
  }));
};

export const generateDailyMessageStats = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    return {
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 10,
    };
  }).reverse();
};

export const generateWeeklyMessageStats = () => {
  return Array.from({ length: 4 }, (_, i) => {
    return {
      week: `Semana ${i + 1}`,
      count: Math.floor(Math.random() * 200) + 50,
    };
  }).reverse();
};

export const generateMonthlyMessageStats = () => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return Array.from({ length: 12 }, (_, i) => {
    return {
      month: months[i],
      count: Math.floor(Math.random() * 800) + 200,
    };
  });
};

export const generateYearlyMessageStats = () => {
  return Array.from({ length: 5 }, (_, i) => {
    return {
      year: `${2020 + i}`,
      count: Math.floor(Math.random() * 5000) + 1000,
    };
  });
};
