const crypto = require("crypto");
const readline = require("readline-sync");

// Generate HMAC-SHA3 hash for fairness
function generateHMAC(secretKey, data) {
  return crypto.createHmac("sha3-256", secretKey).update(data).digest("hex");
}

// Generate a fair random number using HMAC-SHA3 with a unique key each time
function fairRandom(nonce, min, max) {
  const secretKey = crypto.randomBytes(32).toString("hex");
  const hash = generateHMAC(secretKey, nonce);
  const decimal = parseInt(hash.substring(0, 8), 16);
  return {
    value: (decimal % (max - min + 1)) + min,
    key: secretKey,
    hmac: hash,
  };
}

// Generate a fair roll for a die
function rollDice(die, nonce) {
  if (!Array.isArray(die) || die.length === 0) {
    throw new Error("Invalid dice configuration");
  }
  const roll = fairRandom(nonce, 0, die.length - 1);
  return { roll: die[roll.value], key: roll.key, hmac: roll.hmac };
}

// Parse dice from command-line arguments
function parseDice(args) {
  return args.map((arg) => arg.split(",").map(Number));
}

// Simulate a game round
function playGame(diceSet) {
  console.log("⚔️ Non-Transitive Dice Game Begins!");

  // Determine first move
  const nonceFirstMove = "firstMove";
  const firstMove = fairRandom(nonceFirstMove, 0, 1);
  console.log(
    `I selected a random value in the range 0..1 (HMAC=${firstMove.hmac}).`
  );
  const userGuess = readline.question("Try to guess my selection (0 or 1): ");
  console.log(`My selection: ${firstMove.value} (KEY=${firstMove.key}).`);

  const userMovesFirst = parseInt(userGuess) === firstMove.value;
  console.log(
    userMovesFirst ? "You make the first move." : "I make the first move."
  );

  // Dice selection
  console.log("Choose your dice:");
  diceSet.forEach((die, index) => console.log(`${index} - ${die.join(",")}`));

  const userSelection = parseInt(readline.question("Your selection: "));
  if (userSelection < 0 || userSelection >= diceSet.length) {
    console.error("Error: Invalid dice selection.");
    return;
  }
  const userDice = diceSet[userSelection];
  console.log(`You selected: ${userDice.join(",")}`);

  // Opponent's dice selection
  const opponentSelection = (userSelection + 1) % diceSet.length;
  const opponentDice = diceSet[opponentSelection];
  console.log(`I choose the ${opponentDice.join(",")} dice.`);

  // Rolling the dice
  console.log("It's time for my roll.");
  const nonceOpponent = "opponentRoll";
  const opponentRoll = rollDice(opponentDice, nonceOpponent);
  console.log(
    `I selected a random value in the range 0..5 (HMAC=${opponentRoll.hmac}).`
  );

  console.log("Add your number modulo 6.");
  for (let i = 0; i < 6; i++) console.log(`${i} - ${i}`);
  const userMod = parseInt(readline.question("Your selection: "));

  console.log(`My number is ${opponentRoll.value} (KEY=${opponentRoll.key}).`);
  console.log(
    `The fair number generation result is ${
      opponentRoll.value
    } + ${userMod} = ${(opponentRoll.value + userMod) % 6} (mod 6).`
  );
  console.log(`My roll result is ${opponentRoll.roll}.`);

  console.log("It's time for your roll.");
  const nonceUser = "userRoll";
  const userRoll = rollDice(userDice, nonceUser);
  console.log(
    `I selected a random value in the range 0..5 (HMAC=${userRoll.hmac}).`
  );

  console.log("Add your number modulo 6.");
  for (let i = 0; i < 6; i++) console.log(`${i} - ${i}`);
  const userFinalMod = parseInt(readline.question("Your selection: "));

  console.log(`My number is ${userRoll.value} (KEY=${userRoll.key}).`);
  console.log(
    `The fair number generation result is ${
      userRoll.value
    } + ${userFinalMod} = ${(userRoll.value + userFinalMod) % 6} (mod 6).`
  );
  console.log(`Your roll result is ${userRoll.roll}.`);

  // Determine winner
  console.log(
    userRoll.roll > opponentRoll.roll
      ? "You win! 🎉"
      : userRoll.roll < opponentRoll.roll
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

// Start the game
playGame(diceSet);
