import React, { useEffect, useMemo, useState } from 'react';
import type { Course, Lesson, QuizQuestion, QuizOption, UserPreferences } from '../types';
import {
  createOrUpdateCourse,
  createOrUpdateLesson,
  deleteCourse,
  deleteLesson,
  getCourses,
  getLessonsByCourseId,
} from '../firebaseData';

interface Props {
  prefs: UserPreferences;
}

const emptyCourse: Course = {
  id: '',
  name: '',
  description: '',
  icon: '🎓',
  color_hex: '#ffffff',
  level_tag: 'BEGINNER',
  published: true,
};

const emptyLesson: Lesson = {
  id: '',
  courseId: '',
  title: '',
  content: { sections: [] },
  duration: '10 daqiqa',
  level: 'Boshlangich',
  order_index: 1,
};

const emptySection = { title: '', content: '' };
const emptyQuizOption: QuizOption = { text: '', isCorrect: false };
const emptyQuizQuestion: QuizQuestion = {
  question: '',
  options: [{ ...emptyQuizOption }, { ...emptyQuizOption }],
  explanation: '',
};

const AdminPanel: React.FC<Props> = ({ prefs }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseForm, setCourseForm] = useState<Course>(emptyCourse);
  const [lessonForm, setLessonForm] = useState<Lesson>(emptyLesson);
  const [sections, setSections] = useState<Lesson['content']['sections']>([{ ...emptySection }]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizEnabled, setQuizEnabled] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseStyle = { fontSize: `${prefs.fontSize}px` };

  const toSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const buildCourseId = (name: string) => {
    const base = toSlug(name) || 'course';
    return `${base}-${Date.now().toString(36)}`;
  };

  const buildLessonId = (title: string) => {
    const base = toSlug(title) || 'lesson';
    return `${base}-${Date.now().toString(36)}`;
  };

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) || null,
    [courses, selectedCourseId],
  );

  const refreshCourses = async () => {
    const data = await getCourses();
    setCourses(data);
    if (!selectedCourseId && data.length > 0) {
      setSelectedCourseId(data[0].id);
    }
  };

  const refreshLessons = async (courseId: string) => {
    if (!courseId) return;
    const data = await getLessonsByCourseId(courseId);
    setLessons(data);
  };

  useEffect(() => {
    async function loadAdminData() {
      try {
        await refreshCourses();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Kurslarni yuklashda xatolik.');
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  useEffect(() => {
    refreshLessons(selectedCourseId);
  }, [selectedCourseId]);

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name.trim()) {
      setError('Kurs nomi majburiy.');
      return;
    }
    setError(null);
    const payload: Course = {
      ...courseForm,
      id: courseForm.id?.trim() || buildCourseId(courseForm.name),
    };
    await createOrUpdateCourse(payload);
    await refreshCourses();
    setCourseForm(emptyCourse);
  };

  const handleCourseEdit = (course: Course) => {
    setCourseForm(course);
  };

  const handleCourseDelete = async (courseId: string) => {
    if (!window.confirm('Kursni o‘chirishni xohlaysizmi?')) return;
    await deleteCourse(courseId);
    await refreshCourses();
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) {
      setError('Dars sarlavhasi majburiy.');
      return;
    }
    if (!lessonForm.courseId.trim()) {
      setError('Kurs tanlanishi kerak.');
      return;
    }
    const cleanedSections = sections
      .map((section) => ({
        title: section.title.trim(),
        content: section.content.trim(),
      }))
      .filter((section) => section.title || section.content);

    if (cleanedSections.length === 0) {
      setError('Kamida bitta bo‘lim (title yoki content) kiriting.');
      return;
    }

    const cleanedQuiz = quizEnabled
      ? quizQuestions
          .map((question) => ({
            question: question.question.trim(),
            explanation: question.explanation.trim(),
            options: question.options
              .map((option) => ({ ...option, text: option.text.trim() }))
              .filter((option) => option.text),
          }))
          .filter((question) => question.question && question.options.length > 0)
      : [];

    if (quizEnabled && cleanedQuiz.length === 0) {
      setError('Quiz uchun kamida bitta savol kiriting yoki quizni o‘chirib qo‘ying.');
      return;
    }

    const hasIncorrectQuiz = cleanedQuiz.some(
      (question) => !question.options.some((option) => option.isCorrect),
    );
    if (quizEnabled && hasIncorrectQuiz) {
      setError('Har bir quiz savolda kamida bitta to‘g‘ri javob belgilang.');
      return;
    }

    const payload: Lesson = {
      ...lessonForm,
      id: lessonForm.id?.trim() || buildLessonId(lessonForm.title),
      content: {
        sections: cleanedSections,
        ...(quizEnabled && cleanedQuiz.length > 0 ? { quiz: cleanedQuiz } : {}),
      },
    };

    await createOrUpdateLesson(payload);
    await refreshLessons(lessonForm.courseId);
    setLessonForm({ ...emptyLesson, courseId: lessonForm.courseId });
    setSections([{ ...emptySection }]);
    setQuizQuestions([]);
    setQuizEnabled(false);
    setError(null);
  };

  const handleLessonEdit = (lesson: Lesson) => {
    setLessonForm(lesson);
    setSections(lesson.content.sections?.length ? lesson.content.sections : [{ ...emptySection }]);
    setQuizQuestions(lesson.content.quiz || []);
    setQuizEnabled(!!lesson.content.quiz && lesson.content.quiz.length > 0);
  };

  const handleLessonDelete = async (lessonId: string) => {
    if (!window.confirm('Darsni o‘chirishni xohlaysizmi?')) return;
    await deleteLesson(lessonId);
    await refreshLessons(selectedCourseId);
  };

  if (loading) return <div className="p-20 text-center font-black text-3xl uppercase">Yuklanmoqda...</div>;

  return (
    <div className="max-w-6xl mx-auto py-12 space-y-12 animate-in fade-in duration-500" style={baseStyle}>
      <header className="border-b-4 border-slate-900 pb-6">
        <h1 className="text-6xl font-black uppercase tracking-tight">Admin Panel</h1>
        <p className="text-lg font-bold text-slate-600">Kurslar va darslar boshqaruvi</p>
      </header>

      {error && (
        <div className="brutal-card p-6 bg-red-50 border-red-400 font-black uppercase text-red-700">
          {error}
        </div>
      )}

      <section className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h2 className="text-3xl font-black uppercase tracking-tight">Kurs qo‘shish / tahrirlash</h2>
          <form onSubmit={handleCourseSubmit} className="brutal-card p-8 bg-white space-y-4">
            <input
              className="w-full border-4 border-slate-900 p-3 font-bold"
              placeholder="Kurs nomiga qarab ID avtomatik yaratiladi"
              value={courseForm.id}
              onChange={(e) => setCourseForm({ ...courseForm, id: e.target.value })}
            />
            <input
              className="w-full border-4 border-slate-900 p-3 font-bold"
              placeholder="Nomi"
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
            />
            <textarea
              className="w-full border-4 border-slate-900 p-3 font-bold min-h-[90px]"
              placeholder="Tavsif"
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                className="w-full border-4 border-slate-900 p-3 font-bold"
                placeholder="Ikonka (emoji)"
                value={courseForm.icon}
                onChange={(e) => setCourseForm({ ...courseForm, icon: e.target.value })}
              />
              <input
                className="w-full border-4 border-slate-900 p-3 font-bold"
                placeholder="Rang (#ffcc00)"
                value={courseForm.color_hex}
                onChange={(e) => setCourseForm({ ...courseForm, color_hex: e.target.value })}
              />
            </div>
            <input
              className="w-full border-4 border-slate-900 p-3 font-bold"
              placeholder="Level tag (BEGINNER)"
              value={courseForm.level_tag}
              onChange={(e) => setCourseForm({ ...courseForm, level_tag: e.target.value })}
            />
            <label className="flex items-center gap-3 font-black uppercase text-sm">
              <input
                type="checkbox"
                checked={!!courseForm.published}
                onChange={(e) => setCourseForm({ ...courseForm, published: e.target.checked })}
              />
              Eʼlon qilingan
            </label>
            <button className="brutal-btn bg-yellow-400 font-black w-full">Saqlash</button>
          </form>

          <div className="space-y-4">
            <h3 className="text-2xl font-black uppercase">Mavjud kurslar</h3>
            {courses.length === 0 ? (
              <div className="brutal-card p-6 bg-slate-50 font-black uppercase text-center">
                Kurs yo‘q
              </div>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="brutal-card p-6 bg-white flex items-center justify-between">
                  <div>
                    <div className="font-black text-xl">{course.name}</div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">{course.id}</div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleCourseEdit(course)} className="brutal-btn bg-white">Tahrirlash</button>
                    <button onClick={() => handleCourseDelete(course.id)} className="brutal-btn bg-red-400">O‘chirish</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-black uppercase tracking-tight">Darslar boshqaruvi</h2>
          <div className="brutal-card p-6 bg-white space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Kurs tanlang</label>
            <select
              className="w-full border-4 border-slate-900 p-3 font-bold"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setLessonForm({ ...emptyLesson, courseId: e.target.value });
                setSections([{ ...emptySection }]);
                setQuizQuestions([]);
                setQuizEnabled(false);
              }}
            >
              <option value="">Kurs tanlang</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
            {selectedCourse && (
              <div className="text-sm font-bold text-slate-600">
                Tanlangan kurs: {selectedCourse.name}
              </div>
            )}
          </div>

          <form onSubmit={handleLessonSubmit} className="brutal-card p-8 bg-white space-y-4">
            <div className="brutal-card p-4 bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-500">
              Kurs ID: {lessonForm.courseId || 'Kurs tanlang'}
            </div>
            <input
              className="w-full border-4 border-slate-900 p-3 font-bold"
              placeholder="Sarlavha"
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                className="w-full border-4 border-slate-900 p-3 font-bold"
                placeholder="Davomiyligi (10 daqiqa)"
                value={lessonForm.duration}
                onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
              />
              <input
                className="w-full border-4 border-slate-900 p-3 font-bold"
                placeholder="Daraja (Boshlangich)"
                value={lessonForm.level}
                onChange={(e) => setLessonForm({ ...lessonForm, level: e.target.value })}
              />
            </div>
            <input
              type="number"
              className="w-full border-4 border-slate-900 p-3 font-bold"
              placeholder="Tartib raqami"
              value={lessonForm.order_index}
              onChange={(e) => setLessonForm({ ...lessonForm, order_index: Number(e.target.value) })}
            />

            <div className="space-y-4 border-t-4 border-slate-200 pt-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-black uppercase">Dars bo‘limlari</h4>
                <button
                  type="button"
                  className="brutal-btn bg-white"
                  onClick={() => setSections([...sections, { ...emptySection }])}
                >
                  + Bo‘lim qo‘shish
                </button>
              </div>
              {sections.map((section, index) => (
                <div key={`section-${index}`} className="brutal-card p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase text-xs">Bo‘lim {index + 1}</span>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        className="brutal-btn bg-red-400 text-xs"
                        onClick={() => setSections(sections.filter((_, idx) => idx !== index))}
                      >
                        O‘chirish
                      </button>
                    )}
                  </div>
                  <input
                    className="w-full border-4 border-slate-900 p-3 font-bold"
                    placeholder="Bo‘lim sarlavhasi"
                    value={section.title}
                    onChange={(e) => {
                      const next = [...sections];
                      next[index] = { ...next[index], title: e.target.value };
                      setSections(next);
                    }}
                  />
                  <textarea
                    className="w-full border-4 border-slate-900 p-3 font-bold min-h-[120px]"
                    placeholder="Bo‘lim matni"
                    value={section.content}
                    onChange={(e) => {
                      const next = [...sections];
                      next[index] = { ...next[index], content: e.target.value };
                      setSections(next);
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t-4 border-slate-200 pt-6">
              <label className="flex items-center gap-3 font-black uppercase text-sm">
                <input
                  type="checkbox"
                  checked={quizEnabled}
                  onChange={(e) => setQuizEnabled(e.target.checked)}
                />
                Quiz qo‘shish
              </label>

              {quizEnabled && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black uppercase">Quiz savollari</h4>
                    <button
                      type="button"
                      className="brutal-btn bg-white"
                      onClick={() => setQuizQuestions([...quizQuestions, { ...emptyQuizQuestion }])}
                    >
                      + Savol qo‘shish
                    </button>
                  </div>

                  {quizQuestions.length === 0 && (
                    <div className="brutal-card p-4 bg-slate-50 font-black uppercase text-center text-sm">
                      Savol yo‘q
                    </div>
                  )}

                  {quizQuestions.map((question, questionIndex) => (
                    <div key={`quiz-${questionIndex}`} className="brutal-card p-4 bg-slate-50 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-black uppercase text-xs">Savol {questionIndex + 1}</span>
                        <button
                          type="button"
                          className="brutal-btn bg-red-400 text-xs"
                          onClick={() =>
                            setQuizQuestions(quizQuestions.filter((_, idx) => idx !== questionIndex))
                          }
                        >
                          O‘chirish
                        </button>
                      </div>
                      <input
                        className="w-full border-4 border-slate-900 p-3 font-bold"
                        placeholder="Savol matni"
                        value={question.question}
                        onChange={(e) => {
                          const next = [...quizQuestions];
                          next[questionIndex] = { ...next[questionIndex], question: e.target.value };
                          setQuizQuestions(next);
                        }}
                      />
                      <textarea
                        className="w-full border-4 border-slate-900 p-3 font-bold min-h-[80px]"
                        placeholder="Izoh (tushuntirish)"
                        value={question.explanation}
                        onChange={(e) => {
                          const next = [...quizQuestions];
                          next[questionIndex] = { ...next[questionIndex], explanation: e.target.value };
                          setQuizQuestions(next);
                        }}
                      />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-black uppercase text-xs">Variantlar</span>
                          <button
                            type="button"
                            className="brutal-btn bg-white text-xs"
                            onClick={() => {
                              const next = [...quizQuestions];
                              const options = [...next[questionIndex].options, { ...emptyQuizOption }];
                              next[questionIndex] = { ...next[questionIndex], options };
                              setQuizQuestions(next);
                            }}
                          >
                            + Variant
                          </button>
                        </div>

                        {question.options.map((option, optionIndex) => (
                          <div key={`option-${questionIndex}-${optionIndex}`} className="flex gap-3 items-center">
                            <input
                              className="flex-1 border-4 border-slate-900 p-3 font-bold"
                              placeholder={`Variant ${optionIndex + 1}`}
                              value={option.text}
                              onChange={(e) => {
                                const next = [...quizQuestions];
                                const options = [...next[questionIndex].options];
                                options[optionIndex] = { ...options[optionIndex], text: e.target.value };
                                next[questionIndex] = { ...next[questionIndex], options };
                                setQuizQuestions(next);
                              }}
                            />
                            <label className="flex items-center gap-2 font-black text-xs uppercase">
                              <input
                                type="radio"
                                name={`correct-${questionIndex}`}
                                checked={option.isCorrect}
                                onChange={() => {
                                  const next = [...quizQuestions];
                                  const options = next[questionIndex].options.map((opt, idx) => ({
                                    ...opt,
                                    isCorrect: idx === optionIndex,
                                  }));
                                  next[questionIndex] = { ...next[questionIndex], options };
                                  setQuizQuestions(next);
                                }}
                              />
                              To‘g‘ri
                            </label>
                            {question.options.length > 2 && (
                              <button
                                type="button"
                                className="brutal-btn bg-red-400 text-xs"
                                onClick={() => {
                                  const next = [...quizQuestions];
                                  const options = next[questionIndex].options.filter(
                                    (_, idx) => idx !== optionIndex,
                                  );
                                  next[questionIndex] = { ...next[questionIndex], options };
                                  setQuizQuestions(next);
                                }}
                              >
                                O‘chirish
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="brutal-btn bg-yellow-400 font-black w-full">Darsni saqlash</button>
          </form>

          <div className="space-y-4">
            <h3 className="text-2xl font-black uppercase">Darslar ro‘yxati</h3>
            {selectedCourseId === '' ? (
              <div className="brutal-card p-6 bg-slate-50 font-black uppercase text-center">
                Kurs tanlang
              </div>
            ) : lessons.length === 0 ? (
              <div className="brutal-card p-6 bg-slate-50 font-black uppercase text-center">
                Dars yo‘q
              </div>
            ) : (
              lessons.map((lesson) => (
                <div key={lesson.id} className="brutal-card p-6 bg-white flex items-center justify-between">
                  <div>
                    <div className="font-black text-lg">{lesson.title}</div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">{lesson.id}</div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleLessonEdit(lesson)} className="brutal-btn bg-white">Tahrirlash</button>
                    <button onClick={() => handleLessonDelete(lesson.id)} className="brutal-btn bg-red-400">O‘chirish</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
