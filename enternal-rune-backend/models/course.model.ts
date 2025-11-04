import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

// ==== Comment Schema ====
export interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies: IComment[];
}

const commentSchema = new Schema<IComment>(
  {
    user: Object,
    question: String,
    questionReplies: [Object],
  },
  { timestamps: true }
);

// ==== Review Schema ====
export interface IReview extends Document {
  user: IUser;
  rating?: number;
  comment: string;
  commentReplies?: IReview[];
}

const reviewSchema = new Schema<IReview>(
  {
    user: Object,
    rating: { type: Number, default: 0 },
    comment: String,
    commentReplies: [Object],
  },
  { timestamps: true }
);

// ==== Link Schema ====
export interface ILink extends Document {
  title: string;
  url: string;
}

const linkSchema = new Schema<ILink>({
  title: String,
  url: String,
});

// ==== Quiz Schema ====
export interface IQuizOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuizQuestion extends Document {
  question: string;
  options: IQuizOption[];
  explanation?: string;
}

const quizOptionSchema = new Schema<IQuizOption>({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true },
    options: [quizOptionSchema],
    explanation: String,
  },
  { timestamps: true }
);

// ==== Study Material Schema ====
export interface IStudyMaterial {
  title: string;
  content: string; // text hoặc URL file
}

const studyMaterialSchema = new Schema<IStudyMaterial>({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

// ==== CourseData Schema (Lesson / Video) ====
export interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IComment[];
  quizQuestions?: IQuizQuestion[];
  studyMaterials?: IStudyMaterial[];
}

const courseDataSchema = new Schema<ICourseData>({
  title: String,
  description: String,
  videoUrl: String,
  videoThumbnail: Object,
  videoSection: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkSchema],
  suggestion: String,
  questions: [commentSchema],
  quizQuestions: [quizQuestionSchema],
  studyMaterials: [studyMaterialSchema],
});

// ==== Course Schema ====
export interface ICourse extends Document {
  name: string;
  description: string;
  categories: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: { public_id: string; url: string };
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  ratings?: number;
  purchased: number;
}

const courseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    categories: { type: String, required: true },
    price: { type: Number, required: true },
    estimatedPrice: Number,
    thumbnail: {
      public_id: String,
      url: String,
    },
    tags: { type: String, required: true },
    level: { type: String, required: true },
    demoUrl: { type: String, required: true },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: { type: Number, default: 0 },
    purchased: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ==== Model ====
const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);

export default CourseModel;
