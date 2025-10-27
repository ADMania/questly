import "../styles/globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "Questly — Генератор приключений",
  description:
    "Questly — онлайн генератор случайных заданий и квестов. Креативные, ночные, дневные, социальные и домашние приключения для вдохновения и развлечений.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <meta
          name="keywords"
          content="квесты, задания, челленджи, приключения, игра, развлечения, генератор квестов, генератор заданий, random quest, случайные задания, случайные квесты,
        идеи для квеста, задания для компании, задания для друзей, челленджи для друзей, игра на вечеринке, задания на вечеринку, квест дома, домашние задания, задания на улице,
        креативные задания, творческие задания, социальные челленджи, задания для двоих, задания для пары, челлендж для компании, испытания, задания с друзьями, задания для подростков, задания для взрослых,
        приключения онлайн, задания онлайн, задания случайные, генератор случайных заданий, генератор челленджей, идеи для челленджей, весёлые задания, смешные задания, экстремальные задания, лайф-квесты, приключенческая игра"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://questly.site/" />

        {/* Яндекс.Метрика */}
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {
                      if (document.scripts[j].src === r) { return; }
                  }
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');

              ym(104251164, 'init', {
                  clickmap:true,
                  trackLinks:true,
                  accurateTrackBounce:true,
                  webvisor:true,
                  ecommerce:"dataLayer"
              });
            `,
          }}
        />
      </head>

      <body className="bg-[#f2e3bf] text-[#3c2415] min-h-screen flex flex-col">
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/104251164"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>

        {/* Бумажный хедер */}
        <AppHeader />

        {/* Контент */}
        <main className="flex-grow">{children}</main>

        {/* Маленький бумажный футер */}
        <footer
          className="text-center text-sm py-4 mt-10 text-[#5e4632] bg-[#fff9eb]/60 border-t border-[#d2a06f]/30"
        >
          Сделано <span className="font-semibold">Infera</span> ·{" "}
          <a
            href="mailto:infera-sys@yandex.ru"
            className="underline-offset-2 hover:underline"
          >
            infera-sys@yandex.ru
          </a>
        </footer>
      </body>
    </html>
  );
}
