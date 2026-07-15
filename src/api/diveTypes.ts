import { client } from './client';
import type { DiveType } from '../types/dive';

export const diveTypesApi = {
  lookup: (code: string, board: string, signal?: AbortSignal) =>
    client.get<DiveType>(
      `/dive-types?code=${encodeURIComponent(code)}&board=${encodeURIComponent(board)}`,
      signal,
    ),
};
