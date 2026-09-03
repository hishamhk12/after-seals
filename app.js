const deliveryWorkflow = [
  {
    id: "delivery-request",
    title: "طلب توصيل",
    active: true,
  },
  {
    id: "delivery-scheduling",
    title: "جدولة التوصيل",
    active: false,
  },
  {
    id: "driver-linking",
    title: "ربط الخدمة بالسائق",
    active: false,
  },
  {
    id: "driver-assignment",
    title: "تعيين سائق",
    active: false,
  },
  {
    id: "delivery-in-progress",
    title: "جاري التوصيل",
    active: false,
  },
  {
    id: "delivery-done",
    title: "تم التوصيل",
    active: false,
  },
];

const introductoryTour = {
  id: "intro-tour",
  title: "خدمة توصيل",
  subtitle: "خدمة توصيل من غير منتجات، تعرّف على أهم الحقول",
  children: [
    { id: "invoice", title: "الفاتورة", targetId: "step-invoice" },
    { id: "tasks", title: "المهام المرتبطة بالخدمة", targetId: "step-tasks" },
    { id: "task-details", title: "تفاصيل مهمة التوصيل", targetId: "step-task-details" },
    { id: "execution-data", title: "بيانات التنفيذ والموعد", targetId: "step-execution-data" },
    { id: "appointment-window", title: "تحديد فترة حجز الموعد", targetId: "step-appointment-window" },
    { id: "delivery-scheduling", title: "جدولة التوصيل", targetId: "step-delivery-scheduling" },
    { id: "appointment-booking", title: "حجز موعد التوصيل", targetId: "step-appointment-booking" },
    { id: "driver-assignment-task-form", title: "تعيين السائق ونموذج المهمة", targetId: "step-driver-assignment-task-form" },
    { id: "driver-portal-execution", title: "تنفيذ التوصيل من بوابة السائق", targetId: "step-driver-portal-execution" },
  ],
};

const navigationState = {
  selectedExperienceId: null,
  currentTourTargetId: "step-invoice",
};

let tourStepObserver = null;

const trainingFlow = [
  "فاتورة توصيل فقط",
  "اعتماد الفاتورة",
  "إنشاء Operation",
  "إنشاء Task",
  "إنشاء Service",
  "فتح Tasks",
  "التأكد أن Project = خدمة التوصيل",
  "فتح مهمة التوصيل",
  "مرحلة طلب توصيل",
  "مراجعة بيانات المهمة",
];

const taskRows = [
  {
    task: "INV/2026/00129 - 1",
    project: "خدمة التوصيل",
    stage: "طلب توصيل",
  },
];

const taskFields = [
  {
    label: "Task",
    value: "INV/2026/00129 - 1",
    info: "اسم المهمة الناتجة من الفاتورة، ويستخدمها الموظف لفتح تفاصيل خدمة التوصيل.",
  },
  {
    label: "Project",
    value: "خدمة التوصيل",
    info: "المشروع الذي تنتمي إليه المهمة. في هذا السيناريو يجب أن يكون Project = خدمة التوصيل.",
  },
  {
    label: "Stage",
    value: "طلب توصيل",
    info: "المرحلة الحالية للمهمة ضمن سير خدمة التوصيل.",
  },
  {
    label: "Operation Case",
    value: "OPS/2026/00155",
    info: "رقم حالة التشغيل المرتبطة بخدمة التوصيل الناتجة من الفاتورة.",
  },
  {
    label: "Invoice",
    value: "INV/2026/00129",
    info: "الفاتورة المرتبطة بمهمة الخدمة.",
  },
  {
    label: "Source Invoice",
    value: "INV/2026/00129",
    info: "الفاتورة المصدر المتعلقة بهذه الخدمة، ويمكن للموظف استخدامها للتحقق من أصل المهمة.",
  },
  {
    label: "Assignees",
    value: "مشرف الخدمة",
    info: "المشرف المسؤول عن متابعة المهمة، وليس منفذ الخدمة.",
  },
  {
    label: "Assign",
    value: "السائق",
    info: "الشخص الذي سينفذ الخدمة فعلياً. في خدمة التوصيل يكون السائق.",
  },
  {
    label: "Trip Date",
    value: "تاريخ الرحلة",
    info: "تاريخ الرحلة أو التنفيذ المخطط لخدمة التوصيل.",
  },
  {
    label: "Appointment From",
    value: "بداية فترة الحجز",
    info: "أول تاريخ/وقت مسموح لحجز موعد العميل.",
  },
  {
    label: "Appointment To",
    value: "نهاية فترة الحجز",
    info: "آخر تاريخ/وقت مسموح لحجز موعد العميل.",
  },
];

