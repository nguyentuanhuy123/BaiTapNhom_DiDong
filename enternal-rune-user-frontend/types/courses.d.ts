
// ===== Comment / Q&A =====
type CommentType = {
  _id: string;
  user: User;
  question: string;
  questionReplies: CommentType[];
};

// ===== Review =====
type ReviewType = {
  user: User;
  rating?: number;
  comment: string;
  commentReplies?: ReviewType[];
};

// ===== Links =====
type LinkType = {
  title: string;
  url: string;
};

// ===== Quiz =====
type QuizOptionType = {
  text: string;
  isCorrect: boolean;
};

type QuizQuestionType = {
  question: string;
  options: QuizOptionType[];
  explanation?: string;
};

// ===== Study Materials =====
type StudyMaterialType = {
  title: string;
  content: string; // text hoặc URL file
};

// ===== Course Data (Lesson / Video) =====
type CourseDataType = {
  _id: string | any;
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: LinkType[];
  suggestion: string;
  questions: CommentType[];
  quizQuestions?: QuizQuestionType[]; // ✅ thêm quiz
  studyMaterials?: StudyMaterialType[]; // ✅ thêm study materials
};

// ===== Benefit / Prerequisite =====
type BenefitType = {
  title: string;
};

type PrerequisiteType = {
  title: string;
};

// ===== Course =====
type CoursesType = {
  _id: any;
  name: string;
  description: string;
  categories: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: {
    public_id: string | any;
    url: string | any;
  };
  tags: string;
  level: string;
  demoUrl: string;
  benefits: BenefitType[];
  prerequisites: PrerequisiteType[];
  reviews: ReviewType[];
  courseData: CourseDataType[];
  ratings?: number;
  purchased: number;
};

// ===== Course + Progress =====
type CoursesTypeWithProgress = CoursesType & { progress?: number };
