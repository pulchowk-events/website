import Link from "next/link";

export default function Footer() {
  return (
    <footer className="slim-footer">
      <div className="slim-footer__inner">
        <nav className="slim-footer__nav">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <a href="https://github.com/pulchowk-events" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://discord.gg/cQ5gxusATk" target="_blank" rel="noopener noreferrer">Discord</a>
          <Link href="/landing">Landing</Link>
        </nav>
        <span>© 2026 Pulchowk Events</span>
      </div>
    </footer>
  );
}
