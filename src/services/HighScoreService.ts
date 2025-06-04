import { Storage } from '../interface/storage';
import { ScoreEntry } from '../interface/scoreEnty';

export class HighScoreService {
  private static readonly STORAGE_KEY = 'gameHighScore';
  private static readonly MAX_SCORES = 10;

  constructor(private readonly storage: Storage) {}

  public async getHighScores(): Promise<ScoreEntry[]> {
    try {
      const scores = await this.storage.get<ScoreEntry[]>(HighScoreService.STORAGE_KEY);
      return scores || [];
    } catch (error) {
      console.error('Error loading high scores:', error);
      return [];
    }
  }

  /**
   * Add a new score to the high scores list
   * @param score The score to add
   * @param timeElapsed Time elapsed in milliseconds
   */
  public async addScore(score: number, timeElapsed: number): Promise<boolean> {
    try {
      score = Math.floor(score);

      const scores = await this.getHighScores();
      const timeFormatted = new Date(timeElapsed).toLocaleTimeString();

      const newScore: ScoreEntry = {
        score: score,
        time: timeFormatted,
        date: new Date().toLocaleDateString(),
      };

      scores.push(newScore);

      scores.sort((a, b) => {
        if (a.score !== b.score) {
          return b.score - a.score;
        }
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      });

      const topScores = scores.slice(0, HighScoreService.MAX_SCORES);

      await this.storage.set(HighScoreService.STORAGE_KEY, topScores);

      return topScores.some(
        s => s.score === newScore.score && s.time === newScore.time && s.date === newScore.date
      );
    } catch (error) {
      console.error('Error saving high score:', error);
      return false;
    }
  }

  /**
   * Check if a score would qualify as a high score
   * @param score The score to check
   */
  public async isHighScore(score: number): Promise<boolean> {
    try {
      const scores = await this.getHighScores();

      if (scores.length < HighScoreService.MAX_SCORES) {
        return true;
      }

      const lowestHighScore = scores[scores.length - 1];
      return score > lowestHighScore.score;
    } catch (error) {
      console.error('Error checking if high score:', error);
      return false;
    }
  }

  /**
   * Get the highest score
   */
  public async getHighestScore(): Promise<number> {
    try {
      const scores = await this.getHighScores();
      return scores.length > 0 ? scores[0].score : 0;
    } catch (error) {
      console.error('Error getting highest score:', error);
      return 0;
    }
  }

  /**
   * Clear all high scores
   */
  public async clearHighScores(): Promise<void> {
    try {
      await this.storage.remove(HighScoreService.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing high scores:', error);
      throw error;
    }
  }

  /**
   * Get the rank of a given score (1-based)
   * @param score The score to rank
   * @returns The rank (1 = highest), or -1 if not in high scores
   */
  public async getScoreRank(score: number): Promise<number> {
    try {
      const scores = await this.getHighScores();
      const index = scores.findIndex(s => s.score === score);
      return index >= 0 ? index + 1 : -1;
    } catch (error) {
      console.error('Error getting score rank:', error);
      return -1;
    }
  }
}
