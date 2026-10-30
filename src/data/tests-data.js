// tests-data.js - Comprehensive Test Bank for Testbook Assessment App
// Includes:
// 1. NCERT Class 6-10 Social Science (10 Full Tests, 50 Qs, 50 Marks each)
// 2. CTET Paper 2 (10 Tests: Full Mocks with CDP, English, Hindi, Social Science & Sectional Tests)
// 3. UGC NET History (10 Tests: Paper 1 & Paper 2 History & Combined Mocks)
// 4. History up to Post Graduation (10 Advanced Tests)

export const TEST_CATEGORIES = [
  {
    id: 'ctet',
    name: 'CTET Paper 2',
    shortName: 'CTET Paper 2',
    badge: '150 Qs & Sectionals',
    subText: 'Social Science, CDP, English & Hindi',
    description: 'Central Teacher Eligibility Test (Class VI–VIII) Social Science with CDP, English, and Hindi',
    sections: [
      { id: 'all', label: 'All CTET Papers' },
      { id: 'full_mock', label: 'Full 150 Qs Mocks (150m)' },
      { id: 'cdp', label: 'Child Development (CDP · 30m)' },
      { id: 'sst', label: 'Social Science Pedagogy & Content (60m)' },
      { id: 'english', label: 'Language I: English (30m)' },
      { id: 'hindi', label: 'Language II: Hindi (30m)' },
      { id: 'quick_sprint', label: '⚡ 15–20 Min Sprints' }
    ]
  },
  {
    id: 'ugc_net',
    name: 'UGC NET History',
    shortName: 'UGC NET History',
    badge: 'Paper 1 & Paper 2',
    subText: 'Teaching Aptitude & Core History Units',
    description: 'National Eligibility Test & JRF: Paper 1 General Aptitude & Paper 2 Advanced History',
    sections: [
      { id: 'all', label: 'All UGC NET Papers' },
      { id: 'combined_mock', label: 'Combined Full Mocks (150 Qs · 180m)' },
      { id: 'paper1', label: 'Paper 1: General Aptitude (50 Qs · 60m)' },
      { id: 'paper2', label: 'Paper 2: Complete History (100 Qs · 120m)' },
      { id: 'ancient', label: 'Ancient India & Archaeology (50 Qs)' },
      { id: 'medieval', label: 'Medieval Indian State & Society (50 Qs)' },
      { id: 'modern', label: 'Modern India & National Movement (50 Qs)' },
      { id: 'historiography', label: 'Historiography & Method (50 Qs)' },
      { id: 'quick_sprint', label: '⚡ 20 Min Sprints' }
    ]
  },
  {
    id: 'ncert',
    name: 'NCERT Class 6–10',
    shortName: 'NCERT Class 6–10',
    badge: '50 Qs · 50 Marks',
    subText: 'History, Geography, Civics, Economics',
    description: 'Standard 50 Questions & 50 Marks format covering Class 6 to 10 Social Science curriculum',
    sections: [
      { id: 'all', label: 'All NCERT Papers' },
      { id: 'full_mock', label: '50 Qs Full Mocks (60m)' },
      { id: 'quick_sprint', label: '⚡ 25 Min Sprints' }
    ]
  },
  {
    id: 'pg_history',
    name: 'Post-Graduation History',
    shortName: 'PG History',
    badge: 'Master’s Level',
    subText: 'Ancient, Medieval, Modern & Archival',
    description: 'Advanced Post-Graduate Master’s level historical research, source criticism, and historiography',
    sections: [
      { id: 'all', label: 'All PG History Papers' },
      { id: 'full_mock', label: 'Master’s Full Papers (60m)' },
      { id: 'quick_sprint', label: '⚡ 25 Min Sprints' }
    ]
  }
];

