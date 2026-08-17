/* ================= UI ================= */
function $(s){return document.querySelector(s)}
function $$
(s){return Array.prototype.slice.call(document.querySelectorAll(s))} function val(id){var e=document.getElementById(id);return e?e.value:""} var VIEW_TITLE={estoque:"Estoque",oferta:"Nova Oferta",livre:"Escolha Livre", procuradas:"Procuradas",orcamentos:"Orçamentos",vendas:"Vendas", scanner:"Scanner",testes:"Testes",faltantes:"Não Tenho"}; /* toggle: exibir nome do jogador dentro do quadradinho (checklist não-oficial) */ var showPlayers=localStorage.getItem("fig26_showplayers")==="1"; function toast(m,t){ var el=$("#toast"); el.className="show"+(t?" "+t:"");el.textContent=m; clearTimeout(toast._t); toast._t=setTimeout(function(){el.className=""},2800); } function copiar(id){ var el=document.getElementById(id); if(!el||!el.textContent.trim()){toast("⚠️ Gere a lista primeiro","warn2");return} navigator.clipboard.writeText(el.textContent).then(function(){toast("✅ Copiado! Cole no WhatsApp")}); } function compartilhar(id){ var el=document.getElementById(id); if(!el||!el.textContent.trim()){toast("⚠️ Gere a lista primeiro","warn2");return} if(navigator.share)navigator.share({text:el.textContent}).catch(function(){}); else copiar(id); } /* ---------- DRAWER ---------- */ function drawer(open){ $("#drawer").classList.toggle("show",open); $("#drawerBg").classList.toggle("show",open); $("#btnMenu").classList.toggle("open",open); document.body.style.overflow=open?"hidden":""; if(open)renderDrawerStats(); } function renderDrawerStats(){ var r=contar(stockMap()); $("#drawerStats").innerHTML= '<div class="dstat"><b>'+stockUnidades()+'</b><span>unidades</span></div>'+ '<div class="dstat"><b>'+r.total+'</b><span>diferentes</span></div>'+ '<div class="dstat"><b>'+rankDemanda(false).length+'</b><span>procuradas</span></div>'+ '<div class="dstat"><b>'+vendas.length+'</b><span>vendas</span></div>'; } function go(view,keepOpen){ var v=document.getElementById("v-"+view); if(!v)return;
$$(".view").forEach(function(x){x.classList.add("hidden")});
  v.classList.remove("hidden");
  $$
(".dn-item").forEach(function(b){b.classList.toggle("active",b.dataset.view===view)});
$$(".tab").forEach(function(b){b.classList.toggle("active",b.dataset.view===view)});
  $("#brandSub").textContent="Copa 2026 · "+(VIEW_TITLE[view]||"");
  if(!keepOpen)drawer(false);
  window.scrollTo({top:0,behavior:"smooth"});
  if(view!=="scanner"&&window.stopScanner)window.stopScanner();
  if(view==="estoque"){renderStock(val("searchStock"));updStockCounter()}
  if(view==="orcamentos"){renderOrcList();fecharOrc()}
  if(view==="vendas")renderSales();
  if(view==="livre")renderLivre(val("searchLivre"));
  if(view==="procuradas")renderDemanda();
  if(view==="faltantes")renderFaltantes(val("searchFal"));
}
function toggleHelp(o){$("#helpModal").classList.toggle("show",o)}

/* ---------- MODO CONFERÊNCIA ---------- */
function paintIgnore(){
  $("#swIgnore").classList.toggle("on",ignoreStock);
  $("#swLabel").textContent=ignoreStock?"Sem conferência":"Conferir estoque";
  ["bn1","bn2","bn3","bn4"].forEach(function(id){
    var b=document.getElementById(id); if(b)b.classList.toggle("show",ignoreStock);
  });
}
function toggleIgnore(){
  ignoreStock=!ignoreStock;saveIgnore();paintIgnore();
  renderStock(val("searchStock"));updStockCounter();
  renderLivre(val("searchLivre"));
  if(oferta)renderOferta();
  if(orcAtual)abrirOrc(orcAtual.id);
  toast(ignoreStock?"🔓 Sem conferência — seleções preservadas":"🔒 Conferência ativada — seleções preservadas","warn2");
}

/* ---------- MODO NOMES DE JOGADORES ---------- */
function paintPlayers(){
  var sw=$("#swPlayers"); if(!sw)return;
  sw.classList.toggle("on",showPlayers);
}
function togglePlayers(){
  showPlayers=!showPlayers;
  localStorage.setItem("fig26_showplayers",showPlayers?"1":"0");
  paintPlayers();
  renderStock(val("searchStock"));
  renderLivre(val("searchLivre"));
  if(oferta)renderOferta();
  if(orcAtual)abrirOrc(orcAtual.id);
  toast(showPlayers?"👤 Nomes de jogadores ativados (checklist não-oficial)":"👤 Nomes ocultados","warn2");
}

