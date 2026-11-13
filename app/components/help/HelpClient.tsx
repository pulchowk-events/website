"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

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
    topic: "Getting around",
    items: [
      {
        q: "How do I search the whole site?",
        a: "Press ⌘K (or Ctrl+K on Windows/Linux), or click the search icon in the top bar. The command palette finds posts, events, jobs, projects, and scholarships, plus jumps to any page. Type > to filter to actions only.",
      },
      {
        q: "How do I navigate on mobile?",
        a: "Use the bottom tab bar for Home, Events, Projects, Scholarships, and Jobs. Lounge and other sections are reachable from the search palette or the Home page. Filters on Jobs open in a full-screen drawer via the Filters button above the results.",
      },
      {
        q: "Where do I find saved items?",
        a: "Your Saved page is in the sidebar (under You) or in the command palette. Saved events, jobs, posts, projects, and scholarships all live there, filterable by type.",
      },
    ],
  },
  {
    topic: "Account",
    items: [
      {
        q: "Do I need an account to browse?",
        a: "No. Everything is readable without signing in. An account is required to post, comment, vote, save, submit events, or submit projects.",
      },
      {
        q: "How do I sign in?",
        a: "We support Discord and Google OAuth. Click Sign in anywhere and pick a provider. Your account is created automatically on first sign-in.",
      },
      {
        q: "How do I sign out?",
        a: "Click your avatar in the top-right, then Sign out in the menu.",
      },
      {
        q: "How do I edit my profile?",
        a: "Open your profile from the avatar menu, click Edit profile, and change your name or bio. Bio is limited to 160 characters.",
      },
      {
        q: "How do I delete my account?",
        a: "Email pulchowkevents@gmail.com with the request. We respond within 30 days. Content you have posted is hard-deleted; your donation entries in the public ledger are anonymised to Anonymous so the totals stay accurate.",
      },
    ],
  },
  {
    topic: "Posting in the Lounge",
    items: [
      {
        q: "How do I write a post?",
        a: "Sign in, then click Start a post on the Lounge page. Add a title, pick a category, and write in Markdown with the toolbar above the editor. Use Write/Preview to check formatting. Cmd/Ctrl+Enter posts it.",
      },
      {
        q: "How do I edit or delete my post?",
        a: "Open your post, click the overflow menu in the action bar, and choose Edit or Delete. Edits show an edited tag. Deleting removes all comments on the post permanently.",
      },
      {
        q: "What is the difference between the Lounge and Projects?",
        a: "The Lounge is for discussions, questions, tips, and announcements. Projects (Product Hunt) is a curated leaderboard of shipped student projects — one entry per project, ranked by community votes.",
      },
      {
        q: "How does voting work in the Lounge?",
        a: "Each signed-in user gets one upvote and one downvote per post. Click the same arrow again to remove your vote, or click the opposite arrow to switch. Scores update immediately.",
      },
      {
        q: "How do comments work?",
        a: "Comments are threaded up to three levels. Click Reply under any comment to respond, and the parent author is auto-mentioned. You can edit or delete your own comments at any time.",
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
        a: "Admins review each submission for accuracy, duplicates, and quality. Spam, misleading listings, and copies of existing events are rejected. Every approved event shows its source (user submission or the original scraper).",
      },
      {
        q: "Why does an event show 'via KataJaam' or similar?",
        a: "Some events are scraped from public sources like Khalti, KataJaam, NepVents, and Kgarira, then deduplicated and quality-checked. The source tag identifies where the listing was originally published.",
      },
      {
        q: "How do I add an event to my calendar?",
        a: "Open the event and click the calendar icon in the action bar. It downloads an .ics file you can import into Google Calendar, Apple Calendar, or Outlook.",
      },
      {
        q: "How do I filter events?",
        a: "Use the sticky filter bar: category chips, date chips (Today / This week / This weekend / This month), city dropdown, and price dropdown. All filters live in the URL, so you can bookmark a search.",
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
        a: "Use the filter panel on the left of /jobs — Type, Location, Posted within, Source, Salary disclosed, and Closing within 7 days. On mobile, tap the Filters button to open the same filters in a full-screen drawer.",
      },
      {
        q: "Can I save a job to apply later?",
        a: "Yes. Click the bookmark icon on any row or in the detail sheet. Saved jobs appear under /saved.",
      },
      {
        q: "Why do some listings have no salary?",
        a: "Many Nepali employers do not disclose salary. Listings that do show the amount; listings that don't show 'Not disclosed' in muted text. Use the 'Salary disclosed' filter to see only those that do.",
      },
    ],
  },
  {
    topic: "Scholarships",
    items: [
      {
        q: "Where do the scholarships come from?",
        a: "Scholarships are collected automatically from ScholarshipsAds and Erasmus Mundus, plus others over time. Each listing links to the original source for applying.",
      },
      {
        q: "What do the deadline statuses mean?",
        a: "Parsed: a confirmed deadline date (e.g. 15 Sept 2026). Year-only: the source only publishes a year (e.g. '2027') — the exact date hasn't been announced. Rolling: the program accepts applications continuously. Unknown: no deadline listed (e.g. Erasmus Mundus).",
      },
      {
        q: "Why is the 'closes in N days' counter sometimes missing?",
        a: "It only shows for parsed deadlines. Year-only and rolling deadlines can't be counted down. The Deadline Pill and Closing Soon panel are the most reliable urgency signals.",
      },
      {
        q: "How do I filter scholarships by level or country?",
        a: "On /scholarships, use the filter bar: search box (matches title), degree level (Bachelor / Masters / PhD / Fellowship / etc.), country dropdown, deadline status, and sort order (Newest or Closing soon).",
      },
      {
        q: "Can I browse by country or level?",
        a: "Yes — the taxonomies at the bottom of /scholarships link to /scholarships/country/[country] and /scholarships/level/[level] pages that list all matching scholarships.",
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
        a: "Signed-in users can upvote or downvote once per project. Click the same arrow again to remove your vote, or the opposite arrow to switch. Rankings are by score (upvotes minus downvotes), filtered by Today / This week / All time.",
      },
      {
        q: "Why can't I vote again immediately?",
        a: "There is a short cooldown between votes to prevent manipulation. The button shows 'Next vote in Ns' as a tooltip until the cooldown expires.",
      },
      {
        q: "How do I remove my project?",
        a: "Open your project, click Remove in the action bar, and confirm. All votes and comments on that project are permanently removed.",
      },
    ],
  },
  {
    topic: "Saving",
    items: [
      {
        q: "What can I save?",
        a: "Posts, events, jobs, projects, and scholarships. Every row has a bookmark icon. Click it once to save, once more to unsave. An Undo toast appears for a few seconds after unsaving.",
      },
      {
        q: "Do saves sync across devices?",
        a: "Yes. Saves are stored server-side against your account, so anything you bookmark on mobile appears on desktop.",
      },
      {
        q: "Can I save without an account?",
        a: "No. Saves require sign-in. Guests clicking the bookmark icon are prompted to sign in.",
      },
    ],
  },
  {
    topic: "Donations",
    items: [
      {
        q: "Where does the money go?",
        a: "Donations first cover the platform's operating costs — hosting, database, and server expenses. Any remaining funds go to student competition prizes and merit-based awards. If additional spending on platform improvements becomes necessary, those costs are publicly disclosed on the Donate page before they are incurred.",
      },
      {
        q: "How are donations verified?",
        a: "After donating via eSewa, you submit the transaction code. An admin verifies the code against their statement, then your donation is marked verified and appears on the leaderboard and prize pool.",
      },
      {
        q: "Can I hide my name?",
        a: "Yes — uncheck Show my name on the leaderboard before submitting. Your donation still counts toward the prize pool but appears as Anonymous on the public ledger.",
      },
      {
        q: "Can I get a refund?",
        a: "Yes, within 7 days of donating, provided the prize to which your donation was allocated has not yet been awarded. Email pulchowkevents@gmail.com with your transaction reference. After a prize is awarded, donations are non-refundable.",
      },
    ],
  },
  {
    topic: "Moderation",
    items: [
      {
        q: "How do I report something?",
        a: "Every post, comment, and project has an overflow menu with a Report option. Choose a reason and (optionally) add a note. Reports go to the admin queue.",
      },
      {
        q: "How long does moderation take?",
        a: "Reports are reviewed within a few days. Illegal content, threats, and CSAM are actioned immediately.",
      },
      {
        q: "Can I appeal a moderation action?",
        a: "Yes. Open an issue at github.com/pulchowk-events with the relevant post or account reference, and we will review.",
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
</div>
  );
}
