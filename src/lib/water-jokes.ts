/** Detect when the user is "watering" the flower with humor. */
export function isWateringJoke(text: string): boolean {
  const patterns = [
    /\b(joke|jokes|funny|hilarious|lol|lmao|haha|hehe|😂|🤣|😄)\b/i,
    /\b(knock knock|pun|puns|riddle|riddles)\b/i,
    /\b(why did the|what do you call|what's the difference|tell me something funny)\b/i,
    /\b(laugh|laughing|make me laugh|got any jokes|say something funny)\b/i,
    /\b(comedy|humor|humour|witty|silly|goofy|absurd)\b/i,
  ];

  return patterns.some((p) => p.test(text));
}

export const WATERING_HINTS = [
  "Tell the gardener a joke to water your flower 💧",
  "Share something funny — laughter helps it bloom",
  "Try a pun or riddle to water your plant",
];