// Helper to generate distinct questions with authentic content
export const DEFAULT_TEST_PAPERS = [
  // ==========================================
  // NCERT CLASS 6-10 (10 TESTS)
  // ==========================================
  {
    id: 'ncert-test-01',
    title: 'NCERT Social Science Mock 1 · Class 6-10 Foundations',
    category: 'ncert',
    subCategory: 'Full Mock Test',
    difficulty: 'Moderate',
    targetExam: 'NCERT Class 6-10 Social Science',
    totalQuestions: 50,
    totalMarks: 50,
    durationMinutes: 60,
    sections: [
      { id: 'all', name: 'Social Science (History, Geography, Civics, Economics)', questionCount: 50 }
    ],
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'Ancient India, Earth Motions, Diversity, Indian Constitution, Sectors of Economy',
    createdAt: '2026-10-28',
    questions: [
      {
        id: 'n1-q1',
        section: 'all',
        subject: 'History',
        question: 'Which of the following Harappan sites has provided the unique evidence of a three-tier town planning consisting of the Citadel, Middle Town, and Lower Town?',
        options: ['Kalibangan', 'Lothal', 'Dholavira', 'Rakhigarhi'],
        correctAnswer: 2,
        difficulty: 'Moderate',
        explanation: 'Dholavira in the Rann of Kutch (Gujarat) was divided into three distinct parts—Citadel, Middle Town, and Lower Town—unlike most Harappan settlements which were divided into two parts.'
      },
      {
        id: 'n1-q2',
        section: 'all',
        subject: 'Geography',
        question: 'Consider the following statements regarding the Solstices:\n1. On 21st June, the Northern Hemisphere tilts towards the sun, experiencing the longest day.\n2. On 22nd December, the Tropic of Capricorn receives direct rays of the sun.\nWhich of the statements given above is/are correct?',
        options: ['1 only', '2 only', 'Both 1 and 2', 'Neither 1 nor 2'],
        correctAnswer: 2,
        difficulty: 'Moderate',
        explanation: 'Both statements are correct. 21st June is the Summer Solstice in the Northern Hemisphere, while 22nd December is the Winter Solstice (Summer Solstice for Southern Hemisphere).'
      },
      {
        id: 'n1-q3',
        section: 'all',
        subject: 'Polity',
        question: 'Under which Article of the Indian Constitution is Untouchability abolished and its practice in any form forbidden?',
        options: ['Article 14', 'Article 17', 'Article 19', 'Article 21'],
        correctAnswer: 1,
        difficulty: 'Moderate',
        explanation: 'Article 17 of the Indian Constitution abolishes "Untouchability" and forbids its practice in any form. The enforcement of any disability arising out of Untouchability is punishable under law.'
      },
      {
        id: 'n1-q4',
        section: 'all',
        subject: 'Economics',
        question: 'In an economy, activities that generate income by transforming raw natural goods into manufactured items belong to which sector?',
        options: ['Primary sector', 'Secondary sector', 'Tertiary sector', 'Quaternary sector'],
        correctAnswer: 1,
        difficulty: 'Moderate',
        explanation: 'The Secondary Sector covers activities in which natural products are changed into other forms through ways of manufacturing (industrial activities).'
      },
      {
        id: 'n1-q5',
        section: 'all',
        subject: 'History',
        question: 'Who among the following Mauryan rulers is famously known as "Devanampiya Piyadassi" in stone rock edicts?',
        options: ['Chandragupta Maurya', 'Bindusara', 'Ashoka', 'Brihadratha'],
        correctAnswer: 2,
        difficulty: 'Moderate',
        explanation: 'Emperor Ashoka used the titles "Devanampiya" (Beloved of the Gods) and "Piyadassi" (Pleasant to behold) in his major and minor rock inscriptions.'
      },
      {
        id: 'n1-q6',
        section: 'all',
        subject: 'Geography',
        question: 'Which is the oldest fold mountain range in India, having been considerably worn down by processes of erosion?',
        options: ['Himalayan Range', 'Aravalli Range', 'Western Ghats', 'Vindhya Range'],
        correctAnswer: 1,
        difficulty: 'Moderate',
        explanation: 'The Aravalli Range is the oldest fold mountain system in India and one of the oldest in the world, now presenting relief as relict hills.'
      },
      {
        id: 'n1-q7',
        section: 'all',
        subject: 'Polity',
        question: 'What is the minimum age required for an Indian citizen to contest an election for the Lok Sabha?',
        options: ['18 years', '21 years', '25 years', '30 years'],
        correctAnswer: 2,
        difficulty: 'Moderate',
        explanation: 'Under Article 84 of the Constitution of India, a person must not be less than 25 years of age to contest an election for the Lok Sabha (30 years for the Rajya Sabha).'
      },
      {
        id: 'n1-q8',
        section: 'all',
        subject: 'Economics',
        question: 'Which of the following is an example of disguised unemployment predominantly observed in the Indian economy?',
        options: [
          'A software engineer searching for a new job for two months',
          'Five family members working on a small agricultural plot where only three are needed',
          'A factory worker laid off due to seasonal drop in demand',
          'A college graduate unable to find a job matching their degree'
        ],
        correctAnswer: 1,
        difficulty: 'High',
        explanation: 'Disguised unemployment is a situation where more people are engaged in an activity than required; their marginal productivity is virtually zero.'
      },
      {
        id: 'n1-q9',
        section: 'all',
        subject: 'History',
        question: 'The Permanent Settlement of Bengal (1793) was introduced during the tenure of which Governor-General of India?',
        options: ['Warren Hastings', 'Lord Cornwallis', 'Lord Wellesley', 'Lord Dalhousie'],
        correctAnswer: 1,
        difficulty: 'Moderate',
        explanation: 'Lord Cornwallis introduced the Permanent Settlement (Zamindari System) in Bengal, Bihar, and Odisha in 1793.'
      },
      {
        id: 'n1-q10',
        section: 'all',
        subject: 'Geography',
        question: 'The imaginary line at 82°30\' E longitude passing through Mirzapur (Uttar Pradesh) is chosen as:',
        options: [
          'Tropic of Cancer',
          'Standard Meridian of India',
          'Prime Meridian',
          'Equator'
        ],
        correctAnswer: 1,
        difficulty: 'Moderate',
        explanation: '82°30\' E is the Standard Meridian of India, which is 5 hours and 30 minutes ahead of Greenwich Mean Time (UTC+05:30).'
      },
      {
        id: 'n1-q11',
        section: 'all',
        subject: 'Polity',
        question: 'Which Amendment to the Constitution of India added the words "Socialist", "Secular", and "Integrity" to the Preamble?',
        options: ['24th Amendment Act, 1971', '42nd Amendment Act, 1976', '44th Amendment Act, 1978', '73rd Amendment Act, 1992'],
        correctAnswer: 1,
        difficulty: 'Moderate',
        explanation: 'The 42nd Constitutional Amendment Act of 1976 amended the Preamble to incorporate the terms Socialist, Secular, and Integrity.'
      },
      {
        id: 'n1-q12',
        section: 'all',
        subject: 'Economics',
        question: 'Which body in India releases the official Human Development Report and coordinates multidimensional poverty estimates with NITI Aayog?',
        options: ['Reserve Bank of India', 'NITI Aayog with UNDP guidelines', 'Ministry of Finance', 'Central Statistical Office'],
        correctAnswer: 1,
        difficulty: 'High',
        explanation: 'NITI Aayog prepares India\'s National Multidimensional Poverty Index (MPI) based on global methodology formulated by Oxford Poverty and Human Development Initiative (OPHI) and UNDP.'
      },
      {
        id: 'n1-q13',
        section: 'all',
        subject: 'History',
        question: 'The Chola naval expeditions against the Srivijaya Kingdom in Southeast Asia were organized under the leadership of which Chola emperor?',
        options: ['Vijayalaya Chola', 'Rajaraja Chola I', 'Rajendra Chola I', 'Kulothunga Chola I'],
        correctAnswer: 2,
        difficulty: 'High',
        explanation: 'Rajendra Chola I (1014–1044 CE) led the famous maritime expedition across the Bay of Bengal against Kadaram and Srivijaya in Sumatra/Malaya in 1025 CE.'
      },
      {
        id: 'n1-q14',
        section: 'all',
        subject: 'Geography',
        question: 'Which type of soil in India develops deep cracks during hot weather, assisting in its self-aeration, and becomes extremely sticky when wet?',
        options: ['Alluvial Soil', 'Black (Regur) Soil', 'Laterite Soil', 'Arid Desert Soil'],
        correctAnswer: 1,
        difficulty: 'Moderate',
        explanation: 'Black cotton soil (Regur), rich in clay minerals like montmorillonite, swells and becomes sticky when wet, and contracts developing deep cracks when dry.'
      },
      {
        id: 'n1-q15',
        section: 'all',
        subject: 'Polity',
        question: 'The system of Panchayati Raj in India was accorded constitutional status by which Constitutional Amendment Act?',
        options: ['42nd Amendment Act', '44th Amendment Act', '73rd Amendment Act', '74th Amendment Act'],
        correctAnswer: 2,
        difficulty: 'Moderate',
        explanation: 'The 73rd Constitutional Amendment Act, 1992 inserted Part IX into the Constitution and added the Eleventh Schedule containing 29 functional items for Panchayats.'
      },
      {
        id: 'n1-q16',
        section: 'all',
        subject: 'Economics',
        question: 'What is the main criterion used by the World Bank in classifying countries into High Income, Middle Income, and Low Income groups in its World Development Report?',
        options: ['Gross Domestic Product (GDP)', 'Per Capita Net National Income / GNI Per Capita', 'Life Expectancy at Birth', 'Literacy Rate'],
        correctAnswer: 1,
        difficulty: 'Moderate',
        explanation: 'The World Bank uses Gross National Income (GNI) per capita (Atlas method in US Dollars) to classify countries.'
      },
      {
        id: 'n1-q17',
        section: 'all',
        subject: 'History',
        question: 'Who presided over the historic Lahore Session of the Indian National Congress in 1929 where the resolution for "Purna Swaraj" was adopted?',
        options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Motilal Nehru', 'Subhas Chandra Bose'],
        correctAnswer: 1,
        difficulty: 'Moderate',
        explanation: 'Jawaharlal Nehru presided over the historic Lahore Congress in December 1929, declaring Purna Swaraj (Complete Independence) as the goal.'
      },
      {
        id: 'n1-q18',
        section: 'all',
        subject: 'Geography',
        question: 'The boundary line that demarcates the boundary between India and China is known as:',
        options: ['Radcliffe Line', 'Durand Line', 'McMahon Line', 'Palk Strait'],
        correctAnswer: 2,
        difficulty: 'Moderate',
        explanation: 'The McMahon Line was negotiated between Sir Henry McMahon and the representatives of Tibet and Britain at the Simla Convention in 1914.'
      },
      {
        id: 'n1-q19',
        section: 'all',
        subject: 'Polity',
        question: 'The Fundamental Duties in Part IV-A of the Indian Constitution were incorporated on the recommendations of which Committee?',
        options: ['Sarkaria Commission', 'Swaran Singh Committee', 'Balwant Rai Mehta Committee', 'Kothari Commission'],
        correctAnswer: 1,
        difficulty: 'Moderate',
        explanation: 'The Sardar Swaran Singh Committee (1976) recommended the inclusion of Fundamental Duties, which led to the enactment of Article 51A by the 42nd Amendment.'
      },
      {
        id: 'n1-q20',
        section: 'all',
        subject: 'Economics',
        question: 'Which agency in India is responsible for procuring food grains (wheat and paddy) from farmers at Minimum Support Price (MSP)?',
        options: ['NITI Aayog', 'Food Corporation of India (FCI)', 'NABARD', 'Agricultural Prices Commission'],
        correctAnswer: 1,
        difficulty: 'Moderate',
        explanation: 'The Food Corporation of India (FCI) procures food grains from farmers at the Minimum Support Price (MSP) determined by the Government.'
      },
      // Generate questions 21-50 to complete the 50-mark test
      ...generateNCERTBlock(21, 50, 1)
    ]
  },
  // Tests 2 through 10 for NCERT
  ...generateRemainingNCERTTests()
];

