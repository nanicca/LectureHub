/* =========================================================================
 *  app.js  —  data.js 내용을 화면에 그려주는 코드.
 *  보통은 수정할 필요 없습니다. (내용 수정은 data.js 에서)
 * ========================================================================= */

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// 외부 주소는 새 창, 강의 폴더 안 파일은 바로 내려받기
const isExternal = (url = "") => /^(https?:|mailto:|#)/i.test(url);

/* ---------- 메인 페이지 렌더 ---------- */
function renderIndex() {
  const d = 강의정보;

  setText("강의명", d.강의명);
  setText("부제", d.부제);
  setText("강의일자", d.강의일자);
  setText("소개", d.소개);

  // 강사 소개
  const tags = d.강사.소속.map((s) => `<span class="tag">${esc(s)}</span>`).join("");
  const blog = d.강사.블로그
    ? `<a class="blog" href="${esc(d.강사.블로그)}" target="_blank" rel="noopener">블로그 ↗</a>`
    : "";
  document.getElementById("강사").innerHTML = `
    <div class="name">${esc(d.강사.이름)} <span>강사</span></div>
    <div class="tags">${tags}</div>
    ${blog}`;

  // 차시 카드 (data.js 에서 잠금: true 인 차시는 눌리지 않습니다)
  document.getElementById("차시목록").innerHTML = d.차시
    .map((c) => {
      const 이름 = c.잠금 ? c.잠금제목 || `${c.번호}차시` : c.제목;
      const 속 = `
        <span class="num">${c.번호}</span>
        <h3>${esc(이름)}</h3>
        <p>${esc(c.잠금 ? "" : c.한줄설명 || "")}</p>`;
      return c.잠금
        ? `<div class="card locked" aria-disabled="true">${속}
             <span class="go">🔒 ${esc(c.잠금문구 || "준비 중")}</span>
           </div>`
        : `<a class="card" href="session.html?n=${c.번호}">${속}
             <span class="go">강의안 보기 →</span>
           </a>`;
    })
    .join("");

  // 자료
  const filesEl = document.getElementById("자료목록");
  if (!d.자료 || d.자료.length === 0) {
    document.getElementById("자료섹션").style.display = "none";
  } else {
    filesEl.innerHTML = d.자료
      .map((f) => {
        const 썸네일 = f.이미지 && !f.잠금
          ? `<img src="${esc(f.이미지)}" alt="QR" class="thumb">`
          : `<span class="ico">${f.잠금 ? "🔒" : "📄"}</span>`;
        return `
        <div class="file${f.잠금 ? " locked" : ""}"${f.잠금 ? ' aria-disabled="true"' : ""}>
          ${f.잠금 || !f.이미지
            ? 썸네일
            : `<a href="${esc(f.이미지)}" target="_blank" rel="noopener">${썸네일}</a>`}
          <div>
            <div class="name">${esc(f.이름)}</div>
            <div class="desc">${esc(f.설명 || "")}</div>
          </div>
          ${f.잠금
            ? `<span class="btn locked">🔒 ${esc(f.잠금문구 || "준비 중")}</span>`
            : isExternal(f.링크)
              ? `<a class="btn" href="${esc(f.링크)}" target="_blank" rel="noopener">${esc(f.버튼 || "다운로드")}</a>`
              : /\.(png|jpe?g|gif|svg|webp)$/i.test(f.링크)
                ? `<a class="btn" href="${esc(f.링크)}" target="_blank" rel="noopener">${esc(f.버튼 || "보기")}</a>`
                : `<a class="btn" href="${esc(f.링크)}" download>${esc(f.버튼 || "다운로드")}</a>`}
        </div>`;
      })
      .join("");
  }
}

/* ---------- 섹션 렌더 도우미 ---------- */

// 문자열 또는 문자열 배열 → 문단/목록 HTML
function renderBody(내용) {
  if (Array.isArray(내용)) {
    return `<ul>${내용.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  }
  return 내용 ? `<p>${esc(내용)}</p>` : "";
}

// 섹션 아래 붙는 강조 문장
function renderPoint(s) {
  return s.포인트 ? `<div class="point">${esc(s.포인트)}</div>` : "";
}

function renderSection(s, i) {
  let html = `<section class="block" id="sec-${i}">
    <h2>${esc(s.제목)}</h2>
    ${s.부제 ? `<p class="sub">${esc(s.부제)}</p>` : ""}`;

  if (s.type === "문단") {
    html += `<p>${esc(s.내용)}</p>`;
  }

  else if (s.type === "포인트") {
    html += `<div class="point">${esc(s.내용)}</div>`;
  }

  else if (s.type === "카드") {
    // 좌우로 나란히 놓는 카드. 열 수는 항목 수에 맞춰 자동(최대 4), 열: 로 지정 가능
    const cols = s.열 || Math.min(s.항목.length, 4);
    html += `<div class="grid cols-${cols}">${s.항목
      .map(
        (it, k) => `<div class="tile">
          ${s.번호 ? `<span class="tnum">${String(k + 1).padStart(2, "0")}</span>` : ""}
          <h3>${esc(it.제목)}</h3>
          ${renderBody(it.내용)}
          ${it.강조 ? `<div class="tile-note">${esc(it.강조)}</div>` : ""}
        </div>`
      )
      .join("")}</div>`;
  }

  else if (s.type === "흐름") {
    // 트리거 ▶ 노드 ▶ 노드
    html += `<div class="flow">${s.단계
      .map(
        (st, k) => `${k ? '<span class="arrow">▶</span>' : ""}
        <div class="node${k === 0 ? " first" : ""}">
          <div class="ntitle">${k === 0 ? "⚡ " : ""}${esc(st.제목)}</div>
          ${st.설명 ? `<div class="ndesc">${esc(st.설명)}</div>` : ""}
        </div>`
      )
      .join("")}</div>`;
  }

  else if (s.type === "표") {
    html += `<div class="tablewrap"><table><thead><tr>${s.헤더
      .map((h) => `<th>${esc(h)}</th>`)
      .join("")}</tr></thead><tbody>${s.행
      .map((r) => `<tr>${r.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`)
      .join("")}</tbody></table></div>`;
  }

  else if (s.type === "실습") {
    if (s.설명) html += `<p>${esc(s.설명)}</p>`;
    // 가로: true 면 프롬프트를 좌우로 배치
    const cols = s.가로 ? Math.min(s.프롬프트.length, 4) : 1;
    html += `<div class="prompts cols-${cols}">${s.프롬프트
      .map(
        (p) => `<div class="prompt">
          <span class="label">${esc(p.라벨 || "프롬프트")}</span>
          <pre>${esc(p.내용)}</pre>
          <button class="copy-btn" data-copy="${encodeURIComponent(p.내용)}">📋 복사</button>
        </div>`
      )
      .join("")}</div>`;
  }

  else if (s.type === "체크리스트") {
    html += `<ul class="checklist">${s.항목.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>`;
  }

  else if (s.type === "이미지") {
    const cols = s.열 || Math.min(s.항목.length, 3);
    html += `<div class="figs cols-${cols}${s.작게 ? " small" : ""}">${s.항목
      .map(
        (im) => `<figure>
          <a href="${esc(im.src)}" target="_blank" rel="noopener"><img src="${esc(im.src)}" alt="${esc(im.캡션 || "")}" loading="lazy"></a>
          ${im.캡션 ? `<figcaption>${esc(im.캡션)}</figcaption>` : ""}
        </figure>`
      )
      .join("")}</div>`;
  }

  else if (s.type === "링크") {
    if (s.설명) html += `<p>${esc(s.설명)}</p>`;
    html += `<div class="linkrow">${s.링크들
      .map((l) =>
        isExternal(l.주소) || /\.(png|jpe?g|gif|svg|webp)$/i.test(l.주소)
          ? `<a class="btn" href="${esc(l.주소)}" target="_blank" rel="noopener">${esc(l.이름)} ↗</a>`
          : `<a class="btn" href="${esc(l.주소)}" download>${esc(l.이름)} ⬇</a>`
      )
      .join("")}</div>`;
  }

  html += renderPoint(s) + `</section>`;
  return html;
}

/* ---------- 세션(강의안) 페이지 렌더 ---------- */
function renderSession() {
  const d = 강의정보;
  const n = parseInt(new URLSearchParams(location.search).get("n"), 10) || 1;
  const idx = d.차시.findIndex((c) => c.번호 === n);
  const c = d.차시[idx];

  const 표시제목 = c ? (c.잠금 ? c.잠금제목 || "" : c.제목) : "";
  document.title = `${표시제목} · ${d.강의명}`;

  if (!c) {
    document.getElementById("세션본문").innerHTML =
      '<p>해당 차시를 찾을 수 없습니다. <a href="index.html">목록으로</a></p>';
    return;
  }

  if (c.잠금) {
    document.getElementById("상단네비").innerHTML =
      '<a class="home" href="index.html">← 목록</a>';
    document.getElementById("세션히어로").innerHTML = `
      <div class="wrap">
        <div class="eyebrow">${n} · ${esc(d.강의명)}</div>
        <h1>🔒 ${esc(c.잠금문구 || "준비 중")}</h1>
      </div>`;
    document.getElementById("세션본문").innerHTML =
      '<p>아직 공개되지 않은 차시입니다. <a href="index.html">목록으로 돌아가기</a></p>';
    return;
  }

  // 상단 네비
  const nav = d.차시
    .map((x) =>
      x.잠금
        ? `<span class="lock">${x.번호} 🔒</span>`
        : `<a href="session.html?n=${x.번호}" class="${x.번호 === n ? "active" : ""}" title="${esc(x.제목)}">${x.번호}</a>`
    )
    .join("");
  document.getElementById("상단네비").innerHTML =
    `<a class="home" href="index.html">← 목록</a>` + nav;

  // 히어로
  document.getElementById("세션히어로").innerHTML = `
    <div class="wrap">
      <div class="eyebrow">${esc(d.강의명)}</div>
      <h1>${esc(c.제목)}</h1>
      <div class="meta">강사 ${esc(d.강사.이름)} · ${esc(d.강의일자)}</div>
    </div>`;

  let html = "";

  if (c.목표 && c.목표.length) {
    html += `<div class="goals"><h4>학습 목표</h4><ul>${c.목표
      .map((g) => `<li>${esc(g)}</li>`)
      .join("")}</ul></div>`;
  }

  const quick = (c.섹션 || [])
    .map((s, i) => `<a href="#sec-${i}">${esc(s.제목)}</a>`)
    .join("");
  if (quick) html += `<div class="quicknav">${quick}</div>`;

  (c.섹션 || []).forEach((s, i) => {
    html += renderSection(s, i);
  });

  // 이전/다음 (잠긴 차시로는 넘어가지 않습니다)
  const 열림 = (x) => (x && !x.잠금 ? x : null);
  const prev = 열림(d.차시[idx - 1]);
  const next = 열림(d.차시[idx + 1]);
  html += `<div class="pager">
    ${prev ? `<a href="session.html?n=${prev.번호}"><button class="btn ghost">← ${esc(prev.제목)}</button></a>` : `<span class="spacer"></span>`}
    ${next ? `<a href="session.html?n=${next.번호}"><button class="btn">${esc(next.제목)} →</button></a>` : `<span class="spacer"></span>`}
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
