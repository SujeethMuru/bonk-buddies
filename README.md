# Bonk Buddies!

A dependency-free pixel-art whack-a-mole browser game starring the Bonk Buddies crew.

## Play

Open `index.html` in a browser, or run a small local server:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

Choose a difficulty and a 15-second, 30-second, 1-minute, or 2-minute match, then score as many hits as possible. Buddies can arrive randomly or in short sequences, doubles, triples, speed bursts, and harmless fake-outs.

Successful bonks trigger a random lightweight reaction such as a shake, squish, dizzy stars, surprise flash, or pixel-particle burst. Rare **Golden Buddies** disappear faster but award 500 base points, so hit them quickly.

Buddies retreat back into their holes instead of vanishing. Missed buddies may stop to taunt you first, and a small share of successful bonks reveal rare angry character reactions.

Collect either of the two temporary hammer power-ups when they appear:

- **Giant Hammer** makes the hammer larger and adds stronger hit particles.
- **Golden Hammer** doubles points while active.
- **Silver Multiplier** awards 1.5× points while active.
- **Ruby Multiplier** awards 3× points for a shorter, rarer burst.

The power-up bar shows the active effect and its remaining time. Sound begins after pressing Start because browsers require user interaction before audio can play.

Use the **Quit** button during a match to return to the difficulty menu without waiting for the timer.
Use **Pause** to freeze the timer, character spawning, power-ups, and music until you resume.

Use a mouse, trackpad, or touchscreen to bonk a visible buddy. Each buddy can award points only once, even if it is clicked repeatedly.

The final report includes total hits, accuracy, best combo, and separate bonk counts for every buddy.
