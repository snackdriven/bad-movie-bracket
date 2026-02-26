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

// Quadrant metadata
const REG = ["Passionate Disasters", "Celebrity Shame", "Comedy Graveyard", "How Did This Get Made"];
const REG_EMOJI = ["💀", "🗑️", "🎬", "🔥"];
// Washed-out cinema poster palette — aged, faded, never neon.
// 💀 Faded crimson  🗑️ Tarnished bronze  🎬 Faded olive  🔥 Dusty slate
const REG_COLOR = ["#c04030", "#b07830", "#7a9850", "#5a7888"];

// Per-quadrant card color schemes. cat = "PD"|"CS"|"CG"|"HM"
const CLR = {
  PD: { bg: "#0d0706", ac: "#9a2818", gl: "rgba(154,40,24,.16)",  tx: "#c85040" },
  CS: { bg: "#0d0a06", ac: "#8a5820", gl: "rgba(138,88,32,.16)",  tx: "#c09040" },
  CG: { bg: "#080c06", ac: "#5a7040", gl: "rgba(90,112,64,.16)",  tx: "#8aaa60" },
  HM: { bg: "#060a0d", ac: "#3a5060", gl: "rgba(58,80,96,.16)",   tx: "#6090a8" },
};
const BADGE_CLR = {
  PD: { bg: "#9a281810", tx: "#c04030" },
  CS: { bg: "#8a582010", tx: "#b07830" },
  CG: { bg: "#5a704010", tx: "#7a9850" },
  HM: { bg: "#3a506010", tx: "#5a7888" },
};

// Bad movie trivia facts
const FACTS = {
  "The Room": "Tommy Wiseau spent $6 million of his own money. The origin of that money has never been explained — he claims it came from importing Korean leather jackets. He has never clarified what happened to the leather jackets.",
  "The Fanatic": "Directed by Fred Durst of Limp Bizkit. John Travolta plays a man who stalks a celebrity. The film earned $3,153 across 52 theaters in its opening weekend. That is not a typo.",
  "Troll 2": "Has no trolls. Only goblins. Filmed in Morgan, Utah with a cast of non-actors. The director didn't speak English and communicated through an interpreter. The child star later made a documentary about its cult revival.",
  "Dragonball Evolution": "Akira Toriyama was so disturbed by this that it motivated him to return to Dragon Ball and create Dragon Ball Super. The film accidentally saved the franchise. The screenwriter later issued a public apology.",
  "Battlefield Earth": "John Travolta spent a decade getting this made. It is filmed entirely in Dutch angles. Every single shot. The cinematographer has said he regrets every frame.",
  "Dungeons & Dragons": "Jeremy Irons read the script, decided it was beneath him, and went absolutely feral anyway. Every actor gave a performance in a completely different genre, as if they'd each read a different script. A direct-to-DVD sequel was made without him and considered better.",
  "The Wicker Man": "Nicolas Cage's most iconic scenes — bees, punching a woman in a bear suit — were largely improvised. He asked to do the bee scene. He also asked to wear the bear suit. The studio let him do both.",
  "Mortal Kombat: Annihilation": "Shot in under 100 days. Most of the returning cast refused to come back, so their characters were killed off in the first five minutes. This is how the franchise handled recasting.",
  "Cats": "Universal sent a patch to correct unfinished visual effects in digital rental versions after theatrical prints shipped incomplete. The 'butthole cut' — anatomically correct cats — remains unconfirmed but not officially denied.",
  "Catwoman": "Halle Berry accepted her Razzie Award in person, holding her Oscar in the same hand. She called the film 'god-awful.' Her speech is considered the most gracious Razzie acceptance in the award's history.",
  "Daredevil": "Ben Affleck has said he took this role to afford a house. He later took the Batman role specifically to have a version of himself that wasn't defined by Daredevil. He met Jennifer Garner on set.",
  "Elektra": "Jennifer Garner committed to this sequel before the Daredevil reviews were in. She and Affleck married during production. The film killed Marvel's deal with Fox for several years.",
  "Glitter": "Released September 21, 2001 — ten days after September 11. The studio released it anyway. No one came. Mariah Carey had a public breakdown and checked into a hospital. She has since described the film as a 'sad movie' about a dark period.",
  "From Justin to Kelly": "Kelly Clarkson won American Idol in September 2002. By June 2003 she was starring in a movie she had contractually agreed to before anyone knew she'd win. She has never discussed it beyond saying she didn't enjoy it.",
  "Showgirls": "Paul Verhoeven and Elizabeth Berkley both believed they were making a serious film about the exploitation of women. The NC-17 rating was a bold artistic statement. It won seven Razzies and became a cult classic that relaunched Berkley's public profile.",
  "Barb Wire": "Pamela Anderson plays a character explicitly compared to Humphrey Bogart's Rick Blaine from Casablanca. This comparison is in the screenplay. The film is an unlicensed Casablanca adaptation set in a dystopia. No one has explained why.",
  "Jack and Jill": "Won a record 10 Razzie Awards in one night — every category, including Adam Sandler winning both Worst Actor and Worst Actress for the same film. The record stands.",
  "Freddy Got Fingered": "Tom Green wrote, directed, starred, and composed the soundtrack. Drew Barrymore supported his vision. They divorced shortly after filming. The film won five Razzies including Worst Picture.",
  "The Master of Disguise": "Dana Carvey's own production company financed this. He has publicly said he wishes he could unmake it. The turtle club scene exists without explanation.",
  "The Cat in the Hat": "Mike Myers' performance was so unsettling that Dr. Seuss's widow permanently banned live-action adaptations of her husband's work. The Grinch remake had to be animated. Myers has appeared in six films since.",
  "Kazaam": "Shaquille O'Neal plays a genie who raps. He was also playing in the NBA Finals that same year. His production company developed the concept. At the time he was arguably the most famous athlete in the world.",
  "Chairman of the Board": "Carrot Top plays an inventor who inherits a company from a man he met on a beach. Cost $10 million. Made $279,000 in theaters. Carrot Top became a successful Las Vegas performer and never discusses this film.",
  "Movie 43": "Each director personally begged their famous friends to appear. The result proves that friendship has limits and that no one read the full script before agreeing.",
  "The Emoji Movie": "Sony greenlit this instead of Spider-Man: Into the Spider-Verse, which they were simultaneously delaying. Both films came out within a year of each other. Only one won an Oscar.",
  "Theodore Rex": "Whoopi Goldberg tried to exit and was sued. She lost. The buddy-cop movie with a talking T-Rex cost $35 million and made $657,000 — one of the worst box office return rates in film history.",
  "Howard the Duck": "Cost $37 million in 1986 — one of the most expensive films ever made at that point. George Lucas executive produced it. The film implies Howard and a human woman are romantically compatible. Lucas has not elaborated.",
  "Gigli": "The tabloid coverage of Affleck and Lopez was so overwhelming the film had no chance of a fair review. Critics noted this and then reviewed it anyway. It is genuinely very bad independent of the coverage.",
  "Swept Away": "Directed by Guy Ritchie. Starred his wife Madonna. Critics observed that casting your spouse as a character who falls in love with you might compromise objectivity. They divorced six years later.",
  "Super Mario Bros.": "Bob Hoskins called it the worst thing he ever made and spent the rest of his career carefully vetting scripts. Dennis Hopper described his experience as 'confusing.' John Leguizamo broke his wrist on set and filmed through it.",
  "Congo": "Based on a Michael Crichton novel. Features a gorilla named Amy who communicates via a glove that translates her signs into speech, voiced by Tim Curry. The gorilla suit cost approximately $1 million. Curry is in the film for about twelve minutes.",
  "Batman & Robin": "Joel Schumacher apologized publicly and repeatedly. He said the studio demanded toy-friendly content. The Batsuit nipples were his decision. He apologized for that separately.",
  "Silent Night, Deadly Night Part 2": "Roughly half the runtime is flashback footage from the first film. The 'Garbage Day!' scene has more YouTube views than the film had viewers in its entire theatrical run.",
};

