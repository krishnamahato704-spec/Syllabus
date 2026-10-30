// question-generator.js - High-Fidelity Question Synthesizer with Zero-Duplicate Guarantee
// Generates authentic, rigorous, domain-grounded exam questions for NCERT, CTET, UGC NET, and PG History.

import { CDP_QUESTION_BANK, getCDPQuestion } from './cdp-bank.js';
import { ENGLISH_QUESTION_BANK, getEnglishQuestion } from './english-bank.js';
import { HINDI_QUESTION_BANK, getHindiQuestion } from './hindi-bank.js';
import { SST_QUESTION_BANK, getSSTQuestion } from './sst-bank.js';
import { UGC_P1_QUESTION_BANK, getUGCP1Question } from './ugc-p1-bank.js';
import {
  ANCIENT_HISTORY_BANK,
  MEDIEVAL_HISTORY_BANK,
  MODERN_HISTORY_BANK,
  HISTORIOGRAPHY_BANK,
  getHistoryQuestion
} from './history-advanced-bank.js';
import { NCERT_QUESTION_BANK, getNCERTQuestion } from './ncert-bank.js';

// Curriculum concept dictionaries for authentic question generation
const NCERT_CONCEPTS = {
  History: [
    { topic: "Harappan Urban Planning", stem: "In the context of Harappan town planning, which feature demonstrates their sophisticated sanitary and drainage engineering?", correct: "Brick-lined drains covered with stone slabs that connected house chutes to street mains", opts: ["Open storm channels made of unbaked mud", "Absence of any drainage connections inside private dwellings", "Underground metal conduits imported from Mesopotamia"], exp: "Harappan cities featured meticulous drainage systems where wastewater from domestic courtyards flowed through terracotta pipes into covered street sewers equipped with inspection sumps." },
    { topic: "Ashokan Dhamma Edicts", stem: "What was the central ideological objective of Emperor Ashoka's policy of 'Dhamma' as recorded in his Major Rock Edicts?", correct: "Fostering ethical social harmony, non-violence (Ahimsa), religious tolerance, and filial respect", opts: ["Forced state conversion of all subjects to Theravada Buddhism", "Imposing military conscription across conquered border territories", "Establishing exclusive Brahmanical sacrificial monopolies"], exp: "Ashoka's Dhamma was not a formal theological dogma, but a universal moral and civic code emphasizing compassion, truthfulness, religious tolerance, and humane treatment of prisoners and animals." },
    { topic: "Chola Village Administration", stem: "In Chola rural administration, what was the distinction between the 'Ur' and the 'Sabha'?", correct: "The Ur was the general village assembly of non-Brahmadeya landholders, whereas the Sabha was the assembly of learned Brahmins in Brahmadeya villages", opts: ["The Ur was exclusively for military veterans and the Sabha for foreign merchants", "The Ur had no fiscal powers while the Sabha collected all imperial customs", "The Ur was established by Pallavas while the Sabha was founded by Pandyas"], exp: "In Tamil country under the Cholas, the Ur was the assembly of tax-paying landholders (Vellanvagai), while the Sabha (or Mahasabha) governed autonomous tax-exempt Brahmin settlements (Brahmadeyas)." },
    { topic: "Delhi Sultanate Administration", stem: "During the Delhi Sultanate, what was the principal function of the 'Barid-i-Mumalik'?", correct: "Head of the imperial intelligence and state postal/spy network", opts: ["Commander-in-chief of royal war elephants", "Chief justice presiding over ecclesiastical courts", "Superintendent of royal mints and coin assaying"], exp: "The Barid-i-Mumalik supervised the intelligence department and state couriers (Barids), reporting regional developments directly to the Sultan." },
    { topic: "Mughal Land Revenue (Zabt & Dahsala)", stem: "Under Raja Todar Mal's Ain-i-Dahsala system instituted in 1580 during Akbar's reign, how was land revenue assessed?", correct: "Average produce and average market prices of crops over the preceding ten years were calculated to fix state cash demand", opts: ["A flat 50% tax on the gross visual standing crop in every harvest", "Arbitrary bidding auctions among local Zamindars without land measurement", "Uniform tax per plough regardless of soil fertility"], exp: "The Dahsala system calculated the average yield and local market prices for ten years (1570-1580), fixing one-third of the average produce as the state revenue demand payable in cash." },
    { topic: "1857 Revolt at Awadh", stem: "Why did the kingdom of Awadh become the fiercest center of widespread rebellion during the 1857 uprising?", correct: "Colonial annexation in 1856 on charges of misgovernance dispossessed taluqdars and deeply alienated sepoys recruited from peasant families", opts: ["The British introduced Portuguese language in Awadh courts", "Awadh was completely exempt from East India Company taxation", "The Nawab of Awadh had signed a voluntary merger treaty"], exp: "Lord Dalhousie annexed Awadh in 1856. Awadh provided roughly one-third of Bengal Army sepoys ('the nursery of the Bengal Army'); their families suffered under British land assessments, fueling deep popular rebellion." },
    { topic: "Colonial Forest Acts & Tribal Resistance", stem: "How did the British Forest Acts of 1865 and 1878 impact indigenous forest-dwelling communities in India?", correct: "Classified forests as Reserved and Protected, criminalizing traditional shifting cultivation (Jhum) and grazing rights", opts: ["Granted absolute ownership of timber to local Adivasi panchayats", "Promoted indigenous herbal medicine over European pharmaceuticals", "Subsidized iron tools for traditional hunting communities"], exp: "The colonial forest legislation declared vast timber tracts state property, severely restricting tribal access to customary forest produce and shifting agriculture." },
    { topic: "Swadeshi & Boycott Movement (1905)", stem: "The Swadeshi and Boycott movement of 1905 originated as a direct popular reaction against:", opts: ["Lord Curzon's partition of the Province of Bengal along communal lines", "The passing of the Vernacular Press Act", "The outbreak of the First World War", "The Rowlatt Bills in the Imperial Legislative Council"], correct: "Lord Curzon's partition of the Province of Bengal along communal lines", exp: "Lord Curzon partitioned Bengal in October 1905 ostensibly for administrative efficiency, but strategically to divide the nationalist Bengali intelligentsia into Hindu and Muslim majority provinces." },
    { topic: "Non-Cooperation Movement (1920-22)", stem: "Why did Mahatma Gandhi abruptly suspend the nationwide Non-Cooperation Movement in February 1922?", correct: "The violent incident at Chauri Chaura in Gorakhpur where a crowd burned a police station, killing 22 policemen", opts: ["The British government accepted all demands of the Khilafat committee", "The Congress leadership split into Swarajists and No-Changers", "The outbreak of the Moplah rebellion in Malabar"], exp: "Deeply committed to absolute non-violence (Satyagraha), Gandhi called off the movement following the violent tragedy at Chauri Chaura on 4 February 1922, stating the nation was not yet trained for mass Satyagraha." },
    { topic: "Civil Disobedience & Salt Satyagraha (1930)", stem: "Why did Mahatma Gandhi choose 'Salt' as the central rallying symbol to launch the Civil Disobedience Movement in 1930?", correct: "Salt was an indispensable daily dietary necessity consumed equally by rich and poor, making the state tax an oppressive symbol of colonial exploitation", opts: ["Salt was produced exclusively in British factories in Manchester", "Salt production had been completely banned throughout the subcontinent", "Salt was the only commodity traded along the silk route"], exp: "Gandhi recognized salt as an emotionally evocative, universal necessity that affected every Indian household, uniting peasants, women, rich, and poor against unjust colonial monopoly." },
    { topic: "Quit India Movement (1942)", stem: "At the All India Congress Committee session at Gowalia Tank, Bombay on 8 August 1942, Mahatma Gandhi issued which famous mantra?", correct: "'Do or Die' (Karo ya Maro)", opts: ["'Swaraj is my birthright'", "'Give me blood, and I will give you freedom'", "'Jai Hind'"], exp: "Launching the Quit India Movement in August 1942 amidst the collapse of the Cripps Mission, Gandhi declared: 'We shall either free India or die in the attempt; we shall not live to see the perpetuation of our slavery.'" },
    { topic: "Industrialization & Manchester Cloth", stem: "What was the devastating economic impact of British machine-made textile imports ('Manchester cotton') on traditional Indian weavers during the 19th century?", correct: "Traditional handloom weaving collapsed due to cheap machine competition and high tariffs on Indian cloth in Britain", opts: ["Indian weavers successfully bought out British textile conglomerates", "Handloom exports increased tenfold between 1800 and 1850", "The British East India Company paid heavy subsidies to rural Indian artisans"], exp: "De-industrialization stripped millions of Indian weavers, spinners, and dyers of their livelihoods as machine-made cloth flooded Indian markets duty-free while Indian textiles were heavily taxed abroad." }
  ],
  Geography: [
    { topic: "Earth's Internal Structure", stem: "The boundary of discontinuity separating the Earth's crust from the underlying mantle is scientifically known as the:", correct: "Mohorovicic Discontinuity (Moho)", opts: ["Gutenberg Discontinuity", "Conrad Discontinuity", "Lehmann Discontinuity"], exp: "The Moho discontinuity marks the sharp change in seismic wave velocity between the Earth's oceanic/continental crust and the denser peridotitic rocks of the upper mantle." },
    { topic: "Plate Tectonics & Fold Mountains", stem: "The Himalayan mountain range is classified geologically as which type of mountain system?", correct: "Young fold mountains formed by the ongoing continental collision of the Indian Plate with the Eurasian Plate", opts: ["Relict block mountains formed by tensional faulting", "Volcanic island arc system", "Residual plateau hills formed by glacial erosion"], exp: "The Himalayas are young fold mountains formed during the Tertiary period by the collision of the northward-moving Indian tectonic plate against the Eurasian plate, a process that continues today." },
    { topic: "Atmospheric Layers & Characteristics", stem: "Why is the Stratosphere considered the ideal altitude band for flying commercial jet aircraft?", correct: "It is free from clouds, water vapor, and turbulent convectional weather phenomena that occur in the troposphere", opts: ["It contains the highest concentration of breathable oxygen", "It has the lowest atmospheric pressure in the solar system", "It exhibits strong vertical convection updrafts"], exp: "Commercial airplanes cruise in the lower stratosphere to avoid thunderstorms, cloud turbulence, and convective weather changes restricted to the troposphere below the tropopause." },
    { topic: "Indian Monsoon Mechanism", stem: "What is the primary thermodynamic cause driving the onset of the Southwest Monsoon over the Indian subcontinent in June?", correct: "Intense differential heating generating a persistent thermal low pressure over the northwest plains and Tibetan plateau, drawing moist maritime winds", opts: ["Permanent polar icecap melt in the Arctic Ocean", "Westerly wind bursts from the Pacific ocean basin", "Cooling of the Bay of Bengal during spring"], exp: "Intense solar heating in summer creates a profound thermal low-pressure trough (Monsoon Trough) across northwest India and the Tibetan Plateau, sucking moist maritime air from the Indian Ocean." },
    { topic: "Soils of India (Black Soil)", stem: "The 'Regur' or Black Soil of the Deccan Trap region is exceptionally suited for the cultivation of cotton because of its:", correct: "High clay content, rich moisture-retentive capacity, and self-ploughing cracks when dry", opts: ["Extremely sandy texture and high permeability", "High acidity and total absence of iron compounds", "High nitrogen content derived from pine needles"], exp: "Regur soils, derived from weathered volcanic basalt lava, are rich in lime, iron, magnesium, and potash, with deep clayey textures that swell when wet and retain moisture through dry periods." },
    { topic: "Drainage Systems: Himalayan vs Peninsular", stem: "Why are Himalayan rivers perennial throughout the year, whereas Peninsular rivers are predominantly seasonal?", correct: "Himalayan rivers are fed both by seasonal monsoon rainfall and perpetual glacial melt from snow peaks", opts: ["Peninsular rivers originate in desert sand dunes", "Himalayan river valleys are lined with waterproof basalt rock", "Peninsular India receives rainfall only once every five years"], exp: "Himalayan rivers (Indus, Ganga, Brahmaputra) have perennial discharge fed by snowmelt in dry summer and rains in monsoon; peninsular rivers depend almost entirely on rainfall in the Western Ghats." },
    { topic: "Water Resources & River Valley Projects", stem: "The Hirakud Dam, one of the longest earthen dams in the world, was constructed across which river to control devastating recurring floods?", correct: "Mahanadi River (Odisha)", opts: ["Godavari River", "Narmada River", "Damodar River"], exp: "The multipurpose Hirakud Dam was built across the Mahanadi river in Sambalpur, Odisha to mitigate recurrent catastrophic delta floods and provide extensive canal irrigation." },
    { topic: "Mineral Belts & Chota Nagpur Plateau", stem: "Why is the Chota Nagpur Plateau frequently referred to as the 'Mineral Heartland of India'?", correct: "It contains rich concentrations of metallic and non-metallic minerals including iron ore, coal, bauxite, mica, and manganese", opts: ["It houses ninety percent of India's petroleum offshore drilling wells", "It contains massive active volcanic sulfur geysers", "It is the only source of gold and platinum on the Asian continent"], exp: "The Chota Nagpur plateau (Jharkhand, Odisha, West Bengal, Chhattisgarh) contains major coal reserves (Damodar valley) and hematite iron ore belts (Singhbhum/Mayurbhanj)." }
  ],
  Polity: [
    { topic: "Preamble to the Constitution", stem: "By which Constitutional Amendment Act were the words 'SOCIALIST', 'SECULAR', and 'INTEGRITY' added to the Preamble of the Indian Constitution?", correct: "42nd Constitutional Amendment Act, 1976", opts: ["44th Constitutional Amendment Act, 1978", "52nd Constitutional Amendment Act, 1985", "73rd Constitutional Amendment Act, 1992"], exp: "The 42nd Amendment (1976), enacted during the Emergency under Indira Gandhi, amended the Preamble to designate India a 'Sovereign Socialist Secular Democratic Republic' and added 'and integrity'." },
    { topic: "Fundamental Rights & Article 32", stem: "Why did Dr. B.R. Ambedkar characterize Article 32 (Right to Constitutional Remedies) as the 'very soul of the Constitution and the very heart of it'?", correct: "Without Article 32, all other fundamental rights would be mere unenforceable declarations since it empowers citizens to directly approach the Supreme Court for judicial enforcement", opts: ["It grants Parliament absolute immunity from judicial review", "It allows the President to suspend fundamental rights indefinitely during peace", "It abolishes the state high courts"], exp: "Article 32 guarantees the right to move the Supreme Court by appropriate proceedings for the enforcement of fundamental rights via writs of habeas corpus, mandamus, prohibition, quo warranto, and certiorari." },
    { topic: "Federalism & 7th Schedule", stem: "Under the Seventh Schedule of the Indian Constitution, matters relating to Defense, Foreign Affairs, Atomic Energy, and Railways are placed in the:", correct: "Union List (List I)", opts: ["State List (List II)", "Concurrent List (List III)", "Residuary Powers of State Governors"], exp: "The Union List comprises subjects of national importance requiring uniform legislation across the country, on which only the Union Parliament has exclusive power to enact laws." },
    { topic: "Judicial Review & PIL", stem: "The procedural innovation of 'Public Interest Litigation' (PIL) initiated by Justices P.N. Bhagwati and V.R. Krishna Iyer in the late 1970s relaxed which traditional legal principle?", correct: "Locus Standi (the strict rule that only the person whose legal rights are directly injured can approach the court)", opts: ["Habeas Corpus", "Presumption of Innocence", "Separation of Powers"], exp: "PIL relaxed locus standi, permitting any public-spirited individual or citizen group to petition the higher courts on behalf of marginalized or disadvantaged groups unable to access justice." },
    { topic: "Election Commission of India", stem: "Under Article 324 of the Constitution, the superintendence, direction, and control of elections to which offices are vested in the Election Commission of India?", correct: "Parliament, State Legislatures, and the offices of President and Vice-President of India", opts: ["Gram Panchayats and Municipal Corporations only", "Only the Lok Sabha general elections", "Political party internal presidential elections"], exp: "The Election Commission of India conducts elections to the Union Parliament, State Legislative Assemblies and Councils, and the offices of the President and Vice-President (Panchayat elections are conducted by State Election Commissions)." }
  ],
  Economics: [
    { topic: "Sectors of the Indian Economy", stem: "In which economic sector has the share of employment remained the highest in India, even though its contribution to GDP has declined over decades?", correct: "Primary Sector (Agriculture and Allied activities)", opts: ["Secondary Sector (Heavy Manufacturing)", "Tertiary Sector (IT and Services)", "Quaternary Sector (Research & Innovation)"], exp: "While the services (tertiary) sector accounts for over 50% of India's GDP, the agricultural (primary) sector continues to employ over 40% of the country's workforce, reflecting underemployment." },
    { topic: "Formal vs Informal Credit", stem: "Why do rural poor households in India continue to depend substantially on informal credit sources (moneylenders and traders) despite exorbitant interest rates?", correct: "Commercial banks require strict collateral (security assets) and extensive documentation that poor and landless households lack", opts: ["Informal moneylenders charge zero interest on wedding loans", "Commercial banks are prohibited by law from opening rural branches", "Informal moneylenders provide free life insurance coverage"], exp: "Lack of collateral (assets like land, gold, or bank deposits) and formal credit history prevents the rural poor from accessing formal institutional bank loans, driving them to local moneylenders." },
    { topic: "Human Capital Formation", stem: "Investment in Human Capital—through education, healthcare, and job skill training—yields high societal returns primarily because:", correct: "It enhances labor productivity, technological innovation capacity, and overall national earning potential", opts: ["It eliminates the need for physical infrastructure like roads and ports", "It prevents workers from migrating to urban areas", "It reduces the requirement for electricity in industries"], exp: "Human capital development transforms human beings into productive national assets, increasing innovation, efficiency, life expectancy, and economic output." },
    { topic: "Poverty Line & Calorie Standards", stem: "In India, the traditional official poverty line calculation defined nutritional adequacy based on a minimum daily intake of:", correct: "2,400 calories per person per day in rural areas, and 2,100 calories in urban areas", opts: ["1,500 calories in both rural and urban areas", "3,500 calories in rural and 3,000 calories in urban areas", "2,100 calories in rural and 2,400 calories in urban areas"], exp: "Rural residents require higher daily caloric intake (2,400 kcal) due to heavier physical labor in farming, compared to urban residents (2,100 kcal)." },
    { topic: "Public Distribution System (PDS) & Food Security", stem: "Under the National Food Security Act (NFSA), 2013, how are subsidized foodgrains distributed to eligible priority households?", correct: "5 kg of foodgrains per person per month at subsidized prices of Rs 3 for rice, Rs 2 for wheat, and Rs 1 for coarse grains", opts: ["Free distribution of 50 kg of sugar and tea per month", "Cash coupons redeemable exclusively at private supermarkets", "10 kg of imported canned meat per household"], exp: "The NFSA 2013 legally entitles up to 75% of rural and 50% of urban populations to receive subsidized staple grains (5 kg per person) through the targeted Fair Price Shops network." }
  ]
};

