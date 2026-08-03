/* =========================================================================
 *  app.js  —  data.js 내용을 화면에 그려주는 코드.
 *  보통은 수정할 필요 없습니다. (내용 수정은 data.js 에서)
 * ========================================================================= */

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ---------- 메인 페이지 렌더 ---------- */
function renderIndex() {
  const d = 강의정보;

  // 제목·푸터·로고 (data.js에서 자동 생성)
  document.title = d.강의명;
  setFooter(d);
  setCornerLogo(d);

  // 헤더
  setText("강의명", d.강의명);
  setText("부제", d.부제);
  setText("강의일자", d.강의일자);
  setText("소개", d.소개);

  // 주최 기관 + 로고 (가비아)
  const hostEl = document.getElementById("주최");
  if (hostEl) {
    hostEl.innerHTML =
      (d.기관로고 ? `<img src="${esc(d.기관로고)}" alt="${esc(d.주최 || "")}" class="host-logo">` : "") +
      (d.주최 ? `<span>${esc(d.주최)}</span>` : "");
  }

  // 강사 소개
  const tags = d.강사.소속.map((s) => `<span class="tag">${esc(s)}</span>`).join("");
  const blog = d.강사.블로그
    ? `<a class="blog" href="${esc(d.강사.블로그)}" target="_blank" rel="noopener">블로그 ↗</a>`
    : "";
  document.getElementById("강사").innerHTML = `
    <div class="name">${esc(d.강사.이름)} <span>강사</span></div>
    <div class="tags">${tags}</div>
    ${blog}`;

  // 차시 카드
  document.getElementById("차시목록").innerHTML = d.차시
    .map(
      (c) => `
      <a class="card" href="session.html?n=${c.번호}">
        <span class="num">${c.번호}</span>
        <h3>${esc(c.제목)}</h3>
        <p>${esc(c.한줄설명 || "")}</p>
        <span class="go">강의안 보기 →</span>
      </a>`
    )
    .join("");

  // 자료
  const filesEl = document.getElementById("자료목록");
  if (!d.자료 || d.자료.length === 0) {
    document.getElementById("자료섹션").style.display = "none";
  } else {
    filesEl.innerHTML = d.자료
      .map((f) => {
        // 파일: 폴더 안 파일명이면 클릭 즉시 '바로 다운로드'(download 속성)
        // 링크: 외부 주소(패들렛 등)면 새 탭으로 이동
        const isFile = !!f.파일;
        const href = esc(isFile ? f.파일 : f.링크 || "#");
        // 저장명: 서버 파일명은 영문이라도 받을 때 이 이름(한글 가능)으로 저장됨
        const dl = f.저장명 ? ` download="${esc(f.저장명)}"` : " download";
        const attr = isFile
          ? `href="${href}"${dl}`
          : `href="${href}" target="_blank" rel="noopener"`;
        return `
        <div class="file">
          ${f.이미지
            ? `<a href="${esc(f.이미지)}" target="_blank" rel="noopener"><img src="${esc(f.이미지)}" alt="QR" style="width:76px;height:76px;border-radius:8px;object-fit:contain;background:#fff;border:1px solid var(--border)"></a>`
            : `<span class="ico">📄</span>`}
          <div>
            <div class="name">${esc(f.이름)}</div>
            <div class="desc">${esc(f.설명 || "")}</div>
          </div>
          <a class="btn" ${attr}>${esc(f.버튼 || (isFile ? "다운로드" : "열기"))}</a>
        </div>`;
      })
      .join("");
  }
}