const MOVIES = [
  // 💀 Quadrant 1: Passionate Disasters
  { seed:1,  name:"The Room",                          year:2003, cat:"PD", imdb:"https://www.imdb.com/title/tt0368226/" },
  { seed:2,  name:"The Fanatic",                       year:2019, cat:"PD", imdb:"https://www.imdb.com/title/tt8045160/" },
  { seed:3,  name:"Troll 2",                           year:1990, cat:"PD", imdb:"https://www.imdb.com/title/tt0100516/" },
  { seed:4,  name:"Dragonball Evolution",              year:2009, cat:"PD", imdb:"https://www.imdb.com/title/tt1098016/" },
  { seed:5,  name:"Battlefield Earth",                 year:2000, cat:"PD", imdb:"https://www.imdb.com/title/tt0185183/" },
  { seed:6,  name:"Dungeons & Dragons",                year:2000, cat:"PD", imdb:"https://www.imdb.com/title/tt0190374/" },
  { seed:7,  name:"The Wicker Man",                    year:2006, cat:"PD", imdb:"https://www.imdb.com/title/tt0449006/" },
  { seed:8,  name:"Mortal Kombat: Annihilation",       year:1997, cat:"PD", imdb:"https://www.imdb.com/title/tt0119013/" },
  // 🗑️ Quadrant 2: Celebrity Shame
  { seed:9,  name:"Cats",                              year:2019, cat:"CS", imdb:"https://www.imdb.com/title/tt5697572/" },
  { seed:10, name:"Catwoman",                          year:2004, cat:"CS", imdb:"https://www.imdb.com/title/tt0327554/" },
  { seed:11, name:"Daredevil",                         year:2003, cat:"CS", imdb:"https://www.imdb.com/title/tt0287978/" },
  { seed:12, name:"Elektra",                           year:2005, cat:"CS", imdb:"https://www.imdb.com/title/tt0357277/" },
  { seed:13, name:"Glitter",                           year:2001, cat:"CS", imdb:"https://www.imdb.com/title/tt0248978/" },
  { seed:14, name:"From Justin to Kelly",              year:2003, cat:"CS", imdb:"https://www.imdb.com/title/tt0349903/" },
  { seed:15, name:"Showgirls",                         year:1995, cat:"CS", imdb:"https://www.imdb.com/title/tt0114436/" },
  { seed:16, name:"Barb Wire",                         year:1996, cat:"CS", imdb:"https://www.imdb.com/title/tt0115685/" },
  // 🎬 Quadrant 3: Comedy Graveyard
  { seed:17, name:"Jack and Jill",                     year:2011, cat:"CG", imdb:"https://www.imdb.com/title/tt1611224/" },
  { seed:18, name:"Freddy Got Fingered",               year:2001, cat:"CG", imdb:"https://www.imdb.com/title/tt0240515/" },
  { seed:19, name:"The Master of Disguise",            year:2002, cat:"CG", imdb:"https://www.imdb.com/title/tt0295462/" },
  { seed:20, name:"The Cat in the Hat",                year:2003, cat:"CG", imdb:"https://www.imdb.com/title/tt0285296/" },
  { seed:21, name:"Kazaam",                            year:1996, cat:"CG", imdb:"https://www.imdb.com/title/tt0116905/" },
  { seed:22, name:"Chairman of the Board",             year:1998, cat:"CG", imdb:"https://www.imdb.com/title/tt0120502/" },
  { seed:23, name:"Movie 43",                          year:2013, cat:"CG", imdb:"https://www.imdb.com/title/tt1333125/" },
  { seed:24, name:"The Emoji Movie",                   year:2017, cat:"CG", imdb:"https://www.imdb.com/title/tt4877122/" },
  // 🔥 Quadrant 4: How Did This Get Made
  { seed:25, name:"Theodore Rex",                      year:1995, cat:"HM", imdb:"https://www.imdb.com/title/tt0114681/" },
  { seed:26, name:"Howard the Duck",                   year:1986, cat:"HM", imdb:"https://www.imdb.com/title/tt0091225/" },
  { seed:27, name:"Gigli",                             year:2003, cat:"HM", imdb:"https://www.imdb.com/title/tt0299930/" },
  { seed:28, name:"Swept Away",                        year:2002, cat:"HM", imdb:"https://www.imdb.com/title/tt0312380/" },
  { seed:29, name:"Super Mario Bros.",                 year:1993, cat:"HM", imdb:"https://www.imdb.com/title/tt0108255/" },
  { seed:30, name:"Congo",                             year:1995, cat:"HM", imdb:"https://www.imdb.com/title/tt0112715/" },
  { seed:31, name:"Batman & Robin",                    year:1997, cat:"HM", imdb:"https://www.imdb.com/title/tt0118688/" },
  { seed:32, name:"Silent Night, Deadly Night Part 2", year:1987, cat:"HM", imdb:"https://www.imdb.com/title/tt0092067/" },
];

