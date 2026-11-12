'use client';
import { useEffect, useRef, useState } from 'react';

export default function Bento() {
  const barRef = useRef<HTMLElement>(null);
  const [filled, setFilled] = useState(false);
  const [toggles, setToggles] = useState([true, false, true]);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setFilled(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="sec" data-fx="big" id="site">
      <div className="w">
        <h2>A site built to be found.</h2>
        <div className="bg">
          {/* Events */}
          <div className="cd s6">
            <h3>Events</h3>
            <p>Filter by tab, category, month, city.</p>
            <div className="v">
              <div className="rw"><i>NOV 14</i><u className="f" style={{ '--w': '82%' } as React.CSSProperties} /></div>
              <div className="rw"><i>NOV 21</i><u className="f" style={{ '--w': '60%' } as React.CSSProperties} /></div>
              <div className="rw"><i>DEC 19</i><u className="f" style={{ '--w': '74%' } as React.CSSProperties} /></div>
            </div>
          </div>
          {/* Jobs */}
          <div className="cd s4">
            <h3>Jobs</h3>
            <p>Structured for Google Jobs.</p>
            <div className="v">
              <div className="rw"><i>INTERN</i><u /></div>
              <div className="rw"><i>REMOTE</i><u /></div>
              <div className="rw"><i>FULL</i><u /></div>
            </div>
          </div>
          {/* Projects */}
          <div className="cd s4">
            <h3>Projects</h3>
            <p>Student launches, ranked by votes.</p>
            <div className="v">
              <div className="rw"><i>▲ 128</i><u className="f" style={{ '--w': '90%' } as React.CSSProperties} /></div>
              <div className="rw"><i>▲ 74</i><u className="f" style={{ '--w': '55%' } as React.CSSProperties} /></div>
              <div className="rw"><i>▲ 31</i><u className="f" style={{ '--w': '28%' } as React.CSSProperties} /></div>
            </div>
          </div>
          {/* Lounge */}
          <div className="cd s6">
            <h3>Lounge</h3>
            <p>Threads, tips, showcases.</p>
            <div className="v lg2">
              <div className="lhd">
                <span>#lounge</span>
                <span><i />24 online</span>
              </div>
              <div className="lms">
                <div className="lm" style={{ '--c': '#4cc9f0' } as React.CSSProperties}>
                  <div className="la">A</div>
                  <div>
                    <b>Aarav<em>10:02</em></b>
                    <p>Anyone doing the hackathon this Saturday?</p>
                    <div className="lr">
                      <button>🙌 3</button>
                      <button>💬 4</button>
                    </div>
                  </div>
                </div>
                <div className="lm" style={{ '--c': '#8b7cff' } as React.CSSProperties}>
                  <div className="la">S</div>
                  <div>
                    <b>Sita<em>10:04</em></b>
                    <p>Team of two, need a designer</p>
                  </div>
                </div>
                <div className="lm" style={{ '--c': '#f5a623' } as React.CSSProperties}>
                  <div className="la">B</div>
                  <div>
                    <b>Bibek<em>10:09</em></b>
                    <p>Tip: bring a charger. Venue plugs fill up fast.</p>
                    <div className="lr"><button>👍 9</button></div>
                  </div>
                </div>
                <div className="lm" style={{ '--c': '#3ecf8e' } as React.CSSProperties}>
                  <div className="la">M</div>
                  <div>
                    <b>Mina<em>10:12</em></b>
                    <p>Just shipped my first project. Feedback welcome!</p>
                    <div className="lr"><button>🎉 8</button></div>
                  </div>
                </div>
              </div>
              <div className="lty">
                <span className="dots"><i /><i /><i /></span>Prakash is typing…
              </div>
              <div className="lin">
                <input maxLength={80} placeholder="Say hi to the lounge" aria-label="Message" />
                <button aria-label="Send">↑</button>
              </div>
            </div>
          </div>
          {/* Prize pool */}
          <div className="cd s6">
            <h3>Prize pool</h3>
            <p>Verified and public.</p>
            <div className="v">
              <div className="bar"><i ref={barRef} style={{ width: filled ? '68%' : 0 }} /></div>
            </div>
          </div>
          {/* Admin */}
          <div className="cd s4">
            <h3>Admin</h3>
            <p>One route to moderate.</p>
            <div className="v">
              {toggles.map((on, i) => (
                <div key={i} className="rw">
                  <u />
                  <button
                    className={`tg${on ? ' on' : ''}`}
                    aria-label="toggle"
                    onClick={() => setToggles((t) => t.map((v, j) => (j === i ? !v : v)))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
