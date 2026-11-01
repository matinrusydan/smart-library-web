import "./globals.css";
import { themeInitScript } from "./theme-init";

export const metadata = {
  title: "Smart Library",
  description: "Sistem informasi perpustakaan sekolah",
};

export default function RootLayout({ children }) {
  return <html lang="id" data-theme="light" suppressHydrationWarning><body><script dangerouslySetInnerHTML={{ __html: themeInitScript }} />{children}</body></html>;
}
