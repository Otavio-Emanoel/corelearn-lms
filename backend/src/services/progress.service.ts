import { ProgressRepository } from "../repositories/progress.repository";
import { LessonRepository } from "../repositories/lesson.repository";

const progressRepo = new ProgressRepository();
const lessonRepo = new LessonRepository();

const COMPLETION_THRESHOLD = 0.9; // 90%

export class ProgressService {
  /**
   * Called when student presses Play.
   * Returns current progress so the player can seek to lastPosition.
   */
  async onPlay(userId: string, lessonId: string) {
    const progress = await progressRepo.findByUserAndLesson(userId, lessonId);
    return progress ?? { lastPosition: 0, watchedSecs: 0, completed: false };
  }

  /**
   * Called on Pause or tab close.
   * Accumulates watched seconds and stores last position.
   */
  async onPause(userId: string, lessonId: string, currentPositionSecs: number, sessionWatchedSecs: number) {
    const existing = await progressRepo.findByUserAndLesson(userId, lessonId);
    const totalWatched = (existing?.watchedSecs ?? 0) + sessionWatchedSecs;

    return progressRepo.upsert(userId, lessonId, {
      watchedSecs: totalWatched,
      lastPosition: currentPositionSecs,
    });
  }

  /**
   * Called when video reaches 90% — marks lesson as completed.
   */
  async onComplete(userId: string, lessonId: string, currentPositionSecs: number) {
    const lesson = await lessonRepo.findById(lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const existing = await progressRepo.findByUserAndLesson(userId, lessonId);

    // Guard: only mark complete if threshold is genuinely met
    if (lesson.durationSecs > 0) {
      const ratio = currentPositionSecs / lesson.durationSecs;
      if (ratio < COMPLETION_THRESHOLD) {
        throw new Error("Completion threshold not reached");
      }
    }

    return progressRepo.upsert(userId, lessonId, {
      watchedSecs: Math.max(existing?.watchedSecs ?? 0, currentPositionSecs),
      lastPosition: currentPositionSecs,
      completed: true,
      completedAt: new Date(),
    });
  }

  async getByLesson(userId: string, lessonId: string) {
    return progressRepo.findByUserAndLesson(userId, lessonId);
  }

  async getAllByUser(userId: string) {
    return progressRepo.findAllByUser(userId);
  }
}
