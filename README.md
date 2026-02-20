### Architecture Pattern

This project implements an autonomous AI agent capable of:
- Interpreting user requirements
- Generating OS-specific shell commands
- Executing commands via Node.js
- Observing system output
- Iteratively building a website step-by-step

Pattern Used:
Reason → Act → Observe → Refine

## 🏗️ High-Level Architecture Diagram

```mermaid
flowchart TD

    A[User CLI Input] --> B[History Array]

    B --> C[Gemini Model - gemini-2.5-flash]

    C -->|Generates Shell Command| D[Function Call executeCommand]

    D --> E[Tool Layer - executeCommand]

    E --> F[Node.js child_process exec]

    F --> G[Operating System Shell]

    G --> H[File System Changes<br/>Create Folder / HTML / CSS / JS]

    H --> I[Command Output stdout or stderr]

    I --> B

    B --> C

    C -->|Final Response| J[Console Output]
```