/* ---------- LISTAS DE TEXTO ---------- */
function buildList(map,title){
  var out="🏆 *"+title+"* 🏆\n_Catanos Figurinhas · Copa 2026_\n\n",any=false,lastG="__";
  Object.keys(map||{}).sort(function(a,b){return ORDER[a]-ORDER[b]}).forEach(function(c){
    var nums=(map[c]||[]).slice().sort(function(a,b){return a-b});
    if(!nums.length)return;
    any=true;
    var t=T[c];
    if(t.group&&t.group!==lastG){lastG=t.group;out+="── "+GROUP_TITLE[t.group]+" ──\n"}
    out+=flagEmoji(c)+" "+t.name+" ("+c+")\n"+nums.map(function(n){
      return c+" "+pad(n)+(isShiny(c,n)?"✨":"");
    }).join(", ")+"\n\n";
  });
  if(!any)return "Nenhuma figurinha selecionada.";
  var r=contar(map);
  out+="━━━━━━━━━━━━━━━\n📊 *RESUMO*\n";
  out+="Normais: *"+r.normais+"*\n✨ Brilhantes: *"+r.brilhantes+"*\n";
  out+="🎯 TOTAL: *"+r.total+"* figurinhas\n━━━━━━━━━━━━━━━\n";
  out+="_✨ = brilhante (a primeira de cada seleção e todas as FWC)_";
  return out;
}
function badgesResumo(map){
  var r=contar(map),so=contar(semEstoqueDe(map));
  var h='<span class="badge">Normais: '+r.normais+'</span>'+
        '<span class="badge sh">✨ Brilhantes: '+r.brilhantes+'</span>'+
        '<span class="badge ok">TOTAL: '+r.total+'</span>';
  if(so.total)h+='<span class="badge so">🔴 s/ estoque: '+so.total+'</span>';
  return h;
}
function pintarAces(elId,map,titulo){
  var el=document.getElementById(elId); if(!el)return;
  el.style.display="none";el.innerHTML="";
}

/* ---------- BOTÕES DE FIGURINHA ---------- */
function estadoBtn(code,num,sel){
  var tem=temEstoque(code,num);
  if(sel)return tem?"sel":"selout";
  return tem?"":"nostock";
}
function classeBtn(code,num,extra){
  var c="sticker-btn";
  if(extra)c+=" "+extra;
  if(isShiny(code,num))c+=" shiny";
  if(showPlayers&&playerAt(code,num))c+=" haveName";
  return c;
}
function innerBtn(code,num,qty,demQty){
  var badge="";
  if(qty>1)badge='<span class="qty-badge">'+qty+'</span>';
  else if(demQty>0)badge='<span class="dem-badge">'+demQty+'</span>';
  var nome=showPlayers?playerAt(code,num):"";
  var nomeHTML=nome?'<span class="acen">'+nome+'</span>':"";
  return pad(num)+badge+nomeHTML;
}
function mkBtn(code,num,extraClass,qty,demQty){
  var b=document.createElement("button");
  b.className=classeBtn(code,num,extraClass);
  b.innerHTML=innerBtn(code,num,qty,demQty);
  var tt=[code+" "+pad(num)];
  var nome=playerAt(code,num);
  if(nome)tt.push(nome);
  if(isShiny(code,num))tt.push("✨ Brilhante");
  if(!temEstoque(code,num))tt.push("sem estoque — pode selecionar mesmo assim");
  if(demQty>0)tt.push(demQty+" pessoa(s) procurando");
  b.title=tt.join(" • ");
  return b;
}
function teamHeader(t){
  var h='<div class="team-header">'+flagHTML(t.code)+
    '<span class="tname">'+t.name+'</span><span class="tsep">·</span>'+
    '<span class="tcode">'+t.code+'</span><span class="tsep">·</span>'+
    '<span class="tgrp">'+(t.group?"Grupo "+t.group:"Especial")+'</span>'+
    '<span class="tright">';
  if(t.allShiny)h+='<span class="shinytag">✨ TODAS BRILHANTES</span>';
  if(ACES_BY_TEAM[t.code])h+='<span class="acetag">⭐ CRAQUE</span>';
  var have=Object.keys(stock[t.code]||{}).length;
  h+='<span class="tct">'+have+'/'+countNums(t.code)+'</span></span></div>';
  if(ACES_BY_TEAM[t.code]){
    h+='<div class="acelist">⭐ Craque desta seleção: <b>'+teamAceLabel(t.code)+
       '</b> — número no álbum não confirmado</div>';
  }
  return h;
}
function groupBand(t){
  var d=document.createElement("div");
  d.className="group-label";
  var flags=teams.filter(function(x){return x.group===t.group&&x.iso})
    .map(function(x){return '<img src="'+flagURL(x.code,20)+'" alt="'+x.code+'">'}).join("");
  var titulo=t.group?GROUP_TITLE[t.group]:"🏆 FIFA World Cup 26 (00–19)";
  d.innerHTML='<span class="grp-dot"></span><b>'+titulo+'</b><span class="gflags">'+flags+'</span>';
  var probe=document.createElement("div");probe.className="team g-"+(t.group||"none");
  probe.style.display="none";document.body.appendChild(probe);
  d.querySelector(".grp-dot").style.background=getComputedStyle(probe).borderLeftColor;
  probe.remove();
  return d;
}

/* ---------- FILTROS ---------- */
function parseFiltro(raw){
  var s=(raw||"").trim();
  if(!s)return {kind:"none"};
  if(/^\d{1,2}$/.test(s))return {kind:"num",num:parseInt(s,10)};
  return {kind:"txt",txt:noAccent(s).toLowerCase()};
}
function matchTeam(t,f){
  if(!f)return true;
  if(noAccent(t.name).toLowerCase().indexOf(f)>-1)return true;
  if(t.code.toLowerCase().indexOf(f)>-1)return true;
  var as=ACES_BY_TEAM[t.code];
  return !!(as&&as.some(function(a){return noAccent(a.name).toLowerCase().indexOf(f)>-1}));
}