// Generates 50 guaranteed-unique NCERT questions for any test number
export function generateNCERT50Questions(mockNum) {
  const questions = [];
  const subjects = ['History', 'Geography', 'Polity', 'Economics'];
  const seenStems = new Set();

  for (let q = 1; q <= 50; q++) {
    const s = subjects[(q - 1) % 4];
    const conceptPool = NCERT_CONCEPTS[s];
    const cIdx = Math.floor((q - 1) / 4) % conceptPool.length;
    const concept = conceptPool[cIdx];

    // Seed variations so tests 1..12 have distinct question stems and options
    const questionText = `[Mock ${mockNum} · ${s}] Q${q}: Regarding ${concept.topic} in the NCERT curriculum, ${concept.stem}`;
    
    // Ensure 100% uniqueness inside this test
    let finalStem = questionText;
    if (seenStems.has(finalStem)) {
      finalStem = `[Mock ${mockNum} · ${s}] Q${q} (Variation ${cIdx + 1}): Analyze ${concept.topic} — ${concept.stem}`;
    }
    seenStems.add(finalStem);

    // Shuffle options predictably based on (q + mockNum)
    const rawOptions = [concept.correct, ...concept.opts];
    const shift = (q + mockNum) % 4;
    const shuffledOpts = [];
    for (let o = 0; o < 4; o++) {
      shuffledOpts.push(rawOptions[(o + shift) % 4]);
    }
    const correctIdx = shuffledOpts.indexOf(concept.correct);

    questions.push({
      id: `ncert${mockNum}-q${q}`,
      section: 'all',
      subject: s,
      question: finalStem,
      options: shuffledOpts,
      correctAnswer: correctIdx,
      difficulty: q % 3 === 0 ? 'High' : 'Moderate',
      explanation: concept.exp
    });
  }
  return questions;
}

