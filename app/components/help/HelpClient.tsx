"use client";

import { useMemo, useState } from "react";
import { Search, MessageSquare } from "lucide-react";

interface QA {
  q: string;
  a: string;
}

interface Group {
  topic: string;
  items: QA[];
}

const GROUPS: Group[] = [
  {
    topic: "Posting",
    items: [
      {
        q: "How do I write a post?",
        a: "Sign in, then click Start a post on the Lounge page. Add a title, pick a category, and write in Markdown with the toolbar above the editor. Use Write/Preview to check your formatting. Cmd/Ctrl+Enter posts it.",
      },
      {
        q: "How do I edit or delete my post?",
        a: "Open your post, click the overflow menu (⋯) in the action bar, and choose Edit or Delete. Edits show an \"edited\" tag. Deleting removes all comments on the post, permanently.",
      },
      {
        q: "What is the difference between the Lounge and Projects?",
        a: "The Lounge is for discussions, questions, tips, and announcements. Projects (Product Hunt) is a curated leaderboard of shipped student projects — one entry per project, ranked by community votes.",
      },
      {
        q: "Can I add images to a post?",
        a: "Yes — paste a link to an image (or any page) into the Reference link field. If the target page has a preview image, we fetch it. Add an image URL directly to embed it inline.",
      },
    ],
  },
  {
    topic: "Events",
    items: [
      {
        q: "Who can submit events?",
        a: "Anyone signed in. Events go through a review queue and are typically approved within a day. Approved events appear on the public feed within a minute.",
      },
      {
        q: "How does event review work?",
        a: "Admins review each submission for accuracy, duplicates, and quality. Spam, misleading listings, and copies of existing events are rejected. Every approved event shows a source tag (user submission or the original scraper).",
      },
      {
        q: "Why does an event show \"via KataJaam\" or similar?",
        a: "Some events are scraped from partner sources like Khalti, KataJaam, NepVents, and Kgarira, then deduplicated and quality-checked. The source tag identifies where the listing was originally published.",
      },
      {
        q: "How do I add an event to my calendar?",
        a: "Open the event and click the calendar icon in the action bar. It downloads an .ics file you can import into Google Calendar, Apple Calendar, or Outlook.",
      },
    ],
  },
  {
    topic: "Jobs",
    items: [
      {
        q: "Where do the jobs come from?",
        a: "Jobs are scraped from Merojob, KumariJob, SathiJob, and InternSathi, then deduplicated and quality-checked. Each listing links to the original posting for applying.",
      },
      {
        q: "How do I filter jobs?",
        a: "Use the filter panel on the left of /jobs — Type, Location, Posted within, Source, Salary disclosed, and Closing within 7 days. All filters live in the URL, so you can bookmark a search.",
      },
      {
        q: "Can I save a job to apply later?",
        a: "Yes. Click the bookmark icon on any row or in the detail sheet. Saved jobs appear under /saved.",
      },
    ],
  },
  {
    topic: "Projects",
    items: [
      {
        q: "How do I submit a project?",
        a: "Click Submit project on /product-hunt. Add a name, URL slug, description, and an optional live URL and image. Projects go through admin review before appearing on the leaderboard.",
      },
      {
        q: "How does voting work?",
        a: "Signed-in users can upvote once per project. Votes can be changed or removed. Rankings are by vote count, filtered by Today / This week / All time.",
      },
      {
        q: "How do I remove my project?",
        a: "Open your project, click Remove in the action bar, and confirm. All votes and comments on that project are permanently removed.",
      },
    ],
  },
  {
    topic: "Account",
    items: [
      {
        q: "Do I need an account to browse?",
        a: "No. You can browse events, jobs, projects, and the Lounge without signing in. An account is required to post, vote, save, comment, or submit events and projects.",
      },
      {
        q: "How do I sign in?",
        a: "We support Discord and Google OAuth. Click Sign in anywhere and pick a provider. Your account is created on first sign-in.",
      },
      {
        q: "How do I sign out?",
        a: "Click your avatar in the top right, then Sign out in the menu.",
      },
    ],
  },
  {
    topic: "Donations",
    items: [
      {
        q: "Where does the money go?",
        a: "100% of donations fund student competitions and merit-based awards. There is no platform fee — every dollar reaches a student.",
      },
      {
        q: "How are donations verified?",
        a: "After donating via eSewa, you submit the transaction code. An admin verifies the code against their statement, then your donation is marked verified and appears on the leaderboard and prize pool.",
      },
      {
        q: "Can I hide my name?",
        a: "Yes — uncheck Show my name on the leaderboard before submitting. Your donation still counts toward the prize pool but appears as Anonymous on the public ledger.",
      },
    ],
  },
];

function normalize(s: string): string {
  return s.toLowerCase();
}

export function HelpClient() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.map((g) => ({
      topic: g.topic,
      items: g.items.filter(
        (item) =>
          normalize(item.q).includes(q) || normalize(item.a).includes(q),
      ),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const totalResults = filtered.reduce((sum, g) => sum + g.items.length, 0);
  const showingResults = query.trim().length > 0;

  return (
    <div className="help">
      <div className="help__search">
        <Search size={14} />
        <input
          type="search"
          placeholder="Search questions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search help"
        />
      </div>

      {showingResults && totalResults === 0 ? (
        <div className="help__empty">
          <p>No answers match &ldquo;{query}&rdquo;.</p>
          <p className="help__empty-hint">Try a shorter phrase, or ask in Discord.</p>
        </div>
      ) : (
        <div className="help__grid">
          {filtered.map((group) => (
            <section key={group.topic} className="help__group">
              <h2 className="help__group-title">{group.topic}</h2>
              {group.items.map((item, i) => (
                <details key={i} className="help__item">
                  <summary>
                    <span>{item.q}</span>
                    <span className="help__chevron" aria-hidden="true">+</span>
                  </summary>
                  <p className="help__answer">{item.a}</p>
                </details>
              ))}
            </section>
          ))}
        </div>
      )}

      <section className="help__stuck">
        <div className="help__stuck-icon">
          <MessageSquare size={18} />
        </div>
        <div className="help__stuck-body">
          <h3 className="help__stuck-title">Still stuck?</h3>
          <p className="help__stuck-desc">
            Ask in the Discord community — eleven thousand students and a few admins are around.
          </p>
        </div>
        <a
          href="https://discord.gg/cQ5gxusATk"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary btn--sm"
        >
          Ask in Discord
        </a>
      </section>
    </div>
  );
}
