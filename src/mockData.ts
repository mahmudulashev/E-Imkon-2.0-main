export const MOCK_COURSES = [
  {
    id: 'english-101',
    name: 'Ingliz tili',
    description: 'Boshlang\'ich darajadagilar uchun maxsus ingliz tili darslari. Ovozli yordam bilan oson o\'rganing.',
    icon: '🇬🇧',
    level_tag: 'A1-A2',
    color_hex: '#e0f2fe'
  },
  {
    id: 'math-101',
    name: 'Matematika',
    description: 'Mantiqiy fikrlash va asosiy arifmetik amallar. Murakkab misollarni AI yordamida yeching.',
    icon: '🧮',
    level_tag: 'Boshlang\'ich',
    color_hex: '#fef3c7'
  },
  {
    id: 'frontend-101',
    name: 'Frontend',
    description: 'HTML, CSS va React orqali zamonaviy saytlar yaratishni noldan o\'rganing.',
    icon: '💻',
    level_tag: 'Professional',
    color_hex: '#f3e8ff'
  }
];

export const MOCK_LESSONS = {
  'english-101': [
    {
      id: 'eng-l1',
      course_id: 'english-101',
      title: 'Salomlashish va Tanishish',
      duration: '15 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 1,
      content: {
        sections: [
          { title: 'Asosiy so\'zlar', content: 'Salomlashish madaniyatning bir qismidir. Hello (Salom - rasmiy), Hi (Salom - do\'stona), Good morning (Xayrli tong).' },
          { title: 'O\'zingizni tanishtirish', content: 'I am... (Men...) yoki My name is... (Mening ismim...). Masalan: My name is Anvar. Nice to meet you (Tanishganimdan xursandman).' }
        ],
        quiz: [
          {
            question: '"Tanishganimdan xursandman" iborasi ingliz tilida qanday bo\'ladi?',
            options: [
              { text: 'How are you?', isCorrect: false },
              { text: 'Nice to meet you', isCorrect: true },
              { text: 'Good bye', isCorrect: false }
            ],
            explanation: '"Nice to meet you" - bu tanishuv jarayonida xursandchilik bildirishning eng keng tarqalgan usuli.'
          }
        ]
      }
    },
    {
      id: 'eng-l2',
      course_id: 'english-101',
      title: 'Raqamlar va Sanoq',
      duration: '10 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 2,
      content: {
        sections: [
          { title: '1 dan 10 gacha', content: 'One (1), Two (2), Three (3), Four (4), Five (5), Six (6), Seven (7), Eight (8), Nine (9), Ten (10).' }
        ],
        quiz: [
          {
            question: 'Sakkiz soni ingliz tilida qanday yoziladi?',
            options: [
              { text: 'Seven', isCorrect: false },
              { text: 'Eight', isCorrect: true },
              { text: 'Night', isCorrect: false }
            ],
            explanation: 'Eight (8) - sakkiz sonini bildiradi.'
          }
        ]
      }
    }
  ],
  'math-101': [
    {
      id: 'math-l1',
      course_id: 'math-101',
      title: 'Qo\'shish va Ayirish',
      duration: '20 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 1,
      content: {
        sections: [
          { title: 'Asosiy qoidalar', content: 'Qo\'shish (+) - bu ikki miqdorni birlashtirish. Ayirish (-) - bir miqdordan ikkinchisini olib tashlash.' },
          { title: 'Misol', content: '2 + 3 = 5. Agar sizda 5 ta olma bo\'lsa va 2 tasini yesangiz, 3 ta qoladi (5 - 2 = 3).' }
        ],
        quiz: [
          {
            question: '8 + 4 yig\'indisi nechaga teng?',
            options: [
              { text: '10', isCorrect: false },
              { text: '12', isCorrect: true },
              { text: '14', isCorrect: false }
            ],
            explanation: 'Sakkizga to\'rtni qo\'shsak, o\'n ikki bo\'ladi.'
          }
        ]
      }
    }
  ],
  'frontend-101': [
    {
      id: 'fe-l1',
      course_id: 'frontend-101',
      title: 'HTML: Veb-sayt Skeleti',
      duration: '25 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 1,
      content: {
        sections: [
          { title: 'HTML nima?', content: 'HTML (HyperText Markup Language) - bu veb-sahifalarni yaratish uchun standart belgilash tili. U sahifaning tuzilishini tavsiflaydi.' },
          { title: 'Teglar haqida', content: 'Har bir element teglar orasida bo\'ladi. Masalan, <h1> sarlavha uchun, <p> matn (paragraf) uchun ishlatiladi.' }
        ],
        quiz: [
          {
            question: 'Veb-sahifada sarlavha yaratish uchun qaysi teg ishlatiladi?',
            options: [
              { text: '<h1>', isCorrect: true },
              { text: '<p>', isCorrect: false },
              { text: '<div>', isCorrect: false }
            ],
            explanation: '<h1> tegi eng katta sarlavhani bildiradi.'
          }
        ]
      }
    }
  ]
};