/* ================= ESTOQUE ================= */
function renderStock(filter){
  var f=parseFiltro(filter);
  var c=$("#stockContainer");c.innerHTML="";
  var tip=$("#filterTip");
  if(f.kind==="num"){
    tip.style.display="block";
    tip.innerHTML="🔢 Exibindo só a figurinha <b>"+pad(f.num)+"</b> de cada seleção.";
  }else tip.style.display="none";

  var lastG="__",shown=0;
  teams.forEach(function(t){
    if(f.kind==="txt"&&!matchTeam(t,f.txt))return;
    if(f.kind==="num"&&!validNum(t.code,f.num))return;
    if(f.kind==="none"&&t.group!==lastG){lastG=t.group;c.appendChild(groupBand(t))}

    var d=document.createElement("div");
    d.className="team g-"+(t.group||"none")+(t.allShiny?" allshiny":"")+(ACES_BY_TEAM[t.code]?" hasace":"");
    d.innerHTML=teamHeader(t);
    var g=document.createElement("div");g.className="stickers";
    numsOf(t).forEach(function(i){
      if(f.kind==="num"&&i!==f.num)return;
      var q=getQty(t.code,i),dq=q===0?demandaDe(t.code,i):0;
      var b=mkBtn(t.code,i,q>0?"has":"",q,dq);
      function refresh(){
        var nq=getQty(t.code,i),ndq=nq===0?demandaDe(t.code,i):0;
        b.className=classeBtn(t.code,i,nq>0?"has":"");
        b.innerHTML=innerBtn(t.code,i,nq,ndq);
        updStockCounter();updDemPill();
      }
      b.onclick=function(e){
        if(b._long){b._long=false;return}
        setQty(t.code,i,e.shiftKey?getQty(t.code,i)-1:getQty(t.code,i)+1);refresh();
      };
      b.oncontextmenu=function(e){e.preventDefault();setQty(t.code,i,getQty(t.code,i)-1);refresh()};
      var tm=null;
      b.addEventListener("touchstart",function(){
        b._long=false;
        tm=setTimeout(function(){
          b._long=true;setQty(t.code,i,getQty(t.code,i)-1);refresh();
          if(navigator.vibrate)navigator.vibrate(25);
        },480);
      },{passive:true});
      ["touchend","touchmove","touchcancel"].forEach(function(ev){
        b.addEventListener(ev,function(){clearTimeout(tm)},{passive:true});
      });
      g.appendChild(b);
    });
    d.appendChild(g);c.appendChild(d);shown++;
  });
  if(!shown)c.innerHTML='<div class="empty">Nenhum resultado para este filtro.</div>';
}
function updStockCounter(){
  var map=stockMap(),r=contar(map);
  $("#stockCounter").innerHTML=
    '<span class="badge">Normais: '+r.normais+'</span>'+
    '<span class="badge sh">✨ Brilhantes: '+r.brilhantes+'</span>'+
    '<span class="badge ok">'+r.total+' diferentes</span>'+
    '<span class="badge">'+stockUnidades()+' unidades</span>';
  pintarAces("stockAces",map);
}
function gerarListaEstoque(){
  var el=$("#outStock");
  el.style.display="block";
  el.textContent=buildList(stockMap(),"FIGURINHAS DISPONÍVEIS");
}
function zerarEstoque(){
  if(!confirm("Zerar TODO o estoque? Esta ação não pode ser desfeita."))return;
  stock={};saveStock();
  renderStock(val("searchStock"));updStockCounter();updDemPill();
  $("#outStock").style.display="none";
  if(oferta)renderOferta();
  renderLivre(val("searchLivre"));
  toast("🗑️ Estoque zerado");
}

/* ================= NOVA OFERTA ================= */
var oferta=null;
function processarOferta(){
  var txt=val("ofInput"),nm=val("ofName").trim()||"Cliente sem nome";
  if(!txt.trim()){toast("⚠️ Cole uma lista primeiro","warn2");return}
  var p=parseList(txt);
  if(!p.order.length){toast("❌ Nenhum código válido encontrado","err");return}
  var requested={},offered={},missing={};
  p.order.sort(function(a,b){return ORDER[a]-ORDER[b]}).forEach(function(code){
    var nums=p.found[code].slice().sort(function(a,b){return a-b});
    requested[code]=nums;
    var have=nums.filter(function(n){return temEstoque(code,n)});
    var no=nums.filter(function(n){return !temEstoque(code,n)});
    if(no.length)missing[code]=no;
    if(!ignoreStock&&have.length)offered[code]=have.slice();
  });
  oferta={name:nm,requested:requested,offered:offered,missing:missing};
  var rd=registrarDemanda(nm,requested);
  updDemPill();
  $("#ofResultArea").classList.remove("hidden");
  $("#outOferta").style.display="none";
  renderOferta();
  if(rd.total)toast("🔎 "+rd.total+" que você não tem foram para 'Procuradas' — mas dá para selecionar","warn2");
  else{
    var ro=contar(offered);
    toast(ro.total?("✅ "+ro.total+" disponíveis ("+ro.brilhantes+" ✨)")
                  :"Selecione o que quer oferecer","warn2");
  }
}
function ofSel(code,n){return !!(oferta.offered[code]&&oferta.offered[code].indexOf(n)>-1)}
function renderOferta(){
  var c=$("#ofContainer");c.innerHTML="";
  Object.keys(oferta.requested).sort(function(a,b){return ORDER[a]-ORDER[b]}).forEach(function(code){
    var t=T[code],d=document.createElement("div");
    d.className="team g-"+(t.group||"none")+(t.allShiny?" allshiny":"")+(ACES_BY_TEAM[code]?" hasace":"");
    d.innerHTML=teamHeader(t);
    var g=document.createElement("div");g.className="stickers";
    oferta.requested[code].forEach(function(n){
      var b=mkBtn(code,n,estadoBtn(code,n,ofSel(code,n)),0,demandaDe(code,n));
      b.onclick=function(){
        if(!oferta.offered[code])oferta.offered[code]=[];
        var i=oferta.offered[code].indexOf(n);
        if(i>-1)oferta.offered[code].splice(i,1);
        else oferta.offered[code].push(n);
        if(!oferta.offered[code].length)delete oferta.offered[code];
        b.className=classeBtn(code,n,estadoBtn(code,n,ofSel(code,n)));
        updOfCounter();
      };
      g.appendChild(b);
    });
    d.appendChild(g);c.appendChild(d);
  });
  updOfCounter();
}
function updOfCounter(){
  var sel=ordenaMapa(oferta.offered),req=contar(oferta.requested);
  $("#ofCounter").innerHTML='<span class="badge">Pediu: '+req.total+'</span>'+badgesResumo(sel);
  pintarAces("ofAces",sel);
}
function ofMarcar(modo){
  if(!oferta)return;
  oferta.offered={};
  if(modo!=="off"){
    Object.keys(oferta.requested).forEach(function(c){
      var a=oferta.requested[c].filter(function(n){return modo==="any"||temEstoque(c,n)});
      if(a.length)oferta.offered[c]=a;
    });
  }
  renderOferta();
}
function gerarListaOferta(){
  if(!oferta)return;
  var sel=ordenaMapa(oferta.offered);
  if(!mapTotal(sel)){toast("⚠️ Nada selecionado","warn2");return}
  var el=$("#outOferta");el.style.display="block";
  var txt=buildList(sel,"OFERTA PARA "+oferta.name.toUpperCase());
  var so=semEstoqueDe(sel);
  if(mapTotal(so)){
    txt+="\n\n🔴 *ATENÇÃO — ainda não cadastradas no estoque ("+mapTotal(so)+")*\n";
    Object.keys(so).forEach(function(c){txt+="   "+c+": "+ranges(so[c])+"\n"});
  }
  el.textContent=txt;
}
function salvarOrcamento(nome,offered,requested){
  var sel=ordenaMapa(offered);
  if(!mapTotal(sel)){toast("⚠️ Nada selecionado para salvar","warn2");return null}
  var o={id:"o"+Date.now(),name:nome||"Cliente sem nome",date:hoje(),
    offered:sel,requested:ordenaMapa(requested||sel)};
  orcamentos.unshift(o);saveOrc();updOrcPill();
  toast("💾 Orçamento de "+o.name+" salvo ("+mapTotal(sel)+" figurinhas)");
  return o;
}

