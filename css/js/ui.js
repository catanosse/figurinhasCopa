var lastImport={};
function $(s){return document.querySelector(s)}
function $$(s){return Array.from(document.querySelectorAll(s))}
function money(v){return "R$ "+Number(v||0).toFixed(2).replace(".",",")}

/* NAV */
function initNav(){
  $$(".nav-btn").forEach(function(b){
    b.onclick=function(){
      $$(".nav-btn").forEach(function(x){x.classList.remove("active")});
      b.classList.add("active");
      $$(".view").forEach(function(v){v.classList.add("hidden")});
      $("#v-"+b.dataset.view).classList.remove("hidden");
      window.scrollTo(0,0);
    };
  });
}

/* ESTOQUE */
function renderStock(){
  var f=($("#qFilter").value||"").toUpperCase(),only=$("#onlyHave").checked,g=$("#stockGrid");
  g.innerHTML="";
  teams.forEach(function(t){
    if(f&&t.code.indexOf(f)<0&&t.name.indexOf(f)<0)return;
    var have=Object.keys(stock[t.code]||{}).length;
    if(only&&!have)return;
    var d=document.createElement("div");d.className="team";
    var nums="";
    for(var i=firstNum(t.code);i<=t.qty;i++){
      var q=getQty(t.code,i),cls="n"+(q>1?" dup":q===1?" have":"")+(isAce(t.code,i)?" ace":"");
      nums+='<div class="'+cls+'" data-c="'+t.code+'" data-n="'+i+'"><b>'+pad(i)+'</b><span>'+(q||"")+'</span></div>';
    }
    d.innerHTML='<div class="team-h"><span>'+t.flag+' '+t.code+' <small>'+t.name+(t.group?" · G"+t.group:"")+'</small></span><small>'+have+'/'+t.qty+'</small></div><div class="nums">'+nums+'</div>';
    g.appendChild(d);
  });
  g.querySelectorAll(".n").forEach(function(el){
    el.onclick=function(){addQty(el.dataset.c,+el.dataset.n,1);renderStock();updCounters()};
    el.oncontextmenu=function(e){e.preventDefault();addQty(el.dataset.c,+el.dataset.n,-1);renderStock();updCounters()};
  });
  updCounters();
}
function updCounters(){
  $("#stockCounter").textContent=totalStock()+" figurinhas";
  $("#wantCounter").textContent=wantCount();
  $("#vendTotal").textContent=money(sales.reduce(function(a,s){return a+ +s.value},0));
}

/* OFERTA */
function genOffer(){
  var min=$("#ofMin2").checked?2:1,useR=$("#ofRange").checked,ace=$("#ofAce").checked;
  var d=dupList(min),out=["🔁 REPETIDAS DISPONÍVEIS — COPA 2026",""];
  teams.forEach(function(t){
    var a=d[t.code];if(!a||!a.length)return;
    var body=useR?ranges(a):a.sort(function(x,y){return x-y}).map(pad).join(",");
    out.push(t.flag+" "+t.code+": "+body);
    if(ace)a.filter(function(n){return isAce(t.code,n)}).forEach(function(n){out.push("   ⭐ "+pad(n)+" "+aceName(t.code,n))});
  });
  out.push("","Total: "+Object.values(d).reduce(function(a,b){return a+b.length},0)+" números");
  $("#offerOut").value=out.join("\n");
}

/* IMPORTAR */
function doImport(){
  var r=parseList($("#impIn").value),mode=$("#impMode").value,log=[],n=0;
  lastImport=r.items;
  for(var c in r.items)r.items[c].forEach(function(num){
    if(mode==="add"){addQty(c,num,1)}
    else if(mode==="set"){setQty(c,num,1)}
    else{wantAdd(c,num)}
    n++;
  });
  for(var c2 in r.items)log.push(c2+": "+ranges(r.items[c2]));
  if(r.errors.length)log.push("⚠ ignorados: "+r.errors.join(", "));
  log.push("✔ "+n+" itens processados ("+mode+")");
  $("#impLog").innerHTML=log.join("<br>");
  persist();renderStock();renderWant();matchImport();
}

