/* ═══════════ Hae San & Kristal — invite behaviour ═══════════ */

/* ── CONFIG ─────────────────────────────────────────────────
   Paste your Google Apps Script "Web app" URL here once deployed
   (see README.md — takes ~3 minutes). Until then, submissions
   show a "not connected" notice instead of silently vanishing. */
const RSVP_ENDPOINT = "";

/* ── Ambient snowfall (with the occasional plum petal) ── */
(function initSnow() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("snow");
  if (!canvas || reduced) return;
  const ctx = canvas.getContext("2d");
  let W, H, flakes;

  function makeFlake(fresh) {
    const depth = 0.35 + Math.random() * 0.65; // 0.35 (far) → 1 (near)
    const petal = Math.random() < 0.05;
    return {
      x: Math.random() * W,
      y: fresh ? -10 - Math.random() * 40 : Math.random() * H,
      depth,
      petal,
      r: petal ? 3 + depth * 2.4 : 0.8 + depth * 1.9,
      vy: (petal ? 14 : 11) + depth * 21,          // px / s
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * (petal ? 2.2 : 0.8),
      rot: Math.random() * Math.PI * 2,
    };
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(85, Math.round((W * H) / 22000));
    flakes = Array.from({ length: count }, () => makeFlake(false));
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, W, H);
    const wind = Math.sin(now / 5200) * 14; // gentle shared breeze

    for (let i = flakes.length - 1; i >= 0; i--) {
      const f = flakes[i];
      f.y += f.vy * dt;
      f.x += (wind * f.depth + Math.sin(now / 900 + f.phase) * 8) * dt;
      f.rot += f.spin * dt;
      if (f.vx !== undefined) {           // burst petals: fling, then drift down
        f.x += f.vx * dt;
        f.vx *= 0.96;
        f.vy = Math.min(f.vy + 60 * dt, 46);
        if (f.y > H + 12) { flakes.splice(i, 1); continue; }
      } else if (f.y > H + 12) {
        flakes[i] = makeFlake(true);
      }
      if (f.x > W + 14) f.x = -14;
      if (f.x < -14) f.x = W + 14;

      if (f.petal) {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.globalAlpha = 0.4 + f.depth * 0.35;
        ctx.fillStyle = "#C6503A";
        ctx.beginPath();
        ctx.ellipse(0, 0, f.r, f.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // six-armed snowflakes, slowly turning as they fall
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.globalAlpha = 0.3 + f.depth * 0.4;
        ctx.strokeStyle = "#A8B6C2";
        ctx.lineWidth = Math.max(0.6, f.r * 0.3);
        ctx.lineCap = "round";
        const arm = f.r * 2.3;
        ctx.beginPath();
        for (let k = 0; k < 3; k++) {
          ctx.rotate(Math.PI / 3);
          ctx.moveTo(-arm, 0);
          ctx.lineTo(arm, 0);
          if (f.r > 1.7) {                     // branch ticks on the larger flakes
            const t = arm * 0.55, s = arm * 0.28;
            ctx.moveTo(t - s, -s); ctx.lineTo(t, 0); ctx.lineTo(t - s, s);
            ctx.moveTo(-(t - s), -s); ctx.lineTo(-t, 0); ctx.lineTo(-(t - s), s);
          }
        }
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    if (!document.hidden) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });

  /* celebration: fling a handful of petals from (x, y) */
  window.__burstPetals = function (x, y) {
    for (let i = 0; i < 26; i++) {
      const angle = Math.PI * (1 + Math.random());       // upward half-circle
      const speed = 90 + Math.random() * 200;
      flakes.push({
        x, y,
        depth: 0.6 + Math.random() * 0.4,
        petal: true,
        r: 3.2 + Math.random() * 2.6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.55,
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 6,
        rot: Math.random() * Math.PI * 2,
      });
    }
  };
})();

/* ── Countdown ── */
(function initCountdown() {
  const el = document.getElementById("countdown");
  if (!el) return;
  const target = new Date("2027-02-20T00:00:00+08:00");
  const days = Math.ceil((target - Date.now()) / 86400000);
  if (days > 1) el.textContent = "— " + days + " days from now —";
  else if (days === 1) el.textContent = "— tomorrow —";
  else if (days === 0) el.textContent = "— today 囍 —";
  else el.textContent = "";
})();

