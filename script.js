/* ========== CUSTOM CURSOR ========== */
const cursor = document.querySelector('.cursor');
const ring = document.querySelector('.cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cursor.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;
});
function loopRing(){
  rx+=(mx-rx)*.18;ry+=(my-ry)*.18;
  ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(loopRing);
}
loopRing();
function addHover(els){
  els.forEach(el=>{
    el.addEventListener('mouseenter',()=>{cursor.classList.add('hover');ring.classList.add('hover');});
    el.addEventListener('mouseleave',()=>{cursor.classList.remove('hover');ring.classList.remove('hover');});
  });
}
addHover(document.querySelectorAll('a, button, .work-item, .step, .cap-card, .journal-card, .team-card, .cta-btn, .nav-cta, .logo'));

/* ========== MOBILE MENU ========== */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
hamburger.addEventListener('click',()=>{
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});
document.querySelectorAll('.mobile-nav-link').forEach(a=>{
  a.addEventListener('click',()=>{
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow='';
  });
});

/* ========== SCROLL REVEAL ========== */
const revealObs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('in-view');revealObs.unobserve(e.target);}
  });
},{threshold:0.1,rootMargin:'0px 0px -60px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revealObs.observe(el));

/* ========== COUNTER ANIMATION ========== */
function animateCounter(el){
  const target=parseInt(el.dataset.count);
  const duration=1800;
  const start=performance.now();
  function tick(now){
    const p=Math.min((now-start)/duration,1);
    const ease=1-Math.pow(1-p,4);
    el.textContent=Math.round(ease*target);
    if(p<1)requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counterObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){animateCounter(e.target);counterObs.unobserve(e.target);}
  });
},{threshold:0.5});
document.querySelectorAll('[data-count]').forEach(el=>counterObs.observe(el));

