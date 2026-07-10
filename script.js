/* Faculty Student Learning Portal - Core JS Logic */

// Predefined Mock Data
let notifications = [
  { id: 1, type: 'assignment', text: 'Cloud Computing Assignment 1 is due on 15-July-2026.', time: '10 mins ago', read: false },
  { id: 2, type: 'exam', text: 'Mid-Sem Examination schedule has been released for Semester VII.', time: '2 hours ago', read: false },
  { id: 3, type: 'workshop', text: 'Registration open for Hands-on Docker & Kubernetes Workshop on 18-July.', time: '1 day ago', read: false },
  { id: 4, type: 'holiday', text: 'College remains closed on 15-August for Independence Day.', time: '3 days ago', read: true }
];

let announcements = [
  { title: "Welcome to Semester VII!", text: "Please download the course syllabus from the Subjects Taught tab and complete your prerequisite VM setups.", date: "08-July-2026", author: "Dr. Rajesh K. Sharma" },
  { title: "Distributed Systems Lab Batch Shifts", text: "Due to server maintenance, Batch B2 lab session will be held in IT Lab-I instead of IT Lab-II this Tuesday.", date: "09-July-2026", author: "Dr. Rajesh K. Sharma" }
];

let forumPosts = [
  {
    id: 1,
    topic: " Tomasulo Loop Execution Hazards",
    author: "Amit Ranade (Roll: 4017012)",
    date: "09-July-2026 11:20 AM",
    body: "Hi classmates, during instruction scheduling tracing, how do we track if the reservation station writes back to CDB? Does the instruction release the CDB in the same cycle or the subsequent cycle?",
    likes: 4,
    replies: [
      { author: "Dr. Rajesh K. Sharma (Faculty)", body: "Excellent query, Amit. The write result stage broadcasts the values on the Common Data Bus (CDB) in the execution completion cycle. The reservation station buffer is released in the same cycle, allowing dependent instructions to read and start executing in the next cycle.", date: "09-July-2026 02:40 PM" }
    ]
  },
  {
    id: 2,
    topic: "VirtualBox Para-virtualization Interface Setting",
    author: "Prachi Patil (Roll: 4017056)",
    date: "08-July-2026 04:15 PM",
    body: "For CC Assignment 1, should we set the paravirtualization interface to KVM or Hyper-V inside VirtualBox settings for Ubuntu VM?",
    likes: 2,
    replies: [
      { author: "Suresh Joshi (TA)", body: "Setting it to KVM is recommended for Linux guest OS. It provides better resource mapping. Make sure virtualization is enabled in your BIOS.", date: "08-July-2026 06:10 PM" }
    ]
  }
];

let quizQuestions = [
  {
    q: "Which virtualization type operates directly on the bare-metal hardware without host operating system?",
    options: ["Type-2 Hypervisor", "Type-1 Hypervisor", "Para-virtualization", "OS-Level Virtualization"],
    correctIdx: 1,
    explanations: [
      "Type-2 Hypervisor relies on host OS to function.",
      "Correct! Type-1 hypervisors (like ESXi or Hyper-V) run directly on hardware.",
      "Para-virtualization involves modifying guest kernels, but operates inside hypervisors.",
      "OS-level virtualization (Docker containers) shares the host kernel, it does not manage bare-metal directly."
    ]
  },
  {
    q: "In Tomasulo's Algorithm, which buffer stores the status of memory operations waiting for address validation?",
    options: ["Reservation Stations", "Reorder Buffer", "Load/Store Buffers", "Register Stat Matrix"],
    correctIdx: 2,
    explanations: [
      "Reservation stations hold arithmetic instructions, not memory queues.",
      "Reorder buffer resolves speculative execution outputs, not raw address holds.",
      "Correct! Load and store buffers hold memory reads and writes waiting for memory bus availability.",
      "Register Stat matrix holds mapping pointers of registers."
    ]
  },
  {
    q: "Which consistency model guarantees that all operations are seen in a globally agreed sequential order by all nodes?",
    options: ["Eventual Consistency", "Sequential Consistency", "Causal Consistency", "Weak Consistency"],
    correctIdx: 1,
    explanations: [
      "Eventual consistency only guarantees updates propagate eventually.",
      "Correct! Sequential consistency ensures that all operations are executed in a sequential order agreed by all.",
      "Causal consistency only orders causally related events.",
      "Weak consistency relies on synchronization variables."
    ]
  }
];

