/* =====================================================================
   SCANNER v4 — acha a PÍLULA do código (retângulo escuro + texto branco)
   em qualquer posição/rotação do frame → recorta → OCR só ali
   Mantém: window.scanMatch, window.stopScanner, todos os IDs de UI
   ===================================================================== */
(function(){
"use strict";

var CFG={
  WORK_W:640,            // largura de trabalho p/ detecção (rápido)
  BURST:4,               // tentativas de OCR por leitura
  OCR_H:72,              // altura do crop enviado ao OCR
  AUTO_SCORE:.86, AUTO_MARGIN:.14, ASK_SCORE:.52,
  PRIOR:.05, LOOP_MS:900, COOLDOWN:1600,
  FALLBACK_ROI:{x:.05,y:.25,w:.90,h:.50}   // usado se a pílula não for achada
};
var CONF={"0":"O","O":"0","1":"I","I":"1","5":"S","S":"5","8":"B","B":"8",
          "2":"Z","Z":"2","6":"G","G":"6","4":"A","A":"4","7":"T","T":"7"};

var video,det,dctx,crop,cctx,stream=null,worker=null,loop=null;
var busy=false,lastTeam=null,lastKey="",lastAt=0,session=[];

function E(id){return document.getElementById(id)}
function log(h){var l=E("scanLog");if(l)l.innerHTML=h+"<br>"+l.innerHTML}
function norm(s){return String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}
function flash(bad){
  var f=E("scanFlash");if(!f)return;
  f.className="scan-flash on"+(bad?" bad":"");
  setTimeout(function(){f.className="scan-flash"+(bad?" bad":"")},130);
}
function feedback(bad){
  var s=E("scanSound"); if(!s||!s.checked)return;
  if(navigator.vibrate)navigator.vibrate(bad?[40,60,40]:28);
  try{
    var A=window.AudioContext||window.webkitAudioContext;if(!A)return;
    var c=new A(),o=c.createOscillator(),g=c.createGain();
    o.frequency.value=bad?260:920;o.connect(g);g.connect(c.destination);
    g.gain.setValueAtTime(.07,c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.13);
    o.start();o.stop(c.currentTime+.14);
  }catch(e){}
}

/* ---------- CATÁLOGO ---------- */
var CATALOG=[],CODES_UNIQ=null;
function buildCatalog(){
  CATALOG=[];
  teams.forEach(function(t){
    numsOf(t).forEach(function(n){CATALOG.push({code:t.code,num:n,key:t.code+pad(n)})});
  });
  CODES_UNIQ=teams.map(function(t){return t.code});
  window.SCAN_CATALOG_SIZE=CATALOG.length;
}
function codesUniq(){return CODES_UNIQ||[]}

/* ---------- distância tolerante a confusões de OCR ---------- */
function dist(a,b){
  var m=a.length,n=b.length,i,j,dp=[];
  for(i=0;i<=m;i++)dp[i]=[i];
  for(j=0;j<=n;j++)dp[0][j]=j;
  for(i=1;i<=m;i++)for(j=1;j<=n;j++){
    var sub=a[i-1]===b[j-1]?0:(CONF[a[i-1]]===b[j-1]?.28:1);
    dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+sub);
  }
  return dp[m][n];
}
function sim(a,b){if(!a||!b)return 0;return Math.max(0,1-dist(a,b)/Math.max(a.length,b.length))}

/* ---------- tokens ---------- */
function tokens(raw){
  var s=norm(raw),out=[],re,m;
  if(s.length<2)return out;
  re=/([A-Z]{2,5})[^A-Z0-9]{0,2}?(\d{1,2})(?!\d)/g;
  while((m=re.exec(s))!==null)out.push({s:m[1],n:m[2]});
  re=/(\d{1,2})[^A-Z0-9]{0,2}?([A-Z]{2,5})/g;
  while((m=re.exec(s))!==null)out.push({s:m[2],n:m[1]});
  if(!out.length){
    var L=s.replace(/[0-9]/g,""),D=s.replace(/[^0-9]/g,"");
    if(L.length>=2&&D.length)out.push({s:L.slice(0,4),n:D.slice(-2)});
  }
  return out;
}

/* ---------- match 2 estágios ---------- */
function match(raw,topN){
  var tks=tokens(raw);if(!tks.length)return [];
  var lockEl=E("scanLockTeam"),lock=lockEl&&lockEl.checked;
  var best={};
  tks.forEach(function(tk){
    var qs=tk.s,qn=parseInt(tk.n,10);
    if(isNaN(qn))return;
    var sigs=[];
    codesUniq().forEach(function(code){
      var ss=sim(qs,code);
      if(ss>=.34)sigs.push({code:code,ss:ss});
    });
    if(!sigs.length)return;
    sigs.sort(function(a,b){return b.ss-a.ss});
    sigs=sigs.slice(0,6);
    sigs.forEach(function(s){
      var t=T[s.code];if(!t)return;
      numsOf(t).forEach(function(num){
        var sn;
        if(num===qn)sn=1;
        else{
          var a=pad(qn),b=pad(num);
          sn=(a.length===b.length&&sim(a,b)>=.5)?.45:0;
        }
        if(!sn)return;
        var sc=s.ss*.6+sn*.4;
        if(lastTeam&&s.code===lastTeam)sc+=CFG.PRIOR;
        if(lock&&lastTeam&&s.code!==lastTeam)sc-=.35;
        sc=Math.max(0,Math.min(1,sc));
        var key=s.code+pad(num);
        if(!best[key]||best[key].score<sc)best[key]={code:s.code,num:num,key:key,score:sc};
      });
    });
  });
  return Object.keys(best).map(function(k){return best[k]})
    .sort(function(a,b){return b.score-a.score}).slice(0,topN||3);
}
window.scanMatch=match;

/* =====================================================================
   DETECÇÃO DA PÍLULA
   ===================================================================== */
function frameGray(){
  var vw=video.videoWidth,vh=video.videoHeight;
  if(!vw||!vh)return null;
  var sc=Math.min(1,CFG.WORK_W/vw);
  var W=det.width=Math.round(vw*sc),H=det.height=Math.round(vh*sc);
  dctx.drawImage(video,0,0,W,H);
  var d=dctx.getImageData(0,0,W,H).data,g=new Uint8Array(W*H),sum=0;
  for(var i=0,p=0;p<g.length;i+=4,p++){
    g[p]=(d[i]*77+d[i+1]*151+d[i+2]*28)>>8;
    sum+=g[p];
  }
  return {g:g,W:W,H:H,mean:sum/g.length,scale:sc};
}

/* connected components sobre pixels ESCUROS */
function darkBlobs(f,factor){
  var W=f.W,H=f.H,g=f.g,t=f.mean*factor;
  var lab=new Int8Array(W*H),q=new Int32Array(W*H),out=[];
  for(var s=0;s<g.length;s++){
    if(g[s]>=t||lab[s])continue;
    var head=0,tail=0;q[tail++]=s;lab[s]=1;
    var minX=W,maxX=0,minY=H,maxY=0,n=0;
    while(head<tail){
      var p=q[head++],x=p%W,y=(p/W)|0;n++;
      if(x<minX)minX=x; if(x>maxX)maxX=x;
      if(y<minY)minY=y; if(y>maxY)maxY=y;
      for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){
        var nx=x+dx,ny=y+dy;
        if(nx<0||ny<0||nx>=W||ny>=H)continue;
        var np=ny*W+nx;
        if(!lab[np]&&g[np]<t){lab[np]=1;q[tail++]=np}
      }
    }
    if(n>60)out.push({minX:minX,maxX:maxX,minY:minY,maxY:maxY,n:n});
  }
  return out;
}