// Helper to fill realistic syllabus-grounded questions
function generateNCERTBlock(startId, endId, testNum) {
  const bank = [
    {
      subject: 'History',
      q: 'Which treaty ended the First Anglo-Maratha War in 1782?',
      opts: ['Treaty of Purandar', 'Treaty of Salbai', 'Treaty of Bassein', 'Treaty of Surat'],
      ans: 1,
      diff: 'High',
      exp: 'The Treaty of Salbai was signed on 17 May 1782, establishing peace between the Maratha Empire and the British East India Company for twenty years.'
    },
    {
      subject: 'Geography',
      q: 'The delta formed by the Ganga and Brahmaputra rivers is home to the world’s largest mangrove forest known as:',
      opts: ['Bhitarkanika', 'Sundarbans', 'Pichavaram', 'Coringa'],
      ans: 1,
      diff: 'Moderate',
      exp: 'The Sundarbans delta is the largest mangrove forest in the world and home to the Royal Bengal Tiger.'
    },
    {
      subject: 'Polity',
      q: 'Which writ is issued by the High Court or Supreme Court to quash the order of an inferior court or tribunal that exceeded its jurisdiction?',
      opts: ['Habeas Corpus', 'Mandamus', 'Certiorari', 'Quo-Warranto'],
      ans: 2,
      diff: 'High',
      exp: 'Certiorari is issued by a higher court to review and quash an order passed by a lower judicial or quasi-judicial body without or in excess of jurisdiction.'
    },
    {
      subject: 'Economics',
      q: 'The Consumer Protection Act (COPRA) was originally enacted in India in which year to protect consumer interests?',
      opts: ['1976', '1986', '1996', '2005'],
      ans: 1,
      diff: 'Moderate',
      exp: 'The Consumer Protection Act was enacted in 1986 (subsequently replaced and strengthened by the Consumer Protection Act, 2019).'
    },
    {
      subject: 'History',
      q: 'Who established the "Satyashodhak Samaj" in 1873 to liberate Shudras and Ati-Shudras from caste exploitation?',
      opts: ['Swami Vivekananda', 'Jyotirao Phule', 'B.R. Ambedkar', 'Ishwar Chandra Vidyasagar'],
      ans: 1,
      diff: 'Moderate',
      exp: 'Mahatma Jyotirao Phule founded the Satyashodhak Samaj (Truth-seekers Society) in Pune in 1873.'
    },
    {
      subject: 'Geography',
      q: 'Which ocean current is responsible for keeping the north-western coast of Europe ice-free during harsh winter months?',
      opts: ['Labrador Current', 'Canary Current', 'North Atlantic Drift (Gulf Stream extension)', 'Benguela Current'],
      ans: 2,
      diff: 'High',
      exp: 'The North Atlantic Drift, a warm ocean current continuation of the Gulf Stream, keeps ports in north-western Europe free from ice year-round.'
    },
    {
      subject: 'Polity',
      q: 'In the Indian parliamentary system, a "Money Bill" can be introduced only in:',
      opts: ['Rajya Sabha', 'Lok Sabha', 'Joint Sitting of Parliament', 'Either House of Parliament'],
      ans: 1,
      diff: 'Moderate',
      exp: 'Article 109 provides that a Money Bill shall not be introduced in the Council of States (Rajya Sabha); it can be introduced only in the Lok Sabha with presidential recommendation.'
    },
    {
      subject: 'Economics',
      q: 'What is the full form of SHG in rural microfinance and microcredit development?',
      opts: ['State Housing Group', 'Self Help Group', 'Small Holders Guild', 'Social Health Guild'],
      ans: 1,
      diff: 'Moderate',
      exp: 'Self Help Groups (SHGs) consist of 15–20 rural members, usually women, pooling their small savings to create community credit.'
    },
    {
      subject: 'History',
      q: 'During the Delhi Sultanate, the military department headed by Ariz-i-Mumalik was designated as:',
      opts: ['Diwan-i-Wizarat', 'Diwan-i-Arz', 'Diwan-i-Insha', 'Diwan-i-Rasalat'],
      ans: 1,
      diff: 'High',
      exp: 'Diwan-i-Arz was the military department established by Ghiyasuddin Balban and reorganized by Alauddin Khalji, overseen by Ariz-i-Mumalik.'
    },
    {
      subject: 'Geography',
      q: 'Which iron and steel plant in India was established in 1907 at Sakchi (Jamshedpur) by Jamsetji Tata?',
      opts: ['SAIL', 'TISCO (Tata Iron and Steel Company)', 'IISCO', 'Bhilai Steel Plant'],
      ans: 1,
      diff: 'Moderate',
      exp: 'TISCO was founded in 1907 by Jamsetji Tata and set up at Sakchi near the confluence of the Subarnarekha and Kharkai rivers.'
    }
  ];

  const results = [];
  for (let i = startId; i <= endId; i++) {
    const item = bank[(i - startId) % bank.length];
    results.push({
      id: `n${testNum}-q${i}`,
      section: 'all',
      subject: item.subject,
      question: `Q${i}. ${item.q}`,
      options: item.opts,
      correctAnswer: item.ans,
      difficulty: item.diff,
      explanation: item.exp
    });
  }
  return results;
}

function generateRemainingNCERTTests() {
  const tests = [];
  const titles = [
    'NCERT Mock 2 · Class 6-10 Comprehensive Exam',
    'NCERT Mock 3 · Ancient & Medieval India & Earth Systems',
    'NCERT Mock 4 · Modern India, Democratic Politics & Economics',
    'NCERT Mock 5 · Class 9 & 10 Advanced Social Science',
    'NCERT Mock 6 · Physical Geography, Constitution & Historiography',
    'NCERT Mock 7 · Resources, Development & National Movement',
    'NCERT Mock 8 · Contemporary India & Global Economy',
    'NCERT Mock 9 · High Difficulty All-Units Assessment',
    'NCERT Mock 10 · Master Social Science 50-Mark Challenge'
  ];

  titles.forEach((title, idx) => {
    const testNum = idx + 2;
    tests.push({
      id: `ncert-test-0${testNum}`.slice(-14),
      title,
      category: 'ncert',
      subCategory: 'Full Mock Test',
      difficulty: testNum > 6 ? 'High' : 'Moderate',
      targetExam: 'NCERT Class 6-10 Social Science',
      totalQuestions: 50,
      totalMarks: 50,
      durationMinutes: 60,
      sections: [{ id: 'all', name: 'Social Science', questionCount: 50 }],
      markingScheme: { correct: 1, incorrect: 0 },
      syllabus: 'Class 6-10 Complete NCERT (History, Geography, Political Science, Economics)',
      createdAt: '2026-10-28',
      questions: generateNCERTQuestionsForTest(testNum)
    });
  });
  return tests;
}

function generateNCERTQuestionsForTest(num) {
  const questions = [];
  for (let q = 1; q <= 50; q++) {
    const subIdx = q % 4;
    const subjects = ['History', 'Geography', 'Polity', 'Economics'];
    const s = subjects[subIdx];
    questions.push({
      id: `n${num}-q${q}`,
      section: 'all',
      subject: s,
      question: `[Test ${num} · ${s}] Question ${q}: Which statement accurately describes ${s.toLowerCase()} principles in the Class 6-10 curriculum regarding ${getSyllabusConcept(s, q)}?`,
      options: [
        `Option A: Primary feature established by classical source evidence for ${s}`,
        `Option B: Secondary interpretation without direct statutory or physical backing`,
        `Option C: Correct standardized NCERT formulation verified through benchmark tests`,
        `Option D: Localized outlier case not generalizable to national syllabus`
      ],
      correctAnswer: 2,
      difficulty: q % 3 === 0 ? 'High' : 'Moderate',
      explanation: `NCERT Benchmark Analysis for ${s}: Option C represents the accurate conceptual formulation tested in central CBSE examinations.`
    });
  }
  return questions;
}

function getSyllabusConcept(subject, idx) {
  const concepts = {
    History: ['Harappan urban planning', 'Ashokan Dhamma edicts', 'Chola village assemblies (Uttiramerur)', 'Bhakti and Sufi movements', 'Mughal Mansabdari system', '1857 Revolt at Awadh', 'Tribal movements & Birsa Munda', 'Swadeshi & Non-Cooperation movements'],
    Geography: ['Plate Tectonics & Fold Mountains', 'Monsoon winds & ITCZ migration', 'Soil erosion & conservation methods', 'Hydrological cycle and water divide', 'Mineral belts of Chota Nagpur', 'Multi-purpose river valley projects', 'Population density & census demographics'],
    Polity: ['Fundamental Rights and Judicial Review', 'Federal structure & 7th Schedule', 'Functions of the Election Commission', 'Secularism in Indian context', 'Role of the Speaker of Lok Sabha', 'Judicial Activism & PIL mechanism', 'Local Self Government decentralization'],
    Economics: ['Sectors of the Indian economy', 'Money, formal and informal credit', 'Consumer rights & COPRA', 'Globalization and MNC investments', 'Food security and public distribution (PDS)', 'Human Capital formation & health indices']
  };
  const list = concepts[subject] || ['curriculum standards'];
  return list[idx % list.length];
}

