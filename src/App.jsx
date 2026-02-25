import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SB_URL = "https://pynmkrcbkcfxifnztnrn.supabase.co";
const SB_ANON = "sb_publishable_8VEm7zR0vqKjOZRwH6jimw_qIWt-RPp";
// Manual auth pattern (tender-circuit style) — no GoTrueClient auto-detection.
// We read the hash ourselves in a useEffect, call setSession(), then clear it.
// This avoids the navigator.locks / MessageChannel race condition.
const supabase = createClient(SB_URL, SB_ANON, {
  auth: { flowType: "implicit", storageKey: "bad-movie-bracket-auth" },
});

function useIsMobile(breakpoint = 600) {
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth <= breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setMob(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return mob;
}

// Region metadata
const REG = ["Video Game Crimes", "Big Budget Collapse", "Ego & Hubris", "Deep-Cut Chaos"];
const REG_EMOJI = ["🎮", "💸", "🧨", "👻"];
const REG_COLOR = ["#4ade80", "#fbbf24", "#f472b6", "#ef4444"];

// Per-region card color schemes. cat = "VG"|"BB"|"EG"|"DC"
const CLR = {
  VG: { bg: "#090f09", ac: "#4ade80", gl: "rgba(74,222,128,.18)", tx: "#86efac" },
  BB: { bg: "#120d00", ac: "#fbbf24", gl: "rgba(251,191,36,.18)", tx: "#fcd34d" },
  EG: { bg: "#12000f", ac: "#f472b6", gl: "rgba(244,114,182,.18)", tx: "#f9a8d4" },
  DC: { bg: "#120000", ac: "#ef4444", gl: "rgba(239,68,68,.18)",  tx: "#fca5a5" },
};
const BADGE_CLR = {
  VG: { bg: "#4ade8014", tx: "#4ade80" },
  BB: { bg: "#fbbf2414", tx: "#fbbf24" },
  EG: { bg: "#f472b614", tx: "#f472b6" },
  DC: { bg: "#ef444414", tx: "#ef4444" },
};

// Bad movie trivia facts
const FACTS = {
  "Mortal Kombat: Annihilation": "Shot in under 100 days. Most of the returning cast refused to come back, so their characters were killed off in the first five minutes.",
  "Super Mario Bros.": "Bob Hoskins called it the worst thing he ever made. He spent the rest of his career carefully vetting scripts. John Leguizamo broke his wrist on set and filmed through it.",
  "Dragonball Evolution": "Akira Toriyama was so disturbed by the adaptation that it motivated him to return to the franchise and create Dragon Ball Super. The film accidentally saved the anime.",
  "Street Fighter": "Raul Julia took the role of M. Bison as a gift to his kids, who loved the game. He died before the film was released. His performance is the only watchable thing in it.",
  "Doom": "Features a first-person shooter sequence shot to look like the game. It lasts about three minutes and was universally cited as the only good part.",
  "Assassin's Creed": "Michael Fassbender spent years developing this himself. The film bombed so badly it shut down Ubisoft's film division and set back video game movies by half a decade.",
  "Hitman": "Timothy Olyphant has spoken about this film almost zero times in the fifteen years since it came out.",
  "Alone in the Dark": "Tara Reid plays an archaeologist. She needed coaching to pronounce basic scientific terms during filming. The studio did not replace her.",
  "Battlefield Earth": "John Travolta spent a decade getting this made as a passion project. It was filmed entirely in Dutch angles. The cinematographer later said he regrets every frame.",
  "Cats": "The VFX team worked so fast that theatrical prints shipped with unfinished effects — Universal had to push a patch to digital rental versions. The 'butthole cut' remains unconfirmed.",
  "Movie 43": "Getting stars to appear required each director to personally beg their friends. The result proves that friendship has limits.",
  "The Last Airbender": "M. Night Shyamalan cast the Fire Nation and Earth Kingdom predominantly white, a decision so widely criticized it became a Harvard film school case study.",
  "Fantastic Four": "Miles Teller and the director were openly feuding during production. The studio cut the film without the director's involvement. He saw the final version at a press screening.",
  "Jupiter Ascending": "The Wachowskis had $176 million and final cut. The result features Eddie Redmayne whispering every line, a half-human half-wolf Channing Tatum, and a bureaucracy subplot.",
  "After Earth": "Will Smith conceived this as a vehicle for his son. It's cited in film school as one of the clearest examples of unchecked star power producing a bad film.",
  "The Emoji Movie": "Sony greenlit this over Spider-Man: Into the Spider-Verse, which they were simultaneously delaying. Both came out within a year of each other. Only one of them won an Oscar.",
  "The Room": "Tommy Wiseau claims it was always intended as a dark comedy. He started claiming this after audiences laughed at it. The film cost $6 million of his own money.",
  "Gigli": "The tabloid coverage of the Bennifer relationship was so overwhelming that the film had no chance of a fair review. Still: it genuinely is very bad.",
  "The Love Guru": "Mike Myers spent years developing this as his next franchise. It killed his live-action comedy career. He has been mostly absent from film ever since.",
  "Jack and Jill": "Won a record 10 Razzie Awards in a single night — every category, including Adam Sandler winning both Worst Actor and Worst Actress for the same film.",
  "Superbabies: Baby Geniuses 2": "Has held 0% on Rotten Tomatoes for over twenty years. The number of reviews has grown. The score has not moved.",
  "The Master of Disguise": "Dana Carvey's production company financed and made this. He has said publicly that he wishes he could unmake it.",
  "Holmes & Watson": "Will Ferrell and John C. Reilly reportedly tried to sell the film to Netflix after test screenings bombed. Netflix passed. Sony released it anyway.",
  "Cool Cat Saves the Kids": "Director Derek Savage self-financed and self-distributed this. He has aggressively pursued YouTube critics who mocked it, including filing copyright strikes on negative reviews.",
  "Troll 2": "Has no trolls in it. Was filmed entirely in Morgan, Utah with a cast of locals who had never acted professionally. The child star grew up and made a documentary about it.",
  "Silent Night, Deadly Night Part 2": "Roughly half the runtime is flashback footage from the first film. The 'Garbage Day!' scene has more YouTube views than the entire film had in its theatrical run.",
  "Birdemic: Shock and Terror": "Took director James Nguyen four years and $10,000 to make. The attacking birds are animated GIFs placed over the footage. The romantic subplot took longer to film than the birds did.",
  "Manos: The Hands of Fate": "Made on a $19,000 bet by a fertilizer salesman who claimed anyone could make a movie. He lost the bet. The film was rediscovered by Mystery Science Theater 3000 in 1993.",
  "The Wicker Man": "Nicolas Cage's most memorable scenes — bees, punching a woman while wearing a bear suit — were largely improvised. He asked to do them. The studio let him.",
  "The Bye Bye Man": "Deliberately rated PG-13 to maximize opening weekend. Critics noted that the PG-13 rating was the only decision that made sense in the entire production.",
  "Howard the Duck": "Cost $37 million in 1986 — one of the most expensive films ever made at the time. George Lucas executive produced it. He rarely mentions it.",
  "Ballistic: Ecks vs. Sever": "Has a 0% on Rotten Tomatoes. Several critics noted at the time that the film was technically competent — they said this made it worse, somehow.",
};

const MOVIES = [
  // 🎮 Region 1: Video Game Adaptation Crimes
  { seed:1,  name:"Mortal Kombat: Annihilation", year:1997, cat:"VG", imdb:"https://www.imdb.com/title/tt0119013/" },
  { seed:2,  name:"Super Mario Bros.",            year:1993, cat:"VG", imdb:"https://www.imdb.com/title/tt0108255/" },
  { seed:3,  name:"Dragonball Evolution",          year:2009, cat:"VG", imdb:"https://www.imdb.com/title/tt1098016/" },
  { seed:4,  name:"Street Fighter",               year:1994, cat:"VG", imdb:"https://www.imdb.com/title/tt0111301/" },
  { seed:5,  name:"Doom",                         year:2005, cat:"VG", imdb:"https://www.imdb.com/title/tt0419706/" },
  { seed:6,  name:"Assassin's Creed",             year:2016, cat:"VG", imdb:"https://www.imdb.com/title/tt2094766/" },
  { seed:7,  name:"Hitman",                       year:2007, cat:"VG", imdb:"https://www.imdb.com/title/tt0465602/" },
  { seed:8,  name:"Alone in the Dark",            year:2005, cat:"VG", imdb:"https://www.imdb.com/title/tt0369226/" },
  // 💸 Region 2: Big Budget, Big Collapse
  { seed:9,  name:"Battlefield Earth",            year:2000, cat:"BB", imdb:"https://www.imdb.com/title/tt0185183/" },
  { seed:10, name:"Cats",                         year:2019, cat:"BB", imdb:"https://www.imdb.com/title/tt5697572/" },
  { seed:11, name:"Movie 43",                     year:2013, cat:"BB", imdb:"https://www.imdb.com/title/tt1333125/" },
  { seed:12, name:"The Last Airbender",           year:2010, cat:"BB", imdb:"https://www.imdb.com/title/tt0938283/" },
  { seed:13, name:"Fantastic Four",               year:2015, cat:"BB", imdb:"https://www.imdb.com/title/tt1502712/" },
  { seed:14, name:"Jupiter Ascending",            year:2015, cat:"BB", imdb:"https://www.imdb.com/title/tt1617661/" },
  { seed:15, name:"After Earth",                  year:2013, cat:"BB", imdb:"https://www.imdb.com/title/tt1815862/" },
  { seed:16, name:"The Emoji Movie",              year:2017, cat:"BB", imdb:"https://www.imdb.com/title/tt4877122/" },
  // 🧨 Region 3: Ego Projects & Hubris
  { seed:17, name:"The Room",                     year:2003, cat:"EG", imdb:"https://www.imdb.com/title/tt0368226/" },
  { seed:18, name:"Gigli",                        year:2003, cat:"EG", imdb:"https://www.imdb.com/title/tt0299930/" },
  { seed:19, name:"The Love Guru",                year:2008, cat:"EG", imdb:"https://www.imdb.com/title/tt1046206/" },
  { seed:20, name:"Jack and Jill",                year:2011, cat:"EG", imdb:"https://www.imdb.com/title/tt1611224/" },
  { seed:21, name:"Superbabies: Baby Geniuses 2", year:2004, cat:"EG", imdb:"https://www.imdb.com/title/tt0384504/" },
  { seed:22, name:"The Master of Disguise",       year:2002, cat:"EG", imdb:"https://www.imdb.com/title/tt0295462/" },
  { seed:23, name:"Holmes & Watson",              year:2018, cat:"EG", imdb:"https://www.imdb.com/title/tt1255919/" },
  { seed:24, name:"Cool Cat Saves the Kids",      year:2015, cat:"EG", imdb:"https://www.imdb.com/title/tt3120958/" },
  // 👻 Region 4: Deep-Cut Chaos
  { seed:25, name:"Troll 2",                             year:1990, cat:"DC", imdb:"https://www.imdb.com/title/tt0100516/" },
  { seed:26, name:"Silent Night, Deadly Night Part 2",   year:1987, cat:"DC", imdb:"https://www.imdb.com/title/tt0092067/" },
  { seed:27, name:"Birdemic: Shock and Terror",          year:2010, cat:"DC", imdb:"https://www.imdb.com/title/tt1316037/" },
  { seed:28, name:"Manos: The Hands of Fate",            year:1966, cat:"DC", imdb:"https://www.imdb.com/title/tt0057507/" },
  { seed:29, name:"The Wicker Man",                      year:2006, cat:"DC", imdb:"https://www.imdb.com/title/tt0449006/" },
  { seed:30, name:"The Bye Bye Man",                     year:2017, cat:"DC", imdb:"https://www.imdb.com/title/tt3882082/" },
  { seed:31, name:"Howard the Duck",                     year:1986, cat:"DC", imdb:"https://www.imdb.com/title/tt0091225/" },
  { seed:32, name:"Ballistic: Ecks vs. Sever",           year:2002, cat:"DC", imdb:"https://www.imdb.com/title/tt0247986/" },
];

// R32 matchups (indices into MOVIES):
// Region 1 VG: (1)Annihilation vs (8)Alone, (2)Mario vs (7)Hitman, (3)Dragonball vs (6)Assassin, (4)StreetFighter vs (5)Doom
// Region 2 BB: (1)Battlefield vs (8)Emoji, (2)Cats vs (7)AfterEarth, (3)Movie43 vs (6)Jupiter, (4)Airbender vs (5)F4
// Region 3 EG: (1)Room vs (8)CoolCat, (2)Gigli vs (7)Holmes, (3)LoveGuru vs (6)Master, (4)JackJill vs (5)Superbabies
// Region 4 DC: (1)Troll2 vs (8)Ballistic, (2)SilentNight vs (7)Howard, (3)Birdemic vs (6)ByeBye, (4)Manos vs (5)Wicker
const R1 = [
  [0,7],[1,6],[2,5],[3,4],
  [8,15],[9,14],[10,13],[11,12],
  [16,23],[17,22],[18,21],[19,20],
  [24,31],[25,30],[26,29],[27,28],
];

const RND = ["Round of 32", "Round of 16", "Elite 8", "Final Four", "Championship"];
const TOTAL_PICKS = 31; // 16+8+4+2+1

const DOTS = Array.from({ length: 60 }, () => ({
  w: Math.random() * 2 + 0.4, h: Math.random() * 2 + 0.4,
  op: Math.random() * 0.35 + 0.05, l: Math.random() * 100, t: Math.random() * 100,
  dur: Math.random() * 5 + 3, del: Math.random() * 5,
}));

const loadLS = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const saveLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota exceeded */ } };

