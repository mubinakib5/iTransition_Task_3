const crypto = require("crypto");
const readline = require("readline-sync");

class FairRandomGenerator {
  static generateHMAC(secretKey, data) {
    return crypto.createHmac("sha3-256", secretKey).update(data).digest("hex");
  }

  static generateRandomValue(min, max) {
    const range = max - min + 1;
    let randomValue;
    do {
      const randomBytes = crypto.randomBytes(4);
      randomValue = randomBytes.readUInt32BE() >>> 0;
    } while (randomValue >= Math.floor(0xffffffff / range) * range);
    return min + (randomValue % range);
  }

  static fairRandom(nonce, min, max) {
    const secretKey = crypto.randomBytes(32).toString("hex");
    const value = this.generateRandomValue(min, max);
    const hmac = this.generateHMAC(secretKey, nonce);
    return { value, key: secretKey, hmac };
  }
}

class Dice {
  constructor(values) {
    this.values = values;
  }

  roll(nonce) {
    const roll = FairRandomGenerator.fairRandom(
      nonce,
      0,
      this.values.length - 1
    );
    return {
      roll: this.values[roll.value],
      key: roll.key,
      hmac: roll.hmac,
      index: roll.value,
    };
  }
}

class Game {
  constructor(diceSet) {
    this.diceSet = diceSet.map((die) => new Dice(die));
  }

  play() {
    console.log("⚔️ Non-Transitive Dice Game Begins!");

    const firstMove = FairRandomGenerator.fairRandom("firstMove", 0, 1);
    console.log(
      `I selected a random value in the range 0..1 (HMAC=${firstMove.hmac}).`
    );
    let userGuess;
    do {
      userGuess = readline.question("Try to guess my selection (0 or 1): ");
    } while (!["0", "1"].includes(userGuess));

    console.log(`My selection: ${firstMove.value} (KEY=${firstMove.key}).`);

    const userMovesFirst = parseInt(userGuess) === firstMove.value;
    console.log(
      userMovesFirst ? "You make the first move." : "I make the first move."
    );

    console.log("Choose your dice:");
    this.diceSet.forEach((die, index) =>
      console.log(`${index} - ${die.values.join(",")}`)
    );

    let userSelection;
    do {
      userSelection = parseInt(readline.question("Your selection: "));
    } while (
      isNaN(userSelection) ||
      userSelection < 0 ||
      userSelection >= this.diceSet.length
    );

    const userDice = this.diceSet[userSelection];
    console.log(`You selected: ${userDice.values.join(",")}`);

    const opponentSelection = FairRandomGenerator.fairRandom(
      "opponentChoice",
      0,
      this.diceSet.length - 1
    ).value;
    const opponentDice = this.diceSet[opponentSelection];
    console.log(`I choose the ${opponentDice.values.join(",")} dice.`);

    console.log("It's time for my roll.");
    const opponentRoll = opponentDice.roll("opponentRoll");
    console.log(
      `I selected a random value in the range 0..${
        opponentDice.values.length - 1
      } (HMAC=${opponentRoll.hmac}).`
    );

    console.log("Add your number modulo your dice size.");
    for (let i = 0; i < userDice.values.length; i++) console.log(`${i} - ${i}`);
    let userMod;
    do {
      userMod = parseInt(readline.question("Your selection: "));
    } while (
      isNaN(userMod) ||
      userMod < 0 ||
      userMod >= userDice.values.length
    );

    console.log(
      `My number is ${opponentRoll.index} (KEY=${opponentRoll.key}).`
    );
    console.log(
      `The fair number generation result is ${
        opponentRoll.index
      } + ${userMod} = ${
        (opponentRoll.index + userMod) % userDice.values.length
      } (mod ${userDice.values.length}).`
    );
    console.log(`My roll result is ${opponentRoll.roll}.`);

    console.log("It's time for your roll.");
    const userRoll = userDice.roll("userRoll");
    console.log(
      `I selected a random value in the range 0..${
        userDice.values.length - 1
      } (HMAC=${userRoll.hmac}).`
    );

    console.log("Add your number modulo your dice size.");
    for (let i = 0; i < userDice.values.length; i++) console.log(`${i} - ${i}`);
    let userFinalMod;
    do {
      userFinalMod = parseInt(readline.question("Your selection: "));
    } while (
      isNaN(userFinalMod) ||
      userFinalMod < 0 ||
      userFinalMod >= userDice.values.length
    );

    console.log(`My number is ${userRoll.index} (KEY=${userRoll.key}).`);
    console.log(
      `The fair number generation result is ${
        userRoll.index
      } + ${userFinalMod} = ${
        (userRoll.index + userFinalMod) % userDice.values.length
      } (mod ${userDice.values.length}).`
    );
    console.log(`Your roll result is ${userRoll.roll}.`);

    console.log(
      userRoll.roll > opponentRoll.roll
        ? "You win! 🎉"
        : userRoll.roll < opponentRoll.roll
        ? "I win! 🤖"
        : "It's a tie! 🔄"
    );
  }
}

const diceSet = process.argv.slice(2).map((arg) => arg.split(",").map(Number));
if (diceSet.length < 2) {
  console.error("Error: At least two dice sets are required.");
  process.exit(1);
}

diceSet.forEach((die, index) => {
  if (die.length < 2) {
    console.error(`Error: Dice ${index} must have at least two values.`);
    process.exit(1);
  }
});

const game = new Game(diceSet);
game.play();