const businessRules = [
  {
    id: "BR-DEL-001",
    title: "ربط مهمة التوصيل بالفاتورة",
    description: "يجب أن تكون مهمة التوصيل مرتبطة بالفاتورة الخاصة بها.",
  },
  {
    id: "BR-DEL-002",
    title: "تحديد الفاتورة المصدر",
    description: "يجب أن يستطيع الموظف تحديد الفاتورة المصدر من داخل مهمة التوصيل.",
  },
  {
    id: "BR-DEL-003",
    title: "دور Assignees",
    description: "يمثل Assignees المشرف المسؤول عن متابعة مهمة الخدمة.",
  },
  {
    id: "BR-DEL-004",
    title: "دور Assign",
    description: "يمثل Assign منفذ الخدمة الفعلي. في خدمة التوصيل يكون المنفذ هو السائق.",
  },
  {
    id: "BR-DEL-005",
    title: "نافذة موعد العميل",
    description: "يجب أن يقع موعد العميل بين Appointment From و Appointment To.",
  },
];

const quizQuestions = [
  {
    id: "q1",
    question: "ما وظيفة Assignees؟",
    answers: [
      { key: "A", text: "السائق" },
      { key: "B", text: "المشرف المسؤول عن متابعة الخدمة" },
      { key: "C", text: "العميل" },
    ],
    correct: "B",
  },
  {
    id: "q2",
    question: "ما وظيفة Assign؟",
    answers: [
      { key: "A", text: "المشرف" },
      { key: "B", text: "رقم الفاتورة" },
      { key: "C", text: "منفذ الخدمة / السائق" },
    ],
    correct: "C",
  },
  {
    id: "q3",
    question: "متى يمكن حجز موعد العميل؟",
    answers: [
      { key: "A", text: "في أي وقت" },
      { key: "B", text: "فقط بين Appointment From و Appointment To" },
      { key: "C", text: "بعد تم التوصيل" },
    ],
    correct: "B",
  },
];

function renderBreadcrumbs() {
  const breadcrumbs = document.querySelector("#breadcrumbs");

  if (!navigationState.selectedExperienceId) {
    breadcrumbs.innerHTML = "";
    return;
  }

  breadcrumbs.innerHTML = [
    '<button type="button" data-breadcrumb="home">الرئيسية</button>',
    `<span>${introductoryTour.title}</span>`,
  ].join('<span class="breadcrumb-separator">/</span>');
}

function bindBreadcrumbs() {
  document.querySelectorAll("[data-breadcrumb]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.breadcrumb === "home") {
        navigationState.selectedExperienceId = null;
      }

      renderNavigationState();
    });
  });
}

function renderCaseSelection() {
  const section = document.querySelector("#caseSelection");
  const title = document.querySelector("#caseSelectionTitle");
  const description = section.querySelector(".section-title p");
  const cards = document.querySelector("#caseCards");

  section.hidden = Boolean(navigationState.selectedExperienceId);

  if (section.hidden) {
    return;
  }

  title.textContent = "التجارب التدريبية المتاحة";
  description.textContent = "اختر التجربة التدريبية التي تريد مراجعتها.";
  cards.className = "case-cards";
  cards.innerHTML = `
    <button class="case-card" type="button" data-experience-id="${introductoryTour.id}">
      <span class="case-title">${introductoryTour.title}</span>
      <span class="case-description">${introductoryTour.subtitle}</span>
    </button>
  `;
  bindExperienceCards();
}

