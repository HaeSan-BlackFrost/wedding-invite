/* ═══════════ Hae San & Kristal — invite behaviour ═══════════ */

/* ── CONFIG ─────────────────────────────────────────────────
   Paste your Google Apps Script "Web app" URL here once deployed
   (see README.md — takes ~3 minutes). Until then, submissions
   show a "not connected" notice instead of silently vanishing. */
const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbzf8PShympP_On1z-kndWyF_ONdiN3DUXXtzJh4WC7IuzDdxQv-VP5LIRB0UrhsDVIF/exec";

/* ── Three invite variants, one site ──
   The link's number decides which questions show:
     ?1 (or no number)  ·  no plus one, no children questions
     ?2                 ·  plus one, no children questions
     ?3                 ·  plus one and all children questions
   ?plusone is the old second link and behaves like ?3. */
const _q = new URLSearchParams(location.search);
const INVITE_VARIANT = (_q.has("3") || _q.has("plusone")) ? 3 : _q.has("2") ? 2 : 1;
const PLUS_ONE_ENABLED = INVITE_VARIANT >= 2;
const KIDS_ENABLED = INVITE_VARIANT === 3;

/* ── Language toggle: English ↔ Korean ── */
const KO = {
  heroEyebrow: "양가 가족과 함께",
  heroInvite: "저희 두 사람, 결혼합니다",
  heroHanja: '소중한 분을 초대합니다 <span class="dot">·</span> <span lang="zh">恭請光臨</span>',
  ctaRsvp: "참석 회신하기",
  cueScroll: "스크롤",
  storyEyebrow: "우리의 이야기",
  storyTitle: "우리가 걸어온 길",
  ch1d: "대학 시절 · 2018", ch1t: "첫 만남",
  ch1b: "2018년, 대학에서 처음 만났습니다. 친구로 시작했지만, 친구에서 연인 되기 정말 쉽지 않았어요!",
  ch2d: "2020년 12월", ch2t: "사랑에 빠지다",
  ch2b: "2년간 “그냥 친구”로 지내다가, 솔직해지기로 했습니다. 인생 최고의 결정!",
  ch3t: "함께한 시간들", ch3b: "6년 동안 서로 사랑하며 함께 성장했습니다.",
  ch4d: "2025년 11월", ch4t: "프러포즈",
  ch4b: "한국의 어느 추운 가을날, 아주 쉬웠던 “네” 한마디.",
  ch5t: "우리의 다음 장", ch5b: "저희의 가장 행복한 날, 함께해 주세요!",
  schedEyebrow: "예식 당일", schedTitle: "당일 순서",
  evTea: "다례식", tagTea: "Tea Ceremony",
  evSol: "혼인 서약식", tagSol: "Solemnization",
  evCt: "환영 리셉션", tagCt: "Cocktail Reception",
  evBq: "저녁 연회", tagBq: "Evening Banquet",
  descTea: "어른들께 전통 다례로 감사의 마음을 전합니다.",
  descSol: "센토사 바다를 배경으로, 수영장 옆에서 혼인 서약을 나눕니다.",
  descCt: "연회에 앞서 가벼운 음료와 환담의 시간을 가집니다.",
  descBq: "만찬과 축배, 밤늦게까지 이어지는 축하의 자리. 오후 6시 50분까지 착석 부탁드립니다.",
  venueEyebrow: "예식장 안내", venueTitle: "래플스 센토사, 싱가포르",
  btnMaps: "구글 지도에서 열기", btnCal: "캘린더에 추가",
  noteDressH: "복장 안내", noteDressB: "정장 차림을 부탁드립니다.",
  noteDriveH: "차량 이용", noteDriveB: "리조트 내 주차가 가능합니다. 차량을 이용하실 경우 RSVP에서 알려주시면 주차 공간을 준비하겠습니다.",
  noteGetH: "오시는 방법", noteGetB: "래플스 센토사는 센토사 게이트웨이를 통해 오실 수 있습니다. 택시와 차량 호출 모두 리조트 입구에서 하차하실 수 있습니다.",
  faqEyebrow: "안내 사항", faqTitle: "자주 묻는 질문",
  q1: "세 가지 순서에 모두 참석해야 하나요?",
  a1: "아닙니다. RSVP에서 참석하실 순서를 선택하실 수 있습니다. 다례식은 가족 중심의 자리이며, 혼인 서약식과 저녁 연회는 모든 하객을 위한 자리입니다.",
  q2: "주차가 가능한가요?",
  a2: "네, 래플스 센토사에 주차가 가능합니다. 차량 이용 여부를 RSVP에 알려주시면 공간을 준비하겠습니다.",
  q3: "몇 시까지 도착하면 되나요?",
  q3a: "다례식과 혼인 서약식은 오후 4시 30분부터 가든룸에서 등록이 시작되며, 연회 전 오후 6시 15분부터 환영 리셉션이 열립니다. 신랑신부 입장을 위해 오후 6시 50분까지 연회장에 착석 부탁드립니다.",
  q4: "언제까지 회신하면 되나요?",
  q4a: "좌석과 식사 준비를 위해 <strong>2026년 12월 20일</strong>까지 회신 부탁드립니다.",
  rsvpTitle: "함께해 주시겠어요?",
  rsvpDeadline: "2026년 12월 20일까지 회신 부탁드립니다",
  lName: '성함 <span class="req">*</span>', phName: "성함을 입력해 주세요",
  lEmail: '이메일 주소 <span class="req">*</span>',
  lSide: '어느 분의 하객이신가요? <span class="req">*</span>',
  oGroom: "신랑 측 · 해산", oBride: "신부 측 · 크리스탈",
  lAttend: '참석 여부 <span class="req">*</span>',
  oYes: "기쁘게 참석합니다", oNo: "아쉽지만 참석이 어렵습니다",
  lEvents: '참석하실 순서를 선택해 주세요 <span class="req">*</span>',
  oEvTea: "다례식 · 오후 5시", oEvSol: "혼인 서약식 · 오후 6시", oEvBq: "저녁 연회 · 오후 7시",
  lPlusOne: '동반인과 함께 오시나요? <span class="req">*</span>',
  oYesPlain: "네", oNoPlain: "아니요",
  lPoName: '동반인 성함 <span class="req">*</span>', phPoName: "동반인의 성함",
  lPoEmail: '동반인 이메일 주소 <span class="req">*</span>',
  lKids: '자녀와 함께 오시나요? <span class="req">*</span>',
  lKidsTotal: '자녀는 모두 몇 명인가요? <span class="req">*</span>',
  lKids13: '그중 12세 이하는 몇 명인가요? <span class="req">*</span>',
  hKids13: "12세 이하 어린이에게는 어린이 메뉴가 제공됩니다.",
  lKidNames: '자녀 이름 <span class="req">*</span>', phKidNames: "예: 지우, 하준",
  lDrive: '센토사까지 차량을 이용하시나요? <span class="req">*</span>',
  oDriveYes: "네, 운전해서 갑니다",
  hDrive: "리조트 주차 공간 준비에 도움이 됩니다.",
  lDiet: '식단 요청 <span class="optional">(선택)</span>', phDiet: "채식, 할랄, 알레르기 등",
  lMsg: '신랑신부에게 전하는 말 <span class="optional">(선택)</span>', phMsg: "축하의 한마디…",
  btnSend: "참석 여부 보내기",
  jsSending: "보내는 중…",
  jsNotConnected: "RSVP 접수가 아직 연결되지 않았습니다. 잠시 후 다시 시도해 주세요.",
  jsError: "문제가 발생했습니다. 다시 한번 시도해 주세요.",
  jsYesH: "함께해 주신다니 정말 기쁩니다",
  jsYesP: "RSVP가 접수되었습니다. 2027년 2월 20일, 래플스 센토사에서 뵙겠습니다.",
  jsNoH: "마음만으로도 감사합니다",
  jsNoP: "알려주셔서 감사합니다. 보내주신 마음, 소중히 간직하겠습니다.",
  e_name: "성함을 입력해 주세요.",
  e_email: "올바른 이메일 주소를 입력해 주세요.",
  e_side: "어느 분의 하객이신지 선택해 주세요.",
  e_attending: "참석 여부를 선택해 주세요.",
  e_events: "참석하실 순서를 선택해 주세요.",
  e_plusone: "동반인 동행 여부를 선택해 주세요.",
  e_poname: "동반인 성함을 입력해 주세요.",
  e_poemail: "동반인의 올바른 이메일 주소를 입력해 주세요.",
  e_children: "자녀 동행 여부를 선택해 주세요.",
  e_kidstotal: "자녀가 모두 몇 명인지 알려주세요.",
  e_kids13: "12세 이하 자녀가 몇 명인지 알려주세요.",
  e_kidnames: "자녀의 이름을 입력해 주세요.",
  e_driving: "차량 이용 여부를 선택해 주세요.",
};
let LANG = "en";
try { if (localStorage.getItem("lang") === "ko") LANG = "ko"; } catch (e) {}
const EN_CACHE = {};
function T(key, en) { return LANG === "ko" && KO[key] ? KO[key] : en; }
function applyLang(l) {
  LANG = l;
  try { localStorage.setItem("lang", l); } catch (e) {}
  document.documentElement.lang = l === "ko" ? "ko" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.dataset.i18n;
    if (!(k in EN_CACHE)) EN_CACHE[k] = el.innerHTML;
    if (KO[k]) el.innerHTML = l === "ko" ? KO[k] : EN_CACHE[k];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    const k = el.dataset.i18nPh;
    if (!(k in EN_CACHE)) EN_CACHE[k] = el.placeholder;
    if (KO[k]) el.placeholder = l === "ko" ? KO[k] : EN_CACHE[k];
  });
  document.querySelectorAll("#langToggle .lang-opt").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === (l === "ko" ? "ko" : "en"));
  });
  if (window.__renderCountdown) window.__renderCountdown();
}
(function initLang() {
  document.querySelectorAll("#langToggle .lang-opt").forEach((b) => {
    b.addEventListener("click", () => applyLang(b.dataset.lang));
  });
  if (LANG === "ko") applyLang("ko");
})();


