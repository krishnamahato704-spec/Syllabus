# School question bank

`src/data/school-questions.js` exports 350 canonical authored-practice questions. These are not official past questions, a certified answer key or a prediction of an examination. The `review` field records a content review during this repair, not independent expert certification. Stable IDs identify the question, without mock numbers or decorative variations.

| Pool | Questions | Breakdown |
| --- | ---: | --- |
| CDP | 60 | Development 28; inclusion 7; learning 25 |
| English I | 65 | Pedagogy 20; comprehension 45 |
| Hindi II | 65 | Pedagogy 20; comprehension 45 |
| SST | 90 | Content 60: History 20, Geography 21, Civics 19; pedagogy 30 |
| NCERT | 70 | History 15; Geography 20; Civics 15; Economics 20 |

The requested numeric pool goals are met. All questions have four different options, a keyed answer, an explanation, a topic reference and actual topic IDs from `syllabus.json`. Development/inclusion/learning support the 15/5/10 CDP split; each language supports 15 comprehension plus 15 pedagogy; SST supports 40 content plus 20 pedagogy. These are finite pools: papers will share questions, and the catalog must disclose reuse. Counts alone do not establish complete coverage of every syllabus item.

## Passage selection

All twelve passages and their questions were newly written for this app. No NCERT or literary passage has been reproduced. English prose/drama groups have ten questions each and poem groups have five. The first three Hindi prose groups have eight questions each; the other three have seven. Members retain identical, self-contained passage data.

English prose/drama group IDs are `school-passage-library`, `school-passage-bridge`, and `school-passage-seed-trial`. The bridge group is a short dramatic scene represented by the contract's `prose` type. Poem group IDs are `school-passage-rain-poem`, `school-passage-tree-poem`, and `school-passage-river-poem`.

A full English section selects one prose/drama group of ten and one poem group of five. Hindi groups are `school-passage-tank`, `school-passage-bus`, `school-passage-weaver` (eight each), and `school-passage-letters`, `school-passage-roof`, `school-passage-fair` (seven each). One eight-item and one seven-item group provide the two prose passages and fifteen comprehension questions. The two-passage structure follows the official bulletin; allocating 10+5 and 8+7 questions within those pairs is an app practice choice.

For comprehension, the supplied original passage is the answer evidence. The external NCERT URL is labelled only as a language-teaching topic reference. Every answer was checked against the supplied passage. Do not display the topic reference as though it were the source of the original prose or poem.

## Reuse and corrections

The bank adapts 42 of the existing 50 CDP items, 16 of the 20 English items, 13 of the 15 Hindi items, all 20 SST items and all 20 NCERT items. Other questions are new. Selected NCERT dictionary concepts were rewritten with reviewed choices and explanations, rather than imported from the old mock-prefix generator.

Changes include removing diagnostic shortcuts based on letter reversals or handwriting, removing the disability-count legal trivia and the fixed-age claim about thought and language, and avoiding a fixed-learning-style interpretation of Gardner. Several retained choices were rewritten to remove silly distractors or an obvious longest-answer cue. The laterite item now asks about leaching rather than calling it physical weathering. The TISCO question no longer claims that Jamsetji Tata personally founded a plant in 1907 after his death. The FCI question recognises state procurement agencies. The ocean-current explanation avoids treating one current as the sole cause of every port's winter conditions. The consumer-law year is explicitly historical, and the dated World Bank classification item was changed to the stable concept of per capita income.

Some questions revisit related concepts across streams because those concepts belong to both syllabuses. The questions and the reasoning demanded differ. No item is multiplied by mock number or a superficial rephrasing loop. Options have varied stored key positions, and the sitting engine should still shuffle and retain its actual order.

## Source checks and limits

The following primary official sources were consulted through browsing on 30 October 2026:

