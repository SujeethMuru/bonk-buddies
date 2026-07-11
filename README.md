# Bonk Buddies!

A dependency-free pixel-art whack-a-mole game built for the browser. Pick a hammer, choose a difficulty and match length, then chase combos while a 17-character cast dodges, taunts, and occasionally turns golden.

## [Play Bonk Buddies Version 1.0](https://sujeethmuru.github.io/bonk-buddies/)

The live GitHub Pages build runs directly in a modern desktop or mobile browser.

## Version 1.0 features

- Seventeen buddies with normal and angry pixel-art reactions.
- Chill, Spicy, and Unhinged difficulty worlds across four match lengths.
- Classic, Neon, and Royal hammer selection.
- Combos, Golden Buddies, six power-ups, and duration-aware rank targets.
- Persistent achievements, career statistics, and personal records.
- End-of-match buddy medals, Most Bonked Buddy highlights, performance titles, and record celebrations.
- Responsive mouse, touchscreen, trackpad, and keyboard-friendly menu support.
- Pause, quit confirmation, procedural audio, reduced-motion support, and lightweight animations.

## Play locally

No build step or package installation is required. Clone the repository and serve the folder with any static file server:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000` in a modern browser. Opening `index.html` directly also works, although a local server is recommended.

## How to play

- Choose **Chill**, **Spicy**, or **Unhinged** difficulty.
- Pick a 15-second, 30-second, 1-minute, or 2-minute match.
- Select the Classic, Neon, or Royal hammer. Your choice is saved locally.
- Click, tap, or use a pointer to bonk visible buddies and collect power-ups.
- Avoid empty swings, maintain a combo, and react quickly to short-lived Golden Buddies.
- Use **Pause** to safely freeze a match or **Quit** to return to the menu.

## Scoring and ranks

A standard bonk starts at 100 points. Every five consecutive hits increases the combo multiplier. Golden Buddies award 500 base points, and temporary multiplier power-ups can raise the final award.

Ranks scale with both match duration and difficulty, so a short Chill game and a two-minute Unhinged game have appropriately different targets. On a two-minute Spicy match, **Legendary Bonk Lord** requires 30,000 points.

Accuracy measures successful targeted swings; buddies that retreat are reported separately as **Escaped**. Lightning Hammer hits do not distort swing accuracy.

## Power-ups

| Power-up | Effect |
| --- | --- |
| Giant Hammer | Enlarges the hammer and hit radius for 9 seconds. |
| Golden Multiplier | Doubles points for 9 seconds. |
| Silver Multiplier | Awards 1.5× points for 8 seconds. |
| Ruby Multiplier | Triples points for 6.5 seconds. |
| Lightning Hammer | Instantly strikes every valid visible buddy. |
| Freeze Time | Slows the game world for 9 seconds. |

## Career, achievements, and records

Bonk Career statistics persist in browser `localStorage`: matches, total score, total bonks, best score, best combo, accuracy, Golden Buddy hits, power-ups, and per-character totals. Seven achievements cover first steps, combo play, accuracy, score milestones, roster completion, and long-term play.

Version 1.0 also tracks the best score, combo, qualified accuracy, and total hits from a single match. Results award Bronze, Silver, or Gold buddy medals from current-match totals and highlight the Most Bonked Buddy. Career data can be reset from the menu. Progress stays in the current browser profile and is not uploaded to a server.

## Character roster

Charan, Yesh, Kiran, Vaibhav, Anand, Henry, Hozaif, Johannes, Leyneesh, Mukesh, Rohan, Aryan, Philip, Rashid, Sebastion, Adan, and Zain each have normal and angry reaction sprites.

## Technical notes

- Vanilla HTML, CSS, and JavaScript; no runtime dependencies.
- Responsive mouse, touch, trackpad, and keyboard-friendly menu controls.
- Procedural Web Audio music and effects start only after player interaction.
- Pixel-art animation uses lightweight CSS transforms and stepped timing.
- Reduced-motion preferences are respected.
- Career progress and hammer selection use `localStorage`; the game remains playable if storage is unavailable.

## Built with

- Semantic HTML5
- Modern responsive CSS
- Vanilla JavaScript
- Web Audio API
- Browser `localStorage`

## Project structure

```text
assets/       Character sprites
game.js       Game loop, scoring, persistence, audio, and interactions
index.html    Menu, game, results, and career interface
styles.css    Pixel-art presentation, responsive layout, and animation
```

## Credits

Created as a friendly arcade tribute. Dedicated to Charan and Yesh for copying my profile.

## Version 1.0 release summary

Version 1.0 completes the core arcade loop with the full buddy roster, three difficulty modes, configurable matches and hammers, power-ups, persistent progression, achievements, personal records, and a polished match report. The release remains a fast static web game with no framework, build step, backend, account, or online multiplayer requirement.

## Future plans

- Explore optional online player-versus-player modes.
- Continue balancing ranks, medals, and special performance titles from player feedback.
