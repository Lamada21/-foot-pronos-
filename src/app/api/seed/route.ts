import { NextResponse } from 'next/server';

// Vérifier si on est sur Neon (production) ou SQLite (local)
const IS_NEON = !!process.env.DATABASE_URL;

export async function GET() {
  if (IS_NEON) {
    return NextResponse.json({
      success: false,
      message: 'Le seed API est désactivé sur Neon. Utilise la commande locale :',
      command: 'set DATABASE_URL="..." && npm run seed:neon',
      docs: 'Voir le fichier .env.example ou .env sur le bureau',
    });
  }

  try {
    // En local uniquement : seed SQLite
    const { seedDatabase } = await import('@/db/seed');
    seedDatabase();
    return NextResponse.json({ success: true, message: 'Base de données initialisée avec succès !' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'initialisation', error: String(error) },
      { status: 500 }
    );
  }
}
