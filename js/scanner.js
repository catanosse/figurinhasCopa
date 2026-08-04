/* ================= SCANNER OCR ================= */
(function(){
var video,canvas,ctx,stream=null,timer=null,worker=null,busy=false,lastHit="",lastAt=0;

function log(html){
  var l=document.getElementById("scanLog");
  if(l)l.innerHTML=html+"<br>"+l.innerHTML;
}
function fillTeams(){
  var s=document.getElementById("scanTeam");
  s.innerHTML=teams.map(function(t){
    return '<option value="'+t.code+'">'+(t.flag||"")+" "+t.code+" — "+t.name+
      (t.group?" (G"+t.group+")":"")+'</option>';
  }).join("");
  s.value="BRA";
}
async function getWorker(){
  if(worker)return worker;
  if(typeof Tesseract==="undefined"){log("❌ OCR não carregado (sem internet?)");throw new Error("Tesseract ausente")}
  log("⏳ carregando OCR…");
  worker=await Tesseract.createWorker("eng");
  await worker.setParameters({tessedit_char_whitelist:"0123456789",tessedit_pageseg_mode:"7"});
  log("✔ OCR pronto");
  return worker;
}
function schedule(){
  clearInterval(timer);
  var ms=Math.max(600,+document.getElementById("scanEvery").value||1500);
  timer=setInterval(shot,ms);
}
async function start(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    log("❌ câmera indisponível — precisa de HTTPS");toast("Precisa de HTTPS","err");return;
  }
  try{
    stop(true);
    stream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}}});
    video.srcObject=stream;await video.play();
    log("📷 câmera ativa");
    await getWorker();schedule();
  }catch(e){log("❌ "+e.message);toast(e.message,"err")}
}
function stop(quiet){
  clearInterval(timer);timer=null;
  if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}
  if(video)video.srcObject=null;
  if(!quiet)log("⏹️ parado");
}
window.stopScanner=function(){stop(true)};

function crop(){
  var w=video.videoWidth,h=video.videoHeight;
  if(!w||!h)return null;
  var cw=Math.round(w*0.84),ch=Math.round(h*0.32);
  canvas.width=cw;canvas.height=ch;
  ctx.drawImage(video,Math.round(w*0.08),Math.round(h*0.34),cw,ch,0,0,cw,ch);
  var d=ctx.getImageData(0,0,cw,ch),p=d.data;
  for(var i=0;i<p.length;i+=4){
    var g=p[i]*0.3+p[i+1]*0.59+p[i+2]*0.11;
    g=g<118?0:255;p[i]=p[i+1]=p[i+2]=g;
  }
  ctx.putImageData(d,0,0);
  return canvas;
}
async function shot(){
  if(busy)return;
  if(!stream){log("⚠️ inicie a câmera");return}
  busy=true;
  try{
    var c=crop();
    if(c){
      var w=await getWorker();
      var r=await w.recognize(c);
      var txt=(r.data.text||"").replace(/\D/g," ").trim();
      var code=document.getElementById("scanTeam").value;
      var cands=txt.split(/\s+/).map(Number).filter(function(n){return !isNaN(n)&&validNum(code,n)});
      if(cands.length){
        var n=cands[0],key=code+"-"+n,now=Date.now();
        if(key===lastHit&&now-lastAt<2200){busy=false;return}
        lastHit=key;lastAt=now;register(code,n);
      }else if(txt)log("… lido: "+txt);
    }
  }catch(e){log("⚠️ "+e.message)}
  busy=false;
}
function register(code,n){
  var lbl=code+" "+pad(n)+(isAce(code,n)?" ⭐ "+aceName(code,n):(isShiny(code,n)?" ✨":""));
  document.getElementById("scanBig").textContent=lbl;
  if(document.getElementById("scanAuto").checked){
    setQty(code,n,getQty(code,n)+1);
    log("➕ <b>"+code+" "+pad(n)+"</b> → total "+getQty(code,n));
    if(typeof renderStock==="function"){renderStock(val("searchStock"));updStockCounter();updDemPill()}
    if(navigator.vibrate)navigator.vibrate(30);
    toast("+1 "+code+" "+pad(n));
  }else log("👁 "+lbl+" (auto off)");
}

document.addEventListener("DOMContentLoaded",function(){
  video=document.getElementById("scanVideo");
  canvas=document.createElement("canvas");
  ctx=canvas.getContext("2d",{willReadFrequently:true});
  fillTeams();
  document.getElementById("btnScanStart").onclick=start;
  document.getElementById("btnScanStop").onclick=function(){stop()};
  document.getElementById("btnScanShot").onclick=shot;
  document.getElementById("scanEvery").onchange=function(){if(timer)schedule()};
  document.getElementById("btnScanManual").onclick=function(){
    var code=document.getElementById("scanTeam").value;
    var n=parseInt(document.getElementById("scanManual").value,10);
    if(!validNum(code,n)){toast("Número inválido para "+code,"err");return}
    register(code,n);
    document.getElementById("scanManual").value="";
  };
  document.addEventListener("visibilitychange",function(){if(document.hidden)stop(true)});
});
})();
