/* app.js - KIT Lost & Found (client-side demo)
   Keys:
     - kit_lf_data  : JSON array of items
     - kit_lf_user  : {email}
     - kit_lf_theme : "light"|"dark"
*/

/* ---- helpers ---- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const LS = { DATA: 'kit_lf_data', USER: 'kit_lf_user', THEME: 'kit_lf_theme' };
const uid = () => 'id_' + Math.random().toString(36).slice(2,9);

function readData(){ try { return JSON.parse(localStorage.getItem(LS.DATA) || '[]'); } catch(e){ return []; } }
function writeData(d){ localStorage.setItem(LS.DATA, JSON.stringify(d)); }

/* seed on first load */
(function seed(){
  const existing = readData();
  if(existing.length) return;
  const now = Date.now();
  const sample = [
    { id: uid(), title: 'Black Wallet with KIT ID', category:'Wallet', status:'lost', date: new Date(now-2*86400000).toISOString().slice(0,10), location:'Library', contact:'student1@kit.edu', description:'Black wallet, KIT ID inside', images:[], claimed:false, owner:'student1@kit.edu', createdAt: now-172800000 },
    { id: uid(), title: 'Silver Laptop (Dell)', category:'Laptop', status:'found', date: new Date(now-1*86400000).toISOString().slice(0,10), location:'Cafeteria', contact:'security@kit.edu', description:'13" Dell w/ sticker', images:[], claimed:false, owner:'security@kit.edu', createdAt: now-86400000 },
    { id: uid(), title: 'iPhone 12 (Blue case)', category:'Phone', status:'found', date: new Date(now-3*86400000).toISOString().slice(0,10), location:'Gym', contact:'gym@kit.edu', description:'Blue case', images:[], claimed:false, owner:'reception@kit.edu', createdAt: now-259200000 }
  ];
  writeData(sample);
})();

/* ---- theme ---- */
(function initTheme(){
  const t = localStorage.getItem(LS.THEME) || 'light';
  setTheme(t);
  document.addEventListener('click', e => {
    if(e.target && e.target.id === 'themeToggle'){
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      setTheme(next);
      localStorage.setItem(LS.THEME, next);
    }
  });
})();
function setTheme(t){
  if(t === 'dark'){ document.documentElement.setAttribute('data-theme','dark'); if($('#themeToggle')) $('#themeToggle').textContent = '☀️'; }
  else { document.documentElement.removeAttribute('data-theme'); if($('#themeToggle')) $('#themeToggle').textContent = '🌙'; }
}

/* ---- render stats on home ---- */
function renderStats(){
  const data = readData();
  if($('#statLost')) $('#statLost').textContent = data.filter(i=>i.status==='lost').length;
  if($('#statFound')) $('#statFound').textContent = data.filter(i=>i.status==='found').length;
  if($('#statClaimed')) $('#statClaimed').textContent = data.filter(i=>i.claimed).length;
}

/* ---- render lists ---- */
function makeCard(item){
  const wrap = document.createElement('article');
  wrap.className = 'card';
  const img = document.createElement('img');
  img.src = item.images && item.images[0] ? item.images[0] : 'assets/kit-campus.jpg';
  img.alt = item.title;
  const body = document.createElement('div'); body.className = 'card-body';
  body.innerHTML = `<h3>${escapeHtml(item.title)}</h3>
    <p class="muted">${escapeHtml(item.description || '')}</p>
    <div style="display:flex;gap:10px;align-items:center;margin-top:8px">
      <span class="badge">${item.status.toUpperCase()}</span>
      <small class="muted">${item.location} • ${item.date || ''}</small>
    </div>
    <div style="margin-top:10px"><button class="btn" data-id="${item.id}" data-action="view">View</button></div>`;
  wrap.appendChild(img); wrap.appendChild(body);
  return wrap;
}
function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

function renderGrid(selector, filterStatus){
  const container = $(selector);
  if(!container) return;
  container.innerHTML = '';
  let data = readData().filter(d => d.status === filterStatus);
  if(data.length === 0){ container.innerHTML = '<p class="muted">No items found.</p>'; return; }
  data.forEach(item => container.appendChild(makeCard(item)));
}

/* attach view handlers (delegation) */
document.addEventListener('click', function(e){
  const btn = e.target.closest('button[data-action="view"]');
  if(btn){ const id = btn.getAttribute('data-id'); openDetail(id); }
});

/* ---- open detail modal (simple alert for demo) ---- */
function openDetail(id){
  const data = readData(); const item = data.find(x=>x.id===id);
  if(!item) return alert('Item not found');
  // simple detail modal: use window.confirm / alert for demo
  const lines = [`Title: ${item.title}`, `Category: ${item.category}`, `Status: ${item.status}`, `Location: ${item.location}`, `Date: ${item.date}`, `Contact: ${item.contact}`, `Description: ${item.description}`];
  alert(lines.join('\n'));
}

