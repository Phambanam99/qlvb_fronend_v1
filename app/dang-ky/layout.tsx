import type React from "react";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[url('/anhnen.png')] bg-cover bg-center">
      <main className="flex-1">{children}</main>
    </div>
  );
}