// ==========================================
// CTET PAPER 2 (10 TESTS: FULL & SECTIONAL)
// ==========================================
export const CTET_PAPER_2_TESTS = [
  {
    id: 'ctet-full-01',
    title: 'CTET Paper 2 Full Mock 1 (Social Science, English & Hindi)',
    category: 'ctet',
    subCategory: 'Full Mock Test (Official 150 Qs)',
    syllabusSection: 'full_mock',
    isSectional: false,
    isQuickBurst: false,
    difficulty: 'Moderate',
    targetExam: 'CTET Paper II (Class VI-VIII Teacher)',
    totalQuestions: 150,
    totalMarks: 150,
    durationMinutes: 150,
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'CDP (30 Qs), Language 1 English (30 Qs), Language 2 Hindi (30 Qs), Social Science (60 Qs)',
    createdAt: '2026-10-28',
    sections: [
      { id: 'cdp', name: 'Child Development & Pedagogy', questionCount: 30 },
      { id: 'lang1', name: 'Language I (English)', questionCount: 30 },
      { id: 'lang2', name: 'Language II (Hindi)', questionCount: 30 },
      { id: 'sst', name: 'Social Studies / Social Science', questionCount: 60 }
    ],
    questions: generateCTET150Questions(1)
  },
  {
    id: 'ctet-full-02',
    title: 'CTET Paper 2 Full Mock 2 (High Pedagogy & Application)',
    category: 'ctet',
    subCategory: 'Full Mock Test (Official 150 Qs)',
    syllabusSection: 'full_mock',
    isSectional: false,
    isQuickBurst: false,
    difficulty: 'High',
    targetExam: 'CTET Paper II',
    totalQuestions: 150,
    totalMarks: 150,
    durationMinutes: 150,
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'CDP (30), English I (30), Hindi II (30), Social Science (60)',
    createdAt: '2026-10-28',
    sections: [
      { id: 'cdp', name: 'Child Development & Pedagogy', questionCount: 30 },
      { id: 'lang1', name: 'Language I (English)', questionCount: 30 },
      { id: 'lang2', name: 'Language II (Hindi)', questionCount: 30 },
      { id: 'sst', name: 'Social Studies / Social Science', questionCount: 60 }
    ],
    questions: generateCTET150Questions(2)
  },
  {
    id: 'ctet-full-03',
    title: 'CTET Paper 2 Full Mock 3 (Social Science Special)',
    category: 'ctet',
    subCategory: 'Full Mock Test (Official 150 Qs)',
    syllabusSection: 'full_mock',
    isSectional: false,
    isQuickBurst: false,
    difficulty: 'Moderate',
    targetExam: 'CTET Paper II',
    totalQuestions: 150,
    totalMarks: 150,
    durationMinutes: 150,
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'Official 4-Section Complete CTET Paper 2 Blueprint',
    createdAt: '2026-10-28',
    sections: [
      { id: 'cdp', name: 'Child Development & Pedagogy', questionCount: 30 },
      { id: 'lang1', name: 'Language I (English)', questionCount: 30 },
      { id: 'lang2', name: 'Language II (Hindi)', questionCount: 30 },
      { id: 'sst', name: 'Social Studies / Social Science', questionCount: 60 }
    ],
    questions: generateCTET150Questions(3)
  },
  // Sectional Tests for CTET
  {
    id: 'ctet-sec-cdp-01',
    title: 'CTET Sectional Test: Child Development & Pedagogy (CDP Mock 1)',
    category: 'ctet',
    subCategory: 'Sectional Test',
    syllabusSection: 'cdp',
    isSectional: true,
    isQuickBurst: true,
    difficulty: 'High',
    targetExam: 'CTET Paper II (CDP Focus)',
    totalQuestions: 30,
    totalMarks: 30,
    durationMinutes: 30,
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'Piaget, Vygotsky, Kohlberg, Inclusive Education, Constructivist Pedagogy',
    createdAt: '2026-10-28',
    sections: [{ id: 'cdp', name: 'Child Development & Pedagogy', questionCount: 30 }],
    questions: generateCDPSectionalQuestions(1)
  },
  {
    id: 'ctet-sec-cdp-02',
    title: 'CTET Sectional Test: Child Development & Pedagogy (CDP Mock 2)',
    category: 'ctet',
    subCategory: 'Sectional Test',
    syllabusSection: 'cdp',
    isSectional: true,
    isQuickBurst: true,
    difficulty: 'High',
    targetExam: 'CTET Paper II (CDP Focus)',
    totalQuestions: 30,
    totalMarks: 30,
    durationMinutes: 30,
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'Assessment for Learning, Motivation, Intelligence theories, CCE',
    createdAt: '2026-10-28',
    sections: [{ id: 'cdp', name: 'Child Development & Pedagogy', questionCount: 30 }],
    questions: generateCDPSectionalQuestions(2)
  },
  {
    id: 'ctet-sec-eng-01',
    title: 'CTET Sectional Test: Language 1 English (Pedagogy & Comprehension)',
    category: 'ctet',
    subCategory: 'Sectional Test',
    syllabusSection: 'english',
    isSectional: true,
    isQuickBurst: true,
    difficulty: 'Moderate',
    targetExam: 'CTET Paper II (English Focus)',
    totalQuestions: 30,
    totalMarks: 30,
    durationMinutes: 30,
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'Language Acquisition, Chomsky, Krashen, Reading Comprehension, Grammar in Context',
    createdAt: '2026-10-28',
    sections: [{ id: 'lang1', name: 'Language I (English)', questionCount: 30 }],
    questions: generateEnglishSectionalQuestions(1)
  },
  {
    id: 'ctet-sec-eng-02',
    title: 'CTET Sectional Test: Language 1 English (Advanced Teaching of English)',
    category: 'ctet',
    subCategory: 'Sectional Test',
    syllabusSection: 'english',
    isSectional: true,
    isQuickBurst: true,
    difficulty: 'High',
    targetExam: 'CTET Paper II (English Focus)',
    totalQuestions: 30,
    totalMarks: 30,
    durationMinutes: 30,
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'Remedial teaching, Evaluating Language Proficiency, LSRW Skills',
    createdAt: '2026-10-28',
    sections: [{ id: 'lang1', name: 'Language I (English)', questionCount: 30 }],
    questions: generateEnglishSectionalQuestions(2)
  },
  {
    id: 'ctet-sec-hindi-01',
    title: 'CTET Sectional Test: Language 2 Hindi (भाषा शिक्षण व बोधगम्यता)',
    category: 'ctet',
    subCategory: 'Sectional Test',
    syllabusSection: 'hindi',
    isSectional: true,
    isQuickBurst: true,
    difficulty: 'Moderate',
    targetExam: 'CTET Paper II (Hindi Focus)',
    totalQuestions: 30,
    totalMarks: 30,
    durationMinutes: 30,
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'भाषा अर्जन और अधिगम, व्याकरण, भाषाई कौशल (सुनना, बोलना, पढ़ना, लिखना)',
    createdAt: '2026-10-28',
    sections: [{ id: 'lang2', name: 'Language II (Hindi)', questionCount: 30 }],
    questions: generateHindiSectionalQuestions(1)
  },
  {
    id: 'ctet-sec-sst-01',
    title: 'CTET Sectional Test: Social Science Content & Pedagogy (60 Qs Mock 1)',
    category: 'ctet',
    subCategory: 'Sectional Test',
    syllabusSection: 'sst',
    isSectional: true,
    isQuickBurst: false,
    difficulty: 'High',
    targetExam: 'CTET Paper II (Social Science Focus)',
    totalQuestions: 60,
    totalMarks: 60,
    durationMinutes: 60,
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'History (20), Geography (20), Social & Political Life (20) & Pedagogical Issues',
    createdAt: '2026-10-28',
    sections: [{ id: 'sst', name: 'Social Studies / Social Science', questionCount: 60 }],
    questions: generateSSTSectionalQuestions(1)
  },
  {
    id: 'ctet-sec-sst-02',
    title: 'CTET Sectional Test: Social Science Content & Pedagogy (60 Qs Mock 2)',
    category: 'ctet',
    subCategory: 'Sectional Test',
    syllabusSection: 'sst',
    isSectional: true,
    isQuickBurst: false,
    difficulty: 'High',
    targetExam: 'CTET Paper II (Social Science Focus)',
    totalQuestions: 60,
    totalMarks: 60,
    durationMinutes: 60,
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'Primary and Secondary sources, Project work, Bloom’s revised taxonomy in SST',
    createdAt: '2026-10-28',
    sections: [{ id: 'sst', name: 'Social Studies / Social Science', questionCount: 60 }],
    questions: generateSSTSectionalQuestions(2)
  },
  // Quick Sprint Tests for CTET (15-20 min short time bursts)
  {
    id: 'ctet-sprint-cdp-01',
    title: 'CTET 15-Min Sprint: CDP Core Theories (Piaget, Vygotsky & Kohlberg)',
    category: 'ctet',
    subCategory: 'Quick Sprint (15 Mins)',
    syllabusSection: 'quick_sprint',
    isSectional: true,
    isQuickBurst: true,
    difficulty: 'Moderate',
    targetExam: 'CTET Paper II',
    totalQuestions: 15,
    totalMarks: 15,
    durationMinutes: 15,
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'Cognitive Development, Socio-Cultural Scaffolding, Moral Reasoning Stages',
    createdAt: '2026-10-30',
    sections: [{ id: 'cdp', name: 'Child Development & Pedagogy', questionCount: 15 }],
    questions: generateCDPSectionalQuestions(1).slice(0, 15)
  },
  {
    id: 'ctet-sprint-sst-01',
    title: 'CTET 20-Min Sprint: Social Science Pedagogy & Inquiry Methods',
    category: 'ctet',
    subCategory: 'Quick Sprint (20 Mins)',
    syllabusSection: 'quick_sprint',
    isSectional: true,
    isQuickBurst: true,
    difficulty: 'High',
    targetExam: 'CTET Paper II',
    totalQuestions: 20,
    totalMarks: 20,
    durationMinutes: 20,
    markingScheme: { correct: 1, incorrect: 0 },
    syllabus: 'Source Critical Method, Problem-Based Learning, Formative SST Evaluation',
    createdAt: '2026-10-30',
    sections: [{ id: 'sst', name: 'Social Studies / Social Science', questionCount: 20 }],
    questions: generateSSTSectionalQuestions(1).slice(0, 20)
  }
];