/* ================= ESCOLHA LIVRE ================= */
var livreSel={};
function lvIs(c,n){return !!(livreSel[c]&&livreSel[c].indexOf(n)>-1)}
function renderLivre(filter){
  var f=parseFiltro(filter),onlyStock=$("#lvOnlyStock").checked;
  var c=$("#lvContainer");c.innerHTML="";
  var lastG="__",shown=0;
  teams.forEach(function(t){
    if(f.kind==="txt"&&!matchTeam(t,f.txt))return;
    if(f.kind==="num"&&!validNum(t.code,f.num))return;
    if(onlyStock&&!Object.keys(stock[t.code]||{}).length)return;
    if(f.kind==="none"&&!onlyStock&&t.group!==lastG){lastG=t.group;c.appendChild(groupBand(t))}
    var d=document.createElement("div");
    d.className="team g-"+(t.group||"none")+(t.allShiny?" allshiny":"")+(ACES_BY_TEAM[t.code]?" hasace":"");
    d.innerHTML=teamHeader(t);
    var g=document.createElement("div");g.className="stickers";
    numsOf(t).forEach(function(n){
      if(f.kind==="num"&&n!==f.num)return;
      var b=mkBtn(t.code,n,estadoBtn(t.code,n,lvIs(t.code,n)),0,demandaDe(t.code,n));
      b.onclick=function(){
        if(!livreSel[t.code])livreSel[t.code]=[];
        var i=livreSel[t.code].indexOf(n);
        if(i>-1)livreSel[t.code].splice(i,1);
        else livreSel[t.code].push(n);
        if(!livreSel[t.code].length)delete livreSel[t.code];
        b.className=classeBtn(t.code,n,estadoBtn(t.code,n,lvIs(t.code,n)));
        updLvCounter();
      };
      g.appendChild(b);
    });
    d.appendChild(g);c.appendChild(d);shown++;
  });
  if(!shown)c.innerHTML='<div class="empty">Nenhuma seleção para este filtro.</div>';
  updLvCounter();
}
function updLvCounter(){
  var sel=ordenaMapa(livreSel);
  $("#lvCounter").innerHTML=mapTotal(sel)?badgesResumo(sel)
    :'<span class="badge">Nenhuma figurinha selecionada</span>';
  pintarAces("lvAces",sel);
}
function gerarListaLivre(){
  var sel=ordenaMapa(livreSel);
  if(!mapTotal(sel)){toast("⚠️ Selecione figurinhas primeiro","warn2");return}
  var el=$("#outLivre");el.style.display="block";
  var nm=val("lvName").trim()||"CLIENTE";
  var txt=buildList(sel,"OFERTA PARA "+nm.toUpperCase());
  var so=semEstoqueDe(sel);
  if(mapTotal(so)){
    txt+="\n\n🔴 *ainda não cadastradas no estoque ("+mapTotal(so)+")*\n";
    Object.keys(so).forEach(function(c){txt+="   "+c+": "+ranges(so[c])+"\n"});
  }
  el.textContent=txt;
}

