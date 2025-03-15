import chalk from "chalk";
import Table from "ascii-table";

// Generate HMAC-SHA3 hash for fairness
import crypto from "crypto-js";

function generateHMAC(secretKey, data) {
  return crypto.HmacSHA3(data, secretKey).toString();
}

// Generate a fair random number using HMAC-SHA3
function fairRandom(secretKey, nonce, min, max) {
  const hash = generateHMAC(secretKey, nonce);
  const decimal = parseInt(hash.substring(0, 8), 16);
  return (decimal % (max - min + 1)) + min;
}

// Generate a fair roll for a die
function rollDice(die, secretKey, nonce) {
  return die[fairRandom(secretKey, nonce, 0, die.length - 1)];
}

// Count win probability between two dice
function countWins(dieA, dieB) {
  let wins = 0;
  for (let x of dieA) {
    for (let y of dieB) {
      if (x > y) wins++;
    }
  }
  return wins / (dieA.length * dieB.length);
}

// Generate probability table for given dice
function generateHelpTable(diceSet) {
  let table = new Table("Win Probability Table");
  const diceKeys = Object.keys(diceSet);

  table.setHeading("", ...diceKeys);
  for (let i = 0; i < diceKeys.length; i++) {
    let row = [diceKeys[i]];
    for (let j = 0; j < diceKeys.length; j++) {
      row.push(
        i === j
          ? "—"
          : countWins(diceSet[diceKeys[i]], diceSet[diceKeys[j]]).toFixed(2)
      );
    }
    table.addRow(...row);
  }

  console.log(chalk.blue(table.toString()));
}

// Simulate a game round
function playGame(diceSet, secretKey) {
  const diceKeys = Object.keys(diceSet);
  if (diceKeys.length < 3) {
    console.log(chalk.red("Error: At least 3 dice are required to play."));
    return;
  }

  console.log(chalk.bold("\n⚔️ Playing a Round:"));

  let results = {};
  for (let player of diceKeys) {
    const nonce = `${player}-${Date.now()}`;
    results[player] = {
      roll: rollDice(diceSet[player], secretKey, nonce),
      nonce,
      hmac: generateHMAC(secretKey, nonce),
    };
    console.log(
      `🎲 ${chalk.green(player)} rolls: ${results[player].roll} (Nonce: ${
        results[player].nonce
      })`
    );
  }

  // Determine winner
  let maxRoll = Math.max(...Object.values(results).map((r) => r.roll));
  let winners = Object.keys(results).filter(
    (player) => results[player].roll === maxRoll
  );

  if (winners.length === 1) {
    console.log(`🏆 ${chalk.yellow(winners[0])} Wins!`);
  } else {
    console.log(`🤝 It's a Draw between: ${winners.join(", ")}`);
  }

  console.log(`🔐 Verify fairness:`);
  Object.entries(results).forEach(([player, data]) => {
    console.log(`   ${chalk.green(player)}: HMAC = ${data.hmac}`);
  });
}

// Test different parameters
function testCases() {
  console.log(chalk.bold("\n📌 Running Test Cases..."));

  // ✅ Valid Cases
  const dice1 = {
    A: [1, 2, 3, 4, 5, 6],
    B: [1, 2, 3, 4, 5, 6],
    C: [1, 2, 3, 4, 5, 6],
    D: [1, 2, 3, 4, 5, 6],
  };

  const dice2 = {
    A: [2, 2, 4, 4, 9, 9],
    B: [1, 1, 6, 6, 8, 8],
    C: [3, 3, 5, 5, 7, 7],
  };

  console.log(chalk.magenta("\n🔹 Test: 4 Identical Dice (1,2,3,4,5,6)"));
  playGame(dice1, "supersecretkey");
  generateHelpTable(dice1);

  console.log(
    chalk.magenta(
      "\n🔹 Test: 3 Different Dice (2,2,4,4,9,9 - 1,1,6,6,8,8 - 3,3,5,5,7,7)"
    )
  );
  playGame(dice2, "supersecretkey");
  generateHelpTable(dice2);

  // ❌ Invalid Cases
  console.log(chalk.magenta("\n🔹 Test: No Dice"));
  playGame({}, "supersecretkey");

  console.log(chalk.magenta("\n🔹 Test: Only 2 Dice"));
  playGame({ A: [1, 2, 3], B: [4, 5, 6] }, "supersecretkey");

  console.log(chalk.magenta("\n🔹 Test: Invalid Sides (Negative)"));
  playGame({ A: [1, -2, 3], B: [4, 5, 6], C: [2, 2, 2] }, "supersecretkey");

  console.log(chalk.magenta("\n🔹 Test: Non-Integer Values"));
  playGame(
    { A: [1.5, 2.5, 3.5], B: [4, 5, 6], C: [2, 2, 2] },
    "supersecretkey"
  );

  console.log(chalk.green("\n✅ All test cases executed!\n"));
}

// Run all test cases
testCases();
