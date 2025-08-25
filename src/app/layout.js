import './globals.css'
import { Inter } from 'next/font/google'

import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/Footer";
import { ThemeContextProvider } from '@/context/ThemeContext';
import ThemeProvider from '@/providers/ThemeProvider';
import AuthProvider from '@/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Teenage Theory',
  description: 'The best blog app!',
  icons: {
    icon: [
      { url: '/tt_logo.png' },
      { url: '/tt_logo.ico', type: 'image/x-icon' }
    ],
    apple: '/tt_logo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeContextProvider>
            <ThemeProvider>
              <div className='container'>
                <div className='wrapper'>
                  <Navbar/>
                  {children}
                  <Footer/>
                </div>
              </div>
            </ThemeProvider>
          </ThemeContextProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