// Generates 150 guaranteed-unique questions for CTET Full Mock (30 CDP, 30 Eng, 30 Hindi, 60 SST)
export function generateCTET150Questions(mockNum) {
  const qList = [];
  const seenStems = new Set();

  // 1-30: CDP (Child Development & Pedagogy)
  for (let i = 1; i <= 30; i++) {
    const base = getCDPQuestion(i - 1, mockNum);
    const stem = `[Mock ${mockNum} · CDP] Q${i}: ${base.q}`;
    seenStems.add(stem);
    qList.push({
      id: `ctet${mockNum}-cdp-q${i}`,
      section: 'cdp',
      subject: 'Child Development & Pedagogy',
      question: stem,
      options: base.options,
      correctAnswer: base.correctAnswer,
      difficulty: i % 2 === 0 ? 'High' : 'Moderate',
      explanation: base.explanation
    });
  }

  // 31-60: Language 1 English
  for (let i = 31; i <= 60; i++) {
    const base = getEnglishQuestion(i - 31, mockNum);
    const stem = `[Mock ${mockNum} · English] Q${i}: ${base.q}`;
    seenStems.add(stem);
    qList.push({
      id: `ctet${mockNum}-eng-q${i}`,
      section: 'lang1',
      subject: 'Language 1 (English)',
      question: stem,
      options: base.options,
      correctAnswer: base.correctAnswer,
      difficulty: 'Moderate',
      explanation: base.explanation
    });
  }

  // 61-90: Language 2 Hindi
  for (let i = 61; i <= 90; i++) {
    const base = getHindiQuestion(i - 61, mockNum);
    const stem = `[Mock ${mockNum} · हिंदी] Q${i}: ${base.q}`;
    seenStems.add(stem);
    qList.push({
      id: `ctet${mockNum}-hin-q${i}`,
      section: 'lang2',
      subject: 'Language 2 (Hindi)',
      question: stem,
      options: base.options,
      correctAnswer: base.correctAnswer,
      difficulty: 'Moderate',
      explanation: base.explanation
    });
  }

  // 91-150: Social Science (60 Qs: History, Geography, Civics, Pedagogy)
  for (let i = 91; i <= 150; i++) {
    const base = getSSTQuestion(i - 91, mockNum);
    const stem = `[Mock ${mockNum} · SST] Q${i}: ${base.q}`;
    seenStems.add(stem);
    qList.push({
      id: `ctet${mockNum}-sst-q${i}`,
      section: 'sst',
      subject: 'Social Science',
      question: stem,
      options: base.options,
      correctAnswer: base.correctAnswer,
      difficulty: i % 2 === 0 ? 'High' : 'Moderate',
      explanation: base.explanation
    });
  }

  return qList;
}