function renderWorkflowFlow(caseNode) {
  const flowNodes = caseNode.children;

  return `
    <div class="workflow-flow" aria-label="جولة تعريفية">
      ${flowNodes
        .map((flowNode, index) => {
          const isActive = navigationState.currentTourTargetId === flowNode.targetId;

          return `
            <button class="workflow-flow-node ${isActive ? "active" : ""}" type="button" data-stage-target="${flowNode.targetId}" ${isActive ? 'aria-current="step"' : ""}>
              <span class="workflow-flow-index">${String(index + 1).padStart(2, "0")}</span>
              <span>${flowNode.title}</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderCaseHeader() {
  const caseHeader = document.querySelector("#caseHeader");
  const caseTitle = document.querySelector("#caseTitle");
  const caseSubtitle = document.querySelector("#caseSubtitle");

  caseHeader.hidden = navigationState.selectedExperienceId !== introductoryTour.id;

  if (caseHeader.hidden) {
    caseTitle.textContent = "";
    caseSubtitle.textContent = "";
    return;
  }

  caseTitle.textContent = introductoryTour.title;
  caseSubtitle.textContent = introductoryTour.subtitle;
}

function bindLearningMap() {
  document.querySelectorAll("[data-stage-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.stageTarget;
      setActiveTourStep(targetId);
      requestAnimationFrame(() => {
        document.querySelector(`#${targetId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });
}

function setActiveTourStep(targetId) {
  navigationState.currentTourTargetId = targetId;
  document.querySelectorAll("[data-stage-target]").forEach((button) => {
    const isActive = button.dataset.stageTarget === targetId;
    button.classList.toggle("active", isActive);

    if (isActive) {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function initTourStepObserver() {
  if (tourStepObserver) {
    tourStepObserver.disconnect();
  }

  const sections = introductoryTour.children
    .map((step) => document.querySelector(`#${step.targetId}`))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) {
    return;
  }

  tourStepObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry) {
        setActiveTourStep(visibleEntry.target.id);
      }
    },
    {
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0.1, 0.25, 0.5],
    },
  );

  sections.forEach((section) => tourStepObserver.observe(section));
}

function bindExperienceCards() {
  document.querySelectorAll("[data-experience-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.experienceId !== introductoryTour.id) {
        return;
      }

      navigationState.selectedExperienceId = introductoryTour.id;
      renderNavigationState();
      requestAnimationFrame(() => {
        document.querySelector("#caseHeader")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });
}

function renderWorkflowVisibility() {
  const pageHeader = document.querySelector(".page-header");
  const workflowContent = document.querySelector("#workflowContent");
  const workflowOnlyItems = document.querySelectorAll(".workflow-only");
  const pageAssistant = document.querySelector("#pageAssistant");
  const shouldShowHome = !navigationState.selectedExperienceId;
  const shouldShowWorkflow = navigationState.selectedExperienceId === introductoryTour.id;

  pageHeader.hidden = !shouldShowHome;
  workflowContent.hidden = !shouldShowWorkflow;
  workflowOnlyItems.forEach((item) => {
    item.hidden = true;
  });

  if (pageAssistant) {
    pageAssistant.hidden = !shouldShowWorkflow;
  }

  if (shouldShowWorkflow) {
    workflowContent.querySelector(".workflow-flow")?.remove();
    workflowContent.insertAdjacentHTML("afterbegin", renderWorkflowFlow(introductoryTour));
    bindLearningMap();
    initTourStepObserver();
  }
}