/* filtra: retângulo ~2–5.5:1, cheio, com texto claro dentro */
function pickPill(f){
  var cands=[],factors=[.66,.55,.78],i;
  for(i=0;i<factors.length&&!cands.length;i++){
    var blobs=darkBlobs(f,factors[i]),area=f.W*f.H;
    blobs.forEach(function(b){
      var bw=b.maxX-b.minX+1,bh=b.maxY-b.minY+1,a=bw*bh,ar=bw/bh;
      var horiz=ar>=1.7&&ar<=6, vert=(1/ar)>=1.7&&(1/ar)<=6;   // pílula girada 90°
      if(!horiz&&!vert)return;
      if(a<area*.0015||a>area*.10)return;
      if(b.n/a<.68)return;                                     // quase retangular
      var light=0,tot=0;
      for(var y=b.minY;y<=b.maxY;y+=2)for(var x=b.minX;x<=b.maxX;x+=2){
        tot++; if(f.g[y*f.W+x]>Math.max(150,f.mean*1.05))light++;
      }
      var ratio=light/tot;
      if(ratio<.05||ratio>.50)return;
      cands.push({minX:b.minX,minY:b.minY,bw:bw,bh:bh,
                  vert:vert&&!horiz,score:a*ratio*(horiz?1:.9)});
    });
  }
  cands.sort(function(a,b){return b.score-a.score});
  return cands[0]||null;
}