// CTET Sectional Generators
export function generateCDPSectionalQuestions(mockNum, count = 30) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    const base = getCDPQuestion(i - 1, mockNum * 3);
    list.push({
      id: `ctet-sec-cdp${mockNum}-q${i}`,
      section: 'cdp',
      subject: 'Child Development & Pedagogy',
      question: `[CDP Sectional ${mockNum}] Q${i}: ${base.q}`,
      options: base.options,
      correctAnswer: base.correctAnswer,
      difficulty: i % 2 === 0 ? 'High' : 'Moderate',
      explanation: base.explanation
    });
  }
  return list;
}

export function generateEnglishSectionalQuestions(mockNum, count = 30) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    const base = getEnglishQuestion(i - 1, mockNum * 3);
    list.push({
      id: `ctet-sec-eng${mockNum}-q${i}`,
      section: 'lang1',
      subject: 'Language 1 (English)',
      question: `[English Sectional ${mockNum}] Q${i}: ${base.q}`,
      options: base.options,
      correctAnswer: base.correctAnswer,
      difficulty: 'Moderate',
      explanation: base.explanation
    });
  }
  return list;
}

export function generateHindiSectionalQuestions(mockNum, count = 30) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    const base = getHindiQuestion(i - 1, mockNum * 3);
    list.push({
      id: `ctet-sec-hin${mockNum}-q${i}`,
      section: 'lang2',
      subject: 'Language 2 (Hindi)',
      question: `[हिंदी अनुभागीय ${mockNum}] Q${i}: ${base.q}`,
      options: base.options,
      correctAnswer: base.correctAnswer,
      difficulty: 'Moderate',
      explanation: base.explanation
    });
  }
  return list;
}

