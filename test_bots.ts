import { bots } from "./src/data/bots";
console.log("Total bots:", bots.length);
bots.forEach((b, i) => {
  if (!b) console.log("Bot undefined at index", i);
});
