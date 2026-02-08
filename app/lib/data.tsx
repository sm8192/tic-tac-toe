import postgres from 'postgres';

import {
network
} from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchNetworks() {
  try {
    const data = await sql<network[]>`SELECT * FROM networks`;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}