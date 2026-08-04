var teams=[
 {code:"FWC",name:"COPA 2026",flag:"🏆",qty:20,group:null,allShiny:true,firstZero:true},
 {code:"MEX",name:"MÉXICO",flag:"🇲🇽",qty:20,group:"A"},
 {code:"RSA",name:"ÁFRICA DO SUL",flag:"🇿🇦",qty:20,group:"A"},
 {code:"KOR",name:"COREIA DO SUL",flag:"🇰🇷",qty:20,group:"A"},
 {code:"SUI",name:"SUÍÇA",flag:"🇨🇭",qty:20,group:"A"},
 {code:"CAN",name:"CANADÁ",flag:"🇨🇦",qty:20,group:"B"},
 {code:"UKR",name:"UCRÂNIA",flag:"🇺🇦",qty:20,group:"B"},
 {code:"QAT",name:"CATAR",flag:"🇶🇦",qty:20,group:"B"},
 {code:"CRO",name:"CROÁCIA",flag:"🇭🇷",qty:20,group:"B"},
 {code:"USA",name:"ESTADOS UNIDOS",flag:"🇺🇸",qty:20,group:"D"},
 {code:"PAR",name:"PARAGUAI",flag:"🇵🇾",qty:20,group:"D"},
 {code:"AUS",name:"AUSTRÁLIA",flag:"🇦🇺",qty:20,group:"D"},
 {code:"SCO",name:"ESCÓCIA",flag:"🏴",qty:20,group:"D"},
 {code:"ARG",name:"ARGENTINA",flag:"🇦🇷",qty:20,group:"J"},
 {code:"BRA",name:"BRASIL",flag:"🇧🇷",qty:20,group:"L"},
 {code:"FRA",name:"FRANÇA",flag:"🇫🇷",qty:20,group:"I"},
 {code:"ESP",name:"ESPANHA",flag:"🇪🇸",qty:20,group:"H"},
 {code:"ENG",name:"INGLATERRA",flag:"🏴",qty:20,group:"K"},
 {code:"POR",name:"PORTUGAL",flag:"🇵🇹",qty:20,group:"F"},
 {code:"GER",name:"ALEMANHA",flag:"🇩🇪",qty:20,group:"E"},
 {code:"NED",name:"HOLANDA",flag:"🇳🇱",qty:20,group:"G"},
 {code:"BEL",name:"BÉLGICA",flag:"🇧🇪",qty:20,group:"C"},
 {code:"ITA",name:"ITÁLIA",flag:"🇮🇹",qty:20,group:"C"},
 {code:"URU",name:"URUGUAI",flag:"🇺🇾",qty:20,group:"E"},
 {code:"COL",name:"COLÔMBIA",flag:"🇨🇴",qty:20,group:"F"},
 {code:"ECU",name:"EQUADOR",flag:"🇪🇨",qty:20,group:"G"},
 {code:"JPN",name:"JAPÃO",flag:"🇯🇵",qty:20,group:"H"},
 {code:"MAR",name:"MARROCOS",flag:"🇲🇦",qty:20,group:"I"},
 {code:"SEN",name:"SENEGAL",flag:"🇸🇳",qty:20,group:"J"},
 {code:"NOR",name:"NORUEGA",flag:"🇳🇴",qty:20,group:"K"},
 {code:"HIST",name:"SELEÇÕES HISTÓRICAS",flag:"⭐",qty:20,group:null,allShiny:true}
];

var T={};teams.forEach(function(t){T[t.code]=t});

const ACES={
 "POR-15":"Cristiano Ronaldo","NOR-15":"Haaland","ESP-15":"Lamine Yamal",
 "FRA-20":"Mbappé","NED-17":"Memphis Depay","ARG-17":"Messi",
 "BRA-15":"Vinicius Jr","ENG-15":"Bellingham"
};

function pad(n){return String(n).padStart(2,"0")}
function isAce(c,n){return !!ACES[c+"-"+pad(n)]}
function aceName(c,n){return ACES[c+"-"+pad(n)]||""}
function firstNum(c){return T[c]&&T[c].firstZero?0:1}
function validNum(c,n){
  var t=T[c]; if(!t||!t.qty) return false;
  n=Number(n); return Number.isInteger(n)&&n>=firstNum(c)&&n<=t.qty;
}
function resolveCode(txt){
  if(!txt) return null;
  var s=txt.toUpperCase().replace(/[^A-ZÀ-Ú]/g,"");
  if(T[s]) return s;
  var f=teams.find(function(t){return t.name.replace(/[^A-ZÀ-Ú]/gi,"").toUpperCase()===s});
  return f?f.code:null;
}
// agrupa [1,2,3,7] -> "1-3,7"
function ranges(arr){
  arr=arr.slice().sort(function(a,b){return a-b});
  var out=[],i=0;
  while(i<arr.length){
    var s=arr[i],e=s;
    while(i+1<arr.length&&arr[i+1]===arr[i]+1){i++;e=arr[i]}
    out.push(s===e?pad(s):pad(s)+"-"+pad(e));i++;
  }
  return out.join(",");
}