// R32 matchups (indices into MOVIES) — as seeded by the quadrant theme:
// Q1 PD: Room vs Fanatic, Troll2 vs Dragonball, Battlefield vs D&D, WickerMan vs MK:A
// Q2 CS: Cats vs Catwoman, Daredevil vs Elektra, Glitter vs FromJustinToKelly, Showgirls vs BarbWire
// Q3 CG: JackAndJill vs FreddyGotFingered, MasterOfDisguise vs CatInTheHat, Kazaam vs Chairman, Movie43 vs EmojiMovie
// Q4 HM: TheodoreRex vs Howard, Gigli vs SweptAway, SuperMario vs Congo, Batman&Robin vs SilentNight2
const R1 = [
  [0,1],[2,3],[4,5],[6,7],
  [8,9],[10,11],[12,13],[14,15],
  [16,17],[18,19],[20,21],[22,23],
  [24,25],[26,27],[28,29],[30,31],
];

// Per-movie metadata: runtime, IMDb rating, hover plot blurb
const MOVIE_META = {
  1:  { runtime:"99 min",  rating:"3.7", plot:"A San Francisco banker's life unravels when his fiancée seduces his best friend. Wiseau wrote, directed, produced, and starred in what he insists was always a dark comedy.", poster:"https://image.tmdb.org/t/p/w185/9QscHN4pXj6Ja1k7e1ZT4vWDGnr.jpg" },
  2:  { runtime:"88 min",  rating:"2.5", plot:"An obsessive fan stalks his favorite action star. Fred Durst of Limp Bizkit wrote and directed. John Travolta's performance exists in a category of its own.", poster:"https://upload.wikimedia.org/wikipedia/en/4/41/The_Fanatic_-_release_poster.jpg" },
  3:  { runtime:"95 min",  rating:"2.9", plot:"A family on vacation discovers the locals are goblins who want to turn them into plants. Contains no trolls. The director spoke no English during filming.", poster:"https://image.tmdb.org/t/p/w185/uS1rDgMojgQ8QA5tu8jUt20o1KR.jpg" },
  4:  { runtime:"85 min",  rating:"2.7", plot:"Goku must gather the Dragon Balls before Lord Piccolo destroys the world. The adaptation so offended the creator that he returned to the franchise to correct the damage.", poster:"https://upload.wikimedia.org/wikipedia/en/b/bf/Dragonball_Evolution_%282009_film%29.jpg" },
  5:  { runtime:"118 min", rating:"2.5", plot:"In 3000 AD, humanity is enslaved by alien Psychlos. Travolta's decade-long passion project — filmed entirely in Dutch angles. Every single shot.", poster:"https://image.tmdb.org/t/p/w185/wXCRuBHdJ5aTFQdsuGJFXNdo79T.jpg" },
  6:  { runtime:"107 min", rating:"3.7", plot:"A thief and his friends seek a magic rod to save their kingdom. Jeremy Irons read the script, decided it was beneath him, and went feral anyway.", poster:"https://image.tmdb.org/t/p/w185/tLCsyHLHhTbzKzsL3IcBNyDKlZm.jpg" },
  7:  { runtime:"102 min", rating:"3.7", plot:"A cop travels to a remote island to investigate a missing girl. Cage improvised the bee scene, the bear suit scene, and several other moments that have since defined a genre of meme.", poster:"https://upload.wikimedia.org/wikipedia/en/f/fa/Wicker-man-poster.jpg" },
  8:  { runtime:"95 min",  rating:"3.5", plot:"Earth's warriors fight Outworld emperor Shao Kahn. Most of the original cast refused to return, so their characters die in the opening scene.", poster:"https://image.tmdb.org/t/p/w185/tUzF2S15iX4Hn6ikbFX1YP3SDEQ.jpg" },
  9:  { runtime:"110 min", rating:"2.7", plot:"A tribe of cats compete to ascend to the Heaviside Layer. Digital fur technology. Universal had to patch the effects after theatrical prints shipped incomplete.", poster:"https://image.tmdb.org/t/p/w185/aCNch5FmzT2WaUcY44925owIZXY.jpg" },
  10: { runtime:"104 min", rating:"3.3", plot:"A shy woman reborn with cat powers fights crime. Halle Berry accepted her Razzie in person, Oscar in hand, calling it 'a piece of shit, god-awful movie.'", poster:"https://image.tmdb.org/t/p/w185/pvnPgukFyEKgCzyOxyLiwyZ8T1C.jpg" },
  11: { runtime:"103 min", rating:"5.3", plot:"A blind lawyer moonlights as a masked vigilante. Affleck took the role to afford a house. He later took the Batman role specifically to replace this memory.", poster:"https://image.tmdb.org/t/p/w185/oCDBwSkntYamuw8VJIxMRCtDBmi.jpg" },
  12: { runtime:"97 min",  rating:"4.9", plot:"An assassin hired to kill a father and daughter reconsiders. Garner committed to this sequel before the Daredevil reviews were in. She married Affleck during production.", poster:"https://image.tmdb.org/t/p/w185/Z4dAOxjAHTUZO6DJ2WVAsxzwe3.jpg" },
  13: { runtime:"104 min", rating:"2.2", plot:"A young singer rises to fame in New York. Released September 21, 2001 — ten days after the attacks. The studio released it anyway. No one came.", poster:"https://image.tmdb.org/t/p/w185/9VMV98Hy9YX3fKQ3LHpAgpFd8jF.jpg" },
  14: { runtime:"81 min",  rating:"2.4", plot:"Two young people fall in love on spring break in Miami. Clarkson had signed the contract before anyone knew she'd win American Idol. She has never discussed it.", poster:"https://image.tmdb.org/t/p/w185/pE5anFf7nf6ah7V3VRezQ1KSovi.jpg" },
  15: { runtime:"128 min", rating:"4.4", plot:"A drifter works her way from stripper to showgirl in Las Vegas. Verhoeven and Berkley believed they were making a serious film. Seven Razzies. Later: cult classic.", poster:"https://image.tmdb.org/t/p/w185/o4HT3Ap5c99W4FYpdXUtTvxGgPc.jpg" },
  16: { runtime:"99 min",  rating:"4.1", plot:"A nightclub owner in a fascist future America aids the resistance. It is an unlicensed Casablanca adaptation set in a dystopia. This was intentional.", poster:"https://image.tmdb.org/t/p/w185/hU2XeckncHS61TWZKDtw1BrKmOO.jpg" },
  17: { runtime:"91 min",  rating:"3.4", plot:"A man dreads his twin sister's Thanksgiving visit. Won all ten Razzie Awards in one night, including Sandler winning Worst Actor and Worst Actress for the same performance.", poster:"https://image.tmdb.org/t/p/w185/qv8deK0ZmutAuEpejruQKApIy6r.jpg" },
  18: { runtime:"87 min",  rating:"4.4", plot:"An aspiring animator moves home and creates chaos. Green wrote, directed, starred, and composed the score. He was dating Drew Barrymore. They divorced shortly after filming.", poster:"https://image.tmdb.org/t/p/w185/gVmSZgxiT7ynyRLsEgg8Xs8ZVWX.jpg" },
  19: { runtime:"80 min",  rating:"2.5", plot:"A man discovers he descends from master disguisers and must rescue his father. Dana Carvey's company financed it. He has since said he wishes he could unmake it.", poster:"https://upload.wikimedia.org/wikipedia/en/c/c0/Masterdisguise.jpg" },
  20: { runtime:"82 min",  rating:"3.9", plot:"A tall cat visits two bored children and unleashes chaos. Myers' performance disturbed Dr. Seuss's widow enough to permanently ban live-action adaptations of her husband's work.", poster:"https://image.tmdb.org/t/p/w185/uYYLz67e5xEQMsY858VSSCDsLU6.jpg" },
  21: { runtime:"93 min",  rating:"3.1", plot:"A troubled kid accidentally frees a genie from a boombox. Shaquille O'Neal developed the concept. He was also in the NBA Finals that year.", poster:"https://image.tmdb.org/t/p/w185/lBxY8znsRoqa9Dy2NCe8I6GPsRm.jpg" },
  22: { runtime:"95 min",  rating:"3.7", plot:"A lovable inventor inherits a corporation from a man he met on a beach. Carrot Top stars. Cost $10 million, made $279,000. Carrot Top is now a successful Las Vegas performer.", poster:"https://image.tmdb.org/t/p/w185/1KkhXdaDZm0pJko0g6QmRcuDZ8t.jpg" },
  23: { runtime:"94 min",  rating:"4.3", plot:"Interconnected comedy shorts featuring Hollywood stars. Each director personally begged their famous friends to appear. The result proves that friendship has limits.", poster:"https://image.tmdb.org/t/p/w185/uYa06GxHsCsELx9vOQ11vsT0Aa6.jpg" },
  24: { runtime:"86 min",  rating:"3.2", plot:"A multi-expressional emoji goes on a journey inside a smartphone. Sony chose this over Spider-Man: Into the Spider-Verse. The Spider-Verse won an Oscar.", poster:"https://image.tmdb.org/t/p/w185/60bTx5z9zL1AqCjZ0gmWoRMJ6Bb.jpg" },
  25: { runtime:"92 min",  rating:"3.2", plot:"A detective is reluctantly partnered with a talking T-Rex to solve murders. Whoopi Goldberg tried to quit, was sued, and lost. Cost $35M. Made $657K.", poster:"https://image.tmdb.org/t/p/w185/whz4bwvqE1OmQHIyqHdZD8jU9CO.jpg" },
  26: { runtime:"110 min", rating:"4.6", plot:"A duck from outer space helps a rock band stop an alien invasion. George Lucas executive produced. The film implies Howard and a human woman are romantically compatible. Lucas has not elaborated.", poster:"https://image.tmdb.org/t/p/w185/eU0dWo8PJgsSAZFbcyHiUpuLSyW.jpg" },
  27: { runtime:"121 min", rating:"2.4", plot:"A mobster kidnaps a prosecutor's brother and receives an unwanted partner. The Bennifer tabloid coverage meant critics had made up their minds before seeing a single frame.", poster:"https://image.tmdb.org/t/p/w185/qOhAK3WDqdeVTIE59loXvEGU7Lu.jpg" },
  28: { runtime:"89 min",  rating:"3.3", plot:"A spoiled woman and a deckhand are stranded on a deserted island. Directed by Guy Ritchie. Starred his wife, Madonna. They divorced six years later.", poster:"https://image.tmdb.org/t/p/w185/z1eAX53ur7LLZmXr0rD8qIdxYvG.jpg" },
  29: { runtime:"104 min", rating:"3.9", plot:"Two plumbers travel to a parallel universe to rescue a princess from a lizard-human king. Bob Hoskins called it the worst thing he ever made.", poster:"https://image.tmdb.org/t/p/w185/yt5bbMfKpg1nRr4k5edxs7tPK2m.jpg" },
  30: { runtime:"109 min", rating:"5.2", plot:"Explorers seek diamonds guarded by killer apes in the Congo. Tim Curry voices a gorilla via a glove that translates sign language. The gorilla suit cost approximately $1 million.", poster:"https://image.tmdb.org/t/p/w185/hPNSToNIIpRO6y5Rh973leqQqNr.jpg" },
  31: { runtime:"125 min", rating:"3.8", plot:"Batman and Robin fight Mr. Freeze, Poison Ivy, and Bane. Schumacher apologized publicly and repeatedly. The Batsuit nipples were his decision. He apologized for that separately.", poster:"https://image.tmdb.org/t/p/w185/i7hEUpDuMN2LOrCEifFyGSHZQSY.jpg" },
  32: { runtime:"88 min",  rating:"3.9", plot:"A killer's brother continues the Christmas rampage. Half the runtime is footage from the first film. 'Garbage Day!' has more YouTube views than the film had theatrical viewers.", poster:"https://image.tmdb.org/t/p/w185/41XxSsJc5OrulP0m7TrrUeO2hoz.jpg" },
};

