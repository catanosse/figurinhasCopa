const K={stock:"fig26_stock",want:"fig26_want",ign:"fig26_ign",sales:"fig26_sales",orc:"fig26_orc"};
function load(k,def){try{return JSON.parse(localStorage.getItem(k))||def}catch(e){return def}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}

var stock=load(K.stock,{});
var wanted=load(K.want,{});
var ignored=load(K.ign,[]);
var sales=load(K.sales,[]);
var orcs=load(K.orc,[]);

function persist(){save(K.stock,stock);save(K.want,wanted);save(K.ign,ignored);save(K.sales,sales);save(K.orc,orcs)}

function getQty(c,n){return (stock[c]&&stock[c][n])||0}
function setQty(c,n,q){
  q=Math.max(0,Number(q)||0);
  if(!stock[c])stock[c]={};
  if(q<=0)delete stock[c][n]; else stock[c][n]=q;
  if(!Object.keys(stock[c]).length)delete stock[c];
  save(K.stock,stock);
}
function addQty(c,n,d){if(validNum(c,n))setQty(c,n,getQty(c,n)+d)}
function totalStock(){var s=0;for(var c in stock)for(var n in stock[c])s+=stock[c][n];return s}
function dupList(min){ // {code:[nums]}
  min=min||2;var o={};
  for(var c in stock){var a=[];for(var n in stock[c])if(stock[c][n]>=min)a.push(Number(n));if(a.length)o[c]=a}
  return o;
}
function wantAdd(c,n){if(!validNum(c,n))return false;if(!wanted[c])wanted[c]=[];if(wanted[c].indexOf(n)<0)wanted[c].push(n);save(K.want,wanted);return true}
function wantDel(c,n){if(wanted[c]){wanted[c]=wanted[c].filter(function(x){return x!==n});if(!wanted[c].length)delete wanted[c]}save(K.want,wanted)}
function wantCount(){var s=0;for(var c in wanted)s+=wanted[c].length;return s}

// Parser universal: "MEX 3,5,7-9 ARG 01 02"
function parseList(txt){
  var res={},errs=[],cur=null;
  var toks=String(txt).toUpperCase().replace(/[;|]/g," ").split(/[\s,]+/).filter(Boolean);
  toks.forEach(function(tk){
    var code=resolveCode(tk);
    if(code&&!/^\d/.test(tk)){cur=code;if(!res[cur])res[cur]=[];return}
    var m=tk.match(/^(\d{1,3})-(\d{1,3})$/);
    if(m&&cur){for(var i=+m[1];i<=+m[2];i++)push(cur,i);return}
    if(/^\d{1,3}$/.test(tk)&&cur){push(cur,+tk);return}
    errs.push(tk);
  });
  function push(c,n){if(validNum(c,n)){if(!res[c])res[c]=[];if(res[c].indexOf(n)<0)res[c].push(n)}else errs.push(c+"-"+n)}
  for(var c in res)if(!res[c].length)delete res[c];
  return {items:res,errors:errs};
}