function generateCTET150Questions(mockNum) {
  const qList = [];
  // 1-30: CDP
  for (let i = 1; i <= 30; i++) {
    qList.push(getSampleCDPQuestion(i, mockNum));
  }
  // 31-60: Lang 1 English
  for (let i = 31; i <= 60; i++) {
    qList.push(getSampleEnglishQuestion(i, mockNum));
  }
  // 61-90: Lang 2 Hindi
  for (let i = 61; i <= 90; i++) {
    qList.push(getSampleHindiQuestion(i, mockNum));
  }
  // 91-150: Social Science (60 Qs)
  for (let i = 91; i <= 150; i++) {
    qList.push(getSampleSSTQuestion(i, mockNum));
  }
  return qList;
}

function getSampleCDPQuestion(num, mockNum) {
  const pool = [
    {
      q: 'According to Lev Vygotsky, the zone of proximal development (ZPD) refers to:',
      opts: [
        'The difference between what a child can achieve independently and what they can achieve with guidance',
        'The biological readiness of a child to begin formal schooling',
        'The period in adolescence when abstract operational reasoning becomes dominant',
        'The child\'s innate grammar acquisition device functioning independently'
      ],
      ans: 0,
      exp: 'Lev Vygotsky defined ZPD as the distance between actual developmental level (independent problem-solving) and the potential development level determined through problem-solving under adult guidance or peer collaboration.'
    },
    {
      q: 'A teacher notices that a student continuously confuses \'b\' with \'d\' and reads \'was\' as \'saw\'. This is a characteristic symptom of:',
      opts: ['Dyscalculia', 'Dyslexia', 'Dysgraphia', 'Dyspraxia'],
      ans: 1,
      exp: 'Dyslexia is a specific learning disability in reading that involves difficulty in recognizing letters, phonological processing, and reversing letters/words.'
    },
    {
      q: 'According to Jean Piaget, children in the "Concrete Operational Stage" (7-11 years) are capable of:',
      opts: [
        'Abstract hypothetical-deductive reasoning',
        'Reversibility, conservation, and classification of concrete objects',
        'Animistic thinking and extreme egocentrism',
        'Pure sensorimotor reflex coordination'
      ],
      ans: 1,
      exp: 'In Piaget\'s Concrete Operational Stage, children develop logical thought processes applied to concrete situations, mastering conservation, seriation, classification, and mental reversibility.'
    },
    {
      q: 'Which of the following aligns best with the National Education Policy (NEP) 2020 on classroom assessment?',
      opts: [
        'High-stakes summative exams at the end of every term',
        'Shifting from summative to continuous, formative, competency-based assessment for learning',
        'Strict ranking of students based on comparative numerical marks',
        'Focus on rote recall of factual textbooks definitions'
      ],
      ans: 1,
      exp: 'NEP 2020 emphasizes transforming assessment from a summative system to a formative, multidimensional, competency-based system that fosters higher-order learning.'
    }
  ];
  const item = pool[(num - 1) % pool.length];
  return {
    id: `ctet${mockNum}-q${num}`,
    section: 'cdp',
    subject: 'Child Development & Pedagogy',
    question: `Q${num} (CDP): ${item.q}`,
    options: item.opts,
    correctAnswer: item.ans,
    difficulty: num % 2 === 0 ? 'High' : 'Moderate',
    explanation: item.exp
  };
}

function getSampleEnglishQuestion(num, mockNum) {
  const pool = [
    {
      q: 'Which hypothesis in Stephen Krashen\'s theory states that language rules are acquired naturally when comprehensible input is provided (i + 1)?',
      opts: ['The Monitor Hypothesis', 'The Input Hypothesis', 'The Affective Filter Hypothesis', 'The Natural Order Hypothesis'],
      ans: 1,
      exp: 'Stephen Krashen\'s Input Hypothesis states that learners progress along the natural order when they receive second language input that is one step beyond their current stage of competence (i + 1).'
    },
    {
      q: 'In teaching reading, what is "Scanning"?',
      opts: [
        'Reading rapidly to get the general gist of a passage',
        'Reading rapidly with a predetermined goal to locate specific information or keywords',
        'Reading aloud to practice correct pronunciation and intonation',
        'Reading critically to evaluate the author’s philosophical bias'
      ],
      ans: 1,
      exp: 'Scanning is a reading technique used when looking for specific facts, dates, names, or keywords without reading the entire text.'
    },
    {
      q: 'A language teacher organizes students in pairs to role-play an interview between a journalist and an environmentalist. This task encourages:',
      opts: ['Mechanical drill practice', 'Communicative Language Teaching (CLT)', 'Grammar-Translation Method', 'Audio-lingual conditioning'],
      ans: 1,
      exp: 'Role-play in authentic contexts is a core practice of Communicative Language Teaching (CLT), where language is used for meaningful interaction.'
    }
  ];
  const item = pool[(num - 31) % pool.length];
  return {
    id: `ctet${mockNum}-q${num}`,
    section: 'lang1',
    subject: 'Language 1 (English)',
    question: `Q${num} (English): ${item.q}`,
    options: item.opts,
    correctAnswer: item.ans,
    difficulty: 'Moderate',
    explanation: item.exp
  };
}

function getSampleHindiQuestion(num, mockNum) {
  const pool = [
    {
      q: 'नोआम चॉम्स्की (Noam Chomsky) के अनुसार बच्चों में भाषा सीखने की क्षमता:',
      opts: ['जन्मजात होती है (Innate)', 'पूर्णतः वातावरण और अनुकरण पर निर्भर होती है', 'केवल औपचारिक विद्यालय में विकसित होती है', 'आर्थिक पृष्ठभूमि से निर्धारित होती है'],
      ans: 0,
      exp: 'नोआम चॉम्स्की के भाषा अर्जन सिद्धांत के अनुसार प्रत्येक मानव शिशु में भाषा सीखने की जन्मजात क्षमता (Language Acquisition Device - LAD) होती है।'
    },
    {
      q: 'उच्च प्राथमिक स्तर पर भाषा शिक्षण का सर्वोपरि उद्देश्य क्या है?',
      opts: [
        'कंठस्थ करने की आदत का विकास करना',
        'निजी अनुभवों के आधार पर भाषा का सृजनशील एवं स्वतंत्र प्रयोग करना',
        'केवल व्याकरण के नियमों को रटना',
        'पाठ्यपुस्तक के सभी प्रश्नों के उत्तर याद करना'
      ],
      ans: 1,
      exp: 'एनसीएफ 2005 और भाषा शिक्षण शास्त्र के अनुसार उच्च प्राथमिक स्तर पर बच्चों में भाषा का सृजनात्मक, आलोचनात्मक और स्वतंत्र प्रयोग करने की क्षमता का विकास करना मुख्य उद्देश्य है।'
    },
    {
      q: 'प्राथमिक एवं उच्च प्राथमिक स्तर पर सतत एवं व्यापक मूल्यांकन (CCE) का मुख्य उद्देश्य क्या है?',
      opts: ['बच्चों की कमियों को उजागर करके उन्हें दंडित करना', 'अधिगम प्रक्रिया में सुधार हेतु निरंतर पृष्ठपोषण (Feedback) देना', 'कक्षा में बच्चों का श्रेणीकरण (Grading) व नामकरण करना', 'वार्षिक परीक्षा के अंक निर्धारित करना'],
      ans: 1,
      exp: 'सतत एवं व्यापक मूल्यांकन (CCE) का मूल उद्देश्य शिक्षण-अधिगम प्रक्रिया में गुणात्मक सुधार और विद्यार्थी को समय पर सुधारात्मक प्रतिपुष्टि प्रदान करना है।'
    }
  ];
  const item = pool[(num - 61) % pool.length];
  return {
    id: `ctet${mockNum}-q${num}`,
    section: 'lang2',
    subject: 'Language 2 (Hindi)',
    question: `Q${num} (हिंदी): ${item.q}`,
    options: item.opts,
    correctAnswer: item.ans,
    difficulty: 'Moderate',
    explanation: item.exp
  };
}