/* ── Always open at the top of the journey ──
   The page is a linear story: gate → doors → garden → invitation. Browser
   scroll restoration (pull-to-refresh, in-app webviews reopening the tab)
   would otherwise drop returning guests mid-journey with the doors already
   open. Hash links (e.g. a shared #rsvp) are left alone. */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (!location.hash) {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  // some in-app webviews restore after the load event; re-assert the top
  // then, unless the guest has already started interacting
  let guestMoved = false;
  const noteMove = () => { guestMoved = true; };
  for (const ev of ["touchstart", "wheel", "keydown", "pointerdown"]) {
    window.addEventListener(ev, noteMove, { passive: true, once: true });
  }
  window.addEventListener("load", () => {
    if (!guestMoved && window.scrollY > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  });
}

/* ── Ambient snowfall (with the occasional plum petal) ── */
(function initSnow() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("snow");
  if (!canvas || reduced) return;
  const ctx = canvas.getContext("2d");
  let W, H, flakes, sized = false;
  window.__snowResize = () => resize();

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
    // Only size from a genuine measurement; a zero read must not be cached,
    // or the bitmap stays stretched for the life of the page.
    const w = window.innerWidth || document.documentElement.clientWidth || 0;
    const h = window.innerHeight || document.documentElement.clientHeight || 0;
    if (!w || !h) { sized = false; return; }
    sized = true;
    W = canvas.width = w;
    H = canvas.height = h;
    const count = Math.min(85, Math.round((W * H) / 22000));
    if (!flakes) {
      flakes = Array.from({ length: count }, () => makeFlake(false));
    } else if (flakes.length < count) {
      while (flakes.length < count) flakes.push(makeFlake(false));
    } else if (flakes.length > count) {
      flakes.length = count;   // mobile URL-bar resizes must not teleport the snow
    }
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("load", resize);
  requestAnimationFrame(resize);
  if (window.ResizeObserver) {
    new ResizeObserver(() => resize()).observe(document.documentElement);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // A zero-dimension first read leaves the canvas unsized and flakes unbuilt;
    // idle until a real measurement arrives rather than throwing.
    if (!sized || !flakes) { requestAnimationFrame(frame); return; }
    // deep in the journey the canvas is faded to near zero — clear once and
    // idle at 4Hz instead of stroking invisible flakes at full frame rate
    const faded = parseFloat(canvas.style.opacity || "1") < 0.08;
    if (faded && !flakes.some((f) => f.vx !== undefined)) {
      if (!frame.cleared) { ctx.clearRect(0, 0, W, H); frame.cleared = true; }
      if (!document.hidden) setTimeout(() => requestAnimationFrame(frame), 250);
      return;
    }
    frame.cleared = false;
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
    // the journey fades this canvas to near zero by the time the RSVP form is
    // reached — lift it for the burst, then hand the value back only after
    // the last petal has fallen (a fixed timer cut the celebration mid-air)
    const prev = canvas.style.opacity;
    canvas.style.transition = "opacity 0.6s";
    canvas.style.opacity = "1";
    window.__snowBurstActive = true;
    const started = performance.now();
    const settle = () => {
      const petalsLeft = flakes && flakes.some((f) => f.vx !== undefined);
      if (petalsLeft && performance.now() - started < 15000) {
        setTimeout(settle, 400);
        return;
      }
      canvas.style.opacity = prev;
      window.__snowBurstActive = false;
      setTimeout(() => { canvas.style.transition = ""; }, 700);
    };
    setTimeout(settle, 1500);
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
function renderCountdown() {
  const el = document.getElementById("countdown");
  if (!el) return;
  const target = new Date("2027-02-20T00:00:00+08:00");
  const days = Math.ceil((target - Date.now()) / 86400000);
  const ko = LANG === "ko";
  if (days > 1) el.textContent = ko ? "— 결혼식까지 " + days + "일 —" : "— " + days + " days from now —";
  else if (days === 1) el.textContent = ko ? "— 내일입니다 —" : "— tomorrow —";
  else if (days === 0) el.textContent = ko ? "— 오늘입니다 囍 —" : "— today 囍 —";
  else el.textContent = "";
}
window.__renderCountdown = renderCountdown;
renderCountdown();

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

// A preview pane can run this before the iframe has dimensions; a zero viewport
// used to make sliceScale 0 and s0 NaN, which the browser discards wholesale.
function vpW() { return window.innerWidth || document.documentElement.clientWidth || 900; }
function vpH() { return window.innerHeight || document.documentElement.clientHeight || 600; }
function isPortrait() {
  return vpH() > vpW() * 1.1;
}
function fitScene() {
  if (hanokSvg) hanokSvg.setAttribute("preserveAspectRatio", "xMidYMid slice");
}
fitScene();

let ticking = false;
const snowEl = document.getElementById("snow");
const petals = document.getElementById("petalDrift");
if (plaque) plaque.setAttribute("transform", "");

// Every SVG attribute write invalidates the raster even when the value is
// unchanged, so each per-frame write goes through this cache and rounded
// values — static stretches of the journey then cost nothing.
const frameCache = {};
function put(key, value, apply) {
  if (frameCache[key] === value) return;
  frameCache[key] = value;
  apply(value);
}
const r3 = (v) => Math.round(v * 1000) / 1000;

function renderScene() {
  ticking = false;
  if (!scene || !cam) return;
  const rect = scene.getBoundingClientRect();
  const vh = vpH();
  const total = rect.height - vh;
  const p = total > 0 ? clamp01(-rect.top / total) : 0;

  // 0 · the invitation drifts away as the journey begins
  const heroGone = r3(ease((p - 0.06) / 0.14));
  put("heroO", String(1 - heroGone), (v) => { openingHero.style.opacity = v; });
  put("heroT", "translateY(" + -60 * heroGone + "px)", (v) => { openingHero.style.transform = v; });
  if (openingCta) {
    put("ctaO", String(1 - heroGone), (v) => { openingCta.style.opacity = v; });
    put("ctaT", "translate(-50%, " + 40 * heroGone + "px)", (v) => { openingCta.style.transform = v; });
    put("ctaP", heroGone > 0.5 ? "none" : "auto", (v) => { openingCta.style.pointerEvents = v; });
  }
  if (scrollHint) put("hintO", String(1 - heroGone), (v) => { scrollHint.style.opacity = v; });
  if (scrollCue) put("cueO", String(1 - heroGone), (v) => { scrollCue.style.opacity = v; });
  if (plumBranch) put("plumO", String(r3(0.95 * (1 - ease((p - 0.24) / 0.2)))), (v) => { plumBranch.style.opacity = v; });

  // 2 · the approach — camera pushes in toward the doorway.
  // (450, fy) is the content point held at the viewport centre (450, 300).
  // frame the whole house (names live on its plaque now)
  const portrait = isPortrait();
  const vw = vpW();
  const sliceScale = Math.max(vw / 900, vh / 600);
  // portrait crops the roof tips so the house stands tall in frame
  const s0 = Math.min((vh / sliceScale) / (portrait ? 476 : 690), (vw / sliceScale) / (portrait ? 452 : 476));
  const zt = ease((p - 0.2) / 0.6);
  const s = Math.round((s0 + zt * zt * (5.6 - s0)) * 10000) / 10000;
  const fy0 = portrait ? 268 : 250;                 // tower centre, seated a touch low
  const fy = r3(fy0 + ease((p - 0.26) / 0.48) * (396 - fy0));

  // Vector camera, updated per frame. A compositor-texture zoom was tried
  // here and reverted: while the camera moves, engines show a scaled cached
  // texture and re-sharpen afterwards, which reads as blurry art mid-scroll.
  // Crisp every frame wins; the raster cost is kept in budget by the light
  // patterns, no filters/masks in the scene, and the write cache above.
  put("cam", "translate(450 300) scale(" + s + ") translate(-450 " + -fy + ")",
    (v) => { cam.setAttribute("transform", v); });

  // 1 · the walk — the couple crosses toward the steps (as originally authored:
  // plain world-space children of the camera, so the push-in grows them naturally)
  const walk = r3(ease((p - 0.14) / 0.36));
  const coupleOpacity =
    r3(clamp01((p - 0.14) / 0.08) * (1 - clamp01((p - 0.54) / 0.1)));
  put("walkT", "translate(" + (-150 + walk * 150) + " 0)", (v) => { sceneCouple.setAttribute("transform", v); });
  put("walkO", String(coupleOpacity), (v) => { sceneCouple.style.opacity = v; });

  // 3 · the doors slide open
  const d = r3(ease((p - 0.40) / 0.20) * 62);
  put("doorL", "translate(" + -d + " 0)", (v) => { doorL.setAttribute("transform", v); });
  put("doorR", "translate(" + d + " 0)", (v) => { doorR.setAttribute("transform", v); });

  // the garden's crane wings and drifting petals only animate while the
  // doors are apart and the golden wash has not swallowed the view
  if (hanokSvg) put("gardenLive", d > 0.5 && p < 0.94 ? "1" : "0",
    (v) => { hanokSvg.classList.toggle("garden-hidden", v === "0"); });

  // 4 · stepping into the light → memory lane
  // snow belongs outdoors: fade it as the camera enters the gateway
  if (snowEl && !window.__snowBurstActive) {
    const snowO = String(r3(1 - 0.95 * ease((p - 0.42) / 0.28)));
    if (snowEl.style.opacity !== snowO) snowEl.style.opacity = snowO;
  }
  if (petals) put("petalO", String(r3(clamp01((p - 0.44) / 0.16) * (1 - ease((p - 0.72) / 0.2)))),
    (v) => { petals.setAttribute("opacity", v); });
  put("washO", String(r3(ease((p - 0.72) / 0.2))), (v) => { hanokWash.style.opacity = v; });
  if (caption) put("captionV", p > 0.92 ? "1" : "0", (v) => { caption.classList.toggle("visible", v === "1"); });
}

// pause every ambient SVG animation while the journey is scrolled offstage —
// offscreen wing beats and window flicker otherwise keep the compositor busy
// all the way down at the RSVP form
if (hanokSvg && scene && "IntersectionObserver" in window) {
  new IntersectionObserver((entries) => {
    hanokSvg.classList.toggle("offstage", !entries[0].isIntersecting);
  }, { rootMargin: "60px" }).observe(scene);
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(renderScene);
  }
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reducedMotion) {
  void document.getElementById("hanokScene").getBoundingClientRect();
  renderScene();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { fitScene(); onScroll(); }, { passive: true });
  // rAF is suspended while the document is hidden, so re-render directly the
  // moment real dimensions or visibility arrive
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      renderScene();
      if (window.__snowResize) window.__snowResize();
    });
    ro.observe(scene);
    ro.observe(document.documentElement);
  }
  document.addEventListener("visibilitychange", () => {
    renderScene();
    if (window.__snowResize) window.__snowResize();
  }, { passive: true });
  renderScene();
}

