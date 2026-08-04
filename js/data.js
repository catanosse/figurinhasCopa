/* ======================================================
   DADOS — ordem oficial do álbum: FWC (00–19) → A..L → HIST
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
 {code:"PAN",name:"Panamá",iso:"pa",qty:20,group:"L"},

 {code:"HIST",name:"Seleções Históricas",flag:"⭐",iso:null,qty:20,group:null,allShiny:true}
];

var T={},ORDER={};
teams.forEach(function(t,i){T[t.code]=t;ORDER[t.code]=i});

var GROUP_TITLE={A:"Grupo A",B:"Grupo B",C:"Grupo C",D:"Grupo D",E:"Grupo E",F:"Grupo F",
 G:"Grupo G",H:"Grupo H",I:"Grupo I",J:"Grupo J",K:"Grupo K",L:"Grupo L"};

/* ---------- BANDEIRAS (imagem, com fallback) ---------- */
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

/* ---------- CRAQUES ---------- */
var ACES={
 "POR-15":"Cristiano Ronaldo","NOR-15":"Erling Haaland","ESP-15":"Lamine Yamal",
 "FRA-20":"Kylian Mbappé","NED-17":"Memphis Depay","ARG-17":"Lionel Messi",
 "BRA-15":"Vinícius Júnior","ENG-15":"Jude Bellingham","BEL-15":"Kevin De Bruyne",
 "EGY-15":"Mohamed Salah","KOR-15":"Son Heung-min","URU-15":"Federico Valverde",
 "COL-15":"Luis Díaz","MAR-15":"Achraf Hakimi","CRO-15":"Luka Modrić",
 "GER-15":"Jamal Musiala","JPN-15":"Takefusa Kubo","SEN-15":"Sadio Mané",
 "MEX-15":"Santiago Giménez","USA-15":"Christian Pulisic","SWE-15":"Viktor Gyökeres",
 "CIV-15":"Simon Adingra","ECU-15":"Moisés Caicedo","CAN-15":"Alphonso Davies",
 "AUS-15":"Jackson Irvine","SUI-15":"Granit Xhaka","TUR-15":"Arda Güler",
 "ALG-15":"Riyad Mahrez","AUT-15":"Marcel Sabitzer","GHA-15":"Mohammed Kudus",
 "PAN-15":"Adalberto Carrasquilla","IRN-15":"Mehdi Taremi","TUN-15":"Hannibal Mejbri",
 "PAR-15":"Miguel Almirón","CZE-15":"Patrik Schick","RSA-15":"Percy Tau",
 "QAT-15":"Akram Afif","KSA-15":"Salem Al-Dawsari","NZL-15":"Chris Wood",
 "SCO-15":"Scott McTominay","CPV-15":"Ryan Mendes","UZB-15":"Eldor Shomurodov",
 "JOR-15":"Musa Al-Taamari","IRQ-15":"Aymen Hussein","COD-15":"Cédric Bakambu",
 "HAI-15":"Frantzdy Pierrot","CUW-15":"Juninho Bacuna","BIH-15":"Edin Džeko"
};
function pad(n){return String(n).padStart(2,"0")}
function aceKey(c,n){return c+"-"+pad(n)}
function isAce(c,n){return !!ACES[aceKey(c,n)]}
function aceName(c,n){return ACES[aceKey(c,n)]||""}
function aceShort(c,n){var s=aceName(c,n);return s?s.split(" ").pop():""}
function aceLabel(c,n){return c+" "+pad(n)+" — "+aceName(c,n)}
var ACES_BY_TEAM={};
Object.keys(ACES).forEach(function(k){
  var p=k.split("-"),c=p[0],n=parseInt(p[1],10);
  if(!ACES_BY_TEAM[c])ACES_BY_TEAM[c]=[];
  ACES_BY_TEAM[c].push({num:n,name:ACES[k]});
});
Object.keys(ACES_BY_TEAM).forEach(function(c){
  ACES_BY_TEAM[c].sort(function(a,b){return a.num-b.num});
});

/* ---------- NUMERAÇÃO ---------- */
function firstOf(t){return t.firstZero?0:1}
function numsOf(t){
  var a=[],ini=firstOf(t);
  for(var i=ini;i<ini+t.qty;i++)a.push(i);   /* FWC: 0..19 · outros: 1..20 */
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
  if(isAce(code,num))return false;
  if(t.allShiny)return true;
  return num===firstOf(t);
}

/* ---------- CONTAGEM / TEXTO ---------- */
function contar(map){
  var norm=0,shi=0,ace=0,lista=[];
  Object.keys(map||{}).sort(function(a,b){return ORDER[a]-ORDER[b]}).forEach(function(c){
    (map[c]||[]).slice().sort(function(a,b){return a-b}).forEach(function(n){
      if(isAce(c,n)){ace++;lista.push(aceLabel(c,n))}
      else if(isShiny(c,n))shi++;
      else norm++;
    });
  });
  return {normais:norm,brilhantes:shi,craques:ace,aces:lista,total:norm+shi+ace};
}
function detalhe(r){
  var d="• Normais: "+r.normais+"\n• Brilhantes: "+r.brilhantes+"\n• Craques: "+r.craques+"\n";
  if(r.craques)d+=r.aces.map(function(a){return "     ⭐ "+a}).join("\n")+"\n";
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