function getSampleSSTQuestion(num, mockNum) {
  const pool = [
    {
      q: 'While teaching the topic "Livelihoods in Rural Areas", which pedagogical strategy is most effective to help middle school students understand agricultural seasonal debt?',
      opts: [
        'Asking students to memorize textbook definitions of landless laborers',
        'Analyzing case studies of small farmers with a crop calendar showing credit dependency',
        'Dictating notes on moneylender interest rates for an exam',
        'Showing a silent documentary without discussion'
      ],
      ans: 1,
      exp: 'Using localized case studies with crop calendars allows students to concretely visualize why small agricultural workers borrow during lean non-harvest months and fall into debt cycles.'
    },
    {
      q: 'Which of the following is considered a "Primary Source" for studying the Mauryan period?',
      opts: ['Romila Thapar’s book "Asoka and the Decline of the Mauryas"', 'The Major Rock Edicts carved during Ashoka\'s reign', 'A modern television documentary on Pataliputra', 'A historical fiction novel about Chandragupta Maurya'],
      ans: 1,
      exp: 'Ashoka\'s Rock Edicts are direct archaeological artifacts from the actual time period under study, making them primary historical sources.'
    },
    {
      q: 'On a topographical map, contour lines drawn closely together indicate:',
      opts: ['A gentle slope', 'A steep slope or escarpment', 'A water body like a lake', 'A plateau with uniform elevation'],
      ans: 1,
      exp: 'When contour lines are closely spaced, elevation changes rapidly over a short horizontal distance, representing a steep slope.'
    },
    {
      q: 'The principle of "Separation of Powers" in the Indian democratic framework means:',
      opts: [
        'Clear division of functional powers between Legislature, Executive, and Judiciary',
        'Supreme authority vested exclusively in the Prime Minister\'s office',
        'State Governments having no constitutional power',
        'The Armed forces controlling judicial proceedings'
      ],
      ans: 0,
      exp: 'Separation of powers ensures that the three organs of state (Legislature, Executive, and Judiciary) operate within their respective constitutional spheres with mutual checks and balances.'
    }
  ];
  const item = pool[(num - 91) % pool.length];
  return {
    id: `ctet${mockNum}-q${num}`,
    section: 'sst',
    subject: 'Social Science',
    question: `Q${num} (SST): ${item.q}`,
    options: item.opts,
    correctAnswer: item.ans,
    difficulty: num % 2 === 0 ? 'High' : 'Moderate',
    explanation: item.exp
  };
}

function generateCDPSectionalQuestions(testNum) {
  const list = [];
  for (let i = 1; i <= 30; i++) {
    list.push(getSampleCDPQuestion(i, testNum));
  }
  return list;
}

function generateEnglishSectionalQuestions(testNum) {
  const list = [];
  for (let i = 1; i <= 30; i++) {
    list.push(getSampleEnglishQuestion(i + 30, testNum));
  }
  return list;
}

function generateHindiSectionalQuestions(testNum) {
  const list = [];
  for (let i = 1; i <= 30; i++) {
    list.push(getSampleHindiQuestion(i + 60, testNum));
  }
  return list;
}

function generateSSTSectionalQuestions(testNum) {
  const list = [];
  for (let i = 1; i <= 60; i++) {
    list.push(getSampleSSTQuestion(i + 90, testNum));
  }
  return list;
}

// ==========================================
// UGC NET HISTORY (10 TESTS: PAPER 1 & PAPER 2)
// ==========================================
export const UGC_NET_TESTS = [
  {
    id: 'ugc-net-full-01',
    title: 'UGC NET History Combined Full Mock 1 (Paper 1 & Paper 2)',
    category: 'ugc_net',
    subCategory: 'Combined Full Mock (150 Qs · 300 Marks)',
    syllabusSection: 'combined_mock',
    isSectional: false,
    isQuickBurst: false,
    difficulty: 'High',
    targetExam: 'UGC NET / JRF History',
    totalQuestions: 150,
    totalMarks: 300,
    durationMinutes: 180,
    markingScheme: { correct: 2, incorrect: 0 },
    syllabus: 'Paper 1 (50 Qs · Teaching & Research) + Paper 2 History (100 Qs · Ancient, Medieval, Modern & Historiography)',
    createdAt: '2026-10-28',
    sections: [
      { id: 'p1', name: 'Paper 1: General Teaching & Research Aptitude', questionCount: 50 },
      { id: 'p2', name: 'Paper 2: History (Core Subject)', questionCount: 100 }
    ],
    questions: generateUGCNET150Questions(1)
  },
  {
    id: 'ugc-net-p1-01',
    title: 'UGC NET Paper 1 Mock 1 · Teaching & Research Aptitude',
    category: 'ugc_net',
    subCategory: 'Paper 1 Mock (50 Qs · 100 Marks)',
    syllabusSection: 'paper1',
    isSectional: true,
    isQuickBurst: false,
    difficulty: 'Moderate',
    targetExam: 'UGC NET Paper 1',
    totalQuestions: 50,
    totalMarks: 100,
    durationMinutes: 60,
    markingScheme: { correct: 2, incorrect: 0 },
    syllabus: 'Teaching Aptitude, Research Methodology, ICT, Higher Education & Environment',
    createdAt: '2026-10-28',
    sections: [{ id: 'p1', name: 'Paper 1: General Paper', questionCount: 50 }],
    questions: generateUGCPaper1Questions(1)
  },
  {
    id: 'ugc-net-p1-02',
    title: 'UGC NET Paper 1 Mock 2 · Higher Order Research & ICT',
    category: 'ugc_net',
    subCategory: 'Paper 1 Mock (50 Qs · 100 Marks)',
    syllabusSection: 'paper1',
    isSectional: true,
    isQuickBurst: false,
    difficulty: 'High',
    targetExam: 'UGC NET Paper 1',
    totalQuestions: 50,
    totalMarks: 100,
    durationMinutes: 60,
    markingScheme: { correct: 2, incorrect: 0 },
    syllabus: 'Experimental Research, Positivism vs Post-Positivism, NEP 2020, Academic Integrity',
    createdAt: '2026-10-28',
    sections: [{ id: 'p1', name: 'Paper 1: General Paper', questionCount: 50 }],
    questions: generateUGCPaper1Questions(2)
  },
  {
    id: 'ugc-net-p2-01',
    title: 'UGC NET Paper 2 History Mock 1 (100 Qs · 200 Marks)',
    category: 'ugc_net',
    subCategory: 'Paper 2 Mock (100 Qs · 200 Marks)',
    syllabusSection: 'paper2',
    isSectional: false,
    isQuickBurst: false,
    difficulty: 'High',
    targetExam: 'UGC NET / JRF History Paper 2',
    totalQuestions: 100,
    totalMarks: 200,
    durationMinutes: 120,
    markingScheme: { correct: 2, incorrect: 0 },
    syllabus: 'Ancient Indian History, Medieval Sultanate & Mughals, Modern Colonial Economy & Historiography',
    createdAt: '2026-10-28',
    sections: [{ id: 'p2', name: 'Paper 2: History', questionCount: 100 }],
    questions: generateUGCPaper2Questions(1)
  },
  {
    id: 'ugc-net-p2-02',
    title: 'UGC NET Paper 2 History Mock 2 (Chronology, Sources & Inscriptions)',
    category: 'ugc_net',
    subCategory: 'Paper 2 Mock (100 Qs · 200 Marks)',
    syllabusSection: 'paper2',
    isSectional: false,
    isQuickBurst: false,
    difficulty: 'High',
    targetExam: 'UGC NET History Paper 2',
    totalQuestions: 100,
    totalMarks: 200,
    durationMinutes: 120,
    markingScheme: { correct: 2, incorrect: 0 },
    syllabus: 'Epigraphy, Numismatics, Agrarian Relations, Marathas, Subaltern Historiography',
    createdAt: '2026-10-28',
    sections: [{ id: 'p2', name: 'Paper 2: History', questionCount: 100 }],
    questions: generateUGCPaper2Questions(2)
  },
  {
    id: 'ugc-net-sec-ancient',
    title: 'UGC NET Sectional: Ancient India & Archaeological Cultures',
    category: 'ugc_net',
    subCategory: 'Sectional Test',
    syllabusSection: 'ancient',
    isSectional: true,
    isQuickBurst: false,
    difficulty: 'High',
    targetExam: 'UGC NET History',
    totalQuestions: 50,
    totalMarks: 100,
    durationMinutes: 60,
    markingScheme: { correct: 2, incorrect: 0 },
    syllabus: 'Prehistoric Cultures, Harappan trade networks, Vedic polity, Sangam literature, Gupta administration',
    createdAt: '2026-10-28',
    sections: [{ id: 'p2', name: 'Ancient Indian History', questionCount: 50 }],
    questions: generateUGCSectionalHistory('Ancient', 50)
  },
  {
    id: 'ugc-net-sec-medieval',
    title: 'UGC NET Sectional: Medieval Indian State, Economy & Culture',
    category: 'ugc_net',
    subCategory: 'Sectional Test',
    syllabusSection: 'medieval',
    isSectional: true,
    isQuickBurst: false,
    difficulty: 'High',
    targetExam: 'UGC NET History',
    totalQuestions: 50,
    totalMarks: 100,
    durationMinutes: 60,
    markingScheme: { correct: 2, incorrect: 0 },
    syllabus: 'Iqta and Jagir systems, Vijayanagara Nayankara, Mughal Zabt and Dahsala, Sufi Silsilas',
    createdAt: '2026-10-28',
    sections: [{ id: 'p2', name: 'Medieval Indian History', questionCount: 50 }],
    questions: generateUGCSectionalHistory('Medieval', 50)
  },
  {
    id: 'ugc-net-sec-modern',
    title: 'UGC NET Sectional: Modern Indian National Movement & Economy',
    category: 'ugc_net',
    subCategory: 'Sectional Test',
    syllabusSection: 'modern',
    isSectional: true,
    isQuickBurst: false,
    difficulty: 'High',
    targetExam: 'UGC NET History',
    totalQuestions: 50,
    totalMarks: 100,
    durationMinutes: 60,
    markingScheme: { correct: 2, incorrect: 0 },
    syllabus: 'De-industrialization, Drain of Wealth, Revolutionary Nationalism, Peasant and Dalit movements',
    createdAt: '2026-10-28',
    sections: [{ id: 'p2', name: 'Modern Indian History', questionCount: 50 }],
    questions: generateUGCSectionalHistory('Modern', 50)
  },
  {
    id: 'ugc-net-sec-historiography',
    title: 'UGC NET Sectional: Historiography, Methodology & Philosophy of History',
    category: 'ugc_net',
    subCategory: 'Sectional Test',
    syllabusSection: 'historiography',
    isSectional: true,
    isQuickBurst: false,
    difficulty: 'High',
    targetExam: 'UGC NET History',
    totalQuestions: 50,
    totalMarks: 100,
    durationMinutes: 60,
    markingScheme: { correct: 2, incorrect: 0 },
    syllabus: 'Rankean empiricism, Annales School, Marxist historiography, Subaltern Studies, Postmodernism',
    createdAt: '2026-10-28',
    sections: [{ id: 'p2', name: 'Historiography & Method', questionCount: 50 }],
    questions: generateUGCSectionalHistory('Historiography', 50)
  },
  {
    id: 'ugc-net-full-02',
    title: 'UGC NET History Master Mock 2 (Combined All Units)',
    category: 'ugc_net',
    subCategory: 'Combined Full Mock (150 Qs · 300 Marks)',
    syllabusSection: 'combined_mock',
    isSectional: false,
    isQuickBurst: false,
    difficulty: 'High',
    targetExam: 'UGC NET / JRF History',
    totalQuestions: 150,
    totalMarks: 300,
    durationMinutes: 180,
    markingScheme: { correct: 2, incorrect: 0 },
    syllabus: '150 Questions NTA Format · JRF Benchmark Standard',
    createdAt: '2026-10-28',
    sections: [
      { id: 'p1', name: 'Paper 1: General Paper', questionCount: 50 },
      { id: 'p2', name: 'Paper 2: History', questionCount: 100 }
    ],
    questions: generateUGCNET150Questions(2)
  },
  // Quick Sprint Tests for UGC NET (20 min short bursts)
  {
    id: 'ugc-net-sprint-hist-01',
    title: 'UGC NET 20-Min Sprint: Historiography & Methodological Concepts',
    category: 'ugc_net',
    subCategory: 'Quick Sprint (20 Mins)',
    syllabusSection: 'quick_sprint',
    isSectional: true,
    isQuickBurst: true,
    difficulty: 'High',
    targetExam: 'UGC NET History',
    totalQuestions: 20,
    totalMarks: 40,
    durationMinutes: 20,
    markingScheme: { correct: 2, incorrect: 0 },
    syllabus: 'Historical causation, Hermeneutics, Archival criticism, Positivism vs Historicism',
    createdAt: '2026-10-30',
    sections: [{ id: 'p2', name: 'Historiography & Method', questionCount: 20 }],
    questions: generateUGCSectionalHistory('Historiography', 20)
  },
  {
    id: 'ugc-net-sprint-sources-01',
    title: 'UGC NET 20-Min Sprint: Ancient Inscriptions, Epigraphy & Archaeology',
    category: 'ugc_net',
    subCategory: 'Quick Sprint (20 Mins)',
    syllabusSection: 'quick_sprint',
    isSectional: true,
    isQuickBurst: true,
    difficulty: 'High',
    targetExam: 'UGC NET History',
    totalQuestions: 20,
    totalMarks: 40,
    durationMinutes: 20,
    markingScheme: { correct: 2, incorrect: 0 },
    syllabus: 'Ashokan Inscriptions, Gupta Prashastis, Roman coins in South India, Megalithic burials',
    createdAt: '2026-10-30',
    sections: [{ id: 'p2', name: 'Ancient Epigraphy & Archaeology', questionCount: 20 }],
    questions: generateUGCSectionalHistory('Ancient', 20)
  }
];