/* recorta em resolução cheia, upscale + inverte (texto branco → preto) */
function cropPill(pill,sc,pass){
  var pad=Math.round(Math.max(3,pill.bh*.12));
  var sx=Math.max(0,(pill.minX-pad)/sc), sy=Math.max(0,(pill.minY-pad)/sc);
  var sw=(pill.bw+pad*2)/sc, sh=(pill.bh+pad*2)/sc;
  sw=Math.min(sw,video.videoWidth-sx); sh=Math.min(sh,video.videoHeight-sy);

  var H=CFG.OCR_H,W=Math.max(24,Math.round(sw/sh*H));
  crop.width=pill.vert?H:W; crop.height=pill.vert?W:H;
  cctx.save();
  cctx.imageSmoothingEnabled=true;cctx.imageSmoothingQuality="high";
  if(pill.vert){ cctx.translate(crop.width,0); cctx.rotate(Math.PI/2); }
  cctx.drawImage(video,sx,sy,sw,sh,0,0,pill.vert?W:W,pill.vert?H:H);
  cctx.restore();

  // se veio girado, gira p/ horizontal
  if(pill.vert){
    var tmp=document.createElement("canvas");tmp.width=W;tmp.height=H;
    var t=tmp.getContext("2d");
    t.translate(W/2,H/2);t.rotate(-Math.PI/2);
    t.drawImage(crop,-crop.width/2,-crop.height/2);
    crop.width=W;crop.height=H;cctx.drawImage(tmp,0,0);
  }

  // binarização: pass ímpar tenta polaridade oposta (pílula clara)
  var im=cctx.getImageData(0,0,crop.width,crop.height),d=im.data,N=crop.width*crop.height;
  var gs=new Uint8Array(N),sum=0,k;
  for(var i=0,p=0;p<N;i+=4,p++){gs[p]=(d[i]*77+d[i+1]*151+d[i+2]*28)>>8;sum+=gs[p]}
  var th=sum/N;
  for(k=0;k<N;k++){
    var on=(pass%2===0)?(gs[k]>th):(gs[k]<th);   // texto = pixels claros
    var v=on?0:255,j=k*4;
    d[j]=d[j+1]=d[j+2]=v;d[j+3]=255;
  }
  cctx.putImageData(im,0,0);
  return crop;
}

/* fallback: ROI larga, sem pílula detectada */
function cropFallback(){
  var vw=video.videoWidth,vh=video.videoHeight,R=CFG.FALLBACK_ROI;
  var sx=vw*R.x,sy=vh*R.y,sw=vw*R.w,sh=vh*R.h;
  crop.width=Math.round(sw*1.6);crop.height=Math.round(sh*1.6);
  cctx.imageSmoothingQuality="high";
  cctx.drawImage(video,sx,sy,sw,sh,0,0,crop.width,crop.height);
  return crop;
}

