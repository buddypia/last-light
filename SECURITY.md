# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Architecture & Privacy by Design

**LAST LIGHT** is designed from the ground up to be safe, offline-first, and privacy-preserving:

1. **Client-Side Only**: The entire game runs locally inside the user's web browser using WebGL (via Three.js) and the Web Audio API. There are no backend servers, user accounts, or authentication services.
2. **Zero External Requests**: After initial asset/bundle loading, the game makes zero network calls. There is no telemetry, tracking, analytics, or external API consumption.
3. **No Secrets or Credentials**: The application contains no API keys, private tokens, passwords, or secret configurations.
4. **Local Data Persistence**: Game progress and user preferences are stored strictly inside the browser's origin-isolated `localStorage` (`last-light-save-v1` and `last-light-settings-v1`). No personal identifiable information (PII) is collected or stored.
5. **Procedural Generation**: All 3D meshes, textures, animations, and sound effects are generated procedurally in code without downloading third-party binary assets.

## Reporting a Vulnerability

If you discover a security vulnerability or concern within this repository:

1. Please do **not** disclose the issue in a public GitHub issue.
2. Report the vulnerability via GitHub's private vulnerability reporting feature (under the **Security** tab of this repository) or contact the project maintainers directly.
3. Please include:
   - Description of the issue
   - Reproduction steps or proof of concept
   - Potential impact
4. We will acknowledge receipt of your report within 48 hours and work on a prompt remediation.