let currentQuizIdx = 0;
let selectedRating = 0;
let selectedFile = null;

// Initialize Dashboard page on load
document.addEventListener("DOMContentLoaded", () => {
  renderNotifications();
  renderAnnouncements();
  renderForumThreads();
  updateSyllabusProgress();
  initRouting();
  
  // Set window event listener for hash changes
  window.addEventListener("hashchange", handleHashChange);
});

// ROUTING LOGIC (SPA)
function initRouting() {
  const hash = window.location.hash || "#home";
  switchPanel(hash.substring(1));
}

function handleHashChange() {
  const hash = window.location.hash || "#home";
  switchPanel(hash.substring(1));
}

function switchPanel(panelId) {
  // If the target is the chatbot trigger, skip standard panel swapping
  if (panelId === 'chat-trigger') {
    return;
  }
  
  // Clean target id
  const targetId = document.getElementById(panelId) ? panelId : "home";
  
  // Toggle Active Panels
  document.querySelectorAll(".panel").forEach(p => {
    p.classList.remove("active");
  });
  const activePanel = document.getElementById(targetId);
  if (activePanel) {
    activePanel.classList.add("active");
  }

  // Toggle Active Sidebar states
  document.querySelectorAll(".sidebar-menu li").forEach(li => {
    li.classList.remove("active");
    if (li.getAttribute("data-section") === targetId) {
      li.classList.add("active");
    }
  });

  // Update Main Header Title
  const titleMap = {
    "home": "Dashboard Overview",
    "about": "About the Professor",
    "timetable": "Weekly Timetable & Office Hours",
    "subjects": "Subjects Taught & Core Syllabus",
    "notes": "Lecture Notes & Practical Material",
    "quiz": "Quiz Center & Assessment Forms",
    "assignments": "Assignment Portal & Student Submissions",
    "progress": "Syllabus Progress Tracker",
    "forum": "Discussion Forum Threads",
    "notifications-panel": "Announcements & Notices Board",
    "papers": "Previous Question Papers Bank",
    "remedial": "Remedial Classes Attendance & Schedule",
    "slow-corner": "Slow Learner Revision Corner",
    "advanced-corner": "Advanced Learner Acceleration Corner",
    "research": "Publications, Patents & Research Projects",
    "achievements": "Teacher Accomplishments & Awards",
    "resources": "Academic Student Resources Directory",
    "gallery": "Department Photo Gallery",
    "feedback": "Anonymous Student Feedback",
    "faq": "Frequently Asked Questions",
    "contact": "Contact Faculty Details"
  };

  const headerTitle = document.getElementById("pageWorkspaceTitle");
  if (headerTitle) {
    headerTitle.innerText = titleMap[targetId] || "Academic Portal";
  }

  // Scroll to top of content workspace
  window.scrollTo(0, 0);
  
  // Close mobile sidebar if open
  const sidebar = document.getElementById("appSidebar");
  if (sidebar) {
    sidebar.classList.remove("show");
  }
}

// MOBILE SIDEBAR TOGGLE
function toggleMobileSidebar() {
  const sidebar = document.getElementById("appSidebar");
  if (sidebar) {
    sidebar.classList.toggle("show");
  }
}

