/* ======================================================
   DADOS — ordem do álbum: FWC (00–19) → grupos A..L
   980 cromos = 48 seleções × 20 + 20 especiais (FWC)
   ====================================================== */
var teams=[
 {code:"FWC",name:"FIFA World Cup 26",flag:"🏆",iso:null,qty:20,group:null,allShiny:true,firstZero:true},

 {code:"MEX",name:"México",iso:"mx",qty:20,group:"A"},
 {code:"RSA",name:"África do Sul",iso:"za",qty:20,group:"A"},
 {code:"KOR",name:"Coreia do Sul",iso:"kr",qty:20,group:"A"},
 {code:"CZE",name:"República Tcheca",iso:"cz",qty:20,group:"A"},

 {code:"CAN",name:"Canadá",iso:"ca",qty:20,group:"B"},
 {code:"BIH",name:"Bósnia e Herzegovina",iso:"ba",qty:20,group:"B"},
 {code:"QAT",name:"Catar",iso:"qa",qty:20,group:"B"},
 {code:"SUI",name:"Suíça",iso:"ch",qty:20,group:"B"},

 {code:"BRA",name:"Brasil",iso:"br",qty:20,group:"C"},
 {code:"MAR",name:"Marrocos",iso:"ma",qty:20,group:"C"},
 {code:"HAI",name:"Haiti",iso:"ht",qty:20,group:"C"},
 {code:"SCO",name:"Escócia",iso:"gb-sct",qty:20,group:"C"},

 {code:"USA",name:"Estados Unidos",iso:"us",qty:20,group:"D"},
 {code:"PAR",name:"Paraguai",iso:"py",qty:20,group:"D"},
 {code:"AUS",name:"Austrália",iso:"au",qty:20,group:"D"},
 {code:"TUR",name:"Turquia",iso:"tr",qty:20,group:"D"},

 {code:"GER",name:"Alemanha",iso:"de",qty:20,group:"E"},
 {code:"CUW",name:"Curaçao",iso:"cw",qty:20,group:"E"},
 {code:"CIV",name:"Costa do Marfim",iso:"ci",qty:20,group:"E"},
 {code:"ECU",name:"Equador",iso:"ec",qty:20,group:"E"},

 {code:"NED",name:"Holanda",iso:"nl",qty:20,group:"F"},
 {code:"JPN",name:"Japão",iso:"jp",qty:20,group:"F"},
 {code:"SWE",name:"Suécia",iso:"se",qty:20,group:"F"},
 {code:"TUN",name:"Tunísia",iso:"tn",qty:20,group:"F"},

 {code:"BEL",name:"Bélgica",iso:"be",qty:20,group:"G"},
 {code:"EGY",name:"Egito",iso:"eg",qty:20,group:"G"},
 {code:"IRN",name:"Irã",iso:"ir",qty:20,group:"G"},
 {code:"NZL",name:"Nova Zelândia",iso:"nz",qty:20,group:"G"},

 {code:"ESP",name:"Espanha",iso:"es",qty:20,group:"H"},
 {code:"CPV",name:"Cabo Verde",iso:"cv",qty:20,group:"H"},
 {code:"KSA",name:"Arábia Saudita",iso:"sa",qty:20,group:"H"},
 {code:"URU",name:"Uruguai",iso:"uy",qty:20,group:"H"},

 {code:"FRA",name:"França",iso:"fr",qty:20,group:"I"},
 {code:"SEN",name:"Senegal",iso:"sn",qty:20,group:"I"},
 {code:"IRQ",name:"Iraque",iso:"iq",qty:20,group:"I"},
 {code:"NOR",name:"Noruega",iso:"no",qty:20,group:"I"},

 {code:"ARG",name:"Argentina",iso:"ar",qty:20,group:"J"},
 {code:"ALG",name:"Argélia",iso:"dz",qty:20,group:"J"},
 {code:"AUT",name:"Áustria",iso:"at",qty:20,group:"J"},
 {code:"JOR",name:"Jordânia",iso:"jo",qty:20,group:"J"},

 {code:"POR",name:"Portugal",iso:"pt",qty:20,group:"K"},
 {code:"COD",name:"RD Congo",iso:"cd",qty:20,group:"K"},
 {code:"UZB",name:"Uzbequistão",iso:"uz",qty:20,group:"K"},
 {code:"COL",name:"Colômbia",iso:"co",qty:20,group:"K"},

 {code:"ENG",name:"Inglaterra",iso:"gb-eng",qty:20,group:"L"},
 {code:"CRO",name:"Croácia",iso:"hr",qty:20,group:"L"},
 {code:"GHA",name:"Gana",iso:"gh",qty:20,group:"L"},
 {code:"PAN",name:"Panamá",iso:"pa",qty:20,group:"L"}
];

