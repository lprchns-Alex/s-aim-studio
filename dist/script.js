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
$('.theme-toggle').addEventListener('click', () => { applyTheme(theme === 'dark' ? 'light' : 'dark'); try { localStorage.setItem('saim-theme', theme); } catch {} drawTeam(); });

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
const botA=['00011000','00111100','01111110','01100110','11111111','10111101','00111100','00100100','01100110'];
const runnerA=['001100','001100','011110','101101','001100','001100','010010','100001'];
const runnerB=['001100','001100','011110','001100','101101','001100','001010','001100'];
function drawSprite(ctx,grid,x,y,scale){grid.forEach((row,py)=>[...row].forEach((v,px)=>{if(v==='1')ctx.fillRect(Math.round(x+px*scale),Math.round(y+py*scale),scale,scale);}));}
let heroVisible=true,footerVisible=false,phase=0;
const sceneObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.target===heroCanvas)heroVisible=e.isIntersecting;else footerVisible=e.isIntersecting;}));
sceneObserver.observe(heroCanvas);sceneObserver.observe($('#footer-pixels'));
function drawHero(t){
 const w=heroCanvas.clientWidth,h=heroCanvas.clientHeight;if(!w||!h)return;
 const ctx=fitCanvas(heroCanvas,w,h);ctx.clearRect(0,0,w,h);ctx.fillStyle=ink();
 const scale=w>800?5:4,baseline=h-3;
 const runX=((t*.045)%(w+120))-60;
 drawSprite(ctx,Math.floor(t/180)%2?runnerA:runnerB,runX,baseline-8*scale,scale);
 const bob=paused?0:Math.max(0,Math.sin(t*.002))*5;
 drawSprite(ctx,botA,w*.55,baseline-9*scale-bob,scale);
 ['UI','AI'].forEach((word,i)=>{const x=w*(.78+i*.065),size=scale*.7,box=12*size;const jump=paused?0:Math.max(0,Math.sin(t*.0017+i*1.8))*8;ctx.lineWidth=scale*.65;ctx.strokeRect(Math.round(x),baseline-box-jump,box,box);pixelText(ctx,word,x+size,baseline-box+size*2.5-jump,size,0);});
 const fly=(t%22000)/22000;if(fly>.72){const x=(fly-.72)/.28*(w+120)-60;drawSprite(ctx,['000011110000','001111111100','111111111111','001111111100','000100001000'],x,10+Math.sin(fly*25)*9,3);}
}
function drawFooter(){const c=$('#footer-pixels'),w=c.clientWidth,h=c.clientHeight;if(!w)return;const ctx=fitCanvas(c,w,h),text=ui.footer,data=pixelPoints(text),u=Math.min(w/data.width,22);ctx.clearRect(0,0,w,h);ctx.fillStyle='#f0f0ec';pixelText(ctx,text,(w-data.width*u)/2,(h-7*u)/2,u,.8);}
function drawTeam(){ $$('[data-glyph]').forEach(c=>{const w=c.clientWidth,h=c.clientHeight;if(!w)return;const ctx=fitCanvas(c,w,h);ctx.clearRect(0,0,w,h);ctx.fillStyle=ink();const kind=c.dataset.glyph;const u=Math.floor(Math.min(w/17,h/14));if(kind==='design'){const x=(w-u*9)/2,y=(h-u*9)/2;for(let row=0;row<9;row++)for(let col=0;col<9;col++)if(row===0||row===8||col===0||col===8||row===4||col===4)ctx.fillRect(x+col*u,y+row*u,u-.5,u-.5);}if(kind==='code'){pixelText(ctx,'UI',(w-11*u)/2,(h-7*u)/2,u,.5);}if(kind==='system'){const x=(w-u*11)/2,y=(h-u*11)/2;for(let row=0;row<11;row++)for(let col=0;col<11;col++){const tile=(row<4||row>6)&&(col<4||col>6);const bridge=(row===5&&col>1&&col<9)||(col===5&&row>1&&row<9);if(tile||bridge)ctx.fillRect(x+col*u,y+row*u,u-.6,u-.6);}}if(kind==='growth'){const x=(w-u*10)/2,y=(h+u*8)/2;for(let col=0;col<10;col++)for(let row=0;row<=col*.8;row++)ctx.fillRect(x+col*u,y-row*u,u-.6,u-.6);}});}

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
