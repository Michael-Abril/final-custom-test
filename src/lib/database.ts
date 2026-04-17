import { db } from '@varity-labs/sdk';
import type { Client } from '../types';

export { db };
export const clients = () => db.collection<Client>('clients');