/* dica visual: move o #scanBox (se existir) para cima da pílula */
function hint(pill,sc){
  var box=E("scanBox");if(!box)return;
  if(!pill){box.style.opacity=".35";return}
  var vw=video.getBoundingClientRect(),k=vw.width/(video.videoWidth*sc);
  box.style.opacity="1";
  box.style.left=(pill.minX*k)+"px";
  box.style.top=(pill.minY*k)+"px";
  box.style.width=(pill.bw*k)+"px";
  box.style.height=(pill.bh*k)+"px";
}

/* ---------- OCR ---------- */
async function getWorker(){
  if(worker)return worker;
  if(typeof Tesseract==="undefined")throw new Error("OCR não carregado (sem internet?)");
  paintScanning("carregando OCR…");
  worker=await Tesseract.createWorker("eng");
  await worker.setParameters({
    tessedit_char_whitelist:"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ",
    user_defined_dpi:"300"
  });
  log("✔ OCR pronto");
  return worker;
}
async function ocr(img,psm){
  var w=await getWorker();
  await w.setParameters({tessedit_pageseg_mode:String(psm)});
  var r=await w.recognize(img);
  return r.data.text||"";
}

/* ---------- leitura ---------- */
async function read(){
  if(busy)return;
  if(!stream){log("⚠️ inicie a câmera");return}
  busy=true;
  var votes={},reads=0,found=false;
  paintScanning("procurando o código…");
  try{
    var f=frameGray();
    if(!f){busy=false;return}
    var pill=pickPill(f);
    hint(pill,f.scale);
    if(pill)paintScanning("lendo "+pill.bw+"×"+pill.bh+"…");

    for(var i=0;i<CFG.BURST;i++){
      var img=pill?cropPill(pill,f.scale,i):cropFallback();
      var psm=pill?(i<2?7:8):11;
      var txt="";
      try{txt=await ocr(img,psm)}catch(e){log("⚠️ "+e.message);break}
      if(txt.trim()){
        reads++;
        match(txt,3).forEach(function(c,idx){
          var w=c.score*(idx===0?1:.55);
          if(!votes[c.key])votes[c.key]={code:c.code,num:c.num,key:c.key,w:0,hits:0};
          votes[c.key].w+=w;votes[c.key].hits++;
        });
        // atalho: 2 leituras concordando com score alto → já resolve
        var k=Object.keys(votes);
        if(k.length===1&&votes[k[0]].hits>=2){found=true;break}
      }
      if(!pill&&i>=1)break;               // sem pílula, não insiste
      await new Promise(function(r){setTimeout(r,40)});
    }
  }catch(e){log("⚠️ "+e.message)}

  var rank=Object.keys(votes).map(function(k){return votes[k]})
    .sort(function(a,b){return b.w-a.w});
  if(!rank.length){decide(null,[],reads);busy=false;return}
  rank.forEach(function(r){r.score=Math.min(1,r.w/Math.max(reads,1))});
  var margin=rank[1]?(rank[0].score-rank[1].score):1;
  decide(rank[0],rank,reads,found?1:margin);
  busy=false;
}