/* ── Reveal on scroll ── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ── Hanok journey: approach → doors open → step into the light ── */
const scene = document.getElementById("hanokScene");
const hanokSvg = document.getElementById("hanokSvg");
const cam = document.getElementById("cam");
const doorL = document.getElementById("doorL");
const doorR = document.getElementById("doorR");
const sceneCouple = document.getElementById("sceneCouple");
const hanokWash = document.getElementById("hanokWash");
const caption = document.querySelector(".scene-caption");
const openingHero = document.getElementById("openingHero");
const plaque = document.getElementById("plaque");
const openingCta = document.getElementById("openingCta");
const scrollHint = document.getElementById("scrollHint");
const scrollCue = document.getElementById("scrollCue");
const plumBranch = document.querySelector(".hanok-sticky .plum");

if (scrollCue) {
  scrollCue.addEventListener("click", () => {
    window.scrollTo({ top: window.innerHeight * 1.4, behavior: "smooth" });
  });
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };

function isPortrait() {
  return window.innerHeight > window.innerWidth * 1.1;
}
function fitScene() {
  if (hanokSvg) hanokSvg.setAttribute("preserveAspectRatio", "xMidYMid slice");
}
fitScene();

let ticking = false;
function renderScene() {
  ticking = false;
  if (!scene || !cam) return;
  const rect = scene.getBoundingClientRect();
  const vh = window.innerHeight;
  const total = rect.height - vh;
  const p = clamp01(-rect.top / total);

  // 0 · the invitation drifts away as the journey begins
  const heroGone = ease((p - 0.06) / 0.14);
  openingHero.style.opacity = String(1 - heroGone);
  openingHero.style.transform = "translateY(" + -60 * heroGone + "px)";
  if (openingCta) {
    openingCta.style.opacity = String(1 - heroGone);
    openingCta.style.transform = "translate(-50%, " + 40 * heroGone + "px)";
    openingCta.style.pointerEvents = heroGone > 0.5 ? "none" : "auto";
  }
  if (scrollHint) scrollHint.style.opacity = String(1 - heroGone);
  if (scrollCue) scrollCue.style.opacity = String(1 - heroGone);
  if (plumBranch) plumBranch.style.opacity = String(0.95 * (1 - ease((p - 0.24) / 0.2)));

  // 1 · the walk — the couple crosses toward the steps
  const walk = ease((p - 0.14) / 0.36);
  const coupleOpacity =
    clamp01((p - 0.14) / 0.08) * (1 - clamp01((p - 0.54) / 0.1));
  sceneCouple.setAttribute("transform", "translate(" + (-150 + walk * 150) + " 0)");
  sceneCouple.style.opacity = String(coupleOpacity);

  // 2 · the approach — camera pushes in toward the doorway.
  // (450, fy) is the content point held at the viewport centre (450, 300).
  // frame the whole house (names live on its plaque now)
  const portrait = isPortrait();
  const vw = window.innerWidth;
  const sliceScale = Math.max(vw / 900, vh / 600);
  const s0 = Math.min((vh / sliceScale) / 360, (vw / sliceScale) / (portrait ? 580 : 470));
  // phones: the plaque leans larger so the names stay readable
  if (plaque) {
    plaque.setAttribute("transform", portrait ? "translate(450 311) scale(1.32) translate(-450 -311)" : "");
  }
  const zt = ease((p - 0.2) / 0.6);
  const s = s0 + zt * zt * (6.8 - s0);
  const fy = 335 + ease((p - 0.26) / 0.48) * 61;    // house centre → door centre
  cam.setAttribute(
    "transform",
    "translate(450 300) scale(" + s + ") translate(-450 " + -fy + ")"
  );

  // 3 · the doors slide open
  const d = ease((p - 0.62) / 0.22) * 46;
  doorL.setAttribute("transform", "translate(" + -d + " 0)");
  doorR.setAttribute("transform", "translate(" + d + " 0)");

  // 4 · stepping into the light → memory lane
  hanokWash.style.opacity = String(ease((p - 0.8) / 0.15));
  if (caption) caption.classList.toggle("visible", p > 0.92);
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(renderScene);
  }
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reducedMotion) {
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { fitScene(); onScroll(); }, { passive: true });
  renderScene();
}

