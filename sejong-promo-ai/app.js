/* app.js — data.js 내용을 화면에 그리는 코드. 내용 수정은 data.js 에서 하세요. */
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const br = (s) => esc(s).replace(/\n/g, "<br>");
const mark = (s) => esc(s).replace(/\[([^\]\n]*)\]/g, '<span class="fill">[$1]</span>');
const ext = 'target="_blank" rel="noopener"';

const 설문박스 = (f) => `<section class="block"><h2>마지막 설문 조사</h2><a class="box survey" href="${esc(f.링크)}" ${ext}>
  <img src="${esc(f.이미지)}" alt="설문 조사 QR"><span class="txt"><b>${esc(f.이름)}</b><span>${esc(f.설명)}</span><span class="btn">설문 참여하기 ↗</span></span></a></section>`;

function renderIndex() {
  const d = 강의정보;
  document.getElementById("앱").innerHTML = `
  <header class="hero"><div class="wrap">
    <span class="date">${esc(d.강의일자)}</span>
    <h1>${br(d.강의명)}</h1>
    <p class="subtitle">${esc(d.부제)}</p>
    <p class="who">${esc(d.강사.소속)} <b>${esc(d.강사.이름)}</b>${d.강사.소개링크 ? ` <a href="${esc(d.강사.소개링크)}" ${ext}>강사 소개 ↗</a>` : ""}</p>
  </div></header>
  <div class="wrap">
    <section class="block"><h2>오전 강의</h2><div class="grid c3">${d.차시.map((c) => `
      <a class="box card" href="session.html?n=${c.번호}">
        <span class="pill">${esc(c.표시)}</span><h3>${esc(c.제목)}</h3><p>${esc(c.한줄설명)}</p><span class="go">열기 →</span></a>`).join("")}</div></section>
    ${d.오후.length ? `<section class="block"><h2>오후 강의</h2><div class="grid c5">${d.오후.map((o) => `
      <div class="box soft"><b class="no">${esc(o.번호)}</b><span>${esc(o.제목)}</span></div>`).join("")}</div></section>` : ""}
    <section class="block"><h2>바로가기</h2><div class="grid c3">${d.자료.map((f) => `
      <a class="box file" href="${esc(f.링크)}" ${ext}><span class="txt"><b>${esc(f.이름)}</b><span>${esc(f.설명)}</span></span><span class="arrow">↗</span></a>`).join("")}</div></section>
    ${d.설문 ? 설문박스(d.설문) : ""}
  </div>`;
}

const 그리기 = {
  카드: (s) => `<div class="grid c${s.칸 || 4}">${s.항목.map((k, i) => `
    <div class="box"><h3>${s.번호 === false ? "" : `<b class="no">${i + 1}</b>`}<span>${br(k.제목)}</span></h3><p>${br(k.내용)}</p></div>`).join("")}</div>`,
  흐름: (s) => `<div class="flow f${s.항목.length}">${s.항목.map((k, i) => `
    <div class="box"><b class="no">${i + 1}</b><h3>${br(k.제목)}</h3><p>${br(k.내용)}</p></div>`).join("")}</div>
    ${s.아래 ? `<div class="under">${그리기.카드({ 항목: s.아래, 칸: 2, 번호: false })}</div>` : ""}`,
  표: (s) => `<div class="tablewrap"><table><thead><tr>${s.헤더.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${s.행.map((r) => `<tr>${r.map((c) => `<td>${br(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
  체크리스트: (s) => `<ul class="checks grid c${s.칸 || 1}">${s.항목.map((t) => `<li><label class="box"><input type="checkbox"><span>${br(t)}</span></label></li>`).join("")}</ul>`,
  이미지: (s) => `<div class="grid c${s.항목.length}">${s.항목.map((k) => `<figure><a href="${esc(k.파일)}" ${ext}><img src="${esc(k.파일)}" alt="${esc(k.설명)}"></a><figcaption>${esc(k.설명)} · 누르면 크게 보기</figcaption></figure>`).join("")}</div>`,
  영상: (s) => `<div class="grid c${s.항목.length}">${s.항목.map((k) => `<figure><video src="${esc(k.파일)}" poster="${esc(k.표지)}" controls preload="none" playsinline></video><figcaption>${esc(k.설명)}</figcaption></figure>`).join("")}</div>`,
  실습: (s) => `${s.설명 ? `<p class="lead">${br(s.설명)}</p>` : ""}<div class="grid c${s.칸 || Math.min(s.프롬프트.length, 3)}">${s.프롬프트.map((p) => `
    <div class="prompt"><div class="phead"><span class="pill">${esc(p.라벨)}</span><button class="copy-btn" data-copy="${encodeURIComponent(p.내용)}">복사</button></div>
    <div class="ptext"><pre>${mark(p.내용)}</pre></div></div>`).join("")}</div>`,
};

function renderSession() {
  const d = 강의정보;
  const n = parseInt(new URLSearchParams(location.search).get("n"), 10) || 1;
  const idx = Math.max(0, d.차시.findIndex((x) => x.번호 === n));
  const c = d.차시[idx], prev = d.차시[idx - 1], next = d.차시[idx + 1];
  document.title = `${c.표시} · ${c.제목}`;
  document.getElementById("앱").innerHTML = `
  <nav class="topnav"><div class="wrap"><a href="index.html">← 처음</a>${d.차시.map((x) => `<a href="session.html?n=${x.번호}" class="${x === c ? "active" : ""}">${esc(x.표시)}</a>`).join("")}${d.패들렛 ? `<a href="${esc(d.패들렛)}" ${ext}>패들렛 ↗</a>` : ""}</div></nav>
  <header class="s-hero"><div class="wrap"><span class="pill">${esc(c.표시)}</span><h1>${esc(c.제목)}</h1><p>${esc(c.한줄설명)}</p></div></header>
  <div class="wrap">
    <div class="quick">${c.섹션.map((s, i) => `<a href="#s${i}">${esc(s.제목)}</a>`).join("")}</div>
    ${c.섹션.map((s, i) => `<section class="block" id="s${i}"><h2>${esc(s.제목)}${s.도구 ? `<span class="tool">${esc(s.도구)}</span>` : ""}</h2>${그리기[s.type](s)}
      ${s.덧붙임 ? `<div class="box band">${br(s.덧붙임)}</div>` : ""}
      ${s.링크 ? `<a class="btn" href="${esc(s.링크.주소)}" ${ext}>${esc(s.링크.라벨)} ↗</a>` : ""}
      ${s.출처 ? `<p class="src">${br(s.출처)}</p>` : ""}</section>`).join("")}
    <div class="pager">${prev ? `<a class="btn ghost" href="session.html?n=${prev.번호}">← ${esc(prev.표시)}</a>` : "<span></span>"}${next ? `<a class="btn" href="session.html?n=${next.번호}">${esc(next.표시)} →</a>` : `<a class="btn" href="index.html">처음으로</a>`}</div>
  </div>`;

  document.querySelectorAll(".copy-btn").forEach((b) => b.addEventListener("click", () => {
    const text = decodeURIComponent(b.dataset.copy);
    const ok = () => { b.textContent = "✓ 복사됨"; b.classList.add("done"); setTimeout(() => { b.textContent = "복사"; b.classList.remove("done"); }, 1800); };
    const old = () => {
      const t = document.createElement("textarea");
      t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { if (document.execCommand("copy")) ok(); } catch (e) {}
      t.remove();
    };
    navigator.clipboard && window.isSecureContext ? navigator.clipboard.writeText(text).then(ok, old) : old();
  }));
}