function renderNavigationState() {
  renderBreadcrumbs();
  renderCaseSelection();
  renderCaseHeader();
  renderWorkflowVisibility();
  bindBreadcrumbs();
}

function renderWorkflow() {
  const container = document.querySelector("#workflowProgress");
  if (!container) {
    return;
  }

  container.innerHTML = deliveryWorkflow
    .map((stage, index) => {
      const stateClass = stage.active ? "active" : "locked";
      const meta = stage.active ? "نشطة الآن" : "مقفلة";
      const icon = stage.active ? "✓" : "⌕";
      return `
        <article class="stage-step ${stateClass}">
          <strong>${index + 1}. ${stage.title}</strong>
          <span class="stage-meta">${meta}</span>
          <span class="stage-icon" aria-hidden="true">${icon}</span>
        </article>
      `;
    })
    .join("");
}

function renderHeaderProgress() {
  const container = document.querySelector("#headerProgress");
  container.innerHTML = deliveryWorkflow
    .map((stage) => {
      const stateClass = stage.active ? "active" : "locked";
      return `<span class="header-progress-item ${stateClass}"><span>${stage.title}</span></span>`;
    })
    .join("");
}

function renderTrainingFlow() {
  const list = document.querySelector("#trainingFlow");
  if (!list) {
    return;
  }

  list.innerHTML = trainingFlow.map((step) => `<li>${step}</li>`).join("");
}

function renderTaskRows() {
  const body = document.querySelector("#taskRows");
  if (!body) {
    return;
  }

  body.innerHTML = taskRows
    .map(
      (row) => `
        <tr>
          <td>${row.task}</td>
          <td>${row.project}</td>
          <td>${row.stage}</td>
        </tr>
      `,
    )
    .join("");
}

function renderTaskFields() {
  const container = document.querySelector("#taskFields");
  if (!container) {
    return;
  }

  container.innerHTML = taskFields
    .map(
      (field, index) => `
        <article class="field-item">
          <div class="field-top">
            <span class="label">${field.label}</span>
            <button class="info-button" type="button" aria-expanded="false" aria-controls="field-info-${index}" title="عرض التوضيح">i</button>
          </div>
          <p class="field-value">${field.value}</p>
          <p id="field-info-${index}" class="field-info">${field.info}</p>
        </article>
      `,
    )
    .join("");
}