// SEARCH SIDEBAR FILTERING
function filterSidebarMenu() {
  const input = document.getElementById("sidebarSearchInput");
  const filter = input.value.toLowerCase();
  const menuList = document.getElementById("sidebarMenu");
  const menuItems = menuList.getElementsByTagName("li");

  for (let i = 0; i < menuItems.length; i++) {
    const textSpan = menuItems[i].getElementsByTagName("span")[0];
    if (textSpan) {
      const textVal = textSpan.textContent || textSpan.innerText;
      if (textVal.toLowerCase().indexOf(filter) > -1) {
        menuItems[i].style.display = "";
      } else {
        // Keep chatbot trigger always visible
        if (menuItems[i].getAttribute("data-section") === "chat-trigger") {
          menuItems[i].style.display = "";
        } else {
          menuItems[i].style.display = "none";
        }
      }
    }
  }
}

// NOTIFICATIONS DRAWER & DOCK LOGIC
function toggleNotificationsDropdown() {
  const dropdown = document.getElementById("notificationDropdown");
  if (dropdown) {
    dropdown.classList.toggle("show");
  }
}

// Close notification dropdown clicking outside
document.addEventListener("click", (e) => {
  const bell = document.querySelector(".notification-bell");
  const dropdown = document.getElementById("notificationDropdown");
  if (dropdown && bell && !bell.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove("show");
  }
});

function renderNotifications() {
  const dropdownList = document.getElementById("dropdownNotificationList");
  const fullPanelList = document.getElementById("fullNotificationPageList");
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Update header and widget badges
  const bellBadge = document.getElementById("headerNotificationCount");
  const widgetBadge = document.getElementById("widgetNotificationCount");
  if (bellBadge) bellBadge.innerText = unreadCount;
  if (widgetBadge) widgetBadge.innerText = unreadCount;

  // Render Dropdown List
  if (dropdownList) {
    dropdownList.innerHTML = "";
    if (notifications.length === 0) {
      dropdownList.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size:0.85rem;">No updates available</div>`;
    } else {
      notifications.forEach(n => {
        dropdownList.innerHTML += `
          <div class="dropdown-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead(${n.id})">
            <i class="${getNotificationIcon(n.type)}"></i>
            <div class="dropdown-item-content">
              <p>${n.text}</p>
              <span>${n.time}</span>
            </div>
          </div>
        `;
      });
    }
  }

  // Render Full Notifications Page Panel
  if (fullPanelList) {
    fullPanelList.innerHTML = "";
    if (notifications.length === 0) {
      fullPanelList.innerHTML = `<p style="color:var(--text-secondary);">No active notices at this time.</p>`;
    } else {
      notifications.forEach(n => {
        fullPanelList.innerHTML += `
          <div style="padding: 1.25rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background: ${n.read ? '#fff' : 'var(--accent-light)'}; border-left: 4px solid var(--primary-light); display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="display:flex; gap:1rem;">
              <div class="widget-icon" style="width:40px; height:40px; font-size:1.1rem; background: #fff; border: 1px solid var(--border-color); color: var(--primary-light);">
                <i class="${getNotificationIcon(n.type)}"></i>
              </div>
              <div>
                <h5 style="font-weight:700; color:var(--primary-dark); font-size:0.95rem; margin-bottom:0.25rem;">${getNotificationLabel(n.type)}</h5>
                <p style="font-size:0.88rem; color:var(--text-secondary);">${n.text}</p>
                <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-top:0.4rem;"><i class="fa-solid fa-clock"></i> ${n.time}</span>
              </div>
            </div>
            ${n.read ? '' : `<button class="btn btn-sm btn-outline-primary" style="padding:2px 8px; font-size:0.75rem;" onclick="markNotificationRead(${n.id})">Mark as Read</button>`}
          </div>
        `;
      });
    }
  }
}

function getNotificationIcon(type) {
  switch(type) {
    case 'assignment': return 'fa-solid fa-file-signature';
    case 'exam': return 'fa-solid fa-graduation-cap';
    case 'workshop': return 'fa-solid fa-laptop-code';
    case 'holiday': return 'fa-solid fa-umbrella-beach';
    default: return 'fa-solid fa-circle-exclamation';
  }
}

