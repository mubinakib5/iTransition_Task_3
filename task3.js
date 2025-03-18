const crypto = require("crypto");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function generateRandomKey() {
  return crypto.randomBytes(32);
}

function computeHMAC(key, message) {
  return crypto.createHmac("sha3-256", key).update(message).digest("hex");
}

function getRandomInt(max) {
  return crypto.randomInt(0, max);
}

function fairRoll(dice) {
  const key = generateRandomKey();
  const randomIndex = getRandomInt(dice.length);
  const hmac = computeHMAC(key, randomIndex.toString());

  console.log(
    `I selected a random value in the range 0..${
      dice.length - 1
    } (HMAC=${hmac}).`
  );
  console.log(
    "Add your number modulo",
    dice.length,
    "to ensure fairness of the roll."
  );

  return new Promise((resolve) => {
    rl.question("Your selection: ", (userInput) => {
      if (userInput.toUpperCase() === "X") {
        rl.close();
        process.exit();
      }

      const userValue = parseInt(userInput, 10);
      if (isNaN(userValue) || userValue < 0 || userValue >= dice.length) {
        console.log("Invalid input. Try again.");
        return resolve(fairRoll(dice));
      }

      const finalValue = (userValue + randomIndex) % dice.length;
      console.log(`My number is ${randomIndex} (KEY=${key.toString("hex")}).`);
      console.log(
        `The result is ${randomIndex} + ${userValue} = ${finalValue} (mod ${dice.length}).`
      );
      resolve(dice[finalValue]);
    });
  });
}

async function playGame(diceSets) {
  console.log("Let's determine who makes the first move.");
  const key = generateRandomKey();
  const computerChoice = getRandomInt(2);
  const hmac = computeHMAC(key, computerChoice.toString());

  console.log(`I selected a random value in the range 0..1 (HMAC=${hmac}).`);
  console.log("Try to guess my selection.");
  console.log("0 - 0\n1 - 1\nX - exit\n? - help");

  let userGuess;
  while (true) {
    const input = await new Promise((resolve) =>
      rl.question("Your selection: ", resolve)
    );
    if (input === "0" || input === "1") {
      userGuess = parseInt(input, 10);
      break;
    }
    if (input.toUpperCase() === "X") {
      rl.close();
      process.exit();
    }
    console.log("Invalid input. Enter 0 or 1.");
  }

  console.log(`My selection: ${computerChoice} (KEY=${key.toString("hex")}).`);
  const computerStarts = userGuess !== computerChoice;

  let computerDiceIndex = getRandomInt(diceSets.length);
  console.log(
    computerStarts
      ? `I make the first move and choose the [${diceSets[computerDiceIndex]}] dice.`
      : "You make the first move. Choose your dice:"
  );

  if (!computerStarts) {
    computerDiceIndex = await userSelectsDice(diceSets);
    if (computerDiceIndex === -1) return;
  }

  const userDiceIndex = computerStarts
    ? await userSelectsDice(diceSets, computerDiceIndex)
    : computerDiceIndex;
  if (userDiceIndex === -1) return;
  console.log(`You chose the [${diceSets[userDiceIndex]}] dice.`);

  const computerRoll = await fairRoll(diceSets[computerDiceIndex]);
  console.log(`It's time for my throw. My throw is ${computerRoll}.`);

  const userRoll = await fairRoll(diceSets[userDiceIndex]);
  console.log(`Your throw is ${userRoll}.`);

  if (userRoll > computerRoll) console.log("You win!");
  else if (userRoll < computerRoll) console.log("I win!");
  else console.log("It's a tie!");

  rl.close();
}

async function userSelectsDice(diceSets, excludeIndex = -1) {
  console.log("Choose your dice:");
  for (let i = 0; i < diceSets.length; i++) {
    if (i !== excludeIndex) console.log(`${i} - ${diceSets[i]}`);
  }
  console.log("X - exit");

  while (true) {
    const input = await new Promise((resolve) =>
      rl.question("Your selection: ", resolve)
    );
    if (input.toUpperCase() === "X") {
      rl.close();
      process.exit();
    }
    const choice = parseInt(input, 10);
    if (
      !isNaN(choice) &&
      choice >= 0 &&
      choice < diceSets.length &&
      choice !== excludeIndex
    ) {
      return choice;
    }
    console.log("Invalid input. Try again.");
  }
}

// Example usage
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log("Error: You must provide at least 3 dice configurations.");
  process.exit(1);
}
const diceSets = args.map((d) => d.split(",").map(Number));
playGame(diceSets);
