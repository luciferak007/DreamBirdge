export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} JobPortal. Built with React + Spring Boot.</p>
        <p>Find. Apply. Hire.</p>
      </div>
    </footer>
  )
}
