const crypto = require("crypto");
const readline = require("readline-sync");

// Generate HMAC-SHA3 hash for fairness
function generateHMAC(secretKey, data) {
  return crypto.createHmac("sha3-256", secretKey).update(data).digest("hex");
}

// Generate a fair random number using HMAC-SHA3
function fairRandom(secretKey, nonce, min, max) {
  const hash = generateHMAC(secretKey, nonce);
  const decimal = parseInt(hash.substring(0, 8), 16);
  return (decimal % (max - min + 1)) + min;
}

// Generate a fair roll for a die
function rollDice(die, secretKey, nonce) {
  if (!Array.isArray(die) || die.length === 0) {
    throw new Error("Invalid dice configuration");
  }
  return die[fairRandom(secretKey, nonce, 0, die.length - 1)];
}

// Parse dice from command-line arguments
function parseDice(args) {
  return args.map((arg) => arg.split(",").map(Number));
}

// Display selectable options dynamically
function displaySelectionOptions(range) {
  return range.map((i) => `${i} - ${i}`).join("\n");
}

// Simulate a game round
function playGame(diceSet, secretKey) {
  console.log("⚔️ Non-Transitive Dice Game Begins!");

  // Determine first move
  const nonceFirstMove = "firstMove-" + Date.now();
  const firstMove = fairRandom(secretKey, nonceFirstMove, 0, 1);
  console.log(
    `I selected a random value in the range 0..1 (HMAC=${generateHMAC(
      secretKey,
      nonceFirstMove
    )}).`
  );
  console.log("Try to guess my selection.");
  console.log(displaySelectionOptions([0, 1]));
  const userGuess = readline.question("Your selection: ");
  console.log(`My selection: ${firstMove} (KEY=${secretKey}).`);

  const userMovesFirst = parseInt(userGuess) === firstMove;
  console.log(
    userMovesFirst ? "You make the first move." : "I make the first move."
  );

  // Dice selection
  console.log("Choose your dice:");
  diceSet.forEach((die, index) => console.log(`${index} - ${die.join(",")}`));
  console.log("X - exit\n? - help");

  const userSelection = readline.question("Your selection: ");
  if (userSelection.toUpperCase() === "X") process.exit(0);
  if (userSelection.toUpperCase() === "?")
    return console.log("Help: Select a valid dice option.");

  const userIndex = parseInt(userSelection);
  if (userIndex < 0 || userIndex >= diceSet.length) {
    console.error("Error: Invalid dice selection.");
    return;
  }
  const userDice = diceSet[userIndex];
  console.log(`You choose the [${userDice.join(",")}] dice.`);

  // Opponent's dice selection
  const opponentSelection = (userIndex + 1) % diceSet.length;
  const opponentDice = diceSet[opponentSelection];
  console.log(`I choose the [${opponentDice.join(",")}] dice.`);

  // Rolling the dice
  console.log("It's time for my roll.");
  const nonceOpponent = "opponentRoll-" + Date.now();
  const opponentRoll = rollDice(opponentDice, secretKey, nonceOpponent);
  console.log(
    `I selected a random value in the range 0..5 (HMAC=${generateHMAC(
      secretKey,
      nonceOpponent
    )}).`
  );
  console.log("Add your number modulo 6.");
  console.log(displaySelectionOptions([0, 1, 2, 3, 4, 5]));
  const userMod = readline.question("Your selection: ");
  console.log(`My number is ${opponentRoll} (KEY=${secretKey}).`);
  console.log(
    `The fair number generation result is ${opponentRoll} + ${userMod} = ${
      (opponentRoll + parseInt(userMod)) % 6
    } (mod 6).`
  );
  console.log(`My roll result is ${opponentDice[opponentRoll]}.`);

  console.log("It's time for your roll.");
  const nonceUser = "userRoll-" + Date.now();
  const userRoll = rollDice(userDice, secretKey, nonceUser);
  console.log(
    `I selected a random value in the range 0..5 (HMAC=${generateHMAC(
      secretKey,
      nonceUser
    )}).`
  );
  console.log(displaySelectionOptions([0, 1, 2, 3, 4, 5]));
  const userFinalMod = readline.question("Your selection: ");
  console.log(`My number is ${userRoll} (KEY=${secretKey}).`);
  console.log(
    `The fair number generation result is ${userRoll} + ${userFinalMod} = ${
      (userRoll + parseInt(userFinalMod)) % 6
    } (mod 6).`
  );
  console.log(`Your roll result is ${userDice[userRoll]}.`);

  // Determine winner
  console.log(
    userDice[userRoll] > opponentDice[opponentRoll]
      ? "You win! 🎉"
      : userDice[userRoll] < opponentDice[opponentRoll]
      ? "I win! 🤖"
      : "It's a tie! 🔄"
  );
}

// Read dice from command-line arguments
const diceSet = parseDice(process.argv.slice(2));
if (diceSet.length < 2) {
  console.error("Error: At least two dice sets are required.");
  process.exit(1);
}

// Generate a cryptographic key
const secretKey = crypto.randomBytes(32).toString("hex");

// Start the game
playGame(diceSet, secretKey);
