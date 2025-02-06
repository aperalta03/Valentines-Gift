import './globals.css';

export const metadata = {
  title: 'Romantic Collage',
  description: 'A sweet collage page.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