/* ================= PROCURADAS ================= */
function updDemPill(){
  var t=rankDemanda(false).length;
  var p=$("#pillDem");p.textContent=t;p.classList.toggle("hidden",t===0);
  $("#tabPillDem").classList.toggle("hidden",t===0);
  $("#burgerPill").classList.toggle("hidden",t===0);
}
function updOrcPill(){
  var p=$("#pillOrc");p.textContent=orcamentos.length;
  p.classList.toggle("hidden",orcamentos.length===0);
}
function renderDemanda(){
  var f=noAccent(val("searchDem")).toLowerCase();
  var onlyHot=$("#demOnlyHot").checked;
  var rank=rankDemanda(false),map=demandaMap(),r=contar(map);
  var pessoas={};demanda.forEach(function(d){pessoas[d.name]=1});
  $("#demCounter").innerHTML=
    '<span class="badge dm">Procuradas: '+r.total+'</span>'+
    '<span class="badge">Normais: '+r.normais+'</span>'+
    '<span class="badge sh">✨ '+r.brilhantes+'</span>'+
    '<span class="badge ok">'+Object.keys(pessoas).length+' pessoa(s)</span>';
  pintarAces("demAces",map);

  var lista=rank.filter(function(it){
    if(onlyHot&&it.count<2)return false;
    if(!f)return true;
    if((it.code+" "+pad(it.num)).toLowerCase().indexOf(f)>-1)return true;
    if(noAccent(T[it.code].name).toLowerCase().indexOf(f)>-1)return true;
    return it.clients.some(function(cl){return noAccent(cl).toLowerCase().indexOf(f)>-1});
  });
  var box=$("#demRanking");
  if(!rank.length){
    box.innerHTML='<div class="empty">Nenhuma figurinha procurada no momento. 🎉<br>'+
      'Processe uma lista em <b>Nova Oferta</b> — o que faltar aparece aqui.</div>';
    $("#outDem").style.display="none";renderDemList();return;
  }
  if(!lista.length){box.innerHTML='<div class="empty">Nenhum resultado para este filtro.</div>';renderDemList();return}
  box.innerHTML="";
  lista.forEach(function(it,i){
    var d=document.createElement("div");
    d.className="demrow"+(it.count>=2?" hot":"");
    var tag=isShiny(it.code,it.num)?'<span class="tagshiny">✨ brilhante</span>':"";
    d.innerHTML='<div class="rank">'+(i+1)+'º</div>'+
      '<div class="info"><div class="code">'+flagHTML(it.code)+' '+it.code+' '+pad(it.num)+tag+'</div>'+
      '<div class="who">'+T[it.code].name+' • pedida por: '+it.clients.join(", ")+'</div></div>'+
      '<div class="cnt">'+it.count+'×</div>'+
      '<div class="act"><button class="btn btn-sm green">+1</button></div>';
    d.querySelector("button").onclick=function(){
      setQty(it.code,it.num,getQty(it.code,it.num)+1);
      renderStock(val("searchStock"));updStockCounter();
      renderLivre(val("searchLivre"));
      if(oferta)renderOferta();
      renderDemanda();updDemPill();
      toast("✅ "+it.code+" "+pad(it.num)+" entrou no estoque — "+it.count+" pessoa(s) querem");
    };
    box.appendChild(d);
  });
  renderDemList();
}
function renderDemList(){
  var c=$("#demList");
  if(!demanda.length){c.innerHTML='<div class="empty">Nenhum pedido registrado ainda.</div>';return}
  c.innerHTML="";
  demanda.forEach(function(d){
    var todos=contar(d.items||{}),pend={};
    Object.keys(d.items||{}).forEach(function(cd){
      var p=d.items[cd].filter(function(n){return !temEstoque(cd,n)});
      if(p.length)pend[cd]=p;
    });
    var rp=contar(pend);
    var el=document.createElement("div");el.className="card dem";
    var html='<div class="card-top"><span class="card-title">'+d.name+'</span>'+
      '<span class="card-meta">'+d.date+'</span></div>'+
      '<div class="card-sub">Pediu '+todos.total+' que eu não tinha • ainda faltam '+
      '<b style="color:#ff9c9c">'+rp.total+'</b>'+
      (rp.total<todos.total?' • <span style="color:#8fe0ae">'+(todos.total-rp.total)+' já consegui</span>':'')+'</div>';
    html+='<div class="card-actions"><button class="btn btn-sm">📋 Ver lista</button>'+
      '<button class="btn btn-sm red">🗑️ Excluir</button></div>'+
      '<div class="out" id="dem-'+d.id+'"></div>';
    el.innerHTML=html;
    var bs=el.querySelectorAll(".card-actions button");
    bs[0].onclick=function(){
      var o=document.getElementById("dem-"+d.id);
      if(o.style.display==="block"){o.style.display="none";return}
      o.style.display="block";
      o.textContent=buildList(d.items||{},"PROCURO PARA "+d.name.toUpperCase());
    };
    bs[1].onclick=function(){
      if(!confirm('Excluir o pedido de "'+d.name+'" do radar de procuradas?'))return;
      demanda=demanda.filter(function(x){return x.id!==d.id});
      saveDem();renderDemanda();updDemPill();toast("🗑️ Pedido removido");
    };
    c.appendChild(el);
  });
}
function gerarListaDemanda(){
  var rank=rankDemanda(false),el=$("#outDem");
  if(!rank.length){toast("🎉 Nada procurado no momento","warn2");return}
  var map=demandaMap(),r=contar(map);

  var qtd={};
  rank.forEach(function(it){qtd[it.code+"-"+pad(it.num)]=it.count});
  function mult(c,n){var q=qtd[c+"-"+pad(n)]||1;return q>1?" (x"+q+")":""}

  var out="🔎 *PROCURO ESTAS FIGURINHAS* 🔎\n_Catanos Figurinhas · Copa 2026 — troco ou compro_\n\n";
  Object.keys(map).forEach(function(c){
    out+=flagEmoji(c)+" "+T[c].name+" ("+c+")\n"+map[c].map(function(n){
      return c+" "+pad(n)+(isShiny(c,n)?"✨":"")+mult(c,n);
    }).join(", ")+"\n\n";
  });

  var hot=rank.filter(function(it){return it.count>=2});
  if(hot.length){
    out+="🔥 *MAIS PEDIDAS* (prioridade)\n";
    hot.slice(0,10).forEach(function(it){
      out+="   • "+it.code+" "+pad(it.num)+(isShiny(it.code,it.num)?"✨":"")+
        " — "+it.count+" pessoas querem\n";
    });
    out+="\n";
  }

  out+="━━━━━━━━━━━━━━━\n📊 *RESUMO*\n";
  out+="Normais: *"+r.normais+"*\n✨ Brilhantes: *"+r.brilhantes+"*\n";
  out+="🎯 TOTAL PROCURADO: *"+r.total+"* figurinhas\n";
  out+="📦 Somando repetições: *"+rank.reduce(function(s,it){return s+it.count},0)+"* unidades\n";
  out+="━━━━━━━━━━━━━━━\n";
  out+="_(x3) = quantas pessoas procuram aquela figurinha_\n";
  out+="_Tenho muitas repetidas para troca — chama no privado!_";
  el.style.display="block";el.textContent=out;
}
function limparDemanda(){
  if(!demanda.length){toast("Nada para limpar","warn2");return}
  if(!confirm("Apagar TODOS os registros de figurinhas procuradas?\n\nIsso não afeta o estoque nem as vendas."))return;
  demanda=[];saveDem();renderDemanda();updDemPill();
  $("#outDem").style.display="none";
  toast("🗑️ Registros de procuradas apagados");
}