function getNotificationLabel(type) {
  switch(type) {
    case 'assignment': return 'Assignment Alert';
    case 'exam': return 'Exam Schedule';
    case 'workshop': return 'FDP / Workshop';
    case 'holiday': return 'Institute Holiday';
    default: return 'Announcement';
  }
}

function markNotificationRead(id) {
  notifications = notifications.map(n => {
    if (n.id === id) {
      return { ...n, read: true };
    }
    return n;
  });
  renderNotifications();
}

function markAllNotificationsRead() {
  notifications = notifications.map(n => ({ ...n, read: true }));
  renderNotifications();
  showToast("All notifications cleared.", "info");
}

// HOME ANNOUNCEMENTS RENDER
function renderAnnouncements() {
  const announcementsList = document.getElementById("homeAnnouncementList");
  if (announcementsList) {
    announcementsList.innerHTML = "";
    announcements.forEach(a => {
      announcementsList.innerHTML += `
        <div class="dropdown-item" style="cursor:default;">
          <i class="fa-solid fa-bullhorn" style="color:var(--secondary);"></i>
          <div class="dropdown-item-content">
            <h5 style="font-weight:700; color:var(--primary-dark); font-size:0.9rem;">${a.title}</h5>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.25rem;">${a.text}</p>
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">By: ${a.author} | Posted: ${a.date}</span>
          </div>
        </div>
      `;
    });
  }
}

// ACCORDION TOGGLER
function toggleAccordion(id) {
  const element = document.getElementById(id);
  if (element) {
    const isActive = element.classList.contains("active");
    // Collapse other items inside the same section if desired, or just toggle
    element.classList.toggle("active", !isActive);
  }
}

// LECTURE NOTES TAB SWITCHER
function switchNotesTab(tabId) {
  document.querySelectorAll(".notes-tab-content").forEach(el => {
    el.style.display = "none";
  });
  const target = document.getElementById(tabId);
  if (target) {
    target.style.display = "block";
  }

  // Toggle active tab buttons
  const buttons = document.querySelectorAll("#notes .tab-btn");
  buttons.forEach(btn => {
    btn.classList.remove("active");
  });
  // Find which button triggered and add active
  event.target.classList.add("active");
}

