# MENACE Reinforcement Learning Engine 🧠✨

A highly interactive, mobile-responsive web simulation of Donald Michie's historic 1960 **Matchbox Educable Noughts and Crosses Engine (MENACE)**. This application demonstrates how artificial intelligence and optimal gaming strategies can emerge purely from scratch through reinforcement learning paths, tracked via state matrices and visualized within a premium modern dashboard.

## 🌟 Features

- **Interactive Matchbox Visualizer:** Evaluates active training matrices and maps sub-state configurations live. Inside the dashboard, matchbox structures gracefully adapt from a 2x2 grid down to a clean 1x4 vertical layout on smaller viewports.
- **Real-Time Progress Analytics:** Displays performance graphs plotting wins, draws, and losses directly using an execution canvas tracking training convergence.
- **Sticky Glassmorphic Layout Header:** Houses developer identity details and embedded portfolio connection links natively within a blur-filtered, translucent glass navigation bar that dynamically locks to the top of the viewport on scrolling.
- **Liquid Glass Aesthetic:** Designed with soft monochromatic tech gradients, backdrop blur styling rules, custom circular frames, and organic squircle component borders.

## 🛠️ Tech Stack

- **Frontend Core:** Semantic HTML5, CSS3 Grid & Flexbox, Fluid Media Breakpoints
- **Design Paradigm:** Premium Liquid Glass (Glassmorphic architecture using backdrop filters)
- **Engine Analytics Logic:** Vanilla JavaScript (ES6+) for matrix calculations, reinforcement rewards, and algorithmic state tracking

## 📂 Project Structure


├── index.html            # Main markup document & structural node tree
├── sty.css               # Premium responsive layouts & sticky positioning rules
├── menace-engine.js      # Core reinforcement state algorithms & matrix loops

📜 Historical Context & Source
In 1960, British researcher Donald Michie famously bypassed the lack of computational power of his era by building a physical machine out of 304 matchboxes and colored glass beads to play an optimal game of Tic-Tac-Toe. Each matchbox corresponded to a unique board arrangement that MENACE might encounter.

When it was the computer's turn, a bead was drawn at random from the matching state box to dictate its next move:

Victory: Behaviors were reinforced by adding extra beads matching the winning move's color.

Defeat: Behaviors were penalized by discarding the colors responsible for the loss.

Over hundreds of rounds of reinforcement, the engine slowly "educated" itself—abandoning poor moves and systematically mastering an unbeatable strategy.

Source Reference: This digital application logic and state configurations are modeled based on the excellent work and data mapping provided by Matthew Scroggs at mscroggs.co.uk/menace.

⚙️ Customization & Parameters
You can easily tweak the learning behavior, penalties, rewards, and baseline configuration of the reinforcement engine. Open the menace-engine.js file to customize parameters such as:

Starting Beads: Change the initial quantity of beads assigned to legal moves for new or early states.

Reward Multipliers: Modify how many beads are added to a matchbox when the engine secures a win or a draw.

Penalty Constraints: Adjust the number of beads removed or subtracted when the engine triggers a loss.

Execution Speeds: Set the default intervals or step limits governing the automation training cycles.

Created by Abraham Manjolo — LinkedIn | GitHub
