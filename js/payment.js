    // =====================================================
    // PAYMENT JS
    // =====================================================
    const PAY_API = "https://homunityapiv1.runasp.net/api";
    let currentOrder = null;

    // Open payment modal — called from student dashboard
    async function openPayment(bookingId) {
      const studentId = parseInt(localStorage.getItem("id") || "0");
      if (!studentId) { alert("يرجى تسجيل الدخول أولاً"); return; }

      try {
        const res = await fetch(`${PAY_API}/Payment/create-order/${bookingId}?studentId=${studentId}`, { method: "POST" });
        if (!res.ok) {
          const err = await res.json();
          alert(err.message || "لا يمكن بدء الدفع. تأكد أن الأونر وافق على الحجز أولاً.");
          return;
        }
        currentOrder = await res.json();
        // Populate UI
        document.getElementById("payPropTitle").textContent = currentOrder.propertyTitle || "—";
        document.getElementById("payStudentName").textContent = currentOrder.studentName || "—";
        document.getElementById("payAmount").textContent = currentOrder.amount || "0";
        document.getElementById("payBtnAmount").textContent = currentOrder.amount || "0";
        document.getElementById("receiptProperty").textContent = currentOrder.propertyTitle || "—";
        document.getElementById("receiptOrderId").textContent = currentOrder.mockOrderId || "—";
        document.getElementById("receiptAmount").textContent = currentOrder.amount || "0";
        if (currentOrder.propertyImage) {
          document.getElementById("payPropImg").src = currentOrder.propertyImage;
        }
        showPanel("panelCard");
        setStep(1);
        document.getElementById("paymentOverlay").classList.add("active");
      } catch (e) {
        console.error(e);
        alert("خطأ في الاتصال. حاول مرة أخرى.");
      }
    }

    function closePayment() {
      document.getElementById("paymentOverlay").classList.remove("active");
      resetForm();
    }

    function closePaymentSuccess() {
      closePayment();
      // Reload bookings in student dashboard
      if (typeof loadMyBookings === "function") loadMyBookings();
      if (typeof fetchMyBookings === "function") fetchMyBookings();
    }

    function showPanel(id) {
      document.querySelectorAll(".pay-panel").forEach(p => p.classList.remove("active"));
      document.getElementById(id).classList.add("active");
    }

    function setStep(n) {
      [1, 2, 3].forEach(i => {
        const s = document.getElementById(`step${i}`);
        s.classList.remove("active", "done");
        if (i < n) s.classList.add("done");
        else if (i === n) s.classList.add("active");
      });
    }

    async function processPayment() {
      if (!currentOrder) return;
      const cardNum = document.getElementById("cardNumber").value.replace(/\s/g, "");
      const holder = document.getElementById("cardHolder").value.trim();
      const expiry = document.getElementById("cardExpiry").value.trim();
      const cvv = document.getElementById("cardCvv").value.trim();

      // Client-side validation
      const errEl = document.getElementById("payErrorMsg");
      errEl.style.display = "none";
      if (cardNum.length < 16) { showError("أدخل رقم بطاقة صحيح (16 رقم)"); return; }
      if (!holder) { showError("أدخل اسم حامل البطاقة"); return; }
      if (expiry.length < 5) { showError("أدخل تاريخ انتهاء صحيح (MM/YY)"); return; }
      if (cvv.length < 3) { showError("أدخل CVV صحيح (3 أرقام)"); return; }

      // Show processing
      showPanel("panelProcessing"); setStep(2);
      document.getElementById("payNowBtn").disabled = true;

      // Simulate processing delay (realistic feel)
      await delay(2200);

      try {
        const res = await fetch(`${PAY_API}/Payment/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mockOrderId: currentOrder.mockOrderId,
            cardNumber: cardNum,
            cardExpiry: expiry,
            cardCvv: cvv
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          // Success
          document.getElementById("receiptTime").textContent = new Date().toLocaleString("ar-EG");
          showPanel("panelSuccess"); setStep(3);
        } else {
          document.getElementById("failedMsg").textContent = data.message || "فشل الدفع. حاول مرة أخرى.";
          showPanel("panelFailed"); setStep(1);
        }
      } catch (e) {
        document.getElementById("failedMsg").textContent = "خطأ في الاتصال بالسيرفر.";
        showPanel("panelFailed"); setStep(1);
      } finally {
        document.getElementById("payNowBtn").disabled = false;
      }
    }

    function retryPayment() { showPanel("panelCard"); setStep(1); }

    function showError(msg) {
      const el = document.getElementById("payErrorMsg");
      el.textContent = msg; el.style.display = "block";
    }

    function resetForm() {
      ["cardNumber", "cardHolder", "cardExpiry", "cardCvv"].forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
      document.getElementById("cardNumberDisplay").textContent = "•••• •••• •••• ••••";
      document.getElementById("cardHolderDisplay").textContent = "FULL NAME";
      document.getElementById("cardExpiryDisplay").textContent = "MM/YY";
      document.getElementById("cardBrandIcon").className = "fa-brands fa-cc-visa card-brand";
      document.getElementById("payErrorMsg").style.display = "none";
      document.getElementById("payNowBtn").disabled = false;
      showPanel("panelCard"); setStep(1);
      currentOrder = null;
    }

    // Card number formatting
    function formatCardNumber(input) {
      let v = input.value.replace(/\D/g, "").substring(0, 16);
      input.value = v.replace(/(.{4})/g, "$1 ").trim();
      document.getElementById("cardNumberDisplay").textContent =
        (v + "•".repeat(Math.max(0, 16 - v.length))).replace(/(.{4})/g, "$1 ").trim();
      // Brand detection
      const icon = document.getElementById("cardBrandIcon");
      if (v.startsWith("4")) icon.className = "fa-brands fa-cc-visa card-brand";
      else if (v.startsWith("5")) icon.className = "fa-brands fa-cc-mastercard card-brand";
      else icon.className = "fa-brands fa-cc-visa card-brand";
    }

    function updateCardHolder(input) {
      input.value = input.value.toUpperCase();
      document.getElementById("cardHolderDisplay").textContent = input.value || "FULL NAME";
    }

    function formatExpiry(input) {
      let v = input.value.replace(/\D/g, "").substring(0, 4);
      if (v.length >= 2) v = v.substring(0, 2) + "/" + v.substring(2);
      input.value = v;
      document.getElementById("cardExpiryDisplay").textContent = v || "MM/YY";
    }

    // Fill test card helpers
    function fillTestCard() {
      const el = document.getElementById("cardNumber");
      el.value = "4111 1111 1111 1111"; formatCardNumber(el);
    }
    function fillTestExpiry() {
      const el = document.getElementById("cardExpiry"); el.value = "12/26";
      document.getElementById("cardExpiryDisplay").textContent = "12/26";
    }
    function fillTestCvv() { document.getElementById("cardCvv").value = "123"; }

    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
