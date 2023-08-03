export function cleanInput(input: string) {
  const regex =
    /\p{Script=Common}|\p{Script=Latin}|\p{Script=Greek}|\p{Script=Cyrillic}|\p{Script=Arabic}|\p{Script=Hebrew}|\p{Script=Chinese}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}|\p{Script=Thai}|\p{Script=Devanagari}/gu;
  return Array.from(input)
    .filter((char) => regex.test(char))
    .join("");
}
