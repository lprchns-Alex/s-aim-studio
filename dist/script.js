(() => {
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const root = document.documentElement;
const ru = root.lang === 'ru';
const ui = ru ? {
  dark:'Включить тёмную тему', light:'Включить светлую тему', menu:'МЕНЮ', close:'ЗАКРЫТЬ', play:'ИГРАТЬ',
  footer:'СОЗДАЁМ ВАЖНОЕ', loading:'S–AIM / ДИЗАЙН. РАЗРАБОТКА. РОСТ.',
  launch:'Пробел или клик — запуск. ← → — движение.',
  lives:n=>`Мячей: ${n} · ← → — движение`,
  retry:'Ещё попытку? Кликните или нажмите пробел.', win:'Все блоки собраны! Кликните или нажмите пробел, чтобы сыграть снова.',
  resume:'Продолжить анимацию ▶', pause:'Остановить анимацию Ⅱ',
  inquiry:'S–AIM — ОПИСАНИЕ ПРОЕКТА', name:'Имя', email:'Почта', company:'Компания', service:'Услуга', message:'Давайте обсудим проект.'
} : {
  dark:'Switch to dark theme', light:'Switch to light theme', menu:'MENU', close:'CLOSE', play:'PLAY',
  footer:'MAKE IT MATTER', loading:'S–AIM / DESIGN. BUILD. GROW.',
  launch:'Press Space or click to launch. ← → to move.', lives:n=>`Balls ${n} · ← → to move`,
  retry:'Nice try. Click or press Space to play again.', win:'You cleared it. Click or press Space to play again.',
  resume:'Resume motion ▶', pause:'Pause motion Ⅱ',
  inquiry:'S–AIM PROJECT INQUIRY', name:'Name', email:'Email', company:'Company', service:'Service', message:'Let’s discuss the project.'
};
// Keep the reader in the same section when switching language.
$$('.language-switch a').forEach(link => link.addEventListener('click', () => {
  if (location.hash) link.hash = location.hash;
}));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
let theme = 'light';
try { theme = localStorage.getItem('saim-theme') || 'light'; } catch {}
function applyTheme(value) {
  theme = value === 'dark' ? 'dark' : 'light';
  root.dataset.theme = theme;
  $('.theme-toggle').setAttribute('aria-pressed', String(theme === 'dark'));
  $('.theme-toggle').setAttribute('aria-label', theme === 'dark' ? ui.light : ui.dark);
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#111110' : '#fcfcfb';
}
applyTheme(theme);
$('.theme-toggle').addEventListener('click', () => { applyTheme(theme === 'dark' ? 'light' : 'dark'); try { localStorage.setItem('saim-theme', theme); } catch {} redraw(); });

// Each word is a clipping mask. Individual letters enter with a small stagger.
$$('[data-split]').forEach(el => {
  const label = [...el.childNodes].map(node => node.nodeName === 'BR' ? ' ' : node.textContent).join('').replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', label);
  let index = 0;
  const fragments = [...el.childNodes];
  el.replaceChildren();
  for (const node of fragments) {
    if (node.nodeName === 'BR') { el.append(document.createElement('br'), document.createTextNode(' ')); continue; }
    const words = node.textContent.split(/(\s+)/);
    words.forEach(word => {
      if (!word) return;
      if (/^\s+$/.test(word)) { el.append(document.createTextNode(' ')); return; }
      const clip = document.createElement('span'); clip.className = 'word-clip'; clip.setAttribute('aria-hidden', 'true');
      [...word].forEach(char => { const span = document.createElement('span'); span.className = 'char'; span.textContent = char; span.style.setProperty('--i', Math.min(index++, 65)); clip.append(span); });
      el.append(clip);
    });
  }
});
$$('[data-reveal]').forEach((el, i) => el.style.setProperty('--delay', `${i % 3 * 45}ms`));
const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting && (!entry.target.closest('.hero') || document.body.classList.contains('ready'))) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
}), { threshold:.12, rootMargin:'0px 0px -25px 0px' });
$$('[data-reveal],[data-split]').forEach(el => reveal.observe(el));
root.classList.add('js');
$('.hero').classList.add('grain');

