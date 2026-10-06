# Contributing to LAST LIGHT

Thank you for your interest in contributing to **LAST LIGHT**! Whether you are fixing bugs, improving performance, refining documentation, or proposing new features, your contributions are welcome.

---

## 1. Development Principles

When contributing to this project, please adhere to these core design philosophies:

1. **Zero External Binary Assets (Procedural-First)**:
   - All 3D models, textures, animations, and sound effects must be generated procedurally in code using Three.js and the Web Audio API.
   - Do not commit static `.gltf`, `.fbx`, `.obj`, `.wav`, or `.png` binary assets to the repository.
2. **Simulation / Rendering Separation**:
   - Game logic, rules, vitals, inventory, collisions, and quests live in [`src/simulation.js`](src/simulation.js) and [`src/content.js`](src/content.js).
   - Rendering and input live in [`src/world.js`](src/world.js), [`src/actors.js`](src/actors.js), and [`src/main.js`](src/main.js).
   - Simulation state must remain deterministic and testable without a DOM or WebGL canvas.
3. **Evidence-Based Engineering**:
   - All behavioral changes should be verified with unit tests in `tests/`.
   - Run `npm test` before submitting changes.
4. **Performance & Lightweight Footprint**:
   - Target stable 60 FPS on modern desktop browsers.
   - Keep draw calls and mesh complexity optimized.

---

## 2. Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x or 22.x recommended)
- Modern desktop web browser (Chrome, Edge, Firefox, or Safari with WebGL enabled)

### Local Setup

```sh
# Clone your fork
git clone https://github.com/<your-username>/last-light.git
cd last-light

# Install dependencies
npm ci

# Start local development server
npm run dev
```

Open `http://127.0.0.1:4186/` in your browser.

---

## 3. Running Tests & Quality Verification

Before opening a pull request, ensure all tests and builds succeed cleanly:

```sh
# Run deterministic simulation unit tests
npm test

# Verify production static build
npm run build

# Preview production build locally
npm run preview -- --port 4187
```

---

## 4. Pull Request Workflow

1. Fork the repository and create your feature branch:
   ```sh
   git checkout -b feature/your-feature-name
   ```
2. Commit your changes with clear, concise commit messages.
3. Verify that `npm test` and `npm run build` pass without errors or warnings.
4. Push to your fork:
   ```sh
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request against the `main` branch of this repository.
6. Fill out the PR template completely, noting the problem addressed, changes made, and verification steps.

---

## 5. Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat fellow community members with respect and kindness.