- [CTET information-bulletin page](https://ctet.nic.in/information-bulletin/) and its linked [February 2026 bulletin](https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2025/11/202511271651651092.pdf). The retrieved syllabus includes the 40-content/20-pedagogy Social Studies structure. Use the owner's verified session source for date-specific exam information; the bank itself makes no exam-date claim.
- [NCERT Teaching of English](https://ncert.nic.in/pdf/focus-group/english.pdf), whose contents were retrieved, for input-rich teaching, multilingual resources, language purposes and assessment.
- [NCERT Teaching of Social Sciences](https://ncert.nic.in/pdf/focus-group/social_sciencel.pdf), whose contents were retrieved, for inquiry, source use, discussion and the treatment of social questions.
- [NCERT National Curriculum Framework 2005](https://ncert.nic.in/pdf/nc-framework/nf2005-english.pdf), located in official indexed content, for the child-centred and formative-assessment context.
- [NCERT Teaching of Indian Languages](https://ncert.nic.in/pdf/focus-group/Indian_Languages.pdf), [Inclusion in Education](https://ncert.nic.in/pdf/announcement/Inclusion_in_Eduction.pdf) and [Psychology: Human Development](https://ncert.nic.in/textbook/pdf/kepy103.pdf). Official indexed source descriptions confirmed the relevant subjects; direct PDF retrieval was intermittent. Their links are topic references, not evidence of an item-by-item external key check.
- [NCERT Money and Credit](https://ncert.nic.in/textbook/pdf/jess203.pdf), with official indexed text on terms and access to credit; [Working of Institutions](https://www.ncert.nic.in/textbook/pdf/iess404.pdf), with official indexed text on Parliament; and the [NCERT textbook portal](https://ncert.nic.in/textbook.php) as the general school-content entry point.

Official NCERT pages were sometimes unavailable through the browsing fetcher. The bank therefore distinguishes topic references from direct answer evidence and does not claim that every answer was independently certified against a retrieved official page. Sources are linked, not redistributed. The original authored questions, passages and explanations are not quoted textbook content. Dates and precise legal trivia that remain are historical study questions, not current legal advice.

## Filter contract

`section` identifies the pool (`all` is NCERT). `domain` supports the broad sub-sections: NCERT `history`, `geography`, `civics`, `economics`; CDP `development`, `inclusion`, `learning`; language `english`/`hindi`; SST `history`, `geography`, `civics`, `pedagogy`.

CDP unit slugs: `social-learning`, `cognitive-development`, `moral-reasoning`, `intelligence-diversity`, `child-centred-teaching`, `socialisation`, `motivation-errors`, `assessment`, `gender`, `language-development`, `inclusive-classroom`, `development-principles`.

Language unit slugs: `language-acquisition`, `reading-strategies`, `listening-speaking`, `integrated-skills`, `grammar-teaching`, `writing-process`, `materials-assessment`, `prose-comprehension`, `poetry-comprehension`, `multilingual-classroom`. Not every unit occurs in both languages.

Useful SST pedagogy unit slugs: `livelihoods-teaching`, `civic-participation`, `historical-narrative`, `historical-sources`, `fieldwork`, `historical-thinking`, `map-teaching`, `discussion`, `nature-social-science`, `assessment`, `critical-thinking`, `geographical-data`, `remediation`, `role-play`, `inclusive-social-studies`, `interdisciplinary`, `material-evidence`.

Content units use topic slugs such as `early-cities`, `colonial-expansion`, `national-movement`, `coordinates-time`, `map-skills`, `climate`, `resources`, `constitution`, `rights`, `judiciary`, `local-government`, `credit`, `employment`, `statistics` and `economic-choices`. Enumerate the actual bank for unit drill options and counts. Do not create a large drill from a tiny unit by repeating its questions.

## Verification

`node --test tests/school-content.test.mjs` passes five tests. They check canonical-ID and normalised-stem uniqueness, the answer contract and option uniqueness, CTET pool quotas, five-item passage integrity, real syllabus mappings, broad NCERT filter coverage and independent known-answer examples for a map calculation, opportunity cost and reading evidence. The tests do not certify the whole bank's pedagogy or substitute for future content review.