/* ========== HERO PRISM CANVAS ========== */
(function(){
  const c=document.getElementById('prism-canvas');
  const ctx=c.getContext('2d');
  let W,H,DPR;
  function resize(){
    DPR=Math.min(window.devicePixelRatio||1,2);
    W=c.width=c.parentElement.offsetWidth*DPR;
    H=c.height=c.parentElement.offsetHeight*DPR;
    c.style.width=c.parentElement.offsetWidth+'px';
    c.style.height=c.parentElement.offsetHeight+'px';
  }
  window.addEventListener('resize',resize);resize();

  const N=180;const pts=[];
  for(let i=0;i<N;i++){
    const t=Math.random()*Math.PI*2;
    const r=180+Math.random()*120;
    const z=(Math.random()-.5)*400;
    pts.push({
      a:t,r:r*DPR,z:z*DPR,
      ox:(Math.random()-.5)*40*DPR,
      oy:(Math.random()-.5)*40*DPR,
      speed:.0005+Math.random()*.001,
      hue:Math.random()
    });
  }
  let mxn=0,myn=0,tmx=0,tmy=0;
  document.addEventListener('mousemove',e=>{
    tmx=(e.clientX/window.innerWidth-.5)*2;
    tmy=(e.clientY/window.innerHeight-.5)*2;
  });
  let t=0;
  function draw(){
    t+=1;mxn+=(tmx-mxn)*.05;myn+=(tmy-myn)*.05;
    ctx.clearRect(0,0,W,H);
    const cx=W/2,cy=H/2;
    const rotY=t*.002+mxn*.4;
    const rotX=mxn*.2+myn*.2;
    const proj=pts.map(p=>{
      const a=p.a+t*p.speed;
      let x=Math.cos(a)*p.r+p.ox;
      let z=Math.sin(a)*p.r+p.z;
      let y=Math.sin(a*2)*40*DPR+p.oy;
      const cosY=Math.cos(rotY),sinY=Math.sin(rotY);
      const x2=x*cosY-z*sinY,z2=x*sinY+z*cosY;
      const cosX=Math.cos(rotX),sinX=Math.sin(rotX);
      const y2=y*cosX-z2*sinX,z3=y*sinX+z2*cosX;
      const persp=600*DPR/(600*DPR+z3);
      return {x:cx+x2*persp,y:cy+y2*persp,s:persp,z:z3,hue:p.hue};
    }).sort((a,b)=>a.z-b.z);
    ctx.lineWidth=.6*DPR;
    for(let i=0;i<proj.length;i++){
      const a=proj[i];
      for(let j=i+1;j<i+5&&j<proj.length;j++){
        const b=proj[j];
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<140*DPR){
          const alpha=(1-d/(140*DPR))*.18*Math.min(a.s,b.s);
          ctx.strokeStyle=hueColor((a.hue+b.hue)/2,alpha);
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
    }
    for(const p of proj){
      const r=1.5*DPR*p.s*1.4;
      const col=hueColor(p.hue,.9*p.s);
      const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*8);
      grd.addColorStop(0,col);grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grd;ctx.beginPath();ctx.arc(p.x,p.y,r*8,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,'+(.85*p.s)+')';
      ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  function hueColor(h,a){
    const stops=[[255,94,168],[124,92,255],[62,199,255],[91,255,183],[255,209,102]];
    const pos=h*(stops.length-1);
    const i=Math.floor(pos);const f=pos-i;
    const c1=stops[i],c2=stops[Math.min(i+1,stops.length-1)];
    return `rgba(${Math.round(c1[0]+(c2[0]-c1[0])*f)},${Math.round(c1[1]+(c2[1]-c1[1])*f)},${Math.round(c1[2]+(c2[2]-c1[2])*f)},${a})`;
  }
  draw();
})();

/* ========== PROCESS 3D ICOSAHEDRON ========== */
(function(){
  const c=document.getElementById('object3d');
  const ctx=c.getContext('2d');
  let W,H,DPR;
  function resize(){
    DPR=Math.min(window.devicePixelRatio||1,2);
    W=c.width=c.parentElement.offsetWidth*DPR;
    H=c.height=c.parentElement.offsetHeight*DPR;
    c.style.width=c.parentElement.offsetWidth+'px';
    c.style.height=c.parentElement.offsetHeight+'px';
  }
  window.addEventListener('resize',resize);resize();

  const phi=(1+Math.sqrt(5))/2;
  let verts=[
    [-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],
    [0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],
    [phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]
  ];
  verts=verts.map(v=>{const l=Math.hypot(...v);return v.map(x=>x/l);});
  const faces=[
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
  ];
  let t=0;
  function draw(){
    t+=1;ctx.clearRect(0,0,W,H);
    const cx=W/2,cy=H/2;
    const scale=Math.min(W,H)*0.32;
    const rotY=t*.004,rotX=t*.002+Math.sin(t*.001)*.3;
    const proj=verts.map(v=>{
      let [x,y,z]=v;
      let cs=Math.cos(rotY),sn=Math.sin(rotY);
      let x2=x*cs-z*sn,z2=x*sn+z*cs;
      cs=Math.cos(rotX);sn=Math.sin(rotX);
      let y2=y*cs-z2*sn,z3=y*sn+z2*cs;
      const persp=4/(4+z3);
      return {x:cx+x2*scale*persp,y:cy+y2*scale*persp,z:z3,s:persp};
    });
    const fz=faces.map((f,i)=>({i,z:(proj[f[0]].z+proj[f[1]].z+proj[f[2]].z)/3,f}));
    fz.sort((a,b)=>a.z-b.z);
    fz.forEach(({f,z})=>{
      const a=proj[f[0]],b=proj[f[1]],c2=proj[f[2]];
      const ax=b.x-a.x,ay=b.y-a.y,bx=c2.x-a.x,by=c2.y-a.y;
      if(ax*by-ay*bx<0)return;
      ctx.beginPath();
      ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c2.x,c2.y);ctx.closePath();
      const depth=(z+1)/2;
      const grd=ctx.createLinearGradient(a.x,a.y,c2.x,c2.y);
      grd.addColorStop(0,`rgba(124,92,255,${.04+depth*.08})`);
      grd.addColorStop(.5,`rgba(62,199,255,${.06+depth*.1})`);
      grd.addColorStop(1,`rgba(255,94,168,${.04+depth*.08})`);
      ctx.fillStyle=grd;ctx.fill();
      ctx.strokeStyle=`rgba(255,255,255,${.15+depth*.45})`;
      ctx.lineWidth=.8*DPR;ctx.stroke();
    });
    proj.forEach(p=>{
      const r=3*DPR*p.s;
      const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*6);
      grd.addColorStop(0,'rgba(62,199,255,.9)');grd.addColorStop(1,'rgba(62,199,255,0)');
      ctx.fillStyle=grd;ctx.beginPath();ctx.arc(p.x,p.y,r*6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ========== WORK PREVIEW ========== */
(function(){
  const preview=document.getElementById('workPreview');
  const items=document.querySelectorAll('.work-item');
  const gradients={
    aurora:'linear-gradient(135deg,#0a1a2f,#3ec7ff,#7c5cff)',
    meridian:'linear-gradient(135deg,#1a0f24,#ff5ea8,#ffd166)',
    vessel:'linear-gradient(135deg,#0f1a14,#5bffb7,#3ec7ff)',
    halcyon:'linear-gradient(135deg,#1a1a2f,#7c5cff,#3ec7ff)',
    oki:'linear-gradient(135deg,#2a1006,#ff5ea8,#ffd166)',
    prism:'linear-gradient(135deg,#0a0f1f,#3ec7ff,#5bffb7)'
  };
  items.forEach(item=>{
    item.addEventListener('mouseenter',()=>{
      preview.style.background=gradients[item.dataset.img]||'#222';
      preview.classList.add('active');
    });
    item.addEventListener('mouseleave',()=>preview.classList.remove('active'));
    item.addEventListener('mousemove',e=>{
      preview.style.left=(e.clientX+30)+'px';
      preview.style.top=(e.clientY-100)+'px';
    });
  });
})();

/* ========== PROCESS STEP HIGHLIGHT ========== */
document.querySelectorAll('.step').forEach(step=>{
  step.addEventListener('click',()=>{
    document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
    step.classList.add('active');
  });
  step.addEventListener('mouseenter',()=>{
    document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
    step.classList.add('active');
  });
});

/* ========== PARALLAX ORBS ========== */
document.addEventListener('mousemove',e=>{
  const x=(e.clientX/window.innerWidth-.5);
  const y=(e.clientY/window.innerHeight-.5);
  document.querySelectorAll('.orb').forEach((o,i)=>{
    const f=(i+1)*20;
    o.style.transform=`translate(${x*f}px,${y*f}px)`;
  });
});

/* ========== PROJECT MODAL ========== */
const projectData={
  aurora:{
    num:'/ 01',
    title:'Aurora Labs',
    subtitle:'Identity Engine',
    tags:['Real-time 3D','Brand Identity','WebGL'],
    location:'Helsinki · 2026',
    gradient:'linear-gradient(135deg,#071828 0%,#0e2d4a 40%,#3ec7ff 80%,#7c5cff 100%)',
    desc:'A living brand system built on real-time WebGL, where the logo responds to data feeds and shifts identity across touchpoints — no two renders ever the same. Built for a life sciences company that processes 40 million data events per day.',
    stats:[
      {label:'Duration',val:'6 weeks'},
      {label:'Stack',val:'WebGL · GLSL · Three.js'},
      {label:'Deliverable',val:'Brand system + Motion language'}
    ]
  },
  meridian:{
    num:'/ 02',
    title:'Meridian Watches',
    subtitle:'Spatial Configurator',
    tags:['WebGPU','Product Config','Interactive 3D'],
    location:'Geneva · 2025',
    gradient:'linear-gradient(135deg,#1a0f24 0%,#2a1a40 40%,#ff5ea8 75%,#ffd166 100%)',
    desc:'A photorealistic watch configurator running entirely in the browser via WebGPU — 47 material combinations, real-time light simulation across five virtual environments, and sub-20ms frame times on mid-range hardware.',
    stats:[
      {label:'Duration',val:'12 weeks'},
      {label:'Stack',val:'WebGPU · WGSL · React'},
      {label:'Deliverable',val:'47 material variants, 5 scenes'}
    ]
  },
  vessel:{
    num:'/ 03',
    title:'Vessel',
    subtitle:'Generative Atelier',
    tags:['AI Spatial','Editorial','Diffusion Models'],
    location:'Tokyo · 2025',
    gradient:'linear-gradient(135deg,#0a1810 0%,#0f2820 40%,#5bffb7 75%,#3ec7ff 100%)',
    desc:'A luxury fashion atelier powered by proprietary diffusion models trained on 80 years of archive photography — generating editorial-quality stills and spatial environments on demand for seasonal campaigns.',
    stats:[
      {label:'Duration',val:'18 weeks'},
      {label:'Stack',val:'Custom diffusion · ComfyUI · WebGL'},
      {label:'Deliverable',val:'Generative campaign pipeline'}
    ]
  },
  halcyon:{
    num:'/ 04',
    title:'Halcyon Aerospace',
    subtitle:'Visual System',
    tags:['Cinematic CGI','Campaign','Film'],
    location:'Toulouse · 2024',
    gradient:'linear-gradient(135deg,#0f0f28 0%,#1a1a40 40%,#7c5cff 75%,#3ec7ff 100%)',
    desc:"A full-CG launch campaign for Halcyon's next-generation aircraft — 14 hero shots, one 90-second film, and a complete visual language that rewrote what aerospace communications could look and feel like.",
    stats:[
      {label:'Duration',val:'10 weeks'},
      {label:'Stack',val:'Houdini · Arnold · Nuke'},
      {label:'Deliverable',val:'14 hero shots + 90s film'}
    ]
  },
  oki:{
    num:'/ 05',
    title:'Okibi Beverages',
    subtitle:'Liquid Studies',
    tags:['Cinematic 3D','Product','Simulation'],
    location:'Kyoto · 2024',
    gradient:'linear-gradient(135deg,#200a04 0%,#3a1208 40%,#ff5ea8 75%,#ffd166 100%)',
    desc:'Hyper-real liquid simulations and macro-photography-inspired renders for a new line of botanical spirits — every droplet physically accurate, every pour choreographed frame by frame across 120 product deliverables.',
    stats:[
      {label:'Duration',val:'8 weeks'},
      {label:'Stack',val:'Houdini · Karma XPU · Redshift'},
      {label:'Deliverable',val:'120 product renders'}
    ]
  },
  prism:{
    num:'/ 06',
    title:'Prism Capital',
    subtitle:'Volumetric Dashboards',
    tags:['Data Spatial','Real-time','Finance'],
    location:'NYC · 2023',
    gradient:'linear-gradient(135deg,#04080f 0%,#0a1428 40%,#3ec7ff 75%,#5bffb7 100%)',
    desc:'A spatial data environment for a quantitative hedge fund — portfolio positions rendered as volumetric 3D structures, risk exposed as light and form, markets breathing in real-time through a custom WebGL rendering layer.',
    stats:[
      {label:'Duration',val:'24 weeks'},
      {label:'Stack',val:'WebGL · D3 · Rust WASM'},
      {label:'Deliverable',val:'Real-time trading dashboard'}
    ]
  }
};

const projectOverlay=document.getElementById('projectOverlay');
const projModal=document.getElementById('projModal');
const projClose=document.getElementById('projClose');

function openProject(key){
  const d=projectData[key];
  if(!d)return;
  document.getElementById('modalNum').textContent=d.num;
  document.getElementById('modalVisBg').style.background=d.gradient;
  document.getElementById('modalVisLabel').textContent=d.location;
  document.getElementById('modalTitle').textContent=d.title;
  document.getElementById('modalSubtitle').textContent=d.subtitle;
  document.getElementById('modalDesc').textContent=d.desc;
  document.getElementById('modalTags').innerHTML=d.tags.map(t=>`<span class="modal-tag">${t}</span>`).join('');
  document.getElementById('modalStats').innerHTML=d.stats.map(s=>
    `<div class="modal-stat"><div class="modal-stat-label">${s.label}</div><div class="modal-stat-val">${s.val}</div></div>`
  ).join('');
  projectOverlay.classList.add('open');
  document.body.style.overflow='hidden';
}

function closeProject(){
  projectOverlay.classList.remove('open');
  document.body.style.overflow='';
}

document.querySelectorAll('.work-item').forEach(item=>{
  item.addEventListener('click',()=>openProject(item.dataset.project));
});
projClose.addEventListener('click',closeProject);
projectOverlay.addEventListener('click',e=>{if(e.target===projectOverlay)closeProject();});

/* ========== CONTACT MODAL ========== */
const contactOverlay=document.getElementById('contactOverlay');
const contactClose=document.getElementById('contactClose');
const contactForm=document.getElementById('contactForm');
const formSuccess=document.getElementById('formSuccess');
const contactFormInner=document.getElementById('contactFormInner');

function openContact(){
  contactOverlay.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeContact(){
  contactOverlay.classList.remove('open');
  document.body.style.overflow='';
}

document.querySelectorAll('.open-contact').forEach(el=>{
  el.addEventListener('click',e=>{e.preventDefault();openContact();});
});
contactClose.addEventListener('click',closeContact);
contactOverlay.addEventListener('click',e=>{if(e.target===contactOverlay)closeContact();});

contactForm.addEventListener('submit',e=>{
  e.preventDefault();
  const btn=contactForm.querySelector('.form-submit');
  btn.textContent='Sending…';
  btn.style.opacity='.5';
  setTimeout(()=>{
    contactFormInner.style.display='none';
    formSuccess.classList.add('show');
    addHover(document.querySelectorAll('.contact-close'));
  },1200);
});

/* ========== ESCAPE KEY ========== */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    closeProject();
    closeContact();
    if(mobileNav.classList.contains('open')){
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow='';
    }
  }
});

/* ========== JOURNAL CARDS ========== */
document.querySelectorAll('.open-journal').forEach(card=>{
  card.addEventListener('click',()=>{
    openContact();
  });
});

/* ========== BACK TO TOP ========== */
const backTop=document.getElementById('backTop');
window.addEventListener('scroll',()=>{
  if(window.scrollY>600){backTop.classList.add('visible');}
  else{backTop.classList.remove('visible');}
},{passive:true});
backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
addHover([backTop]);

/* ========== ACTIVE NAV ON SCROLL ========== */
const navLinks=document.querySelectorAll('.nav-links a[href^="#"]');
const sections=[...navLinks].map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
const navObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      navLinks.forEach(a=>a.classList.remove('nav-active'));
      const link=document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if(link)link.classList.add('nav-active');
    }
  });
},{rootMargin:'-40% 0px -55% 0px',threshold:0});
sections.forEach(s=>navObs.observe(s));