// Service columns open on pointer entry, keyboard focus or a tap.
const serviceGroup = $('[data-service-panels]');
const servicePanels = $$('.service-panel');
const serviceDesktop = matchMedia('(min-width: 751px) and (hover: hover) and (pointer: fine)');
let activeService = null;
function openService(panel) {
  activeService = panel;
  servicePanels.forEach(item => {
    const open = item === panel;
    item.classList.toggle('is-open', open);
    item.querySelector('.service-panel-toggle').setAttribute('aria-expanded', String(open));
    item.querySelector('.service-panel-body').inert = !open;
  });
}
servicePanels.forEach(panel => {
  const button = panel.querySelector('.service-panel-toggle');
  panel.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && serviceDesktop.matches) openService(panel);
  });
  button.addEventListener('click', () => {
    openService(serviceDesktop.matches ? panel : activeService === panel ? null : panel);
  });
  panel.addEventListener('focusin', () => { if (serviceDesktop.matches) openService(panel); });
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') { button.focus({preventScroll:true}); openService(null); }
  });
});
serviceGroup.addEventListener('pointerleave', () => {
  if (serviceDesktop.matches && !serviceGroup.contains(document.activeElement)) openService(null);
});
serviceGroup.addEventListener('focusout', event => {
  if (!serviceGroup.contains(event.relatedTarget)) openService(null);
});
serviceDesktop.addEventListener('change', () => openService(null));
$$('[data-service-choice]').forEach(link => link.addEventListener('click', () => {
  const select = $('#contact-form select[name="service"]');
  const option = [...select.options].find(item => item.textContent === link.dataset.serviceChoice);
  if (option) select.value = option.value;
}));

// Full-screen navigation keeps focus inside the open menu.
const menu = $('#menu-panel'), menuButton = $('.menu-toggle');
let closeTimer, previousFocus;
$$('#menu-panel nav a').forEach((el,i)=>el.style.setProperty('--index',i));
function setMenu(open) {
  clearTimeout(closeTimer);
  menuButton.setAttribute('aria-expanded', String(open));
  $('.menu-word').textContent = open ? ui.close : ui.menu;
  $('#main').inert = open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) {
    previousFocus = document.activeElement;
    menu.style.top = Math.max(0, document.querySelector(".header").getBoundingClientRect().bottom) + "px";
    menu.hidden = false;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{menu.classList.add('is-open'); menu.querySelector('a').focus({preventScroll:true});}));
  } else {
    menu.classList.remove('is-open');
    closeTimer = setTimeout(()=>{menu.hidden=true;}, reduced.matches ? 0 : 450);
    if (menu.contains(document.activeElement)) previousFocus?.focus({preventScroll:true});
  }
}
menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
$$('#menu-panel a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown', event => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') { setMenu(false); menuButton.focus(); }
  if (event.key === 'Tab') {
    const items = [menuButton,...menu.querySelectorAll('a')];
    const i = items.indexOf(document.activeElement);
    if (event.shiftKey && i <= 0) {event.preventDefault();items.at(-1).focus();}
    else if (!event.shiftKey && i === items.length-1) {event.preventDefault();items[0].focus();}
  }
});

// FAQ uses an animated grid so the surrounding page moves smoothly.
$$('.faq-question').forEach(button => button.addEventListener('click',()=>{
  const item=button.closest('.faq-item'), answer=document.getElementById(button.getAttribute('aria-controls'));
  const open=button.getAttribute('aria-expanded')!=='true';
  button.setAttribute('aria-expanded',String(open));answer.inert=!open;item.classList.toggle('is-open',open);
}));

// Quiet circular cursor and a small magnetic pull on the main call to action.
const cursor=$('.cursor'), cta=$('.hero-lead .button');
const pointer={x:0,y:0};
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener('pointermove',event=>{
    pointer.x=event.clientX;pointer.y=event.clientY;
    cursor.style.left=`${pointer.x}px`;cursor.style.top=`${pointer.y}px`;
    cursor.classList.add('is-active');
    cursor.classList.toggle('is-hover',!!event.target.closest('a,button,summary,input,select,textarea'));
  },{passive:true});
  document.addEventListener('pointerleave',()=>cursor.classList.remove('is-active'));
  cta.addEventListener('pointermove',event=>{if(paused)return;const r=cta.getBoundingClientRect();cta.style.transform=`translate(${(event.clientX-r.left-r.width/2)*.045}px, ${(event.clientY-r.top-r.height/2)*.09}px)`;});
  cta.addEventListener('pointerleave',()=>{cta.style.transform='';});
}