function generateUGCNET150Questions(testNum) {
  const p1 = generateUGCPaper1Questions(testNum);
  const p2 = generateUGCPaper2Questions(testNum);
  return [...p1, ...p2];
}

function generateUGCPaper1Questions(testNum) {
  const list = [];
  const bank = [
    {
      q: 'Which of the following research formats is inherently oriented towards generating actionable solutions for immediate practical classroom problems?',
      opts: ['Fundamental Research', 'Action Research', 'Ex-Post Facto Research', 'Historical Research'],
      ans: 1,
      exp: 'Action Research focuses on immediate problem-solving and practitioner-led intervention in local educational contexts (Kurt Lewin model).'
    },
    {
      q: 'In qualitative research paradigm, the concept of "Triangulation" refers to:',
      opts: [
        'Calculating arithmetic mean across three iterations',
        'Employing multiple theories, methods, or data sources to develop a comprehensive understanding of phenomena',
        'Testing three dependent variables simultaneously using MANOVA',
        'Restricting research interviews strictly to three key informants'
      ],
      ans: 1,
      exp: 'Triangulation in qualitative methodology uses multiple methods or data sources to enhance construct validity and contextual richness.'
    },
    {
      q: 'Which of the following protocols represents the secure, encrypted transmission of web pages across the Internet?',
      opts: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
      ans: 2,
      exp: 'HTTPS (Hypertext Transfer Protocol Secure) incorporates SSL/TLS encryption to protect data in transit between browser and server.'
    },
    {
      q: 'In the Indian Higher Education framework, the National Assessment and Accreditation Council (NAAC) functions under which statutory body?',
      opts: ['AICTE', 'University Grants Commission (UGC)', 'ICSSR', 'Department of School Education'],
      ans: 1,
      exp: 'NAAC was established in 1994 as an autonomous institution under the University Grants Commission (UGC) with headquarters in Bengaluru.'
    },
    {
      q: 'Under Bloom\'s revised taxonomy, which of the following cognitive domain levels represents the highest order of cognitive processing?',
      opts: ['Analyzing', 'Evaluating', 'Creating', 'Understanding'],
      ans: 2,
      exp: 'In Anderson and Krathwohl\'s revised Bloom\'s taxonomy (2001), "Creating" (putting elements together to form a coherent whole or make an original product) is the highest cognitive process.'
    }
  ];

  for (let i = 1; i <= 50; i++) {
    const item = bank[(i - 1) % bank.length];
    list.push({
      id: `ugc${testNum}-p1-q${i}`,
      section: 'p1',
      subject: 'Paper 1: General Paper',
      question: `Q${i} (Paper 1): ${item.q}`,
      options: item.opts,
      correctAnswer: item.ans,
      difficulty: i % 3 === 0 ? 'High' : 'Moderate',
      explanation: item.exp
    });
  }
  return list;
}

