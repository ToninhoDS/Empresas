
// Dados para os gráficos de linha (dia, semana, mês, ano)
export const dayData = [
  { hour: '00h', PERES: 2.5, AMANDA: 3.1, CARLOS: 2.8, WESLEY: 1.5, GARDEN: 2.1, RAFAEL: 1.0 },
  { hour: '04h', PERES: 2.8, AMANDA: 0.9, CARLOS: 1.7, WESLEY: 1.9, GARDEN: 1.5, RAFAEL: 0.7 },
  { hour: '08h', PERES: 0.6, AMANDA: 2.8, CARLOS: 1.4, WESLEY: 0.7, GARDEN: 1.4, RAFAEL: 0.3 },
  { hour: '12h', PERES: 2.4, AMANDA: 1.6, CARLOS: 2.2, WESLEY: 1.0, GARDEN: 2.5, RAFAEL: 0.8 },
  { hour: '16h', PERES: 2.3, AMANDA: 1.7, CARLOS: 1.8, WESLEY: 0.9, GARDEN: 3.6, RAFAEL: 1.1 },
  { hour: '20h', PERES: 2.8, AMANDA: 1.2, CARLOS: 2.6, WESLEY: 1.3, GARDEN: 2.0, RAFAEL: 0.9 },
  { hour: '23h', PERES: 1.5, AMANDA: 1.8, CARLOS: 1.3, WESLEY: 0.8, GARDEN: 1.9, RAFAEL: 0.6 },
];

export const weekData = [
  { day: 'D', PERES: 2.5, AMANDA: 3.1, CARLOS: 2.8, WESLEY: 1.5, GARDEN: 2.1, RAFAEL: 1.0 },
  { day: 'S', PERES: 2.8, AMANDA: 0.9, CARLOS: 1.7, WESLEY: 1.9, GARDEN: 1.5, RAFAEL: 0.7 },
  { day: 'T', PERES: 0.6, AMANDA: 2.8, CARLOS: 1.4, WESLEY: 0.7, GARDEN: 1.4, RAFAEL: 0.3 },
  { day: 'Q', PERES: 2.4, AMANDA: 1.6, CARLOS: 2.2, WESLEY: 1.0, GARDEN: 2.5, RAFAEL: 0.8 },
  { day: 'Q', PERES: 2.3, AMANDA: 1.7, CARLOS: 1.8, WESLEY: 0.9, GARDEN: 3.6, RAFAEL: 1.1 },
  { day: 'S', PERES: 2.8, AMANDA: 1.2, CARLOS: 2.6, WESLEY: 1.3, GARDEN: 2.0, RAFAEL: 0.9 },
  { day: 'S', PERES: 1.5, AMANDA: 1.8, CARLOS: 1.3, WESLEY: 0.8, GARDEN: 1.9, RAFAEL: 0.6 },
];

export const monthData = [
  { week: 'S1', PERES: 12.5, AMANDA: 13.1, CARLOS: 12.8, WESLEY: 11.5, GARDEN: 12.1, RAFAEL: 10.0 },
  { week: 'S2', PERES: 12.8, AMANDA: 10.9, CARLOS: 11.7, WESLEY: 11.9, GARDEN: 11.5, RAFAEL: 10.7 },
  { week: 'S3', PERES: 10.6, AMANDA: 12.8, CARLOS: 11.4, WESLEY: 10.7, GARDEN: 11.4, RAFAEL: 10.3 },
  { week: 'S4', PERES: 12.4, AMANDA: 11.6, CARLOS: 12.2, WESLEY: 11.0, GARDEN: 12.5, RAFAEL: 10.8 },
  { week: 'S5', PERES: 12.3, AMANDA: 11.7, CARLOS: 11.8, WESLEY: 10.9, GARDEN: 13.6, RAFAEL: 11.1 },
];

export const yearData = [
  { quarter: 'T1', PERES: 52.5, AMANDA: 53.1, CARLOS: 52.8, WESLEY: 41.5, GARDEN: 42.1, RAFAEL: 40.0 },
  { quarter: 'T2', PERES: 52.8, AMANDA: 50.9, CARLOS: 51.7, WESLEY: 41.9, GARDEN: 41.5, RAFAEL: 40.7 },
  { quarter: 'T3', PERES: 50.6, AMANDA: 52.8, CARLOS: 51.4, WESLEY: 40.7, GARDEN: 41.4, RAFAEL: 40.3 },
  { quarter: 'T4', PERES: 52.4, AMANDA: 51.6, CARLOS: 52.2, WESLEY: 41.0, GARDEN: 42.5, RAFAEL: 40.8 },
];

// Dados para as tabelas de resumo (com contagem e percentual)
export const dayTableData = [
  { name: 'GARDEN', count: 58, percentage: 30 },
  { name: 'PERES', count: 52, percentage: 27 },
  { name: 'CARLOS', count: 42, percentage: 22 },
  { name: 'WESLEY', count: 21, percentage: 11 },
  { name: 'RAFAEL', count: 12, percentage: 6 },
  { name: 'AMANDA', count: 4, percentage: 2 },
];

export const weekTableData = [
  { name: 'GARDEN', count: 285, percentage: 32 },
  { name: 'PERES', count: 256, percentage: 28 },
  { name: 'CARLOS', count: 198, percentage: 22 },
  { name: 'WESLEY', count: 89, percentage: 10 },
  { name: 'RAFAEL', count: 54, percentage: 6 },
  { name: 'AMANDA', count: 18, percentage: 2 },
];

export const monthTableData = [
  { name: 'CARLOS', count: 822, percentage: 29 },
  { name: 'PERES', count: 756, percentage: 27 },
  { name: 'GARDEN', count: 654, percentage: 23 },
  { name: 'WESLEY', count: 321, percentage: 11 },
  { name: 'RAFAEL', count: 198, percentage: 7 },
  { name: 'AMANDA', count: 84, percentage: 3 },
];

export const yearTableData = [
  { name: 'PERES', count: 2654, percentage: 31 },
  { name: 'CARLOS', count: 2356, percentage: 28 },
  { name: 'AMANDA', count: 1854, percentage: 22 },
  { name: 'GARDEN', count: 856, percentage: 10 },
  { name: 'WESLEY', count: 542, percentage: 6 },
  { name: 'RAFAEL', count: 254, percentage: 3 },
];

export const masterTableData = [
  { name: 'CARLOS', count: 993, percentage: 30 },
  { name: 'AMANDA', count: 792, percentage: 24 },
  { name: 'PERES', count: 782, percentage: 23 },
  { name: 'RAFAEL', count: 584, percentage: 18 },
  { name: 'GARDEN', count: 160, percentage: 5 },
  { name: 'WESLEY', count: 17, percentage: 1 },
];

// Configuração de cores para os técnicos
export const techColors = {
  PERES: '#f59e0b', // amarelo
  AMANDA: '#8b5cf6', // roxo
  CARLOS: '#ec4899', // rosa
  RAFAEL: '#ef4444', // vermelho
  WESLEY: '#3b82f6', // azul
  GARDEN: '#10b981', // verde
};

// Cores para o ranking do mestre
export const rankColors = {
  1: '#FFD700', // Gold
  2: '#C0C0C0', // Silver
  3: '#CD7F2A', // Bronze
  4: '#0EA5E9', // Blue
  5: '#0EA5E9', // Blue
  6: '#0EA5E9', // Blue
};
