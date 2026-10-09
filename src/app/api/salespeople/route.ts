import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    const salespeople = await db.user.findMany({
      where: { role: UserRole.SALESPERSON },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json({ success: true, salespeople });
  } catch (error) {
    console.error('Error fetching salespeople:', error);
    return NextResponse.json({ error: 'Failed to fetch salespeople' }, { status: 500 });
  }
}