function bindTaskFieldInfo() {
  document.querySelectorAll(".info-button").forEach((button) => {
    button.addEventListener("click", () => {
      const field = button.closest(".field-item");
      const isOpen = field.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });
}

function renderBusinessRules() {
  const container = document.querySelector("#businessRules");
  if (!container) {
    return;
  }

  container.innerHTML = businessRules
    .map(
      (rule) => `
        <article class="rule-card">
          <span class="rule-id">${rule.id}</span>
          <h3>${rule.title}</h3>
          <p>${rule.description}</p>
        </article>
      `,
    )
    .join("");
}

function renderQuiz() {
  const quiz = document.querySelector("#quiz");
  if (!quiz) {
    return;
  }

  quiz.innerHTML = quizQuestions
    .map(
      (item) => `
        <article class="question-card" data-question="${item.id}" data-correct="${item.correct}">
          <h3>${item.question}</h3>
          <div class="answers">
            ${item.answers
              .map(
                (answer) => `
                  <button class="answer-button" type="button" data-answer="${answer.key}">
                    ${answer.key}) ${answer.text}
                  </button>
                `,
              )
              .join("")}
          </div>
          <p class="feedback" aria-live="polite"></p>
        </article>
      `,
    )
    .join("");
}

function bindQuiz() {
  document.querySelectorAll(".question-card").forEach((card) => {
    const correctAnswer = card.dataset.correct;
    const feedback = card.querySelector(".feedback");

    card.querySelectorAll(".answer-button").forEach((button) => {
      button.addEventListener("click", () => {
        const isCorrect = button.dataset.answer === correctAnswer;

        card.querySelectorAll(".answer-button").forEach((answerButton) => {
          answerButton.classList.remove("correct", "incorrect");
        });

        button.classList.add(isCorrect ? "correct" : "incorrect");
        feedback.textContent = isCorrect ? "إجابة صحيحة" : "راجع هذه النقطة مرة أخرى";
        feedback.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
      });
    });
  });
}

function initImageLightbox() {
  const lightbox = document.querySelector("#imageLightbox");
  const lightboxImage = lightbox?.querySelector("img");
  const closeButton = lightbox?.querySelector(".lightbox-close");

  if (!lightbox || !lightboxImage || !closeButton) {
    return;
  }

  let lastFocusedElement = null;

  function openLightbox(image) {
    lastFocusedElement = document.activeElement;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "صورة مكبرة";
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
    document.body.classList.remove("lightbox-open");
    lastFocusedElement?.focus?.();
  }

  document.querySelectorAll(".odoo-screenshot-frame img").forEach((image) => {
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", "اضغط لتكبير الصورة");
    image.setAttribute("title", "اضغط لتكبير الصورة");
  });

  document.addEventListener("click", (event) => {
    const image = event.target.closest(".odoo-screenshot-frame img");

    if (!image) {
      return;
    }

    openLightbox(image);
  });

  document.addEventListener("keydown", (event) => {
    const image = event.target.closest?.(".odoo-screenshot-frame img");

    if (!image || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    openLightbox(image);
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === closeButton || !event.target.closest(".lightbox-stage img")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
}

function initPageAssistant() {
  const assistant = document.querySelector("#pageAssistant");
  const toggle = document.querySelector("#assistantToggle");
  const panel = document.querySelector("#assistantPanel");
  const close = document.querySelector("#assistantClose");
  const form = document.querySelector("#assistantForm");
  const input = document.querySelector("#assistantQuestion");
  const answer = document.querySelector("#assistantAnswer");

  if (!assistant || !toggle || !panel || !close || !form || !input || !answer) {
    return;
  }

  const ODOO_TERMS = [
    "Appointment From",
    "Appointment To",
    "Source Invoice",
    "Task Forms",
    "Trip Date",
    "End Task",
    "Assignees",
    "Completed",
    "Project",
    "Invoice",
    "Assign",
    "Stage",
    "Start",
    "OTP",
  ];

  function updatePromptState() {
    const hasText = input.value.trim().length > 0;
    const submitButton = form.querySelector("button");

    form.classList.toggle("has-text", hasText);
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`;

    if (submitButton && !submitButton.dataset.loading) {
      submitButton.disabled = !hasText;
    }
  }

  function showThinkingState() {
    answer.setAttribute("aria-busy", "true");
    answer.innerHTML = `
      <div id="thinking-orb-root" class="thinking-orb-root" role="status" aria-live="polite" aria-label="جاري إنشاء الإجابة"></div>
    `;

    window.ThinkingOrbMount?.mount(document.querySelector("#thinking-orb-root"));
  }

  function renderAssistantAnswer(text) {
    window.ThinkingOrbMount?.unmount();
    answer.removeAttribute("aria-busy");
    answer.innerHTML = formatAssistantAnswer(stripGroundingIntro(text));
  }

  function stripGroundingIntro(text) {
    return String(text || "")
      .replace(/^\s*(وفقًا للمعلومات المتاحة في الصفحة|وفقًا للمعلومات المتاحة|حسب المعلومات المتاحة|حسب المعلومات المتوفرة|بناءً على المعلومات المتاحة)\s*[:：،.-]?\s*/i, "")
      .trim();
  }

  function formatAssistantAnswer(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map((line) => formatAssistantLine(line))
      .join("<br>");
  }

  function formatAssistantLine(line) {
    const cleanedLine = line.replace(/^\s{0,3}#{1,6}\s*/, "").replace(/^\s*[*]\s+/, "");
    const parts = cleanedLine.split(/(\*\*[^*]+\*\*)/g);

    return parts
      .map((part) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const content = part.slice(2, -2);
          return highlightOdooTerms(escapeHtml(content), true);
        }

        return highlightOdooTerms(escapeHtml(part).replace(/\*/g, ""), false);
      })
      .join("");
  }

  function highlightOdooTerms(escapedText, isStrong) {
    const highlighted = ODOO_TERMS.reduce((currentText, term) => {
      const pattern = escapeRegExp(term).replace(/\s+/g, "\\s+");
      const regex = new RegExp(`(^|[^A-Za-z0-9])(${pattern})(?=$|[^A-Za-z0-9])`, "gi");

      return currentText.replace(regex, `$1<span class="odoo-term">$2</span>`);
    }, escapedText);

    return isStrong && highlighted === escapedText ? `<strong>${highlighted}</strong>` : highlighted;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  let assistantState = panel.hidden ? "closed" : "open";
  let closeFallbackTimer = null;

  function openAssistant() {
    if (assistantState === "open") {
      return;
    }

    window.clearTimeout(closeFallbackTimer);
    assistantState = "open";
    assistant.classList.add("is-expanded");
    panel.hidden = false;
    requestAnimationFrame(() => {
      panel.classList.add("is-open");
    });
    toggle.setAttribute("aria-expanded", "true");
    input.focus();
    updatePromptState();
  }

  function closeAssistant() {
    if (assistantState !== "open") {
      return;
    }

    assistantState = "closing";
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");

    const finishClose = () => {
      if (assistantState !== "closing") {
        return;
      }

      window.clearTimeout(closeFallbackTimer);
      panel.removeEventListener("transitionend", handlePanelTransitionEnd);
      panel.hidden = true;
      assistant.classList.remove("is-expanded");
      assistantState = "closed";
      toggle.focus();
    };

    const handlePanelTransitionEnd = (event) => {
      if (event.target === panel && event.propertyName === "opacity") {
        finishClose();
      }
    };

    panel.addEventListener("transitionend", handlePanelTransitionEnd);
    closeFallbackTimer = window.setTimeout(finishClose, 220);
  }

  toggle.addEventListener("click", () => {
    if (panel.hidden) {
      openAssistant();
    } else {
      closeAssistant();
    }
  });

  close.addEventListener("click", closeAssistant);
  input.addEventListener("input", updatePromptState);
  input.addEventListener("focus", updatePromptState);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) {
      answer.textContent = "يرجى كتابة سؤال واضح.";
      return;
    }

    if (question.length > 500) {
      answer.textContent = "يرجى كتابة سؤال لا يتجاوز 500 حرف.";
      return;
    }

    const submitButton = form.querySelector("button");
    showThinkingState();
    submitButton.dataset.loading = "true";
    submitButton.disabled = true;
    input.disabled = true;

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId: introductoryTour.id,
          question,
        }),
      });
      const data = await response.json().catch(() => ({}));

      renderAssistantAnswer(data.answer || "تعذر الحصول على إجابة حاليًا. حاول مرة أخرى.");
    } catch {
      renderAssistantAnswer("تعذر الحصول على إجابة حاليًا. حاول مرة أخرى.");
    } finally {
      delete submitButton.dataset.loading;
      submitButton.disabled = false;
      input.disabled = false;
      input.focus();
      updatePromptState();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      closeAssistant();
    }
  });

  updatePromptState();
}

function init() {
  renderHeaderProgress();
  renderWorkflow();
  renderTrainingFlow();
  renderTaskRows();
  renderTaskFields();
  renderBusinessRules();
  renderQuiz();
  renderNavigationState();
  bindTaskFieldInfo();
  bindQuiz();
  initImageLightbox();
  initPageAssistant();
}

document.addEventListener("DOMContentLoaded", init);