// Two identical groups guarantee a full-width, seamless marquee at every size.
$$('.capability-marquees .marquee').forEach(viewport=>{
 const track=viewport.querySelector('.marquee-track');
 const source=track.firstElementChild.cloneNode(true);
 const duration=parseFloat(getComputedStyle(track).animationDuration)||52;
 let lastWidth=0,queued=0;
 function fill(force=false){
  const width=viewport.clientWidth;if(!width||(!force&&width===lastWidth))return;
  lastWidth=width;
  const group=document.createElement('div');group.className='marquee-group';
  group.append(source.cloneNode(true));track.replaceChildren(group);
  const itemWidth=group.firstElementChild.getBoundingClientRect().width;
  if(!itemWidth)return;
  const count=Math.ceil(width/itemWidth)+1;
  track.style.animationDuration=`${duration*count}s`;
  for(let i=1;i<count;i++){const copy=source.cloneNode(true);copy.setAttribute('aria-hidden','true');group.append(copy);}
  const twin=group.cloneNode(true);twin.setAttribute('aria-hidden','true');track.append(twin);
 }
 fill();
 document.fonts.ready.then(()=>fill(true));
 new ResizeObserver(()=>{cancelAnimationFrame(queued);queued=requestAnimationFrame(()=>fill());}).observe(viewport);
});

// Original 5 × 7 pixel lettering shared by the loader, hero and footer.
const glyphs={
 A:['01110','10001','10001','11111','10001','10001','10001'], B:['11110','10001','10001','11110','10001','10001','11110'], C:['01111','10000','10000','10000','10000','10000','01111'],
 D:['11110','10001','10001','10001','10001','10001','11110'], E:['11111','10000','10000','11110','10000','10000','11111'], F:['11111','10000','10000','11110','10000','10000','10000'],
 G:['01111','10000','10000','10111','10001','10001','01110'], H:['10001','10001','10001','11111','10001','10001','10001'], I:['11111','00100','00100','00100','00100','00100','11111'],
 K:['10001','10010','10100','11000','10100','10010','10001'], L:['10000','10000','10000','10000','10000','10000','11111'], M:['10001','11011','10101','10101','10001','10001','10001'],
 N:['10001','11001','11001','10101','10011','10011','10001'], O:['01110','10001','10001','10001','10001','10001','01110'], P:['11110','10001','10001','11110','10000','10000','10000'],
 R:['11110','10001','10001','11110','10100','10010','10001'], S:['01111','10000','10000','01110','00001','00001','11110'], T:['11111','00100','00100','00100','00100','00100','00100'],
 U:['10001','10001','10001','10001','10001','10001','01110'], V:['10001','10001','10001','10001','10001','01010','00100'], W:['10001','10001','10001','10101','10101','11011','10001'],
 X:['10001','10001','01010','00100','01010','10001','10001'], Y:['10001','10001','01010','00100','00100','00100','00100'], '-':['00000','00000','00000','11111','00000','00000','00000'],
 ' ':['000','000','000','000','000','000','000'], '+':['00000','00100','00100','11111','00100','00100','00000']};
// Cyrillic letterforms for the translated pixel heading and playable blocks.
Object.assign(glyphs, {
 'А':glyphs.A, 'В':glyphs.B, 'Е':glyphs.E, 'М':glyphs.M, 'Н':glyphs.H, 'О':glyphs.O, 'С':glyphs.C,
 'Ё':['01010','00000','11111','10000','11110','10000','11111'],
 'З':['11110','00001','00001','01110','00001','00001','11110'],
 'Д':['00110','01010','01010','01010','01010','11111','10001'],
 'Ж':['10101','10101','01110','00100','01110','10101','10101']
});
function pixelPoints(text){let x=0;const points=[];[...text].forEach(ch=>{const grid=glyphs[ch]||glyphs[' '];grid.forEach((row,y)=>[...row].forEach((v,i)=>{if(v==='1')points.push([x+i,y]);}));x+=grid[0].length+1;});return{points,width:x-1};}
function fitCanvas(canvas,w,h){const dpr=Math.min(devicePixelRatio||1,2);const width=Math.round(w*dpr),height=Math.round(h*dpr);if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;return ctx;}
function pixelText(ctx,text,x,y,size,gap=.3){const {points}=pixelPoints(text);points.forEach(([px,py])=>ctx.fillRect(Math.round(x+px*size),Math.round(y+py*size),Math.max(1,size-gap),Math.max(1,size-gap)));}
const ink=()=>theme==='dark'?'#f4f4f1':'#111110';

