import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/shared/Header';
import { CacheProvider } from '@/lib/cache/CacheProvider';
import { NotificationProvider } from '@/lib/notifications/NotificationProvider';
import { GlobalToastContainer } from '@/components/shared/GlobalToastContainer';

export const metadata: Metadata = {
  title: 'EMP Story Engine | Efecto Mariposa Project',
  description: 'Plataforma de gestión narrativa colaborativa asistida por IA para el reto de 80 días.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
        <CacheProvider>
          <NotificationProvider>
            <GlobalToastContainer />
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto p-6">{children}</main>
            <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
              EMP Story Engine v0.1 • Efecto Mariposa Project • System Control
            </footer>
          </NotificationProvider>
        </CacheProvider>
      </body>
    </html>
  );
}

