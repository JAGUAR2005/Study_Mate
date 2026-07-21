# StudyMate Annotation Engine

## Core rule

Study material must never sit on top of the sentence it explains. The source text remains the primary object; StudyMate adds only a compact, inline attachment marker at the end of an annotated selection.

## Interaction model

1. A reader selects a passage and chooses Define, Translate, Visualize, or Note.
2. The result is attached to that exact text range rather than inserted into the paragraph.
3. A small action-specific marker appears directly after the selection. Multiple attached aids form one grouped marker with a count.
4. Clicking a marker opens the selected aid in the dedicated right margin rail. It never covers the text.
5. The margin rail allows readers to switch among attached aids or remove one; the source paragraph remains visible throughout.

## Placement rules

- **Desktop:** marker follows the final inline text node; detail panel occupies a fixed reading margin.
- **Small screens:** marker remains inline; the detail panel moves below the text as a sheet, never a floating overlay.
- **Long selections:** one marker is placed at the selection's final line, not repeated on every line.
- **Edited source text:** the marker stays attached to the edited range; saved annotations carry range metadata and a fallback text quote for resilient re-anchoring.

## Visual language

| Attached aid | Marker | Margin treatment |
|---|---|---|
| Define | `⌑` | warm paper card |
| Translate | `文` | language label + listening control |
| Visualize | `⌘` | compact flow map |
| Note | `▤` | editorial note card |

`Mote` is the small reading companion that can introduce empty states, onboarding, and gentle success moments. It is not placed inside the reading line, so it never competes with the document.
