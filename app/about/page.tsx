import BackgroundBlobs from "@/components/BackgroundBlobs";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#FFFFFF] text-gray-900 px-6 py-12 overflow-hidden">

      {/* Фоновые плавающие пятна */}
      <BackgroundBlobs />

      {/* Контент */}
      <div className="relative z-10 max-w-3xl w-full text-center">
        {/* Заголовок */}
        <h1 className="text-5xl md:text-6xl font-extrabold mb-12 bg-gradient-to-br from-[#FFCAD4] via-[#FF91A4] to-[#A3D5FF] bg-clip-text text-transparent drop-shadow-md">
          О проекте Questly
        </h1>

        {/* Блоки-облачки */}
        <div className="space-y-8">
          <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-3 text-[#FF91A4]">Что это?</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              <span className="font-semibold text-[#FF91A4]">Questly</span> — генератор случайных приключений,
              который добавляет элемент неожиданности в повседневность.
            </p>
          </div>

          <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-3 text-[#FF91A4]">Как это работает?</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Одно нажатие — и у тебя новое задание: от лёгкой идеи для прогулки 🌿
              до креативного сценария, который может раскрасить день или даже неделю.
            </p>
          </div>

          <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-3 text-[#FF91A4]">Для кого?</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Для тех, кто хочет попробовать что-то новое, но не знает с чего начать.
              Questly подскажет не то, что ты ждёшь, а то, что может удивить и вдохновить ✨
            </p>
          </div>
        </div>

        <p className="italic text-gray-600 mt-12">
          Questly — маленькие приключения, которые всегда рядом.
        </p>
      </div>
    </main>
  );
}
