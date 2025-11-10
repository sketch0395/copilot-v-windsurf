// Motivational quotes for ADHD Focus Tracker
// Targeted for 15-30 age group

export const motivationalQuotes = [
  {
    text: "You don't have to be perfect. You just have to show up.",
    author: "Anonymous"
  },
  {
    text: "Small progress is still progress. Keep going! 💪",
    author: "Anonymous"
  },
  {
    text: "Your focus determines your reality.",
    author: "Star Wars"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    text: "You're capable of amazing things. Start small, dream big! ✨",
    author: "Anonymous"
  },
  {
    text: "Progress, not perfection. That's the goal.",
    author: "Anonymous"
  },
  {
    text: "Your ADHD brain is unique, not broken. Use your powers! 🧠",
    author: "Anonymous"
  },
  {
    text: "Every expert was once a beginner. You got this!",
    author: "Anonymous"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "Your vibe attracts your tribe. Stay positive! ✌️",
    author: "Anonymous"
  },
  {
    text: "Difficult roads often lead to beautiful destinations.",
    author: "Anonymous"
  },
  {
    text: "You're doing better than you think you are. Keep pushing!",
    author: "Anonymous"
  },
  {
    text: "Consistency beats intensity. Show up every day.",
    author: "Anonymous"
  },
  {
    text: "Your only limit is you. Break through! 🚀",
    author: "Anonymous"
  },
  {
    text: "Hustle until your haters ask if you're hiring.",
    author: "Anonymous"
  },
  {
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde"
  },
  {
    text: "It's okay to rest, but don't quit. You're stronger than you think!",
    author: "Anonymous"
  },
  {
    text: "Your ADHD is a superpower waiting to be unleashed. 🦸",
    author: "Anonymous"
  },
  {
    text: "Life is 10% what happens to you and 90% how you react to it.",
    author: "Charles R. Swindoll"
  }
];

export function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
}

export function getDailyQuote() {
  // Returns same quote for the day
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % motivationalQuotes.length;
  return motivationalQuotes[index];
}