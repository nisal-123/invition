const welcome = document.getElementById("welcome");
const invitation = document.getElementById("invitation");
const envelopeWrap = document.getElementById("envelopeWrap");
const openButton = document.getElementById("openButton");
const music = document.getElementById("backgroundMusic");
const musicButton = document.getElementById("musicButton");
const musicLabel = document.getElementById("musicLabel");
const replayButton = document.getElementById("replayButton");
let opened = false;

// Gold dust particle background (canvas keeps the effect lightweight).
(() => {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let width, height, particles = [];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({length: Math.min(90, Math.floor(width / 13))}, () => ({
      x: Math.random()*width, y: Math.random()*height,
      r: Math.random()*1.7+.35, speed: Math.random()*.32+.08,
      drift: (Math.random()-.5)*.22, alpha: Math.random()*.55+.15
    }));
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    particles.forEach(p => {
      p.y -= p.speed; p.x += p.drift;
      if(p.y < -5){p.y=height+5;p.x=Math.random()*width}
      if(p.x < -5) p.x=width+5;
      if(p.x > width+5) p.x=-5;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(231,190,112,${p.alpha})`; ctx.fill();
    });
    if(!reduced) requestAnimationFrame(draw);
  }
  window.addEventListener("resize", resize, {passive:true});
  resize(); draw();
})();

function animate(target, vars) {
  if (window.gsap) gsap.to(target, vars);
  else {
    target.style.transition = `all ${vars.duration || .7}s ease`;
    if (vars.opacity !== undefined) target.style.opacity = vars.opacity;
    if (vars.y !== undefined) target.style.transform = `translateY(${vars.y}px)`;
  }
}

function revealCard() {
  const card = document.getElementById("invitationCard");
  const items = document.querySelectorAll(".reveal");
  if (window.gsap) {
    gsap.to(card,{opacity:1,y:0,scale:1,duration:1.15,ease:"power3.out",delay:.15});
    gsap.to(items,{opacity:1,y:0,duration:.75,stagger:.12,ease:"power2.out",delay:.85});
    gsap.to("#finalMessage",{opacity:1,y:0,duration:1.1,delay:2.7,ease:"power2.out"});
  } else {
    card.style.opacity=1; card.style.transform="none";
    items.forEach((el,i)=>setTimeout(()=>{el.style.opacity=1;el.style.transform="none"},850+i*120));
    setTimeout(()=>{document.getElementById("finalMessage").style.opacity=1},2800);
  }
}

openButton.addEventListener("click", () => {
  if(opened) return;
  opened = true;
  openButton.disabled = true;
  envelopeWrap.classList.add("open");
  if(window.gsap){
    gsap.to(".wax-seal",{scale:0,opacity:0,duration:.25,delay:.45});
    gsap.to(".envelope-wrap",{y:25,opacity:0,duration:.65,delay:1.05});
    gsap.to(welcome,{opacity:0,duration:.7,delay:1.45,onComplete:()=>{
      welcome.classList.add("hidden");
      invitation.classList.remove("hidden");
      revealCard();
      invitation.scrollIntoView({behavior:"smooth",block:"start"});
    }});
  } else {
    setTimeout(()=>{
      welcome.classList.add("hidden");
      invitation.classList.remove("hidden");
      revealCard();
      window.scrollTo({top:0,behavior:"smooth"});
    },1500);
  }
});

async function toggleMusic(){
  if(music.paused){
    try{
      await music.play();
      musicButton.classList.add("playing");
      musicLabel.textContent="MUSIC ON";
    }catch(e){
      musicLabel.textContent="ADD MUSIC FILE";
    }
  }else{
    music.pause();
    musicButton.classList.remove("playing");
    musicLabel.textContent="MUSIC OFF";
  }
}
musicButton.addEventListener("click",toggleMusic);

replayButton.addEventListener("click",()=>{
  music.pause(); music.currentTime=0;
  musicButton.classList.remove("playing"); musicLabel.textContent="MUSIC OFF";
  opened=false; openButton.disabled=false;
  invitation.classList.add("hidden");
  welcome.classList.remove("hidden");
  welcome.style.opacity=1;
  envelopeWrap.classList.remove("open");
  const card=document.getElementById("invitationCard");
  card.style.opacity=0;card.style.transform="translateY(35px) scale(.96)";
  document.querySelectorAll(".reveal").forEach(el=>{el.style.opacity=0;el.style.transform="translateY(18px)"});
  document.getElementById("finalMessage").style.opacity=0;
  window.scrollTo({top:0,behavior:"smooth"});
});