/* ── RSVP form: conditional logic ── */
const form = document.getElementById("rsvpForm");
const attendingDetails = document.getElementById("attendingDetails");
const plusOneDetails = document.getElementById("plusOneDetails");
const plusOneBlock = document.getElementById("plusOneBlock");
if (PLUS_ONE_ENABLED && plusOneBlock) plusOneBlock.hidden = false;
const childrenBlock = document.getElementById("childrenBlock");
if (KIDS_ENABLED && childrenBlock) childrenBlock.hidden = false;
const childrenDetails = document.getElementById("childrenDetails");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("change", (e) => {
  if (e.target.name === "attending") {
    attendingDetails.hidden = e.target.value !== "accepts";
  }
  if (e.target.name === "children") {
    childrenDetails.hidden = e.target.value !== "yes";
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
  if (!data.fullName.trim()) errors.push(T("e_name", "your full name"));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push(T("e_email", "a valid email address"));
  if (!data.side) errors.push(T("e_side", "which side you are from"));
  if (!data.attending) errors.push(T("e_attending", "whether you are attending"));
  if (data.attending === "accepts") {
    if (data.events.length === 0) errors.push(T("e_events", "which parts of the day you'll join"));
    if (PLUS_ONE_ENABLED) {
      if (!data.plusOne) errors.push(T("e_plusone", "whether a plus one is joining"));
      if (data.plusOne === "yes") {
        if (!data.plusOneName.trim()) errors.push(T("e_poname", "your plus one's full name"));
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.plusOneEmail)) errors.push(T("e_poemail", "your plus one's email"));
      }
    }
    if (KIDS_ENABLED && !data.children) errors.push(T("e_children", "whether children are joining"));
    if (KIDS_ENABLED && data.children === "yes") {
      const total = parseInt(data.childrenCount, 10);
      const under13 = parseInt(data.childrenUnder13, 10);
      if (!(total > 0)) errors.push(T("e_kidstotal", "how many children are coming in total"));
      else if (!(under13 >= 0 && under13 <= total)) errors.push(T("e_kids13", "how many of them are aged 12 and below"));
      if (!data.childrenNames.trim()) errors.push(T("e_kidnames", "your children's names"));
    }
    if (!data.driving) errors.push(T("e_driving", "whether you'll be driving"));
  }
  return errors;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const data = {
    fullName: fd.get("fullName") || "",
    email: fd.get("email") || "",
    side: fd.get("side") || "",
    attending: fd.get("attending") || "",
    events: fd.getAll("events"),
    plusOne: PLUS_ONE_ENABLED ? (fd.get("plusOne") || "") : "not offered",
    plusOneName: fd.get("plusOneName") || "",
    plusOneEmail: fd.get("plusOneEmail") || "",
    children: KIDS_ENABLED ? (fd.get("children") || "") : "not offered",
    childrenCount: fd.get("childrenCount") || "",
    childrenUnder13: fd.get("childrenUnder13") || "",
    childrenNames: fd.get("childrenNames") || "",
    driving: fd.get("driving") || "",
    dietary: fd.get("dietary") || "",
    message: fd.get("message") || "",
    lang: LANG,
    submittedAt: new Date().toISOString(),
  };
  if (data.attending === "declines") {
    data.events = [];
    data.plusOne = data.plusOneName = data.plusOneEmail = data.driving = data.dietary = "";
    data.children = data.childrenCount = data.childrenUnder13 = data.childrenNames = "";
  }

  const errors = validate(data);
  if (errors.length) {
    setStatus(LANG === "ko" ? errors[0] : "Please share " + errors[0] + ".", "err");
    return;
  }

  if (!RSVP_ENDPOINT) {
    setStatus(T("jsNotConnected", "The RSVP box isn't connected yet — please check back shortly."), "err");
    console.warn("RSVP_ENDPOINT is not configured in app.js");
    return;
  }

  submitBtn.disabled = true;
  setStatus(T("jsSending", "Sending…"));

  try {
    const body = new URLSearchParams();
    Object.entries(data).forEach(([k, v]) =>
      body.append(k, Array.isArray(v) ? v.join(", ") : v)
    );
    await fetch(RSVP_ENDPOINT, { method: "POST", mode: "no-cors", body });
    showSuccess(data);
  } catch (err) {
    submitBtn.disabled = false;
    setStatus(T("jsError", "Something went wrong — please try again, or write to us directly."), "err");
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
      <h3>${accepted ? T("jsYesH", "We can't wait to celebrate with you") : T("jsNoH", "You will be missed")}</h3>
      <p>${accepted ? T("jsYesP", "Your RSVP has been received. A map to Raffles Sentosa is just above — see you on 20 February 2027.") : T("jsNoP", "Thank you for letting us know. You'll be in our thoughts on the day.")}</p>
      ${
        accepted
          ? '<p><a href="https://www.google.com/maps/search/?api=1&query=Raffles+Sentosa+Singapore" target="_blank" rel="noopener">Open the venue map →</a></p>'
          : ""
      }
    </div>`;
}