// The opening mark assembles from loose squares, then clears the page.
function completeIntro(){document.body.classList.remove('booting');document.body.classList.add('ready');$('.hero-title').classList.add('is-visible');$$('.hero [data-reveal]').forEach(el=>el.classList.add('is-visible'));}
if (!paused && !location.hash) {
  document.body.classList.add('booting');
  const loader=document.createElement('div');loader.className='loader';loader.setAttribute('aria-hidden','true');
  const canvas=document.createElement('canvas');loader.append(canvas);
  const cap=document.createElement('span');cap.className='loader-caption';cap.textContent=ui.loading;loader.append(cap);document.body.append(loader);
  const start=performance.now(),data=pixelPoints('S-AIM');
  const safe=setTimeout(()=>{loader.remove();completeIntro();},2600);
  const intro=time=>{
    if(!loader.isConnected)return;
    const w=canvas.clientWidth,h=270,ctx=fitCanvas(canvas,w,h),t=time-start;
    ctx.clearRect(0,0,w,h);ctx.fillStyle=ink();
    const unit=Math.min(14,(w-60)/data.width),ox=(w-data.width*unit)/2,oy=(h-7*unit)/2;
    data.points.forEach(([x,y],i)=>{
      const progress=Math.max(0,Math.min(1,(t-i*1.5)/950));const ease=1-Math.pow(1-progress,4);
      const sx=(Math.sin(i*23.71)*.5+.5)*w,sy=(Math.cos(i*7.23)*.5+.5)*h;
      ctx.globalAlpha=.1+.9*ease;ctx.fillRect(sx+(ox+x*unit-sx)*ease,sy+(oy+y*unit-sy)*ease,unit-1,unit-1);
    });ctx.globalAlpha=1;
    if(t<1550)requestAnimationFrame(intro);else{completeIntro();loader.classList.add('is-leaving');setTimeout(()=>{loader.remove();clearTimeout(safe);},430);}
  };requestAnimationFrame(intro);
} else completeIntro();

