// src/layouts/MainLayout.jsx
export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F1EB] text-[#3A3A3A]">
      {/* Header */}
      <header className="bg-[#C6A087] text-white px-6 py-4 text-xl font-semibold shadow-md">
        JAPAN TRIP
      </header>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
