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
  var snap=document.documentElement.hasAttribute('data-screenshot');

  // Background particles only behind the later (raven) section.
  // Phones keep a lighter, slower field. Reduced motion skips motion entirely.
  var canvas=document.getElementById('laterParticles');
  if(canvas&&!reduce){
    var ctx=canvas.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2),W,H,cx,cy,parts=[],t=0,running=false;
    function build(){
      var r=canvas.getBoundingClientRect();W=r.width;H=r.height;
      canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      cx=W/2;cy=H*.5;
      var n=phone?Math.min(220,Math.round(W*H/5000)):Math.min(700,Math.round(W*H/2200));
      var maxR=Math.hypot(W,H)*.62,minR=Math.min(W,H)*.12;
      parts=[];
      for(var i=0;i<n;i++){
        var a=Math.random()*Math.PI*2;
        var rr=minR+Math.pow(Math.random(),.8)*(maxR-minR);
        var gold=Math.random()<.38;
        parts.push({a:a,r:rr,len:2.5+Math.random()*4.5,
          spin:(phone?.00008:.00016)*(0.6+Math.random()*.8),wob:Math.random()*Math.PI*2,
          col:gold?'#C9A227':['#0F1623','#1D2940','#3A4A6B'][(Math.random()*3)|0],
          alpha:.28+Math.random()*.5});
      }
    }
    function frame(){
      if(!running)return;
      t+=phone?.6:1;ctx.clearRect(0,0,W,H);
      var holeRx=W*.36,holeRy=H*.36;
      for(var i=0;i<parts.length;i++){
        var p=parts[i];
        p.a+=p.spin;
        var breathe=1+Math.sin(t*.006+p.wob)*.01;
        var x=cx+Math.cos(p.a)*p.r*breathe*(W/Math.max(W,H)*1.05+.25);
        var y=cy+Math.sin(p.a)*p.r*breathe*(H/Math.max(W,H)*1.05+.25);
        if(x<-10||x>W+10||y<-10||y>H+10)continue;
        var ex=(x-cx)/holeRx,ey=(y-cy)/holeRy,e=ex*ex+ey*ey,fade=e<1?Math.max(0,(e-.45)/.55):1;
        if(fade<=0)continue;
        var ang=Math.atan2(y-cy,x-cx)+Math.sin(t*.01+p.wob)*.2;
        ctx.globalAlpha=p.alpha*fade;ctx.strokeStyle=p.col;ctx.lineWidth=2;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(x-Math.cos(ang)*p.len/2,y-Math.sin(ang)*p.len/2);ctx.lineTo(x+Math.cos(ang)*p.len/2,y+Math.sin(ang)*p.len/2);ctx.stroke();
      }
      ctx.globalAlpha=1;requestAnimationFrame(frame);
    }
    function start(){if(running)return;running=true;build();frame()}
    window.__startLaterParticles=start;
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){if(es[0].isIntersecting)start()},{threshold:.12}).observe(canvas);
    }else start();
    var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,150)});
  }

  // Bigger, slower particle raven in the later section only.
  var rc=document.getElementById('ravenCanvas');
  if(rc){
    var rctx=rc.getContext('2d'),rdpr=Math.min(devicePixelRatio||1,2),RW,RH,pts=[],started=false,rt0=0,formed=false;
    // Spread-wing raven traced in /assets/raven-option21.svg (logo option 21, bird only). ViewBox 300x127.
    var BW=300,BH=127;
    var shape=[[150,2.5],[145.61,12.39],[141.05,19.35],[141,27.54],[139.88,30.86],[135,35.5],[102.23,18.53],[89.15,13.5],[73.12,9.5],[66.17,9.5],[64.06,8.5],[39.84,9.5],[15.79,15.5],[3.56,19.53],[3,20.51],[3.07,28.06],[11.93,30.97],[9.5,32.47],[3.13,33.87],[3.1,40.1],[4.44,41.44],[9.46,41.5],[11.97,43],[3.39,46.61],[3.17,50.17],[4.52,51.5],[15,52.05],[14.78,53.22],[6.29,60.29],[22.22,59.5],[23.64,58.64],[23.97,61],[20.02,65.05],[19.59,67.5],[30.39,64.61],[35.39,64.51],[59.9,75.5],[62.01,74.5],[75.28,74.5],[76.76,73.5],[99.09,72.5],[100.6,71.57],[108.78,71.5],[110.89,70.5],[131.82,69.82],[137.88,78.06],[138,80.53],[123.42,111.42],[147.55,123.32],[150,123.5],[152.45,123.32],[176.58,111.42],[162,80.53],[162.12,78.06],[168.18,69.82],[189.11,70.5],[191.22,71.5],[199.4,71.57],[200.91,72.5],[223.24,73.5],[224.72,74.5],[237.99,74.5],[240.1,75.5],[264.61,64.51],[269.61,64.61],[280.41,67.5],[279.98,65.05],[276.03,61],[276.36,58.64],[277.78,59.5],[293.71,60.29],[285.22,53.22],[285,52.05],[295.48,51.5],[296.83,50.17],[296.61,46.61],[288.03,43],[290.54,41.5],[295.56,41.44],[296.9,40.1],[296.87,33.87],[290.5,32.47],[288.07,30.97],[296.93,28.06],[297,20.51],[296.44,19.53],[284.21,15.5],[260.16,9.5],[235.94,8.5],[233.83,9.5],[226.88,9.5],[210.85,13.5],[197.77,18.53],[165,35.5],[160.12,30.86],[159,27.54],[158.95,19.35],[154.39,12.39]];
    function inPoly(x,y){var c=false;for(var i=0,j=shape.length-1;i<shape.length;j=i++){var a=shape[i],b=shape[j];if(((a[1]>y)!=(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c}return c}
    function rbuild(){
      var r=rc.getBoundingClientRect();RW=r.width;RH=r.height;rc.width=RW*rdpr;rc.height=RH*rdpr;rctx.setTransform(rdpr,0,0,rdpr,0,0);
      // Bigger than the home teaser: fill the stage width without clipping the wingtips.
      var sc=Math.min(RW/BW,RH/BH)*.96,ox=(RW-BW*sc)/2,oy=(RH-BH*sc)/2;pts=[];
      var step=phone?4.5:2.85;
      for(var y=0;y<BH;y+=step)for(var x=0;x<BW;x+=step){var jx=x+(Math.random()-.5)*step,jy=y+(Math.random()-.5)*step;if(inPoly(jx,jy)){
        pts.push({tx:ox+jx*sc,ty:oy+jy*sc,x:Math.random()*RW,y:Math.random()*RH,ph:Math.random()*6.28,
          col:Math.random()<.18?'#C9A227':(Math.random()<.5?'#0F1623':'#1D2940'),len:2.4+Math.random()*3,ang:Math.random()*6.28})}}
      if(reduce||snap){
        for(var i=0;i<pts.length;i++){pts[i].x=pts[i].tx;pts[i].y=pts[i].ty}
        formed=true;
      }
    }
    function rdraw(t,e){
      rctx.clearRect(0,0,RW,RH);
      for(var i=0;i<pts.length;i++){var p=pts[i];
        var wx=(reduce||snap)?0:Math.sin(t*.7+p.ph)*1.6,wy=(reduce||snap)?0:Math.cos(t*.55+p.ph)*1.6;
        var x=p.x+(p.tx-p.x)*e+wx,y=p.y+(p.ty-p.y)*e+wy;
        var a=p.ang+((reduce||snap)?0:t*.22);rctx.globalAlpha=.85;rctx.strokeStyle=p.col;rctx.lineWidth=2.2;rctx.lineCap='round';
        rctx.beginPath();rctx.moveTo(x-Math.cos(a)*p.len/2,y-Math.sin(a)*p.len/2);rctx.lineTo(x+Math.cos(a)*p.len/2,y+Math.sin(a)*p.len/2);rctx.stroke()}
      rctx.globalAlpha=1;
    }
    function rframe(ts){
      if(!rt0)rt0=ts;
      // Slower formation than the home teaser (2.2s): about 5s, slower still on phones.
      var dur=phone?7:5;
      var t=(ts-rt0)/1000,k=formed?1:Math.min(1,t/dur),e=1-Math.pow(1-k,3);
      rdraw(t,e);
      if(!(reduce||snap)) requestAnimationFrame(rframe);
    }
    rbuild();
    var go=function(){if(!started){started=true;if(reduce||snap){rdraw(0,1)}else requestAnimationFrame(rframe)}};
    window.__ravenFormNow=function(){
      snap=true;formed=true;for(var i=0;i<pts.length;i++){pts[i].x=pts[i].tx;pts[i].y=pts[i].ty}
      if(!started) go(); else rdraw(0,1);
    };
    if('IntersectionObserver' in window){new IntersectionObserver(function(es){if(es[0].isIntersecting)go()},{threshold:.15}).observe(rc)}else go();
    addEventListener('resize',function(){rbuild();if(started&&(reduce||snap))rdraw(0,1)});
  }
})();