const RND = ["Round of 32", "Round of 16", "Elite 8", "Final Four", "Championship"];
const TOTAL_PICKS = 31; // 16+8+4+2+1
const STATE_VERSION = 2; // increment when movie list changes to bust old localStorage

// Film grain — monochromatic aged cream, like projector dust on an old print
const DOTS = Array.from({ length: 55 }, () => ({
  w: Math.random() * 1.2 + 0.2, h: Math.random() * 1.2 + 0.2,
  op: Math.random() * 0.10 + 0.02, l: Math.random() * 100, t: Math.random() * 100,
  dur: Math.random() * 9 + 5, del: Math.random() * 9,
  color: "#d4ccba",
}));

const loadLS = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const saveLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota exceeded */ } };

const serMatch = (ms) => ms.map(m => ({ p: [m[0], m[1]], w: m.winner || null }));
const desMatch = (ms) => ms.map(({ p, w }) => { const m = [p[0], p[1]]; if (w) m.winner = w; return m; });

export default function App() {
  const mob = useIsMobile();

  const [init] = useState(() => {
    const s = loadLS("bmt-state", null);
    if (!s || s.v !== STATE_VERSION) return null;
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
    const serialized = { v: STATE_VERSION, rds: rds.map(r => serMatch(r)), cr, cm, ch, hi, upsets };
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

  // Easter egg: press ? to open the repo
  useEffect(() => {
    const h = e => { if (e.key === "?" && !e.target.closest("input,textarea")) window.open("https://github.com/snackdriven/bad-movie-bracket", "_blank"); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
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
    const serialized = { v: STATE_VERSION, rds: rds.map(r => serMatch(r)), cr, cm, ch, hi, upsets };
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
    <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#0d0b09,#120e0a 35%,#0f0c09 65%,#0d0b09)", fontFamily:"'Barlow','Helvetica Neue',sans-serif", color:"#d4ccba" }}>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <Dots mob={mob} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        @keyframes tw{0%,100%{opacity:.04}50%{opacity:.9}}
        @keyframes su{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cb{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-12px) rotate(3deg)}}
        @keyframes wg{0%,100%{text-shadow:0 0 20px rgba(192,48,32,.4),0 0 40px rgba(160,120,24,.1)}50%{text-shadow:0 0 44px rgba(192,48,32,.8),0 0 80px rgba(160,120,24,.25)}}
        @keyframes ch{0%{transform:scale(1)}40%{transform:scale(1.04)}100%{transform:scale(.98);opacity:.6}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes pp{0%,100%{border-color:rgba(192,48,32,.12)}50%{border-color:rgba(192,48,32,.38)}}
        @keyframes uf{0%{opacity:0;transform:translateY(-8px) scale(.9)}20%{opacity:1;transform:translateY(0) scale(1)}80%{opacity:1}100%{opacity:0}}
        @keyframes flicker{0%,100%{opacity:1}92%{opacity:.94}96%{opacity:.98}}
        @media(max-width:600px){
          .mob-btn:active{opacity:.7!important;transform:scale(.97)!important}
          .mob-card:active{transform:scale(.98)!important;opacity:.9!important}
        }
      `}</style>
      <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:mob?"16px 16px 32px":"20px 32px 40px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:mob?20:28 }}>
          <div style={{ fontSize:mob?10:11, letterSpacing:mob?4:6, textTransform:"uppercase", color:"#6a5a48", marginBottom:mob?4:6 }}>32 Films · 4 Quadrants · Pure System Failure</div>
          <h1 style={{ fontSize:"clamp(28px,7vw,62px)", fontWeight:400, margin:"0 0 4px", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.06em", background:"linear-gradient(135deg,#c83020 0%,#a02818 45%,#b07818 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Worst Movie Tournament</h1>
          <div style={{ fontSize:mob?12:13, color:"#6a5a48", letterSpacing:.3 }}>Pick the worst. Crown the champion of failure.</div>
        </div>

        {/* Progress bar */}
        <div style={{ background:"rgba(255,255,255,.04)", borderRadius:20, height:mob?6:5, marginBottom:mob?6:6, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${prog}%`, background:"linear-gradient(90deg,#c03020,#8a5820,#a07818)", borderRadius:20, transition:"width .5s" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:mob?12:11, color:"#7a6a58", marginBottom:mob?10:14 }}>
          <span>{hi.length}/{TOTAL_PICKS} decided</span>
          <span>{rl}{rn ? ` · ${rn}` : ""}</span>
        </div>

        {/* Sync strip */}
        <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:8, marginBottom:mob?8:10, fontSize:mob?12:11, flexWrap:"wrap" }}>
          {sbUser ? (
            <>
              <span style={{ color:"#7a6a58" }}>
                {syncStatus==="syncing"?"⏳ Syncing...":syncStatus==="synced"?"✓ Synced":syncStatus==="error"?"⚠ Sync error":"☁ Synced"}
                {" "}{sbUser.email}
              </span>
              <button onClick={() => supabase.auth.signOut()} style={{ background:"none", border:"none", color:"#6a5a48", fontSize:mob?12:11, cursor:"pointer" }}>Sign out</button>
            </>
          ) : (
            <button onClick={() => setShowAuthModal(true)} style={{ background:"none", border:"none", color:"#7a6a58", fontSize:mob?12:11, cursor:"pointer", letterSpacing:.5 }}>☁ Sync across devices</button>
          )}
        </div>

        {/* Full Bracket + Notes toggles */}
        <div style={{ textAlign:"center", marginBottom:mob?14:16, display:"flex", gap:mob?10:8, justifyContent:"center", flexWrap:"wrap" }}>
          <button className={mob?"mob-btn":""} onClick={() => setFb(!fb)} style={{
            background: fb?"rgba(192,48,32,.1)":"rgba(255,255,255,.04)",
            border: fb?"1px solid rgba(192,48,32,.3)":"1px solid rgba(255,255,255,.07)",
            color: fb?"#c03020":"#6a5a48", padding:mob?"10px 18px":"6px 18px", borderRadius:10,
            fontSize:mob?13:12, fontWeight:600, cursor:"pointer", letterSpacing:.5,
            transition:"all .15s", minHeight:mob?48:undefined,
          }}>{fb ? "Hide Bracket" : "📋 Full Bracket"}</button>
          <button className={mob?"mob-btn":""} onClick={() => setShowNotes(!showNotes)} style={{
            background: showNotes?"rgba(160,120,24,.1)":"rgba(255,255,255,.04)",
            border: showNotes?"1px solid rgba(160,120,24,.3)":"1px solid rgba(255,255,255,.07)",
            color: showNotes?"#a07818":"#6a5a48", padding:mob?"10px 18px":"6px 18px", borderRadius:10,
            fontSize:mob?13:12, fontWeight:600, cursor:"pointer", letterSpacing:.5,
            transition:"all .15s", minHeight:mob?48:undefined,
          }}>{showNotes ? "Hide Notes" : "📝 Notes"}</button>
        </div>

        {showNotes && <NotesPanel mob={mob} notes={notes} updateNote={updateNote} movieMeta={MOVIE_META} />}
        {fb && <FullBracket mob={mob} rds={rds} cr={cr} cm={cm} upsets={upsets} />}

        {/* Champion view */}
        {ch ? (
          <div style={{ textAlign:"center", animation:"su .5s ease-out", padding:mob?"24px 12px":"40px 20px" }}>
            <div style={{ fontSize:mob?42:56, animation:"cb 2s ease-in-out infinite", marginBottom:mob?8:12 }}>💀</div>
            <div style={{ fontSize:mob?12:11, letterSpacing:mob?4:6, textTransform:"uppercase", color:"#c03020", marginBottom:mob?8:10 }}>Worst of the Worst</div>
            <div style={{ fontSize:"clamp(28px,7vw,52px)", fontWeight:400, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.04em", color:"#c03020", animation:"wg 2s ease-in-out infinite", marginBottom:6 }}>{ch.name}</div>
            <div style={{ fontSize:mob?14:14, color:"#5a4838" }}>
              {REG_EMOJI[Math.floor((ch.seed - 1) / 8)]} {REG[Math.floor((ch.seed - 1) / 8)]} · {ch.year} · seed #{ch.seed}
            </div>
            {upsets.length > 0 && (
              <div style={{ marginTop:16, fontSize:mob?13:13, color:"#7a6a58" }}>
                <div>{upsets.length} upset{upsets.length !== 1 ? "s" : ""} (underseeded awfulness)</div>
                {(() => {
                  const big = upsets.reduce((a, b) => b.seedDiff > a.seedDiff ? b : a);
                  return <div style={{ fontSize:mob?11:11, color:"#6a5a48", marginTop:4 }}>Biggest: #{big.winner.seed} {big.winner.name} over #{big.loser.seed} {big.loser.name}</div>;
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
            <div style={{ textAlign:"center", marginBottom:mob?12:16, fontSize:mob?14:13, color:"#5a4838" }}>Match {mn} of {mt}</div>
            {mob ? (
              <div style={{ display:"flex", flexDirection:"column", gap:0, alignItems:"center" }}>
                <Card mob m={mu[0]} h={hv===mu[0].seed} a={an===mu[0].seed} d={!!an} onH={setHv} onC={() => pick(mu[0])} notes={notes} updateNote={updateNote} movieMeta={MOVIE_META} />
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"10px 0", width:"100%" }}>
                  <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(192,48,32,.15))" }} />
                  <span style={{ fontSize:14, fontWeight:800, color:"#6a5a48", letterSpacing:3 }}>VS</span>
                  <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(192,48,32,.15),transparent)" }} />
                </div>
                <Card mob m={mu[1]} h={hv===mu[1].seed} a={an===mu[1].seed} d={!!an} onH={setHv} onC={() => pick(mu[1])} notes={notes} updateNote={updateNote} movieMeta={MOVIE_META} />
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0 }}>
                <Card key={mu[0].seed} m={mu[0]} h={hv===mu[0].seed} a={an===mu[0].seed} d={!!an} onH={setHv} onC={() => pick(mu[0])} notes={notes} updateNote={updateNote} movieMeta={MOVIE_META} />
                <div style={{ padding:"0 22px", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                  <div style={{ width:1, height:32, background:"linear-gradient(180deg,transparent,rgba(192,48,32,.12))" }} />
                  <span style={{ fontSize:13, fontWeight:800, color:"#6a5a48", letterSpacing:4 }}>VS</span>
                  <div style={{ width:1, height:32, background:"linear-gradient(180deg,rgba(192,48,32,.12),transparent)" }} />
                </div>
                <Card key={mu[1].seed} m={mu[1]} h={hv===mu[1].seed} a={an===mu[1].seed} d={!!an} onH={setHv} onC={() => pick(mu[1])} notes={notes} updateNote={updateNote} movieMeta={MOVIE_META} />
              </div>
            )}

            {upFlash && (
              <div style={{ textAlign:"center", marginTop:12, animation:"uf 1.5s ease-out forwards" }}>
                <span style={{ display:"inline-block", padding:"4px 14px", borderRadius:20, background:"rgba(160,120,24,.1)", border:"1px solid rgba(160,120,24,.25)", fontSize:mob?12:11, fontWeight:700, color:"#a07818", letterSpacing:2, textTransform:"uppercase" }}>⚡ Upset — the deeper cut wins!</span>
              </div>
            )}

            {fact && (
              <div style={{ margin:mob?"14px 0 0":"14px auto 0", maxWidth:mob?undefined:560, padding:"12px 18px", background:"rgba(255,255,255,.03)", borderRadius:12, border:"1px solid rgba(192,48,32,.12)", fontSize:mob?13:13, color:"#8a7868", fontStyle:"italic", lineHeight:1.6, animation:"su .3s ease-out" }}>
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
                <div style={{ fontSize:mob?11:10, color:"#7a6a58", marginBottom:mob?8:8, letterSpacing:2.5, textTransform:"uppercase", fontWeight:700 }}>Up Next</div>
                {rds[cr].slice(cm + 1, cm + (mob ? 3 : 5)).map((m, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:mob?"8px 12px":"6px 12px", background:"rgba(255,255,255,.02)", borderRadius:8, fontSize:mob?13:12, marginBottom:mob?4:4 }}>
                    <span style={{ fontWeight:600, color:"#5a4838", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m[0].name}</span>
                    <span style={{ fontSize:mob?10:9, color:"#6a5a48", letterSpacing:2, margin:"0 8px", flexShrink:0 }}>VS</span>
                    <span style={{ fontWeight:600, color:"#5a4838", flex:1, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m[1].name}</span>
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

function Card({ m, h, a, d, onH, onC, notes, updateNote, mob, movieMeta }) {
  const c = CLR[m.cat];
  const [showCardNotes, setShowCardNotes] = useState(false);
  const note = notes?.[m.seed] || "";
  const meta = movieMeta?.[m.seed];
  const hasPoster = !!meta?.poster;
  const panelW = mob ? 66 : 78;
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

        {/* Left panel: full-height poster OR faded seed number */}
        <div style={{
          width:panelW, flexShrink:0, position:"relative", overflow:"hidden",
          borderRadius: showCardNotes?(mob?"14px 0 0 0":"16px 0 0 0"):(mob?"14px 0 0 14px":"16px 0 0 16px"),
        }}>
          {hasPoster ? <>
            <img src={meta.poster} alt="" style={{
              width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top",
              display:"block", opacity:a?.45:1,
              transition:"opacity .3s, transform .2s",
              transform: h&&!mob?"scale(1.05)":"scale(1)",
            }}/>
            <div style={{ position:"absolute", top:0, right:0, bottom:0, width:"60%", background:`linear-gradient(90deg,transparent,${c.bg}f0)`, pointerEvents:"none" }}/>
          </> : (
            <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:`${c.ac}08`, borderRight:`1px solid ${c.ac}0c` }}>
              <span style={{ fontSize:mob?28:34, fontWeight:900, color:c.ac, opacity:h?.2:.08, lineHeight:1, userSelect:"none", transition:"opacity .18s", fontVariantNumeric:"tabular-nums" }}>{m.seed}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex:1, padding:mob?"11px 12px 11px 10px":"13px 16px 13px 12px", display:"flex", flexDirection:"column", justifyContent:"center", gap:mob?3:4, minWidth:0 }}>

          {/* Top row: quadrant badge + year + notes dot */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ padding:"1px 7px", borderRadius:20, background:BADGE_CLR[m.cat].bg, color:BADGE_CLR[m.cat].tx, fontSize:9, fontWeight:700, letterSpacing:.4 }}>
              {REG_EMOJI[Math.floor((m.seed - 1) / 8)]} {["Passionate","Celeb Shame","Comedy RIP","How Did This"][Math.floor((m.seed - 1) / 8)]}
            </span>
            <span style={{ fontSize:10, color:"#6a5a48" }}>{m.year}</span>
            {note && !showCardNotes && <span style={{ width:5, height:5, borderRadius:"50%", background:c.ac, flexShrink:0, marginLeft:2 }} />}
          </div>

          {/* Title */}
          <div style={{
            fontSize: mob?"clamp(14px,4.2vw,19px)":"clamp(14px,1.85vw,19px)",
            fontWeight:800, color:a?`${c.ac}70`:"#d4ccba",
            lineHeight:1.22, letterSpacing:-.2,
            overflow:"hidden", display:"-webkit-box",
            WebkitLineClamp:2, WebkitBoxOrient:"vertical",
            transition:"color .18s",
          }}>{m.name}</div>

          {/* Stats row: runtime + rating + IMDb */}
          <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
            {meta?.runtime && <span style={{ fontSize:10, color:"#6a5a48", fontVariantNumeric:"tabular-nums" }}>{meta.runtime}</span>}
            {meta?.rating && <span style={{ fontSize:10, color:"#a07818", fontWeight:700 }}>★ {meta.rating}</span>}
            {m.imdb && (
              <a href={m.imdb} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                style={{ padding:"1px 5px", borderRadius:3, background:"#8a582010", color:"#b07830", fontSize:9, fontWeight:700, textDecoration:"none", border:"1px solid rgba(138,88,32,.15)", letterSpacing:.3 }}>IMDb ↗</a>
            )}
          </div>

          {/* Plot blurb — desktop hover, or always when notes are open */}
          {(!mob || showCardNotes) && meta?.plot && (
            <div style={{
              fontSize:11, color:"#7a6a58", lineHeight:1.5,
              overflow:"hidden", display:"-webkit-box",
              WebkitLineClamp: showCardNotes ? 10 : 3,
              WebkitBoxOrient:"vertical",
              maxHeight: (h || showCardNotes) ? "120px" : "0px",
              opacity: (h || showCardNotes) ? 1 : 0,
              transition:"opacity .2s, max-height .25s",
              marginTop: (h || showCardNotes) ? 2 : 0,
            }}>{meta.plot}</div>
          )}

          {/* Trivia — only when notes are open */}
          {showCardNotes && FACTS[m.name] && (
            <div style={{
              fontSize:11, color:"#8a7a62", lineHeight:1.55,
              borderTop:`1px solid ${c.ac}18`, paddingTop:6, marginTop:2,
            }}>{FACTS[m.name]}</div>
          )}

          {mob && <div style={{ fontSize:9, color:c.ac, fontWeight:700, letterSpacing:1.8, textTransform:"uppercase", opacity:.35 }}>Tap to pick worst</div>}
        </div>

        {/* Hover left accent */}
        <div style={{ position:"absolute", left:0, top:"15%", bottom:"15%", width:3, background:`linear-gradient(180deg,transparent,${c.ac}aa,transparent)`, borderRadius:2, opacity:h&&!mob?1:0, transition:"opacity .18s" }} />
        {h&&!mob&&!a&&!meta?.plot && <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:11, color:c.ac, fontWeight:700, letterSpacing:1, opacity:.6 }}>Pick worst →</div>}
      </button>

      <div style={{ textAlign:"center", marginTop:showCardNotes?0:(mob?3:3) }}>
        <button onClick={e => { e.stopPropagation(); setShowCardNotes(!showCardNotes); }} style={{
          background:"transparent", border:"none", color:"#7a6a58", fontSize:mob?11:10, cursor:"pointer",
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
      <div style={{ background:"#100d0a", border:"1px solid rgba(192,48,32,.15)", borderRadius:16, padding:"28px 24px", maxWidth:380, width:"90%", animation:"su .2s" }}>
        <h3 style={{ color:"#d4ccba", margin:"0 0 8px", fontSize:18, fontFamily:"'Bebas Neue',sans-serif", fontWeight:400, letterSpacing:"0.06em" }}>Sync Across Devices</h3>
        {sent ? (
          <p style={{ color:"#5a4838", fontSize:14, lineHeight:1.6 }}>Check your email for a magic link. Close this when you're signed in.</p>
        ) : (
          <>
            <p style={{ color:"#5a4838", fontSize:13, margin:"0 0 16px", lineHeight:1.6 }}>Enter your email — we'll send a link. Your bracket syncs automatically once you're in.</p>
            {err && <p style={{ color:"#c03020", fontSize:13, margin:"0 0 12px" }}>{err}</p>}
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter"&&sendLink()} type="email" placeholder="you@example.com"
              style={{ width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.4)", border:"1px solid rgba(192,48,32,.15)", borderRadius:8, padding:"10px 12px", color:"#d4ccba", fontSize:14, outline:"none", marginBottom:16, fontFamily:"inherit" }} />
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
          borderRadius:8, padding:mob?"8px 10px":"6px 8px", color:"#b8b0a0", fontSize:mob?15:11, fontFamily:"inherit",
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
    <div style={{ marginBottom:mob?20:24, padding:mob?16:20, background:"rgba(255,255,255,.02)", borderRadius:mob?14:16, border:"1px solid rgba(192,48,32,.1)", animation:"fi .3s" }}>
      <div style={{ marginBottom:mob?12:14 }}>
        <h3 style={{ fontSize:mob?16:15, fontWeight:400, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.06em", color:"#c03020", margin:0 }}>Movie Notes</h3>
      </div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Search movies..."
        style={{
          width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.2)", border:"1px solid rgba(255,255,255,.05)",
          borderRadius:10, padding:mob?"12px 14px":"8px 12px", color:"#b8b0a0", fontSize:mob?16:12, fontFamily:"inherit",
          outline:"none", marginBottom:mob?12:12,
        }}
        onFocus={e => e.target.style.borderColor="rgba(192,48,32,.3)"}
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
        <span style={{ fontSize:mob?14:12, fontWeight:600, color:"#b0a898", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.name}</span>
        {!mob && <span style={{ fontSize:9, color:c.tx, opacity:.4 }}>{m.year}</span>}
        {note && <span style={{ width:6, height:6, borderRadius:"50%", background:c.ac, flexShrink:0 }} />}
        <span style={{ fontSize:mob?11:9, color:"#6a5a48", flexShrink:0 }}>{open?"▲":"▼"}</span>
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
              borderRadius:8, padding:mob?"8px 10px":"6px 8px", color:"#b8b0a0", fontSize:mob?15:11, fontFamily:"inherit",
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
          background:d.color, opacity:d.op, borderRadius:"50%",
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
      background: p?"linear-gradient(135deg,#c03020,#901a10)":mu?"rgba(255,255,255,.02)":"rgba(255,255,255,.05)",
      border: p?"none":`1px solid rgba(255,255,255,${mu?.05:.08})`,
      color: p?"#e8e0d0":mu?"#6a5a48":"#8a7868",
      padding: s?(mob?"10px 18px":"6px 16px"):(mob?"14px 26px":"10px 24px"), borderRadius:10,
      fontSize: s?(mob?13:12):(mob?15:14), fontWeight:p?700:600, cursor:"pointer",
      minHeight:mob?48:undefined, transition:"all .15s", WebkitTapHighlightColor:"transparent",
    }}>{children}</button>
  );
}

function BV({ rds, cr, cm, mob }) {
  return (
    <div style={{ marginTop:mob?20:28, padding:mob?14:16, background:"rgba(255,255,255,.02)", borderRadius:mob?12:14, border:"1px solid rgba(255,255,255,.05)", textAlign:"left", animation:"fi .3s" }}>
      <h3 style={{ fontSize:mob?15:14, fontWeight:700, color:"#6a5a48", margin:mob?"0 0 12px":"0 0 14px", letterSpacing:1 }}>Bracket Results</h3>
      {rds.map((r, i) => <RB key={i} t={RND[i]} ms={r} cr={cr} cm={cm} ri={i} mob={mob} />)}
    </div>
  );
}

function RB({ t, ms, cr, cm, ri, mob }) {
  return (
    <div style={{ marginBottom:mob?14:16 }}>
      <div style={{ fontSize:mob?11:10, letterSpacing:mob?2:2.5, textTransform:"uppercase", color:"#7a6a58", marginBottom:mob?6:6, fontWeight:700 }}>{t}</div>
      {ms.map((m, mi) => {
        const w = m.winner, cur = ri===cr&&mi===cm;
        return (
          <div key={mi} style={{ display:"flex", alignItems:"center", gap:mob?6:6, fontSize:mob?13:12, padding:mob?"5px 8px":"3px 8px", borderRadius:6, background:cur?"rgba(192,48,32,.06)":"transparent" }}>
            <MN m={m[0]} w={w} r mob={mob} />
            <span style={{ color:"#6a5a48", fontSize:mob?10:9, letterSpacing:1, flexShrink:0 }}>vs</span>
            <MN m={m[1]} w={w} mob={mob} />
          </div>
        );
      })}
    </div>
  );
}

function MN({ m, w, r, mob, upset }) {
  const won = w?.seed === m.seed, lost = w && !won;
  const winColor = upset ? "#a07818" : "#c03020";
  return (
    <span style={{
      color: won?winColor:lost?"#5a4a3a":"#8a7a68",
      fontWeight: won?700:400, flex:1,
      textAlign: r?"right":"left",
      textDecoration: lost?"line-through":"none",
      opacity: lost?.5:1,
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
        <h3 style={{ fontSize:mob?16:16, fontWeight:400, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.06em", color:"#c8a0a0", margin:0 }}>Full Bracket</h3>
        {upsets?.length > 0 && <span style={{ fontSize:mob?11:10, color:"#a07818", opacity:.8, letterSpacing:1 }}>⚡ {upsets.length} upset{upsets.length!==1?"s":""}</span>}
      </div>
      <div style={{ fontSize:mob?13:12, color:"#7a6a58", marginBottom:mob?16:20 }}>32 movies · 4 quadrants · 5 rounds to crown the worst</div>

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
              const winColor = isUpset ? "#a07818" : REG_COLOR[regIdx];
              return (
                <div key={mi} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background:isCurrentMatch?"rgba(192,48,32,.06)":"transparent" }}>
                  <span style={{
                    flex:1, textAlign:"right", ...ellipsis,
                    color: w?.seed===aSeed?winColor : w&&w.seed!==aSeed?"#5a4a3a" : p?"#8a7a6a":"#8a7a68",
                    fontWeight: w?.seed===aSeed?700:400,
                    textDecoration: w&&w.seed!==aSeed?"line-through":"none",
                    opacity: w&&w.seed!==aSeed?.5:1,
                  }}>{!mob&&aSeed?`#${aSeed} `:""}{mu2.a.name}</span>
                  <span style={{ color:"#6a5a48", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span>
                  <span style={{
                    flex:1, ...ellipsis,
                    color: w?.seed===bSeed?winColor : w&&w.seed!==bSeed?"#5a4a3a" : p?"#8a7a6a":"#8a7a68",
                    fontWeight: w?.seed===bSeed?700:400,
                    textDecoration: w&&w.seed!==bSeed?"line-through":"none",
                    opacity: w&&w.seed!==bSeed?.5:1,
                  }}>{mu2.b.name}{!mob&&bSeed?` #${bSeed}`:""}</span>
                  {w && <span style={{ fontSize:vsFs, color:isUpset?"#a07818":REG_COLOR[regIdx], opacity:.6, marginLeft:2 }}>{isUpset?"⚡":"✓"}</span>}
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
            <div style={{ ...headStyle, color:"#5a4838" }}>{RND[roundNum]}</div>
            {rd.map((m, mi) => {
              const w = m.winner;
              const isUpset = w && w.seed > (w.seed===m[0].seed ? m[1] : m[0]).seed;
              const isCur = cr===roundNum && cm===mi;
              return (
                <div key={mi} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background:isCur?"rgba(192,48,32,.06)":"transparent" }}>
                  <MN m={m[0]} w={w} r mob={mob} upset={isUpset&&w?.seed===m[0].seed} />
                  <span style={{ color:"#6a5a48", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span>
                  <MN m={m[1]} w={w} mob={mob} upset={isUpset&&w?.seed===m[1].seed} />
                  {w && <span style={{ fontSize:vsFs, color:isUpset?"#a07818":"#c03020", opacity:.5, marginLeft:2 }}>{isUpset?"⚡":"✓"}</span>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
