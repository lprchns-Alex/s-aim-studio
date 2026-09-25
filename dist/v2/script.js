(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const ru=document.documentElement.lang==='ru', reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('js');
let paused=reduced.matches;
const activeScrambles=new Map();
function scramble(el){
  if(paused||reduced.matches||activeScrambles.has(el)) return;
  const original=el.dataset.original||(el.dataset.original=el.textContent), start=performance.now(), glyphs='01/#_*+<>', duration=450;
  const tick=now=>{
    const progress=Math.min(1,(now-start)/duration),count=Math.floor(original.length*progress);
    el.textContent=[...original].map((c,i)=>i<count||/\s/.test(c)?c:glyphs[(i+Math.floor(now/50))%glyphs.length]).join('');
    if(progress<1&&!paused)activeScrambles.set(el,requestAnimationFrame(tick));else{el.textContent=original;activeScrambles.delete(el);}
  };
  activeScrambles.set(el,requestAnimationFrame(tick));
}
const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
  if(!isIntersecting)return;
  target.classList.add('visible');
  if(target.hasAttribute('data-scramble'))scramble(target);
  observer.unobserve(target);
}),{threshold:.12});
$$('[data-reveal],[data-scramble]').forEach(el=>observer.observe(el));
$$('.floating-header nav a,.service-tags span').forEach(el=>el.addEventListener('pointerenter',()=>scramble(el)));
// Native disclosures preserve keyboard support and readable content without JS.
$$('.service-row').forEach(row=>row.addEventListener('toggle',()=>{
  if(row.open)$$('.service-row').forEach(other=>{if(other!==row)other.open=false;});
}));
const widget=$('.studio-widget');
if(scrollY>200)widget.open=false;
function foldWidget(){if(scrollY>200){widget.open=false;window.removeEventListener('scroll',foldWidget);}}
window.addEventListener('scroll',foldWidget,{passive:true});
const menu=$('#mobile-menu'),menuButton=$('.menu-button'),main=$('main'),dock=$('.studio-dock');
function setMenu(open){
  menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?(ru?'Закрыть меню':'Close menu'):(ru?'Открыть меню':'Open menu'));
  main.inert=open;dock.inert=open;$('.footer').inert=open;document.body.style.overflow=open?'hidden':'';
  if(open)menu.querySelector('a').focus();
}
menuButton.addEventListener('click',()=>setMenu(menu.hidden));
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{
  if(menu.hidden)return;
  if(event.key==='Escape'){setMenu(false);menuButton.focus();}
  if(event.key==='Tab'){
    const items=[menuButton,...menu.querySelectorAll('a')],index=items.indexOf(document.activeElement);
    if(event.shiftKey&&(index<=0)){event.preventDefault();items.at(-1).focus();}
    if(!event.shiftKey&&index===items.length-1){event.preventDefault();menuButton.focus();}
  }
});
matchMedia('(min-width:951px)').addEventListener('change',e=>{if(e.matches)setMenu(false);});
$$('.language-switch a').forEach(a=>a.addEventListener('click',()=>{if(location.hash)a.hash=location.hash;}));
$$('[data-service]').forEach(a=>a.addEventListener('click',()=>{
  const select=$('#field-service');const option=[...select.options].find(o=>o.value===a.dataset.service);
  if(option) select.value=option.value;
}));
const form=$('#contact-form'), preview=$('#form-preview');let brief='';
form.addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(form);
  const labels=ru?['Имя','Почта','Компания','Услуга','О проекте']:['Name','Email','Company','Service','About the project'];
  brief=['name','email','company','service','message'].map((key,i)=>labels[i]+': '+(data.get(key)||'—')).join('\n\n');
  preview.querySelector('pre').textContent=brief;preview.hidden=false;preview.scrollIntoView({behavior:paused?'instant':'smooth',block:'center'});
});
$('#download-brief').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([brief],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='s-aim-project.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
const motion=$('.motion-button');
function setMotion(value){
  paused=value;document.documentElement.classList.toggle('motion-paused',paused);
  motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?(ru?'ВКЛЮЧИТЬ АНИМАЦИЮ ▷':'RESUME MOTION ▷'):(ru?'ОСТАНОВИТЬ АНИМАЦИЮ Ⅱ':'PAUSE MOTION Ⅱ');
  if(paused)activeScrambles.forEach((id,el)=>{cancelAnimationFrame(id);el.textContent=el.dataset.original;activeScrambles.delete(el);});
  window.dispatchEvent(new CustomEvent('studio:motion',{detail:{paused}}));
}
motion.addEventListener('click',()=>setMotion(!paused));reduced.addEventListener('change',e=>setMotion(e.matches));setMotion(paused);
// Repeat each moving line until both halves cover even very wide displays.
function fitMarquees(){
  $$('.marquee-track').forEach(track=>{
    const first=track.firstElementChild, text=first.dataset.text||(first.dataset.text=first.textContent);
    first.textContent=text;let n=1;while(first.getBoundingClientRect().width<innerWidth+100&&n<12){first.textContent+=text;n++;}
    track.lastElementChild.textContent=first.textContent;
  });
}
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(fitMarquees,100);});
document.fonts.ready.then(fitMarquees);
const cursor=$('.cursor-label');if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  $$('.service-preview').forEach(el=>{
    el.addEventListener('pointerenter',()=>cursor.classList.add('is-visible'));
    el.addEventListener('pointerleave',()=>cursor.classList.remove('is-visible'));
    el.addEventListener('pointermove',event=>{cursor.style.left=event.clientX+'px';cursor.style.top=event.clientY+'px';});
  });
  document.addEventListener('scroll',()=>cursor.classList.remove('is-visible'),{passive:true});
}
})();
