// app/layout.tsx
import './globals.css'; // Optional: Import global styles

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Shared UI components like a Header or Footer can be added here */}
        {children}
      </body>
    </html>
  );
}
