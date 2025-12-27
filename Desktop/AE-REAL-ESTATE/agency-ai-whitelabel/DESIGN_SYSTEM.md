# AE6 Kinetic - Design System & Style Guide

## 1. Vision & Core Principles
The AE6 Kinetic dashboard is designed to embody modern luxury, technical precision, and global appeal. Our design philosophy is rooted in "Glassmorphism" and "Atomic Design," ensuring a cohesive, scalable, and high-performance user experience.

---

## 2. Color Palette (2025 AE6 Kinetic Theme)

### Light Mode (Friendly White)
| Name | Hex | Usage |
| :--- | :--- | :--- |
| Primary | `#3B82F6` | Action buttons, active states, key highlights |
| Background | `#FFFFFF` | Main application background |
| Surface | `#F1F5F9` | Cards, modals, sidebars |
| Text Main | `#0F172A` | Headings and primary body text |
| Text Muted | `#64748B` | Secondary labels, descriptions |
| Border | `#E2E8F0` | Subtle separators and outlines |
| Accent | `#3B82F6` | Success indicators, special highlights |

### Dark Mode (Deep Kinetic)
| Name | Hex | Usage |
| :--- | :--- | :--- |
| Primary | `#3B82F6` | Action buttons, active states |
| Background | `#05080F` | Main application background |
| Surface | `#0A0F1E` | Cards, modals, sidebars |
| Text Main | `#FFFFFF` | Headings and primary body text |
| Text Muted | `#4B5563` | Secondary labels, descriptions |
| Border | `#1E293B` | Subtle separators and outlines |
| Accent | `#3B82F6` | Success indicators, special highlights |

---

## 3. Typography Hierarchy
**Font Family**: `Inter`, system-ui, -apple-system, sans-serif

| Level | Size (rem) | Weight | Usage |
| :--- | :--- | :--- | :--- |
| Display | `3.00rem` (48px) | Bold (700) | Main hero titles |
| Heading 1 | `2.25rem` (36px) | Bold (700) | Page titles |
| Heading 2 | `1.875rem` (30px) | Semibold (600) | Section headers |
| Heading 3 | `1.50rem` (24px) | Semibold (600) | Card titles |
| Body Large | `1.125rem` (18px) | Normal (400) | Lead paragraphs |
| Body Base | `1.00rem` (16px) | Normal (400) | Standard body text |
| Body Small | `0.875rem` (14px) | Medium (500) | Labels, input text |
| Caption | `0.75rem` (12px) | Medium (500) | Meta info, tooltips |

---

## 4. Layout & Spacing
We use an **8px Grid System** for consistent spacing and alignment.

- **Base Unit**: `8px` (`0.5rem`)
- **Grid Gutters**: `24px` (`1.5rem`)
- **Card Padding**: `40px` (`2.5rem`) for high-level cards
- **Container Max-Width**: `1280px`

### CSS Utility Classes
- `.glass-card`: Backdrop blur (20px), semi-transparent background, subtle border.
- `.interactive-card`: Hover transitions (scale 1.02, deep shadow), active click effect (scale 0.98).

---

## 5. Components (Atomic Design)

### Atoms
- **Icons**: Lucide-Vue-Next (size 20px for UI, 12-16px for meta).
- **Buttons**: Rounded corners (`full`), primary background, white text.
- **Inputs**: Transparent background, border-bottom only or subtle outline.

### Molecules
- **Stat Cards**: Icon + Label + Value + Trend indicator.
- **Form Groups**: Label + Input field + Validation message.

### Organisms
- **Property Upload Form**: Multi-step wizard with progress tracking.
- **Analytics Dashboard**: Grid of stat cards and interactive charts.
- **Navigation Sidebar**: Icon-based navigation with tooltips.

---

## 6. Accessibility & Performance
- **Contrast**: All text/background combinations meet WCAG 2.1 AA (4.5:1 ratio).
- **Interactive States**: Focus rings and hover states for all interactive elements.
- **Transitions**: Smooth 0.4s cubic-bezier animations for page entries.
- **Optimization**: Lazy loading for property images and deferred chart rendering.

---

## 7. Implementation Notes
- **Framework**: Vue 3 (Composition API)
- **Styling**: Tailwind CSS + CSS Variables
- **Icons**: Lucide-Vue-Next
- **Animations**: CSS Transitions + Tailwind Animate

---

## 8. AE6 Relax Mode (AI Agent Architecture)
The "Relax Mode" is a specialized operation layer where autonomous agents handle repetitive tasks.

### Core Agents
1. **Property Scout**: Automated web scanning for new inventory.
2. **Listing Writer**: Multi-lingual (TH/EN/ZH) content generation via Mistral AI.
3. **Social Sync**: Platform synchronization and automated engagement.
4. **Admin Assistant**: Lead qualification and viewing scheduling.

### Orchestration Layer
- **Copilot Orchestrator**: Central AI that delegates user commands to specific agents.
- **Python Hub**: Backend agent execution using `crewAI` and `FastAPI`.
- **Cloudflare Edge**: Lightweight routing and simulation layer for global availability.
