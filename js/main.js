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

  /* Contact form (Web3Forms) — progressive enhancement:
     if JS fails, the form still posts normally to Web3Forms' action URL. */
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

    // No-JS fallback: Web3Forms redirected back here with ?sent=1
    if (/[?&]sent=1\b/.test(window.location.search)) {
      showStatus(
        "success",
        "<strong>Message sent.</strong> Thanks for reaching out — we'll get back to you shortly."
      );
      history.replaceState(null, "", window.location.pathname);
    }

    // Deliberately NOT intercepted with fetch()/preventDefault(). Verified
    // directly against the live API: api.web3forms.com/submit returns no
    // Access-Control-Allow-Origin header at all, on either a JSON body or
    // a CORS-simple urlencoded one. That means fetch() can never read the
    // response in any real browser — not a testing artifact, an actual
    // gap in their current API config. A real <form> submission isn't
    // subject to CORS at all (that restriction only applies to JS-
    // initiated fetch/XHR), so letting the browser submit natively is the
    // reliable path: it POSTs, Web3Forms processes it and redirects back
    // to contact.html's `redirect` hidden field value (?sent=1), which
    // the block above already detects on page load to show success.
    form.addEventListener("submit", function () {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
    });
  }
})();
