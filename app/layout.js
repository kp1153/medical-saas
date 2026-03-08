import "./globals.css";

export const metadata = {
  title: "Medical SaaS",
  description: "Smart billing for medical stores",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}

