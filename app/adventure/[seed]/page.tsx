import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Questly Adventure",
};

export default function AdventureSeedPage({ params }: { params: { seed: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">
        Заглушка для seed: {params.seed}
      </h1>
    </main>
  );
}
