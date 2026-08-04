/* ================= STORAGE ================= */
var K_STOCK="fig26_stock",K_ORC="fig26_orc",K_SALES="fig26_sales",
    K_IGN="fig26_ignore",K_DEM="fig26_demanda";

var stock={},orcamentos=[],vendas=[],demanda=[];
try{stock=JSON.parse(localStorage.getItem(K_STOCK))||{}}catch(e){}
try{orcamentos=JSON.parse(localStorage.getItem(K_ORC))||[]}catch(e){}
try{vendas=JSON.parse(localStorage.getItem(K_SALES))||[]}catch(e){}
try{demanda=JSON.parse(localStorage.getItem(K_DEM))||[]}catch(e){}

/* migração: FWC 20 -> 00  +  remoção do bloco HIST (não-oficial) */
(function migrar(){
  /* --- FWC 20 -> 00 --- */
  if(stock.FWC&&stock.FWC[20]!==undefined){
    stock.FWC[0]=(stock.FWC[0]||0)+stock.FWC[20];
    delete stock.FWC[20];
  }
  function fixMap(m){
    if(!m||!m.FWC)return;
    m.FWC=m.FWC.map(function(n){return n===20?0:n}).filter(function(n,i,a){return a.indexOf(n)===i});
  }
  orcamentos.forEach(function(o){fixMap(o.offered);fixMap(o.requested)});
  vendas.forEach(function(v){fixMap(v.sold)});
  demanda.forEach(function(d){fixMap(d.items)});

  /* --- HIST: guarda cópia e remove --- */
  var achou=!!stock.HIST;
  function dropHist(m){if(m&&m.HIST){achou=true;delete m.HIST}}
  orcamentos.forEach(function(o){dropHist(o.offered);dropHist(o.requested)});
  vendas.forEach(function(v){dropHist(v.sold)});
  demanda.forEach(function(d){dropHist(d.items)});

  if(achou){
    try{
      localStorage.setItem("fig26_hist_backup",JSON.stringify({
        date:new Date().toISOString(),stock:stock.HIST||null}));
    }catch(e){}
    delete stock.HIST;
    orcamentos=orcamentos.filter(function(o){return Object.keys(o.offered||{}).length});
    demanda   =demanda.filter(function(d){return Object.keys(d.items||{}).length});
    console.info("Bloco HIST removido — cópia em localStorage['fig26_hist_backup']");
  }

  localStorage.setItem(K_STOCK,JSON.stringify(stock));
  localStorage.setItem(K_ORC,JSON.stringify(orcamentos));
  localStorage.setItem(K_SALES,JSON.stringify(vendas));
  localStorage.setItem(K_DEM,JSON.stringify(demanda));
})();

function saveStock(){localStorage.setItem(K_STOCK,JSON.stringify(stock))}
function saveOrc(){localStorage.setItem(K_ORC,JSON.stringify(orcamentos))}
function saveSales(){localStorage.setItem(K_SALES,JSON.stringify(vendas))}
function saveDem(){localStorage.setItem(K_DEM,JSON.stringify(demanda))}

function getQty(c,n){return (stock[c]&&stock[c][n])||0}
function temEstoque(c,n){return getQty(c,n)>0}
function setQty(c,n,q){
  if(!stock[c])stock[c]={};
  if(q<=0)delete stock[c][n]; else stock[c][n]=q;
  if(!Object.keys(stock[c]).length)delete stock[c];
  saveStock();
}
function addQty(c,n,d){if(validNum(c,n))setQty(c,n,Math.max(0,getQty(c,n)+d))}
function stockMap(){
  var m={};
  Object.keys(stock).forEach(function(c){
    var a=Object.keys(stock[c]).map(Number).filter(function(n){return validNum(c,n)});
    if(a.length)m[c]=a.sort(function(x,y){return x-y});
  });
  return m;
}
function stockUnidades(){
  var t=0;
  Object.keys(stock).forEach(function(c){Object.keys(stock[c]).forEach(function(n){t+=stock[c][n]})});
  return t;
}

/* ---------- MAPAS ---------- */
function ordenaMapa(map){
  var ord={};
  Object.keys(map||{}).sort(function(a,b){return ORDER[a]-ORDER[b]}).forEach(function(c){
    if(map[c]&&map[c].length)ord[c]=map[c].slice().sort(function(a,b){return a-b});
  });
  return ord;
}
function mapTotal(map){var s=0;Object.keys(map||{}).forEach(function(c){s+=map[c].length});return s}
function semEstoqueDe(map){
  var m={};
  Object.keys(map||{}).forEach(function(c){
    var f=map[c].filter(function(n){return !temEstoque(c,n)});
    if(f.length)m[c]=f;
  });
  return ordenaMapa(m);
}
function clonaMapa(map){
  var m={};
  Object.keys(map||{}).forEach(function(c){if(map[c].length)m[c]=map[c].slice()});
  return m;
}

