import { PrismaClient } from '@prisma/client';
import { singleton } from '~/lib/singleton';

export const prisma = singleton('prisma', () => new PrismaClient());
