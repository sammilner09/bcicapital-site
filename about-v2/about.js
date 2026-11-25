(function(){
  var nav=document.getElementById('nav');
  addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>8)},{passive:true});
  var mb=document.getElementById('menuBtn'),ln=document.getElementById('links');
  if(mb&&ln){
    mb.addEventListener('click',function(){var o=ln.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
    ln.addEventListener('click',function(e){if(e.target.tagName==='A')ln.classList.remove('open')});
  }

  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone=matchMedia('(max-width:600px)').matches;

  var els=document.querySelectorAll('.reveal');
  if(reduce){
    els.forEach(function(el){el.classList.add('in')});
  }else if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1,rootMargin:'0px 0px -32px 0px'});
    els.forEach(function(el,i){
      // slightly less stagger than home; even less on phones
      el.style.transitionDelay=(phone?((i%2)*40):(i%3)*60)+'ms';
      io.observe(el);
    });
  }else els.forEach(function(el){el.classList.add('in')});

  var path=document.getElementById('path');
  if(path){
    if(reduce) path.classList.add('in');
    else if('IntersectionObserver' in window){
      var pio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){path.classList.add('in');pio.disconnect()}})},{threshold:.25});
      pio.observe(path);
    }else path.classList.add('in');
  }

  // Particles only behind the Why / mission section. Skip on phones and when reduced motion is on.
  var canvas=document.getElementById('whyParticles');
  if(canvas&&!reduce&&!phone){
    var ctx=canvas.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2),W,H,cx,cy,parts=[],t=0,running=false;
    function build(){
      var r=canvas.getBoundingClientRect();W=r.width;H=r.height;
      canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      cx=W/2;cy=H*.48;
      var n=Math.min(700,Math.round(W*H/2200));
      var maxR=Math.hypot(W,H)*.62,minR=Math.min(W,H)*.14;
      parts=[];
      for(var i=0;i<n;i++){
        var a=Math.random()*Math.PI*2;
        var rr=minR+Math.pow(Math.random(),.8)*(maxR-minR);
        var gold=Math.random()<.38;
        parts.push({a:a,r:rr,len:2.5+Math.random()*4.5,
          spin:.00016*(0.6+Math.random()*.8),wob:Math.random()*Math.PI*2,
          col:gold?'#C9A227':['#0F1623','#1D2940','#3A4A6B'][(Math.random()*3)|0],
          alpha:.28+Math.random()*.5});
      }
    }
    function frame(){
      if(!running)return;
      t+=1;ctx.clearRect(0,0,W,H);
      var holeRx=W*.42,holeRy=H*.38;
      for(var i=0;i<parts.length;i++){
        var p=parts[i];
        p.a+=p.spin;
        var breathe=1+Math.sin(t*.006+p.wob)*.01;
        var x=cx+Math.cos(p.a)*p.r*breathe*(W/Math.max(W,H)*1.05+.25);
        var y=cy+Math.sin(p.a)*p.r*breathe*(H/Math.max(W,H)*1.05+.25);
        if(x<-10||x>W+10||y<-10||y>H+10)continue;
        var ex=(x-cx)/holeRx,ey=(y-cy)/holeRy,e=ex*ex+ey*ey,fade=e<1?Math.max(0,(e-.5)/.5):1;
        if(fade<=0)continue;
        var ang=Math.atan2(y-cy,x-cx)+Math.sin(t*.01+p.wob)*.2;
        ctx.globalAlpha=p.alpha*fade;ctx.strokeStyle=p.col;ctx.lineWidth=2;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(x-Math.cos(ang)*p.len/2,y-Math.sin(ang)*p.len/2);ctx.lineTo(x+Math.cos(ang)*p.len/2,y+Math.sin(ang)*p.len/2);ctx.stroke();
      }
      ctx.globalAlpha=1;requestAnimationFrame(frame);
    }
    function start(){if(running)return;running=true;build();frame()}
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){if(es[0].isIntersecting)start()},{threshold:.15}).observe(canvas);
    }else start();
    var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,150)});
  }
})();