var T={},ORDER={};
teams.forEach(function(t,i){T[t.code]=t;ORDER[t.code]=i});

var GROUP_TITLE={A:"Grupo A",B:"Grupo B",C:"Grupo C",D:"Grupo D",E:"Grupo E",F:"Grupo F",
 G:"Grupo G",H:"Grupo H",I:"Grupo I",J:"Grupo J",K:"Grupo K",L:"Grupo L"};

/* ---------- BANDEIRAS (imagem — para a UI) ---------- */
function flagURL(code,w){
  var t=T[code]; if(!t||!t.iso)return null;
  w=w||40; return "https://flagcdn.com/"+w+"x"+Math.round(w*0.75)+"/"+t.iso+".png";
}
function flagHTML(code){
  var t=T[code]; if(!t)return "";
  var u=flagURL(code,40);
  if(!u)return '<span class="fico">'+(t.flag||"🏳️")+'</span>';
  return '<img class="fimg" src="'+u+'" alt="'+code+'" loading="lazy" '+
    "onerror=\"this.outerHTML='<span class=&quot;fico&quot;>🏳️</span>'\">";
}

/* ---------- BANDEIRAS (emoji — para listas de texto/WhatsApp) ---------- */
function isoToEmoji(iso){
  if(!iso)return null;
  if(iso.indexOf("-")>-1){                     /* gb-eng, gb-sct */
    var tag=iso.replace(/-/g,"").toLowerCase(),s="\uD83C\uDFF4";
    for(var i=0;i<tag.length;i++)s+=String.fromCodePoint(0xE0000+tag.charCodeAt(i));
    return s+"\uDB40\uDC7F";
  }
  if(!/^[a-z]{2}$/i.test(iso))return null;
  var u=iso.toUpperCase();
  return String.fromCodePoint(0x1F1E6+u.charCodeAt(0)-65,0x1F1E6+u.charCodeAt(1)-65);
}
function flagEmoji(code){
  var t=T[code]; if(!t)return "🏳️";
  return isoToEmoji(t.iso)||t.flag||"🏳️";
}

/* ---------- CRAQUES (nível seleção — SEM número) ----------
   A Panini não divulga checklist oficial com numeração. A ordem
   varia por seleção: emblema=1, foto do time flutua (ex: ALG-13),
   jogadores em ordem tática. Guardamos só QUEM é o craque.       */
var ACES_BY_TEAM={
 POR:[{name:"Cristiano Ronaldo"}], NOR:[{name:"Erling Haaland"}],
 ESP:[{name:"Lamine Yamal"}],      FRA:[{name:"Kylian Mbappé"}],
 NED:[{name:"Memphis Depay"}],     ARG:[{name:"Lionel Messi"}],
 BRA:[{name:"Vinícius Júnior"}],   ENG:[{name:"Jude Bellingham"}],
 BEL:[{name:"Kevin De Bruyne"}],   EGY:[{name:"Mohamed Salah"}],
 KOR:[{name:"Son Heung-min"}],     URU:[{name:"Federico Valverde"}],
 COL:[{name:"Luis Díaz"}],         MAR:[{name:"Achraf Hakimi"}],
 CRO:[{name:"Luka Modrić"}],       GER:[{name:"Jamal Musiala"}],
 JPN:[{name:"Takefusa Kubo"}],     SEN:[{name:"Sadio Mané"}],
 MEX:[{name:"Santiago Giménez"}],  USA:[{name:"Christian Pulisic"}],
 SWE:[{name:"Viktor Gyökeres"}],   CIV:[{name:"Simon Adingra"}],
 ECU:[{name:"Moisés Caicedo"}],    CAN:[{name:"Alphonso Davies"}],
 AUS:[{name:"Jackson Irvine"}],    SUI:[{name:"Granit Xhaka"}],
 TUR:[{name:"Arda Güler"}],        ALG:[{name:"Riyad Mahrez"}],
 AUT:[{name:"Marcel Sabitzer"}],   GHA:[{name:"Mohammed Kudus"}],
 PAN:[{name:"Adalberto Carrasquilla"}], IRN:[{name:"Mehdi Taremi"}],
 TUN:[{name:"Hannibal Mejbri"}],   PAR:[{name:"Miguel Almirón"}],
 CZE:[{name:"Patrik Schick"}],     RSA:[{name:"Percy Tau"}],
 QAT:[{name:"Akram Afif"}],        KSA:[{name:"Salem Al-Dawsari"}],
 NZL:[{name:"Chris Wood"}],        SCO:[{name:"Scott McTominay"}],
 CPV:[{name:"Ryan Mendes"}],       UZB:[{name:"Eldor Shomurodov"}],
 JOR:[{name:"Musa Al-Taamari"}],   IRQ:[{name:"Aymen Hussein"}],
 COD:[{name:"Cédric Bakambu"}],    HAI:[{name:"Frantzdy Pierrot"}],
 CUW:[{name:"Juninho Bacuna"}],    BIH:[{name:"Edin Džeko"}]
};

