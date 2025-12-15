# JEWELIFY

## 1. Usability Violations & Analysis

We conducted a heuristic evaluation and identified several key issues blocking a smooth user experience. Here is a breakdown of the critical friction points.

### Non-Heuristic Issues

- **Data Privacy:** Critical breach found on the History page. Users can currently see and modify _other_ users' projects.
- **Expectation Mismatch:** The workflow is backward; users generate a concept _before_ setting constraints, leading to frustration when the filter screen appears later.

### H1: Visibility of System Status

- **Dead Ends:** Users cannot complete actions (submit/save) on final screens due to missing buttons.
- **Hidden Scroll:** The initial questionnaire lacks a visible scrollbar, hiding content below the fold.
- **Blind AI Generation:** The AI process only shows a percentage. Users need descriptive updates (e.g., "Refining shapes...") to trust the system is working.
- **Lost Progress:** Selecting an alternative design wipes the original instead of moving it to a comparison sidebar.

### H2: Match Between System and the Real World

- **Confusing Labels:** Terms like "Feedback" and "Recalculate" in the editor don't match how jewelers actually talk about design changes.
- **Ambiguous Navigation:** The "End Project" button implies finishing production, but it just redirects Home.
- **Click Targets:** Selecting a design requires clicking a tiny button rather than the image itself.

### H3: User Control and Freedom

- **Trap Doors:**
  - "Confirm Order" triggers an immediate purchase without a summary or confirmation dialog.
  - No "Undo" exists after confirming a design choice.
  - AI generation cannot be stopped once started.
- **Popup Traps:** Critical price info popups lack a close button ("X"), trapping the user.
- **Forced Flow:** After AI generation, users are locked into choosing a concept with no option to start over.

### H4: Consistency and Standards

- **Inconsistent UI:** Download buttons change style across screens; the "Creation" button is in the wrong corner (top-right vs. standard bottom).
- **Confusing Icons:** The survey confirmation button uses a "Back" arrow icon, but flipped horizontally.
- **Unpredictable Actions:** Clicking "+" in a deleted slot auto-generates content instead of letting the user choose.

### H5: Error Prevention

- **History Corruption:** Users can accidentally modify already submitted/closed projects.
- **Open Inputs:** Text fields lack validation, accepting nonsensical data.

### H6: Recognition Rather Than Recall

- **Visual Clutter:** Drafts and submitted projects look identical in the History page.
- **Memory Load:**
  - Generated designs lack descriptive labels (e.g., "Vintage Style"), forcing users to remember which is which.
  - The "Similar jewels" label scrolls away instead of sticking to the header.
- **Blind Spots:** The jewel is only shown from one angle.

### H7: Flexibility and Efficiency of Use

- **Slow Iteration:** Customizing an inspiration design requires a tedious download-reupload loop.
- **No Power Tools:** The History page lacks search or sort filters. Expert users have no keyboard shortcuts.

### H8: Aesthetic and Minimalist Design

- **Intrusive Alerts:** Price changes trigger a screen-blocking popup instead of a subtle banner.
- **Information Overload:** The cost breakdown is a wall of uniform text, making it hard to scan.
- **Cramped View:** The editor lacks a full-screen view for detailed inspection.

### H9 & H10: Help and Documentation

- **Silent Errors:** When materials clash, the system blocks the action without explaining _why_.
- **Hidden Features:** Users must guess that designs can be customized; parameters are hidden inside menus rather than visible.

---

## 2. Selected Prototype Strategy

**Chosen Approach:** `Prototype #1 (Tablet)`

We chose the tablet prototype over the desktop version because it offers a more natural flow for jewelry design.

- **Context:** A tablet is a better collaborative tool for a jeweler to hand to a client than a desktop computer.
- **Interaction:** The touch-optimized interface supports the visual, tactile nature of customizing a physical object better than mouse clicks.
- **Flow:** The iteration process on the tablet version was simply clearer.

**Feature Migration:**
To ensure we don't lose functionality, we are moving the **"Estimated Crafting Time"** feature from Prototype #2 to our selected design. It will appear as a label near the price during iteration to manage user expectations.

---

## 3. Interactive Prototype Links

- **Screen 1:** [Setup Form](https://www.figma.com/proto/AOCcgcaIzZa4F4T6kotB1g/HCI-mid-fi?node-id=8-4&p=f&t=U9BXY4mtqSvoDDCE-1&scaling=scale-down&content-scaling=fixed&page-id=8%3A3&starting-point-node-id=8%3A4)
- **Screen 2:** [Design iterator](https://www.figma.com/proto/AOCcgcaIzZa4F4T6kotB1g/HCI-mid-fi?node-id=88-300&p=f&t=yXn8oeU3mKuVw3CO-1&scaling=scale-down&content-scaling=fixed&page-id=78%3A90&starting-point-node-id=88%3A300)

---

## 4. Hi-Fidelity Prototype Plan

**Goal:** Transform our paper concepts into a responsive, interactive prototype that solves the major friction points identified above. We are prioritizing User Control and System Feedback.

### High Priority (Must-Haves)

- **Safety Net for Orders (H3):** We will implement a proper Confirmation Dialog with a summary (preview, price, time) before any purchase is final.
- **Transparent AI (H1):** Replace the static percentage loader with active status updates (e.g., "Analyzing preferences...", "Polishing design...").
- **Escapability (H3):** Add clear "X" close buttons to all popups and an "Edit Design" button on the confirmation screen so users are never trapped.
- **Flow Correction (Non-Heuristic):** Move the filter/constraints screen _before_ generation to align user expectations.

### Medium Priority (Quality of Life)

- **Clearer Labels:** Rename ambiguous buttons (e.g., "End Project" → "Exit to Dashboard") and add descriptive tags to generated designs.
- **Better Feedback:** Provide specific error messages when material combinations fail (e.g., "Gold is too soft for this setting").
- **Visual Hierarchy:** Redesign the cost breakdown to be scannable (larger totals, grouped sections).

### Low Priority (Backlog)

- **Undo/Cancel Generation:** While useful, stopping the AI mid-process is less critical than fixing the ordering flow.
- **Breadcrumbs:** Adding navigation context (Home > Editor) will be added if time permits.
