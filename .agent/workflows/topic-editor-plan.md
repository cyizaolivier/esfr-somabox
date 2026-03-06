---
description: Build a Form-driven Topic Editor with a Template Gallery and Real-time Preview, inspired by FlowCV.
---

CONDITION: Don't remove existing files/ existing drag and drop editor just make this form diven aeditor as another option of creating topics
# Topic Editor Implementation Plan

## Goal
Create a course-authoring tool where mentors can select templates or start from scratch to build interactive "Topics." The editor must separate content from design, featuring a live preview pane.

## Tech Stack
- **Framework:** React ts (App Router)
- **Styling:** Tailwind CSS + Shadcn/ui (for the template gallery)
- **State Management:** React Context or Zustand (to sync Form -> Preview)
- **Icons:** Lucide-React

## Phase 1: The "Launchpad" (Landing View)
Build the initial screen where teachers decide how to start.
- [ ] Create a `Gallery` component with 4 cards: "Quick Guide," "Scientific Topic," "Coding Tutorial," and "Start from Scratch."
- [ ] Implement a "Template Selection" logic that seeds the editor with default JSON data.
- [ ] Agent Task: Use the **Browser Sub-agent** to verify the responsive layout of the gallery cards.

## Phase 2: The Three-Pane Editor Layout
Develop the core "FlowCV-style" workspace.
- [ ] **Navigation (Left):** A slim sidebar to switch between sections (Intro, Content, Quiz, Summary).
- [ ] **Form Panel (Center):** A dynamic form that renders inputs based on the active section.
- [ ] **Preview Panel (Right):** A read-only "Student View" that renders the content in real-time.
- [ ] Agent Task: Set up the **React State** so that every keystroke in the Center Panel updates the Right Panel without lag.

## Phase 3: Dynamic Content Blocks
Allow mentors to add different types of content within a topic.
- [ ] Implement "Add Block" functionality: Text, Image, Code Snippet, and MCQ.
- [ ] Create a "Drag-and-Drop" reordering system for these blocks using `dnd-kit`.
- [ ] Technical Term: **Block-based Authoring.**

## Phase 4: Final Verification
- [ ] Use **Artifacts** to generate a walkthrough video of a topic being created.
- [ ] Agent Task: Test the "Export to JSON" functionality to ensure the data is portable.

---
**Constraints:**
- Maintain 100% separation between the `DataSchema` and the `UIComponent`.
- The Preview pane must look "clean" (No borders/inputs visible).