/* ---------- MODO CONFERÊNCIA ---------- */
var ignoreStock=localStorage.getItem(K_IGN)==="1";
function saveIgnore(){localStorage.setItem(K_IGN,ignoreStock?"1":"0")}

/* ---------- PARSER ---------- */
function parseList(text){
  var found={},order=[];
  function add(code,num){
    if(!validNum(code,num))return;
    if(!found[code]){found[code]=[];order.push(code)}
    if(found[code].indexOf(num)<0)found[code].push(num);
  }
  var clean=String(text||"")
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu,"")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{E0060}-\u{E007F}]/gu,"");
  clean.split(/\r?\n/).forEach(function(line){
    if(!line.trim())return;
    if(/https?:\/\//i.test(line))return;
    var m=line.match(/^\s*([A-Za-zÀ-ú]{2,22})\s*[:\-–.]?\s+(.*)$/);
    if(m){
      var code=resolveCode(m[1]),rest=m[2];
      var outro=(rest.match(/[A-Za-zÀ-ú]{2,22}/g)||[]).some(function(w){return !!resolveCode(w)});
      if(code&&!outro){
        var nums=rest.match(/\d{1,2}(?!\d)/g)||[];
        if(nums.length){nums.forEach(function(n){add(code,parseInt(n,10))});return}
      }
    }
    var re=/([A-Za-zÀ-ú]{2,22})\s*[-–.:]?\s*(\d{1,2})(?!\d)/g,x;
    while((x=re.exec(line))!==null){
      var c=resolveCode(x[1]);
      if(c)add(c,parseInt(x[2],10));
    }
  });
  return {found:found,order:order};
}

/* ---------- DEMANDA ---------- */
function registrarDemanda(nome,requested){
  var falta={};
  Object.keys(requested||{}).forEach(function(c){
    var f=requested[c].filter(function(n){return !temEstoque(c,n)});
    if(f.length)falta[c]=f.slice().sort(function(a,b){return a-b});
  });
  demanda=demanda.filter(function(d){return d.name.toLowerCase()!==nome.toLowerCase()});
  if(!Object.keys(falta).length){saveDem();return {total:0,normais:0,brilhantes:0,craques:0,aces:[]}}
  demanda.unshift({id:"d"+Date.now(),name:nome,date:hoje(),items:ordenaMapa(falta)});
  saveDem();
  return contar(falta);
}
function rankDemanda(incluirResolvidas){
  var mapa={};
  demanda.forEach(function(d){
    Object.keys(d.items||{}).forEach(function(c){
      d.items[c].forEach(function(n){
        if(!validNum(c,n))return;
        if(!incluirResolvidas&&temEstoque(c,n))return;
        var k=c+"-"+pad(n);
        if(!mapa[k])mapa[k]={code:c,num:n,count:0,clients:[]};
        mapa[k].count++;
        if(mapa[k].clients.indexOf(d.name)<0)mapa[k].clients.push(d.name);
      });
    });
  });
  return Object.keys(mapa).map(function(k){return mapa[k]}).sort(function(a,b){
    if(b.count!==a.count)return b.count-a.count;
    if(ORDER[a.code]!==ORDER[b.code])return ORDER[a.code]-ORDER[b.code];
    return a.num-b.num;
  });
}
function demandaMap(){
  var m={};
  rankDemanda(false).forEach(function(it){
    if(!m[it.code])m[it.code]=[];
    m[it.code].push(it.num);
  });
  return ordenaMapa(m);
}
function demandaDe(code,num){
  var n=0;
  demanda.forEach(function(d){
    if(d.items&&d.items[code]&&d.items[code].indexOf(num)>-1)n++;
  });
  return n;
}

/* ---------- BACKUP ---------- */
function exportJSON(){
  return JSON.stringify({app:"catanos-figurinhas",v:5,date:new Date().toISOString(),
    stock:stock,orcamentos:orcamentos,vendas:vendas,demanda:demanda,ignoreStock:ignoreStock},null,1);
}
function importJSON(txt){
  var d=JSON.parse(txt);
  if(d.stock)stock=d.stock;
  if(d.orcamentos)orcamentos=d.orcamentos;
  if(d.vendas)vendas=d.vendas;
  if(d.demanda)demanda=d.demanda;
  if(typeof d.ignoreStock==="boolean"){ignoreStock=d.ignoreStock;saveIgnore()}
  /* backups antigos podem trazer HIST */
  delete stock.HIST;
  orcamentos.forEach(function(o){if(o.offered)delete o.offered.HIST;if(o.requested)delete o.requested.HIST});
  vendas.forEach(function(v){if(v.sold)delete v.sold.HIST});
  demanda.forEach(function(d2){if(d2.items)delete d2.items.HIST});
  saveStock();saveOrc();saveSales();saveDem();
}
function hoje(){
  return new Date().toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
}