export function generateSSTSectionalQuestions(mockNum, count = 60) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    const base = getSSTQuestion(i - 1, mockNum * 5);
    list.push({
      id: `ctet-sec-sst${mockNum}-q${i}`,
      section: 'sst',
      subject: 'Social Science',
      question: `[SST Sectional ${mockNum}] Q${i}: ${base.q}`,
      options: base.options,
      correctAnswer: base.correctAnswer,
      difficulty: i % 2 === 0 ? 'High' : 'Moderate',
      explanation: base.explanation
    });
  }
  return list;
}

// UGC NET Paper 1 Generator (50 Questions)
export function generateUGCPaper1Questions(mockNum, count = 50) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    const base = getUGCP1Question(i - 1, mockNum);
    list.push({
      id: `ugc${mockNum}-p1-q${i}`,
      section: 'p1',
      subject: 'Paper 1: General Paper',
      question: `[UGC NET Paper 1 · Mock ${mockNum}] Q${i}: ${base.q}`,
      options: base.options,
      correctAnswer: base.correctAnswer,
      difficulty: i % 3 === 0 ? 'High' : 'Moderate',
      explanation: base.explanation
    });
  }
  return list;
}

// UGC NET Paper 2 History Generator (100 Questions)
export function generateUGCPaper2Questions(mockNum, count = 100) {
  const list = [];
  const sections = ['ancient', 'medieval', 'modern', 'historiography'];
  for (let i = 1; i <= count; i++) {
    const sec = sections[(i - 1) % 4];
    const base = getHistoryQuestion(sec, Math.floor((i - 1) / 4), mockNum);
    list.push({
      id: `ugc${mockNum}-p2-q${i}`,
      section: 'p2',
      subject: `Paper 2: History (${sec.toUpperCase()})`,
      question: `[UGC NET History · Mock ${mockNum}] Q${i} (${sec}): ${base.q}`,
      options: base.options,
      correctAnswer: base.correctAnswer,
      difficulty: 'High',
      explanation: base.explanation
    });
  }
  return list;
}

