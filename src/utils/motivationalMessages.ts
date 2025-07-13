/**
 * Dynamic motivational messages based on day of week and progress
 */

export interface MotivationalMessage {
  greeting: string;
  encouragement: string;
  actionCall: string;
  emoji: string;
}

/**
 * Get motivational message based on day of week and progress percentage
 */
export function getMotivationalMessage(
  dayOfWeek: number, // 0 = Sunday, 1 = Monday, etc.
  progressPercentage: number,
  completedTasks: number,
  totalTasks: number,
  streak: number
): MotivationalMessage {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[dayOfWeek];
  
  // Base messages by day of week
  const dayMessages: Record<number, Partial<MotivationalMessage>> = {
    0: { // Sunday
      greeting: "Sunday Planning Mode! 🗓️",
      actionCall: "Perfect day to strategize for the week ahead!"
    },
    1: { // Monday
      greeting: "Monday Momentum! 💪",
      actionCall: "Let's start this week strong!"
    },
    2: { // Tuesday
      greeting: "Tuesday Drive! 🚀",
      actionCall: "Keep the momentum going!"
    },
    3: { // Wednesday
      greeting: "Wednesday Warrior! ⚡",
      actionCall: "Midweek power - you're crushing it!"
    },
    4: { // Thursday
      greeting: "Thursday Thrive! 🌟",
      actionCall: "Almost there - finish strong!"
    },
    5: { // Friday
      greeting: "Friday Focus! 🎯",
      actionCall: "End the week with a bang!"
    },
    6: { // Saturday
      greeting: "Saturday Success! 🏆",
      actionCall: "Weekend warrior mode activated!"
    }
  };

  // Progress-based encouragement
  let encouragement = "";
  let emoji = "🎯";

  if (progressPercentage >= 90) {
    encouragement = `Outstanding! You've completed ${completedTasks}/${totalTasks} tasks. You're absolutely crushing your goals!`;
    emoji = "🏆";
  } else if (progressPercentage >= 75) {
    encouragement = `Excellent progress! ${completedTasks}/${totalTasks} tasks done. You're in the home stretch!`;
    emoji = "🌟";
  } else if (progressPercentage >= 50) {
    encouragement = `Great work! You're ${progressPercentage.toFixed(0)}% through your weekly tasks. Keep the momentum!`;
    emoji = "🚀";
  } else if (progressPercentage >= 25) {
    encouragement = `Good start! ${completedTasks} tasks completed. You're building momentum!`;
    emoji = "💪";
  } else if (completedTasks > 0) {
    encouragement = `Every journey starts with a single step. ${completedTasks} task${completedTasks > 1 ? 's' : ''} down!`;
    emoji = "🌱";
  } else {
    encouragement = "Ready to make today count? Your marketing success starts with the first task!";
    emoji = "⚡";
  }

  // Add streak motivation
  if (streak > 0) {
    if (streak >= 7) {
      encouragement += ` 🔥 Amazing ${streak}-day streak!`;
    } else if (streak >= 3) {
      encouragement += ` 🔥 ${streak}-day streak going strong!`;
    } else {
      encouragement += ` 🔥 ${streak}-day streak!`;
    }
  }

  // Special weekend messages
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    if (progressPercentage >= 80) {
      encouragement = `Weekend and winning! You've completed ${progressPercentage.toFixed(0)}% of your weekly goals. Time to celebrate! 🎉`;
    } else {
      encouragement = `Weekend hustle! ${completedTasks} tasks done. Every successful entrepreneur works smart on weekends! 💼`;
    }
  }

  // Special Monday motivation
  if (dayOfWeek === 1) {
    if (progressPercentage === 0) {
      encouragement = "Fresh week, fresh opportunities! Your marketing empire starts with today's first task! 🌅";
    } else {
      encouragement = `Monday and already ${progressPercentage.toFixed(0)}% done! You're ahead of the game! 🏃‍♂️`;
    }
  }

  // Special Friday motivation
  if (dayOfWeek === 5) {
    if (progressPercentage >= 80) {
      encouragement = `Friday and fantastic! ${progressPercentage.toFixed(0)}% complete - what a week! 🎊`;
    } else {
      encouragement = `Friday finish line! ${completedTasks}/${totalTasks} tasks done. Let's close this week strong! 💥`;
    }
  }

  return {
    greeting: dayMessages[dayOfWeek].greeting || `Happy ${currentDay}! 🌟`,
    encouragement,
    actionCall: dayMessages[dayOfWeek].actionCall || "Let's make today productive!",
    emoji
  };
}

/**
 * Get time-based greeting
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 6) {
    return "Early bird! 🌅";
  } else if (hour < 12) {
    return "Good morning! ☀️";
  } else if (hour < 17) {
    return "Good afternoon! 🌤️";
  } else if (hour < 21) {
    return "Good evening! 🌆";
  } else {
    return "Night owl! 🌙";
  }
}

/**
 * Get streak celebration message
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) {
    return "Ready to start your streak? 🚀";
  } else if (streak === 1) {
    return "Great start! Day 1 of your streak! 🌱";
  } else if (streak < 7) {
    return `${streak} days strong! Keep it going! 🔥`;
  } else if (streak < 30) {
    return `${streak}-day streak! You're on fire! 🔥🔥`;
  } else if (streak < 100) {
    return `${streak} days! Absolutely incredible! 🔥🔥🔥`;
  } else {
    return `${streak} days! You're a marketing legend! 👑🔥`;
  }
}