/* ================= ORÇAMENTOS ================= */
var orcAtual=null;
function renderOrcList(){
  updOrcPill();
  var c=$("#orcList");
  if(!orcamentos.length){
    c.innerHTML='<div class="empty">Nenhum orçamento salvo.<br>Monte uma oferta em <b>Nova Oferta</b> ou <b>Escolha Livre</b>.</div>';
    return;
  }
  c.innerHTML="";
  orcamentos.forEach(function(o){
    var r=contar(o.offered),so=contar(semEstoqueDe(o.offered));
    var el=document.createElement("div");el.className="card";
    var html='<div class="card-top"><span class="card-title">'+o.name+'</span>'+
      '<span class="card-meta">'+o.date+'</span></div>'+
      '<div class="card-sub">'+r.total+' figurinhas • ✨ '+r.brilhantes+
      (so.total?' • <span style="color:#ffd9d9">🔴 '+so.total+' s/ estoque</span>':'')+'</div>';
    html+='<div class="card-actions"><button class="btn btn-sm green">📂 Abrir</button>'+
      '<button class="btn btn-sm red">🗑️ Excluir</button></div>';
    el.innerHTML=html;
    var bs=el.querySelectorAll("button");
    bs[0].onclick=function(){abrirOrc(o.id)};
    bs[1].onclick=function(){
      if(!confirm('Excluir o orçamento de "'+o.name+'"?'))return;
      orcamentos=orcamentos.filter(function(x){return x.id!==o.id});
      saveOrc();renderOrcList();fecharOrc();toast("🗑️ Orçamento excluído");
    };
    c.appendChild(el);
  });
}
function orcSel(o,c,n){return !!(o.offered[c]&&o.offered[c].indexOf(n)>-1)}
function abrirOrc(id){
  var o=orcamentos.filter(function(x){return x.id===id})[0];
  if(!o)return;
  orcAtual=o;
  $("#orcDetail").classList.remove("hidden");
  $("#orcDetailTitle").textContent="🧾 "+o.name;
  $("#orcDetailSub").textContent="Salvo em "+o.date+" — clique para ajustar antes de vender";
  $("#outOrc").style.display="none";
  var base=o.requested&&Object.keys(o.requested).length?o.requested:o.offered;
  var c=$("#orcDetailContainer");c.innerHTML="";
  Object.keys(base).sort(function(a,b){return ORDER[a]-ORDER[b]}).forEach(function(code){
    var t=T[code];if(!t)return;
    var d=document.createElement("div");
    d.className="team g-"+(t.group||"none")+(t.allShiny?" allshiny":"")+(ACES_BY_TEAM[code]?" hasace":"");
    d.innerHTML=teamHeader(t);
    var g=document.createElement("div");g.className="stickers";
    base[code].forEach(function(n){
      var b=mkBtn(code,n,estadoBtn(code,n,orcSel(o,code,n)),0,0);
      b.onclick=function(){
        if(!o.offered[code])o.offered[code]=[];
        var i=o.offered[code].indexOf(n);
        if(i>-1)o.offered[code].splice(i,1);else o.offered[code].push(n);
        if(!o.offered[code].length)delete o.offered[code];
        o.offered=ordenaMapa(o.offered);saveOrc();
        b.className=classeBtn(code,n,estadoBtn(code,n,orcSel(o,code,n)));
        updOrcCounter();
      };
      g.appendChild(b);
    });
    d.appendChild(g);c.appendChild(d);
  });
  updOrcCounter();
  $("#orcDetail").scrollIntoView({behavior:"smooth"});
}
function updOrcCounter(){
  if(!orcAtual)return;
  var sel=ordenaMapa(orcAtual.offered);
  $("#orcCounter").innerHTML=badgesResumo(sel);
  pintarAces("orcAces",sel);
  var so=semEstoqueDe(sel),w=$("#orcWarn");
  if(mapTotal(so)&&!ignoreStock){
    w.style.display="block";
    w.innerHTML="⚠️ <b>"+mapTotal(so)+" figurinha(s) sem saldo no estoque:</b><br>"+
      Object.keys(so).map(function(c){return c+" "+ranges(so[c])}).join(" • ")+
      "<br>Na confirmação da venda você poderá cadastrá-las automaticamente.";
  }else w.style.display="none";
}
function fecharOrc(){orcAtual=null;$("#orcDetail").classList.add("hidden")}
function gerarListaOrc(){
  if(!orcAtual)return;
  var sel=ordenaMapa(orcAtual.offered);
  if(!mapTotal(sel)){toast("⚠️ Nada selecionado","warn2");return}
  var el=$("#outOrc");el.style.display="block";
  el.textContent=buildList(sel,"OFERTA PARA "+orcAtual.name.toUpperCase());
}
function confirmarVenda(){
  if(!orcAtual)return;
  var sel=ordenaMapa(orcAtual.offered);
  if(!mapTotal(sel)){toast("⚠️ Nada selecionado","warn2");return}
  var so=semEstoqueDe(sel),cadastrar=false;
  if(mapTotal(so)){
    var lista=Object.keys(so).map(function(c){return c+" "+ranges(so[c])}).join("\n");
    cadastrar=confirm("🔴 "+mapTotal(so)+" figurinha(s) selecionadas NÃO estão no estoque:\n\n"+lista+
      "\n\nOK = cadastrar automaticamente (+1) e dar baixa\nCancelar = vender sem cadastrar");
  }
  if(!confirm("Confirmar a venda de "+mapTotal(sel)+" figurinhas para "+orcAtual.name+"?\n\nO estoque será baixado."))return;
  if(cadastrar)Object.keys(so).forEach(function(c){so[c].forEach(function(n){setQty(c,n,getQty(c,n)+1)})});
  Object.keys(sel).forEach(function(c){sel[c].forEach(function(n){setQty(c,n,getQty(c,n)-1)})});
  vendas.unshift({id:"v"+Date.now(),name:orcAtual.name,date:hoje(),sold:sel,orcId:orcAtual.id});
  orcamentos=orcamentos.filter(function(x){return x.id!==orcAtual.id});
  saveOrc();saveSales();
  var r=contar(sel);
  fecharOrc();renderOrcList();
  renderStock(val("searchStock"));updStockCounter();
  renderLivre(val("searchLivre"));renderDemanda();updDemPill();
  toast("💰 Venda de "+r.total+" figurinhas confirmada!");
  go("vendas");
}

