// app/adventure/[seed]/page.tsx

interface AdventurePageProps {
  params: {
    seed: string;
  };
}

export default function AdventureSeedPage({ params }: AdventurePageProps) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">
        Заглушка для seed: {params.seed}
      </h1>
    </main>
  );
}
