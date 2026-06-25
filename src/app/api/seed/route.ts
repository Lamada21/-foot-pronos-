import { NextResponse } from 'next/server';
import { seedDatabase } from '@/db/seed';

export async function GET() {
  try {
    // Le seed utilise db.exec (synchrone SQLite / async Neon via dbExec)
    await seedDatabase();
    return NextResponse.json({ success: true, message: 'Base de données initialisée avec succès !' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'initialisation', error: String(error) },
      { status: 500 }
    );
  }
}
