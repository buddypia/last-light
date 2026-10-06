# Third-Party Licenses & Asset Provenance

This document details the open-source dependencies used in **LAST LIGHT** and verifies the provenance and licensing of all game assets.

---

## 1. Open Source Dependencies

LAST LIGHT relies on a minimal set of permissive open-source libraries:

### Three.js
- **License**: MIT License
- **Copyright**: (c) 2010-2026 Three.js Authors
- **Website**: https://threejs.org/
- **Repository**: https://github.com/mrdoob/three.js
- **Usage**: WebGL 3D rendering engine, scene graph, cameras, lighting, and procedural mesh construction.

### Vite (Development & Build Tool)
- **License**: MIT License
- **Copyright**: (c) 2019-present Evan You & Vite Contributors
- **Website**: https://vite.dev/
- **Repository**: https://github.com/vitejs/vite
- **Usage**: Local development server and production static asset bundler.

---

## 2. Full MIT License Text of Three.js

```text
The MIT License

Copyright © 2010-2026 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

## 3. Game Assets & Provenance Verification

No proprietary or copyrighted external asset files (such as .gltf, .fbx, .obj, .mp3, .wav, or .png/.jpg textures) are packaged with or downloaded by this project.

- **3D Meshes & Geometry**:
  - All terrain, flora, rocks, buildings (camp, shelter, rain collector, lighthouse, radio mast, ship wreck), tools, player hands/arms, and animals (wolves) are constructed procedurally at runtime using code in [`src/world.js`](src/world.js) and [`src/actors.js`](src/actors.js).
- **Sound & Music**:
  - All environmental sounds (wind, ocean waves, rain, footsteps, tool swings, impact sounds, animal tells) are synthesized in real time via code using the browser's native **Web Audio API** in [`src/audio.js`](src/audio.js).
- **Textures & Shaders**:
  - Textures and materials use Three.js standard materials and procedural canvas rendering (minimap, crosshair, dynamic skybox gradients).
- **Icons & UI Elements**:
  - All item icons in the field journal, crafting menu, and HUD are original inline SVG paths authored specifically for this project in [`src/content.js`](src/content.js).
- **Story, Quests, & Lore**:
  - All narrative logs, character names, quest texts, and field guide tutorials in [`src/content.js`](src/content.js) and [`src/journal.js`](src/journal.js) are original creative works.
