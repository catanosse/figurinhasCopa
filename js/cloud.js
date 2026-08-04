/* =====================================================================
   CATANOS FIGURINHAS — Sincronização na nuvem (Supabase)
   Auto-injetável: não requer alteração em data.js / store.js / ui.js
   ===================================================================== */
(function(){
"use strict";

var SUPABASE_URL = "https://mwlcekrhfqzgtujxqqsa.supabase.co";
var SUPABASE_KEY = "sb_publishable_n6AyPxKILdSIHasCERCPQA_9Q4yqYM4";
var TABLE        = "app_data";
var K_LOCAL_TS   = "fig26_local_ts";
var K_PENDING    = "fig26_pending";

var sb=null, user=null, syncing=false, pushTimer=null, ready=false;

/* ---------- helpers ---------- */
function localTS(){return parseInt(localStorage.getItem(K_LOCAL_TS)||"0",10)}
function markLocal(){localStorage.setItem(K_LOCAL_TS,String(Date.now()))}
function pending(){return localStorage.getItem(K_PENDING)==="1"}
function setPending(v){localStorage.setItem(K_PENDING,v?"1":"0")}
function say(m,t){if(window.toast)toast(m,t);else console.log(m)}
function el(id){return document.getElementById(id)}

function snapshot(){
  return {stock:stock,orcamentos:orcamentos,vendas:vendas,demanda:demanda,
          ignoreStock:ignoreStock,ts:localTS()};
}
function applyRemote(d){
  if(!d)return;
  window.stock       = d.stock       || {};
  window.orcamentos  = d.orcamentos  || [];
  window.vendas      = d.vendas      || [];
  window.demanda     = d.demanda     || [];
  if(typeof d.ignoreStock==="boolean")window.ignoreStock=d.ignoreStock;
  localStorage.setItem(K_STOCK,JSON.stringify(stock));
  localStorage.setItem(K_ORC,JSON.stringify(orcamentos));
  localStorage.setItem(K_SALES,JSON.stringify(vendas));
  localStorage.setItem(K_DEM,JSON.stringify(demanda));
  localStorage.setItem(K_IGN,ignoreStock?"1":"0");
  localStorage.setItem(K_LOCAL_TS,String(d.ts||Date.now()));
  redraw();
}
function redraw(){
  try{
    if(window.paintIgnore)paintIgnore();
    if(window.renderStock){renderStock(val("searchStock"));updStockCounter()}
    if(window.renderLivre)renderLivre(val("searchLivre"));
    if(window.renderOrcList)renderOrcList();
    if(window.renderSales)renderSales();
    if(window.renderDemanda)renderDemanda();
    if(window.updDemPill)updDemPill();
    if(window.updOrcPill)updOrcPill();
    if(window.renderDrawerStats)renderDrawerStats();
  }catch(e){console.warn(e)}
}

/* ---------- UI injetada ---------- */
function injectStyles(){
  var s=document.createElement("style");
  s.textContent=
  ".cloud-box{background:#141c22;border:1px solid #2a4250;border-radius:12px;padding:12px 14px;"+
    "margin:0 0 14px;font-size:12.5px;line-height:1.6}"+
  ".cloud-box .cb-top{display:flex;align-items:center;gap:9px;flex-wrap:wrap}"+
  ".cloud-box .cb-ic{font-size:17px}"+
  ".cloud-box b{color:#9fd8f5}"+
  ".cloud-box .cb-mail{font-size:11.5px;opacity:.6;word-break:break-all}"+
  ".cloud-box .cb-actions{display:flex;gap:7px;margin-top:10px;flex-wrap:wrap}"+
  ".cloud-box input{margin-top:7px}"+
  ".cloud-dot{width:9px;height:9px;border-radius:50%;flex:0 0 auto;background:#666;"+
    "box-shadow:0 0 0 2px rgba(255,255,255,.05)}"+
  ".cloud-dot.on{background:#4caf7d;animation:cbp 2.4s infinite}"+
  ".cloud-dot.sync{background:#e0a83c;animation:cbp .9s infinite}"+
  ".cloud-dot.off{background:#d9534f}"+
  "@keyframes cbp{0%,100%{opacity:1}50%{opacity:.35}}"+
  ".cloud-chip{display:flex;align-items:center;gap:7px;background:#141c22;border:1px solid #2a4250;"+
    "border-radius:20px;padding:7px 12px;font-size:11px;font-weight:700;color:#9fd8f5;"+
    "cursor:pointer;margin-bottom:9px}"+
  ".cloud-chip:hover{border-color:#3d6b85}"+
  ".cb-hint{font-size:11px;opacity:.5;margin-top:7px;line-height:1.5}";
  document.head.appendChild(s);
}
function injectUI(){
  /* card no topo do Estoque */
  var box=document.createElement("div");
  box.className="cloud-box";box.id="cloudBox";
  var host=el("v-estoque");
  host.insertBefore(box,host.querySelector(".counter"));

  /* chip no rodapé do drawer */
  var chip=document.createElement("div");
  chip.className="cloud-chip";chip.id="cloudChip";
  chip.innerHTML='<span class="cloud-dot off" id="cloudDot2"></span><span id="cloudChipTx">Nuvem: offline</span>';
  chip.onclick=function(){drawer(false);go("estoque");
    setTimeout(function(){el("cloudBox").scrollIntoView({behavior:"smooth",block:"center"})},260)};
  var foot=document.querySelector(".drawer-foot");
  foot.insertBefore(chip,foot.firstChild);
}
function paintUI(state,msg){
  var box=el("cloudBox"); if(!box)return;
  var dot=state==="on"?"on":state==="sync"?"sync":"off";
  var chipTx={on:"Nuvem: sincronizado",sync:"Nuvem: sincronizando…",off:"Nuvem: offline"}[state];
  el("cloudDot2").className="cloud-dot "+dot;
  el("cloudChipTx").textContent=chipTx;

  if(user){
    box.innerHTML=
      '<div class="cb-top"><span class="cloud-dot '+dot+'"></span><span class="cb-ic">☁️</span>'+
      '<b>'+(state==="sync"?"Sincronizando…":"Dados na nuvem")+'</b></div>'+
      '<div class="cb-mail">'+user.email+'</div>'+
      (msg?'<div class="cb-hint">'+msg+'</div>':'')+
      '<div class="cb-actions">'+
        '<button class="btn btn-sm green" id="cbPush">⬆️ Enviar agora</button>'+
        '<button class="btn btn-sm blue" id="cbPull">⬇️ Baixar da nuvem</button>'+
        '<button class="btn btn-sm" id="cbOut">🚪 Sair</button>'+
      '</div>';
    el("cbPush").onclick=function(){push(true)};
    el("cbPull").onclick=function(){pull(true)};
    el("cbOut").onclick=logout;
  }else{
    box.innerHTML=
      '<div class="cb-top"><span class="cloud-dot off"></span><span class="cb-ic">☁️</span>'+
      '<b>Sincronizar entre celular e PC</b></div>'+
      '<div class="cb-hint">Entre com seu e-mail para salvar o estoque na nuvem. '+
      'Sem login, os dados ficam só neste navegador.</div>'+
      '<input type="email" id="cbMail" placeholder="seu@email.com" autocomplete="email">'+
      '<input type="password" id="cbPass" placeholder="senha (mín. 6 caracteres)" autocomplete="current-password">'+
      '<div class="cb-actions">'+
        '<button class="btn btn-sm green" id="cbIn">🔑 Entrar</button>'+
        '<button class="btn btn-sm" id="cbUp">✨ Criar conta</button>'+
      '</div>'+
      (msg?'<div class="cb-hint" style="color:#e8c88a">'+msg+'</div>':'');
    el("cbIn").onclick=function(){auth("in")};
    el("cbUp").onclick=function(){auth("up")};
    el("cbPass").onkeydown=function(e){if(e.key==="Enter")auth("in")};
  }
}

/* ---------- AUTH ---------- */
function auth(mode){
  var mail=(el("cbMail").value||"").trim(), pass=el("cbPass").value||"";
  if(!mail||pass.length<6){say("Informe e-mail e senha (mín. 6)","warn2");return}
  paintUI("sync","Conectando…");
  var fn=mode==="up"?sb.auth.signUp({email:mail,password:pass})
                    :sb.auth.signInWithPassword({email:mail,password:pass});
  fn.then(function(r){
    if(r.error){paintUI("off","❌ "+traduz(r.error.message));say("❌ "+traduz(r.error.message),"err");return}
    if(!r.data.session){paintUI("off","📧 Confirme o e-mail e entre novamente.");return}
    user=r.data.user;
    say(mode==="up"?"✨ Conta criada!":"🔑 Conectado!");
    firstSync();
  });
}
function traduz(m){
  m=String(m||"");
  if(/Invalid login/i.test(m))return "E-mail ou senha incorretos";
  if(/already registered/i.test(m))return "E-mail já cadastrado — use Entrar";
  if(/at least 6/i.test(m))return "A senha precisa de 6+ caracteres";
  if(/rate limit|too many/i.test(m))return "Muitas tentativas — aguarde um pouco";
  return m;
}
function logout(){
  if(!confirm("Sair da conta?\n\nOs dados continuam salvos neste navegador e na nuvem."))return;
  sb.auth.signOut().then(function(){user=null;paintUI("off");say("🚪 Desconectado")});
}

/* ---------- SYNC ---------- */
function firstSync(){
  paintUI("sync","Comparando dados…");
  sb.from(TABLE).select("dados,updated_at").eq("user_id",user.id).maybeSingle()
   .then(function(r){
     if(r.error){paintUI("on","⚠️ "+r.error.message);return}
     var rem=r.data&&r.data.dados, remTS=rem&&rem.ts?rem.ts:0, locTS=localTS();
     var locVazio=!Object.keys(stock).length&&!vendas.length&&!orcamentos.length&&!demanda.length;
     var remVazio=!rem||(!Object.keys(rem.stock||{}).length&&!(rem.vendas||[]).length&&
                         !(rem.orcamentos||[]).length&&!(rem.demanda||[]).length);

     if(remVazio&&!locVazio){push(true);return}
     if(!remVazio&&locVazio){applyRemote(rem);paintUI("on","⬇️ Dados baixados da nuvem");
                             say("⬇️ Dados restaurados da nuvem");return}
     if(remVazio&&locVazio){push(false);paintUI("on","Pronto — comece a cadastrar");return}

     if(remTS>locTS+1500){
       var qtdR=Object.keys(rem.stock||{}).length, qtdL=Object.keys(stock).length;
       if(confirm("☁️ A nuvem tem dados MAIS RECENTES.\n\n"+
          "Nuvem: "+qtdR+" seleções · "+new Date(remTS).toLocaleString("pt-BR")+"\n"+
          "Aqui:  "+qtdL+" seleções · "+(locTS?new Date(locTS).toLocaleString("pt-BR"):"sem data")+"\n\n"+
          "OK = usar os dados da NUVEM\nCancelar = manter os DESTE aparelho e enviar")){
         applyRemote(rem);paintUI("on","⬇️ Usando dados da nuvem");
       }else push(true);
     }else push(locTS>remTS);
   });
}
function push(avisar){
  if(!user||syncing)return;
  syncing=true;paintUI("sync");
  if(!localTS())markLocal();
  var payload=snapshot();
  sb.from(TABLE).upsert({user_id:user.id,dados:payload,updated_at:new Date().toISOString()},
                        {onConflict:"user_id"})
   .then(function(r){
     syncing=false;
     if(r.error){setPending(true);paintUI("on","⚠️ Falha ao enviar — tentará de novo");
                 if(avisar)say("⚠️ "+r.error.message,"err");return}
     setPending(false);
     paintUI("on","✔️ Salvo na nuvem às "+new Date().toLocaleTimeString("pt-BR"));
     if(avisar)say("☁️ Dados enviados para a nuvem");
   });
}
function pull(avisar){
  if(!user)return;
  paintUI("sync");
  sb.from(TABLE).select("dados").eq("user_id",user.id).maybeSingle()
   .then(function(r){
     if(r.error||!r.data||!r.data.dados){paintUI("on","Nada salvo na nuvem ainda");
       if(avisar)say("Nada salvo na nuvem ainda","warn2");return}
     if(avisar&&!confirm("⬇️ Substituir os dados DESTE aparelho pelos da nuvem?\n\n"+
        "O que estiver só aqui e não foi enviado será perdido."))
       {paintUI("on");return}
     applyRemote(r.data.dados);
     paintUI("on","⬇️ Baixado às "+new Date().toLocaleTimeString("pt-BR"));
     if(avisar)say("⬇️ Dados da nuvem aplicados");
   });
}
function schedulePush(){
  markLocal();setPending(true);
  if(!user)return;
  clearTimeout(pushTimer);
  pushTimer=setTimeout(function(){push(false)},2200);
}

/* ---------- INTERCEPTA OS SAVES ---------- */
function hook(){
  ["saveStock","saveOrc","saveSales","saveDem","saveIgnore"].forEach(function(fn){
    var orig=window[fn];
    if(typeof orig!=="function")return;
    window[fn]=function(){var r=orig.apply(this,arguments);schedulePush();return r};
  });
  var origImport=window.importJSON;
  if(typeof origImport==="function"){
    window.importJSON=function(t){var r=origImport.call(this,t);schedulePush();return r};
  }
}

/* ---------- BOOT ---------- */
function boot(){
  injectStyles();injectUI();hook();
  if(typeof supabase==="undefined"){
    paintUI("off","❌ Biblioteca do Supabase não carregou (sem internet?)");return;
  }
  sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY,
    {auth:{persistSession:true,autoRefreshToken:true}});
  ready=true;
  paintUI("off");
  sb.auth.getSession().then(function(r){
    if(r.data.session){user=r.data.session.user;firstSync()}
  });
  sb.auth.onAuthStateChange(function(ev,s){
    if(ev==="SIGNED_OUT"){user=null;paintUI("off")}
    if(ev==="TOKEN_REFRESHED"&&s)user=s.user;
  });
  /* reenvia o que ficou pendente ao voltar a conexão / abrir o app */
  window.addEventListener("online",function(){if(user&&pending())push(false)});
  document.addEventListener("visibilitychange",function(){
    if(!document.hidden&&user&&pending())push(false);
  });
  window.addEventListener("beforeunload",function(){
    if(user&&pending()&&navigator.sendBeacon){
      try{
        navigator.sendBeacon(SUPABASE_URL+"/rest/v1/"+TABLE+"?on_conflict=user_id",
          new Blob([JSON.stringify({user_id:user.id,dados:snapshot()})],{type:"application/json"}));
      }catch(e){}
    }
  });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
else boot();
})();