/* ---------- decisão / registro / painéis (iguais ao v3) ---------- */
function decide(top,rank,reads,margin){
  if(!top){
    paintFail("Não encontrei o código","Mostre o canto com a pílula escura (ex.: TUN 7)");
    flash(true);feedback(true);
    log("✘ nenhuma leitura útil ("+reads+" tentativas)");
    return;
  }
  if(top.score>=CFG.AUTO_SCORE&&margin>=CFG.AUTO_MARGIN){commit(top.code,top.num,top.score);return}
  if(top.score>=CFG.ASK_SCORE){
    paintAsk(rank.slice(0,3));flash(true);
    log("? ambíguo → "+rank.slice(0,3).map(function(r){
      return r.code+pad(r.num)+" "+Math.round(r.score*100)+"%"}).join(" · "));
    return;
  }
  paintFail("Leitura com baixa confiança","Aproxime um pouco ou digite o código abaixo");
  flash(true);feedback(true);
}
function commit(code,num,score){
  if(!validNum(code,num)){paintFail("Código inválido: "+code+" "+num,"");return}
  var key=code+pad(num),now=Date.now();
  if(key===lastKey&&now-lastAt<CFG.COOLDOWN){paintScanning("mesma figurinha — aguarde");return}
  lastKey=key;lastAt=now;lastTeam=code;
  setQty(code,num,getQty(code,num)+1);
  var q=getQty(code,num);
  session.unshift({code:code,num:num,q:q});
  if(session.length>28)session.pop();
  paintOK(code,num,q,score);renderSession();
  flash(false);feedback(false);
  if(window.renderStock){renderStock(val("searchStock"));updStockCounter();updDemPill()}
  if(window.renderDrawerStats)renderDrawerStats();
  log("➕ <b>"+code+" "+pad(num)+"</b> ("+T[code].name+") → "+q+"un"+
      (score?" · "+Math.round(score*100)+"%":""));
}
function undo(i){
  var it=session[i];if(!it)return;
  setQty(it.code,it.num,Math.max(0,getQty(it.code,it.num)-1));
  session.splice(i,1);renderSession();
  if(window.renderStock){renderStock(val("searchStock"));updStockCounter();updDemPill()}
  toast("↩️ "+it.code+" "+pad(it.num)+" desfeito");
  log("↩️ desfeito "+it.code+" "+pad(it.num));
}
function paintScanning(m){
  E("scanResult").className="scan-result";
  E("scanResult").innerHTML='<div class="sr-scan">🔍 '+m+'</div>';
}
function paintOK(code,num,q,score){
  var dem=demandaDe(code,num);
  var tags=(isShiny(code,num)?'<span class="tagshiny">✨ brilhante</span>':"")+
           (teamHasAce(code)?'<span class="tagace">⭐ '+teamAceLabel(code)+'</span>':"");
  E("scanResult").className="scan-result sr-ok";
  E("scanResult").innerHTML=
    '<div class="sr-code">'+code+' '+pad(num)+'</div>'+
    '<div class="sr-team">'+flagHTML(code)+'<span>'+T[code].name+'</span>'+tags+'</div>'+
    '<div class="sr-qty">agora tenho '+q+' un</div>'+
    (dem?'<div class="sr-meta" style="color:#ff9c9c">🔎 '+dem+' pessoa(s) procuram esta</div>':"")+
    '<div class="sr-bar"><i style="width:'+Math.round((score||1)*100)+'%"></i></div>'+
    '<div class="sr-meta">confiança '+Math.round((score||1)*100)+'%</div>';
}
function paintAsk(cands){
  E("scanResult").className="scan-result";
  var h='<div class="sr-ask">🤔 Qual é? Toque na correta</div><div class="sr-cands">';
  cands.forEach(function(c,i){
    h+='<button class="sr-cand" data-i="'+i+'">'+flagHTML(c.code)+
       '<span>'+c.code+' '+pad(c.num)+'</span><small>'+Math.round(c.score*100)+'%</small></button>';
  });
  E("scanResult").innerHTML=h+'</div>';
  E("scanResult").querySelectorAll(".sr-cand").forEach(function(b){
    b.onclick=function(){var c=cands[+b.dataset.i];commit(c.code,c.num,c.score)};
  });
}
function paintFail(t,s){
  E("scanResult").className="scan-result";
  E("scanResult").innerHTML='<div class="sr-fail">⚠️ '+t+'<span>'+(s||"")+'</span></div>';
}
function renderSession(){
  var b=E("scanSession");
  if(!session.length){b.innerHTML="";return}
  b.innerHTML="";
  session.forEach(function(it,i){
    var s=document.createElement("span");
    s.className="ss-chip"+(i===0?" new":"");
    s.innerHTML=(flagURL(it.code,20)?'<img src="'+flagURL(it.code,20)+'">':"")+
      it.code+" "+pad(it.num)+(isShiny(it.code,it.num)?" ✨":"")+
      ' <button title="desfazer">×</button>';
    s.querySelector("button").onclick=function(){undo(i)};
    b.appendChild(s);
  });
}

