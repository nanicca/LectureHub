/* app.js — data.js 내용을 화면에 그리는 코드. 고칠 필요 없습니다. */
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const $ = (id) => document.getElementById(id);
const items = (a, tag = "ul", cls = "list") => `<${tag} class="${cls}">${a.map((x) => `<li>${esc(x)}</li>`).join("")}</${tag}>`;
const block = (title, body) => `<section class="block"><h2>${esc(title)}</h2>${body}</section>`;
const meta = (d) => [d.강사 && `강사 ${d.강사}`, d.강의일자].filter(Boolean).map(esc).join(" · ");
const goals = (a) => (a && a.length ? block("목표", items(a, "ul", "list goal")) : "");

function renderIndex() {
  const d = 강의정보;
  document.title = d.강의명;
  const pdf = d.교안 && d.교안.파일
    ? `<a class="btn download" href="${esc(d.교안.파일)}" download="${esc(d.교안.저장이름)}">↓ ${esc(d.교안.버튼)}</a>` : "";
  $("머리").innerHTML = `<div class="wrap"><h1>${esc(d.강의명)}</h1>${meta(d) ? `<p>${meta(d)}</p>` : ""}${pdf}</div>`;
  let h = block("차시 목차", `<div class="cards">${d.차시.map((c) => `
    <a class="card" href="session.html?n=${c.번호}">
      <span class="num">${c.번호}차시</span>
      <h3>${esc(c.제목)}</h3>
      <p>${esc(c.한줄설명)}</p>
      <span class="go">열기 →</span>
    </a>`).join("")}</div>`);
  if (d.개요.length) h += block("강의 개요", `<dl class="facts">${d.개요.map((x) => `<div><dt>${esc(x.항목)}</dt><dd>${esc(x.내용)}</dd></div>`).join("")}</dl>`);
  h += goals(d.목표);
  if (d.준비물.length) h += block("준비물", items(d.준비물, "ul", "chips"));
  if (d.자료.length) h += block("강의 자료", `<div class="cards">${d.자료.map((f) => `
    <a class="card" href="${esc(f.링크)}" target="_blank" rel="noopener"><h3>${esc(f.이름)}</h3><p>${esc(f.설명)}</p><span class="go">${esc(f.버튼 || "열기")} →</span></a>`).join("")}</div>`);
  $("본문").innerHTML = h;
}

function renderSession() {
  const d = 강의정보;
  const n = Number(new URLSearchParams(location.search).get("n") || 1);
  const i = d.차시.findIndex((c) => c.번호 === n);
  const c = d.차시[i];
  $("상단네비").innerHTML = `<div class="inner"><a class="home" href="index.html">← 목차</a>${d.차시.map((x) =>
    `<a href="session.html?n=${x.번호}"${x === c ? ' class="active" aria-current="page"' : ""}>${x.번호}차시</a>`).join("")}</div>`;
  if (!c) { $("본문").innerHTML = '<p class="text">차시를 찾을 수 없습니다.</p>'; return; }
  document.title = `${n}차시 · ${c.제목}`;
  const on = document.querySelector(".topnav .active"), bar = document.querySelector(".topnav .inner");
  bar.scrollLeft = on.offsetLeft - bar.clientWidth / 2;
  $("머리").innerHTML = `<div class="wrap"><span class="num">${n}차시</span><h1>${esc(c.제목)}</h1>
    <p>${esc(c.한줄설명)}</p>${meta(d) ? `<p>${meta(d)}</p>` : ""}</div>`;
  const draw = {
    문단: (s) => `<p class="text">${esc(s.내용)}</p>`,
    목록: (s) => items(s.항목),
    순서: (s) => items(s.항목, "ol", "list steps")
  };
  const prev = d.차시[i - 1], next = d.차시[i + 1];
  $("본문").innerHTML = goals(c.목표) +
    c.섹션.map((s) => block(s.제목, draw[s.type] ? draw[s.type](s) : "")).join("") +
    `<div class="pager">
      ${prev ? `<a class="btn ghost" href="session.html?n=${prev.번호}">← ${prev.번호}차시</a>` : "<span></span>"}
      ${next ? `<a class="btn" href="session.html?n=${next.번호}">${next.번호}차시 →</a>` : '<a class="btn" href="index.html">목차로</a>'}
    </div>`;
}
