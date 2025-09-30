import { api } from './api';

export type Scheme = {
  id: number;
  title: string;
  description?: string | null;
  eligibility?: string | null;
  link?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  active: boolean;
  created_at: string;
};

export async function getSchemes(): Promise<{ schemes: Scheme[] }>{
  const { data } = await api.get('/schemes');
  return data;
}

export async function adminListSchemes(): Promise<{ schemes: Scheme[] }>{
  const { data } = await api.get('/admin/schemes');
  return data;
}

export async function adminCreateScheme(payload: Partial<Scheme>) {
  const { data } = await api.post('/admin/schemes', payload);
  return data;
}