/* ---- page-specific boot ---- */
document.addEventListener('DOMContentLoaded', function(){
  renderStats();
  // lost page
  if($('#lostGrid')) {
    renderGrid('#lostGrid','lost');
    $('#searchLost')?.addEventListener('input', e => filterSearch('#lostGrid','lost', e.target.value, '#filterLostCategory'))
    $('#filterLostCategory')?.addEventListener('change', e => filterSearch('#lostGrid','lost', $('#searchLost')?.value || '', '#filterLostCategory'))
  //   fetch("/api/items/lost")
  // .then(res=>res.json())
  // .then(items=>{
  //   const container = document.getElementById("lostContainer");
  //   container.innerHTML = "";
  //   items.forEach(item=>{
  //     const card = document.createElement("div");
  //     card.classList.add("card");
  //     card.innerHTML = `
  //       <img src="${item.image}" alt="${item.name}">
  //       <div class="card-body">
  //         <h3>${item.name}</h3>
  //         <p>${item.description}</p>
  //         <p>Date: ${new Date(item.date).toLocaleDateString()}</p>
  //         <p>Contact: ${item.contact}</p>
  //       </div>`;
  //     container.appendChild(card);
  //   });
  // });

  }
  // found page
  if($('#foundGrid')) {
    renderGrid('#foundGrid','found');
    $('#searchFound')?.addEventListener('input', e => filterSearch('#foundGrid','found', e.target.value, '#filterFoundCategory'))
    $('#filterFoundCategory')?.addEventListener('change', e => filterSearch('#foundGrid','found', $('#searchFound')?.value || '', '#filterFoundCategory'))
  //   fetch("/api/items/found")
  // .then(res=>res.json())
  // .then(items=>{
  //   const container = document.getElementById("lostContainer");
  //   container.innerHTML = "";
  //   items.forEach(item=>{
  //     const card = document.createElement("div");
  //     card.classList.add("card");
  //     card.innerHTML = `
  //       <img src="${item.image}" alt="${item.name}">
  //       <div class="card-body">
  //         <h3>${item.name}</h3>
  //         <p>${item.description}</p>
  //         <p>Date: ${new Date(item.date).toLocaleDateString()}</p>
  //         <p>Contact: ${item.contact}</p>
  //       </div>`;
  //     container.appendChild(card);
  //   });
  // });

  }
  // report form
  if($('#reportForm')) {
    const preview = $('#preview');
    $('#itemImages')?.addEventListener('change', async function(e){
      preview.innerHTML=''; const files = Array.from(this.files).slice(0,3);
      for(const f of files){
        if(!f.type.startsWith('image/')) continue;
        if(f.size > 1.5*1024*1024){ const p = document.createElement('p'); p.className='muted'; p.textContent = f.name+' too large'; preview.appendChild(p); continue; }
        const d = await fileToDataURL(f); const im = document.createElement('img'); im.src = d; preview.appendChild(im);
      }
    });
    $('#reportForm').addEventListener('submit', function(ev){
      ev.preventDefault();
      const form = new FormData(this);
      const item = {
        id: uid(),
        title: form.get('title') || $('#itemTitle')?.value || '',
        category: form.get('category') || $('#itemCategory')?.value || '',
        status: form.get('status') || 'lost',
        date: form.get('date') || $('#itemDate')?.value || '',
        location: form.get('location') || $('#itemLocation')?.value || '',
        contact: form.get('contact') || $('#itemContact')?.value || '',
        description: form.get('description') || $('#itemDesc')?.value || '',
        images: Array.from($('#preview')?.querySelectorAll('img')||[]).map(i=>i.src),
        claimed:false, owner: (JSON.parse(localStorage.getItem(LS.USER)||'null')||{email:'anonymous'}).email, createdAt: Date.now()
      };
      if(!item.title || !item.category || !item.location || !item.contact){ $('#reportMsg').textContent = 'Please fill required fields.'; return; }
      const data = readData(); data.unshift(item); writeData(data);
      $('#reportMsg').textContent = 'Report submitted!';
      this.reset(); if($('#preview')) $('#preview').innerHTML = '';
      setTimeout(()=>{ $('#reportMsg').textContent=''; window.location.href = 'index.html'; }, 900);
    });
  }

  // login
  if($('#loginForm')) {
    const msg = $('#loginMsg');
    const logoutBtn = $('#logoutBtn');
    function refresh(){ const u = JSON.parse(localStorage.getItem(LS.USER)||'null'); if(u){ msg.textContent = 'Logged in as '+u.email; logoutBtn.style.display='inline-block'; } else { msg.textContent='Not logged in (demo)'; logoutBtn.style.display='none'; } }
    $('#loginForm').addEventListener('submit', function(ev){ ev.preventDefault(); const email = $('#loginEmail').value.trim(); if(!email){ $('#loginMsg').textContent='Enter email'; return;} localStorage.setItem(LS.USER, JSON.stringify({email})); refresh(); });
    logoutBtn?.addEventListener('click', ()=>{ localStorage.removeItem(LS.USER); refresh(); });
    refresh();
  }
  document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token); // ✅ Save token
    localStorage.setItem("email", email);      // optional: save email
    alert("Login successful!");
    window.location.href = "dashboard.html";  // redirect after login
  } else {
    alert(data.message);
  }
});


});

/* ---- helpers: search/filter + fileToDataURL ---- */
function filterSearch(selector, status, q='', categorySelector){
  const ql = q.trim().toLowerCase();
  const catSel = categorySelector ? document.querySelector(categorySelector) : null;
  const cat = catSel ? catSel.value : '';
  const data = readData().filter(i => i.status === status && ( !cat || i.category===cat ) && ( !ql || (i.title + ' ' + (i.description||'')).toLowerCase().includes(ql) ));
  const container = document.querySelector(selector);
  if(!container) return;
  container.innerHTML = '';
  if(data.length===0){ container.innerHTML = '<p class="muted">No items found.</p>'; return; }
  data.forEach(item=>container.appendChild(makeCard(item)));
}
function fileToDataURL(file){ return new Promise((res,rej)=>{ const fr = new FileReader(); fr.onload = ()=>res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); }); }