const heroCanvas=$('#hero-pixels');
let heroVisible=true,footerVisible=false,phase=0;
const sceneObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.target.id==='hero')heroVisible=e.isIntersecting;else footerVisible=e.isIntersecting;}));
sceneObserver.observe($('#hero'));sceneObserver.observe($('#footer-pixels'));
function drawHero(t){
 const w=heroCanvas.clientWidth,h=heroCanvas.clientHeight;if(!w||!h)return;
 const ctx=fitCanvas(heroCanvas,w,h);ctx.clearRect(0,0,w,h);
 const unit=w>=1000?4:w>=650?3:2;
 const baseline=Math.floor(h-45),color=ink(),paper=theme==='dark'?'#191918':'#f6f5f3';
 const beat=Math.floor(t/230)%2,cycle=(t%10000)/10000;
 // All positions sit on the same integer pixel grid as the original characters.
 function station(center,draw){ctx.save();ctx.translate(Math.round(center-17*unit),baseline);ctx.fillStyle=color;draw();ctx.restore();}
 function p(x,y,width=1,height=1){ctx.fillRect(Math.round(x*unit),Math.round(y*unit),Math.round(width*unit),Math.round(height*unit));}
 function cut(x,y,width=1,height=1){ctx.fillStyle=paper;p(x,y,width,height);ctx.fillStyle=color;}
 function outline(x,y,width,height){p(x,y,width,1);p(x,y+height-1,width,1);p(x,y,1,height);p(x+width-1,y,1,height);}
 function check(x,y){p(x,y+1);p(x+1,y+2);p(x+2,y+1);p(x+3,y);}
 function head(x,y){p(x+1,y,4,1);p(x,y+1,6,4);p(x+1,y+5,4,1);cut(x+4,y+2);}
 function coder(){
   // Seated developer, monitor, keyboard and a cup. Hands alternate on the keys.
   p(1,-10,1,8);p(1,-3,9,1);p(2,-2,1,2);p(8,-2,1,2);
   head(3,-20);p(4,-14,4,7);p(5,-7,7,2);p(10,-5,2,4);p(9,-1,5,1);
   p(8,-13,2,4);p(9,-11,4,1);p(12,-12+beat,2,1);
   p(4,-12,1,4);p(5,-9,7,1);p(11,-10-beat,2,1);
   p(3,-8,29,1);p(14,-7,1,7);p(29,-7,1,7);p(13,-10,8,1);
   outline(15,-24,16,12);p(22,-12,2,3);p(19,-9,8,1);
   const lines=Math.min(4,Math.floor(cycle*6)+1);
   for(let row=0;row<lines;row++){p(17,-21+row*2,1,1);p(19,-21+row*2,3+(row%2)*3,1);}
   if(cycle<.73&&beat)p(26,-21+(lines-1)*2,1,1);
   if(cycle>.75){cut(17,-22,12,8);check(21,-20);}
   outline(33,-12,3,4);p(36,-11,1,2);
 }
 function designer(){
   // A standing designer places interface blocks on a wireframe board.
   const reach=cycle>.23&&cycle<.68;
   head(2,-19);p(3,-13,4,7);p(3,-6,2,5);p(7,-6,2,5);p(2,-1,4,1);p(7,-1,4,1);
   p(1,-12,2,6);p(7,-12,2,reach?2:5);p(8,-12,reach?4:2,1);if(reach)p(11,-14+beat,1,3);
   outline(13,-24,20,17);p(14,-21,18,1);p(15,-23,1,1);p(17,-23,1,1);
   p(17,-7,1,7);p(28,-7,1,7);p(15,-1,5,1);p(26,-1,5,1);
   p(16,-18,13,1);outline(16,-15,5,5);
   const progress=Math.min(1,Math.max(0,(cycle-.22)/.35));
   const blockX=Math.round(8+progress*15),blockY=Math.round(-9-progress*6);
   if(cycle<.85){outline(blockX,blockY,5,5);p(blockX+4,blockY+4,1,3);p(blockX+5,blockY+5);}
   if(cycle>=.58){p(23,-9,5,1);p(16,-9,4,1);}
   if(cycle>=.85){outline(23,-15,5,5);check(25,-19);}
 }
 function engineer(){
   // Server technician adjusts a port while a deployment fills the status bar.
   outline(20,-25,12,25);
   for(let row=0;row<3;row++){
     outline(22,-22+row*7,8,5);p(24,-20+row*7,3,1);
     if((Math.floor(t/420)+row)%3!==0)p(28,-20+row*7);
   }
   const working=cycle<.75;
   head(8,-20);p(9,-14,4,8);p(9,-6,2,5);p(13,-6,2,5);p(8,-1,4,1);p(13,-1,4,1);
   p(7,-13,2,6);p(13,-13,2,working?3:6);
   if(working){p(14,-11,5,1);p(18,-12+beat,2,1);p(17,-10,1,3);}
   else{p(14,-17,1,5);p(15,-18,2,1);check(9,-25);}
   // Small terminal next to the rack, with a visibly progressing build.
   outline(0,-7,6,5);p(0,-2,7,1);p(1,-5,Math.max(1,Math.floor(cycle*4)),1);
 }
 function marketer(){
   head(3,-20);p(4,-14,4,8);p(4,-6,2,5);p(8,-6,2,5);p(3,-1,4);p(8,-1,4);
   p(8,-12,5);p(12,-14+beat,1,3);p(2,-13,2,5);
   outline(15,-27,20,18);p(16,-23,18);p(17,-25);p(19,-25);
   for(let col=0;col<4;col++){const height=2+col*2+(beat&&col===3?1:0);p(18+col*4,-12-height,2,height);}
   p(24,-9,2,8);p(20,-1,10);
 }
 const centers=w<650?[w*.22,w*.77]:w<1000?[w*.17,w*.5,w*.83]:[w*.13,w*.38,w*.63,w*.87];
 // One shared floor and overhead data bus make this a single studio scene.
 ctx.fillStyle=color;ctx.globalAlpha=.12;ctx.fillRect(0,baseline+unit,w,1);
 for(let x=12;x<w;x+=24){ctx.fillRect(x,baseline+unit+16,2,2);}
 ctx.globalAlpha=1;
 const hubX=Math.round(w/2),busY=38;
 ctx.globalAlpha=.2;ctx.fillRect(centers[0],busY,centers[centers.length-1]-centers[0],1);
 centers.forEach(x=>ctx.fillRect(Math.round(x),busY,1,Math.max(0,baseline-31*unit-busY)));
 ctx.globalAlpha=1;
 // A shared build window ticks through its stages above the workstations.
 const hx=hubX-42,hy=16;ctx.fillStyle=paper;ctx.fillRect(hx-8,hy-5,100,47);ctx.fillStyle=color;
 ctx.fillRect(hx,hy,84,2);ctx.fillRect(hx,hy+34,84,2);ctx.fillRect(hx,hy,2,36);ctx.fillRect(hx+82,hy,2,36);
 ctx.fillRect(hx+8,hy+9,4,4);ctx.fillRect(hx+16,hy+9,4,4);
 for(let i=0;i<6;i++){ctx.globalAlpha=cycle*7>i?1:.15;ctx.fillRect(hx+9+i*11,hy+22,7,5);}ctx.globalAlpha=1;
 centers.forEach((x,i)=>{const progress=((t+i*1200)%4000)/4000;const y=busY+(baseline-31*unit-busY)*progress;ctx.fillRect(Math.round(x)-2,Math.round(y),4,4);});
 station(centers[0],coder);
 if(w>=650)station(centers[1],designer);
 if(w>=1000)station(centers[2],marketer);
 station(centers[centers.length-1],engineer);
 // A small delivery bot carries a build from one end of the studio to the other.
 const route=(t%18000)/18000,rx=Math.round(10+(w-44)*route),ry=baseline+unit+12;
 ctx.fillRect(rx,ry,22,12);ctx.fillRect(rx+4,ry-4,14,4);ctx.fillStyle=paper;ctx.fillRect(rx+14,ry+3,4,3);ctx.fillStyle=color;
 ctx.fillRect(rx+3,ry+12,4,4);ctx.fillRect(rx+16,ry+12,4,4);
}
function drawFooter(){const c=$('#footer-pixels'),w=c.clientWidth,h=c.clientHeight;if(!w)return;const ctx=fitCanvas(c,w,h),text=ui.footer,data=pixelPoints(text),u=Math.min(w/data.width,22);ctx.clearRect(0,0,w,h);ctx.fillStyle='#f0f0ec';pixelText(ctx,text,(w-data.width*u)/2,(h-7*u)/2,u,.8);}
// Four fictional portraits, using the same monochrome tile grid as the studio art.
function drawPortrait(ctx,w,h,variant){
 const grid=Array.from({length:21},()=>Array(19).fill(0));
 const tile=(x,y,width=1,height=1,value=1)=>{for(let row=y;row<y+height;row++)for(let col=x;col<x+width;col++)if(grid[row]&&col>=0&&col<19)grid[row][col]=value;};
 tile(6,2,7);tile(4,3,11);tile(3,4,13,2);
 tile(3,6,1,8);tile(15,6,1,8);tile(2,9,1,3);tile(16,9,1,3);
 tile(4,14,1,2);tile(14,14,1,2);tile(5,16,1);tile(13,16,1);tile(6,17,7);
 tile(6,9,2);tile(11,9,2);tile(9,10,1,3);tile(10,12);
 tile(7,14,1);tile(8,15,3);tile(11,14,1);
 if(variant===1){
   // Side-parted hair and square glasses.
   tile(4,5,5,2);tile(4,7,2);tile(10,4,1,2,0);
   tile(5,8,4);tile(10,8,4);tile(5,10,4);tile(10,10,4);
   tile(5,9);tile(8,9);tile(10,9);tile(13,9);tile(9,9);tile(6,9,2,1,0);tile(11,9,2,1,0);
 }else if(variant===2){
   // Longer hair, a fringe and a gentle smile.
   tile(2,5,2,12);tile(15,5,2,12);tile(1,10,1,7);tile(17,10,1,7);
   tile(3,17,3);tile(13,17,3);tile(4,5,8,2);tile(4,7,5);tile(4,8,2);
   tile(6,8,2);tile(11,8,2);tile(9,10,1,1,0);
 }else if(variant===3){
   // Short curls and a full beard.
   tile(5,1,2);tile(9,1,2);tile(13,2,2);tile(3,3,2);tile(5,5,2,2);tile(9,5,2);tile(13,5,2,2);
   tile(4,13,2,3);tile(13,13,2,3);tile(5,15,9,2);tile(7,18,5);
   tile(6,13,7);tile(8,14,3,1,0);tile(9,16,1,1,0);
 }else{
   // Swept-up hair and rounder, open features.
   tile(7,0,5);tile(5,1,8);tile(4,5,10);tile(4,6,3);tile(4,7,1);
   tile(6,8,2);tile(11,8,2);tile(6,9,2,1,0);tile(11,9,2,1,0);tile(7,10);tile(12,10);
   tile(9,10,1,1,0);tile(7,14,5);tile(8,15,3,1,0);
 }
 const unit=Math.max(2,Math.floor(Math.min(w/25,h/27))),ox=Math.round((w-19*unit)/2),oy=Math.round((h-21*unit)/2);
 grid.forEach((row,y)=>row.forEach((filled,x)=>{if(filled)ctx.fillRect(ox+x*unit,oy+y*unit,unit-.6,unit-.6);}));
}

