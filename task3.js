const crypto = require("crypto");
const readline = require("readline-sync");

class HMACGenerator {
  static generateKey() {
    return crypto.randomBytes(32).toString("hex");
  }

  static generateHMAC(key, message) {
    return crypto.createHmac("sha3-256", key).update(message).digest("hex");
  }
}

class FairRandomGenerator {
  static generateRandom(min, max) {
    const key = HMACGenerator.generateKey();
    const randomBytes = crypto.randomBytes(4);
    const randomValue = (randomBytes.readUInt32BE() % (max - min + 1)) + min;
    const hmac = HMACGenerator.generateHMAC(key, randomValue.toString());
    return { value: randomValue, key, hmac };
  }
}

class DiceGame {
  constructor(diceSet) {
    this.diceSet = diceSet;
  }

  determineFirstMove() {
    const result = FairRandomGenerator.generateRandom(0, 1);
    console.log(
      `I selected a random value in the range 0..1 (HMAC=${result.hmac}).`
    );
    const userGuess = readline.question("Try to guess my selection (0 or 1): ");
    console.log(`My selection: ${result.value} (KEY=${result.key}).`);
    return parseInt(userGuess) === result.value;
  }

  selectDice() {
    console.log("Choose your dice:");
    this.diceSet.forEach((die, index) =>
      console.log(`${index} - ${die.join(",")}`)
    );
    const userSelection = parseInt(readline.question("Your selection: "));
    if (userSelection < 0 || userSelection >= this.diceSet.length) {
      console.error("Error: Invalid dice selection.");
      process.exit(1);
    }
    return {
      userDice: this.diceSet[userSelection],
      opponentDice: this.diceSet[(userSelection + 1) % this.diceSet.length],
    };
  }

  rollDice(dice) {
    return FairRandomGenerator.generateRandom(0, dice.length - 1);
  }

  play() {
    console.log("⚔️ Non-Transitive Dice Game Begins!");
    const userMovesFirst = this.determineFirstMove();
    console.log(
      userMovesFirst ? "You make the first move." : "I make the first move."
    );

    const { userDice, opponentDice } = this.selectDice();
    console.log(`You selected: ${userDice.join(",")}`);
    console.log(`I choose the ${opponentDice.join(",")} dice.`);

    console.log("It's time for my roll.");
    const opponentRoll = this.rollDice(opponentDice);
    console.log(
      `I selected a random value in the range 0..5 (HMAC=${opponentRoll.hmac}).`
    );
    console.log("Add your number modulo 6.");
    for (let i = 0; i < 6; i++) console.log(`${i} - ${i}`);
    const userMod = parseInt(readline.question("Your selection: "));
    console.log(
      `My number is ${opponentRoll.value} (KEY=${opponentRoll.key}).`
    );
    console.log(
      `The fair number generation result is ${
        (opponentRoll.value + userMod) % 6
      } (mod 6).`
    );
    console.log(`My roll result is ${opponentDice[opponentRoll.value]}.`);

    console.log("It's time for your roll.");
    const userRoll = this.rollDice(userDice);
    console.log(
      `I selected a random value in the range 0..5 (HMAC=${userRoll.hmac}).`
    );
    console.log("Add your number modulo 6.");
    for (let i = 0; i < 6; i++) console.log(`${i} - ${i}`);
    const userFinalMod = parseInt(readline.question("Your selection: "));
    console.log(`My number is ${userRoll.value} (KEY=${userRoll.key}).`);
    console.log(
      `The fair number generation result is ${
        (userRoll.value + userFinalMod) % 6
      } (mod 6).`
    );
    console.log(`Your roll result is ${userDice[userRoll.value]}.`);

    console.log(
      userDice[userRoll.value] > opponentDice[opponentRoll.value]
        ? "You win! 🎉"
        : userDice[userRoll.value] < opponentDice[opponentRoll.value]
        ? "I win! 🤖"
        : "It's a tie! 🔄"
    );
  }
}

function parseDice(args) {
  return args.map((arg) => arg.split(",").map(Number));
}

const diceSet = parseDice(process.argv.slice(2));
if (diceSet.length < 2) {
  console.error("Error: At least two dice sets are required.");
  process.exit(1);
}

new DiceGame(diceSet).play();