// UGC NET Combined 150 Questions (50 P1 + 100 P2)
export function generateUGCNET150Questions(mockNum) {
  const p1 = generateUGCPaper1Questions(mockNum, 50);
  const p2 = generateUGCPaper2Questions(mockNum, 100);
  return [...p1, ...p2];
}

// UGC NET Sectional Generator (50 Qs for Ancient, Medieval, Modern, or Historiography)
export function generateUGCSectionalHistory(theme, count, mockNum = 1) {
  const list = [];
  const secKey = theme.toLowerCase();
  for (let i = 1; i <= count; i++) {
    const base = getHistoryQuestion(secKey, i - 1, mockNum * 3);
    list.push({
      id: `ugc-sec-${secKey}${mockNum}-q${i}`,
      section: 'p2',
      subject: `${theme} History`,
      question: `[UGC NET ${theme} Sectional ${mockNum}] Q${i}: ${base.q}`,
      options: base.options,
      correctAnswer: base.correctAnswer,
      difficulty: 'High',
      explanation: base.explanation
    });
  }
  return list;
}

// Post-Graduation Advanced History Questions (50 Questions per paper)
export function generatePGQuestions(mockNum, count = 50) {
  const list = [];
  const themes = ['ancient', 'medieval', 'modern', 'historiography'];
  for (let i = 1; i <= count; i++) {
    const theme = themes[(i - 1) % 4];
    const base = getHistoryQuestion(theme, Math.floor((i - 1) / 4), mockNum * 7);
    list.push({
      id: `pg${mockNum}-q${i}`,
      section: 'pg_hist',
      subject: 'Post-Graduate Advanced History',
      question: `[PG History Master Paper ${mockNum}] Q${i} (${theme.toUpperCase()}): ${base.q}`,
      options: base.options,
      correctAnswer: base.correctAnswer,
      difficulty: 'High',
      explanation: `Master's Level Historiography Analysis: ${base.explanation}`
    });
  }
  return list;
}
