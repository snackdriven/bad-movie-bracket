# 💀 Worst Movie Tournament

**32 films. 4 quadrants. 5 rounds. One champion of failure.**

**[Play it live](https://snackdriven.github.io/bad-movie-bracket/)**

A March Madness-style single-elimination bracket for crowning the worst movie ever made. Pick the worst in every head-to-head matchup until only one cinematic disaster remains standing. Think of it as the Oscars, but for movies that made their directors apologize publicly.

## The Quadrants

| | Quadrant | Vibe |
|---|---|---|
| 💀 | **Passionate Disasters** | Films made with alarming sincerity — The Room, Troll 2, Battlefield Earth |
| 🗑️ | **Celebrity Shame** | A-listers who'd rather you forgot — Cats, Catwoman, Glitter |
| 🎬 | **Comedy Graveyard** | Comedies so unfunny they loop back around to fascinating — Jack and Jill, Freddy Got Fingered |
| 🔥 | **How Did This Get Made** | Films that defy the concept of studio oversight — Theodore Rex, Howard the Duck, Super Mario Bros. |

## Features

- **32-movie seeded bracket** across 4 thematic quadrants
- **Trivia facts** after every pick (did you know The Fanatic earned $3,153 opening weekend? That is not a typo.)
- **Upset tracking** when a lower seed defeats a higher one — because even in bad movie rankings, there are upsets
- **Undo/redo** for when you realize that actually, Cats IS worse than Catwoman
- **Full bracket view** to see all matchups and results at a glance
- **Per-movie notes** so you can annotate your reasoning (or just scream into the void)
- **Cloud sync** via Supabase magic link auth — fill out your bracket on your phone, review it on desktop
- **Export** your completed bracket as shareable text
- **Film grain overlay** because this whole thing deserves a grindhouse aesthetic
- **Mobile-first** responsive design with touch-friendly cards

## The Roster

The Room, The Fanatic, Troll 2, Dragonball Evolution, Battlefield Earth, Dungeons & Dragons, The Wicker Man, Mortal Kombat: Annihilation, Cats, Catwoman, Daredevil, Elektra, Glitter, From Justin to Kelly, Showgirls, Barb Wire, Jack and Jill, Freddy Got Fingered, The Master of Disguise, The Cat in the Hat, Kazaam, Chairman of the Board, Movie 43, The Emoji Movie, Theodore Rex, Howard the Duck, Gigli, Swept Away, Super Mario Bros., Congo, Batman & Robin, Silent Night Deadly Night Part 2.

Every single one of them earned their spot.

## Tech Stack

- **React 19** — one component file, no router, no state library, just vibes
- **Vite** — builds fast, like these movies were written
- **Supabase** — magic link auth + cloud sync for bracket persistence
- **Zero CSS frameworks** — all inline styles with a washed-out cinema poster palette

## Run Locally

```bash
npm install
npm run dev
```

## Fun Facts the App Will Tell You

- Tommy Wiseau claims his $6M budget came from importing Korean leather jackets. He has never clarified what happened to the leather jackets.
- Mike Myers' Cat in the Hat was so unsettling that Dr. Seuss's widow permanently banned live-action adaptations.
- Whoopi Goldberg tried to exit Theodore Rex and was sued. She lost. The buddy-cop movie with a talking T-Rex cost $35M and made $657K.
- Joel Schumacher apologized for Batman & Robin publicly and repeatedly. The Batsuit nipples were his decision. He apologized for that separately.

## License

MIT — use it however you want. These movies certainly didn't worry about quality control.
