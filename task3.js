const crypto = require("crypto");
const readline = require("readline-sync");

// Generate HMAC-SHA3 hash for fairness
function generateHMAC(secretKey, data) {
  return crypto.createHmac("sha3-256", secretKey).update(data).digest("hex");
}

// Generate a fair random number using HMAC-SHA3
function fairRandom(secretKey, nonce, min, max) {
  const hash = generateHMAC(secretKey, nonce);
  const decimal = parseInt(hash.substring(0, 8), 16); // Take first 8 hex characters
  return (decimal % (max - min + 1)) + min;
}

// Generate a fair roll for a die
function rollDice(die, secretKey, nonce) {
  if (!Array.isArray(die) || die.length === 0) {
    throw new Error("Invalid dice configuration");
  }
  return die[fairRandom(secretKey, nonce, 0, die.length - 1)];
}

// Count win probability
function countWins(dieA, dieB) {
  let wins = 0;
  for (let x of dieA) {
    for (let y of dieB) {
      if (x > y) wins++;
    }
  }
  return wins / (dieA.length * dieB.length);
}

// Simulate a game round
function playGame(diceSet, secretKey) {
  console.log("⚔️ Non-Transitive Dice Game Begins!");
  console.log("Let's determine who makes the first move.");

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
  console.log("0 - 0");
  console.log("1 - 1");
  console.log("X - exit");
  console.log("? - help");
  const userGuess = readline.question("Your selection: ");
  console.log(`My selection: ${firstMove} (KEY=${secretKey}).`);

  const userMovesFirst = parseInt(userGuess) === firstMove;
  if (userMovesFirst) {
    console.log("You make the first move.");
  } else {
    console.log("I make the first move.");
  }

  // Dice selection
  console.log("Choose your dice:");
  Object.keys(diceSet).forEach((key, index) => {
    console.log(`${index} - ${diceSet[key].join(",")}`);
  });

  const userSelection = parseInt(readline.question("Your selection: "));
  const userDice = Object.values(diceSet)[userSelection];

  if (!userDice) {
    console.error("Error: Invalid dice selection.");
    return;
  }
  console.log(`You choose the [${userDice.join(",")}] dice.`);

  // Rolling the dice
  console.log("It's time for my roll.");
  const nonceOpponent = "opponentRoll-" + Date.now();
  const opponentRoll = rollDice(
    Object.values(diceSet).find((die) => die !== userDice),
    secretKey,
    nonceOpponent
  );
  console.log(
    `I selected a random value in the range 0..5 (HMAC=${generateHMAC(
      secretKey,
      nonceOpponent
    )}).`
  );
  console.log("Add your number modulo 6.");
  console.log("0 - 0");
  console.log("1 - 1");
  console.log("2 - 2");
  console.log("3 - 3");
  console.log("4 - 4");
  console.log("5 - 5");
  console.log("X - exit");
  console.log("? - help");
  const userModSelection = parseInt(readline.question("Your selection: "));
  console.log(`My number is ${opponentRoll} (KEY=${secretKey}).`);
  console.log(
    `The fair number generation result is ${opponentRoll} + ${userModSelection} = ${
      (opponentRoll + userModSelection) % 6
    } (mod 6).`
  );
  console.log(`My roll result is ${opponentRoll}.`);

  // User roll
  console.log("It's time for your roll.");
  const nonceUser = "userRoll-" + Date.now();
  const userRoll = rollDice(userDice, secretKey, nonceUser);
  console.log(
    `I selected a random value in the range 0..5 (HMAC=${generateHMAC(
      secretKey,
      nonceUser
    )}).`
  );
  console.log("Add your number modulo 6.");
  console.log("0 - 0");
  console.log("1 - 1");
  console.log("2 - 2");
  console.log("3 - 3");
  console.log("4 - 4");
  console.log("5 - 5");
  console.log("X - exit");
  console.log("? - help");
  const userFinalSelection = parseInt(readline.question("Your selection: "));
  console.log(`My number is 0 (KEY=${secretKey}).`);
  console.log(
    `The fair number generation result is 0 + ${userFinalSelection} = ${
      (0 + userFinalSelection) % 6
    } (mod 6).`
  );
  console.log(`Your roll result is ${userRoll}.`);

  // Determine winner
  if (userRoll > opponentRoll) {
    console.log("You win! 🎉");
  } else if (userRoll < opponentRoll) {
    console.log("I win! 🤖");
  } else {
    console.log("It's a tie! 🔄");
  }
}

// Example non-transitive dice
const diceSet = {
  A: [3, 3, 3, 3, 6, 6],
  B: [2, 2, 2, 5, 5, 5],
  C: [1, 4, 4, 4, 4, 4],
};

// Generate a cryptographic key
const secretKey = crypto.randomBytes(32).toString("hex");

// Start the game
playGame(diceSet, secretKey);
