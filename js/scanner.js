/* =====================================================================
   SCANNER v2 — detecção automática de sigla + número (verso da figurinha)
   ROI → upscale → binarização adaptativa → OCR restrito
       → fuzzy match no catálogo → votação multi-frame → decisão
   ===================================================================== */
(function(){
"use strict";

var CFG={
  BURST:6, ROI:{x:.07,y:.30,w:.86,h:.40}, SCALE:3,
  AUTO_SCORE:.86, AUTO_MARGIN:.14, ASK_SCORE:.52,
  PRIOR:.05, LOOP_MS:1400, COOLDOWN:1600
};
var CONF={"0":"O","O":"0","1":"I","I":"1","5":"S","S":"5","8":"B","B":"8",
          "2":"Z","Z":"2","6":"G","G":"6","4":"A","A":"4","7":"T","T":"7"};

var video,cvs,ctx,work,wctx,stream=null,worker=null,loop=null;
var busy=false,lastTeam=null,lastKey="",lastAt=0,session=[];

function E(id){return document.getElementById(id)}
function log(h){var l=E("scanLog");if(l)l.innerHTML=h+"<br>"+l.innerHTML}
function norm(s){return String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}
function flash(bad){
  var f=E("scanFlash");f.className="scan-flash on"+(bad?" bad":"");
  setTimeout(function(){f.className="scan-flash"+(bad?" bad":"")},130);
}
function feedback(bad){
  if(!E("scanSound").checked)return;
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
var CATALOG=[];
function buildCatalog(){
  CATALOG=[];
  teams.forEach(function(t){
    numsOf(t).forEach(function(n){
      CATALOG.push({code:t.code,num:n,key:t.code+pad(n)});
    });
  });
  window.SCAN_CATALOG_SIZE=CATALOG.length;
}

/* ---------- distância tolerante ---------- */
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
function sim(a,b){
  if(!a||!b)return 0;
  return Math.max(0,1-dist(a,b)/Math.max(a.length,b.length));
}

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

/* ---------- match ---------- */
function match(raw,topN){
  var tks=tokens(raw);if(!tks.length)return [];
  var lock=E("scanLockTeam")&&E("scanLockTeam").checked;
  var best={};
  tks.forEach(function(tk){
    var qs=tk.s,qn=parseInt(tk.n,10);
    if(isNaN(qn))return;
    CATALOG.forEach(function(c){
      var ss=sim(qs,c.code);
      if(ss<.34)return;
      var sn;
      if(c.num===qn)sn=1;
      else{
        var a=pad(qn),b=pad(c.num);
        sn=(a.length===b.length&&sim(a,b)>=.5)?.45:0;
      }
      if(!sn)return;
      var sc=ss*.6+sn*.4;
      if(lastTeam&&c.code===lastTeam)sc+=CFG.PRIOR;
      if(lock&&lastTeam&&c.code!==lastTeam)sc-=.35;
      sc=Math.max(0,Math.min(1,sc));
      if(!best[c.key]||best[c.key].score<sc)
        best[c.key]={code:c.code,num:c.num,key:c.key,score:sc};
    });
  });
  return Object.keys(best).map(function(k){return best[k]})
    .sort(function(a,b){return b.score-a.score}).slice(0,topN||3);
}
window.scanMatch=match;

/* ---------- pré-processamento ---------- */
function grabROI(){
  var w=video.videoWidth,h=video.videoHeight;
  if(!w||!h)return null;
  var sx=Math.round(w*CFG.ROI.x),sy=Math.round(h*CFG.ROI.y),
      sw=Math.round(w*CFG.ROI.w),sh=Math.round(h*CFG.ROI.h);
  cvs.width=sw*CFG.SCALE;cvs.height=sh*CFG.SCALE;
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
  ctx.drawImage(video,sx,sy,sw,sh,0,0,cvs.width,cvs.height);
  return cvs;
}
function binarize(canvas,invert){
  var W=canvas.width,H=canvas.height,c=canvas.getContext("2d");
  var img=c.getImageData(0,0,W,H),d=img.data,N=W*H;
  var gray=new Float32Array(N),i,p;
  for(i=0,p=0;p<N;i+=4,p++)gray[p]=.299*d[i]+.587*d[i+1]+.114*d[i+2];
  var it=new Float64Array((W+1)*(H+1));
  for(var y=0;y<H;y++){
    var rs=0;
    for(var x=0;x<W;x++){
      rs+=gray[y*W+x];
      it[(y+1)*(W+1)+(x+1)]=it[y*(W+1)+(x+1)]+rs;
    }
  }
  var r=Math.max(10,Math.round(W/22));
  work.width=W;work.height=H;
  var out=wctx.createImageData(W,H),o=out.data;
  for(var yy=0;yy<H;yy++){
    var y1=Math.max(0,yy-r),y2=Math.min(H-1,yy+r);
    for(var xx=0;xx<W;xx++){
      var x1=Math.max(0,xx-r),x2=Math.min(W-1,xx+r);
      var area=(x2-x1+1)*(y2-y1+1);
      var s=it[(y2+1)*(W+1)+(x2+1)]-it[y1*(W+1)+(x2+1)]
           -it[(y2+1)*(W+1)+x1]+it[y1*(W+1)+x1];
      var mean=s/area,v=gray[yy*W+xx];
      var on=invert?(v>mean+6):(v<mean-6);
      var g=on?0:255,k=(yy*W+xx)*4;
      o[k]=o[k+1]=o[k+2]=g;o[k+3]=255;
    }
  }
  wctx.putImageData(out,0,0);
  return work;
}

/* ---------- OCR ---------- */
async function getWorker(){
  if(worker)return worker;
  if(typeof Tesseract==="undefined")throw new Error("OCR não carregado (sem internet?)");
  paintScanning("carregando OCR…");
  worker=await Tesseract.createWorker("eng");
  await worker.setParameters({
    tessedit_char_whitelist:"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
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
  var votes={},reads=0;
  paintScanning("lendo…");
  try{
    for(var f=0;f<CFG.BURST;f++){
      var roi=grabROI();if(!roi)break;
      var img=binarize(roi,f%2===1);
      var psm=(f%3===0)?7:(f%3===1)?11:6;
      var txt="";
      try{txt=await ocr(img,psm)}catch(e){log("⚠️ "+e.message);break}
      if(txt.trim()){
        reads++;
        match(txt,3).forEach(function(c,idx){
          var w=c.score*(idx===0?1:.55);
          if(!votes[c.key])votes[c.key]={code:c.code,num:c.num,key:c.key,w:0,hits:0};
          votes[c.key].w+=w;votes[c.key].hits++;
        });
      }
      await new Promise(function(r){setTimeout(r,60)});
    }
  }catch(e){log("⚠️ "+e.message)}

  var rank=Object.keys(votes).map(function(k){return votes[k]})
    .sort(function(a,b){return b.w-a.w});
  if(!rank.length){decide(null,[],reads);busy=false;return}
  rank.forEach(function(r){r.score=Math.min(1,r.w/Math.max(reads,1))});
  var margin=rank[1]?(rank[0].score-rank[1].score):1;
  decide(rank[0],rank,reads,margin);
  busy=false;
}

/* ---------- decisão ---------- */
function decide(top,rank,reads,margin){
  if(!top){
    paintFail("Não consegui ler o código","Aproxime, evite reflexo e mantenha o verso plano");
    flash(true);feedback(true);
    log("✘ nenhuma leitura útil ("+reads+" frames)");
    return;
  }
  if(top.score>=CFG.AUTO_SCORE&&margin>=CFG.AUTO_MARGIN){commit(top.code,top.num,top.score);return}
  if(top.score>=CFG.ASK_SCORE){
    paintAsk(rank.slice(0,3));flash(true);
    log("? ambíguo → "+rank.slice(0,3).map(function(r){
      return r.code+pad(r.num)+" "+Math.round(r.score*100)+"%"}).join(" · "));
    return;
  }
  paintFail("Leitura com baixa confiança","Tente de novo ou digite o código abaixo");
  flash(true);feedback(true);
}

/* ---------- registra ---------- */
function commit(code,num,score){
  if(!validNum(code,num)){paintFail("Código inválido: "+code+" "+num,"");return}
  var key=code+pad(num),now=Date.now();
  if(key===lastKey&&now-lastAt<CFG.COOLDOWN){paintScanning("mesma figurinha — aguarde");return}
  lastKey=key;lastAt=now;lastTeam=code;

  setQty(code,num,getQty(code,num)+1);
  var q=getQty(code,num);
  session.unshift({code:code,num:num,q:q});
  if(session.length>28)session.pop();

  paintOK(code,num,q,score);
  renderSession();
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

/* ---------- painéis ---------- */
function paintScanning(m){
  E("scanResult").className="scan-result";
  E("scanResult").innerHTML='<div class="sr-scan">🔍 '+m+'</div>';
}
function paintOK(code,num,q,score){
  var dem=demandaDe(code,num);
  var tags=(isAce(code,num)?'<span class="tagace">⭐ '+aceName(code,num)+'</span>':"")+
           (isShiny(code,num)?'<span class="tagshiny">✨ brilhante</span>':"");
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
      it.code+" "+pad(it.num)+(isAce(it.code,it.num)?" ⭐":"")+
      (isShiny(it.code,it.num)?" ✨":"")+' <button title="desfazer">×</button>';
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
      if(cap.focusMode&&cap.focusMode.indexOf("continuous")>-1)
        await tr.applyConstraints({advanced:[{focusMode:"continuous"}]});
    }catch(e){}
    log("📷 câmera ativa "+video.videoWidth+"×"+video.videoHeight);
    paintScanning("preparando…");
    await getWorker();
    paintScanning("pronto — encaixe o código");
    if(E("scanAuto").checked)startLoop();
  }catch(e){paintFail("Erro na câmera",e.message);log("❌ "+e.message)}
}
function startLoop(){
  clearInterval(loop);
  loop=setInterval(function(){if(!busy)read()},CFG.LOOP_MS);
}
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
    codes.forEach(function(c){p.found[c].forEach(function(num){
      lastTeam=c;commit(c,num,1);n++})});
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
  cvs=document.createElement("canvas");ctx=cvs.getContext("2d",{willReadFrequently:true});
  work=document.createElement("canvas");wctx=work.getContext("2d",{willReadFrequently:true});
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
