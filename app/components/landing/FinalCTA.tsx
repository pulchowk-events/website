import Btn from './Btn';

export default function FinalCTA({ onSignIn }: { onSignIn: () => void }) {
  return (
    <section className="sec" data-fx="big">
      <div className="w" style={{ textAlign: 'center' }}>
        <h2>Never miss what&apos;s on.</h2>
        <p className="s" style={{ margin: '20px auto 0' }}>Sign in to save events, follow jobs, and vote on projects &mdash; or browse the site first.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <Btn onClick={onSignIn}>Sign In</Btn>
          <Btn glass href="/">Visit Site</Btn>
          <Btn glass href="https://discord.gg/cQ5gxusATk" target="_blank" rel="noopener">Join Discord</Btn>
        </div>
      </div>
    </section>
  );
}