/* ── RSVP form: conditional logic ── */
const form = document.getElementById("rsvpForm");
const attendingDetails = document.getElementById("attendingDetails");
const plusOneDetails = document.getElementById("plusOneDetails");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("change", (e) => {
  if (e.target.name === "attending") {
    attendingDetails.hidden = e.target.value !== "accepts";
  }
  if (e.target.name === "plusOne") {
    plusOneDetails.hidden = e.target.value !== "yes";
    const req = e.target.value === "yes";
    document.getElementById("plusOneName").required = req;
    document.getElementById("plusOneEmail").required = req;
  }
});

/* ── RSVP form: validation + submit ── */
function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = "form-status" + (kind ? " " + kind : "");
}

function validate(data) {
  const errors = [];
  if (!data.fullName.trim()) errors.push("your full name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("a valid email address");
  if (!data.attending) errors.push("whether you are attending");
  if (data.attending === "accepts") {
    if (data.events.length === 0) errors.push("which parts of the day you'll join");
    if (!data.plusOne) errors.push("whether a plus one is joining");
    if (data.plusOne === "yes") {
      if (!data.plusOneName.trim()) errors.push("your plus one's full name");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.plusOneEmail)) errors.push("your plus one's email");
    }
    if (!data.driving) errors.push("whether you'll be driving");
  }
  return errors;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const data = {
    fullName: fd.get("fullName") || "",
    email: fd.get("email") || "",
    attending: fd.get("attending") || "",
    events: fd.getAll("events"),
    plusOne: fd.get("plusOne") || "",
    plusOneName: fd.get("plusOneName") || "",
    plusOneEmail: fd.get("plusOneEmail") || "",
    driving: fd.get("driving") || "",
    dietary: fd.get("dietary") || "",
    message: fd.get("message") || "",
    submittedAt: new Date().toISOString(),
  };
  if (data.attending === "declines") {
    data.events = [];
    data.plusOne = data.plusOneName = data.plusOneEmail = data.driving = data.dietary = "";
  }

  const errors = validate(data);
  if (errors.length) {
    setStatus("Please share " + errors[0] + ".", "err");
    return;
  }

  if (!RSVP_ENDPOINT) {
    setStatus("The RSVP box isn't connected yet — please check back shortly.", "err");
    console.warn("RSVP_ENDPOINT is not configured in app.js");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Sending…");

  try {
    const body = new URLSearchParams();
    Object.entries(data).forEach(([k, v]) =>
      body.append(k, Array.isArray(v) ? v.join(", ") : v)
    );
    await fetch(RSVP_ENDPOINT, { method: "POST", mode: "no-cors", body });
    showSuccess(data);
  } catch (err) {
    submitBtn.disabled = false;
    setStatus("Something went wrong — please try again, or write to us directly.", "err");
  }
});

function showSuccess(data) {
  const accepted = data.attending === "accepts";
  const rect = form.getBoundingClientRect();
  if (accepted && window.__burstPetals) {
    window.__burstPetals(rect.left + rect.width / 2, Math.max(80, rect.top + 120));
  }
  form.outerHTML = `
    <div class="form-success">
      <div class="seal small">囍</div>
      <h3>${accepted ? "We can't wait to celebrate with you" : "You will be missed"}</h3>
      <p>${
        accepted
          ? "Your RSVP has been received. A map to Raffles Sentosa is just above — see you on 20 February 2027."
          : "Thank you for letting us know. You'll be in our thoughts on the day."
      }</p>
      ${
        accepted
          ? '<p><a href="https://www.google.com/maps/search/?api=1&query=Raffles+Sentosa+Singapore" target="_blank" rel="noopener">Open the venue map →</a></p>'
          : ""
      }
    </div>`;
}