function drawTeam(){ $$('[data-glyph]').forEach(c=>{const w=c.clientWidth,h=c.clientHeight;if(!w)return;const ctx=fitCanvas(c,w,h);ctx.clearRect(0,0,w,h);ctx.fillStyle=ink();const kind=c.dataset.glyph;if(kind.startsWith('portrait-')){drawPortrait(ctx,w,h,Number(kind.slice(-1)));return;}const u=Math.floor(Math.min(w/17,h/14));if(kind==='design'){const x=(w-u*9)/2,y=(h-u*9)/2;for(let row=0;row<9;row++)for(let col=0;col<9;col++)if(row===0||row===8||col===0||col===8||row===4||col===4)ctx.fillRect(x+col*u,y+row*u,u-.5,u-.5);}if(kind==='code'){pixelText(ctx,'UI',(w-11*u)/2,(h-7*u)/2,u,.5);}if(kind==='system'){const x=(w-u*11)/2,y=(h-u*11)/2;for(let row=0;row<11;row++)for(let col=0;col<11;col++){const tile=(row<4||row>6)&&(col<4||col>6);const bridge=(row===5&&col>1&&col<9)||(col===5&&row>1&&row<9);if(tile||bridge)ctx.fillRect(x+col*u,y+row*u,u-.6,u-.6);}}if(kind==='growth'){const x=(w-u*10)/2,y=(h+u*8)/2;for(let col=0;col<10;col++)for(let row=0;row<=col*.8;row++)ctx.fillRect(x+col*u,y-row*u,u-.6,u-.6);}});}