/* PROCURADAS */
function renderWant(){
  var box=$("#wantList");box.innerHTML="";
  Object.keys(wanted).forEach(function(c){
    wanted[c].sort(function(a,b){return a-b}).forEach(function(n){
      var s=document.createElement("span");s.className="chip";
      s.innerHTML=c+"-"+pad(n)+" <button>×</button>";
      s.querySelector("button").onclick=function(){wantDel(c,n);renderWant();updCounters()};
      box.appendChild(s);
    });
  });
  updCounters();
}
function matchImport(){
  var out=[],tot=0;
  for(var c in lastImport){
    var hit=lastImport[c].filter(function(n){return (wanted[c]||[]).indexOf(n)>=0});
    if(hit.length){out.push("✅ "+c+": "+ranges(hit));tot+=hit.length}
  }
  $("#matchLog").innerHTML=tot?out.join("<br>")+"<br><b>"+tot+" casamentos</b>":"Nenhum casamento com suas procuradas.";
}

/* ORÇAMENTO */
function renderOrc(){
  var h="<tr><th>Cliente</th><th>Qtd</th><th>Unit</th><th>Frete</th><th>Total</th><th></th></tr>";
  orcs.forEach(function(o,i){
    h+="<tr><td>"+o.name+"</td><td>"+o.qty+"</td><td>"+money(o.unit)+"</td><td>"+money(o.frete)+"</td><td>"+money(o.total)+"</td><td><button class='btn danger' data-i='"+i+"'>×</button></td></tr>";
  });
  var tb=$("#orcTable");tb.innerHTML=h;
  tb.querySelectorAll("button").forEach(function(b){b.onclick=function(){orcs.splice(+b.dataset.i,1);persist();renderOrc()}});
  $("#orcTotal").textContent=money(orcs.reduce(function(a,o){return a+o.total},0));
}

/* VENDAS */
function renderSales(){
  var h="<tr><th>Data</th><th>Comprador</th><th>Itens</th><th>Valor</th><th></th></tr>";
  sales.forEach(function(s,i){
    h+="<tr><td>"+s.date+"</td><td>"+s.name+"</td><td>"+s.items+"</td><td>"+money(s.value)+"</td><td><button class='btn danger' data-i='"+i+"'>×</button></td></tr>";
  });
  var tb=$("#vendTable");tb.innerHTML=h;
  tb.querySelectorAll("button").forEach(function(b){b.onclick=function(){sales.splice(+b.dataset.i,1);persist();renderSales();updCounters()}});
  updCounters();
}

/* INIT */
document.addEventListener("DOMContentLoaded",function(){
  initNav();
  $("#qFilter").oninput=renderStock;
  $("#onlyHave").onchange=renderStock;
  $("#btnClear").onclick=function(){if(confirm("Zerar todo o estoque?")){stock={};persist();renderStock()}};

  $("#btnGenOffer").onclick=genOffer;
  $("#btnCopyOffer").onclick=function(){navigator.clipboard.writeText($("#offerOut").value);alert("Copiado!")};

  $("#btnImport").onclick=doImport;

  $("#btnWantAdd").onclick=function(){
    var r=parseList($("#wantIn").value);
    for(var c in r.items)r.items[c].forEach(function(n){wantAdd(c,n)});
    $("#wantIn").value="";renderWant();matchImport();
  };
  $("#btnWantCopy").onclick=function(){
    var l=Object.keys(wanted).map(function(c){return c+": "+ranges(wanted[c])}).join("\n");
    navigator.clipboard.writeText("🎯 PROCURO:\n"+l);alert("Copiado!");
  };
  $("#btnWantClear").onclick=function(){if(confirm("Limpar procuradas?")){wanted={};persist();renderWant()}};

  $("#btnOrcAdd").onclick=function(){
    var q=+$("#orcQty").value,u=+$("#orcUnit").value,f=+$("#orcFrete").value;
    orcs.push({name:$("#orcName").value||"—",qty:q,unit:u,frete:f,total:q*u+f});
    persist();renderOrc();
  };
  $("#orcQty").oninput=$("#orcUnit").oninput=$("#orcFrete").oninput=function(){
    $("#orcTotal").textContent=money(+$("#orcQty").value * +$("#orcUnit").value + +$("#orcFrete").value);
  };

  $("#btnVdAdd").onclick=function(){
    var items=$("#vdItems").value;
    sales.push({date:new Date().toLocaleDateString("pt-BR"),name:$("#vdName").value||"—",items:items,value:+$("#vdValue").value||0});
    if($("#vdBaixa").checked){var r=parseList(items);for(var c in r.items)r.items[c].forEach(function(n){addQty(c,n,-1)})}
    persist();renderSales();renderStock();
    $("#vdName").value=$("#vdItems").value=$("#vdValue").value="";
  };

  renderStock();renderWant();renderOrc();renderSales();
});
