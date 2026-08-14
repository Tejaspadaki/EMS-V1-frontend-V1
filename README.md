# Employee Management System (EMS) - Desktop & Web Application

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-purple?logo=vite)
![Electron](https://img.shields.io/badge/Electron-33.4-9cf?logo=electron)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38bdf8?logo=tailwindcss)

A enterprise-grade Employee Management System (EMS) built as a cross-platform desktop application powered by **Electron** and a responsive web application powered by **React 19**, **TypeScript**, and **Vite**.

EMS integrates HR management, biometrics & face recognition, project management with sprint tracking, real-time messaging, LiveKit audio/video video conferencing, applicant tracking (ATS), and automated approval workflows into a single application.

---

## 🌟 Key Features

### 🏢 Role-Based Dashboards & Management
- **Role-Specific Interfaces**: Tailored views for Executive Leadership (CEO, CTO), Department Heads, Team Leads (Engineering, Product, Design, HR, Finance, Growth, Operations, Security, AI), Employees, and Interns.
- **Super Admin Panel**: Full system control including user management, role assignments, department structures, and grant delegation.

### 👤 HR, Onboarding & Biometrics
- **Biometric Check-In**: Integrated face recognition check-in powered by `face-api.js` and custom WebAssembly models.
- **Onboarding Workflows**: Document submission, face enrollment modal, automated verification queues, and exit management.
- **Attendance & Leave Management**: Real-time attendance logging, audit trails, and standup tracking.

### 📊 Project & Task Management
- **Kanban & Backlog Views**: Interactive task boards with drag-and-drop capabilities.
- **Sprint Management**: Sprint burndown charts, backlog estimation, and task details drawers.
- **Git PR Integration**: Panel for reviewing pull requests and linking developer activity to tasks.

### 💬 Communication & Collaboration
- **Real-Time Messaging**: Built-in chat interface with file attachments powered by Socket.io.
- **LiveKit Video Meetings**: Integrated voice & video conferencing room with screen sharing, participant overlays, and meeting analytics.
- **Interactive Whiteboard**: Collaborative drawing and diagramming powered by `@tldraw/tldraw`.

### 📋 Requests, Claims & Payroll
- **Multi-Tier Approvals**: Request submission, progress tracking across approval tiers, and detailed audit trails.
- **Claims & Payslips**: Employee self-service for expense claims, reimbursement tracking, and payslip downloads.

### 🤖 AI Assistant & Global Utilities
- **AI Assistant**: Built-in AI Chatbot for automated queries and guidance.
- **Command Palette**: Quick navigation and global search accessible via keyboard shortcuts.
- **System Notifications**: Toast notifications and incoming call overlay alerts.

---

## 🛠️ Technology Stack

| Category | Technology / Library |
| :--- | :--- |
| **Framework & Runtime** | [React 19](https://react.dev/), [TypeScript 6](https://www.typescriptlang.org/), [Vite 6](https://vitejs.dev/) |
| **Desktop Wrapper** | [Electron 33](https://www.electronjs.org/), [Electron Builder 25](https://www.electron.build/) |
| **Styling & Icons** | [Tailwind CSS v4](https://tailwindcss.com/), [PostCSS](https://postcss.org/), [Lucide React](https://lucide.dev/) |
| **State & Data Fetching** | [Zustand](https://github.com/pmndrs/zustand), [TanStack React Query v5](https://tanstack.com/query) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Real-Time & Media** | [Socket.io Client](https://socket.io/), [LiveKit React Components & Client](https://livekit.io/) |
| **Biometrics & Canvas** | [face-api.js](https://github.com/justadudewhohacks/face-api.js), [@tldraw/tldraw](https://tldraw.dev/) |
| **Data Visualization** | [Recharts](https://recharts.org/) |

---

## 📁 Project Structure

```
EMS-V1-frontend-V1/
├── electron/                  # Electron main process & IPC handlers
│   ├── config/                # App configuration constants
│   ├── ipc/                   # Native IPC listeners & communication logic
│   ├── main.cjs               # Main process entry point
│   └── preload.cjs            # Preload script exposing safe APIs
├── public/                    # Static assets, WebAssembly modules & face models
│   ├── models/                # Pre-trained face-api.js neural network models
│   └── vision_wasm_internal.* # MediaPipe WASM binaries
├── scripts/                   # Utility scripts for build cache & dependency setup
│   └── prepare-build-cache.cjs # Pre-downloads binary tools (winCodeSign, NSIS)
├── src/                       # Frontend application source
│   ├── api/                   # Axios API service definitions per module
│   ├── assets/                # Images, icons, and SVG graphics
│   ├── components/            # Reusable UI components & feature widgets
│   ├── contexts/              # React context providers
│   ├── hooks/                 # Custom React hooks (useFaceApi, useSocket, etc.)
│   ├── pages/                 # Page components organized by domain module
│   ├── services/              # Socket.io connection manager & network clients
│   ├── store/                 # Zustand stores (auth, meetings, toasts)
│   ├── utils/                 # Utility helper functions
│   ├── App.tsx                # Main application routing setup
│   └── main.tsx               # Web entry point
├── electron-builder.yml       # Desktop build & installer configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript root configuration
└── vite.config.ts             # Vite bundler configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or `yarn` / `pnpm`)

---

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure your environment variables in `.env`:
   ```env
   # API Server Configuration
   VITE_DEV_API_URL=http://localhost:5000
   VITE_PROD_API_URL=https://ems-backend.yuktiyantra.com
   VITE_API_URL=https://ems-backend.yuktiyantra.com

   # LiveKit Real-Time Communications
   VITE_LIVEKIT_URL=wss://ems-pmt0pnyo.livekit.cloud
   ```

---

### Installation

Install dependencies:
```bash
npm install
```

---

## 💻 Development Commands

### Run Web & Desktop App in Development Mode
Launches the Vite build and opens the Electron desktop window with Hot Module Replacement (HMR):
```bash
npm run dev
```

### Run Web App Only (Vite Dev Server)
Builds the Vite bundle for browser-only development:
```bash
npm run build
```

### Preview Production Web Build
```bash
npm run preview
```

### Run ESLint Analysis
```bash
npm run lint
```

---

## 📦 Building & Packaging Desktop Installer

To build the executable desktop application (`.exe` installer / portable binary for Windows x64):

1. **Prepare Build Cache & Package Desktop App**:
   ```bash
   npm run electron:build
   ```
   *This command executes `electron:prepare-cache` (downloading winCodeSign and NSIS dependencies if missing), compiles the web bundle with Vite, and builds the installer using Electron Builder.*

2. Built installers and binary artifacts will be placed in the `dist-electron/` directory.

---

## 🚀 Automated Deployment (GitHub Actions)

This repository includes a production-ready GitHub Actions workflow in `.github/workflows/deploy.yml` that automatically builds and deploys the frontend web app to cPanel via FTP/FTPS.

### 🔑 Required GitHub Secrets

Configure the following secrets in GitHub (**Settings > Secrets and variables > Actions**):

| Secret Name | Description | Example Value |
| :--- | :--- | :--- |
| `FTP_SERVER` | cPanel FTP server host | `ftp.yuktiyantra.com` |
| `FTP_USERNAME` | cPanel FTP username | `ems@yuktiyantra.com` |
| `FTP_PASSWORD` | cPanel FTP password | `your-ftp-password` |
| `FTP_PORT` *(Optional)* | FTP Port | `21` |
| `VITE_API_URL` *(Optional)* | Production Backend API URL | `https://ems-backend.yuktiyantra.com` |
| `VITE_LIVEKIT_URL` *(Optional)* | LiveKit WebSocket URL | `wss://ems-pmt0pnyo.livekit.cloud` |

### 🛠️ Workflow Capabilities

1. **Automated Web Deployment**: Pushing changes to `main` automatically triggers Vite web build and deploys the `dist/` bundle to your cPanel hosting server.
2. **Desktop Release Deployment**: Run manually via **Actions > Run workflow** (selecting `deploy_desktop: true`) to automatically compile Windows (`Setup.exe`, `Portable.exe`, `latest.yml`) and Linux (`AppImage`, `DEB`, `RPM`, `latest-linux.yml`) desktop binaries and publish them to the backend `/public/updates` portal directory.

---

## 🤝 Contributing & Guidelines

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📄 License

Private & Proprietary - Employee Management System Team. All rights reserved.
