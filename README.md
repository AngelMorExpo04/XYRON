# XYRON

Xyron is a minimalist, high-performance fitness application designed with a dark, glassmorphism aesthetic. It focuses on providing a clean, distraction-free environment for athletes and fitness enthusiasts to plan their workouts and manage their training times efficiently.

---

## What is Xyron?

The application serves as an all-in-one digital companion for modern workouts. It is divided into three core sections:

* **Planner**: A calendar-based interface to schedule and track daily exercise routines, ensuring long-term consistency.
* **Tabata**: A specialized high-intensity interval training (HIIT) timer that allows users to configure a custom list of exercises, tracking work and rest intervals dynamically.
* **Strength / Rest**: A dedicated timer for strength training, allowing users to precisely control rest periods between heavy sets to maximize recovery and performance.

All timers feature Wake Lock API integration to prevent mobile screens from sleeping during active workouts, alongside audio cues for seamless transitions.

---

## Technologies Used

This project was built from the ground up focusing on performance, modularity, and a premium user interface. 

* **Framework**: React 18, bootstrapped with Vite for instant server start and lightning-fast HMR.
* **Styling**: TailwindCSS v4 alongside custom vanilla CSS variables for a strict design system based on dark themes and neon lime green accents.
* **Animations**: Framer Motion, responsible for the fluid page transitions, layout morphing, and SVG splash screen drawing.
* **Icons**: Lucide React, providing clean, consistent, and scalable vector icons throughout the interface.
* **State Management**: React Hooks (useState, useEffect, useRef) integrated with LocalStorage for persistent user data across sessions.

---

## Live Demo

You can access the production-ready version of the application directly from your browser or mobile device:

**Web Link:** [https://xyron-pearl.vercel.app/](https://xyron-pearl.vercel.app/)

*For the best experience, open the link on a mobile device or use the responsive design tools in your desktop browser.*

---

## Local Development

To run Xyron on your local machine, ensure you have Node.js installed, then follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/AngelMorExpo04/XYRON.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd XYRON
   ```

3. **Install the dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to `http://localhost:5173` in your web browser.
