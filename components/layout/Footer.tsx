export default function Footer() {
  return (
    <footer className="border-t border-border bg-white mt-auto">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[11px] text-text-muted">
            <span>Copyright 2026 The Board of Regents, The University of Texas System</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span>Borderplex Funding Intelligence Platform</span>
            <span className="text-border">|</span>
            <span>UTEP Research & Innovation Office</span>
            <span className="text-border">|</span>
            <span>Powered by AAII</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
