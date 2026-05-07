// =====================================================
// HOMUNITY CHATBOT JS
// أضف ده في آخر ملف dashbord.student.js
// =====================================================

const CHAT_API = "https://homunityapiv1.runasp.net/api";
let chatOpen = false;
let isTyping = false;

function toggleChat() {
  chatOpen = !chatOpen;
  const win   = document.getElementById("homunity-chat-window");
  const icon  = document.getElementById("chatFabIcon");
  const badge = document.getElementById("chatBadge");
  win.classList.toggle("open", chatOpen);
  icon.className = chatOpen ? "fa-solid fa-xmark" : "fa-solid fa-robot";
  badge.style.display = "none";
  if (chatOpen) {
    loadChatHistory();
    setTimeout(() => document.getElementById("chatInput")?.focus(), 300);
  }
}

async function loadChatHistory() {
  const studentId = parseInt(localStorage.getItem("id") || "0");
  if (!studentId) return;
  try {
    const res  = await fetch(`${CHAT_API}/Chat/history/${studentId}`);
    const data = await res.json();
    if (data.messages && data.messages.length > 0) {
      const container = document.getElementById("chatMessages");
      container.innerHTML = "";
      data.messages.forEach(m => appendChatMessage(m.role, m.content, false));
      chatScrollBottom();
    }
  } catch (e) { console.warn("Chat history:", e); }
}

async function sendMessage() {
  const input     = document.getElementById("chatInput");
  const msg       = input.value.trim();
  const studentId = parseInt(localStorage.getItem("id") || "0");

  if (!msg || isTyping) return;
  if (!studentId) {
    appendChatMessage("assistant", "⚠️ يرجى تسجيل الدخول أولاً.");
    return;
  }

  // Remove welcome & suggestions on first message
  document.querySelector(".chat-welcome")?.remove();
  document.getElementById("quickSuggestions").style.display = "none";

  input.value = "";
  autoResize(input);
  appendChatMessage("user", msg);
  showChatTyping();
  isTyping = true;
  document.getElementById("chatSendBtn").disabled = true;

  try {
    const res  = await fetch(`${CHAT_API}/Chat/message`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ studentId, message: msg })
    });
    const data = await res.json();
    hideChatTyping();
    appendChatMessage("assistant", data.reply);
    if (data.suggestions && data.suggestions.length > 0) {
      renderChatSuggestions(data.suggestions);
    }
  } catch (e) {
    hideChatTyping();
    appendChatMessage("assistant", "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.");
  } finally {
    isTyping = false;
    document.getElementById("chatSendBtn").disabled = false;
    document.getElementById("chatInput")?.focus();
  }
}

function sendQuick(text) {
  document.getElementById("chatInput").value = text;
  sendMessage();
}

function appendChatMessage(role, content, animate = true) {
  const container = document.getElementById("chatMessages");
  const isUser    = role === "user";
  const time      = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  const row       = document.createElement("div");
  row.className   = `msg-row ${isUser ? "user" : ""}`;
  row.innerHTML   = `
    <div class="msg-avatar ${isUser ? "user" : "bot"}">${isUser ? "أنت" : "AI"}</div>
    <div>
      <div class="msg-bubble ${isUser ? "user" : "bot"}">${formatChatMessage(content)}</div>
      <span class="msg-time">${time}</span>
    </div>`;
  if (!animate) row.style.animation = "none";
  container.appendChild(row);
  chatScrollBottom();
}

function formatChatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

function renderChatSuggestions(suggestions) {
  const container = document.getElementById("chatMessages");
  const cardsDiv  = document.createElement("div");
  cardsDiv.className = "msg-row";
  const inner = document.createElement("div");
  inner.innerHTML = `
    <div class="chat-prop-cards">
      ${suggestions.map(p => `
        <div class="chat-prop-card" onclick="openChatProperty(${p.propertyID})">
          <img src="${p.imageUrl || 'https://via.placeholder.com/54x44'}"
               onerror="this.src='https://via.placeholder.com/54x44'" />
          <div class="chat-prop-info">
            <div class="chat-prop-title">${p.title}</div>
            <div class="chat-prop-price">$${p.price} / شهر</div>
            <div class="chat-prop-addr">${p.address || "عنوان غير متاح"}</div>
          </div>
        </div>`).join("")}
    </div>`;
  cardsDiv.appendChild(inner);
  container.appendChild(cardsDiv);
  chatScrollBottom();
}

function openChatProperty(id) {
  // يفتح تفاصيل العقار في Student Dashboard مباشرة
  if (typeof loadPropertyDetails === "function") loadPropertyDetails(id);
  toggleChat();
}

function showChatTyping() {
  const container = document.getElementById("chatMessages");
  const row       = document.createElement("div");
  row.className   = "msg-row";
  row.id          = "chatTypingRow";
  row.innerHTML   = `
    <div class="msg-avatar bot">AI</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  container.appendChild(row);
  chatScrollBottom();
}

function hideChatTyping() {
  document.getElementById("chatTypingRow")?.remove();
}

async function clearChat() {
  const studentId = parseInt(localStorage.getItem("id") || "0");
  if (!studentId) return;
  if (!confirm("هل تريد مسح سجل المحادثة؟")) return;
  try {
    await fetch(`${CHAT_API}/Chat/clear/${studentId}`, { method: "DELETE" });
    document.getElementById("chatMessages").innerHTML = `
      <div class="chat-welcome">
        <div class="welcome-icon">🏠</div>
        <h3>أهلاً بك في Homunity!</h3>
        <p>أنا مساعدك الذكي، يمكنني مساعدتك في<br>إيجاد أفضل سكن طلابي مناسب لك.</p>
      </div>`;
    document.getElementById("quickSuggestions").style.display = "flex";
  } catch (e) { console.warn("Clear chat:", e); }
}

function chatScrollBottom() {
  const c = document.getElementById("chatMessages");
  if (c) c.scrollTop = c.scrollHeight;
}

function handleKeyDown(e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 100) + "px";
}

// Badge يظهر بعد 3 ثواني لجلب الانتباه
setTimeout(() => {
  const badge = document.getElementById("chatBadge");
  if (badge && !chatOpen) badge.style.display = "flex";
}, 3000);