// PREVIOUS PAPERS TAB SWITCHER
function switchPapersTab(tabId) {
  document.querySelectorAll(".papers-tab-content").forEach(el => {
    el.style.display = "none";
  });
  const target = document.getElementById(tabId);
  if (target) {
    target.style.display = "block";
  }
  
  const buttons = document.querySelectorAll("#papers .tab-btn");
  buttons.forEach(btn => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");
}

// INTERACTIVE MCQ QUIZ CENTER
function checkAnswer(optionElement, isCorrect, explanationText) {
  // Clear other options styling
  const parent = optionElement.parentElement;
  parent.querySelectorAll(".mcq-option").forEach(opt => {
    opt.classList.remove("correct", "incorrect");
    opt.style.pointerEvents = "none"; // Disable further clicks
  });

  if (isCorrect) {
    optionElement.classList.add("correct");
    showToast("Correct Answer!", "success");
  } else {
    optionElement.classList.add("incorrect");
    // highlight correct option too
    parent.querySelectorAll(".mcq-option").forEach((opt, idx) => {
      if (quizQuestions[currentQuizIdx].correctIdx === idx) {
        opt.classList.add("correct");
      }
    });
    showToast("Incorrect Answer. Review explanation.", "info");
  }

  const expBox = document.getElementById("quizExplanationBox");
  if (expBox) {
    expBox.innerHTML = `<strong>Explanation:</strong> ${explanationText}`;
    expBox.style.display = "block";
  }
}

function nextQuizQuestion() {
  currentQuizIdx = (currentQuizIdx + 1) % quizQuestions.length;
  resetQuiz();
}

function resetQuiz() {
  const expBox = document.getElementById("quizExplanationBox");
  if (expBox) {
    expBox.style.display = "none";
  }

  const widget = document.getElementById("mcqWidgetArea");
  if (widget) {
    const qData = quizQuestions[currentQuizIdx];
    widget.innerHTML = `
      <p style="font-weight: 700; margin-bottom: 1rem;" id="quizQuestionText">Q${currentQuizIdx+1}: ${qData.q}</p>
      
      ${qData.options.map((opt, idx) => `
        <div class="mcq-option" onclick="checkAnswer(this, ${idx === qData.correctIdx}, '${qData.explanations[idx]}')">
          <span class="badge" style="background:var(--primary-dark); color:#fff; border-radius:50%; width:20px; height:20px; display:inline-flex; align-items:center; justify-content:center;">${String.fromCharCode(65 + idx)}</span>
          <span>${opt}</span>
        </div>
      `).join("")}

      <div class="quiz-explanation" id="quizExplanationBox"></div>

      <div style="margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-outline-primary btn-sm" onclick="resetQuiz()">Reset Question</button>
        <button class="btn btn-primary btn-sm" onclick="nextQuizQuestion()">Next Question <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    `;
  }
}

// ASSIGNMENT MOCK UPLOAD & LOGS
function triggerFileSelect() {
  document.getElementById("assignmentFileInput").click();
}

function handleFileSelect(event) {
  const files = event.target.files;
  if (files.length > 0) {
    selectedFile = files[0];
    document.getElementById("selectedFileName").innerText = `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`;
    document.getElementById("selectedFileInfo").style.display = "flex";
  }
}

function cancelFileSelection() {
  selectedFile = null;
  document.getElementById("assignmentFileInput").value = "";
  document.getElementById("selectedFileInfo").style.display = "none";
}

function submitAssignmentMock() {
  if (!selectedFile) {
    showToast("Please drag-and-drop or select a file first.", "info");
    return;
  }

  const select = document.getElementById("uploadAssignmentSelect");
  const assId = select.value;
  const assText = select.options[select.selectedIndex].text;

  // Update status badge inside assignment table
  if (assId === "ass-1") {
    const badge = document.getElementById("status-ass-1");
    if (badge) {
      badge.className = "badge-status submitted";
      badge.innerText = "Submitted";
    }
    const remarks = document.getElementById("grade-ass-1");
    if (remarks) {
      remarks.innerText = "Submitted, grading pending";
    }
  } else if (assId === "ass-2") {
    const badge = document.getElementById("status-ass-2");
    if (badge) {
      badge.className = "badge-status submitted";
      badge.innerText = "Submitted";
    }
    const remarks = document.getElementById("grade-ass-2");
    if (remarks) {
      remarks.innerText = "Submitted, grading pending";
    }
  }

  // Prepend to submission logs
  const historyList = document.getElementById("submissionHistoryList");
  if (historyList) {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    historyList.innerHTML = `
      <li style="padding:0.6rem; border-bottom:1px solid var(--border-color); font-size:0.8rem; color:var(--text-secondary); display:flex; justify-content:space-between; background:var(--accent-light);">
        <span><strong>${assText.split(':')[0]}</strong> (${selectedFile.name})</span>
        <span>Submitted on: ${dateStr} ${timeStr}</span>
      </li>
    ` + historyList.innerHTML;
  }

  // Update Widget statistics
  const pendingCount = document.getElementById("widgetAssignmentsDue");
  if (pendingCount) {
    let current = parseInt(pendingCount.innerText);
    if (current > 0) {
      pendingCount.innerText = current - 1;
    }
  }

  showToast(`Successfully submitted ${selectedFile.name}!`, "success");
  cancelFileSelection();
}

// SYLLABUS PROGRESS TRACKER CALCULATOR
function updateSyllabusProgress() {
  const checkboxes = document.querySelectorAll(".unit-tracker-left input[type='checkbox']");
  const total = checkboxes.length;
  let checkedCount = 0;

  checkboxes.forEach((cb, idx) => {
    const unitIdx = idx + 1;
    const statusText = document.getElementById(`status-unit-cc-${unitIdx}`);
    if (cb.checked) {
      checkedCount++;
      if (statusText) {
        statusText.innerText = "Completed";
        statusText.className = "unit-status completed";
      }
    } else {
      if (statusText) {
        statusText.innerText = "Pending Review";
        statusText.className = "unit-status pending";
      }
    }
  });

  const percentage = Math.round((checkedCount / total) * 100);

  // Update main progress bar inner
  const innerBars = document.querySelectorAll(".progress-bar-inner");
  innerBars.forEach(bar => {
    bar.style.width = `${percentage}%`;
  });

  // Update widget text percentages
  const widgetPct = document.getElementById("widgetSyllabusCompleted");
  if (widgetPct) {
    widgetPct.innerText = `${percentage}%`;
  }
  const widgetBar = document.getElementById("widgetSyllabusBar");
  if (widgetBar) {
    widgetBar.style.width = `${percentage}%`;
  }
}

// DISCUSSION FORUM CORE
function renderForumThreads() {
  const container = document.getElementById("forumThreadsContainer");
  if (!container) return;

  container.innerHTML = "";

  if (forumPosts.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No questions posted yet. Be the first to ask!</p>`;
    return;
  }

  forumPosts.forEach(post => {
    container.innerHTML += `
      <div class="forum-post" id="post-${post.id}">
        <div class="forum-post-header">
          <div class="forum-post-author">
            <i class="fa-solid fa-user-graduate"></i>
            <span>${post.author}</span>
          </div>
          <span>${post.date}</span>
        </div>
        <h4 style="font-weight:700; font-size:1.05rem; color:var(--primary-dark); margin-bottom:0.5rem;">${post.topic}</h4>
        <div class="forum-post-body">${post.body}</div>
        
        <div class="forum-post-actions">
          <button class="forum-action-btn" onclick="likeForumPost(${post.id})">
            <i class="fa-regular fa-thumbs-up"></i> <span>Like (${post.likes})</span>
          </button>
          <button class="forum-action-btn" onclick="toggleReplyBox(${post.id})">
            <i class="fa-regular fa-comment"></i> <span>Replies (${post.replies.length})</span>
          </button>
        </div>

        <!-- Replies Box Segment -->
        <div class="forum-reply-box" id="replybox-${post.id}">
          <div class="forum-replies-list" id="replieslist-${post.id}">
            ${post.replies.map(r => `
              <div class="forum-reply-item">
                <div class="forum-reply-item-header">
                  <span>${r.author}</span>
                  <span style="color:var(--text-muted); font-weight:400;">${r.date}</span>
                </div>
                <div>${r.body}</div>
              </div>
            `).join("")}
          </div>
          
          <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
            <input type="text" id="replyinput-${post.id}" placeholder="Type reply as Student..." style="flex:1; padding:0.5rem 0.75rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); margin-bottom:0; font-size:0.85rem;">
            <button class="btn btn-primary btn-sm" onclick="submitForumReply(${post.id})">Reply</button>
          </div>
        </div>
      </div>
    `;
  });
}

function likeForumPost(id) {
  forumPosts = forumPosts.map(p => {
    if (p.id === id) {
      return { ...p, likes: p.likes + 1 };
    }
    return p;
  });
  renderForumThreads();
  showToast("Liked post!", "success");
}

function toggleReplyBox(postId) {
  const el = document.getElementById(`replybox-${postId}`);
  if (el) {
    el.classList.toggle("show");
  }
}

function postForumQuestion() {
  const topicInput = document.getElementById("forumTopicInput");
  const questionInput = document.getElementById("forumQuestionInput");

  if (!topicInput.value || !questionInput.value) {
    showToast("Please fill topic heading and question body.", "info");
    return;
  }

  const dateStr = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  const newPost = {
    id: forumPosts.length + 1,
    topic: topicInput.value,
    author: "Anonymous Student",
    date: dateStr,
    body: questionInput.value,
    likes: 0,
    replies: []
  };

  forumPosts.unshift(newPost); // Add at top
  renderForumThreads();

  topicInput.value = "";
  questionInput.value = "";
  showToast("Question posted to forum thread!", "success");
}

function submitForumReply(postId) {
  const input = document.getElementById(`replyinput-${postId}`);
  if (!input || !input.value) {
    showToast("Please enter a reply message.", "info");
    return;
  }

  const dateStr = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  forumPosts = forumPosts.map(p => {
    if (p.id === postId) {
      return {
        ...p,
        replies: [...p.replies, { author: "Student peer", body: input.value, date: dateStr }]
      };
    }
    return p;
  });

  renderForumThreads();
  // Keep target replybox open
  toggleReplyBox(postId);
  showToast("Reply submitted.", "success");
}

// STUDENT ANONYMOUS FEEDBACK FORM
function rateFeedback(starsCount) {
  selectedRating = starsCount;
  const starsContainer = document.getElementById("feedbackStarRating");
  const stars = starsContainer.querySelectorAll("i");
  
  stars.forEach((star, idx) => {
    if (idx < starsCount) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

function submitFeedbackMock() {
  const nameInput = document.getElementById("feedbackNameInput");
  const subSelect = document.getElementById("feedbackSubjectSelect");
  const commentInput = document.getElementById("feedbackCommentsInput");

  if (selectedRating === 0) {
    showToast("Please rate the course using the stars.", "info");
    return;
  }
  if (!commentInput.value) {
    showToast("Please share comments/suggestions.", "info");
    return;
  }

  showToast("Thank you! Anonymous feedback submitted to HOD.", "success");

  // Reset form
  nameInput.value = "";
  commentInput.value = "";
  selectedRating = 0;
  rateFeedback(0);
}

// CONTACT PORTAL FORM MOCK
function submitContactFormMock() {
  const name = document.getElementById("contactNameInput");
  const email = document.getElementById("contactEmailInput");
  const message = document.getElementById("contactMessageInput");

  if (!name.value || !email.value || !message.value) {
    showToast("Please complete all direct contact fields.", "info");
    return;
  }

  showToast("Message sent! Dr. Rajesh Sharma will reply shortly.", "success");

  // reset fields
  name.value = "";
  email.value = "";
  message.value = "";
}

// TOAST UTILITIES
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="${type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-info'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Fade out and remove toast
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-20px)";
    toast.style.transition = "all 0.4s ease";
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3000);
}

// OFFLINE CHATBOT LOGIC
function toggleChatbot(forceState) {
  const container = document.getElementById("chatbotContainer");
  const openIcon = document.getElementById("chatOpenIcon");
  const closeIcon = document.getElementById("chatCloseIcon");

  if (!container) return;

  const willShow = (forceState !== undefined) ? forceState : !container.classList.contains("show");

  if (willShow) {
    container.classList.add("show");
    if (openIcon) openIcon.style.display = "none";
    if (closeIcon) closeIcon.style.display = "block";
  } else {
    container.classList.remove("show");
    if (openIcon) openIcon.style.display = "block";
    if (closeIcon) closeIcon.style.display = "none";
  }
}

function handleChatEnter(event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
}

function handleSuggestionClick(suggestionText) {
  const input = document.getElementById("chatInput");
  if (input) {
    input.value = suggestionText;
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById("chatInput");
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  appendChatMessage(text, "user");
  input.value = "";

  // Process predefined response
  setTimeout(() => {
    const response = getChatbotResponse(text);
    appendChatMessage(response, "bot");
  }, 500);
}

function appendChatMessage(text, sender) {
  const container = document.getElementById("chatbotMessages");
  if (!container) return;

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = text;
  container.appendChild(bubble);

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function getChatbotResponse(userInput) {
  const input = userInput.toLowerCase();

  if (input.includes("syllabus") || input.includes("subject") || input.includes("course")) {
    return `Dr. Rajesh Sharma teaches 3 courses this semester: <br>
      1. <strong>Cloud Computing (CS401)</strong> - Virtualization, Docker, Kubernetes.<br>
      2. <strong>Advanced Computer Architecture (CS402)</strong> - Instruction pipelines, Cache MESI coherence.<br>
      3. <strong>Distributed Systems (CS403)</strong> - Raft consensus, Lamport clocks.<br>
      You can find detailed syllabus outlines on the <a href="#subjects" onclick="switchPanel('subjects'); toggleChatbot(false);">Subjects Taught</a> tab.`;
  }

  if (input.includes("timetable") || input.includes("schedule") || input.includes("class time")) {
    return `Lecture days and classrooms for Dr. Rajesh Sharma: <br>
      - <strong>Cloud Computing:</strong> Mon & Wed 9:00 AM (Room 401)<br>
      - <strong>Advanced Architecture:</strong> Tue & Thu 10:00 AM, Fri 2:00 PM (Room 402)<br>
      - <strong>Distributed Systems:</strong> Thu 9:00 AM & Fri 10:00 AM (Room 403)<br>
      Detailed labs scheduling is at the <a href="#timetable" onclick="switchPanel('timetable'); toggleChatbot(false);">Weekly Timetable</a> tab.`;
  }

  if (input.includes("assignment") || input.includes("due date") || input.includes("submission")) {
    return `Active Pending Assignments:<br>
      - <strong>Cloud Computing Assignment 1:</strong> Virtualization Setup (Due 15-July-2026).<br>
      - <strong>Distributed Systems Assignment 2:</strong> Clock Tracing Code (Due 25-July-2026).<br>
      Go to the <a href="#assignments" onclick="switchPanel('assignments'); toggleChatbot(false);">Assignment Portal</a> to submit your work or check grading remarks.`;
  }

  if (input.includes("quiz") || input.includes("test")) {
    return `Upcoming assessment: <strong>Quiz 3 (Cloud Virtualization)</strong> will be scheduled next week.<br>
      Test yourself now using the <a href="#quiz" onclick="switchPanel('quiz'); toggleChatbot(false);">MCQ Self-Check Engine</a> or download previous test papers.`;
  }

  if (input.includes("office hours") || input.includes("consult") || input.includes("room") || input.includes("office location")) {
    return `Dr. Rajesh Sharma's office coordinates:<br>
      - <strong>Office Room:</strong> A-204, IT Block, 2nd Floor.<br>
      - <strong>Official Consultation Timings:</strong> Monday & Wednesday (02:00 PM - 04:00 PM).<br>
      Feel free to visit for academic help or research guidance during these hours!`;
  }

  if (input.includes("contact") || input.includes("email") || input.includes("phone") || input.includes("address")) {
    return `Direct Channels to reach the HOD:<br>
      - <strong>Faculty Email:</strong> rsharma@pict.edu<br>
      - <strong>Office Ext No:</strong> +91 20 2437 1102 (Ext: 405)<br>
      You can also use the feedback or direct contact sheets inside <a href="#contact" onclick="switchPanel('contact'); toggleChatbot(false);">Contact Faculty</a> section.`;
  }

  if (input.includes("exam pattern") || input.includes("viva") || input.includes("oral") || input.includes("mark")) {
    return `<strong>SPPU Exam Pattern Details:</strong><br>
      1. <strong>Theory (Mid-Sem):</strong> 30 Marks (Written, 1 hour covering Units 1-2/3).<br>
      2. <strong>Theory (End-Sem):</strong> 70 Marks (Written, 2.5 hours covering entire syllabus).<br>
      3. <strong>Practical / Viva:</strong> 50 Marks (1 hour coding execution + 10 mins external oral interview).<br>
      Details are outlined in the <a href="#faq" onclick="switchPanel('faq'); toggleChatbot(false);">Academic FAQs</a> tab.`;
  }

  return `I recognize queries related to: <strong>syllabus, timetable, assignments, quiz links, office hours, contact coordinates, or exam pattern</strong>. Try retyping with one of these keywords!`;
}
