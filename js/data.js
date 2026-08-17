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
POR:[{name:"Cristiano Ronaldo",num:15}], NOR:[{name:"Erling Haaland",num:15}],
ESP:[{name:"Lamine Yamal",num:15}],      FRA:[{name:"Kylian Mbappé",num:20}],
NED:[{name:"Memphis Depay",num:17}],     ARG:[{name:"Lionel Messi",num:17}],
BA:[{name:"Vinícius Júnior",num:14}],   ENG:[{name:"Jude Bellingham",num:11}],
BEL:[{name:"Kevin De Bruyne",num:15}],   EGY:[{name:"Mohamed Salah",num:17}],
KOR:[{name:"Son Heung-min",num:18}],     URU:[{name:"Federico Valverde",num:10}],
COL:[{name:"Luis Díaz",num:20}],         MAR:[{name:"Achraf Hakimi",num:4}],
CRO:[{name:"Luka Modrić",num:9}],        GER:[{name:"Jamal Musiala",num:15}],
JPN:[{name:"Takefusa Kubo",num:12}],     SEN:[{name:"Sadio Mané",num:15}],
MEX:[{name:"Santiago Giménez",num:16}],  USA:[{name:"Christian Pulisic",num:16}],
SWE:[{name:"Viktor Gyökeres",num:20}],   CIV:[{name:"Simon Adingra",num:17}],
ECU:[{name:"Moisés Caicedo",num:9}],     CAN:[{name:"Alphonso Davies",num:3}],
AUS:[{name:"Jackson Irvine",num:11}],    SUI:[{name:"Granit Xhaka",num:9}],
TUR:[{name:"Arda Güler",num:14}],        ALG:[{name:"Riyad Mahrez",num:15}],
AUT:[{name:"Marcel Sabitzer",num:11}],   GHA:[{name:"Mohammed Kudus",num:14}],
PAN:[{name:"Adalberto Carrasquilla",num:12}], IRN:[{name:"Mehdi Taremi",num:18}],
TUN:[{name:"Hannibal Mejbri",num:14}],   PAR:[{name:"Miguel Almirón",num:17}],
CZE:[{name:"Patrik Schick",num:20}],     RSA:[{name:"Percy Tau",num:null}],
QAT:[{name:"Akram Afif",num:18}],        KSA:[{name:"Salem Al-Dawsari",num:16}],
NZL:[{name:"Chris Wood",num:17}],        SCO:[{name:"Scott McTominay",num:11}],
CPV:[{name:"Ryan Mendes",num:17}],       UZB:[{name:"Eldor Shomurodov",num:16}],
JOR:[{name:"Musa Al-Taamari",num:15}],   IRQ:[{name:"Aymen Hussein",num:19}],
COD:[{name:"Cédric Bakambu",num:19}],    HAI:[{name:"Frantzdy Pierrot",num:20}],
CUW:[{name:"Juninho Bacuna",num:11}],    BIH:[{name:"Edin Džeko",num:18}]
};

function pad(n){return String(n).padStart(2,"0")}

/* ---- Craque com número identificado (quando disponível) ---- */
function aceKey(c,n){return c+"-"+pad(n)}
function isAce(code,num){
  var a=(ACES_BY_TEAM[code]||[])[0];
  return !!(a&&a.num===num);
}
function aceName(code,num){
  var a=(ACES_BY_TEAM[code]||[])[0];
  return (a&&a.num===num)?a.name:"";
}
function aceShort(code,num){return aceName(code,num)}
function aceLabel(code,num){
  var n=aceName(code,num);
  return n?"⭐ "+n:"";
}

/* ---- API nível seleção ---- */
function teamHasAce(code){return !!ACES_BY_TEAM[code]}
function teamAceNames(code){
  return (ACES_BY_TEAM[code]||[]).map(function(a){return a.name});
}
function teamAceNum(code){
  var a=(ACES_BY_TEAM[code]||[])[0];
  return a?a.num:null;
}
function teamAceLabel(code){
  var a=(ACES_BY_TEAM[code]||[])[0];
  if(!a)return "";
  return a.num?a.name+" (nº "+pad(a.num)+")":a.name+" (número não confirmado)";
}


/* ======================================================
   JOGADORES POR NÚMERO — checklist não-oficial, coletado
   de referências públicas (Scanini). Serve para exibir o
   nome dentro do quadradinho quando o toggle "Ver nomes"
   está ligado. NÃO afeta contagem, brilho ou craque —
   é só um rótulo visual auxiliar.
   Números 1 (escudo) e 13 (foto do time) não têm jogador.
   ====================================================== */