// A small, self-contained pixel breakout interaction, inspired by the reference footer.
const gameCanvas=$('#breakout'),gamePanel=$('#game-panel'),play=$('#play-button'),wordPanel=$('.pixel-word');
let gameOpen=false,game=null,keys=new Set();
function newGame(){const data=pixelPoints(ui.footer);const size=Math.min(13,900/data.width),left=(1000-data.width*size)/2;game={bricks:data.points.map(([x,y])=>({x:left+x*size,y:25+y*size,w:size-1,h:size-1,alive:true})),x:500,y:330,vx:165,vy:-225,paddle:500,launched:false,lives:3,score:0,ended:false};updateGameStatus();drawGame();}
function updateGameStatus(text){$('#game-status').textContent=text||(game.launched?ui.lives(game.lives):ui.launch);$('#game-score').textContent=`${game.score} / ${game.bricks.length}`;}
function launch(){if(!gameOpen)return;if(paused)setMotion(false);if(game.ended)newGame();game.launched=true;updateGameStatus();}
play.addEventListener('click',()=>{gameOpen=!gameOpen;gamePanel.hidden=!gameOpen;wordPanel.classList.toggle('is-hidden',gameOpen);play.setAttribute('aria-expanded',String(gameOpen));play.textContent=gameOpen?'× '+ui.close:'▶ '+ui.play;keys.clear();if(gameOpen){newGame();gameCanvas.focus({preventScroll:true});}else{game=null;drawFooter();}});
gameCanvas.addEventListener('pointermove',event=>{if(!game)return;const r=gameCanvas.getBoundingClientRect();game.paddle=Math.max(70,Math.min(930,(event.clientX-r.left)/r.width*1000));});
gameCanvas.addEventListener('click',launch);
gameCanvas.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight',' '].includes(event.key)){event.preventDefault();keys.add(event.key);if(event.key===' ')launch();}});
gameCanvas.addEventListener('keyup',event=>keys.delete(event.key));
gameCanvas.addEventListener('blur',()=>keys.clear());
function stepGame(dt){if(!game||game.ended)return;const g=game;if(keys.has('ArrowLeft'))g.paddle-=dt*490;if(keys.has('ArrowRight'))g.paddle+=dt*490;g.paddle=Math.max(70,Math.min(930,g.paddle));if(!g.launched){g.x=g.paddle;g.y=330;return;}g.x+=g.vx*dt;g.y+=g.vy*dt;if(g.x<6||g.x>994){g.vx*=-1;g.x=Math.max(6,Math.min(994,g.x));}if(g.y<6){g.vy=Math.abs(g.vy);g.y=6;}if(g.vy>0&&g.y>=329&&g.y<351&&Math.abs(g.x-g.paddle)<81){g.y=329;const hit=(g.x-g.paddle)/80;g.vx=hit*240;g.vy=-Math.sqrt(Math.max(16000,85000-g.vx*g.vx));}for(const b of g.bricks){if(b.alive&&g.x+5>b.x&&g.x-5<b.x+b.w&&g.y+5>b.y&&g.y-5<b.y+b.h){b.alive=false;g.score++;g.vy*=-1;updateGameStatus();break;}}if(g.y>385){g.lives--;g.launched=false;g.vx=165;g.vy=-225;if(!g.lives){g.ended=true;updateGameStatus(ui.retry);}else updateGameStatus();}if(g.score===g.bricks.length){g.ended=true;updateGameStatus(ui.win);}}
function drawGame(){if(!game)return;const ctx=gameCanvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,1000,380);ctx.fillStyle='#f4f4f1';game.bricks.forEach(b=>{if(b.alive)ctx.fillRect(b.x,b.y,b.w,b.h);});ctx.fillRect(game.paddle-75,343,150,11);ctx.beginPath();ctx.arc(game.x,game.y,5,0,Math.PI*2);ctx.fill();}
let previous=0;
function frame(time){const dt=previous?Math.min((time-previous)/1000,.03):0;previous=time;if(!document.hidden&&!paused){phase+=dt*1000;if(heroVisible)drawHero(phase);if(gameOpen){stepGame(dt);drawGame();}}requestAnimationFrame(frame);}
requestAnimationFrame(frame);
function redraw(){drawHero(phase);drawFooter();drawTeam();if(gameOpen)drawGame();}
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(redraw,100);});
document.fonts.ready.then(redraw);redraw();
function setMotion(value){paused=value;root.classList.toggle('motion-paused',value);$('#motion-toggle').setAttribute('aria-pressed',String(value));$('#motion-toggle').textContent=value?ui.resume:ui.pause;if(value)redraw();}
$('#motion-toggle').addEventListener('click',()=>setMotion(!paused));reduced.addEventListener('change',e=>setMotion(e.matches));setMotion(paused);

// Demo form: compose locally, never send or claim that an enquiry was submitted.
let brief='';
$('#contact-form').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget);brief=`${ui.inquiry}\n\n${ui.name}: ${data.get('name')}\n${ui.email}: ${data.get('email')}\n${ui.company}: ${data.get('company')||'—'}\n${ui.service}: ${data.get('service')}\n\n${data.get('message')||ui.message}`;$('#message-content').textContent=brief;$('#form-preview').hidden=false;$('#form-preview').focus({preventScroll:true});$('#form-preview').scrollIntoView({behavior:paused?'auto':'smooth',block:'nearest'});});
$('#download-brief').addEventListener('click',()=>{if(!brief)return;const url=URL.createObjectURL(new Blob([brief],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='s-aim-project-brief.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('#year').textContent=new Date().getFullYear();
})();