/* ================= VENDAS ================= */
function renderSales(){
  var c=$("#salesList"),tot=0,map={};
  vendas.forEach(function(v){
    Object.keys(v.sold||{}).forEach(function(cd){
      tot+=v.sold[cd].length;
      if(!map[cd])map[cd]=[];
      v.sold[cd].forEach(function(n){map[cd].push(n)});
    });
  });
  var r=contar(map);
  $("#salesCounter").innerHTML=
    '<span class="badge ok">'+vendas.length+' venda(s)</span>'+
    '<span class="badge">'+tot+' figurinhas</span>'+
    '<span class="badge sh">✨ '+r.brilhantes+'</span>';
  if(!vendas.length){c.innerHTML='<div class="empty">Nenhuma venda registrada ainda.</div>';return}
  c.innerHTML="";
  vendas.forEach(function(v){
    var rv=contar(v.sold||{});
    var el=document.createElement("div");el.className="card sale";
    var html='<div class="card-top"><span class="card-title">'+v.name+'</span>'+
      '<span class="card-meta">'+v.date+'</span></div>'+
      '<div class="card-sub">'+rv.total+' figurinhas • ✨ '+rv.brilhantes+'</div>';
    html+='<div class="card-actions"><button class="btn btn-sm">📋 Ver lista</button>'+
      '<button class="btn btn-sm blue">↩️ Cancelar Venda</button>'+
      '<button class="btn btn-sm red">🗑️ Excluir</button></div>'+
      '<div class="out" id="sale-'+v.id+'"></div>';
    el.innerHTML=html;
    var bs=el.querySelectorAll(".card-actions button");
    bs[0].onclick=function(){
      var o=document.getElementById("sale-"+v.id);
      if(o.style.display==="block"){o.style.display="none";return}
      o.style.display="block";
      o.textContent=buildList(v.sold||{},"VENDA — "+v.name.toUpperCase());
    };
    bs[1].onclick=function(){
      if(!confirm("Cancelar a venda de "+v.name+"?\n\nAs figurinhas voltam ao estoque e o orçamento é recriado."))return;
      Object.keys(v.sold||{}).forEach(function(cd){
        v.sold[cd].forEach(function(n){setQty(cd,n,getQty(cd,n)+1)});
      });
      orcamentos.unshift({id:v.orcId||("o"+Date.now()),name:v.name,date:hoje(),
        offered:clonaMapa(v.sold),requested:clonaMapa(v.sold)});
      vendas=vendas.filter(function(x){return x.id!==v.id});
      saveOrc();saveSales();
      renderSales();renderStock(val("searchStock"));updStockCounter();
      renderLivre(val("searchLivre"));renderDemanda();updDemPill();updOrcPill();
      toast("↩️ Venda cancelada — estoque devolvido e orçamento recriado");
    };
    bs[2].onclick=function(){
      if(!confirm("Excluir apenas o registro da venda de "+v.name+"?\n\nO estoque NÃO será alterado."))return;
      vendas=vendas.filter(function(x){return x.id!==v.id});
      saveSales();renderSales();toast("🗑️ Registro excluído");
    };
    c.appendChild(el);
  });
}

