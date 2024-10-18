import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PC Builder AI",
  description: "Genera setups de PC optimizados basados en tus necesidades",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <header className="bg-primary text-primary-foreground p-4">
          <h1 className="text-2xl font-bold">PC Builder AI</h1>
        </header>
        <main className="container mx-auto py-8">{children}</main>
        <footer className="bg-secondary text-secondary-foreground p-4 text-center">
          <p>&copy; 2024 PC Builder AI. Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  );
}
