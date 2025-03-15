# 🎲 Non-Transitive Dice Game

## 📌 Overview
This project implements a **Generalized Non-Transitive Dice Game** using **JavaScript (Node.js)**. It ensures provable fairness using **HMAC-SHA3 cryptographic hashing** and supports various dice configurations, including non-transitive sets. The game simulates dice rolls, calculates win probabilities, and validates fairness through cryptographic proofs.

## 🚀 Features
- 🎲 **Supports multiple dice configurations**
- 🔐 **Provably fair random number generation** using HMAC-SHA3
- 🏆 **Simulates game rounds with result outputs**
- 📊 **Generates a probability table** for win chances between dice
- ❌ **Handles incorrect parameters gracefully**
- 📜 **Fully documented and easy to modify**

---

## 🛠 Installation
Ensure you have **Node.js (v16 or later)** installed. Then, clone the repository and install dependencies:

```sh
# Clone the repository
git clone https://github.com/yourusername/non-transitive-dice-game.git
cd non-transitive-dice-game

# Install dependencies
npm install
```

Required packages:
```sh
npm install chalk ascii-table crypto-js
```

---

## ▶️ Running the Game
To start the game and run test cases:
```sh
node task3.js
```

This will:
- Run the game with **valid dice configurations**
- Test the game with **invalid parameters**
- Generate a **help table** showing probabilities
- Simulate **two full game runs**

---

## 🎯 Usage & Example Output

### ✅ **Valid Dice Configurations**
The game will test:
1. **4 Identical Dice:** `[1,2,3,4,5,6]`
2. **3 Non-Transitive Dice:**
   - `A: [2,2,4,4,9,9]`
   - `B: [1,1,6,6,8,8]`
   - `C: [3,3,5,5,7,7]`

### ❌ **Invalid Configurations Tested**
- No dice provided
- Only 2 dice instead of 3+
- Negative values in dice
- Non-integer values

### 📊 **Probability Table Output Example**
```
Win Probability Table
+---+---+---+---+
|   | A | B | C |
+---+---+---+---+
| A | - | 0.65 | 0.45 |
| B | 0.35 | - | 0.60 |
| C | 0.55 | 0.40 | - |
+---+---+---+---+
```

### 🎲 **Game Output Example**
```
⚔️ Playing a Round:
🎲 A rolls: 4 (Nonce: A-1678981234567)
🎲 B rolls: 6 (Nonce: B-1678981234568)
🎲 C rolls: 3 (Nonce: C-1678981234569)
🏆 B Wins!
🔐 Verify fairness:
   A: HMAC = 3fa0d...a9c3
   B: HMAC = 7bd8c...f5e2
   C: HMAC = d0b5a...8ef4
```

---

## 🏗️ Project Structure
```
📂 non-transitive-dice-game
 ├── 📜 README.md         # Documentation
 ├── 📜 task3.js          # Main game logic
 ├── 📜 package.json      # Dependencies
 ├── 📂 node_modules      # Installed dependencies
```

---

## 📜 License
This project is licensed under the **MIT License**. Feel free to modify and distribute.

---

## 🤝 Contributing
Contributions are welcome! Feel free to submit issues or pull requests.

---

## 📩 Submission Guidelines
To submit your solution, email `p.lebedev@itransition.com` with:
- 🎥 A **video demonstration** with different and incorrect parameters
- 📊 A **help table** with probabilities (3 example dice)
- 🎲 A **full game output** (at least 2 runs)
- 🔗 A **link to the GitHub repository**

Good luck and have fun! 🎲🔥

