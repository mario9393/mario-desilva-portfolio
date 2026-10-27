
/* Progressive, reversible GSAP intro for Mario's existing static website.
   Does not modify the site's original content, gallery or print layout. */
(() => {
  'use strict';
  const root = document.getElementById('ms-portal-root');
  if (!root) return;
  if (window.location.hash && window.location.hash !== '#') {
    // Preserve direct links to the professional profile and other sections.
    root.hidden = true;
    return;
  }
  const one = (q) => root.querySelector(q);
  const all = (q) => [...root.querySelectorAll(q)];
  const stage = one('.ms-portal-stage');
  const photo = one('.ms-portal-photo');
  const media = one('.ms-portal-media');
  const hero = one('.ms-portal-copy');
  const nav = one('.ms-portal-nav');
  const portal = one('.ms-portal-glass');
  const portalFill = one('.ms-portal-glass-fill');
  const ready = one('.ms-portal-ready');
  const preloader = one('.ms-portal-loader');
  const counter = one('[data-ms-counter]');
  const counterRow = one('.ms-portal-loader-num');
  const loaderWord = one('.ms-portal-loader-word');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const segment = (n,a,b) => Math.max(0,Math.min(1,(n-a)/(b-a)));
  const inOut = (n) => n < .5 ? 2*n*n : 1-Math.pow(-2*n+2,2)/2;
  const revealStatic = () => {
    document.documentElement.classList.remove('ms-portal-loading');
    preloader.remove();
    media.style.transform = 'scale(1)';
    nav.style.opacity = 1;
    one('.ms-portal-kicker').style.opacity = 1;
    all('.ms-portal-headline .ms-word').forEach(el => el.style.opacity = 1);
    one('.ms-portal-actions').style.opacity = 1;
    one('.ms-portal-lead').style.opacity = 1;
    ready.style.display = 'none';
  };
  if (!gsap || !ScrollTrigger) { revealStatic(); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize:true });
  if ('scrollRestoration' in history) history.scrollRestoration='manual';
  scrollTo(0,0);
  document.documentElement.classList.add('ms-portal-loading');
  const number = {n:0};
  const writeNumber = () => { if(counter) counter.textContent=String(Math.max(0,Math.min(100,Math.round(number.n)))).padStart(2,'0'); };
  const toNumber = gsap.quickTo(number,'n',{duration:.4,ease:'power1.out',onUpdate:writeNumber});
  const hasHover=matchMedia('(hover: hover) and (pointer: fine)').matches;
  let imageUrl=null;
  let live=true;
  const load = async () => {
    const loading=[];
    loading.push((async () => {
      try {
        const response = await fetch('4.JPG');
        if (!response.ok) throw new Error('Unable to load portfolio photo: HTTP ' + response.status);
        if (response.body && response.body.getReader) {
          const reader = response.body.getReader();
          const length = Number(response.headers.get('content-length')) || 0;
          const chunks = [];
          let bytes = 0;
          for (;;) {
            const {done,value}=await reader.read();
            if (done) break;
            chunks.push(value);
            bytes += value.byteLength;
            if (length && !reduced) toNumber(Math.min(88,bytes/length*88));
          }
          if (!live) return;
          imageUrl=URL.createObjectURL(new Blob(chunks,{type:response.headers.get('content-type') || 'image/jpeg'}));
          photo.src=imageUrl;
        } else {
          photo.src='4.JPG';
        }
        await photo.decode();
      } catch (e) {
        console.warn('[Engineering portal] Photo preloading failed, using original URL.',e);
        photo.src='4.JPG';
      }
    })());
    if (document.fonts && document.fonts.load) loading.push(Promise.allSettled([
      document.fonts.load('300 1em Geist'),
      document.fonts.load('400 1em Geist'),
      document.fonts.load('500 1em Geist')
    ]));
    await Promise.race([Promise.allSettled(loading), new Promise(resolve=>setTimeout(resolve,6500))]);
    if (!live) return;
    await boot();
  };
  function boot() {
    let progress = {p:0};
    let readyPlayed=false;
    const heroWords=all('.ms-portal-headline .ms-word');
    const readyWordsTop=all('.ms-portal-ready-title--top .ms-word');
    const readyWordsBottom=all('.ms-portal-ready-title--bottom .ms-word');
    const tlReady=gsap.timeline({paused:true});
    const fadeIn=(selector,at) => tlReady.fromTo(selector,{opacity:0,filter:'blur(10px)',y:10},{opacity:1,filter:'blur(0px)',y:0,duration:.6,clearProps:'filter',ease:'power2.out'},at);
    tlReady.fromTo('.ms-portal-network',{opacity:0},{opacity:1,duration:.5,ease:'power1.out'},0);
    tlReady.fromTo('.ms-portal-network-float',{rotationY:-65,rotation:14,scale:.76,filter:'blur(14px) brightness(1.35)'},{rotationY:0,rotation:0,scale:1,filter:'blur(0px) brightness(1)',duration:1.3,ease:'power3.out',clearProps:'filter'},0);
    tlReady.fromTo(readyWordsTop,{opacity:0,filter:'blur(12px)',yPercent:25},{opacity:1,filter:'blur(0px)',yPercent:0,stagger:.09,duration:.7,ease:'power2.out',clearProps:'filter,transform'},.16);
    tlReady.fromTo(readyWordsBottom,{opacity:0,filter:'blur(12px)',yPercent:25},{opacity:1,filter:'blur(0px)',yPercent:0,stagger:.09,duration:.7,ease:'power2.out',clearProps:'filter,transform'},.3);
    tlReady.to('.ms-portal-watermark',{opacity:1,duration:1},.4);
    fadeIn('.ms-portal-more',.55);
    fadeIn('.ms-portal-ready-copy',.66);
    fadeIn('.ms-portal-ready-action',.77);
    fadeIn('.ms-portal-scroll',.9);
    if (!reduced) {
      gsap.to('.ms-portal-network-face',{y:-8,rotation:1,duration:3.2,yoyo:true,repeat:-1,ease:'sine.inOut'});
    }
    let pointerX=null, pointerY=null;
    if (!reduced && hasHover) {
      const rotateY=gsap.quickTo('.ms-portal-network-face','rotationY',{duration:.8,ease:'power2.out'});
      const rotateX=gsap.quickTo('.ms-portal-network-face','rotationX',{duration:.8,ease:'power2.out'});
      stage.addEventListener('pointermove',ev=>{
        if(progress.p<.76)return;
        rotateY((ev.clientX/innerWidth-.5)*16);
        rotateX(-(ev.clientY/innerHeight-.5)*12);
      });
    }
    const render=() => {
      const p=progress.p;
      if (reduced) {
        const reveal=segment(p,.3,.6);
        gsap.set(ready,{opacity:reveal,visibility:reveal===0?'hidden':'visible'});
        gsap.set(hero,{opacity:1-reveal});
        nav.classList.toggle('ms-dark',p>.55);
        if(p>=.6 && !readyPlayed){tlReady.play();readyPlayed=true;}
        if(p<.3 && readyPlayed){tlReady.reverse();readyPlayed=false;}
        return;
      }
      const turn=inOut(segment(p,.06,.44));
      const grow=Math.pow(segment(p,.44,.83),3);
      const bounds=portal.getBoundingClientRect();
      const target=Math.max(innerWidth/Math.max(bounds.width,200),innerHeight/Math.max(bounds.height,300))*2.4;
      // getBoundingClientRect grows as we scale; use the natural element size, not rendered size.
      const naturalW=portal.offsetWidth || 250, naturalH=portal.offsetHeight || 400;
      const scaleTo=Math.max(innerWidth/naturalW,innerHeight/naturalH)*2.4;
      gsap.set(photo,{scale:1+.18*inOut(segment(p,0,.7))});
      gsap.set(portal,{xPercent:-50,yPercent:-50,left:(61-11*grow)+'%',top:(49+1*grow)+'%',rotationY:-23*(1-turn),rotation:-5*(1-turn),scale:1+(scaleTo-1)*grow});
      const rim= Math.max(segment(p,.1,.4),0);
      portal.classList.toggle('ms-glow',rim>.08);
      portal.style.boxShadow = '0 0 '+(14+70*rim)+'px '+(1+7*rim)+'px rgba(255,255,255,'+(.12+.7*rim)+'),inset 0 1px 18px rgba(255,255,255,.32)';
      gsap.set(portalFill,{opacity:segment(p,.43,.7)});
      gsap.set('.ms-portal-glass-label, .ms-portal-signal, .ms-portal-glass-caption',{opacity:1-segment(p,.3,.58)});
      gsap.set(hero,{y:-120*segment(p,.2,.8),opacity:1-segment(p,.54,.78)});
      const value=segment(p,.79,.83);
      gsap.set(ready,{opacity:value,visibility:value===0?'hidden':'visible'});
      nav.classList.toggle('ms-dark',p>=.78);
      if(p>=.8 && !readyPlayed){tlReady.timeScale(1).play();readyPlayed=true;}
      else if(p<.74 && readyPlayed){tlReady.timeScale(2).reverse();readyPlayed=false;}
    };
    if (reduced) {
      gsap.set(media,{scale:1,opacity:0});
      gsap.set('.ms-portal-kicker,.ms-portal-actions,.ms-portal-lead',{opacity:0});
      gsap.set(heroWords,{opacity:0});
      const enter=gsap.timeline({onComplete:()=>{
        document.documentElement.classList.remove('ms-portal-loading');
        ScrollTrigger.refresh();
      }});
      preloader.remove();
      enter.to(media,{opacity:1,duration:.4,ease:'power1.out'},0).to(nav,{opacity:1,duration:.4},0)
        .to(['.ms-portal-kicker','.ms-portal-actions','.ms-portal-lead'],{opacity:1,duration:.4},0)
        .to(heroWords,{opacity:1,duration:.4},0);
    } else {
      const enter=gsap.timeline({onComplete:()=>{
        document.documentElement.classList.remove('ms-portal-loading');
        ScrollTrigger.refresh();
      }});
      enter.to(number,{n:100,duration:.5,ease:'power1.out',onUpdate:writeNumber},0)
        .to(counterRow,{opacity:0,duration:.15},.5)
        .to(media,{scale:1,duration:.85,ease:'power2.out'},.6)
        .to(loaderWord,{opacity:0,duration:.4,ease:'power1.out'},.7)
        .to(preloader,{opacity:0,duration:.3,pointerEvents:'none',onComplete:()=>{preloader.remove()}},1.06)
        .fromTo('.ms-portal-kicker',{opacity:0,filter:'blur(10px)'},{opacity:1,filter:'blur(0px)',clearProps:'filter',duration:.6,ease:'power2.out'},1.1)
        .fromTo(nav,{opacity:0,filter:'blur(8px)'},{opacity:1,filter:'blur(0px)',clearProps:'filter',duration:.6,ease:'power2.out'},1.15)
        .fromTo(heroWords,{opacity:0,yPercent:25,filter:'blur(12px)'},{opacity:1,yPercent:0,filter:'blur(0px)',clearProps:'filter,transform',stagger:.09,duration:.7,ease:'power2.out'},1.25)
        .fromTo('.ms-portal-actions',{opacity:0,filter:'blur(10px)'},{opacity:1,filter:'blur(0px)',clearProps:'filter',duration:.6,ease:'power2.out'},1.55)
        .fromTo('.ms-portal-lead',{opacity:0,filter:'blur(10px)'},{opacity:1,filter:'blur(0px)',clearProps:'filter',duration:.6,ease:'power2.out'},1.85);
    }
    const scrollDistance=()=>'+='+Math.max(660,innerHeight*1.5);
    gsap.to(progress,{p:1,ease:'none',scrollTrigger:{
      trigger:stage,start:'top top',end:scrollDistance,pin:true,scrub:reduced?true:.6,
      invalidateOnRefresh:true,onUpdate:render
    },onUpdate:render});
    render();
  }
  // Glass-disc cursor, matching the hero visual language and hidden on touch devices.
  if(hasHover && !reduced){
    const cursor=document.createElement('div');
    cursor.className='ms-portal-cursor';cursor.setAttribute('aria-hidden','true');
    document.body.append(cursor);
    const aim={x:-50,y:-50},pos={x:-50,y:-50};
    let last=performance.now(),active=false;
    addEventListener('pointermove',e=>{
      const inside=stage.contains(document.elementFromPoint(e.clientX,e.clientY));
      aim.x=e.clientX-16;aim.y=e.clientY-16;active=inside;
      cursor.style.opacity=active?1:0;
    },{passive:true});
    document.addEventListener('mouseout',e=>{if(!e.relatedTarget)cursor.style.opacity=0});
    function follow(now){
      if(!live)return;
      const k=1-Math.pow(.7,(now-last)/16.67);
      last=now;
      pos.x+=(aim.x-pos.x)*k;pos.y+=(aim.y-pos.y)*k;
      cursor.style.transform='translate3d('+pos.x+'px,'+pos.y+'px,0)';
      requestAnimationFrame(follow);
    }
    requestAnimationFrame(follow);
  }
  addEventListener('pagehide',()=>{
    live=false;
    document.documentElement.classList.remove('ms-portal-loading');
    if(imageUrl)URL.revokeObjectURL(imageUrl);
  },{once:true});
  // If the asset fails to load, gracefully continue to an accessible hero.
  load().catch(e=>{console.warn('[Engineering portal] Intro fallback',e);revealStatic();});
})();