/* ================= FALTANTES ================= */
function renderFaltantes(filter){
  var f=parseFiltro(filter);
  var c=$("#falContainer");c.innerHTML="";
  var lastG="__",shown=0;
  teams.forEach(function(t){
    if(f.kind==="txt"&&!matchTeam(t,f.txt))return;
    if(f.kind==="num"&&!validNum(t.code,f.num))return;
    var nums=numsOf(t).filter(function(n){
      if(temEstoque(t.code,n))return false;
      if(f.kind==="num")return n===f.num;
      return true;
    });
    if(!nums.length)return;
    if(f.kind==="none"&&t.group!==lastG){lastG=t.group;c.appendChild(groupBand(t))}
    var d=document.createElement("div");
    d.className="team g-"+(t.group||"none")+(t.allShiny?" allshiny":"")+(ACES_BY_TEAM[t.code]?" hasace":"");
    d.innerHTML=teamHeader(t);
    var g=document.createElement("div");g.className="stickers";
    nums.forEach(function(n){
      var b=mkBtn(t.code,n,"nostock",0,demandaDe(t.code,n));
      b.onclick=function(){toast("Cadastre em 📦 Estoque quando conseguir esta figurinha","warn2")};
      g.appendChild(b);
    });
    d.appendChild(g);c.appendChild(d);shown++;
  });
  if(!shown)c.innerHTML='<div class="empty">🎉 Você já tem todas as figurinhas deste filtro!</div>';
  var map=faltantesMap(),r=contar(map);
  $("#falCounter").innerHTML=
    '<span class="badge dm">Faltam: '+r.total+'</span>'+
    '<span class="badge">Normais: '+r.normais+'</span>'+
    '<span class="badge sh">✨ Brilhantes: '+r.brilhantes+'</span>';
  pintarAces("falAces",map);
}
function gerarListaFaltantes(){
  var map=faltantesMap();
  if(!mapTotal(map)){toast("🎉 Você já tem o álbum completo!","warn2");return}
  var el=$("#outFal");el.style.display="block";
  el.textContent=buildList(map,"FIGURINHAS QUE FALTAM NO MEU ÁLBUM");
}

/* ================= BACKUP ================= */
function doExport(){
  var b=new Blob([exportJSON()],{type:"application/json"});
  var a=document.createElement("a");
  a.href=URL.createObjectURL(b);
  a.download="catanos-figurinhas-"+new Date().toISOString().slice(0,10)+".json";
  a.click();toast("⬇️ Backup gerado");
}
function doImportFile(e){
  var f=e.target.files[0];if(!f)return;
  var rd=new FileReader();
  rd.onload=function(){
    try{
      importJSON(rd.result);paintIgnore();
      renderStock(val("searchStock"));updStockCounter();
      renderOrcList();renderSales();renderDemanda();updDemPill();updOrcPill();
      renderLivre(val("searchLivre"));renderDrawerStats();
      toast("⬆️ Backup restaurado com sucesso");
    }catch(err){toast("❌ Arquivo inválido","err")}
  };
  rd.readAsText(f);e.target.value="";
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded",function(){
  $$
(".dn-item").forEach(function(b){b.onclick=function(){go(b.dataset.view)}});
$$(".tab").forEach(function(b){b.onclick=function(){go(b.dataset.view)}});
  $("#btnMenu").onclick=function(){drawer(!$("#drawer").classList.contains("show"))};
  $("#btnDrawerClose").onclick=function(){drawer(false)};
  $("#drawerBg").onclick=function(){drawer(false)};
  $("#swIgnore").onclick=toggleIgnore;
  $("#swPlayers").onclick=togglePlayers;
  $("#btnHelp").onclick=function(){toggleHelp(true)};
  $("#btnHelpClose").onclick=function(){toggleHelp(false)};
  $("#helpModal").onclick=function(e){if(e.target===this)toggleHelp(false)};
  document.addEventListener("keydown",function(e){
    var tag=document.activeElement.tagName;
    if(e.key==="Escape"){toggleHelp(false);drawer(false)}
    if(["INPUT","TEXTAREA","SELECT"].indexOf(tag)>-1)return;
    if(e.key==="?")toggleHelp(true);
    if(e.key==="m"||e.key==="M")drawer(!$("#drawer").classList.contains("show"));
  });
  (function(){
    var x0=null;
    $("#drawer").addEventListener("touchstart",function(e){x0=e.touches[0].clientX},{passive:true});
    $("#drawer").addEventListener("touchend",function(e){
      if(x0!==null&&e.changedTouches[0].clientX-x0<-55)drawer(false);
      x0=null;
    },{passive:true});
  })();

  $$
("[data-copy]").forEach(function(b){b.onclick=function(){copiar(b.dataset.copy)}});
$$("[data-share]").forEach(function(b){b.onclick=function(){compartilhar(b.dataset.share)}});

  $("#searchStock").oninput=function(){renderStock(this.value)};
  $("#btnListStock").onclick=gerarListaEstoque;
  $("#btnZerar").onclick=zerarEstoque;
  $("#btnExport").onclick=doExport;
  $("#btnExportD").onclick=doExport;
  $("#btnImport").onclick=function(){$("#impFile").click()};
  $("#btnImportD").onclick=function(){$("#impFile").click()};
  $("#impFile").onchange=doImportFile;

  $("#btnProc").onclick=processarOferta;
  $("#btnLimparOf").onclick=function(){
    $("#ofInput").value="";$("#ofName").value="";
    oferta=null;$("#ofResultArea").classList.add("hidden");
    toast("🗑️ Campos limpos");
  };
  $("#btnAllOn").onclick=function(){ofMarcar("have")};
  $("#btnAllAny").onclick=function(){ofMarcar("any")};
  $("#btnAllOff").onclick=function(){ofMarcar("off")};
  $("#btnListOf").onclick=gerarListaOferta;
  $("#btnSaveOf").onclick=function(){
    if(!oferta)return;
    if(salvarOrcamento(oferta.name,oferta.offered,oferta.requested)){renderOrcList();go("