const serMatch = (ms) => ms.map(m => ({ p: [m[0], m[1]], w: m.winner || null }));
const desMatch = (ms) => ms.map(({ p, w }) => { const m = [p[0], p[1]]; if (w) m.winner = w; return m; });

export default function App() {
  const mob = useIsMobile();

  const [init] = useState(() => {
    const s = loadLS("bmt-state", null);
    if (!s) return null;
    return { ...s, rds: s.rds.map(r => desMatch(r)) };
  });

  // Bracket state — rds[0] is always initialized from R1
  const [rds, setRds] = useState(() => {
    if (init?.rds?.length) return init.rds;
    return [R1.map(([a, b]) => [MOVIES[a], MOVIES[b]])];
  });
  const [cr, setCr] = useState(() => init?.cr ?? 0);
  const [cm, setCm] = useState(() => init?.cm ?? 0);
  const [ch, setCh] = useState(() => init?.ch || null);
  const [hv, setHv] = useState(null);
  const [an, setAn] = useState(null);
  const [bk, setBk] = useState(false);
  const [fb, setFb] = useState(false);
  const [hi, setHi] = useState(() => init?.hi || []);
  const [upsets, setUpsets] = useState(() => init?.upsets ?? []);
  const [upFlash, setUpFlash] = useState(false);
  const [fact, setFact] = useState(null);
  const [copiedBracket, setCopiedBracket] = useState(false);

  // Notes
  const [notes, setNotes] = useState(() => loadLS("bmt-notes", {}));
  const [showNotes, setShowNotes] = useState(false);

  // Supabase auth
  const [sbUser, setSbUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Persist bracket state to localStorage
  useEffect(() => {
    const serialized = { rds: rds.map(r => serMatch(r)), cr, cm, ch, hi, upsets };
    saveLS("bmt-state", serialized);
  }, [rds, cr, cm, ch, hi, upsets]);

  const updateNote = (seed, text) => {
    const nn = { ...notes, [seed]: text };
    setNotes(nn);
    saveLS("bmt-notes", nn);
  };

  // Manual hash auth — tender-circuit pattern.
  // Read access_token from the URL hash directly, call setSession(), clear hash.
  // This runs before any state-persistence effects so there's no race.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("access_token")) return;
    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) return;
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    supabase.auth.setSession({ access_token, refresh_token }).catch(() => {});
  }, []);

  // Auth state listener — reacts to setSession() above or existing sessions
  useEffect(() => {
    let pulled = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSbUser(session?.user ?? null);
      if (session?.user && !pulled && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        pulled = true;
        pullFromSupabase();
      }
      if (event === "SIGNED_OUT") pulled = false;
    });
    return () => subscription.unsubscribe();
  }, []); // intentional: runs once

  const pullFromSupabase = async () => {
    const { data, error } = await supabase
      .from("bad_movie_bracket").select("notes,state").maybeSingle();
    if (error || !data) return;
    if (data.notes) { setNotes(data.notes); saveLS("bmt-notes", data.notes); }
    if (data.state) {
      const s = data.state;
      try {
        setRds(s.rds.map(r => desMatch(r)));
        setCr(s.cr ?? 0); setCm(s.cm ?? 0);
        setCh(s.ch || null); setHi(s.hi || []); setUpsets(s.upsets || []);
        saveLS("bmt-state", s);
      } catch { /* ignore malformed */ }
    }
  };

  // Auto-push on state change (2s debounce)
  const syncTimerRef = useRef(null);
  useEffect(() => {
    if (!sbUser) return;
    clearTimeout(syncTimerRef.current);
    const serialized = { rds: rds.map(r => serMatch(r)), cr, cm, ch, hi, upsets };
    syncTimerRef.current = setTimeout(async () => {
      setSyncStatus("syncing");
      const { error } = await supabase.from("bad_movie_bracket").upsert({
        user_id: sbUser.id, notes, state: serialized, updated_at: new Date().toISOString(),
      });
      setSyncStatus(error ? "error" : "synced");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }, 2000);
  }, [rds, cr, cm, ch, hi, upsets, notes, sbUser]);

  const mu = rds[cr]?.[cm];
  const prog = ch ? 100 : (hi.length / TOTAL_PICKS) * 100;
  const rl = RND[cr] || "";
  const mn = cm + 1;
  const mt = rds[cr]?.length || 0;
  const ri = cr === 0 ? Math.floor(cm / 4) : -1;
  const rn = ri >= 0 && ri < 4 ? `${REG_EMOJI[ri]} ${REG[ri]}` : "";

  const pick = (w) => {
    const opponent = mu[0].seed === w.seed ? mu[1] : mu[0];
    const isUpset = w.seed > opponent.seed;
    setAn(w.seed);
    if (isUpset) {
      setUpsets(u => [...u, { winner: w, loser: opponent, round: RND[cr] || "", seedDiff: w.seed - opponent.seed }]);
      setUpFlash(true);
      setTimeout(() => setUpFlash(false), 1500);
    }
    setHi(h => [...h, { i: cm, r: cr, wasUpset: isUpset }]);
    setTimeout(() => {
      setAn(null);
      if (FACTS[w.name]) {
        setFact(FACTS[w.name]);
        setTimeout(() => setFact(null), 5500);
      }
      const nr = rds.map((rd, ri2) => rd.map((m, mi) => {
        if (ri2 !== cr || mi !== cm) return m;
        const c = [...m]; c.winner = w; return c;
      }));
      if (cm + 1 >= nr[cr].length) {
        const ws = nr[cr].map(m => m.winner);
        if (ws.length === 1) {
          setCh(w);
        } else {
          const nx = [];
          for (let i = 0; i < ws.length; i += 2) nx.push([ws[i], ws[i + 1]]);
          nr.push(nx); setCr(cr + 1); setCm(0);
        }
      } else {
        setCm(cm + 1);
      }
      setRds(nr);
    }, 320);
  };

  const undo = () => {
    if (!hi.length) return;
    const l = hi[hi.length - 1];
    setHi(hi.slice(0, -1));
    setFact(null);
    if (l.wasUpset) setUpsets(u => u.slice(0, -1));
    if (ch) setCh(null);
    const nr = rds.slice(0, l.r + 1).map((rd, ri2) => rd.map((m, mi) => {
      if (ri2 !== l.r || mi !== l.i) return m;
      const c = [...m]; delete c.winner; return c;
    }));
    setCr(l.r); setCm(l.i); setRds(nr);
  };

  const reset = () => {
    setRds([R1.map(([a, b]) => [MOVIES[a], MOVIES[b]])]);
    setCr(0); setCm(0); setCh(null); setHi([]); setUpsets([]);
    setUpFlash(false); setFact(null); setCopiedBracket(false);
    setBk(false); setFb(false);
    saveLS("bmt-state", null);
  };

  const exportBracket = () => {
    const lines = ["💀 Worst Movie Tournament — My Results", ""];
    rds.forEach((rd, rdIdx) => {
      if (!rd.some(m => m.winner)) return;
      lines.push(RND[rdIdx].toUpperCase());
      rd.forEach((m, mi) => {
        if (m.winner) {
          const loser = m[0].seed === m.winner.seed ? m[1] : m[0];
          const note = rdIdx === 0 ? ` · ${REG_EMOJI[Math.floor(mi / 4)]} ${REG[Math.floor(mi / 4)]}` : "";
          lines.push(`  ${m.winner.name} def. ${loser.name}${note}`);
        }
      });
      lines.push("");
    });
    if (ch) {
      lines.push(`WORST OF THE WORST: ${ch.name} 💀`);
      lines.push(`  Seed #${ch.seed} · ${ch.year}`);
    }
    return lines.join("\n");
  };

  const copyBracket = () => {
    navigator.clipboard.writeText(exportBracket()).then(() => {
      setCopiedBracket(true);
      setTimeout(() => setCopiedBracket(false), 1500);
    }).catch(() => {});
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#080205,#100808 35%,#080808 65%,#080205)", fontFamily:"'Inter',sans-serif", color:"#ede0e0" }}>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <Dots mob={mob} />
      <style>{`
        @keyframes tw{0%,100%{opacity:.15}50%{opacity:.8}}
        @keyframes su{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cb{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}
        @keyframes wg{0%,100%{text-shadow:0 0 20px rgba(239,68,68,.4)}50%{text-shadow:0 0 50px rgba(239,68,68,.8),0 0 80px rgba(239,68,68,.3)}}
        @keyframes ch{0%{transform:scale(1)}40%{transform:scale(1.04)}100%{transform:scale(.98);opacity:.6}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes pp{0%,100%{border-color:rgba(239,68,68,.15)}50%{border-color:rgba(239,68,68,.4)}}
        @keyframes uf{0%{opacity:0;transform:translateY(-8px) scale(.9)}20%{opacity:1;transform:translateY(0) scale(1)}80%{opacity:1}100%{opacity:0}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @media(max-width:600px){
          .mob-btn:active{opacity:.7!important;transform:scale(.97)!important}
          .mob-card:active{transform:scale(.98)!important;opacity:.9!important}
        }
      `}</style>
      <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:mob?"16px 16px 32px":"20px 32px 40px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:mob?20:28 }}>
          <div style={{ fontSize:mob?10:11, letterSpacing:mob?4:6, textTransform:"uppercase", color:"#5a3a3a", marginBottom:mob?4:6 }}>32 Films · 4 Regions · Pure System Failure</div>
          <h1 style={{ fontSize:"clamp(24px,5vw,40px)", fontWeight:800, margin:"0 0 4px", background:"linear-gradient(135deg,#ef4444,#dc2626 45%,#fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Worst Movie Tournament</h1>
          <div style={{ fontSize:mob?12:13, color:"#6a4a4a" }}>Pick the worst. Crown the champion of failure.</div>
        </div>

        {/* Progress bar */}
        <div style={{ background:"rgba(255,255,255,.04)", borderRadius:20, height:mob?6:5, marginBottom:mob?6:6, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${prog}%`, background:"linear-gradient(90deg,#dc2626,#ef4444,#fbbf24)", borderRadius:20, transition:"width .5s" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:mob?12:11, color:"#6a4a4a", marginBottom:mob?10:14 }}>
          <span>{hi.length}/{TOTAL_PICKS} decided</span>
          <span>{rl}{rn ? ` · ${rn}` : ""}</span>
        </div>

        {/* Sync strip */}
        <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:8, marginBottom:mob?8:10, fontSize:mob?12:11, flexWrap:"wrap" }}>
          {sbUser ? (
            <>
              <span style={{ color:"#6a4a4a" }}>
                {syncStatus==="syncing"?"⏳ Syncing...":syncStatus==="synced"?"✓ Synced":syncStatus==="error"?"⚠ Sync error":"☁ Synced"}
                {" "}{sbUser.email}
              </span>
              <button onClick={() => supabase.auth.signOut()} style={{ background:"none", border:"none", color:"#5a3a3a", fontSize:mob?12:11, cursor:"pointer" }}>Sign out</button>
            </>
          ) : (
            <button onClick={() => setShowAuthModal(true)} style={{ background:"none", border:"none", color:"#6a4a4a", fontSize:mob?12:11, cursor:"pointer", letterSpacing:.5 }}>☁ Sync across devices</button>
          )}
        </div>

        {/* Full Bracket + Notes toggles */}
        <div style={{ textAlign:"center", marginBottom:mob?14:16, display:"flex", gap:mob?10:8, justifyContent:"center", flexWrap:"wrap" }}>
          <button className={mob?"mob-btn":""} onClick={() => setFb(!fb)} style={{
            background: fb?"rgba(239,68,68,.1)":"rgba(255,255,255,.04)",
            border: fb?"1px solid rgba(239,68,68,.3)":"1px solid rgba(255,255,255,.07)",
            color: fb?"#ef4444":"#8a6a6a", padding:mob?"10px 18px":"6px 18px", borderRadius:10,
            fontSize:mob?13:12, fontWeight:600, cursor:"pointer", letterSpacing:.5,
            transition:"all .15s", minHeight:mob?48:undefined,
          }}>{fb ? "Hide Bracket" : "📋 Full Bracket"}</button>
          <button className={mob?"mob-btn":""} onClick={() => setShowNotes(!showNotes)} style={{
            background: showNotes?"rgba(251,191,36,.1)":"rgba(255,255,255,.04)",
            border: showNotes?"1px solid rgba(251,191,36,.3)":"1px solid rgba(255,255,255,.07)",
            color: showNotes?"#fbbf24":"#8a6a6a", padding:mob?"10px 18px":"6px 18px", borderRadius:10,
            fontSize:mob?13:12, fontWeight:600, cursor:"pointer", letterSpacing:.5,
            transition:"all .15s", minHeight:mob?48:undefined,
          }}>{showNotes ? "Hide Notes" : "📝 Notes"}</button>
        </div>

        {showNotes && <NotesPanel mob={mob} notes={notes} updateNote={updateNote} />}
        {fb && <FullBracket mob={mob} rds={rds} cr={cr} cm={cm} upsets={upsets} />}

        {/* Champion view */}
        {ch ? (
          <div style={{ textAlign:"center", animation:"su .5s ease-out", padding:mob?"24px 12px":"40px 20px" }}>
            <div style={{ fontSize:mob?42:56, animation:"cb 2s ease-in-out infinite", marginBottom:mob?8:12 }}>💀</div>
            <div style={{ fontSize:mob?12:11, letterSpacing:mob?4:6, textTransform:"uppercase", color:"#ef4444", marginBottom:mob?8:10 }}>Worst of the Worst</div>
            <div style={{ fontSize:"clamp(24px,7vw,46px)", fontWeight:800, color:"#ef4444", animation:"wg 2s ease-in-out infinite", marginBottom:6 }}>{ch.name}</div>
            <div style={{ fontSize:mob?14:14, color:"#7a4a4a" }}>
              {REG_EMOJI[Math.floor((ch.seed - 1) / 8)]} {REG[Math.floor((ch.seed - 1) / 8)]} · {ch.year} · seed #{ch.seed}
            </div>
            {upsets.length > 0 && (
              <div style={{ marginTop:16, fontSize:mob?13:13, color:"#6a4a4a" }}>
                <div>{upsets.length} upset{upsets.length !== 1 ? "s" : ""} (underseeded awfulness)</div>
                {(() => {
                  const big = upsets.reduce((a, b) => b.seedDiff > a.seedDiff ? b : a);
                  return <div style={{ fontSize:mob?11:11, color:"#4a3030", marginTop:4 }}>Biggest: #{big.winner.seed} {big.winner.name} over #{big.loser.seed} {big.loser.name}</div>;
                })()}
              </div>
            )}
            <div style={{ marginTop:mob?24:40, display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              <Btn mob={mob} p onClick={reset}>Run It Back</Btn>
              <Btn mob={mob} onClick={() => setBk(!bk)}>{bk?"Hide":"View"} Bracket</Btn>
              <Btn mob={mob} s mu onClick={copyBracket}>{copiedBracket ? "✓ Copied!" : "📋 Export"}</Btn>
            </div>
            {bk && <BV mob={mob} rds={rds} />}
          </div>

        ) : mu ? (
          <div key={`${cr}-${cm}`} style={{ animation:"su .3s ease-out" }}>
            <div style={{ textAlign:"center", marginBottom:mob?12:16, fontSize:mob?14:13, color:"#7a5a5a" }}>Match {mn} of {mt}</div>
            {mob ? (
              <div style={{ display:"flex", flexDirection:"column", gap:0, alignItems:"center" }}>
                <Card mob m={mu[0]} h={hv===mu[0].seed} a={an===mu[0].seed} d={!!an} onH={setHv} onC={() => pick(mu[0])} notes={notes} updateNote={updateNote} />
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"10px 0", width:"100%" }}>
                  <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(239,68,68,.15))" }} />
                  <span style={{ fontSize:14, fontWeight:800, color:"#4a2a2a", letterSpacing:3 }}>VS</span>
                  <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(239,68,68,.15),transparent)" }} />
                </div>
                <Card mob m={mu[1]} h={hv===mu[1].seed} a={an===mu[1].seed} d={!!an} onH={setHv} onC={() => pick(mu[1])} notes={notes} updateNote={updateNote} />
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0 }}>
                <Card key={mu[0].seed} m={mu[0]} h={hv===mu[0].seed} a={an===mu[0].seed} d={!!an} onH={setHv} onC={() => pick(mu[0])} notes={notes} updateNote={updateNote} />
                <div style={{ padding:"0 22px", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                  <div style={{ width:1, height:32, background:"linear-gradient(180deg,transparent,rgba(239,68,68,.12))" }} />
                  <span style={{ fontSize:13, fontWeight:800, color:"#3a1a1a", letterSpacing:4 }}>VS</span>
                  <div style={{ width:1, height:32, background:"linear-gradient(180deg,rgba(239,68,68,.12),transparent)" }} />
                </div>
                <Card key={mu[1].seed} m={mu[1]} h={hv===mu[1].seed} a={an===mu[1].seed} d={!!an} onH={setHv} onC={() => pick(mu[1])} notes={notes} updateNote={updateNote} />
              </div>
            )}

            {upFlash && (
              <div style={{ textAlign:"center", marginTop:12, animation:"uf 1.5s ease-out forwards" }}>
                <span style={{ display:"inline-block", padding:"4px 14px", borderRadius:20, background:"rgba(251,191,36,.1)", border:"1px solid rgba(251,191,36,.25)", fontSize:mob?12:11, fontWeight:700, color:"#fbbf24", letterSpacing:2, textTransform:"uppercase" }}>⚡ Upset — the deeper cut wins!</span>
              </div>
            )}

            {fact && (
              <div style={{ margin:mob?"14px 0 0":"14px auto 0", maxWidth:mob?undefined:560, padding:"12px 18px", background:"rgba(255,255,255,.03)", borderRadius:12, border:"1px solid rgba(239,68,68,.12)", fontSize:mob?13:13, color:"#9a7a7a", fontStyle:"italic", lineHeight:1.6, animation:"su .3s ease-out" }}>
                🎬 {fact}
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"center", gap:mob?10:10, marginTop:mob?18:22 }}>
              {hi.length > 0 && <Btn mob={mob} s onClick={undo}>← Undo</Btn>}
              <Btn mob={mob} s mu onClick={reset}>Reset</Btn>
              <Btn mob={mob} s mu onClick={() => setBk(!bk)}>{bk?"Hide":"Bracket"}</Btn>
            </div>

            {bk && <BV mob={mob} rds={rds} cr={cr} cm={cm} />}

            {/* Up Next */}
            {!bk && rds[cr] && cm + 1 < rds[cr].length && (
              <div style={{ marginTop:mob?24:30 }}>
                <div style={{ fontSize:mob?11:10, color:"#4a2a2a", marginBottom:mob?8:8, letterSpacing:2.5, textTransform:"uppercase", fontWeight:700 }}>Up Next</div>
                {rds[cr].slice(cm + 1, cm + (mob ? 3 : 5)).map((m, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:mob?"8px 12px":"6px 12px", background:"rgba(255,255,255,.02)", borderRadius:8, fontSize:mob?13:12, marginBottom:mob?4:4 }}>
                    <span style={{ fontWeight:600, color:"#7a5a5a", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m[0].name}</span>
                    <span style={{ fontSize:mob?10:9, color:"#3a2020", letterSpacing:2, margin:"0 8px", flexShrink:0 }}>VS</span>
                    <span style={{ fontWeight:600, color:"#7a5a5a", flex:1, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m[1].name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Card({ m, h, a, d, onH, onC, notes, updateNote, mob }) {
  const c = CLR[m.cat];
  const [showCardNotes, setShowCardNotes] = useState(false);
  const note = notes?.[m.seed] || "";
  const rTop = showCardNotes ? (mob ? "14px 14px 0 0" : "16px 16px 0 0") : (mob ? 14 : 16);

  const cardBg = h
    ? `linear-gradient(135deg,${c.bg} 0%,${c.ac}1a 100%)`
    : `linear-gradient(135deg,${c.bg}f8 0%,${c.bg}dd 100%)`;
  const cardBorder = h ? `1.5px solid ${c.ac}44` : "1.5px solid rgba(255,255,255,.05)";

  return (
    <div style={{
      flex: mob?"1 1 100%":"1 1 320px", maxWidth:mob?undefined:560, width:mob?"100%":undefined,
      background: showCardNotes ? cardBg : "transparent",
      border: showCardNotes ? cardBorder : "none",
      borderRadius: mob?14:16,
      overflow: showCardNotes ? "hidden" : "visible",
      transition: "border-color .18s",
    }}>
      <button className={mob?"mob-card":""} onClick={() => !d && onC()}
        onMouseEnter={mob?undefined:() => onH(m.seed)} onMouseLeave={mob?undefined:() => onH(null)}
        onTouchStart={mob?() => onH(m.seed):undefined} onTouchEnd={mob?() => onH(null):undefined}
        style={{
          width:"100%", padding:0, position:"relative", overflow:"hidden",
          background: showCardNotes ? "transparent" : cardBg,
          border: showCardNotes ? "none" : cardBorder,
          borderRadius: rTop,
          cursor: d?"default":"pointer",
          transition:"all .18s cubic-bezier(.25,.8,.25,1)",
          transform: h&&!a&&!mob?"translateY(-4px)":"none",
          boxShadow: h
            ? `0 ${mob?14:22}px ${mob?36:54}px ${c.gl},inset 0 1px 0 ${c.ac}14`
            : `0 4px ${mob?14:18}px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.03)`,
          animation: a?"ch .35s ease forwards":"none",
          display:"flex", flexDirection:"row", alignItems:"stretch",
          minHeight: mob?90:108, textAlign:"left",
          WebkitTapHighlightColor:"transparent",
        }}>

        {/* Left panel: large faded seed number */}
        <div style={{
          width:mob?62:72, flexShrink:0, position:"relative", overflow:"hidden",
          borderRadius: showCardNotes?(mob?"14px 0 0 0":"16px 0 0 0"):(mob?"14px 0 0 14px":"16px 0 0 16px"),
          background:`${c.ac}08`, borderRight:`1px solid ${c.ac}0c`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <span style={{ fontSize:mob?28:34, fontWeight:900, color:c.ac, opacity:h?.2:.08, lineHeight:1, userSelect:"none", transition:"opacity .18s", fontVariantNumeric:"tabular-nums" }}>{m.seed}</span>
        </div>

        {/* Content */}
        <div style={{ flex:1, padding:mob?"11px 12px 11px 10px":"13px 16px 13px 12px", display:"flex", flexDirection:"column", justifyContent:"center", gap:mob?4:5, minWidth:0 }}>

          {/* Top row: region badge + year + notes dot */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ padding:"1px 7px", borderRadius:20, background:BADGE_CLR[m.cat].bg, color:BADGE_CLR[m.cat].tx, fontSize:9, fontWeight:700, letterSpacing:.4 }}>
              {REG_EMOJI[Math.floor((m.seed - 1) / 8)]} {["VG Crimes","Big Budget","Ego Trip","Deep-Cut"][Math.floor((m.seed - 1) / 8)]}
            </span>
            <span style={{ fontSize:10, color:"#4a3030" }}>{m.year}</span>
            {note && !showCardNotes && <span style={{ width:5, height:5, borderRadius:"50%", background:c.ac, flexShrink:0, marginLeft:2 }} />}
          </div>

          {/* Title */}
          <div style={{
            fontSize: mob?"clamp(14px,4.2vw,19px)":"clamp(14px,1.85vw,19px)",
            fontWeight:800, color:a?`${c.ac}70`:"#ede0e0",
            lineHeight:1.22, letterSpacing:-.2,
            overflow:"hidden", display:"-webkit-box",
            WebkitLineClamp:2, WebkitBoxOrient:"vertical",
            transition:"color .18s",
          }}>{m.name}</div>

          {/* IMDb link */}
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            {m.imdb && (
              <a href={m.imdb} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                style={{ padding:"1px 5px", borderRadius:3, background:"#e5b80010", color:"#c49a00", fontSize:9, fontWeight:700, textDecoration:"none", border:"1px solid #e5b80018", letterSpacing:.3 }}>IMDb ↗</a>
            )}
          </div>

          {mob && <div style={{ fontSize:9, color:c.ac, fontWeight:700, letterSpacing:1.8, textTransform:"uppercase", opacity:.35 }}>Tap to pick worst</div>}
        </div>

        {/* Hover left accent */}
        <div style={{ position:"absolute", left:0, top:"15%", bottom:"15%", width:3, background:`linear-gradient(180deg,transparent,${c.ac}aa,transparent)`, borderRadius:2, opacity:h&&!mob?1:0, transition:"opacity .18s" }} />
        {h&&!mob&&!a && <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:11, color:c.ac, fontWeight:700, letterSpacing:1, opacity:.6 }}>Pick worst →</div>}
      </button>

      <div style={{ textAlign:"center", marginTop:showCardNotes?0:(mob?3:3) }}>
        <button onClick={e => { e.stopPropagation(); setShowCardNotes(!showCardNotes); }} style={{
          background:"transparent", border:"none", color:"#6a4a4a", fontSize:mob?11:10, cursor:"pointer",
          padding:mob?"5px 14px":"2px 8px", letterSpacing:.5, minHeight:mob?32:undefined,
        }}>{showCardNotes ? "hide notes ▲" : "notes ▼"}</button>
      </div>
      {showCardNotes && <CardNotes seed={m.seed} note={note} updateNote={updateNote} ac={c.ac} bg={c.bg} mob={mob} transparent />}
    </div>
  );
}

function AuthModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(null);
  const sendLink = async () => {
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    if (error) {
      setErr(error.status === 429 ? "Too many requests — wait a minute and try again." : error.message);
    } else {
      setSent(true);
    }
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.8)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#120808", border:"1px solid rgba(239,68,68,.15)", borderRadius:16, padding:"28px 24px", maxWidth:380, width:"90%", animation:"su .2s" }}>
        <h3 style={{ color:"#ede0e0", margin:"0 0 8px", fontSize:18 }}>Sync Across Devices</h3>
        {sent ? (
          <p style={{ color:"#7a5a5a", fontSize:14, lineHeight:1.6 }}>Check your email for a magic link. Close this when you're signed in.</p>
        ) : (
          <>
            <p style={{ color:"#7a5a5a", fontSize:13, margin:"0 0 16px", lineHeight:1.6 }}>Enter your email — we'll send a link. Your bracket syncs automatically once you're in.</p>
            {err && <p style={{ color:"#ef4444", fontSize:13, margin:"0 0 12px" }}>{err}</p>}
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter"&&sendLink()} type="email" placeholder="you@example.com"
              style={{ width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.4)", border:"1px solid rgba(239,68,68,.15)", borderRadius:8, padding:"10px 12px", color:"#ede0e0", fontSize:14, outline:"none", marginBottom:16, fontFamily:"inherit" }} />
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <Btn mob={false} s mu onClick={onClose}>Cancel</Btn>
              <Btn mob={false} s onClick={sendLink}>Send Magic Link</Btn>
            </div>
          </>
        )}
        {sent && <div style={{ marginTop:12, textAlign:"right" }}><Btn mob={false} s mu onClick={onClose}>Close</Btn></div>}
      </div>
    </div>
  );
}

function CardNotes({ seed, note, updateNote, ac, bg, mob, transparent }) {
  return (
    <div style={{
      background: transparent ? "transparent" : `linear-gradient(155deg,${bg}ee,${bg}cc)`,
      border: transparent ? "none" : `1px solid ${ac}22`,
      borderTop: "none",
      borderRadius: transparent ? 0 : "0 0 14px 14px",
      padding: mob?"10px 14px 14px":"10px 14px 12px",
    }}>
      <textarea
        value={note}
        onChange={e => updateNote(seed, e.target.value)}
        onClick={e => e.stopPropagation()}
        placeholder="Your thoughts on this disaster..."
        rows={2}
        style={{
          width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.3)", border:"1px solid rgba(255,255,255,.06)",
          borderRadius:8, padding:mob?"8px 10px":"6px 8px", color:"#d0b8b8", fontSize:mob?15:11, fontFamily:"inherit",
          resize:"vertical", outline:"none", lineHeight:1.5,
        }}
        onFocus={e => e.target.style.borderColor=`${ac}44`}
        onBlur={e => e.target.style.borderColor="rgba(255,255,255,.06)"}
      />
    </div>
  );
}

function NotesPanel({ notes, updateNote, mob }) {
  const [filter, setFilter] = useState("");
  const filtered = MOVIES.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div style={{ marginBottom:mob?20:24, padding:mob?16:20, background:"rgba(255,255,255,.02)", borderRadius:mob?14:16, border:"1px solid rgba(239,68,68,.1)", animation:"fi .3s" }}>
      <div style={{ marginBottom:mob?12:14 }}>
        <h3 style={{ fontSize:mob?16:15, fontWeight:700, color:"#ef4444", margin:0, letterSpacing:.5 }}>Movie Notes</h3>
      </div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Search movies..."
        style={{
          width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.2)", border:"1px solid rgba(255,255,255,.05)",
          borderRadius:10, padding:mob?"12px 14px":"8px 12px", color:"#d0b8b8", fontSize:mob?16:12, fontFamily:"inherit",
          outline:"none", marginBottom:mob?12:12,
        }}
        onFocus={e => e.target.style.borderColor="rgba(239,68,68,.3)"}
        onBlur={e => e.target.style.borderColor="rgba(255,255,255,.05)"}
      />
      <div style={{ maxHeight:mob?320:400, overflowY:"auto", paddingRight:4, WebkitOverflowScrolling:"touch" }}>
        {filtered.map(m => {
          const note = notes[m.seed] || "";
          const c = CLR[m.cat];
          return <NoteRow key={m.seed} m={m} note={note} c={c} updateNote={updateNote} mob={mob} />;
        })}
      </div>
    </div>
  );
}

function NoteRow({ m, note, c, updateNote, mob }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom:mob?6:6, background:"rgba(255,255,255,.02)", borderRadius:mob?10:10, border:`1px solid ${note?`${c.ac}16`:"rgba(255,255,255,.03)"}` }}>
      <button onClick={() => setOpen(!open)} style={{
        width:"100%", background:"transparent", border:"none", cursor:"pointer",
        display:"flex", alignItems:"center", gap:mob?8:8, padding:mob?"12px 12px":"8px 12px", textAlign:"left",
        minHeight:mob?48:undefined, WebkitTapHighlightColor:"transparent",
      }}>
        <span style={{ fontSize:mob?10:8, fontWeight:700, color:c.ac, opacity:.5, width:mob?24:24, flexShrink:0 }}>#{m.seed}</span>
        <span style={{ fontSize:mob?14:12, fontWeight:600, color:"#c8a8a8", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.name}</span>
        {!mob && <span style={{ fontSize:9, color:c.tx, opacity:.4 }}>{m.year}</span>}
        {note && <span style={{ width:6, height:6, borderRadius:"50%", background:c.ac, flexShrink:0 }} />}
        <span style={{ fontSize:mob?11:9, color:"#5a3a3a", flexShrink:0 }}>{open?"▲":"▼"}</span>
      </button>
      {open && (
        <div style={{ padding:mob?"0 12px 12px":"0 12px 10px" }}>
          <textarea
            value={note}
            onChange={e => updateNote(m.seed, e.target.value)}
            placeholder={`Thoughts on ${m.name}...`}
            rows={2}
            style={{
              width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.25)", border:"1px solid rgba(255,255,255,.05)",
              borderRadius:8, padding:mob?"8px 10px":"6px 8px", color:"#d0b8b8", fontSize:mob?15:11, fontFamily:"inherit",
              resize:"vertical", outline:"none", lineHeight:1.5,
            }}
            onFocus={e => e.target.style.borderColor=`${c.ac}44`}
            onBlur={e => e.target.style.borderColor="rgba(255,255,255,.05)"}
          />
        </div>
      )}
    </div>
  );
}

function Dots({ mob }) {
  const dots = mob ? DOTS.slice(0, 30) : DOTS;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
      {dots.map((d, i) => (
        <div key={i} style={{
          position:"absolute", width:d.w, height:d.h,
          background:`rgba(239,68,68,${d.op})`, borderRadius:"50%",
          left:`${d.l}%`, top:`${d.t}%`,
          animation:`tw ${d.dur}s ease-in-out infinite`, animationDelay:`${d.del}s`,
        }} />
      ))}
    </div>
  );
}

function Btn({ children, onClick, p, s, mu, mob }) {
  return (
    <button className={mob?"mob-btn":""} onClick={onClick} style={{
      background: p?"linear-gradient(135deg,#dc2626,#b91c1c)":mu?"rgba(255,255,255,.02)":"rgba(255,255,255,.05)",
      border: p?"none":`1px solid rgba(255,255,255,${mu?.05:.08})`,
      color: p?"#fff":mu?"#5a3a3a":"#9a7a7a",
      padding: s?(mob?"10px 18px":"6px 16px"):(mob?"14px 26px":"10px 24px"), borderRadius:10,
      fontSize: s?(mob?13:12):(mob?15:14), fontWeight:p?700:600, cursor:"pointer",
      minHeight:mob?48:undefined, transition:"all .15s", WebkitTapHighlightColor:"transparent",
    }}>{children}</button>
  );
}

function BV({ rds, cr, cm, mob }) {
  return (
    <div style={{ marginTop:mob?20:28, padding:mob?14:16, background:"rgba(255,255,255,.02)", borderRadius:mob?12:14, border:"1px solid rgba(255,255,255,.05)", textAlign:"left", animation:"fi .3s" }}>
      <h3 style={{ fontSize:mob?15:14, fontWeight:700, color:"#8a6a6a", margin:mob?"0 0 12px":"0 0 14px", letterSpacing:1 }}>Bracket Results</h3>
      {rds.map((r, i) => <RB key={i} t={RND[i]} ms={r} cr={cr} cm={cm} ri={i} mob={mob} />)}
    </div>
  );
}

function RB({ t, ms, cr, cm, ri, mob }) {
  return (
    <div style={{ marginBottom:mob?14:16 }}>
      <div style={{ fontSize:mob?11:10, letterSpacing:mob?2:2.5, textTransform:"uppercase", color:"#6a4a4a", marginBottom:mob?6:6, fontWeight:700 }}>{t}</div>
      {ms.map((m, mi) => {
        const w = m.winner, cur = ri===cr&&mi===cm;
        return (
          <div key={mi} style={{ display:"flex", alignItems:"center", gap:mob?6:6, fontSize:mob?13:12, padding:mob?"5px 8px":"3px 8px", borderRadius:6, background:cur?"rgba(239,68,68,.06)":"transparent" }}>
            <MN m={m[0]} w={w} r mob={mob} />
            <span style={{ color:"#2a1515", fontSize:mob?10:9, letterSpacing:1, flexShrink:0 }}>vs</span>
            <MN m={m[1]} w={w} mob={mob} />
          </div>
        );
      })}
    </div>
  );
}

function MN({ m, w, r, mob, upset }) {
  const won = w?.seed === m.seed, lost = w && !won;
  const winColor = upset ? "#fbbf24" : "#ef4444";
  return (
    <span style={{
      color: won?winColor:lost?"#3a2020":"#7a5a5a",
      fontWeight: won?700:400, flex:1,
      textAlign: r?"right":"left",
      textDecoration: lost?"line-through":"none",
      opacity: lost?.4:1,
      overflow: mob?"hidden":undefined,
      textOverflow: mob?"ellipsis":undefined,
      whiteSpace: mob?"nowrap":undefined,
    }}>{m.name}</span>
  );
}

function FullBracket({ rds, cr, cm, mob, upsets }) {
  const r1Played = rds[0] || [];
  const regionStyle = { marginBottom:mob?16:20 };
  const headStyle = { fontSize:mob?12:11, letterSpacing:mob?1.5:2, textTransform:"uppercase", fontWeight:700, marginBottom:mob?8:8, paddingBottom:mob?6:6, borderBottom:"1px solid rgba(255,255,255,.05)" };
  const rowFs = mob ? 13 : 12;
  const rowPad = mob ? "5px 8px" : "4px 8px";
  const rowGap = mob ? 6 : 6;
  const vsFs = mob ? 10 : 9;
  const ellipsis = mob ? { overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } : {};

  return (
    <div style={{ marginBottom:mob?20:28, padding:mob?14:20, background:"rgba(255,255,255,.02)", borderRadius:mob?14:16, border:"1px solid rgba(255,255,255,.05)", animation:"fi .3s" }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", flexWrap:"wrap", gap:8, margin:"0 0 6px" }}>
        <h3 style={{ fontSize:mob?16:16, fontWeight:700, color:"#c8a0a0", margin:0, letterSpacing:.5 }}>Full Bracket</h3>
        {upsets?.length > 0 && <span style={{ fontSize:mob?11:10, color:"#fbbf24", opacity:.8, letterSpacing:1 }}>⚡ {upsets.length} upset{upsets.length!==1?"s":""}</span>}
      </div>
      <div style={{ fontSize:mob?13:12, color:"#5a3a3a", marginBottom:mob?16:20 }}>32 movies · 4 regions · 5 rounds to crown the worst</div>

      {REG.map((regName, regIdx) => {
        // 4 matches per region in R32, starting at regIdx*4
        const r32Matches = R1.slice(regIdx * 4, regIdx * 4 + 4).map(([a, b]) => ({ a: MOVIES[a], b: MOVIES[b] }));
        const played = r1Played.slice(regIdx * 4, regIdx * 4 + 4);
        return (
          <div key={regIdx} style={regionStyle}>
            <div style={{ ...headStyle, color:REG_COLOR[regIdx] }}>{REG_EMOJI[regIdx]} {regName}</div>
            {r32Matches.map((mu2, mi) => {
              const p = played[mi];
              const w = p?.winner;
              const aSeed = mu2.a?.seed;
              const bSeed = mu2.b?.seed;
              const isCurrentMatch = cr===0 && cm===regIdx*4+mi;
              const isUpset = w && w.seed > (w.seed===aSeed ? bSeed : aSeed);
              const winColor = isUpset ? "#fbbf24" : REG_COLOR[regIdx];
              return (
                <div key={mi} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background:isCurrentMatch?"rgba(239,68,68,.06)":"transparent" }}>
                  <span style={{
                    flex:1, textAlign:"right", ...ellipsis,
                    color: w?.seed===aSeed?winColor : w&&w.seed!==aSeed?"#3a2020" : p?"#6a4a4a":"#5a3a3a",
                    fontWeight: w?.seed===aSeed?700:400,
                    textDecoration: w&&w.seed!==aSeed?"line-through":"none",
                    opacity: w&&w.seed!==aSeed?.35:1,
                  }}>{!mob&&aSeed?`#${aSeed} `:""}{mu2.a.name}</span>
                  <span style={{ color:"#2a1515", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span>
                  <span style={{
                    flex:1, ...ellipsis,
                    color: w?.seed===bSeed?winColor : w&&w.seed!==bSeed?"#3a2020" : p?"#6a4a4a":"#5a3a3a",
                    fontWeight: w?.seed===bSeed?700:400,
                    textDecoration: w&&w.seed!==bSeed?"line-through":"none",
                    opacity: w&&w.seed!==bSeed?.35:1,
                  }}>{mu2.b.name}{!mob&&bSeed?` #${bSeed}`:""}</span>
                  {w && <span style={{ fontSize:vsFs, color:isUpset?"#fbbf24":REG_COLOR[regIdx], opacity:.6, marginLeft:2 }}>{isUpset?"⚡":"✓"}</span>}
                </div>
              );
            })}
          </div>
        );
      })}

      {rds.slice(1).map((rd, rdIdx) => {
        const roundNum = rdIdx + 1;
        return (
          <div key={roundNum} style={regionStyle}>
            <div style={{ ...headStyle, color:"#8a6a6a" }}>{RND[roundNum]}</div>
            {rd.map((m, mi) => {
              const w = m.winner;
              const isUpset = w && w.seed > (w.seed===m[0].seed ? m[1] : m[0]).seed;
              const isCur = cr===roundNum && cm===mi;
              return (
                <div key={mi} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background:isCur?"rgba(239,68,68,.06)":"transparent" }}>
                  <MN m={m[0]} w={w} r mob={mob} upset={isUpset&&w?.seed===m[0].seed} />
                  <span style={{ color:"#2a1515", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span>
                  <MN m={m[1]} w={w} mob={mob} upset={isUpset&&w?.seed===m[1].seed} />
                  {w && <span style={{ fontSize:vsFs, color:isUpset?"#fbbf24":"#ef4444", opacity:.5, marginLeft:2 }}>{isUpset?"⚡":"✓"}</span>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
