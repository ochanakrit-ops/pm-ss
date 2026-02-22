import "./globals.css";

export const metadata = {
  title: "PM-SS MobilePro",
  description: "PM Self Service (Multi-company)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
