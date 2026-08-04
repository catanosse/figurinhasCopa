(function(){
var video,canvas,ctx,stream=null,timer=null,worker=null,busy=false;
function log(msg){var l=document.getElementById("scanLog");l.innerHTML=msg+"<br>"+l.innerHTML}

function fillTeams(){
  var s=document.getElementById("scanTeam");
  s.innerHTML=teams.map(function(t){return '<option value="'+t.code+'">'+t.flag+' '+t.code+' — '+t.name+'</option>'}).join("");
}

async function getWorker(){
  if(worker)return worker;
  log("⏳ carregando OCR...");
  worker=await Tesseract.createWorker("eng");
  await worker.setParameters({tessedit_char_whitelist:"0123456789",tessedit_pageseg_mode:"7"});
  log("✔ OCR pronto");
  return worker;
}

async function start(){
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280}}});
    video.srcObject=stream;await video.play();
    log("📷 câmera ativa");
    await getWorker();
    schedule();
  }catch(e){log("❌ "+e.message)}
}
function schedule(){
  clearInterval(timer);
  var ms=Math.max(600,+document.getElementById("scanEvery").value||1500);
  timer=setInterval(shot,ms);
}
function stop(){
  clearInterval(timer);timer=null;
  if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}
  log("⏹ parado");
}

function crop(){
  var w=video.videoWidth,h=video.videoHeight;
  if(!w)return null;
  var x=w*0.08,y=h*0.34,cw=w*0.84,ch=h*0.32;
  canvas.width=cw;canvas.height=ch;
  ctx.drawImage(video,x,y,cw,ch,0,0,cw,ch);
  // pré-processamento: cinza + contraste
  var d=ctx.getImageData(0,0,cw,ch),p=d.data;
  for(var i=0;i<p.length;i+=4){
    var g=(p[i]*.3+p[i+1]*.59+p[i+2]*.11);
    g=g<115?0:255;
    p[i]=p[i+1]=p[i+2]=g;
  }
  ctx.putImageData(d,0,0);
  return canvas;
}

async function shot(){
  if(busy||!stream)return;busy=true;
  try{
    var c=crop();if(!c){busy=false;return}
    var w=await getWorker();
    var r=await w.recognize(c);
    var txt=(r.data.text||"").replace(/\D/g," ").trim();
    var nums=txt.split(/\s+/).map(Number).filter(function(n){return n>=0&&n<=999});
    var code=document.getElementById("scanTeam").value;
    var ok=nums.filter(function(n){return validNum(code,n)});
    if(ok.length){
      var n=ok[0];
      document.getElementById("scanBig").textContent=code+" - "+pad(n)+(isAce(code,n)?" ⭐ "+aceName(code,n):"");
      if(document.getElementById("scanAuto").checked){
        addQty(code,n,1);
        log("➕ "+code+"-"+pad(n)+" (total "+getQty(code,n)+")");
        if(typeof renderStock==="function"){renderStock()}
      }else log("👁 "+code+"-"+pad(n));
    }else if(txt)log("… lido: "+txt);
  }catch(e){log("⚠ "+e.message)}
  busy=false;
}

document.addEventListener("DOMContentLoaded",function(){
  video=document.getElementById("scanVideo");
  canvas=document.createElement("canvas");ctx=canvas.getContext("2d",{willReadFrequently:true});
  fillTeams();
  document.getElementById("btnScanStart").onclick=start;
  document.getElementById("btnScanStop").onclick=stop;
  document.getElementById("btnScanShot").onclick=shot;
  document.getElementById("scanEvery").onchange=function(){if(timer)schedule()};
});
})();
