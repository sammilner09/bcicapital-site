(function(){
  // pinned nav border + mobile menu
  var nav=document.getElementById('nav');
  addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>8)},{passive:true});
  var mb=document.getElementById('menuBtn'),ln=document.getElementById('links');
  mb.addEventListener('click',function(){var o=ln.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
  ln.addEventListener('click',function(e){if(e.target.tagName==='A'){ln.classList.remove('open')}});

  // fade-in on scroll
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el,i){el.style.transitionDelay=((i%3)*90)+'ms';io.observe(el)});
  } else els.forEach(function(el){el.classList.add('in')});

  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Antigravity-style particle field: short dashes in a slowly turning ring that move away from the cursor
  function Field(canvas,opts){
    var ctx=canvas.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2),W,H,cx,cy,parts=[],mouse={x:-9999,y:-9999,on:false},t=0;
    function build(){
      var r=canvas.getBoundingClientRect();W=r.width;H=r.height;
      canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      cx=W/2;cy=H*(opts.cy||.5);
      var n=Math.min(opts.max||900,Math.round(W*H/(opts.density||2300)));
      var maxR=Math.hypot(W,H)*.62,minR=Math.min(W,H)*(opts.hole||.18);
      parts=[];
      for(var i=0;i<n;i++){
        var a=Math.random()*Math.PI*2;
        var rr=minR+Math.pow(Math.random(),.8)*(maxR-minR);
        var gold=Math.random()<opts.goldShare;
        parts.push({a:a,r:rr,ox:0,oy:0,vx:0,vy:0,
          len:2.5+Math.random()*4.5,
          spin:(opts.spin||.00018)*(0.6+Math.random()*.8),
          wob:Math.random()*Math.PI*2,
          col:gold?opts.gold:opts.navy[(Math.random()*opts.navy.length)|0],
          alpha:.35+Math.random()*.65});
      }
    }
    function frame(){
      t+=1;ctx.clearRect(0,0,W,H);
      var holeRx=W*(opts.textRx||.3),holeRy=H*(opts.textRy||.26);
      for(var i=0;i<parts.length;i++){
        var p=parts[i];
        if(!reduce)p.a+=p.spin;
        var breathe=1+Math.sin(t*.006+p.wob)*.012;
        var hx=cx+Math.cos(p.a)*p.r*breathe*(W/Math.max(W,H)*1.05+.25);
        var hy=cy+Math.sin(p.a)*p.r*breathe*(H/Math.max(W,H)*1.05+.25);
        // mouse push
        if(mouse.on){
          var dx=hx+p.ox-mouse.x,dy=hy+p.oy-mouse.y,d2=dx*dx+dy*dy,R=opts.mouseR||150;
          if(d2<R*R){var d=Math.sqrt(d2)||1,f=(1-d/R)*2.2;p.vx+=dx/d*f;p.vy+=dy/d*f}
        }
        p.vx+=-p.ox*.03;p.vy+=-p.oy*.03;p.vx*=.86;p.vy*=.86;p.ox+=p.vx;p.oy+=p.vy;
        var x=hx+p.ox,y=hy+p.oy;
        if(x<-10||x>W+10||y<-10||y>H+10)continue;
        // fade inside the text area so copy stays readable
        var ex=(x-cx)/holeRx,ey=(y-cy)/holeRy,e=ex*ex+ey*ey,fade=e<1?Math.max(0,(e-.55)/.45):1;
        if(fade<=0)continue;
        var ang=Math.atan2(y-cy,x-cx)+Math.sin(t*.01+p.wob)*.25;
        var L=p.len+Math.min(6,Math.hypot(p.vx,p.vy)*1.4);
        ctx.globalAlpha=p.alpha*fade;ctx.strokeStyle=p.col;ctx.lineWidth=opts.lw||2;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(x-Math.cos(ang)*L/2,y-Math.sin(ang)*L/2);ctx.lineTo(x+Math.cos(ang)*L/2,y+Math.sin(ang)*L/2);ctx.stroke();
      }
      ctx.globalAlpha=1;requestAnimationFrame(frame);
    }
    var host=opts.host||canvas;
    host.addEventListener('pointermove',function(e){var r=canvas.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;mouse.on=true});
    host.addEventListener('pointerleave',function(){mouse.on=false});
    var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,150)});
    build();frame();
  }
  var c1=document.getElementById('particles');
  if(c1)Field(c1,{host:c1.parentNode,navy:['#0F1623','#1D2940','#3A4A6B'],gold:'#C9A227',goldShare:.38,density:(innerWidth<700?800:1700),max:1100,hole:.16,textRx:(innerWidth<700?.56:.34),textRy:(innerWidth<700?.36:.3),cy:.52});

  // timeline animation
  var tl=document.getElementById('timeline');
  if(tl&&'IntersectionObserver' in window){var tio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){tl.classList.add('in');tio.disconnect()}})},{threshold:.25});tio.observe(tl)}else if(tl)tl.classList.add('in');

  // Raven made of particles
  var rc=document.getElementById('ravenCanvas');
  if(rc){
    var rctx=rc.getContext('2d'),rdpr=Math.min(devicePixelRatio||1,2),RW,RH,pts=[],started=false,rt0=0;
    // raven silhouette (perched, facing left) in a 100x80 box
    var shape=[[14,30],[22,24],[30,22],[36,23],[40,26],[46,27],[56,30],[66,34],[76,40],[86,46],[96,50],[86,51],[78,50],[70,53],[62,57],[58,60],[56,64],[57,72],[54,72],[52,64],[48,64],[48,72],[45,72],[46,63],[40,60],[34,54],[31,46],[30,38],[27,34],[20,33],[8,34],[14,31]];
    function inPoly(x,y){var c=false;for(var i=0,j=shape.length-1;i<shape.length;j=i++){var a=shape[i],b=shape[j];if(((a[1]>y)!=(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c}return c}
    function rbuild(){
      var r=rc.getBoundingClientRect();RW=r.width;RH=r.height;rc.width=RW*rdpr;rc.height=RH*rdpr;rctx.setTransform(rdpr,0,0,rdpr,0,0);
      var sc=Math.min(RW/100,RH/80)*.95,ox=(RW-100*sc)/2,oy=(RH-80*sc)/2;pts=[];
      var step=RW<500?1.55:1.35;
      for(var y=0;y<80;y+=step)for(var x=0;x<100;x+=step){var jx=x+(Math.random()-.5)*step,jy=y+(Math.random()-.5)*step;if(inPoly(jx,jy)){
        pts.push({tx:ox+jx*sc,ty:oy+jy*sc,x:Math.random()*RW,y:Math.random()*RH,ph:Math.random()*6.28,eye:false,
          col:Math.random()<.18?'#C9A227':(Math.random()<.5?'#0F1623':'#1D2940'),len:2+Math.random()*2.5,ang:Math.random()*6.28})}}
      pts.push({tx:ox+24*sc,ty:oy+27*sc,x:RW/2,y:RH/2,ph:0,eye:true,col:'#C9A227',len:0,ang:0});
    }
    function rframe(ts){
      if(!rt0)rt0=ts;var t=(ts-rt0)/1000,k=Math.min(1,t/2.2),e=1-Math.pow(1-k,3);
      rctx.clearRect(0,0,RW,RH);
      for(var i=0;i<pts.length;i++){var p=pts[i];
        var wx=Math.sin(t*1.3+p.ph)*1.4,wy=Math.cos(t*1.1+p.ph)*1.4;
        var x=p.x+(p.tx-p.x)*e+wx,y=p.y+(p.ty-p.y)*e+wy;
        if(p.eye){rctx.globalAlpha=e;rctx.fillStyle=p.col;rctx.beginPath();rctx.arc(x,y,4,0,6.28);rctx.fill();continue}
        var a=p.ang+t*.4;rctx.globalAlpha=.85;rctx.strokeStyle=p.col;rctx.lineWidth=2;rctx.lineCap='round';
        rctx.beginPath();rctx.moveTo(x-Math.cos(a)*p.len/2,y-Math.sin(a)*p.len/2);rctx.lineTo(x+Math.cos(a)*p.len/2,y+Math.sin(a)*p.len/2);rctx.stroke()}
      rctx.globalAlpha=1;requestAnimationFrame(rframe)}
    rbuild();
    var go=function(){if(!started){started=true;requestAnimationFrame(rframe)}};
    if('IntersectionObserver' in window){new IntersectionObserver(function(es){if(es[0].isIntersecting)go()},{threshold:.2}).observe(rc)}else go();
    addEventListener('resize',function(){rbuild()});
  }
})();
