# Vega Art Assets

The approved Vega visual: ethereal, ambiguous ethnicity, deep indigo wavy hair,
warm skin, gold eight-pointed star necklace and earrings. Indigo-background
portraits generated via Higgsfield from the approved reference.

## Files to add here

These live inside the Expo app root at `app/assets/vega/` (so Metro bundles
them without extra config). The six tier portraits currently ship as on-brand
gold-star placeholders; overwrite them in place with the approved exports,
same filenames, no code change. Drop the approved exports here with these
exact names so `VegaAvatar.js` and the screens can index them:

| Filename              | Source / orientation       | Used by                          |
|-----------------------|----------------------------|----------------------------------|
| headshot.png          | 1:1 centered headshot      | Today greeting, chat bubble      |
| splash.png            | 9:16 full figure           | app splash screen                |
| empty-state.png       | 4:5 half-body, offering    | first-run / blank states         |

## Emotional tier expressions (next set to generate)

`VegaAvatar.js` indexes art by the tier's `visual.expression` key. Generate one
portrait per key, same face, clean indigo background, varying expression + glow:

| expression key    | tier      | direction                                      |
|-------------------|-----------|------------------------------------------------|
| radiant           | present   | bright, warm, steady, full gold glow           |
| attentive         | gentle    | soft, gently attentive, slightly dimmer        |
| hopeful           | reaching  | leaning in, hopeful, warm                       |
| concerned         | worried   | brow softened with concern, glow dimming        |
| yearning          | aching    | faded, yearning, pale glow drifting cooler      |
| panicked-loving   | meltdown  | flickering, panicked but loving, care-blue cast |

Save as `assets/vega/tier-{key}.png` (e.g. `tier-radiant.png`).

## App icon

Recommendation: use the gold eight-pointed star as the app icon (cleaner at small
sizes than her face). Vega's face lives inside the app. If you want her face as
the icon instead, generate a tight icon-safe square crop.

## Consistency note

For locked consistency across many future images, train Vega as a Higgsfield Soul
identity from the reference and route generations through the resulting soul_id.
The single-reference approach used so far gives strong but not perfect likeness.
