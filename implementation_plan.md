# دورة عمل خدمة التوصيل — Implementation Plan

## Goal

Transform the existing Delivery training page from **field documentation** into a **service workflow story**. The page should guide a trainer through the complete delivery lifecycle — from SAP invoice arrival to service completion — while preserving all existing screenshots, the current visual design, lightbox behavior, and RTL layout.

---

## Files to Change

### 1. [index.html](file:///c:/Users/hisha/Downloads/odoo_flow/index.html)

Major content restructure. Keep all HTML structure, visual classes, and screenshot `<figure>` elements. Change:

- Page `<title>` → `دورة عمل خدمة التوصيل`
- `eyebrow` + `<h1>` + `subtitle` → workflow-focused copy
- `caseTitle` / `caseSubtitle` are dynamically written via app.js
- **Remove** `step-execution-data` section (it duplicates content that's merged into the redesigned step-task-details)
- **Add** SAP → Odoo → مهمة visual banner before first section (inside `workflowContent`)
- **Rewrite** all section titles and field-explanation content from definitions → workflow narrative
- **Remove** `Operation` and `Service` field mentions from `invoice-brief` dl
- **Merge** the current `step-task-details` (03) and `step-execution-data` (04) into one cleaner section: "03 — بدء مهمة التوصيل" (keeping screenshot `3.png`) and a new "04 — تحديد المشرف المسؤول" that uses screenshot `4.png` context only for Appointment data
- Re-number sections to match the 9-step workflow

#### New section mapping:

| Step | ID | Title | Screenshot |
|------|----|-------|------------|
| 01 | `step-invoice` | وصول الفاتورة من SAP | Screenshot 2026-08-31 121641.png |
| 02 | `step-tasks` | الوصول إلى مهمة التوصيل | 2.png |
| 03 | `step-task-details` | بدء مهمة التوصيل | 3.png |
| 04 | `step-supervisor` | تحديد المشرف المسؤول | 3.png (Assignees area) |
| 05 | `step-appointment-window` | تحديد فترة حجز الموعد | 4.png + 5.png |
| 06 | `step-delivery-scheduling` | إرسال رابط الحجز للعميل | 6.png |
| 07 | `step-appointment-booking` | العميل يحدد الموقع والموعد | 7.png, 8.png, 9.png |
| 08 | `step-driver-assignment-task-form` | تعيين السائق وتجهيز المهمة | 16.png |
| 09 | `step-driver-portal-execution` | تنفيذ التوصيل من بوابة السائق | 10–14.png |

> **Note**: The current step 03 (`step-task-details`) and step 04 (`step-execution-data`) are currently redundant. They'll be merged into: Step 03 (بدء مهمة التوصيل, uses `3.png`) and Step 04 (تحديد فترة حجز الموعد, uses `4.png` + `5.png`). The Assignees/supervisor context stays in Step 03's explanation since it appears on the `3.png` screenshot.

#### SAP → Odoo → Service visual banner:
A new `.sap-odoo-banner` component placed as the very first child of `#workflowContent`, before `#step-invoice`. Contains 3 nodes:
- SAP / "مصدر الفاتورة"
- Odoo / "إدارة وتنفيذ خدمة ما بعد البيع"  
- خدمة التوصيل / "تبدأ رحلة التنفيذ"

With a supporting line below: "تبدأ رحلة الخدمة بوصول الفاتورة من SAP إلى Odoo..."

#### Workflow summary strip:
A compact horizontal chip-flow strip below the banner showing the full chain:
`SAP → الفاتورة → Tasks → طلب توصيل → تحديد المشرف → فترة الحجز → رابط العميل → حجز الموعد → تعيين السائق → تنفيذ التوصيل → OTP → Completed`

---

### 2. [app.js](file:///c:/Users/hisha/Downloads/odoo_flow/app.js)

Update `introductoryTour`:

- `title` → `دورة عمل خدمة التوصيل`
- `subtitle` → `تعرّف على رحلة خدمة التوصيل من وصول الفاتورة من SAP وحتى إكمال الخدمة لدى العميل`
- Update `children` array step labels to match the new 9 steps

New children labels (keeping same `targetId` references):
```
01 وصول الفاتورة  → step-invoice
02 مهمة التوصيل  → step-tasks
03 طلب توصيل     → step-task-details
04 تحديد المشرف  → step-supervisor (new ID)
05 فترة الحجز    → step-appointment-window
06 رابط العميل   → step-delivery-scheduling
07 حجز الموعد    → step-appointment-booking
08 تعيين السائق  → step-driver-assignment-task-form
09 تنفيذ التوصيل → step-driver-portal-execution
```

---

### 3. [pageKnowledge.js](file:///c:/Users/hisha/Downloads/odoo_flow/pageKnowledge.js)

Update the `intro-tour` entry:

- `scope` → reflect workflow training (not field guide)
- `stages` → update titles/summaries/facts to use workflow language instead of field definitions
- Remove field-definition-style wording from `stage.facts`
- Add SAP → Odoo context to stage 1 (invoice)
- Update `workflow` entries to use new stage ordering
- Update `sequences` to include SAP mention at start
- Preserve all `relatedTerms`, `supportedQuestions`, `relationships`
- No breaking changes to `buildPageContext` or `buildKnowledgeChunks`

---

### 4. [styles.css](file:///c:/Users/hisha/Downloads/odoo_flow/styles.css)

Add CSS only for new components. DO NOT touch existing rules:

- `.sap-odoo-banner` — the 3-node integration visual
- `.sap-odoo-banner__nodes` — flex row with arrows
- `.sap-odoo-banner__node` — each card (white card, blue top label)
- `.sap-odoo-banner__arrow` — separator arrow
- `.sap-odoo-banner__note` — paragraph below banner
- `.workflow-summary-strip` — compact horizontal chip flow
- `.workflow-chip` — individual chip
- `.workflow-chip-arrow` — arrow between chips (hidden on very small screens)

---

## Sections Removed

- `Operation` and `Services` rows from the invoice `dl`
- Dictionary-style `<ul>` field definitions from sections 03 and 04
- The entire `step-execution-data` section (content is distributed across step 03 and step 05)

## Screenshots Preserved

All 17 screenshots remain. None removed.

## Sections Rewritten

- Section 01: From generic invoice intro → SAP-origin workflow step
- Section 02: From field definitions → accessing the task via Tasks button
- Section 03: From task-details field guide → stage explanation (طلب توصيل) + supervisor identification
- Section 04 (new): From appointment field guide → booking period action
- Section 05 (was 05): Rewritten to emphasize the allowed booking window action
- Section 06 (was 06): From scheduling stage → sending the booking link to the customer
- Section 07 (was 07): Customer journey narrative (unchanged screenshots, new framing)
- Section 08 (was 08): Driver assignment workflow narrative
- Section 09 (was 09): Driver portal execution (unchanged structure, updated sub-step titles/explanations)

## Verification Plan

- Visual: Page renders correctly in browser — same layout, cards, lightbox
- Lightbox: Click any screenshot → full-size overlay appears
- Step nav: Horizontal step cards update active state on scroll
- No horizontal overflow on desktop or mobile
- AI assistant: Still returns correct answers to workflow questions
- Operation / Service training content: Not present
- SAP → Odoo banner: Visible above first section when workflow is active
