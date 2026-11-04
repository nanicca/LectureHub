/* =========================================================================
 *  app.js  —  화면 그리기 + 세로 스크롤 메뉴 + 프롬프트 복사 (수정 불필요)
 *  내용은 data.js에서만 고치세요.
 * ========================================================================= */

(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const link = (l) => (l === "패들렛" ? 강의.패들렛 : l);
  const prompts = [];

  /* ---------- 블록 그리기 ---------- */
  function block(b) {
    switch (b.종류) {
      case "단계":
        return `<div class="steps${b.열 ? " row" : ""}">${b.항목.map((it, i) => `
          <div class="step"><span class="num">${i + 1}</span>
            <div><b>${esc(it[0])}</b>${it[1] ? `<p>${esc(it[1])}</p>` : ""}</div></div>`).join("")}</div>`;
      case "카드":
        return `<div class="cards" style="grid-template-columns:repeat(${b.열 || 3},1fr)">${b.항목.map((it, i) => {
          const head = b.번호 ? `<span class="num">${i + 1}</span>` : b.체크 ? `<span class="chk">✓</span>` : "";
          const body = `${head}<b>${esc(it[0])}</b>${it[1] ? `<p>${esc(it[1])}</p>` : ""}`;
          return b.이동 && it[2]
            ? `<button class="card link" type="button" data-sec="${esc(it[2])}">${body}</button>`
            : `<div class="card">${body}</div>`;
        }).join("")}</div>`;
      case "비교":
        return `<div class="compare">${b.항목.map((c) => `
          <div class="cbox ${c.톤 === "좋음" ? "good" : c.톤 === "나쁨" ? "bad" : ""}">
            <h4>${esc(c.제목)}</h4><ul>${c.목록.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>`;
      case "목록":
        return `<div class="listbox">${b.제목 ? `<h4>${esc(b.제목)}</h4>` : ""}<ul>${b.목록.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
      case "막대":
        return `<div class="bars${b.클릭공개 ? " hold" : ""}"><h4>${esc(b.제목)}</h4>
          ${b.클릭공개 ? `<div class="cover-q"><p>${esc(b.질문 || "뒤에 올 말을 맞혀 보세요")}</p>
            <button class="lbtn" type="button" data-reveal>결과 보기 ▶</button></div>` : ""}${b.항목.map((it, i) => `
          <div class="bar${i === 0 ? " first" : ""}" style="--d:${(0.2 + i * 0.18).toFixed(2)}s"><span>${esc(it[0])}</span><div class="tr"><div class="fill" style="--w:${it[1]}%"></div></div><em data-n="${it[1]}">${it[1]}%</em></div>`).join("")}
          ${b.주석 ? `<small>${esc(b.주석)}</small>` : ""}</div>`;
      case "프롬프트": {
        const id = prompts.push(b.내용) - 1;
        return `<div class="prompt"><div class="prompt-head"><span>${esc(b.라벨 || "프롬프트")}</span>
          <button class="copy" type="button" data-p="${id}">복사</button></div><pre>${esc(b.내용)}</pre></div>`;
      }
      case "버튼":
        return `<div class="btns"><a class="lbtn" href="${esc(link(b.링크))}" target="_blank" rel="noopener">${esc(b.라벨)} ↗</a></div>`;
      default:
        return "";
    }
  }

  function body(p) {
    const bl = p.블록 || [];
    if (p.단 === 2 && bl.length > 1) {
      const cols = p.비율 ? ` style="grid-template-columns:${p.비율}"` : "";
      if (bl.every((b) => b.종류 === "프롬프트") && bl.length > 2) {
        return `<div class="grid2"${cols}>${bl.map(block).join("")}</div>`;
      }
      return `<div class="grid2"${cols}><div class="col">${block(bl[0])}</div><div class="col">${bl.slice(1).map(block).join("")}</div></div>`;
    }
    return `<div class="stack">${bl.map(block).join("")}</div>`;
  }

  function pageHTML(p) {
    if (p.유형 === "표지") {
      return `<section class="page cover"><div class="inner">
        <div class="cover-top">
          ${강의.로고 ? `<span class="logo-badge"><img src="${esc(강의.로고)}" alt="학교 로고"></span>` : ""}
          <span class="org">${esc(강의.기관)}</span>
        </div>
        <h1>${esc(강의.제목).replace("생성형 AI", "<em>생성형 AI</em>")}</h1>
        <p class="sub">${esc(강의.부제)}</p>
        <p class="meta">${esc(강의.강사)} · ${esc(강의.일자)}</p>
        <div class="btns">
          <a class="lbtn" href="${esc(강의.패들렛)}" target="_blank" rel="noopener">패들렛 열기 ↗</a>
          ${강의.강사소개 ? `<a class="lbtn ghost" href="${esc(강의.강사소개)}" target="_blank" rel="noopener">👩‍🏫 강사 소개 ↗</a>` : ""}
          <button class="lbtn ghost" type="button" data-go="1">시작하기 ↓</button>
        </div>
        <p class="hint">아래로 스크롤해서 보세요 · 오른쪽 위 ☰ 목차</p>
      </div></section>`;
    }
    if (p.유형 === "구분") {
      return `<section class="page divider"><div class="inner">
        <div class="dk">${esc(p.머리)}</div><h2>${esc(p.제목)}</h2>${p.설명 ? `<p>${esc(p.설명)}</p>` : ""}
        ${p.버튼 ? `<div class="btns"><a class="lbtn" href="${esc(link(p.버튼.링크))}" target="_blank" rel="noopener">${esc(p.버튼.라벨)} ↗</a></div>` : ""}
      </div></section>`;
    }
    return `<section class="page"><div class="inner">
      ${p.머리 ? `<span class="kicker">${esc(p.머리)}</span>` : ""}
      <h2 class="title">${esc(p.제목)}</h2>
      ${body(p)}
      ${p.메모 ? `<div class="note">${esc(p.메모)}</div>` : ""}
    </div></section>`;
  }

  /* ---------- 화면 구성 ---------- */
  const track = $("#track");
  track.innerHTML = 페이지.map(pageHTML).join("");
  const pages = [...track.children];
  const N = pages.length;
  $("#homeBtn").innerHTML = `${강의.로고 ? `<img src="${esc(강의.로고)}" alt="">` : ""}<span>${esc(강의.제목)}</span>`;
  document.title = `${강의.제목} · ${강의.기관}`;

  const firstOf = {};
  페이지.forEach((p, i) => { if (!(p.섹션 in firstOf)) firstOf[p.섹션] = i; });
  $("#tabs").innerHTML = 섹션.filter((s) => s.id in firstOf)
    .map((s) => `<button class="tab" type="button" data-sec="${s.id}">${esc(s.이름)}</button>`).join("");

  const pageName = (p) => (p.유형 === "표지" ? "표지" : String(p.제목).replace(/\n/g, " "));
  $("#tocBody").innerHTML = 섹션.filter((s) => s.id in firstOf).map((s) => `
    <div class="toc-sec">${esc(s.이름)}</div>
    ${페이지.map((p, i) => (p.섹션 === s.id ? `<button class="toc-item" type="button" data-go="${i}"><i>${i + 1}</i>${esc(pageName(p))}</button>` : "")).join("")}`).join("");

  /* ---------- 막대그래프 나타나기 ----------
   * 클릭공개 그래프: 처음엔 질문만 보이고, [결과 보기]·→ 키를 누르면 나타남
   * 화면 밖으로 완전히 나가면 처음 상태로 돌아감 */
  const waiting = (pg) => !!pg.querySelector(".bars.hold") && !pg.classList.contains("active");
  function resetBars(pg) {
    pg.classList.remove("active");
    pg.querySelectorAll(".bar em[data-n]").forEach((el) => (el.textContent = "0%"));
  }
  function reveal(pg) {
    const nums = pg.querySelectorAll(".bar em[data-n]");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      pg.classList.add("active");
      nums.forEach((el, i) => {
        const to = +el.dataset.n, delay = 200 + i * 180, dur = 1100;
        const t0 = performance.now() + delay;
        const tick = (t) => {
          const k = Math.min(1, Math.max(0, (t - t0) / dur));
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + "%";
          if (k < 1 && pg.classList.contains("active")) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }));
  }
  const barPages = pages.filter((pg) => pg.querySelector(".bars"));
  barPages.forEach(resetBars);
  const barWatch = new IntersectionObserver((list) => list.forEach((en) => {
    const pg = en.target;
    if (!en.isIntersecting) resetBars(pg);
    else if (en.intersectionRatio >= 0.35 && !pg.querySelector(".bars.hold") && !pg.classList.contains("active")) reveal(pg);
  }), { threshold: [0, 0.35] });
  barPages.forEach((pg) => barWatch.observe(pg));
  /* 화면에 전부 보이면서 결과를 기다리는 그래프 */
  const waitingInView = () => barPages.find((pg) => {
    const r = pg.querySelector(".bars").getBoundingClientRect();
    return waiting(pg) && r.top >= $(".topbar").offsetHeight && r.bottom <= innerHeight;
  });

  /* ---------- 이동 ---------- */
  let cur = 0, curSec = null, hashTimer;
  function go(i, instant) {
    i = Math.max(0, Math.min(N - 1, i));
    pages[i].scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
  }

  /* 스크롤 위치에 맞춰 메뉴·진행 막대 표시 */
  function spy() {
    const line = $(".topbar").offsetHeight + 80;
    const max = document.documentElement.scrollHeight - innerHeight;
    let c = 0;
    pages.forEach((pg, k) => { if (pg.getBoundingClientRect().top <= line) c = k; });
    if (scrollY >= max - 2) c = N - 1;
    $("#progressBar").style.width = `${max > 0 ? Math.min(100, (scrollY / max) * 100) : 100}%`;
    if (c === cur && curSec) return;
    cur = c;
    document.querySelectorAll(".toc-item").forEach((t) => t.classList.toggle("on", +t.dataset.go === cur));
    const sec = 페이지[cur].섹션;
    if (sec !== curSec) {
      curSec = sec;
      document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("on", t.dataset.sec === sec));
      const tabs = $("#tabs"), on = tabs.querySelector(".tab.on");
      if (on) tabs.scrollLeft = on.offsetLeft - (tabs.clientWidth - on.offsetWidth) / 2;
    }
    clearTimeout(hashTimer);
    hashTimer = setTimeout(() => history.replaceState(null, "", `#${cur + 1}`), 200);
  }
  let spyQueued = false;
  const queueSpy = () => {
    if (spyQueued) return;
    spyQueued = true;
    requestAnimationFrame(() => { spyQueued = false; spy(); });
  };
  window.addEventListener("scroll", queueSpy, { passive: true });

  const next = () => {
    const w = waitingInView();
    if (w) reveal(w); else go(cur + 1);
  };
  $("#homeBtn").onclick = () => go(0);

  const toc = $("#toc");
  $("#tocBtn").onclick = () => { toc.hidden = false; const on = toc.querySelector(".toc-item.on"); if (on) on.scrollIntoView({ block: "center" }); };
  $("#tocClose").onclick = () => (toc.hidden = true);
  toc.onclick = (e) => { if (e.target === toc) toc.hidden = true; };

  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]");
    if (g) { toc.hidden = true; go(+g.dataset.go); return; }
    const s = e.target.closest("[data-sec]");
    if (s) { go(firstOf[s.dataset.sec]); return; }
    const h = e.target.closest("[data-reveal], .bars.hold");
    if (h && waiting(h.closest(".page"))) { reveal(h.closest(".page")); return; }
    const c = e.target.closest(".copy");
    if (c) copy(prompts[+c.dataset.p], c);
  });

  /* 키보드·발표 리모컨: → 다음 내용, ← 이전 내용 (↑ ↓ 는 일반 스크롤) */
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest("input, textarea")) return;
    if (e.key === "Escape") { toc.hidden = true; return; }
    if (!toc.hidden) return;
    if (["ArrowRight", "PageDown"].includes(e.key)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(cur - 1); }
    else if (e.key === " " && !e.target.closest("button, a")) {
      const w = waitingInView();
      if (w) { e.preventDefault(); reveal(w); }
    }
  });

  /* ---------- 복사 ---------- */
  function copy(text, btn) {
    const done = () => {
      btn.textContent = "복사됨 ✓"; btn.classList.add("done");
      const t = $("#toast"); t.classList.add("show");
      setTimeout(() => { btn.textContent = "복사"; btn.classList.remove("done"); t.classList.remove("show"); }, 1600);
    };
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (_) {}
      ta.remove(); done();
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }

  /* ---------- 시작 ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const hashPage = () => parseInt(location.hash.slice(1), 10);
  const start = hashPage();
  const toStart = () => { if (Number.isFinite(start) && start > 1) go(start - 1, true); };
  toStart();
  spy();
  if (document.fonts) document.fonts.ready.then(() => { if (cur === start - 1) toStart(); });
  window.addEventListener("hashchange", () => {
    const n = hashPage();
    if (Number.isFinite(n) && n - 1 !== cur) go(n - 1, true);
  });
  window.addEventListener("resize", queueSpy);
})();
