# Asset credits

The interface adapts the shared library's `slate-interface` palette: background #F4F6FA, surface #FFFFFF, text #1C293D, muted #536075, accent #2154A3, hover #163F80, on-accent #FFFFFF, border #7B879A, focus #2154A3, soft #E4EAF4. Layout, map-line decoration and inline SVG icons were authored for Study Atlas. Font files are local and unmodified; no external font request is required.

| Asset | Local file | Use | Licence notice |
|---|---|---|---|
| Source Sans 3 (shared entry `source-sans-3`) | src/fonts/source-sans-3.woff2 | Body text and controls | licenses/Source-Sans-3-OFL.md |
| Source Serif 4 (shared entry `source-serif-4`) | src/fonts/source-serif-4-semibold.woff2 | Main headings | licenses/Source-Serif-4-OFL.md and Source-Serif-project-OFL.txt |
| Noto Sans Devanagari (shared Google font entry) | src/fonts/noto-sans-devanagari.ttf | Hindi text fallback | licenses/Noto-Sans-Devanagari-OFL.txt |
| Slate interface | Palette adapted into src/styles.css | Neutral study interface | licenses/Library-style-reuse.txt |

The copied binaries were checked against their library hashes before use:

```
5f16566f7a40d39b339ad26be151fa5a1ab1f0c2574c7a2e619765584a1acbd8  source-sans-3.woff2
457a13ac92e977d82e376038a2daac7fdb5433610910bf5787bdf6c1c3781865  source-serif-4-semibold.woff2
14ec4af41f27482216d1c2229f417ff9b1425e1babb014e57d1d40d03229853e  noto-sans-devanagari.ttf
```

SIL Open Font License notices are retained in the package. Firebase, React and Vite are installed from their published npm packages and retain their upstream licences. School/exam links point to official sources; no official logos or scanned textbook pages are included.

Production dependency notices are collected in `licenses/THIRD_PARTY_NOTICES.txt`. Distributed builds copy the notices into `dist/licenses`; the standalone HTML retains them in an embedded comment. The reusable style was captured successfully in the shared library as `captured-slate-study-workspace-e9cf883cd992`.
