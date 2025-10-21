import { z } from 'zod';

export interface Departamento {
  id: number;
  nome: string;
  sub_departamentos?: SubDepartamento[];
}

export interface SubDepartamento {
  id: number;
  nome: string;
  departamento_id: number;
  departamento?: Departamento;
}

export interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  empresa_id: number;
  empresa?: Empresa;
  departamento_id: number | null;
  departamento?: Departamento;
  sub_departamento_id: number | null;
  sub_departamento?: SubDepartamento;
  cartao_ponto?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFormValues {
  name: string;
  email: string;
  timeCard: string;
  role: string;
  password?: string;
  departments: number[];
  subdepartments: {
    [key: number]: number[];
  };
  status: 'ativo' | 'inativo';
}

export const userFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  cargo: z.string().min(1, 'Cargo é obrigatório'),
  empresa_id: z.number().min(1, 'Empresa é obrigatória'),
  departamento_id: z.number().nullable(),
  sub_departamento_id: z.number().nullable(),
  cartao_ponto: z.string().optional(),
  senha: z.string().optional(),
  ativo: z.boolean().default(true)
});

export type UserFormData = z.infer<typeof userFormSchema>; 