/* ---------- 세션(강의안) 페이지 렌더 ---------- */
function renderSession() {
  const d = 강의정보;
  const n = parseInt(new URLSearchParams(location.search).get("n"), 10) || 1;
  const idx = d.차시.findIndex((c) => c.번호 === n);
  const c = d.차시[idx];

  document.title = `${n}차시 · ${c ? c.제목 : ""} · ${d.강의명}`;
  setFooter(d);
  setCornerLogo(d);

  if (!c) {
    document.getElementById("세션본문").innerHTML =
      '<p>해당 차시를 찾을 수 없습니다. <a href="index.html">목록으로</a></p>';
    return;
  }

  // 상단 네비 (전체 차시)
  const nav = d.차시
    .map(
      (x) =>
        `<a href="session.html?n=${x.번호}" class="${x.번호 === n ? "active" : ""}">${x.번호}차시</a>`
    )
    .join("");
  document.getElementById("상단네비").innerHTML =
    `<a class="home" href="index.html">← 목록</a>` + nav;

  // 히어로
  document.getElementById("세션히어로").innerHTML = `
    <div class="wrap">
      <div class="eyebrow">${n}차시 · ${esc(d.강의명)}</div>
      <h1>${esc(c.제목)}</h1>
      <div class="meta">강사 ${esc(d.강사.이름)} · ${esc(d.강의일자)}</div>
    </div>`;

  // 본문
  let html = "";

  // 학습목표
  if (c.목표 && c.목표.length) {
    html += `<div class="goals"><h4>학습 목표</h4><ul>${c.목표
      .map((g) => `<li>${esc(g)}</li>`)
      .join("")}</ul></div>`;
  }

  // 빠른 이동 바
  const quick = (c.섹션 || [])
    .map((s, i) => `<a href="#sec-${i}">${esc(s.제목)}</a>`)
    .join("");
  if (quick) html += `<div class="quicknav">${quick}</div>`;

  // 섹션들
  (c.섹션 || []).forEach((s, i) => {
    html += `<section class="block" id="sec-${i}"><h2>${esc(s.제목)}</h2>`;

    if (s.type === "문단") {
      html += `<p>${esc(s.내용)}</p>`;
    } else if (s.type === "표") {
      html += `<table><thead><tr>${s.헤더
        .map((h) => `<th>${esc(h)}</th>`)
        .join("")}</tr></thead><tbody>${s.행
        .map((r) => `<tr>${r.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table>`;
    } else if (s.type === "실습") {
      if (s.설명) html += `<p>${esc(s.설명)}</p>`;
      // 프롬프트가 2개 이상이면(연관 프롬프트) 가로 그리드, 1개면 전체 폭.
      // data.js에서 가로 배치를 강제/해제하려면 섹션에 가로:true/false 를 넣으세요.
      const multi =
        typeof s.가로 === "boolean" ? s.가로 : s.프롬프트.length > 1;
      html += `<div class="prompts${multi ? " multi" : ""}">`;
      s.프롬프트.forEach((p) => {
        html += `<div class="prompt">
          <span class="label">${esc(p.라벨 || "프롬프트")}</span>
          <pre>${esc(p.내용)}</pre>
          <button class="copy-btn" data-copy="${encodeURIComponent(p.내용)}">📋 복사</button>
        </div>`;
      });
      html += `</div>`;
    } else if (s.type === "체크리스트") {
      html += `<ul class="checklist">${s.항목
        .map((it) => `<li>${esc(it)}</li>`)
        .join("")}</ul>`;
    }

    html += `</section>`;
  });

  // 이전/다음
  const prev = d.차시[idx - 1];
  const next = d.차시[idx + 1];
  html += `<div class="pager">
    ${prev ? `<a href="session.html?n=${prev.번호}"><button class="btn ghost">← ${prev.번호}차시</button></a>` : `<span class="spacer"></span>`}
    ${next ? `<a href="session.html?n=${next.번호}"><button class="btn">${next.번호}차시 →</button></a>` : `<span class="spacer"></span>`}
  </div>`;

  document.getElementById("세션본문").innerHTML = html;

  // 복사 버튼 동작
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = decodeURIComponent(btn.dataset.copy);
      navigator.clipboard.writeText(text).then(() => {
        const old = btn.textContent;
        btn.textContent = "✓ 복사됨";
        btn.classList.add("done");
        setTimeout(() => {
          btn.textContent = old;
          btn.classList.remove("done");
        }, 1500);
      });
    });
  });
}

/* ---------- 공통 ---------- */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text || "";
}

// 푸터: "© <연도> <강사명> · <강의명>" — data.js 값으로 자동 생성
function setFooter(d) {
  const el = document.getElementById("푸터");
  if (!el) return;
  const year = (String(d.강의일자 || "").match(/\d{4}/) || ["2026"])[0];
  el.textContent = `© ${year} ${d.강사.이름} · ${d.강의명}`;
}

// 우측 상단 고정 로고 (한국강사교육협회) — 파일이 없으면 자동 숨김
function setCornerLogo(d) {
  const el = document.getElementById("협회로고");
  if (!el) return;
  if (!d.협회로고) { el.style.display = "none"; return; }
  el.innerHTML = `<img src="${esc(d.협회로고)}" alt="한국강사교육협회">`;
  if (d.강사 && d.강사.블로그) {
    el.href = d.강사.블로그;
    el.target = "_blank";
    el.rel = "noopener";
  }
}
