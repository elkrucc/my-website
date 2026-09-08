(function () {
  "use strict";

  /* Header shrink / shadow on scroll */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("show", y > 500);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Mobile nav toggle */
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll("[data-reveal]");
  function revealNow(el) {
    var delay = el.getAttribute("data-reveal-delay");
    if (delay) el.style.transitionDelay = delay + "ms";
    el.classList.add("in");
  }
  if (revealEls.length) {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var pending = [];
    revealEls.forEach(function (el) {
      // Anything already in (or just below) the initial viewport should be
      // visible immediately — don't make first paint depend on IO timing.
      if (el.getBoundingClientRect().top < vh) {
        revealNow(el);
      } else {
        pending.push(el);
      }
    });

    if ("IntersectionObserver" in window && pending.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              revealNow(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      pending.forEach(function (el) {
        io.observe(el);
      });
    } else {
      pending.forEach(revealNow);
    }
  }

  /* Current year in footer */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Contact form (FormSubmit) — progressive enhancement:
     if JS fails, the form still posts normally to FormSubmit's action URL. */
  var form = document.querySelector("#contact-form");
  if (form) {
    var statusBox = form.querySelector(".form-status");
    var submitBtn = form.querySelector('button[type="submit"]');

    function showStatus(kind, message) {
      if (!statusBox) return;
      statusBox.className = "form-status show " + kind;
      var textEl = statusBox.querySelector(".form-status-text");
      if (textEl) {
        textEl.innerHTML = message;
      } else {
        statusBox.innerHTML = message;
      }
      statusBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // No-JS fallback: FormSubmit redirected back here with ?sent=1
    if (/[?&]sent=1\b/.test(window.location.search)) {
      showStatus(
        "success",
        "<strong>Message sent.</strong> Thanks for reaching out — we'll get back to you shortly. If this is your first message to us, please check <strong>info@elkru.com</strong> for a one-time FormSubmit activation email."
      );
      history.replaceState(null, "", window.location.pathname);
    }

    form.addEventListener("submit", function (e) {
      // Honeypot check
      var honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.dataset.originalText || submitBtn.textContent;
        submitBtn.textContent = "Sending…";
      }

      var data = new FormData(form);
      fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            showStatus(
              "success",
              "<strong>Message sent.</strong> Thanks for reaching out — we'll get back to you shortly. If this is your first message to us, please check <strong>info@elkru.com</strong> for a one-time FormSubmit activation email."
            );
          } else {
            throw new Error("Request failed");
          }
        })
        .catch(function () {
          showStatus(
            "error",
            "<strong>Something went wrong.</strong> Please try again, or reach us directly at <a href=\"mailto:info@elkru.com\">info@elkru.com</a> / <a href=\"tel:+27118920286\">+27 11 892 0286</a>."
          );
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText;
          }
        });
    });
  }
})();