function pad(n){return String(n).padStart(2,"0")}

/* ---- API antiga preservada: craque por número é desconhecido ---- */
var ACES={};
function aceKey(c,n){return c+"-"+pad(n)}
function isAce(){return false}
function aceName(){return ""}
function aceShort(){return ""}
function aceLabel(){return ""}

/* ---- API nova: nível seleção ---- */
function teamHasAce(code){return !!ACES_BY_TEAM[code]}
function teamAceNames(code){
  return (ACES_BY_TEAM[code]||[]).map(function(a){return a.name});
}
function teamAceLabel(code){
  var n=teamAceNames(code);
  return n.length?n.join(" • "):"";
}

/* ---------- NUMERAÇÃO ---------- */
function firstOf(t){return t.firstZero?0:1}
function numsOf(t){
  var a=[],ini=firstOf(t);
  for(var i=ini;i<ini+t.qty;i++)a.push(i);
  return a;
}
function firstNum(code){return T[code]?firstOf(T[code]):1}
function lastNum(code){var t=T[code];return t?firstOf(t)+t.qty-1:0}
function countNums(code){return T[code]?T[code].qty:0}
function validNum(code,num){
  var t=T[code]; if(!t)return false;
  num=Number(num);
  if(!Number.isInteger(num))return false;
  var ini=firstOf(t);
  return num>=ini&&num<ini+t.qty;
}
function isShiny(code,num){
  var t=T[code]; if(!t)return false;
  if(t.allShiny)return true;
  return num===firstOf(t);
}

/* ---------- CONTAGEM / TEXTO ---------- */
function contar(map){
  var norm=0,shi=0,ace=0,lista=[];
  Object.keys(map||{}).sort(function(a,b){return ORDER[a]-ORDER[b]}).forEach(function(c){
    (map[c]||[]).slice().sort(function(a,b){return a-b}).forEach(function(n){
      if(isShiny(c,n))shi++;
      else norm++;
    });
  });
  return {normais:norm,brilhantes:shi,craques:ace,aces:lista,total:norm+shi+ace};
}
function detalhe(r){
  var d="• Normais: "+r.normais+"\n• Brilhantes: "+r.brilhantes+"\n";
  return d+"• TOTAL: "+r.total;
}
function ranges(arr){
  arr=(arr||[]).slice().sort(function(a,b){return a-b});
  var o=[],i=0;
  while(i<arr.length){
    var s=arr[i],e=s;
    while(i+1<arr.length&&arr[i+1]===arr[i]+1){i++;e=arr[i]}
    o.push(s===e?pad(s):pad(s)+"-"+pad(e));i++;
  }
  return o.join(",");
}
function noAccent(s){
  return String(s).normalize?String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,""):String(s);
}
function resolveCode(txt){
  if(!txt)return null;
  var s=noAccent(txt).toUpperCase().replace(/[^A-Z]/g,"");
  if(T[s])return s;
  var f=teams.find(function(t){return noAccent(t.name).toUpperCase().replace(/[^A-Z]/g,"")===s});
  return f?f.code:null;
}
