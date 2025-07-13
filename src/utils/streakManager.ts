import { supabase } from "@/integrations/supabase/client";

export interface PlatformStreak {
  id: string;
  user_id: string;
  platform: string;
  current_streak: number;
  best_streak: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  category: string;
  completed: boolean;
  created_at: string;
}

/**
 * Updates platform streak when a task is completed or uncompleted
 */
export async function updatePlatformStreak(
  userId: string, 
  platform: string, 
  isCompleted: boolean
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get or create platform streak record
    let { data: streakData, error: fetchError } = await supabase
      .from('platform_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!streakData) {
      // Create new streak record
      const { data: newStreak, error: insertError } = await supabase
        .from('platform_streaks')
        .insert({
          user_id: userId,
          platform: platform,
          current_streak: isCompleted ? 1 : 0,
          best_streak: isCompleted ? 1 : 0,
          last_activity_date: today
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return;
    }

    // Calculate new streak
    let newCurrentStreak = streakData.current_streak;
    
    if (isCompleted) {
      // Task completed
      if (streakData.last_activity_date === today) {
        // Already had activity today, no change to streak
        return;
      } else if (streakData.last_activity_date === yesterdayStr) {
        // Consecutive day, increment streak
        newCurrentStreak = streakData.current_streak + 1;
      } else {
        // Gap in activity, reset streak to 1
        newCurrentStreak = 1;
      }
    } else {
      // Task uncompleted - check if this breaks today's streak
      const todayTasks = await getTodayTasksForPlatform(userId, platform);
      const completedTodayTasks = todayTasks.filter(task => task.completed && task.id !== arguments[3]); // Exclude the task being uncompleted
      
      if (completedTodayTasks.length === 0 && streakData.last_activity_date === today) {
        // No more completed tasks today, might break streak
        newCurrentStreak = Math.max(0, streakData.current_streak - 1);
      }
    }

    // Update streak record
    const { error: updateError } = await supabase
      .from('platform_streaks')
      .update({
        current_streak: newCurrentStreak,
        best_streak: Math.max(streakData.best_streak, newCurrentStreak),
        last_activity_date: isCompleted ? today : streakData.last_activity_date
      })
      .eq('id', streakData.id);

    if (updateError) throw updateError;

  } catch (error) {
    console.error('Error updating platform streak:', error);
  }
}

/**
 * Get today's tasks for a specific platform
 */
async function getTodayTasksForPlatform(userId: string, platform: string): Promise<Task[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('tasks')
    .select('id, category, completed, created_at')
    .eq('user_id', userId)
    .eq('category', platform)
    .gte('created_at', today)
    .lt('created_at', `${today}T23:59:59.999Z`);

  if (error) {
    console.error('Error fetching today tasks:', error);
    return [];
  }

  return data || [];
}

/**
 * Calculate overall daily streak based on task completion
 */
export async function calculateDailyStreak(userId: string): Promise<number> {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('created_at, completed, week_start_date')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!tasks || tasks.length === 0) return 0;

    // Group tasks by date
    const tasksByDate: Record<string, boolean> = {};
    
    tasks.forEach(task => {
      const date = task.created_at.split('T')[0];
      if (!tasksByDate[date]) {
        tasksByDate[date] = false;
      }
      if (task.completed) {
        tasksByDate[date] = true;
      }
    });

    // Calculate consecutive days with completed tasks
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) { // Check up to a year back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (tasksByDate[dateStr]) {
        streak++;
      } else if (i === 0) {
        // Today has no completed tasks, but check if it's still early
        const now = new Date();
        if (now.getHours() < 6) {
          // It's early morning, don't break streak yet
          continue;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating daily streak:', error);
    return 0;
  }
}

/**
 * Get all platform streaks for a user
 */
export async function getPlatformStreaks(userId: string): Promise<PlatformStreak[]> {
  try {
    const { data, error } = await supabase
      .from('platform_streaks')
      .select('*')
      .eq('user_id', userId)
      .order('current_streak', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching platform streaks:', error);
    return [];
  }
}