/* ---------- câmera ---------- */
async function start(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    paintFail("Câmera indisponível","Precisa de HTTPS");return;
  }
  try{
    stop(true);
    stream=await navigator.mediaDevices.getUserMedia({video:{
      facingMode:{ideal:"environment"},width:{ideal:1920},height:{ideal:1080}}});
    video.srcObject=stream;await video.play();
    try{
      var tr=stream.getVideoTracks()[0],cap=tr.getCapabilities?tr.getCapabilities():{};
      var adv=[];
      if(cap.focusMode&&cap.focusMode.indexOf("continuous")>-1)adv.push({focusMode:"continuous"});
      if(cap.exposureMode&&cap.exposureMode.indexOf("continuous")>-1)adv.push({exposureMode:"continuous"});
      if(adv.length)await tr.applyConstraints({advanced:adv});
    }catch(e){}
    log("📷 câmera ativa "+video.videoWidth+"×"+video.videoHeight);
    await getWorker();
    paintScanning("pronto — mostre o verso, sem precisar encaixar");
    if(E("scanAuto").checked)startLoop();
  }catch(e){paintFail("Erro na câmera",e.message);log("❌ "+e.message)}
}
function startLoop(){clearInterval(loop);loop=setInterval(function(){if(!busy)read()},CFG.LOOP_MS)}
function stop(quiet){
  clearInterval(loop);loop=null;
  if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}
  if(video)video.srcObject=null;
  if(!quiet){
    log("⏹️ parado");
    E("scanResult").className="scan-result";
    E("scanResult").innerHTML='<div class="sr-idle">Scanner parado</div>';
  }
}
window.stopScanner=function(){stop(true)};

/* ---------- manual ---------- */
function manual(){
  var raw=E("scanManual").value;
  if(!raw.trim())return;
  var p=parseList(raw),codes=Object.keys(p.found),n=0;
  if(codes.length){
    codes.forEach(function(c){p.found[c].forEach(function(num){lastTeam=c;commit(c,num,1);n++})});
    E("scanManual").value="";
    if(n>1)toast("➕ "+n+" adicionadas");
    return;
  }
  var m=match(raw,3);
  if(m.length&&m[0].score>=CFG.ASK_SCORE){paintAsk(m);return}
  toast("❌ Não reconheci “"+raw+"”","err");
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded",function(){
  video=E("scanVideo");
  det=document.createElement("canvas");dctx=det.getContext("2d",{willReadFrequently:true});
  crop=document.createElement("canvas");cctx=crop.getContext("2d",{willReadFrequently:true});
  buildCatalog();
  log("📚 catálogo: "+CATALOG.length+" códigos possíveis");

  E("btnScanStart").onclick=start;
  E("btnScanStop").onclick=function(){stop()};
  E("btnScanShot").onclick=function(){if(!busy)read()};
  E("btnScanManual").onclick=manual;
  E("scanManual").onkeydown=function(e){if(e.key==="Enter")manual()};
  E("scanAuto").onchange=function(){
    if(this.checked&&stream)startLoop();else clearInterval(loop);
  };
  E("scanLockTeam").onchange=function(){
    if(this.checked&&lastTeam)toast("🔒 Travado em "+lastTeam+" — "+T[lastTeam].name);
    else if(this.checked)toast("Leia uma figurinha primeiro para travar","warn2");
  };
  document.addEventListener("visibilitychange",function(){if(document.hidden)stop(true)});
});
})();