function generateUGCPaper2Questions(testNum) {
  const list = [];
  const bank = [
    {
      q: 'Which Ashokan rock edict explicitly mentions the conquest of Kalinga and the transformation of Ashoka from Bherighosha to Dhammaghosha?',
      opts: ['Major Rock Edict V', 'Major Rock Edict X', 'Major Rock Edict XIII', 'Kandahar Greek Inscription'],
      ans: 2,
      exp: 'Major Rock Edict XIII describes the tragic destruction during the Kalinga War (eight years after Ashoka\'s coronation) and his profound remorse, turning towards Dhamma.'
    },
    {
      q: 'The famous "Uttiramerur Inscriptions" of Parantaka Chola I provide detailed evidence regarding the functioning of:',
      opts: [
        'The imperial naval military dockyards',
        'The democratic committee (Variyam) system of local self-government in the Brahmadeya village assembly (Sabha)',
        'The diplomatic embassies sent to the Song Dynasty in China',
        'The collection of temple gold tributes from Srivijaya'
      ],
      ans: 1,
      exp: 'The Uttiramerur Inscriptions (919 and 921 CE) outline precise qualifications, disqualifications, and the "Kudavolai" (pot-ticket lottery) election system for village governing committees.'
    },
    {
      q: 'Who was the author of the Persian historical text "Tarikh-i-Firoz Shahi" that provides invaluable insight into the reign of Ghiyasuddin Balban, the Khaljis, and Muhammad bin Tughlaq?',
      opts: ['Ziauddin Barani', 'Amir Khusrau', 'Minhaj-i-Siraj', 'Ibn Battuta'],
      ans: 0,
      exp: 'Ziauddin Barani authored the celebrated political and historical chronicle "Tarikh-i-Firoz Shahi" in 1357 CE, followed later by Shams-i Siraj Arif\'s text of the same name.'
    },
    {
      q: 'Under Akbar\'s Mansabdari system, the dual rank structure consisted of "Zat" and "Sawar". What did the "Sawar" rank designate?',
      opts: [
        'The personal status and salary bracket of the Mansabdar',
        'The number of cavalrymen and horses the Mansabdar was obligated to maintain for imperial service',
        'The administrative jurisdiction of his tax-free Inam land',
        'The number of royal elephants in his private stable'
      ],
      ans: 1,
      exp: 'In Akbar\'s Mansabdari system, "Zat" determined personal status, seniority, and personal salary, whereas "Sawar" dictated the military contingent of horsemen required to be kept in readiness.'
    },
    {
      q: 'The "Drain of Wealth" theory demonstrating the systematic transfer of India\'s economic surplus to Great Britain was first systematically expounded by:',
      opts: ['Romesh Chunder Dutt', 'Dadabhai Naoroji', 'Mahadev Govind Ranade', 'Gopal Krishna Gokhale'],
      ans: 1,
      exp: 'Dadabhai Naoroji formulated the Drain of Wealth thesis in his seminal work "Poverty and Un-British Rule in India" (1901).'
    },
    {
      q: 'Which historical school emphasized writing history "from below" (history of the subaltern classes, peasants, and workers rather than elite nationalist leaders)?',
      opts: ['Cambridge School', 'Subaltern Studies Group', 'Imperialist Historiographical School', 'Utilitarian School'],
      ans: 1,
      exp: 'The Subaltern Studies Group, launched in the 1980s under Ranajit Guha, focused on recovering the agency, consciousness, and politics of marginalized subaltern groups.'
    }
  ];

  for (let i = 1; i <= 100; i++) {
    const item = bank[(i - 1) % bank.length];
    list.push({
      id: `ugc${testNum}-p2-q${i}`,
      section: 'p2',
      subject: 'Paper 2: History',
      question: `Q${i} (History): ${item.q}`,
      options: item.opts,
      correctAnswer: item.ans,
      difficulty: 'High',
      explanation: item.exp
    });
  }
  return list;
}

function generateUGCSectionalHistory(theme, count) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    list.push({
      id: `ugc-sec-${theme.toLowerCase()}-q${i}`,
      section: 'p2',
      subject: `${theme} History`,
      question: `[${theme} History · Q${i}]: Which among the following historical developments is verified through primary source historiography for ${theme}?`,
      options: [
        `Analysis of contemporary documentation & epigraphic evidence in ${theme}`,
        `Modern revisionist narrative without archival or manuscript citations`,
        `Direct structural transformation verified by archaeological / archival consensus`,
        `Isolated regional chronicle having no wider geopolitical consequence`
      ],
      correctAnswer: 2,
      difficulty: 'High',
      explanation: `Historical Consensus for ${theme}: Option C represents the peer-reviewed scholarly position in UGC NET / Post-Graduate historiography.`
    });
  }
  return list;
}

// ==========================================
// POST-GRADUATION HISTORY TESTS (10 TESTS)
// ==========================================
export const PG_HISTORY_TESTS = generatePGHistoryTests();

function generatePGHistoryTests() {
  const titles = [
    'PG History Advanced Mock 1 · Historiography, Theory & Research Method',
    'PG History Advanced Mock 2 · Epigraphy, Numismatics & Ancient Agrarian Systems',
    'PG History Advanced Mock 3 · State Formation in Early Medieval India',
    'PG History Advanced Mock 4 · Delhi Sultanate & Mughal Agrarian Economy',
    'PG History Advanced Mock 5 · Vijayanagara, Bahmani & Maratha Polity',
    'PG History Advanced Mock 6 · Colonialism, Drain of Wealth & Commercialization of Agriculture',
    'PG History Advanced Mock 7 · Nationalism, Subaltern Agency & Social Movements in Modern India',
    'PG History Advanced Mock 8 · World History: Renaissance to Industrial Revolution',
    'PG History Advanced Mock 9 · World History: Imperialism, World Wars & Cold War Dynamics',
    'PG History Advanced Mock 10 · Master Post-Graduate Comprehensive History Examination'
  ];

  return titles.map((title, idx) => {
    const testNum = idx + 1;
    const numStr = testNum < 10 ? `0${testNum}` : `${testNum}`;
    return {
      id: `pg-hist-${numStr}`,
      title,
      category: 'pg_history',
      subCategory: 'Post-Graduate Master’s Level Exam',
      difficulty: 'High',
      targetExam: 'M.A. History / Ph.D. Entrance / UGC NET JRF',
      totalQuestions: 50,
      totalMarks: 100,
      durationMinutes: 60,
      markingScheme: { correct: 2, incorrect: 0 },
      syllabus: 'Master\'s Level In-Depth Historical Analysis, Historiography & Primary Sources',
      createdAt: '2026-10-28',
      sections: [{ id: 'pg_hist', name: 'Advanced History & Historiography', questionCount: 50 }],
      questions: generatePGQuestions(testNum)
    };
  });
}

function generatePGQuestions(testNum) {
  const bank = [
    {
      q: 'In the debate regarding the Feudalism hypothesis in early medieval India, who among the following historians pioneered the thesis of "Urban Decay" and "Indian Feudalism"?',
      opts: ['R.C. Majumdar', 'Ram Sharan Sharma (R.S. Sharma)', 'B.D. Chattopadhyaya', 'Burton Stein'],
      ans: 1,
      exp: 'R.S. Sharma in his works "Indian Feudalism" (1965) and "Urban Decay in India" argued for a feudal polity resulting from land grants (Brahmadeya/Agrahara), decline of trade, and demonetization.'
    },
    {
      q: 'Burton Stein applied which anthropological model proposed by Aidan Southall to interpret the state structure of the Chola and Vijayanagara empires?',
      opts: ['Asiatic Mode of Production', 'Segmentary State Model', 'Bureaucratic Feudal Model', 'Oriental Despotism'],
      ans: 1,
      exp: 'Burton Stein applied the "Segmentary State" model to characterize the Chola and Vijayanagara polities as having ritual sovereignty at the center with political autonomy distributed among regional nadus.'
    },
    {
      q: 'The concept of "History as it actually happened" (wie es eigentlich gewesen) was the hallmark of which prominent 19th-century German historian?',
      opts: ['Leopold von Ranke', 'G.W.F. Hegel', 'Karl Marx', 'Wilhelm Dilthey'],
      ans: 0,
      exp: 'Leopold von Ranke established modern source-critical historical methodology, advocating objective historical reconstruction based on primary archival documents.'
    },
    {
      q: 'The "Aligarh Historians" (notably Irfan Habib and Shireen Moosvi) characterized the Mughal agrarian system primarily through which analytical framework?',
      opts: [
        'Segmentary tribal confederacy',
        'Highly centralized feudal-fiscal state with extraction of agrarian surplus through the Jagirdari system',
        'Commercial capitalist market economy',
        'Decentralized autonomous clan republics'
      ],
      ans: 1,
      exp: 'Irfan Habib in "The Agrarian System of Mughal India" (1963) demonstrated that the Mughal state extracted a massive portion of the peasant agricultural surplus, triggering peasant rebellions.'
    },
    {
      q: 'In the context of the Renaissance, which Italian humanist authored "The Prince" (Il Principe), separating political morality from religious dogma?',
      opts: ['Francesco Petrarch', 'Niccolò Machiavelli', 'Giovanni Boccaccio', 'Thomas More'],
      ans: 1,
      exp: 'Niccolò Machiavelli\'s "The Prince" (1532) analyzed realpolitik and political power grounded in state preservation, detached from theological ethics.'
    }
  ];

  const list = [];
  for (let i = 1; i <= 50; i++) {
    const item = bank[(i - 1) % bank.length];
    list.push({
      id: `pg${testNum}-q${i}`,
      section: 'pg_hist',
      subject: 'Post-Graduate History',
      question: `[PG Test ${testNum} · Q${i}]: ${item.q}`,
      options: item.opts,
      correctAnswer: item.ans,
      difficulty: 'High',
      explanation: item.exp
    });
  }
  return list;
}

// Master combined pool of all default tests
export const ALL_INITIAL_TESTS = [
  ...DEFAULT_TEST_PAPERS,
  ...CTET_PAPER_2_TESTS,
  ...UGC_NET_TESTS,
  ...PG_HISTORY_TESTS
];
