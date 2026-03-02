export type Question = {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
};

export const QUESTIONS: Question[] = [
  // Easy
  {
    id: 1,
    text: "في أي شهر يبدأ الصيام حسب التقويم الهجري؟",
    options: ["شوال", "رمضان", "ذو الحجة"],
    correctAnswerIndex: 1,
    difficulty: 'easy'
  },
  {
    id: 2,
    text: "عدد ركعات صلاة الفجر؟",
    options: ["2", "4", "3"],
    correctAnswerIndex: 0,
    difficulty: 'easy'
  },
  {
    id: 3,
    text: "الطبق التقليدي في رمضان بمصر؟",
    options: ["كشري", "فتة", "ملوخية"],
    correctAnswerIndex: 1,
    difficulty: 'easy'
  },
  {
    id: 4,
    text: "اسم الليلة التي نزل فيها القرآن؟",
    options: ["ليلة القدر", "ليلة الإسراء", "ليلة النصف من شعبان"],
    correctAnswerIndex: 0,
    difficulty: 'easy'
  },
  {
    id: 5,
    text: "الفاكهة الرمزية في رمضان؟",
    options: ["تفاح", "تمر", "موز"],
    correctAnswerIndex: 1,
    difficulty: 'easy'
  },
  // Medium
  {
    id: 6,
    text: "كم عدد أشهر السنة الهجرية؟",
    options: ["10", "12", "14"],
    correctAnswerIndex: 1,
    difficulty: 'medium'
  },
  {
    id: 7,
    text: "الدعاء المشهور عند الإفطار؟",
    options: ["اللهم صلِّ على النبي", "ذهب الظمأ وابتلت العروق وثبت الأجر إن شاء الله", "سبحان الله"],
    correctAnswerIndex: 1,
    difficulty: 'medium'
  },
  {
    id: 8,
    text: "من هو الملقب بـ \"سيف الله المسلول\"؟",
    options: ["علي بن أبي طالب", "خالد بن الوليد", "أبو بكر الصديق"],
    correctAnswerIndex: 1,
    difficulty: 'medium'
  },
  {
    id: 9,
    text: "الاسم القديم لمكة؟",
    options: ["بدر", "بكة", "الطائف"],
    correctAnswerIndex: 1,
    difficulty: 'medium'
  },
  {
    id: 10,
    text: "عدد أجزاء القرآن الكريم؟",
    options: ["20", "30", "25"],
    correctAnswerIndex: 1,
    difficulty: 'medium'
  },
  // Hard
  {
    id: 11,
    text: "ماذا يُستحب فعله عند السحور؟",
    options: ["الدعاء وذكر الله", "النوم مباشرة", "الصمت التام"],
    correctAnswerIndex: 0,
    difficulty: 'hard'
  },
  {
    id: 12,
    text: "من الخليفة الذي جمع القرآن في مصحف واحد بالشكل النهائي؟",
    options: ["عمر بن الخطاب", "أبو بكر الصديق", "عثمان بن عفان"],
    correctAnswerIndex: 2,
    difficulty: 'hard'
  },
  {
    id: 13,
    text: "في أي الليالي تُلتمس ليلة القدر؟",
    options: ["الليالي الزوجية", "الليالي الوترية في العشر الأواخر", "منتصف الشهر"],
    correctAnswerIndex: 1,
    difficulty: 'hard'
  },
  {
    id: 14,
    text: "ما اسم الزكاة الواجبة قبل صلاة العيد؟",
    options: ["زكاة الفطر", "زكاة المال", "صدقة التطوع"],
    correctAnswerIndex: 0,
    difficulty: 'hard'
  },
  {
    id: 15,
    text: "كم عدد أيام شهر رمضان غالبًا؟",
    options: ["29 أو 30 يومًا", "31", "28"],
    correctAnswerIndex: 0,
    difficulty: 'hard'
  }
];
