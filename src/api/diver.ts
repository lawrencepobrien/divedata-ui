import { client } from './client';
import { Diver } from '../types/diver';

export const diversApi = {
  getById: (id: number) => client.get<Diver>(`/diver/${id}`),
};
