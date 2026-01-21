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
      duration: '20 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 1,
      content: {
        sections: [
          {
            title: 'Salomlashish iboralari',
            content: 'Hello (salom - rasmiy), Hi (salom - do\'stona), Good morning (xayrli tong). Odatda vaziyatga qarab so\'z tanlanadi. Rasmiy joyda Hello yoki Good morning, do\'stlar bilan esa Hi ko\'proq ishlatiladi. Salomlashishda ovoz ohangi ham muhim.',
            image: '/illustrations/english-greetings.svg',
            imageAlt: 'Salomlashayotgan ikki odam',
            caption: 'Oddiy salomlashish namunalari'
          },
          {
            title: 'O\'zingizni tanishtirish',
            content: 'I am... yoki My name is... iboralari ishlatiladi. Masalan: My name is Aziza. Nice to meet you (tanishganimdan xursandman). Tanishuvda qo\'l berib ko\'rishish yoki tabassum qilish ham qulay muhit yaratadi. Javob sifatida Nice to meet you too deyish mumkin.'
          },
          {
            title: 'Qisqa dialog',
            content: 'A: Hello! B: Hi! A: My name is Alisher. B: Nice to meet you! A: Nice to meet you too. Shu dialogni har kuni 2-3 marta takrorlab, talaffuzga e\'tibor bering. Ismni aytganda urg\'u so\'z oxirida emas, boshida bo\'lishi kerak.'
          }
        ],
        quiz: [
          {
            question: '"Tanishganimdan xursandman" ingliz tilida qanday bo\'ladi?',
            options: [
              { text: 'How are you?', isCorrect: false },
              { text: 'Nice to meet you', isCorrect: true },
              { text: 'Good night', isCorrect: false }
            ],
            explanation: '"Nice to meet you" - tanishuv paytida ishlatiladi.'
          }
        ]
      }
    },
    {
      id: 'eng-l2',
      course_id: 'english-101',
      title: 'Raqamlar va Sanoq',
      duration: '18 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 2,
      content: {
        sections: [
          {
            title: '1 dan 10 gacha',
            content: 'One (1), Two (2), Three (3), Four (4), Five (5), Six (6), Seven (7), Eight (8), Nine (9), Ten (10). Har bir sonni aytganda og\'iz harakati va urg\'uga e\'tibor bering. Ayniqsa three va three teen so\'zlarida "th" tovushi muhim.',
            image: '/illustrations/english-numbers.svg',
            imageAlt: '1, 2, 3 raqamlari tasviri',
            caption: 'Raqamlarni yodlash uchun rasm'
          },
          {
            title: '11 dan 20 gacha',
            content: 'Eleven, Twelve, Thirteen, Fourteen, Fifteen, Sixteen, Seventeen, Eighteen, Nineteen, Twenty. 13-19 orasida "teen" qo\'shimchasi borligini yodda tuting. Fifteen va eighteen talaffuzini alohida mashq qiling.'
          },
          {
            title: 'Amaliy mashq',
            content: 'Telefon raqamlarini bo\'lib ayting: 99 123 45 67 -> ninety nine, one two three, four five, six seven. Narx va vaqt aytishda ham raqamlar kerak bo\'ladi: It is 7:30 yoki Price is 25,000 so\'m.'
          }
        ],
        quiz: [
          {
            question: 'Sakkiz soni ingliz tilida qanday yoziladi?',
            options: [
              { text: 'Seven', isCorrect: false },
              { text: 'Eight', isCorrect: true },
              { text: 'Night', isCorrect: false }
            ],
            explanation: 'Eight - sakkiz sonini bildiradi.'
          }
        ]
      }
    },
    {
      id: 'eng-l3',
      course_id: 'english-101',
      title: 'Kunlar va Vaqt',
      duration: '22 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 3,
      content: {
        sections: [
          {
            title: 'Hafta kunlari',
            content: 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Kunlarni jadval bilan o\'rganing va hafta oxirini ajrating. Odatda Monday bilan boshlanadi, Saturday va Sunday esa weekend bo\'lib hisoblanadi.',
            image: '/illustrations/english-time.svg',
            imageAlt: 'Soat tasviri',
            caption: 'Vaqt va kunlarni yodlash'
          },
          {
            title: 'Soatni aytish',
            content: 'It\'s seven o\'clock. It\'s half past nine. It\'s quarter to five kabi iboralar ishlatiladi. O\'z vaqt rejangizni inglizcha aytib ko\'ring: I study at 6 pm, I sleep at 10 pm.'
          },
          {
            title: 'Reja tuzish',
            content: 'On Monday I study. On Saturday I rest. Soat va kunlarni birga ishlatishni mashq qiling. Masalan: On Friday at 5 pm I go to sports.'
          }
        ],
        quiz: [
          {
            question: '"Shanba" ingliz tilida qanday bo\'ladi?',
            options: [
              { text: 'Saturday', isCorrect: true },
              { text: 'Sunday', isCorrect: false },
              { text: 'Thursday', isCorrect: false }
            ],
            explanation: 'Saturday - shanba.'
          }
        ]
      }
    },
    {
      id: 'eng-l4',
      course_id: 'english-101',
      title: 'Savol berish',
      duration: '20 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 4,
      content: {
        sections: [
          {
            title: 'Savol so\'zlari',
            content: 'What, Where, When, Who, Why, How - savollarni boshlash uchun ishlatiladi. Har birining ma\'nosini alohida yodlang va misol tuzing: Where do you live? What is your name?',
            image: '/illustrations/english-greetings.svg',
            imageAlt: 'Savol belgili rasm',
            caption: 'Savol so\'zlari'
          },
          {
            title: 'Yes/No savollari',
            content: 'Do you like tea? Yes, I do. No, I don\'t. Savolga qisqa javob berishni o\'rganing. Do you play football? Yes, I do. No, I don\'t.'
          },
          {
            title: 'Muloyim savollar',
            content: 'Could you help me? Can I ask a question? kabi iboralar muloyim so\'rash uchun ishlatiladi. Muloyimlik suhbatni iliq qiladi.'
          }
        ],
        quiz: [
          {
            question: '"Qayerda?" ingliz tilida qanday?',
            options: [
              { text: 'Where', isCorrect: true },
              { text: 'When', isCorrect: false },
              { text: 'Who', isCorrect: false }
            ],
            explanation: 'Where - qayerda degan ma\'noni beradi.'
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
      duration: '25 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 1,
      content: {
        sections: [
          {
            title: 'Asosiy qoidalar',
            content: 'Qo\'shish (+) - bu ikki miqdorni birlashtirish. Ayirish (-) - bir miqdordan ikkinchisini olib tashlash. Har bir amal kundalik hayotda uchraydi: pul qo\'shish, vaqt ayirish va hokazo.',
            image: '/illustrations/math-add.svg',
            imageAlt: 'Qo\'shish misoli',
            caption: '2 + 3 kabi misollar'
          },
          {
            title: 'Sonlar chizig\'i',
            content: 'Sonlar chizig\'ida o\'ngga yurish - qo\'shish, chapga yurish - ayirish. Bu usul yangi o\'rganuvchilar uchun qulay. Masalan, 3 dan 2 qadam o\'ngga yursak 5 bo\'ladi.'
          },
          {
            title: 'So\'zli masala',
            content: 'Murodda 5 ta olma bor edi, 2 tasini berdi. Nechta qoldi? 5 - 2 = 3. So\'zli masalalarda o\'zingizga rasmlar chizing yoki predmetlarni sanang.'
          }
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
    },
    {
      id: 'math-l2',
      course_id: 'math-101',
      title: 'Ko\'paytirish va Bo\'lish',
      duration: '24 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 2,
      content: {
        sections: [
          {
            title: 'Ko\'paytirish g\'oyasi',
            content: 'Ko\'paytirish bu bir xil sonlarni takroran qo\'shishdir: 3 x 2 = 2 + 2 + 2. Jadvalni yodlash uchun kichik misollar bilan boshlang.',
            image: '/illustrations/math-multiply.svg',
            imageAlt: 'Ko\'paytirish misoli',
            caption: '3 x 2 misoli'
          },
          {
            title: 'Bo\'lish g\'oyasi',
            content: 'Bo\'lish - umumiy miqdorni teng bo\'laklarga ajratish. 12 : 3 = 4. Agar 12 ta qalam bo\'lsa, 3 kishiga teng taqsimlasak, har biriga 4 tadan to\'g\'ri keladi.'
          },
          {
            title: 'Amaliy misol',
            content: '12 ta shirinlikni 3 do\'stga teng bo\'lsak, har biriga 4 tadan tushadi. Shu misolni boshqa sonlar bilan ham sinab ko\'ring.'
          }
        ],
        quiz: [
          {
            question: '4 x 3 nechaga teng?',
            options: [
              { text: '7', isCorrect: false },
              { text: '12', isCorrect: true },
              { text: '14', isCorrect: false }
            ],
            explanation: '4 ta 3 ni qo\'shsak, 12 bo\'ladi.'
          }
        ]
      }
    },
    {
      id: 'math-l3',
      course_id: 'math-101',
      title: 'Geometrik shakllar',
      duration: '20 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 3,
      content: {
        sections: [
          {
            title: 'Asosiy shakllar',
            content: 'Doira, kvadrat, uchburchak. Har bir shaklning burchak va tomonlarini sanang. Shakl nomini aytib, qo\'lingiz bilan havoda chizing.',
            image: '/illustrations/math-shapes.svg',
            imageAlt: 'Geometrik shakllar',
            caption: 'Doira, kvadrat, uchburchak'
          },
          {
            title: 'Shakl xususiyatlari',
            content: 'Kvadratning 4 tomoni teng, uchburchakning 3 tomoni bor. Doira esa burchaksiz. Har bir shaklning perimetri va yuzasi haqida keyingi bosqichlarda o\'rganasiz.'
          },
          {
            title: 'Real hayotda',
            content: 'Deraza kvadratga, soat doiraga, yo\'l belgisi uchburchakka o\'xshaydi. Uy atrofidagi shakllarni sanab chiqish foydali mashq bo\'ladi.'
          }
        ]
      }
    },
    {
      id: 'math-l4',
      course_id: 'math-101',
      title: 'O\'lchovlar',
      duration: '22 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 4,
      content: {
        sections: [
          {
            title: 'Uzunlik',
            content: 'Santimetr va metr - uzunlikni o\'lchash uchun ishlatiladi. 100 cm = 1 m. Uyda stol yoki daftar uzunligini o\'lchab ko\'ring.',
            image: '/illustrations/math-measure.svg',
            imageAlt: 'O\'lchov birliklari',
            caption: 'cm, kg, soat kabi birliklar'
          },
          {
            title: 'Vazn',
            content: 'Kilogramm (kg) - vazn birligi. 1000 g = 1 kg. Meva yoki kitob vaznini taxmin qilish orqali mashq qiling.'
          },
          {
            title: 'Vaqt',
            content: 'Soat, daqiqa, soniya. 60 soniya = 1 daqiqa, 60 daqiqa = 1 soat. Kundalik jadval tuzib, vaqtni to\'g\'ri taqsimlashni o\'rganing.'
          }
        ]
      }
    }
  ],
  'frontend-101': [
    {
      id: 'fe-l1',
      course_id: 'frontend-101',
      title: 'HTML: Veb-sayt skeleti',
      duration: '30 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 1,
      content: {
        sections: [
          {
            title: 'HTML nima?',
            content: 'HTML - veb-sahifaning tuzilmasi. U sahifadagi blok va matnlarni tartiblaydi. Brauzer HTML ni o\'qib, sahifani chizadi. To\'g\'ri tuzilma keyingi bezash ishlarini osonlashtiradi.',
            image: '/illustrations/frontend-html.svg',
            imageAlt: 'HTML kodi',
            caption: 'HTML sahifa tuzilmasi'
          },
          {
            title: 'Semantik teglar',
            content: '<header>, <main>, <footer> kabi teglar sahifani aniq va tushunarli qiladi. Semantik teglar SEO va accessibility uchun ham foydali.'
          },
          {
            title: 'Forma elementlari',
            content: '<input>, <button>, <label> - foydalanuvchi ma\'lumot kiritishi uchun ishlatiladi. Input turlari: text, email, password kabi.'
          }
        ],
        quiz: [
          {
            question: 'Sarlavha uchun qaysi teg ishlatiladi?',
            options: [
              { text: '<h1>', isCorrect: true },
              { text: '<p>', isCorrect: false },
              { text: '<div>', isCorrect: false }
            ],
            explanation: '<h1> eng katta sarlavha tegi.'
          }
        ]
      }
    },
    {
      id: 'fe-l2',
      course_id: 'frontend-101',
      title: 'CSS: bezash va ranglar',
      duration: '28 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 2,
      content: {
        sections: [
          {
            title: 'CSS nima?',
            content: 'CSS - veb-sahifani bezash tili. Rang, shrift va joylashuvni belgilaydi. CSS orqali saytga uslub va kayfiyat beriladi.',
            image: '/illustrations/frontend-css.svg',
            imageAlt: 'CSS kodi',
            caption: 'CSS orqali bezash'
          },
          {
            title: 'Box model',
            content: 'Margin, border, padding, content - elementlar orasidagi masofani belgilaydi. Box modelni tushunish layout ishlari uchun juda muhim.'
          },
          {
            title: 'Rang va shrift',
            content: 'Color, background, font-size kabi xossalar yordamida ko\'rinishni sozlaysiz. Kontrast va o\'qish qulayligi haqida o\'ylang.'
          }
        ]
      }
    },
    {
      id: 'fe-l3',
      course_id: 'frontend-101',
      title: 'Flexbox va Grid',
      duration: '26 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 3,
      content: {
        sections: [
          {
            title: 'Flexbox g\'oyasi',
            content: 'Flex - elementlarni bir qatorda joylashtirish uchun qulay. justify-content va align-items eng muhim xossalar. Flex yordamida gorizontal va vertikal tekislash osonlashadi.',
            image: '/illustrations/frontend-layout.svg',
            imageAlt: 'Flex va Grid ko\'rinishi',
            caption: 'Joylashuv tizimlari'
          },
          {
            title: 'Grid g\'oyasi',
            content: 'Grid - ikki o\'lchovli tartib. Ustun va qatorlarni boshqarish uchun ishlatiladi. Murakkab maketlar uchun Grid juda qulay.'
          },
          {
            title: 'Amaliy maket',
            content: 'Karta dizayni, navbar va yon panelni grid yordamida tartiblash mumkin. Har bir bo\'limni alohida area sifatida belgilab ishlang.'
          }
        ]
      }
    },
    {
      id: 'fe-l4',
      course_id: 'frontend-101',
      title: 'React komponentlar',
      duration: '30 daqiqa',
      level: 'Boshlang\'ich',
      order_index: 4,
      content: {
        sections: [
          {
            title: 'Komponent nima?',
            content: 'Komponent - UI ning qayta ishlatiladigan qismi. Har bir tugma yoki karta komponent bo\'lishi mumkin. Komponentlar kodni tartibli va qayta foydalaniladigan qiladi.',
            image: '/illustrations/frontend-react.svg',
            imageAlt: 'React komponent ramzi',
            caption: 'Komponent yondashuvi'
          },
          {
            title: 'Props va state',
            content: 'Props - tashqaridan keladigan ma\'lumot, state - komponent ichidagi holat. State o\'zgarganda UI yangilanadi.'
          },
          {
            title: 'Oddiy misol',
            content: 'const Button = ({ title }) => <button>{title}</button>; kabi yoziladi. Amalda button rangini props orqali boshqarish mumkin.'
          }
        ]
      }
    }
  ]
};