var PLAYERS_BY_KEY={
 /* MEX */ "MEX-02":"Luis Malagón","MEX-03":"Johan Vásquez","MEX-04":"Jorge Sánchez",
 "MEX-05":"César Montes","MEX-06":"Jesús Gallardo","MEX-07":"Israel Reyes",
 "MEX-08":"Diego Laínez","MEX-09":"Carlos Rodríguez","MEX-10":"Edson Álvarez",
 "MEX-11":"Orbelín Pineda","MEX-12":"Marcel Ruiz","MEX-14":"Érick Sánchez",
 "MEX-15":"Hirving Lozano","MEX-16":"Santiago Giménez","MEX-17":"Raúl Jiménez",
 "MEX-18":"Alexis Vega","MEX-19":"Roberto Alvarado","MEX-20":"César Huerta",

 /* RSA */ "RSA-02":"Ronwen Williams","RSA-03":"Sipho Chaine","RSA-04":"Aubrey Modiba",
 "RSA-05":"Samukele Kabini","RSA-06":"Mbekezeli Mbokazi","RSA-07":"Khulumani Ndamane",
 "RSA-08":"Siyabonga Ngezana","RSA-09":"Khuliso Mudau","RSA-10":"Nkosinathi Sibisi",
 "RSA-11":"Teboho Mokoena","RSA-12":"Thalente Mbatha","RSA-14":"Bathusi Aubaas",
 "RSA-15":"Yaya Sithole","RSA-16":"Sipho Mbule","RSA-17":"Lyle Foster",
 "RSA-18":"Iqraam Rayners","RSA-19":"Mohau Nkota","RSA-20":"Oswin Appollis",

 /* KOR */ "KOR-02":"Jo Hyeon-woo","KOR-03":"Kim Seung-gyu","KOR-04":"Kim Min-jae",
 "KOR-05":"Cho Yu-min","KOR-06":"Seol Young-woo","KOR-07":"Lee Han-beom",
 "KOR-08":"Lee Tae-seok","KOR-09":"Lee Myung-jae","KOR-10":"Lee Jae-sung",
 "KOR-11":"Hwang In-beom","KOR-12":"Lee Kang-in","KOR-14":"Baek Seung-ho",
 "KOR-15":"Jens Castrop","KOR-16":"Lee Dong-gyeong","KOR-17":"Cho Gue-sung",
 "KOR-18":"Son Heung-min","KOR-19":"Hwang Hee-chan","KOR-20":"Oh Hyeon-gyu",

 /* CZE */ "CZE-02":"Matěj Kovář","CZE-03":"Jindřich Staněk","CZE-04":"Ladislav Krejčí",
 "CZE-05":"Vladimír Coufal","CZE-06":"Jaroslav Zelený","CZE-07":"Tomáš Holeš",
 "CZE-08":"David Zima","CZE-09":"Michal Sadílek","CZE-10":"Lukáš Provod",
 "CZE-11":"Lukáš Červ","CZE-12":"Tomáš Souček","CZE-14":"Pavel Šulc",
 "CZE-15":"Matěj Vydra","CZE-16":"Václav Kušej","CZE-17":"Tomáš Chorý",
 "CZE-18":"Václav Černý","CZE-19":"Adam Hložek","CZE-20":"Patrik Schick",

 /* CAN */ "CAN-02":"Dayne St.Clair","CAN-03":"Alphonso Davies","CAN-04":"Alistair Johnston",
 "CAN-05":"Samuel Adekugbe","CAN-06":"Riche Laryea","CAN-07":"Derek Cornelius",
 "CAN-08":"Moïse Bombito","CAN-09":"Kamal Miller","CAN-10":"Stephen Eustáquio",
 "CAN-11":"Ismaël Koné","CAN-12":"Jonathan Osorio","CAN-14":"Jacob Shaffelburg",
 "CAN-15":"Mathieu Choinière","CAN-16":"Niko Sigur","CAN-17":"Tajon Buchanan",
 "CAN-18":"Liam Millar","CAN-19":"Cyle Larin","CAN-20":"Jonathan David",

 /* BIH */ "BIH-02":"Nikola Vasilj","BIH-03":"Amer Dedić","BIH-04":"Sead Kolašinac",
 "BIH-05":"Tarik Muharemović","BIH-06":"Nihad Mujakić","BIH-07":"Nikola Katić",
 "BIH-08":"Amir Hadžiahmetović","BIH-09":"Benjamin Tahirović","BIH-10":"Armin Gigović",
 "BIH-11":"Ivan Šunjić","BIH-12":"Ivan Bašić","BIH-14":"Dženis Burnić",
 "BIH-15":"Esmir Bajraktarević","BIH-16":"Amar Memić","BIH-17":"Ermedin Demirović",
 "BIH-18":"Edin Džeko","BIH-19":"Samed Baždar","BIH-20":"Haris Tabaković",

 /* QAT */ "QAT-02":"Meshaal Barsham","QAT-03":"Sultan Al-Brake","QAT-04":"Lucas Mendes",
 "QAT-05":"Homam Ahmed","QAT-06":"Boualem Khoukhi","QAT-07":"Pedro Miguel",
 "QAT-08":"Tarek Salman","QAT-09":"Mohamed Al-Mannai","QAT-10":"Karim Boudiaf",
 "QAT-11":"Assim Madibo","QAT-12":"Ahmed Fatehi","QAT-14":"Mohammed Waad",
 "QAT-15":"Abdulaziz Hatem","QAT-16":"Hassan Al-Haydos","QAT-17":"Edmílson Júnior",
 "QAT-18":"Akram Afif","QAT-19":"Ahmed Al Ganehi","QAT-20":"Almoez Ali",

 /* SUI */ "SUI-02":"Gregor Kobel","SUI-03":"Yvon Mvogo","SUI-04":"Manuel Akanji",
 "SUI-05":"Ricardo Rodríguez","SUI-06":"Nico Elvedi","SUI-07":"Aurèle Amenda",
 "SUI-08":"Silvan Widmer","SUI-09":"Granit Xhaka","SUI-10":"Denis Zakaria",
 "SUI-11":"Remo Freuler","SUI-12":"Fabian Rieder","SUI-14":"Ardon Jashari",
 "SUI-15":"Johan Manzambi","SUI-16":"Michel Aebischer","SUI-17":"Breel Embolo",
 "SUI-18":"Ruben Vargas","SUI-19":"Dan Ndoye","SUI-20":"Zeki Amdouni",

 /* BRA */ "BRA-02":"Alisson","BRA-03":"Bento","BRA-04":"Marquinhos",
 "BRA-05":"Éder Militão","BRA-06":"Gabriel Magalhães","BRA-07":"Danilo",
 "BRA-08":"Wesley","BRA-09":"Lucas Paquetá","BRA-10":"Casemiro",
 "BRA-11":"Bruno Guimarães","BRA-12":"Luiz Henrique","BRA-14":"Vinícius Júnior",
 "BRA-15":"Rodrygo","BRA-16":"João Pedro","BRA-17":"Matheus Cunha",
 "BRA-18":"Gabriel Martinelli","BRA-19":"Raphinha","BRA-20":"Estêvão",

 /* MAR */ "MAR-02":"Yassine Bounou","MAR-03":"Munir El Kajoui","MAR-04":"Achraf Hakimi",
 "MAR-05":"Noussair Mazraoui","MAR-06":"Nayef Aguerd","MAR-07":"Romain Saïss",
 "MAR-08":"Jawad El Yamiq","MAR-09":"Adam Masina","MAR-10":"Sofyan Amrabat",
 "MAR-11":"Azzedine Ounahi","MAR-12":"Eliesse Ben Seghir","MAR-14":"Bilal El Khannouss",
 "MAR-15":"Ismael Saibari","MAR-16":"Youssef En-Nesyri","MAR-17":"Abde Ezzalzouli",
 "MAR-18":"Soufiane Rahimi","MAR-19":"Brahim Díaz","MAR-20":"Ayoub El Kaabi",

 /* HAI */ "HAI-02":"Johny Placide","HAI-03":"Carlens Arcus","HAI-04":"Martin Expérience",
 "HAI-05":"Jean-Kevin Duverne","HAI-06":"Ricardo Adé","HAI-07":"Duke Lacroix",
 "HAI-08":"Garven Métusala","HAI-09":"Hannes Delcroix","HAI-10":"Leverton Pierre",
 "HAI-11":"Danley Jean Jacques","HAI-12":"Jean-Ricner Bellegarde","HAI-14":"Christopher Attys",
 "HAI-15":"Derrick Étienne Jr.","HAI-16":"Josué Casimir","HAI-17":"Ruben Providence",
 "HAI-18":"Duckens Nazon","HAI-19":"Louicius Deedson","HAI-20":"Frantzdy Pierrot",

 /* SCO */ "SCO-02":"Angus Gunn","SCO-03":"Jack Hendry","SCO-04":"Kieran Tierney",
 "SCO-05":"Aaron Hickey","SCO-06":"Andrew Robertson","SCO-07":"Scott McKenna",
 "SCO-08":"John Souttar","SCO-09":"Anthony Ralston","SCO-10":"Grant Hanley",
 "SCO-11":"Scott McTominay","SCO-12":"Billy Gilmour","SCO-14":"Lewis Ferguson",
 "SCO-15":"Ryan Christie","SCO-16":"Kenny McLean","SCO-17":"John McGinn",
 "SCO-18":"Lyndon Dykes","SCO-19":"Che Adams","SCO-20":"Ben Doak",

 /* USA */ "USA-02":"Matt Freese","USA-03":"Chris Richards","USA-04":"Tim Ream",
 "USA-05":"Mark McKenzie","USA-06":"Alex Freeman","USA-07":"Antonee Robinson",
 "USA-08":"Tyler Adams","USA-09":"Tanner Tessmann","USA-10":"Weston McKennie",
 "USA-11":"Christian Roldan","USA-12":"Timothy Weah","USA-14":"Diego Luna",
 "USA-15":"Malik Tillman","USA-16":"Christian Pulisic","USA-17":"Brenden Aaronson",
 "USA-18":"Ricardo Pepi","USA-19":"Haji Wright","USA-20":"Folarin Balogun",

 /* PAR */ "PAR-02":"Roberto Fernández","PAR-03":"Orlando Gill","PAR-04":"Gustavo Gómez",
 "PAR-05":"Fabián Balbuena","PAR-06":"Juan José Cáceres","PAR-07":"Omar Alderete",
 "PAR-08":"Junior Alonso","PAR-09":"Mathías Villasanti","PAR-10":"Diego Gómez",
 "PAR-11":"Damián Bobadilla","PAR-12":"Andrés Cubas","PAR-14":"Matías Galarza Fonda",
 "PAR-15":"Julio Enciso","PAR-16":"Alejandro Romero Gamarra","PAR-17":"Miguel Almirón",
 "PAR-18":"Ramón Sosa","PAR-19":"Ángel Romero","PAR-20":"Antonio Sanabria",

 /* AUS */ "AUS-02":"Mathew Ryan","AUS-03":"Joe Gauci","AUS-04":"Harry Souttar",
 "AUS-05":"Alessandro Circati","AUS-06":"Jordan Bos","AUS-07":"Aziz Behich",
 "AUS-08":"Cameron Burgess","AUS-09":"Lewis Miller","AUS-10":"Miloš Degenek",
 "AUS-11":"Jackson Irvine","AUS-12":"Riley McGree","AUS-14":"Aiden O'Neill",
 "AUS-15":"Connor Metcalfe","AUS-16":"Patrick Yazbek","AUS-17":"Craig Goodwin",
 "AUS-18":"Kusini Yengi","AUS-19":"Nestory Irankunda","AUS-20":"Mohamed Touré",

 /* TUR */ "TUR-02":"Uğurcan Çakır","TUR-03":"Mert Müldür","TUR-04":"Zeki Çelik",
 "TUR-05":"Abdülkerim Bardakçı","TUR-06":"Çağlar Söyüncü","TUR-07":"Merih Demiral",
 "TUR-08":"Ferdi Kadıoğlu","TUR-09":"Kaan Ayhan","TUR-10":"İsmail Yüksek",
 "TUR-11":"Hakan Çalhanoğlu","TUR-12":"Orkun Kökçü","TUR-14":"Arda Güler",
 "TUR-15":"İrfan Can Kahveci","TUR-16":"Yunus Akgün","TUR-17":"Can Uzun",
 "TUR-18":"Barış Alper Yılmaz","TUR-19":"Kerem Aktürkoğlu","TUR-20":"Kenan Yıldız",

 /* GER */ "GER-02":"Marc-André ter Stegen","GER-03":"Jonathan Tah","GER-04":"David Raum",
 "GER-05":"Nico Schlotterbeck","GER-06":"Antonio Rüdiger","GER-07":"Waldemar Anton",
 "GER-08":"Ridle Baku","GER-09":"Maximilian Mittelstädt","GER-10":"Joshua Kimmich",
 "GER-11":"Florian Wirtz","GER-12":"Felix Nmecha","GER-14":"Leon Goretzka",
 "GER-15":"Jamal Musiala","GER-16":"Serge Gnabry","GER-17":"Kai Havertz",
 "GER-18":"Leroy Sané","GER-19":"Karim Adeyemi","GER-20":"Nick Woltemade",

 /* CUW */ "CUW-02":"Eloy Room","CUW-03":"Armando Obispo","CUW-04":"Sherel Floranus",
 "CUW-05":"Jurien Gaari","CUW-06":"Joshua Brenet","CUW-07":"Roshon van Eijma",
 "CUW-08":"Shurandy Sambo","CUW-09":"Livano Comenencia","CUW-10":"Godfried Roemeratoe",
 "CUW-11":"Juninho Bacuna","CUW-12":"Leandro Bacuna","CUW-14":"Tahith Chong",
 "CUW-15":"Kenji Gorré","CUW-16":"Jearl Margaritha","CUW-17":"Jurgen Locadia",
 "CUW-18":"Jeremy Antonisse","CUW-19":"Gervane Kastaneer","CUW-20":"Sontje Hansen",

 /* CIV */ "CIV-02":"Yahia Fofana","CIV-03":"Ghislain Konan","CIV-04":"Wilfried Singo",
 "CIV-05":"Odilon Kossounou","CIV-06":"Evan Ndicka","CIV-07":"Willy Boly",
 "CIV-08":"Emmanuel Agbadou","CIV-09":"Ousmane Diomandé","CIV-10":"Franck Kessié",
 "CIV-11":"Seko Fofana","CIV-12":"Ibrahim Sangaré","CIV-14":"Jean-Philippe Gbamin",
 "CIV-15":"Amad Diallo","CIV-16":"Sébastien Haller","CIV-17":"Simon Adingra",
 "CIV-18":"Yan Diomandé","CIV-19":"Evann Guessand","CIV-20":"Oumar Diakité",

 /* ECU */ "ECU-02":"Hernán Galíndez","ECU-03":"Gonzalo Valle","ECU-04":"Piero Hincapié",
 "ECU-05":"Pervis Estupiñán","ECU-06":"William Pacho","ECU-07":"Ángelo Preciado",
 "ECU-08":"Joel Ordóñez","ECU-09":"Moisés Caicedo","ECU-10":"Alan Franco",
 "ECU-11":"Kendry Páez","ECU-12":"Pedro Vite","ECU-14":"John Yeboah",
 "ECU-15":"Leonardo Campana","ECU-16":"Gonzalo Plata","ECU-17":"Nilson Angulo",
 "ECU-18":"Alan Minda","ECU-19":"Kevin Rodríguez","ECU-20":"Enner Valencia",

 /* NED */ "NED-02":"Bart Verbruggen","NED-03":"Virgil van Dijk","NED-04":"Micky van de Ven",
 "NED-05":"Jurriën Timber","NED-06":"Denzel Dumfries","NED-07":"Nathan Aké",
 "NED-08":"Jeremie Frimpong","NED-09":"Jan Paul van Hecke","NED-10":"Tijjani Reijnders",
 "NED-11":"Ryan Gravenberch","NED-12":"Teun Koopmeiners","NED-14":"Frenkie de Jong",
 "NED-15":"Xavi Simons","NED-16":"Justin Kluivert","NED-17":"Memphis Depay",
 "NED-18":"Donyell Malen","NED-19":"Wout Weghorst","NED-20":"Cody Gakpo",

 /* JPN */ "JPN-02":"Zion Suzuki","JPN-03":"Henry Heroki Mochizuki","JPN-04":"Ayumu Seko",
 "JPN-05":"Junnosuke Suzuki","JPN-06":"Shogo Taniguchi","JPN-07":"Tsuyoshi Watanabe",
 "JPN-08":"Kaishu Sano","JPN-09":"Yuki Soma","JPN-10":"Ao Tanaka",
 "JPN-11":"Daichi Kamada","JPN-12":"Takefusa Kubo","JPN-14":"Ritsu Dōan",
 "JPN-15":"Keito Nakamura","JPN-16":"Takumi Minamino","JPN-17":"Shuto Machino",
 "JPN-18":"Junya Ito","JPN-19":"Kōki Ogawa","JPN-20":"Ayase Ueda",

 /* SWE */ "SWE-02":"Victor Johansson","SWE-03":"Isak Hien","SWE-04":"Gabriel Gudmundsson",
 "SWE-05":"Emil Holm","SWE-06":"Victor Lindelöf","SWE-07":"Gustaf Lagerbielke",
 "SWE-08":"Lucas Bergvall","SWE-09":"Hugo Larsson","SWE-10":"Jesper Karlström",
 "SWE-11":"Yasin Ayari","SWE-12":"Mattias Svanberg","SWE-14":"Daniel Svensson",
 "SWE-15":"Ken Sema","SWE-16":"Roony Bardghji","SWE-17":"Dejan Kulusevski",
 "SWE-18":"Anthony Elanga","SWE-19":"Alexander Isak","SWE-20":"Viktor Gyökeres",

 /* TUN */ "TUN-02":"Béchir Ben Saïd","TUN-03":"Aymen Dahmen","TUN-04":"Yan Valery",
 "TUN-05":"Montassar Talbi","TUN-06":"Yassine Meriah","TUN-07":"Ali Abdi",
 "TUN-08":"Dylan Bronn","TUN-09":"Ellyes Skhiri","TUN-10":"Aïssa Laïdouni",
 "TUN-11":"Ferjani Sassi","TUN-12":"Mohamed Ali Ben Romdhane","TUN-14":"Hannibal Mejbri",
 "TUN-15":"Elias Achouri","TUN-16":"Elias Saad","TUN-17":"Hazem Mastouri",
 "TUN-18":"Ismael Gharbi","TUN-19":"Sayfallah Ltaief","TUN-20":"Naïm Sliti",

 /* BEL */ "BEL-02":"Thibaut Courtois","BEL-03":"Arthur Theate","BEL-04":"Timothy Castagne",
 "BEL-05":"Zeno Debast","BEL-06":"Brandon Mechele","BEL-07":"Maxim De Cuyper",
 "BEL-08":"Thomas Meunier","BEL-09":"Youri Tielemans","BEL-10":"Amadou Onana",
 "BEL-11":"Nicolas Raskin","BEL-12":"Alexis Saelemaekers","BEL-14":"Hans Vanaken",
 "BEL-15":"Kevin De Bruyne","BEL-16":"Jérémy Doku","BEL-17":"Charles De Ketelaere",
 "BEL-18":"Leandro Trossard","BEL-19":"Loïs Openda","BEL-20":"Romelu Lukaku",

 /* EGY */ "EGY-02":"Mohamed El Shenawy","EGY-03":"Mohamed Hany","EGY-04":"Mohamed Hamdy",
 "EGY-05":"Yasser Ibrahim","EGY-06":"Khaled Sobhi","EGY-07":"Ramy Rabia",
 "EGY-08":"Hossam Abdelmaguid","EGY-09":"Ahmed Fatouh","EGY-10":"Marwan Attia",
 "EGY-11":"Zizo","EGY-12":"Hamdy Fathy","EGY-14":"Mohamed Lasheen",
 "EGY-15":"Emam Ashour","EGY-16":"Osama Faisal","EGY-17":"Mohamed Salah",
 "EGY-18":"Mostafa Mohamed","EGY-19":"Trezeguet","EGY-20":"Omar Marmoush",

 /* IRN */ "IRN-02":"Alireza Beiranvand","IRN-03":"Morteza Pouraliganji","IRN-04":"Ehsan Hajsafi",
 "IRN-05":"Milad Mohammadi","IRN-06":"Shoja Khalilzadeh","IRN-07":"Ramin Rezaeian",
 "IRN-08":"Hossein Kanaani","IRN-09":"Sadegh Moharrami","IRN-10":"Saleh Hardani",
 "IRN-11":"Saeid Ezatolahi","IRN-12":"Saman Ghoddos","IRN-14":"Omid Noorafkan",
 "IRN-15":"Roozbeh Cheshmi","IRN-16":"Mohammad Mohebi","IRN-17":"Sardar Azmoun",
 "IRN-18":"Mehdi Taremi","IRN-19":"Alireza Jahanbakhsh","IRN-20":"Ali Gholizadeh",

 /* NZL */ "NZL-02":"Max Crocombe-Payne","NZL-03":"Alex Paulsen","NZL-04":"Michael Boxall",
 "NZL-05":"Liberato Cacace","NZL-06":"Tim Payne","NZL-07":"Tyler Bindon",
 "NZL-08":"Francis de Vries","NZL-09":"Finn Surman","NZL-10":"Joe Bell",
 "NZL-11":"Sarpreet Singh","NZL-12":"Ryan Thomas","NZL-14":"Matthew Garbett",
 "NZL-15":"Marko Stamenić","NZL-16":"Ben Old","NZL-17":"Chris Wood",
 "NZL-18":"Elijah Just","NZL-19":"Callum McCowatt","NZL-20":"Kosta Barbarouses",

 /* ESP */ "ESP-02":"Unai Simón","ESP-03":"Robin Le Normand","ESP-04":"Aymeric Laporte",
 "ESP-05":"Dean Huijsen","ESP-06":"Pedro Porro","ESP-07":"Dani Carvajal",
 "ESP-08":"Marc Cucurella","ESP-09":"Martín Zubimendi","ESP-10":"Rodri",
 "ESP-11":"Pedri","ESP-12":"Fabián Ruiz","ESP-14":"Mikel Merino",
 "ESP-15":"Lamine Yamal","ESP-16":"Dani Olmo","ESP-17":"Nico Williams",
 "ESP-18":"Ferran Torres","ESP-19":"Álvaro Morata","ESP-20":"Mikel Oyarzabal",

 /* CPV */ "CPV-02":"Vozinha","CPV-03":"Logan Costa","CPV-04":"Pico",
 "CPV-05":"Diney","CPV-06":"Steven Moreira","CPV-07":"Wagner Pina",
 "CPV-08":"João Paulo","CPV-09":"Yannick Semedo","CPV-10":"Kevin Pina",
 "CPV-11":"Patrick Andrade","CPV-12":"Jamiro Monteiro","CPV-14":"Deroy Duarte",
 "CPV-15":"Garry Rodrigues","CPV-16":"Jovane Cabral","CPV-17":"Ryan Mendes",
 "CPV-18":"Dailon Livramento","CPV-19":"Willy Semedo","CPV-20":"Bebé",

 /* KSA */ "KSA-02":"Nawaf Alaqidi","KSA-03":"Abdulrahman Al-Sanbi","KSA-04":"Saud Abdulhamid",
 "KSA-05":"Nawaf Boushal","KSA-06":"Jihad Thakri","KSA-07":"Moteb Al-Harbi",
 "KSA-08":"Hassan Altambakti","KSA-09":"Musab Al-Juwayr","KSA-10":"Ziyad Al-Johani",
 "KSA-11":"Abdullah Al-Khaibari","KSA-12":"Nasser Al-Dawsari","KSA-14":"Saleh Abu Alshamat",
 "KSA-15":"Marwan Al-Sahafi","KSA-16":"Salem Al-Dawsari","KSA-17":"Abdulrahman Al-Aboud",
 "KSA-18":"Feras Albrikan","KSA-19":"Saleh Al-Shehri","KSA-20":"Abdullah Al-Hamdan",

 /* URU */ "URU-02":"Sergio Rochet","URU-03":"Santiago Mele","URU-04":"Ronald Araújo",
 "URU-05":"José María Giménez","URU-06":"Sebastián Cáceres","URU-07":"Mathías Olivera",
 "URU-08":"Guillermo Varela","URU-09":"Nahitan Nández","URU-10":"Federico Valverde",
 "URU-11":"Giorgian De Arrascaeta","URU-12":"Rodrigo Bentancur","URU-14":"Manuel Ugarte",
 "URU-15":"Nicolás de la Cruz","URU-16":"Maximiliano Araújo","URU-17":"Darwin Núñez",
 "URU-18":"Federico Viñas","URU-19":"Rodrigo Aguirre","URU-20":"Facundo Pellistri",

 /* FRA */ "FRA-02":"Mike Maignan","FRA-03":"Théo Hernández","FRA-04":"William Saliba",
 "FRA-05":"Jules Koundé","FRA-06":"Ibrahima Konaté","FRA-07":"Dayot Upamecano",
 "FRA-08":"Lucas Digne","FRA-09":"Aurélien Tchouaméni","FRA-10":"Eduardo Camavinga",
 "FRA-11":"Manu Koné","FRA-12":"Adrien Rabiot","FRA-14":"Michael Olise",
 "FRA-15":"Ousmane Dembélé","FRA-16":"Bradley Barcola","FRA-17":"Désiré Doué",
 "FRA-18":"Kingsley Coman","FRA-19":"Hugo Ekitiké","FRA-20":"Kylian Mbappé",

 /* SEN */ "SEN-02":"Édouard Mendy","SEN-03":"Yehvann Diouf","SEN-04":"Moussa Niakhaté",
 "SEN-05":"Abdoulaye Seck","SEN-06":"Ismail Jakobs","SEN-07":"El Hadji Malick Diouf",
 "SEN-08":"Kalidou Koulibaly","SEN-09":"Idrissa Gana Guèye","SEN-10":"Pape Matar Sarr",
 "SEN-11":"Pape Guèye","SEN-12":"Habib Diarra","SEN-14":"Lamine Camara",
 "SEN-15":"Sadio Mané","SEN-16":"Ismaïla Sarr","SEN-17":"Boulaye Dia",
 "SEN-18":"Iliman Ndiaye","SEN-19":"Nicolas Jackson","SEN-20":"Krépin Diatta",

 /* IRQ */ "IRQ-02":"Jalal Hassan","IRQ-03":"Rebin Sulaka","IRQ-04":"Hussein Ali",
 "IRQ-05":"Akam Hashem","IRQ-06":"Merchas Doski","IRQ-07":"Zaid Tahseen",
 "IRQ-08":"Manaf Younis","IRQ-09":"Zidane Iqbal","IRQ-10":"Amir Al-Ammari",
 "IRQ-11":"Ibrahim Bavesh","IRQ-12":"Ali Jasim","IRQ-14":"Youssef Amyn",
 "IRQ-15":"Aimar Sher","IRQ-16":"Marko Farji","IRQ-17":"Osama Rashid",
 "IRQ-18":"Ali Al-Hamadi","IRQ-19":"Aymen Hussein","IRQ-20":"Mohanad Ali",

 /* NOR */ "NOR-02":"Ørjan Nyland","NOR-03":"Julian Ryerson","NOR-04":"Leo Østigård",
 "NOR-05":"Kristoffer Ajer","NOR-06":"Marcus Holmgren Pedersen","NOR-07":"David Møller Wolfe",
 "NOR-08":"Torbjørn Heggem","NOR-09":"Morten Thorsby","NOR-10":"Martin Ødegaard",
 "NOR-11":"Sander Berge","NOR-12":"Andreas Schjelderup","NOR-14":"Patrick Berg",
 "NOR-15":"Erling Haaland","NOR-16":"Alexander Sørloth","NOR-17":"Aron Dønnum",
 "NOR-18":"Jørgen Strand Larsen","NOR-19":"Antonio Nusa","NOR-20":"Oscar Bobb",

 /* ARG */ "ARG-02":"Emiliano Martínez","ARG-03":"Nahuel Molina","ARG-04":"Cristian Romero",
 "ARG-05":"Nicolás Otamendi","ARG-06":"Nicolás Tagliafico","ARG-07":"Leonardo Balerdi",
 "ARG-08":"Enzo Fernández","ARG-09":"Alexis Mac Allister","ARG-10":"Rodrigo De Paul",
 "ARG-11":"Exequiel Palacios","ARG-12":"Leandro Paredes","ARG-14":"Nico Paz",
 "ARG-15":"Franco Mastantuono","ARG-16":"Nico González","ARG-17":"Lionel Messi",
 "ARG-18":"Lautaro Martínez","ARG-19":"Julián Álvarez","ARG-20":"Giuliano Simeone",

 /* ALG */ "ALG-02":"Alexis Guendouz","ALG-03":"Ramy Bensebaini","ALG-04":"Youcef Atal",
 "ALG-05":"Rayan Aït-Nouri","ALG-06":"Mohamed Amine Tougai","ALG-07":"Aïssa Mandi",
 "ALG-08":"Ismaël Bennacer","ALG-09":"Houssem Aouar","ALG-10":"Hicham Boudaoui",
 "ALG-11":"Ramiz Zerrouki","ALG-12":"Nabil Bentaleb","ALG-14":"Farés Chaïbi",
 "ALG-15":"Riyad Mahrez","ALG-16":"Saïd Benrahma","ALG-17":"Anis Hadj Moussa",
 "ALG-18":"Amine Gouiri","ALG-19":"Baghdad Bounedjah","ALG-20":"Mohammed Amoura",

 /* AUT */ "AUT-02":"Alexander Schlager","AUT-03":"Patrick Pentz","AUT-04":"David Alaba",
 "AUT-05":"Kevin Danso","AUT-06":"Philipp Lienhart","AUT-07":"Stefan Posch",
 "AUT-08":"Phillipp Mwene","AUT-09":"Alexander Prass","AUT-10":"Xaver Schlager",
 "AUT-11":"Marcel Sabitzer","AUT-12":"Konrad Laimer","AUT-14":"Florian Grillitsch",
 "AUT-15":"Nicolas Seiwald","AUT-16":"Romano Schmid","AUT-17":"Patrick Wimmer",
 "AUT-18":"Christoph Baumgartner","AUT-19":"Michael Gregoritsch","AUT-20":"Marko Arnautović",

 /* JOR */ "JOR-02":"Yazeed Abulaila","JOR-03":"Ihsan Haddad","JOR-04":"Mohammad Abu Hashish",
 "JOR-05":"Yazan Al-Arab","JOR-06":"Abdallah Nasib","JOR-07":"Saleem Obaid",
 "JOR-08":"Mohammad Abualnadi","JOR-09":"Ibrahim Saadeh","JOR-10":"Nizar Al-Rashdan",
 "JOR-11":"Noor Al-Rawabdeh","JOR-12":"Mohannad Abu Taha","JOR-14":"Amer Jamous",
 "JOR-15":"Musa Al-Taamari","JOR-16":"Yazan Al-Naimat","JOR-17":"Mahmoud Al-Mardi",
 "JOR-18":"Ali Olwan","JOR-19":"Mohammad Abu Zrayq","JOR-20":"Ibrahim Sabra",

 /* POR */ "POR-02":"Diogo Costa","POR-03":"José Sá","POR-04":"Rúben Dias",
 "POR-05":"João Cancelo","POR-06":"Diogo Dalot","POR-07":"Nuno Mendes",
 "POR-08":"Gonçalo Inácio","POR-09":"Bernardo Silva","POR-10":"Bruno Fernandes",
 "POR-11":"Rúben Neves","POR-12":"Vitinha","POR-14":"João Neves",
 "POR-15":"Cristiano Ronaldo","POR-16":"Francisco Trincão","POR-17":"João Félix",
 "POR-18":"Gonçalo Ramos","POR-19":"Pedro Neto","POR-20":"Rafael Leão",

 /* COD */ "COD-02":"Lionel Mpasi","COD-03":"Aaron Wan-Bissaka","COD-04":"Axel Tuanzebe",
 "COD-05":"Arthur Masuaku","COD-06":"Chancel Mbemba","COD-07":"Joris Kayembe",
 "COD-08":"Charles Pickel","COD-09":"Ngal'ayel Mukau","COD-10":"Edo Kayembe",
 "COD-11":"Samuel Moutoussamy","COD-12":"Noah Sadiki","COD-14":"Théo Bongonda",
 "COD-15":"Meschack Elia","COD-16":"Yoane Wissa","COD-17":"Brian Cipenga",
 "COD-18":"Fiston Mayele","COD-19":"Cédric Bakambu","COD-20":"Nathanaël Mbuku",

 /* UZB */ "UZB-02":"Utkir Yusupov","UZB-03":"Farrukh Sayfiev","UZB-04":"Sherzod Nasrullaev",
 "UZB-05":"Umar Eshmurodov","UZB-06":"Husniddin Aliqulov","UZB-07":"Rustamjon Ashurmatov",
 "UZB-08":"Khojiakbar Alijonov","UZB-09":"Abdukodir Khusanov","UZB-10":"Odiljon Hamrobekov",
 "UZB-11":"Otabek Shukurov","UZB-12":"Jamshid Iskanderov","UZB-14":"Azizbek Turgunboev",
 "UZB-15":"Khojimat Erkinov","UZB-16":"Eldor Shomurodov","UZB-17":"Oston Urunov",
 "UZB-18":"Jaloliddin Masharipov","UZB-19":"Igor Sergeev","UZB-20":"Abbosbek Fayzullaev",

 /* COL */ "COL-02":"Camilo Vargas","COL-03":"David Ospina","COL-04":"Dávinson Sánchez",
 "COL-05":"Yerry Mina","COL-06":"Daniel Muñoz","COL-07":"Johan Mojica",
 "COL-08":"Jhon Lucumí","COL-09":"Santiago Arias","COL-10":"Jefferson Lerma",
 "COL-11":"Kevin Castaño","COL-12":"Richard Ríos","COL-14":"James Rodríguez",
 "COL-15":"Juan Fernando Quintero","COL-16":"Jorge Carrascal","COL-17":"Jhon Arias",
 "COL-18":"Jhon Córdoba","COL-19":"Luis Suárez","COL-20":"Luis Díaz",

 /* ENG */ "ENG-02":"Jordan Pickford","ENG-03":"John Stones","ENG-04":"Marc Guéhi",
 "ENG-05":"Ezri Konsa","ENG-06":"Trent Alexander-Arnold","ENG-07":"Reece James",
 "ENG-08":"Dan Burn","ENG-09":"Jordan Henderson","ENG-10":"Declan Rice",
 "ENG-11":"Jude Bellingham","ENG-12":"Cole Palmer","ENG-14":"Morgan Rogers",
 "ENG-15":"Anthony Gordon","ENG-16":"Phil Foden","ENG-17":"Bukayo Saka",
 "ENG-18":"Harry Kane","ENG-19":"Marcus Rashford","ENG-20":"Ollie Watkins",

 /* CRO */ "CRO-02":"Dominik Livaković","CRO-03":"Duje Ćaleta-Car","CRO-04":"Joško Gvardiol",
 "CRO-05":"Josip Stanišić","CRO-06":"Luka Vušković","CRO-07":"Josip Šutalo",
 "CRO-08":"Kristijan Jakić","CRO-09":"Luka Modrić","CRO-10":"Mateo Kovačić",
 "CRO-11":"Martin Baturina","CRO-12":"Lovro Majer","CRO-14":"Mario Pašalić",
 "CRO-15":"Petar Sučić","CRO-16":"Ivan Perišić","CRO-17":"Marco Pašalić",
 "CRO-18":"Ante Budimir","CRO-19":"Andrej Kramarić","CRO-20":"Franjo Ivanović",

 /* GHA */ "GHA-02":"Lawrence Ati-Zigi","GHA-03":"Tariq Lamptey","GHA-04":"Mohammed Salisu",
 "GHA-05":"Alidu Seidu","GHA-06":"Alexander Djiku","GHA-07":"Gideon Mensah",
 "GHA-08":"Caleb Yirenkyi","GHA-09":"Abdul Fatawu Issahaku","GHA-10":"Thomas Partey",
 "GHA-11":"Salis Abdul Samed","GHA-12":"Kamaldeen Sulemana","GHA-14":"Mohammed Kudus",
 "GHA-15":"Iñaki Williams","GHA-16":"Jordan Ayew","GHA-17":"André Ayew",
 "GHA-18":"Joseph Paintsil","GHA-19":"Osman Bukari","GHA-20":"Antoine Semenyo",

 /* PAN */ "PAN-02":"Orlando Mosquera","PAN-03":"Luis Mejía","PAN-04":"Fidel Escobar",
 "PAN-05":"Andrés Andrade","PAN-06":"Michael Amir Murillo","PAN-07":"Eric Davis",
 "PAN-08":"José Córdoba","PAN-09":"César Blackman","PAN-10":"Cristian Martínez",
 "PAN-11":"Aníbal Godoy","PAN-12":"Adalberto Carrasquilla","PAN-14":"Édgar Bárcenas",
 "PAN-15":"Carlos Harvey","PAN-16":"Ismael Díaz","PAN-17":"José Fajardo",
 "PAN-18":"Cecilio Waterman","PAN-19":"José Luis Rodríguez","PAN-20":"Alberto Quintero"
};
function playerAt(code,num){
   if(code!=="FWC"){
     if(num===1)return "Escudo";
     if(num===13)return "Equipe";
   }
   return PLAYERS_BY_KEY[code+"-"+pad(num)]||"";
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
