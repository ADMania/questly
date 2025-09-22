// app/adventure/[seed]/page.tsx
export default function AdventureSeedPage({ params }: { params: { seed: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">Заглушка: seed {params.seed}</h1>
    </main>
  );
}
