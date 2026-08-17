/* ================= TESTES ================= */
function runTests(){
  var res=[],grupo="";
  function G(n){grupo=n}
  function ok(nome,cond,msg){res.push({g:grupo,nome:nome,pass:!!cond,msg:msg||""})}

  G("Dados");
  ok("48 seleções + FWC = 49 blocos",teams.length===49,"encontrados: "+teams.length);
  ok("HIST não existe mais",!T.HIST);
  ok("Todos os grupos A–L com 4 seleções",
    Object.keys(GROUP_TITLE).every(function(g){
      return teams.filter(function(t){return t.group===g}).length===4}));
  ok("FWC vai de 00 a 19",firstNum("FWC")===0&&lastNum("FWC")===19,
    "de "+pad(firstNum("FWC"))+" a "+pad(lastNum("FWC")));
  ok("FWC 20 é inválido",!validNum("FWC",20));
  ok("BRA vai de 01 a 20",firstNum("BRA")===1&&lastNum("BRA")===20);
  ok("BRA 0 e 21 inválidos",!validNum("BRA",0)&&!validNum("BRA",21));
  ok("Códigos únicos",Object.keys(T).length===teams.length);
  ok("980 cromos no total",
    teams.reduce(function(s,t){return s+t.qty},0)===980,
    "soma: "+teams.reduce(function(s,t){return s+t.qty},0));

  G("Brilhantes");
  ok("BRA 01 é brilhante",isShiny("BRA",1));
  ok("BRA 02 não é brilhante",!isShiny("BRA",2));
  ok("Todas do FWC são brilhantes",numsOf(T.FWC).every(function(n){return isShiny("FWC",n)}));
  ok("48 brilhantes de seleção + 20 FWC = 68",
    teams.filter(function(t){return !t.allShiny}).length+T.FWC.qty===68);

  G("Craques (nível seleção)");
  ok("POR tem Cristiano Ronaldo",(teamAceNames("POR")[0]||"").indexOf("Ronaldo")>-1);
  ok("ARG tem Messi",(teamAceNames("ARG")[0]||"").indexOf("Messi")>-1);
  ok("Nenhum craque por número",!isAce("POR",15)&&!isAce("ARG",17));
  ok("Craque não tira o brilho da 01",isShiny("BRA",1));
  ok("Todos os códigos de craque existem",
    Object.keys(ACES_BY_TEAM).every(function(c){return !!T[c]}));
  ok("48 seleções com craque mapeado",Object.keys(ACES_BY_TEAM).length===48,
    "mapeadas: "+Object.keys(ACES_BY_TEAM).length);
  ok("teamHasAce funciona",teamHasAce("BRA")&&!teamHasAce("FWC"));

  G("Jogadores por número");
  ok("BRA 14 é Vinícius Júnior",playerAt("BRA",14)==="Vinícius Júnior",playerAt("BRA",14));
  ok("ARG 17 é Lionel Messi",playerAt("ARG",17)==="Lionel Messi",playerAt("ARG",17));
  ok("POR 15 é Cristiano Ronaldo",playerAt("POR",15)==="Cristiano Ronaldo",playerAt("POR",15));
  ok("Número 1 (escudo) não tem jogador",playerAt("BRA",1)==="");
  ok("Número 13 (foto do time) não tem jogador",playerAt("BRA",13)==="");
  ok("Código inexistente retorna vazio",playerAt("ZZZ",5)==="");
  ok("Todas as 48 seleções têm jogadores mapeados",
    teams.filter(function(t){return t.group}).every(function(t){
      return numsOf(t).some(function(n){return !!playerAt(t.code,n)});
    }));

  G("Contagem");
  var r=contar({BRA:[1,2,3],POR:[15]});
  ok("Total = 4",r.total===4,"total: "+r.total);
  ok("1 brilhante (BRA 01)",r.brilhantes===1);
  ok("3 normais",r.normais===3,"normais: "+r.normais);
  ok("Faixas 1,2,3,7 → 01-03,07",ranges([1,2,3,7])==="01-03,07",ranges([1,2,3,7]));

  G("Parser de listas");
  var p1=parseList("BIH 🇧🇦: 5, 13");
  ok("Formato agrupado com emoji",p1.found.BIH&&p1.found.BIH.length===2,JSON.stringify(p1.found));
  var p2=parseList("POR10, POR-14, bra19");
  ok("Formato inline",p2.found.POR&&p2.found.POR.length===2&&p2.found.BRA&&p2.found.BRA[0]===19);
  var p3=parseList("FWC 00, POR 15, ARG 17");
  ok("Mistos na mesma linha",p3.found.FWC&&p3.found.FWC[0]===0&&p3.found.POR&&p3.found.ARG);
  var p4=parseList("brasil 1 2 3");
  ok("Nome completo do país",p4.found.BRA&&p4.found.BRA.length===3);
  var p5=parseList("BRA 99, XXX 5, https://site.com/12");
  ok("Ignora inválidos e URLs",!p5.found.BRA&&!p5.found.XXX);
  var p6=parseList("HIST 5");
  ok("HIST não é mais aceito",!p6.found.HIST);

  G("Mapas");
  var om=ordenaMapa({POR:[15,3],BRA:[5,1]});
  ok("Ordena por ordem do álbum",Object.keys(om)[0]==="BRA");
  ok("Ordena os números",om.BRA[0]===1&&om.POR[0]===3);
  ok("mapTotal soma certo",mapTotal({BRA:[1,2],POR:[15]})===3);
  var cl=clonaMapa({BRA:[1,2]});cl.BRA.push(9);
  ok("clonaMapa não afeta original",cl.BRA.length===3);
  ok("resolveCode('méxico') = MEX",resolveCode("méxico")==="MEX");
  ok("resolveCode inválido = null",resolveCode("zzz")===null);

  G("Listas de texto");
  var bl=buildList({BRA:[1],POR:[15]},"TESTE");
  ok("Marca ✨ no texto",bl.indexOf("✨")>-1);
  ok("Assina Catanos Figurinhas",bl.indexOf("Catanos")>-1);
  ok("Mapa vazio avisa",buildList({},"X").indexOf("Nenhuma")>-1);
  ok("Lista traz 🇧🇷 do Brasil",bl.indexOf("🇧🇷")>-1);
  ok("Lista traz 🇵🇹 de Portugal",bl.indexOf("🇵🇹")>-1);
  ok("Lista não usa 🏳️ para país",bl.indexOf("🏳️")===-1);

  G("Interface");
  ok("Todas as views do menu existem",
    $$(".dn-item").every(function(b){return !!document.getElementById("v-"+b.dataset.view)}));
  ok("Todas as abas inferiores existem",
    $$(".tab").every(function(b){return !!document.getElementById("v-"+b.dataset.view)}));
  ok("classeBtn marca brilhante",classeBtn("BRA",1,"").indexOf("shiny")>-1);
  ok("classeBtn não marca ace",classeBtn("POR",15,"").indexOf("ace")===-1);
  ok("Toggle de nomes existe no DOM",!!document.getElementById("swPlayers"));

  G("Faltantes");
  ok("faltantesMap nunca inclui algo que está no estoque",
    Object.keys(faltantesMap()).every(function(c){
      return faltantesMap()[c].every(function(n){return !temEstoque(c,n)});
    }));
  ok("faltantesMap + stockMap cobrem os 980 cromos",
    mapTotal(faltantesMap())+mapTotal(stockMap())===980,
    "faltam:"+mapTotal(faltantesMap())+" tenho:"+mapTotal(stockMap()));
  ok("contar() soma certo na lista de faltantes",
    contar(faltantesMap()).total===mapTotal(faltantesMap()));

  G("Scanner");
  ok("Catálogo com 980 códigos",window.SCAN_CATALOG_SIZE===980,"tamanho: "+window.SCAN_CATALOG_SIZE);
  if(window.scanMatch){
    ok("Reconhece 'BRA 5'",(scanMatch("BRA 5")[0]||{}).key==="BRA05");
    ok("Reconhece 'FWC00'",(scanMatch("FWC00")[0]||{}).key==="FWC00");
    ok("Tolera OCR 'BRA O5' → BRA05",(scanMatch("BRA O5")[0]||{}).key==="BRA05");
    ok("Tolera '8RA 5' → BRA05",(scanMatch("8RA 5")[0]||{}).key==="BRA05");
    ok("Rejeita lixo",scanMatch("###").length===0);
    ok("Nunca retorna nº fora da faixa",
      scanMatch("BRA 99").every(function(c){return validNum(c.code,c.num)}));
    ok("Nunca retorna HIST",scanMatch("HIS 5").every(function(c){return c.code!=="HIST"}));
  }

  G("Bandeiras");
  ok("URL de bandeira gerada para MEX",(flagURL("MEX")||"").indexOf("/mx.png")>-1,flagURL("MEX"));
  ok("Escócia usa gb-sct",(flagURL("SCO")||"").indexOf("gb-sct")>-1);
  ok("Inglaterra usa gb-eng",(flagURL("ENG")||"").indexOf("gb-eng")>-1);
  ok("FWC sem iso usa ícone",flagURL("FWC")===null&&flagHTML("FWC").indexOf("fico")>-1);
  ok("Todas as seleções de grupo têm iso",
    teams.filter(function(t){return t.group}).every(function(t){return !!t.iso}));
  ok("Emoji de bandeira para BRA",flagEmoji("BRA")==="🇧🇷",flagEmoji("BRA"));
  ok("Escócia usa tag sequence",flagEmoji("SCO").length>4,flagEmoji("SCO"));
  ok("FWC mantém 🏆",flagEmoji("FWC")==="🏆");
  ok("Todas as seleções têm emoji",
    teams.every(function(t){return flagEmoji(t.code)!=="🏳️"}));

  var pass=res.filter(function(x){return x.pass}).length;
  $("#testSummary").innerHTML='<div class="test-sum '+(pass===res.length?"ok":"bad")+'">'+
    (pass===res.length?"✅ ":"⚠️ ")+pass+" de "+res.length+" testes passaram</div>";
  var box=$("#testResults");box.innerHTML="";
  var lastG="";
  res.forEach(function(t){
    if(t.g!==lastG){
      lastG=t.g;
      var h=document.createElement("div");h.className="test-grp";h.textContent=t.g;box.appendChild(h);
    }
    var d=document.createElement("div");
    d.className="test-row "+(t.pass?"pass":"fail");
    d.innerHTML='<span class="st">'+(t.pass?"✔":"✘")+'</span><span>'+t.nome+
      (t.msg?'<span class="msg">'+t.msg+'</span>':"")+'</span>';
    box.appendChild(d);
  });
  toast(pass===res.length?"✅ Todos os "+res.length+" testes passaram":"⚠️ "+(res.length-pass)+" falha(s)",
    pass===res.length?"":"err");
}
