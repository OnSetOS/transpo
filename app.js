/* ============ STORAGE ============ */
const KEY="transpoBoard.v2";
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MON=["January","February","March","April","May","June","July","August","September","October","November","December"];
const STATUS={staged:"Staged",enroute:"En route",onloc:"On location",wrapped:"Wrapped"};
const STATUS_ORDER=["staged","enroute","onloc","wrapped"];
const STATUS_COLOR={staged:"#b3a582",enroute:"#2C5C9E",onloc:"#DC5A2A",wrapped:"#2E7D4F"};

/* fatigue / turnaround thresholds (minutes) */
const SPAN_WARN=12*60, SPAN_CRIT=14*60;
const REST_WARN=10*60, REST_CRIT=8*60;
const FUEL_WARN=25, FUEL_CRIT=12;

function iso(d){return d.toISOString().slice(0,10);}
function addDays(isoStr,n){const d=new Date(isoStr+"T00:00:00");d.setDate(d.getDate()+n);return iso(d);}
function todayISO(){return iso(new Date());}

/* ============ SEED DATA ============ */
function seed(){
  const t0=todayISO();
  const fleet=[
    {id:"cam",  name:"Camera Truck",    type:"10-ton grip truck", unit:"TR-01 · 4LXZ118", driver:"Mike Dolan",   crew:["A. Cruz"],             fuel:82, odo:84210, notes:"Liftgate. Camera + AC dept."},
    {id:"ge",   name:"G&E Truck",       type:"5-ton stakebed",    unit:"TR-02 · 7GHT902", driver:"Sofia Reyes",  crew:["D. Park","L. Vance"], fuel:64, odo:112050,notes:"Grip & electric combined."},
    {id:"gen",  name:"Generator",       type:"Towable genny",     unit:"GN-11 · 2WQP550", driver:"Mike Dolan",   crew:[],                      fuel:14, odo:9800,  notes:"Whisper 750. Fuel each AM."},
    {id:"ward", name:"Wardrobe Trailer",type:"40' trailer",       unit:"TL-03 · 9PLK441", driver:"Tanya Brooks", crew:["R. Sims"],             fuel:91, odo:45600, notes:"3-station. Steamer on board."},
    {id:"hmu",  name:"Hair & Makeup",   type:"36' trailer",       unit:"TL-04 · 3JDF206", driver:"Luis Ortega",  crew:["M. Ito"],              fuel:47, odo:60120, notes:"4 chairs, 2 shampoo."},
    {id:"cater",name:"Catering Truck",  type:"Kitchen truck",     unit:"CT-07 · 6RTB733", driver:"",             crew:["Chef Val","2 servers"],fuel:55, odo:78900, notes:"Propane check daily."},
    {id:"honey",name:"Honeywagon",      type:"8-room trailer",    unit:"HW-08 · 1MNC017", driver:"Dave Kim",     crew:[],                      fuel:73, odo:33400, notes:"Water + waste. Level on arrival."},
    {id:"props",name:"Props Truck",     type:"5-ton box",         unit:"TR-05 · 8VBN294", driver:"Angela Foss",  crew:["T. Okafor"],           fuel:21, odo:97650, notes:"Set dressing + props."},
    {id:"office",name:"Production Office",type:"Office trailer",  unit:"OF-09 · 5KDS860", driver:"Ray Nunes",    crew:[],                      fuel:88, odo:22100, notes:"Copier, wifi repeater."}
  ];
  const moves={};
  function set(dateOff,tid,m){const d=addDays(t0,dateOff);(moves[d]=moves[d]||{})[tid]=m;}
  // YESTERDAY (offset -1) — sets up turnaround checks
  set(-1,"cam",  {from:"Base Camp",to:"Location 3 – Pier",roll:"05:30",call:"07:00",wrap:"21:15",drive:35,status:"wrapped",crew:2});
  set(-1,"ge",   {from:"Base Camp",to:"Location 3 – Pier",roll:"05:15",call:"06:45",wrap:"20:30",drive:35,status:"wrapped",crew:3});
  set(-1,"honey",{from:"Base Camp",to:"Location 3 – Pier",roll:"05:00",call:"06:30",wrap:"20:45",drive:40,status:"wrapped",crew:1});
  // TODAY (offset 0) — shoot day at the Pier
  set(0,"cam",  {from:"Base Camp",  to:"Location 3 – Pier",roll:"05:30",call:"07:00",stops:[{t:"14:00",p:"Location 3B – Rooftop"},{t:"17:30",p:"Comp Lot – North"}],wrap:"19:00",drive:35,status:"onloc", crew:2});
  set(0,"ge",   {from:"Base Camp",  to:"Location 3 – Pier",roll:"05:15",call:"06:45",wrap:"19:30",drive:35,status:"onloc", crew:3});
  set(0,"gen",  {from:"Base Camp",  to:"Location 3 – Pier",roll:"05:15",call:"06:45",wrap:"19:30",drive:100,status:"enroute",crew:1});
  set(0,"ward", {from:"Base Camp",  to:"Location 3 – Pier",roll:"06:00",call:"07:30",stops:[{t:"16:30",p:"Comp Lot – North"}],wrap:"18:00",drive:35,status:"onloc", crew:2});
  set(0,"hmu",  {from:"Base Camp",  to:"Location 3 – Pier",roll:"04:45",call:"06:00",wrap:"18:00",drive:65,status:"onloc", crew:2});
  set(0,"cater",{from:"Commissary", to:"Location 3 – Pier",roll:"04:30",call:"06:00",wrap:"20:00",drive:50,status:"onloc", crew:3});
  set(0,"honey",{from:"Base Camp",  to:"Location 3 – Pier",roll:"05:00",call:"06:30",wrap:"20:00",drive:40,status:"onloc", crew:1});
  set(0,"props",{from:"Warehouse",  to:"Location 3 – Pier",roll:"05:00",call:"07:00",wrap:"19:00",drive:45,status:"staged",crew:2});
  set(0,"office",{from:"Base Camp", to:"",                 roll:"",     call:"",     wrap:"",     drive:null,status:"staged",crew:1});
  // TOMORROW (offset 1) — company move
  set(1,"cam",  {from:"Location 3 – Pier",to:"Location 4 – Warehouse Dist",roll:"06:00",call:"08:00",wrap:"19:00",drive:50,status:"staged",crew:2});
  set(1,"ge",   {from:"Location 3 – Pier",to:"Location 4 – Warehouse Dist",roll:"05:45",call:"07:30",wrap:"19:30",drive:50,status:"staged",crew:3});
  set(1,"gen",  {from:"Location 3 – Pier",to:"Location 4 – Warehouse Dist",roll:"05:45",call:"07:30",wrap:"19:30",drive:50,status:"staged",crew:1});
  set(1,"cater",{from:"Commissary",       to:"Location 4 – Warehouse Dist",roll:"05:00",call:"06:30",wrap:"20:00",drive:45,status:"staged",crew:3});
  set(1,"hmu",  {from:"Location 3 – Pier",to:"Location 4 – Warehouse Dist",roll:"05:00",call:"06:30",wrap:"18:00",drive:50,status:"staged",crew:2});
  // DAY 3 (offset 2)
  set(2,"cam",  {from:"Location 4 – Warehouse Dist",to:"Studio Stage B",roll:"07:00",call:"08:30",wrap:"18:00",drive:40,status:"staged",crew:2});
  set(2,"ge",   {from:"Location 4 – Warehouse Dist",to:"Studio Stage B",roll:"06:45",call:"08:00",wrap:"18:30",drive:40,status:"staged",crew:3});
  const people=[
    {id:"p1",name:"Mike Dolan",  role:"Driver",         phone:"555-0114"},
    {id:"p2",name:"Sofia Reyes", role:"Driver",         phone:"555-0192"},
    {id:"p3",name:"Tanya Brooks",role:"Driver",         phone:"555-0137"},
    {id:"p4",name:"Luis Ortega", role:"Driver",         phone:"555-0155"},
    {id:"p5",name:"Dave Kim",    role:"Driver",         phone:"555-0161"},
    {id:"p6",name:"Angela Foss", role:"Driver",         phone:"555-0178"},
    {id:"p7",name:"Ray Nunes",   role:"Driver",         phone:"555-0143"},
    {id:"p8",name:"A. Cruz",     role:"Camera Utility", phone:"555-0121"},
    {id:"p9",name:"D. Park",     role:"Grip",           phone:""},
    {id:"p10",name:"L. Vance",   role:"Electric",       phone:""},
    {id:"p11",name:"R. Sims",    role:"Costumer",       phone:""},
    {id:"p12",name:"M. Ito",     role:"Key Makeup",     phone:"555-0188"},
    {id:"p13",name:"Chef Val",   role:"Catering Lead",  phone:"555-0170"},
    {id:"p14",name:"T. Okafor",  role:"Props",          phone:""}
  ];
  return {fleet,moves,people};
}
// backfill a roster for boards created before contacts existed
function ensurePeople(){
  if(Array.isArray(DB.people))return;
  const seen={},people=[];
  (DB.fleet||[]).forEach(t=>{
    if(t.driver&&t.driver.trim()&&!seen[t.driver]){seen[t.driver]=1;people.push({id:"p"+Math.random().toString(36).slice(2,8),name:t.driver.trim(),role:"Driver",phone:""});}
    (t.crew||[]).forEach(c=>{if(c&&!seen[c]){seen[c]=1;people.push({id:"p"+Math.random().toString(36).slice(2,8),name:c,role:"Crew",phone:""});}});
  });
  DB.people=people;
}

let DB;
function load(){try{const raw=localStorage.getItem(KEY);if(raw)return JSON.parse(raw);}catch(e){}return seed();}
function save(d){if(d)DB=d;try{localStorage.setItem(KEY,JSON.stringify(DB));}catch(e){}}
DB=load();ensurePeople();save();

/* ============ STATE ============ */
let view=DB.fleet.length?"daily":"setup";
let curDate=todayISO();
let filter="all";
let dragData=null, justDragged=false;

/* ============ SETUP WIZARD ============ */
const TYPES={camera:"Camera Truck",grip:"Grip Truck",electric:"Electric Truck",hmu:"Hair & Makeup Trailer",wardrobe:"Wardrobe Trailer",honeywagon:"Honeywagon",production:"Production Trailer",cast:"Cast Trailer",generator:"Generator",catering:"Catering Truck",props:"Props Truck"};
const DEFAULT_TYPES=Object.keys(TYPES);
const SU_STEPS=["Trucks","Types","Crew","Logistics","Review"];
const suUid=()=>"t"+Math.random().toString(36).slice(2,9);
const minStr=m=>{m=((m%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");};
function mondayOf(isoStr){const d=new Date(isoStr+"T00:00:00");d.setDate(d.getDate()-((d.getDay()+6)%7));return iso(d);}
let su={tab:"smart",mode:"quick",step:0,people:[],_csv:"",g:{trucks:8,crew:8,types:DEFAULT_TYPES.slice(0,8),base:"Base Camp",loc:"Location A",date:mondayOf(todayISO()),roll:"05:30"}};

function openSetup(){view="setup";su.step=0;render();}

// build the real board (my schema) from the wizard inputs — no AI, pure generation
function suGenerate(g){
  const date=g.date||todayISO();
  const nT=Math.max(0,Math.min(60,+g.trucks||0));
  const types=(g.types&&g.types.length)?g.types:DEFAULT_TYPES;
  const imported=su.people.slice(); // objects {name,role,phone}
  const fleet=[],roster=[],tc={};
  const pid=()=>"p"+Math.random().toString(36).slice(2,8);
  for(let i=0;i<nT;i++){
    const key=types[i%types.length];tc[key]=(tc[key]||0)+1;
    const label=TYPES[key]+(tc[key]>1?" "+tc[key]:"");
    const p=imported[i];const dname=p?p.name:("Driver "+(i+1));
    fleet.push({id:suUid(),name:label,type:TYPES[key],unit:"",driver:dname,crew:[],fuel:100,odo:null,notes:""});
    roster.push({id:pid(),name:dname,role:(p&&p.role)?p.role:"Driver",phone:p?p.phone:""});
  }
  // any imported names beyond the truck count become extra crew, spread across units
  imported.slice(nT).forEach((p,i)=>{if(fleet.length){fleet[i%fleet.length].crew.push(p.name);roster.push({id:pid(),name:p.name,role:p.role||"Crew",phone:p.phone});}});
  const moves={};moves[date]={};
  const start=toMin(g.roll)||330;
  fleet.forEach((t,i)=>{moves[date][t.id]={from:g.base||"Base Camp",to:g.loc||"Location A",roll:minStr(start+i*10),call:"",wrap:"",drive:null,status:"staged",crew:1+t.crew.length};});
  return {fleet,moves,people:roster};
}
function suApply(){
  if(DB.fleet.length&&!confirm("This replaces the current board (trucks, moves, and roster). Continue?"))return;
  const g=su.g;const data=suGenerate(g);
  DB.fleet=data.fleet;DB.moves=data.moves;DB.people=data.people;save();
  view="daily";curDate=g.date||todayISO();filter="all";
  su.people=[];su._csv="";su.step=0;
  render();
}

function viewSetup(){
  return `<div class="setup"><div class="setupcard">
    <div class="setuphd"><h2>&#9889; Set Up Board</h2><p>Generate your fleet and crew, or import people from a spreadsheet. No AI &mdash; it just builds from what you enter.</p></div>
    <div class="setupbody" id="suBody"></div>
    <div class="setupfoot" id="suFoot"></div>
  </div>
  <div class="footer-note">Everything writes straight into the live board &middot; you can rename, retime, and fine-tune every unit afterward</div></div>`;
}
function wireSetup(){suRender();}

function suRender(){
  const b=document.getElementById("suBody");if(!b)return;
  let h=`<div class="segbar">
    <button class="seg" data-sutab="smart" aria-selected="${su.tab==="smart"}">&#9889; Smart Setup</button>
    <button class="seg" data-sutab="csv" aria-selected="${su.tab==="csv"}">&#128196; Import Crew</button>
  </div>`;
  if(su.people.length)h+=`<div><span class="pill-note">&#10003; Using ${su.people.length} imported name${su.people.length>1?"s":""}</span></div>`;
  if(su.tab==="smart"){
    h+=`<div class="modebar">
      <button class="seg" data-sumode="quick" aria-selected="${su.mode==="quick"}">Quick counts</button>
      <button class="seg" data-sumode="guided" aria-selected="${su.mode==="guided"}">Guided setup</button>
    </div><div id="suArea"></div>`;
  }else h+=suCsvHTML();
  b.innerHTML=h;
  b.querySelectorAll("[data-sutab]").forEach(x=>x.onclick=()=>{su.tab=x.dataset.sutab;su.step=0;suRender();});
  b.querySelectorAll("[data-sumode]").forEach(x=>x.onclick=()=>{su.mode=x.dataset.sumode;su.step=0;suRender();});
  if(su.tab==="smart"){su.mode==="quick"?suQuick():suGuided();}else suWireCsv();
}
function suNum(id,v){return `<div class="num"><button data-ss="-1" data-sf="${id}">&minus;</button><input type="number" id="${id}" value="${v}" min="0" max="60"><button data-ss="1" data-sf="${id}">+</button></div>`;}
function suBindNum(scope){scope.querySelectorAll("[data-ss]").forEach(x=>x.onclick=()=>{const i=document.getElementById(x.dataset.sf);i.value=Math.max(0,Math.min(60,(+i.value||0)+ +x.dataset.ss));});}

function suQuick(){
  const g=su.g,a=document.getElementById("suArea");
  a.innerHTML=`
    <div class="frow"><div class="sfield"><label>How many trucks / trailers?</label>${suNum("su_trucks",g.trucks)}</div>
      <div class="sfield"><label>How many crew / drivers?</label>${suNum("su_crew",g.crew)}</div></div>
    <div class="frow"><div class="sfield"><label>Base camp</label><input id="su_base" value="${esc(g.base)}"></div>
      <div class="sfield"><label>First location</label><input id="su_loc" value="${esc(g.loc)}"></div></div>
    <div class="frow"><div class="sfield"><label>Shoot date</label><input type="date" id="su_date" value="${g.date}"></div>
      <div class="sfield"><label>First roll-out</label><input type="time" id="su_roll" value="${g.roll}"></div></div>
    <div class="shint">Trucks get standard department types automatically. ${su.people.length?"Your imported names fill drivers &amp; crew in order.":"Drivers are named &ldquo;Driver 1, 2, 3&hellip;&rdquo; until you rename them in Fleet."}</div>`;
  suBindNum(a);
  document.getElementById("suFoot").innerHTML=`<div class="sp"></div><button class="btn" id="su_go">Generate board &rsaquo;</button>`;
  document.getElementById("su_go").onclick=()=>{suCapQuick();suApply();};
}
function suCapQuick(){const g=su.g,q=id=>document.getElementById(id);
  g.trucks=+q("su_trucks").value;g.crew=+q("su_crew").value;
  g.base=q("su_base").value.trim()||"Base Camp";g.loc=q("su_loc").value.trim()||"Location A";
  g.date=q("su_date").value||todayISO();g.roll=q("su_roll").value||"05:30";g.types=DEFAULT_TYPES;}

function suGuided(){
  const g=su.g,a=document.getElementById("suArea");
  const dots=`<div class="stepper">${SU_STEPS.map((_,i)=>`<div class="sdot ${i<su.step?"done":""} ${i===su.step?"on":""}"></div>`).join("")}</div>`;
  let inner="";
  if(su.step===0)inner=`<div class="sfield"><label>Step 1 &middot; How many trucks &amp; trailers?</label>${suNum("su_trucks",g.trucks)}</div>`;
  else if(su.step===1)inner=`<div class="sfield"><label>Step 2 &middot; Which types? (${g.trucks} trucks)</label><div class="checks" id="su_types">${DEFAULT_TYPES.map(k=>`<label class="chk ${g.types.includes(k)?"on":""}"><input type="checkbox" value="${k}" ${g.types.includes(k)?"checked":""}>${TYPES[k]}</label>`).join("")}</div></div>`;
  else if(su.step===2)inner=`<div class="sfield"><label>Step 3 &middot; How many crew / drivers?</label>${suNum("su_crew",g.crew)}</div>`;
  else if(su.step===3)inner=`<div class="frow"><div class="sfield"><label>Base camp</label><input id="su_base" value="${esc(g.base)}"></div><div class="sfield"><label>First location</label><input id="su_loc" value="${esc(g.loc)}"></div></div><div class="frow"><div class="sfield"><label>Shoot date</label><input type="date" id="su_date" value="${g.date}"></div><div class="sfield"><label>First roll-out</label><input type="time" id="su_roll" value="${g.roll}"></div></div>`;
  else{const ty=g.types.length?g.types:DEFAULT_TYPES;const drivers=Math.min(g.crew,g.trucks);inner=`<div class="review"><b>${g.trucks}</b> trucks &middot; <b>${ty.length}</b> types (${ty.map(k=>TYPES[k]).join(", ")}).<br><b>${g.crew}</b> crew &mdash; ${drivers} drivers, ${Math.max(0,g.crew-g.trucks)} extra crew.<br>From <b>${esc(g.base)}</b> &rarr; <b>${esc(g.loc)}</b>, first roll-out <b>${fmt12(g.roll)}</b> on ${g.date}.${su.people.length?`<br><span class="pill-note">&#10003; Names from your import</span>`:""}</div>`;}
  a.innerHTML=dots+inner;suBindNum(a);
  a.querySelectorAll("#su_types .chk input").forEach(cb=>cb.onchange=()=>cb.closest(".chk").classList.toggle("on",cb.checked));
  document.getElementById("suFoot").innerHTML=`${su.step>0?`<button class="btn ghost" id="su_back">&lsaquo; Back</button>`:""}<div class="sp"></div>${su.step<4?`<button class="btn" id="su_next">Next &rsaquo;</button>`:`<button class="btn" id="su_go">Generate board</button>`}`;
  const back=document.getElementById("su_back"),next=document.getElementById("su_next"),go=document.getElementById("su_go");
  if(back)back.onclick=()=>{suCapGuided();su.step--;suGuided();};
  if(next)next.onclick=()=>{suCapGuided();su.step++;suGuided();};
  if(go)go.onclick=()=>{suCapGuided();if(!su.g.types.length)su.g.types=DEFAULT_TYPES;suApply();};
}
function suCapGuided(){const g=su.g,q=id=>document.getElementById(id);
  if(q("su_trucks"))g.trucks=+q("su_trucks").value;
  if(q("su_crew"))g.crew=+q("su_crew").value;
  if(q("su_types"))g.types=[...q("su_types").querySelectorAll("input:checked")].map(c=>c.value);
  if(q("su_base"))g.base=q("su_base").value.trim()||"Base Camp";
  if(q("su_loc"))g.loc=q("su_loc").value.trim()||"Location A";
  if(q("su_date"))g.date=q("su_date").value||todayISO();
  if(q("su_roll"))g.roll=q("su_roll").value||"05:30";}

function suCsvHTML(){return `<div class="shint">Columns: <b>Name, Role, Phone</b> (header row optional). Imported names become your drivers &amp; crew.</div>
  <div class="csv-ex">Name, Role, Phone
Marcus Reed, Transpo Captain, 555-0182
Danny Ortiz, Driver, 555-0143</div>
  <div class="sfield"><label>Paste CSV</label><textarea id="su_csv" placeholder="Name, Role, Phone&#10;Jane Doe, Driver, 555-0100">${esc(su._csv)}</textarea></div>
  <div><button class="btn ghost" id="su_fbtn">&#8593; Upload .csv</button><input type="file" id="su_file" accept=".csv" hidden></div>
  <div class="shint" id="su_cstat"></div>`;}
function suWireCsv(){
  const csv=document.getElementById("su_csv"),file=document.getElementById("su_file"),fbtn=document.getElementById("su_fbtn");
  fbtn.onclick=()=>file.click();
  file.onchange=()=>{const f=file.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{csv.value=r.result;su._csv=r.result;suCsvPrev();};r.readAsText(f);};
  csv.oninput=()=>{su._csv=csv.value;suCsvPrev();};
  document.getElementById("suFoot").innerHTML=`<div class="sp"></div><button class="btn" id="su_use">Use these names &rsaquo;</button>`;
  document.getElementById("su_use").onclick=()=>{
    const rows=suParseCSV(csv.value);if(!rows.length){alert("Add at least one name to import.");return;}
    su.people=rows;su.g.crew=Math.max(su.g.crew,su.people.length);
    su.tab="smart";su.mode="quick";su.step=0;suRender();
  };
  suCsvPrev();
}
function suCsvPrev(){const el=document.getElementById("su_cstat");if(!el)return;const rows=suParseCSV(document.getElementById("su_csv").value);el.innerHTML=rows.length?`Ready to import <b>${rows.length}</b>: ${esc(rows.slice(0,5).map(r=>r.name).join(", "))}${rows.length>5?"&hellip;":""}`:"";}
function suParseCSV(text){
  if(!text||!text.trim())return[];
  const lines=text.replace(/\r/g,"").split("\n").filter(l=>l.trim());
  const rows=lines.map(suSplitLine);let start=0,idx={name:0,role:1,phone:2};
  const h=rows[0].map(x=>x.toLowerCase());
  if(h.some(x=>x.includes("name"))){start=1;h.forEach((x,i)=>{if(x.includes("name"))idx.name=i;else if(x.includes("role")||x.includes("title"))idx.role=i;else if(x.includes("phone")||x.includes("cell"))idx.phone=i;});}
  const out=[];for(let i=start;i<rows.length;i++){const n=(rows[i][idx.name]||"").trim();if(n)out.push({name:n,role:(rows[i][idx.role]||"").trim(),phone:(rows[i][idx.phone]||"").trim()});}
  return out;
}
function suSplitLine(l){const r=[];let c="",q=false;for(let i=0;i<l.length;i++){const ch=l[i];if(q){if(ch==='"'){if(l[i+1]==='"'){c+='"';i++;}else q=false;}else c+=ch;}else{if(ch===',')  {r.push(c);c="";}else if(ch==='"')q=true;else c+=ch;}}r.push(c);return r.map(s=>s.trim());}

/* ============ HELPERS ============ */
function truckById(id){return DB.fleet.find(t=>t.id===id);}
function fmtDateLong(isoStr){const d=new Date(isoStr+"T00:00:00");return `${DOW[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`;}
function nowMinutes(){const n=new Date();return n.getHours()*60+n.getMinutes();}
function toMin(t){if(!t)return null;const[h,m]=t.split(":").map(Number);return h*60+m;}
function esc(s){return(s==null?"":String(s)).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function fmt12(t){if(!t)return"";let[h,m]=t.split(":").map(Number);const suf=h>=12?"PM":"AM";h=h%12||12;return `${h}:${String(m).padStart(2,"0")} ${suf}`;}
function hrsMin(min){min=Math.max(0,Math.round(min));const h=Math.floor(min/60),m=min%60;if(h===0)return`${m}m`;return m?`${h}h ${m}m`:`${h}h`;}
function fuelClass(f){if(f==null)return"";if(f<=FUEL_CRIT)return"crit";if(f<=FUEL_WARN)return"low";return"";}

function onboard(){
  return `<div class="empty" style="margin-top:10px">
    <div style="font-family:var(--disp);font-size:22px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px">Empty board</div>
    <p style="max-width:460px;margin:0 auto 18px;color:var(--ink-soft)">Generate a full fleet and crew in one pass with the setup wizard, or add trucks one at a time.</p>
    <button class="btn" data-opensetup>&#9889; Set up board</button>
    <div style="margin-top:14px"><button class="btn ghost" data-newtruck>Add a truck manually</button> <button class="btn ghost" data-loadsample>Load sample data</button></div>
  </div>`;
}

/* ============ INTELLIGENCE ENGINE ============ */
// per-driver span across a day: earliest roll -> latest wrap
function driverSpans(dateStr){
  const dayMoves=DB.moves[dateStr]||{};
  const map={};
  Object.keys(dayMoves).forEach(tid=>{
    const t=truckById(tid);if(!t||!t.driver||!t.driver.trim())return;
    const m=dayMoves[tid];const r=toMin(m.roll),w=toMin(m.wrap);
    if(r==null&&w==null)return;
    const d=map[t.driver]=map[t.driver]||{start:Infinity,end:-Infinity,trucks:[]};
    if(r!=null)d.start=Math.min(d.start,r);
    if(w!=null)d.end=Math.max(d.end,w);
    d.trucks.push(t.name);
  });
  Object.values(map).forEach(d=>{d.span=(d.end>d.start)?d.end-d.start:0;});
  return map;
}
// rest between prior day's latest wrap and this day's earliest roll (minutes)
function turnaround(dateStr,driver){
  const prev=driverSpans(addDays(dateStr,-1))[driver];
  const cur=driverSpans(dateStr)[driver];
  if(!prev||!cur||prev.end<0||cur.start===Infinity)return null;
  return (24*60-prev.end)+cur.start;
}
// feasibility of a single move: can it reach call given drive time?
function feasibility(m){
  if(!m||m.drive==null||!m.roll||!m.call)return null;
  const window=toMin(m.call)-toMin(m.roll);
  const slack=window-m.drive;
  if(slack<0)return{sev:"c",slack,msg:`late for call by ${hrsMin(-slack)}`};
  if(slack<15)return{sev:"w",slack,msg:`tight — ${slack}m to spare before call`};
  return{sev:"ok",slack,msg:`${hrsMin(slack)} buffer before call`};
}

// full prioritized conflict list for a date
function conflicts(dateStr){
  const out=[];
  const dayMoves=DB.moves[dateStr]||{};
  const push=(sev,msg)=>out.push({sev,msg});

  // driver double-booking (overlapping roll->wrap windows on distinct trucks)
  const byDriver={};
  Object.keys(dayMoves).forEach(tid=>{
    const t=truckById(tid);if(!t||!t.driver)return;
    (byDriver[t.driver]=byDriver[t.driver]||[]).push({t,m:dayMoves[tid]});
  });
  Object.keys(byDriver).forEach(drv=>{
    const list=byDriver[drv];if(list.length<2)return;
    for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
      const a=list[i],b=list[j];
      const as=toMin(a.m.roll),ae=toMin(a.m.wrap),bs=toMin(b.m.roll),be=toMin(b.m.wrap);
      const overlap=(as==null||bs==null)?true:(as<(be??1e9)&&bs<(ae??1e9));
      if(overlap)push("c",`<b>${esc(drv)}</b> is booked on two units at once — ${esc(a.t.name)} &amp; ${esc(b.t.name)}.`);
    }
  });
  // no driver on a scheduled unit
  Object.keys(dayMoves).forEach(tid=>{
    const t=truckById(tid);if(!t)return;
    if(!t.driver||!t.driver.trim())push("c",`<b>${esc(t.name)}</b> has a move but no driver assigned.`);
  });
  // missing destination / roll-out
  Object.keys(dayMoves).forEach(tid=>{
    const t=truckById(tid);if(!t)return;const m=dayMoves[tid];const gaps=[];
    if(!m.to||!m.to.trim())gaps.push("destination");
    if(!m.roll)gaps.push("roll-out time");
    if(gaps.length)push("w",`<b>${esc(t.name)}</b> move is missing ${gaps.join(" &amp; ")}.`);
  });
  // feasibility — won't make call
  Object.keys(dayMoves).forEach(tid=>{
    const t=truckById(tid);if(!t)return;const f=feasibility(dayMoves[tid]);
    if(f&&f.sev==="c")push("c",`<b>${esc(t.name)}</b> can't make its call — ${esc(f.msg)}.`);
    else if(f&&f.sev==="w")push("i",`<b>${esc(t.name)}</b> transit is tight — ${esc(f.msg)}.`);
  });
  // fuel
  Object.keys(dayMoves).forEach(tid=>{
    const t=truckById(tid);if(!t||t.fuel==null)return;
    if(t.fuel<=FUEL_CRIT)push("c",`<b>${esc(t.name)}</b> is rolling on ${t.fuel}% fuel — fuel before roll-out.`);
    else if(t.fuel<=FUEL_WARN)push("w",`<b>${esc(t.name)}</b> low on fuel (${t.fuel}%) — top off this AM.`);
  });
  // driver fatigue (span)
  const spans=driverSpans(dateStr);
  Object.keys(spans).forEach(drv=>{
    const s=spans[drv];if(!s.span)return;
    if(s.span>=SPAN_CRIT)push("c",`<b>${esc(drv)}</b> is scheduled a ${hrsMin(s.span)} day — over the 14h limit.`);
    else if(s.span>=SPAN_WARN)push("w",`<b>${esc(drv)}</b> is on a ${hrsMin(s.span)} day — approaching the limit.`);
  });
  // turnaround from prior day
  Object.keys(spans).forEach(drv=>{
    const rest=turnaround(dateStr,drv);if(rest==null)return;
    if(rest<REST_CRIT)push("c",`<b>${esc(drv)}</b> has only ${hrsMin(rest)} rest since yesterday's wrap.`);
    else if(rest<REST_WARN)push("w",`<b>${esc(drv)}</b> has ${hrsMin(rest)} turnaround from yesterday — under 10h.`);
  });

  const rank={c:0,w:1,i:2};
  out.sort((a,b)=>rank[a.sev]-rank[b.sev]);
  return out;
}

function severityOf(list){
  if(list.some(c=>c.sev==="c"))return"crit";
  if(list.some(c=>c.sev==="w"))return"warn";
  if(list.length)return"warn";
  return"ok";
}

/* ============ ALERTS ============ */
let alertsOpen=false;      // is the flag list expanded?
let alertFilter=null;      // 'c' | 'w' | 'i' | null(all)
function renderAlerts(){
  const bar=document.getElementById("alertBar");
  const list=conflicts(curDate);
  if(!list.length){
    alertsOpen=false;alertFilter=null;
    bar.innerHTML=`<div class="alerts sev-ok"><div class="ah">&#10003; All clear for ${esc(fmtDateLong(curDate))}<span class="sevcounts"><span style="font-family:var(--mono);font-weight:600;color:var(--green);font-size:11.5px">No open flags</span></span></div></div>`;
    return;
  }
  const c=list.filter(x=>x.sev==="c").length, w=list.filter(x=>x.sev==="w").length, i=list.filter(x=>x.sev==="i").length;
  const pill=(sev,n,label,cls)=>n?`<button class="sevpill ${cls} ${alertFilter===sev?"sel":""}" data-sev="${sev}" title="Show only these">${n} ${label}</button>`:"";
  const allPill=`<button class="sevpill all ${alertsOpen&&!alertFilter?"sel":""}" data-sev="all" title="Show all flags">${list.length} all</button>`;
  const counts=allPill+pill("c",c,"critical","c")+pill("w",w,"warning","w")+pill("i",i,"watch","i");
  const chevron=`<button class="alerttoggle" data-alerttoggle>${alertsOpen&&!alertFilter?"&#9650; Hide":`&#9660; ${list.length} flag${list.length>1?"s":""}`}</button>`;
  let bodyHTML="";
  if(alertsOpen){
    const shown=alertFilter?list.filter(x=>x.sev===alertFilter):list;
    bodyHTML=shown.length
      ?`<ul>${shown.map(x=>`<li class="${x.sev}"><span class="tick">&#9656;</span><span>${x.msg}</span></li>`).join("")}</ul>`
      :`<ul><li class="i" style="opacity:.7"><span class="tick">&#9656;</span><span>No flags at this level right now.</span></li></ul>`;
  }
  bar.innerHTML=`<div class="alerts sev-${severityOf(list)}">
    <div class="ah">&#9888; Dispatch flags &middot; ${esc(fmtDateLong(curDate))}<span class="sevcounts">${counts}${chevron}</span></div>
    ${bodyHTML}
  </div>`;
  // wiring — clicking a severity bubble toggles that filter open/closed
  bar.querySelectorAll("[data-sev]").forEach(b=>b.onclick=()=>{
    const s=b.dataset.sev;
    if(s==="all"){ if(alertsOpen&&!alertFilter){alertsOpen=false;}else{alertsOpen=true;alertFilter=null;} }
    else if(alertsOpen&&alertFilter===s){alertsOpen=false;alertFilter=null;}
    else{alertsOpen=true;alertFilter=s;}
    renderAlerts();
  });
  const tg=bar.querySelector("[data-alerttoggle]");
  if(tg)tg.onclick=()=>{ if(alertsOpen&&!alertFilter){alertsOpen=false;}else{alertsOpen=true;alertFilter=null;} renderAlerts(); };
}

function updateNavCounts(){
  const list=conflicts(curDate);
  const crit=list.filter(x=>x.sev==="c").length;
  document.querySelectorAll("nav button.tab").forEach(b=>{
    b.classList.toggle("active",b.dataset.view===view);
    const old=b.querySelector(".cnt");if(old)old.remove();
    if(b.dataset.view==="daily"&&list.length){
      const s=document.createElement("span");
      s.className="cnt"+(crit?" bad":"");
      s.textContent=list.length;b.appendChild(s);
    }
  });
}

/* ============ NEXT MOVE DUE (today only) ============ */
function nextDueTruckId(){
  if(curDate!==todayISO())return null;
  const dayMoves=DB.moves[curDate]||{};
  const now=nowMinutes();let best=null,bestT=Infinity;
  Object.keys(dayMoves).forEach(tid=>{
    const m=dayMoves[tid];if(m.status==="wrapped")return;
    const r=toMin(m.roll);if(r==null)return;
    if(r>=now&&r<bestT){bestT=r;best=tid;}
  });
  return best;
}

/* ============ RENDER ============ */
function render(){
  const app=document.getElementById("app");
  if(view==="setup"){
    document.getElementById("alertBar").innerHTML="";
    document.querySelectorAll("nav button.tab").forEach(b=>{b.classList.remove("active");const c=b.querySelector(".cnt");if(c)c.remove();});
    app.innerHTML=viewSetup();wireSetup();return;
  }
  renderAlerts();
  updateNavCounts();
  if(view==="daily")app.innerHTML=viewDaily();
  else if(view==="week")app.innerHTML=viewWeek();
  else if(view==="crew")app.innerHTML=viewCrew();
  else if(view==="fleet")app.innerHTML=viewFleet();
  wire();
  if(view==="daily")positionNow();
}

/* ---- flight deck stats ---- */
function deckHTML(){
  const dayMoves=DB.moves[curDate]||{};
  const ids=Object.keys(dayMoves);
  const rolling=ids.filter(id=>dayMoves[id].roll).length;
  const crewTotal=ids.reduce((s,id)=>s+(dayMoves[id].crew||0),0);
  const spans=driverSpans(curDate);
  let longest=0,longestDrv="—";
  Object.keys(spans).forEach(d=>{if(spans[d].span>longest){longest=spans[d].span;longestDrv=d;}});
  const list=conflicts(curDate);
  const crit=list.filter(x=>x.sev==="c").length, warn=list.filter(x=>x.sev==="w").length;
  // next roll-out
  let nextTxt="—",nextSub="all rolled or none set";
  const due=nextDueTruckId();
  if(due){const m=dayMoves[due];const mins=toMin(m.roll)-nowMinutes();
    nextTxt=fmt12(m.roll);
    nextSub=(mins>0?`${truckById(due).name} in ${hrsMin(mins)}`:`${truckById(due).name} now`);
  }else if(ids.length){
    const first=ids.filter(id=>dayMoves[id].roll).sort((a,b)=>toMin(dayMoves[a].roll)-toMin(dayMoves[b].roll))[0];
    if(first){nextTxt=fmt12(dayMoves[first].roll);nextSub=`first roll · ${truckById(first).name}`;}
  }
  const longClass=longest>=SPAN_CRIT?"accent-r":longest>=SPAN_WARN?"accent-a":"accent-g";
  const flagClass=crit?"accent-r":warn?"accent-a":"accent-g";
  const stats=[
    {c:"accent-o",k:"Units rolling",v:`${rolling}<small> / ${DB.fleet.length}</small>`,s:"scheduled today"},
    {c:"accent-b",k:curDate===todayISO()?"Next roll-out":"First roll-out",v:nextTxt,s:nextSub},
    {c:"accent-g",k:"Crew on the day",v:`${crewTotal}`,s:"seats across all units"},
    {c:longClass,k:"Longest driver day",v:longest?hrsMin(longest):"—",s:longest?esc(longestDrv):"no spans set"},
    {c:flagClass,k:"Open flags",v:`${list.length}`,s:crit?`${crit} critical`:warn?`${warn} warning`:"all clear"}
  ];
  return `<div class="deck">${stats.map(x=>`<div class="stat ${x.c}"><div class="k">${x.k}</div><div class="v">${x.v}</div><div class="sub">${x.s}</div></div>`).join("")}</div>`;
}

/* ---- timeline window ---- */
function tlWindow(dayMoves){
  let lo=Infinity,hi=-Infinity;
  Object.values(dayMoves).forEach(m=>{const r=toMin(m.roll),w=toMin(m.wrap);if(r!=null)lo=Math.min(lo,r);if(w!=null)hi=Math.max(hi,w);});
  if(lo===Infinity){lo=4*60;hi=22*60;}
  lo=Math.floor((lo-45)/60)*60; hi=Math.ceil((hi+45)/60)*60;
  lo=Math.max(0,lo); hi=Math.min(24*60,Math.max(hi,lo+180));
  return{lo,hi,span:hi-lo};
}

function timelineHTML(){
  const dayMoves=DB.moves[curDate]||{};
  const ids=Object.keys(dayMoves).filter(id=>toMin(dayMoves[id].roll)!=null)
    .sort((a,b)=>toMin(dayMoves[a].roll)-toMin(dayMoves[b].roll));
  const legend=`<div class="lg">
    <span><i style="background:#b3a582"></i>Staged</span>
    <span><i style="background:#2C5C9E"></i>En route</span>
    <span><i style="background:#DC5A2A"></i>On location</span>
    <span><i style="background:#2E7D4F"></i>Wrapped</span>
    <span><i style="background:repeating-linear-gradient(45deg,#555,#555 3px,transparent 3px,transparent 6px)"></i>Transit</span>
  </div>`;
  if(!ids.length){
    return `<div class="tlwrap"><div class="tlhead"><div class="tt">&#9202; Day Timeline</div>${legend}</div>
      <div class="tl-empty">No timed moves yet. Add a move with a roll-out time to see it on the timeline.</div></div>`;
  }
  const {lo,hi,span}=tlWindow(dayMoves);
  const pct=min=>((min-lo)/span*100);
  // hour gridlines
  let gl="";
  for(let h=Math.ceil(lo/60)*60;h<=hi;h+=60){
    const x=pct(h);
    gl+=`<div class="gl" style="left:${x}%"></div><div class="gllab" style="left:${x}%">${String((h/60)%24).padStart(2,"0")}:00</div>`;
  }
  const isToday=curDate===todayISO();
  const now=nowMinutes();
  const showNow=isToday&&now>=lo&&now<=hi;
  const nowPct=pct(now);

  const rows=ids.map(id=>{
    const t=truckById(id),m=dayMoves[id];
    const r=toMin(m.roll),w=toMin(m.wrap)??(r+120);
    const left=pct(r),width=Math.max(pct(w)-pct(r),3.5);
    const f=feasibility(m);
    const transitW=(m.drive!=null&&span)?(m.drive/span*100):0;
    const callX=(m.call!=null&&toMin(m.call)!=null)?pct(toMin(m.call)):null;
    const to=(m.to&&m.to.trim())?esc(m.to):"— set dest —";
    const noDrv=!t.driver||!t.driver.trim();
    const sub=noDrv?`<span class="dv warn">&#9888; no driver</span>`:`<div class="dv">${esc(t.driver)}</div>`;
    const nowCol=showNow?`<div class="nowcol" style="left:${nowPct}%"></div>`:"";
    return `<div class="tlrow">
      <div class="rl"><div class="nm">${esc(t.name)}</div>${sub}</div>
      <div class="track">
        ${gl}
        ${nowCol}
        ${callX!=null?`<div class="callmark" style="left:${callX}%"></div>`:""}
        ${(m.stops||[]).map(s=>{const sx=toMin(s.t);return (sx!=null&&sx>=lo&&sx<=hi)?`<div class="stopdot" style="left:${pct(sx)}%" title="${esc(fmt12(s.t))} · ${esc(s.p||"stop")}"></div>`:"";}).join("")}
        <div class="bar s-${m.status} ${f&&f.sev==="c"?"late":""}" data-editmove="${id}" style="left:${left}%;width:${width}%"
             title="${esc(t.name)} · ${fmt12(m.roll)}→${fmt12(m.wrap)||"?"} · ${esc(m.from)||"?"} → ${to}${(m.stops||[]).map(s=>" → "+esc(s.p||"stop")).join("")}${f?" · "+esc(f.msg):""}">
          ${transitW>0?`<div class="transit" style="width:${Math.min(transitW/width*100,100)}%"></div>`:""}
          <span class="btime">${fmt12(m.roll)}</span><span class="bto">${to}</span>
        </div>
      </div>
    </div>`;
  }).join("");

  return `<div class="tlwrap">
    <div class="tlhead"><div class="tt">&#9202; Day Timeline${showNow?` &middot; <span style="color:#E5732E">live</span>`:""}</div>${legend}</div>
    <div class="tlbody" id="tlbody">${rows}</div>
  </div>`;
}

function positionNow(){/* handled inline; live tick re-renders row cols */}

function viewDaily(){
  if(!DB.fleet.length)return onboard();
  const dayMoves=DB.moves[curDate]||{};
  const due=nextDueTruckId();
  const filters=["all",...STATUS_ORDER];
  const chips=filters.map(f=>{
    const dot=f==="all"?"":`<span class="dotc" style="background:${STATUS_COLOR[f]}"></span>`;
    return `<span class="chip ${filter===f?"active":""}" data-filter="${f}">${dot}${f==="all"?"All":STATUS[f]}</span>`;
  }).join("");
  let ids=Object.keys(dayMoves);
  if(filter!=="all")ids=ids.filter(id=>dayMoves[id].status===filter);
  ids.sort((a,b)=>(toMin(dayMoves[a].roll)??1e9)-(toMin(dayMoves[b].roll)??1e9));
  const cards=ids.length?ids.map((id,i)=>cardHTML(id,dayMoves[id],id===due,i)).join(""):
    `<div class="empty">No moves ${filter!=="all"?"in this status":"scheduled for this day"}.<br><br><button class="btn" data-newmove>+ Add a move</button></div>`;
  const live=curDate===todayISO();
  return `
    <div class="toolbar">
      <div class="datestep">
        <button class="arrow" data-nav="-1">&lsaquo;</button>
        <div class="curdate">${esc(fmtDateLong(curDate))}<small class="${live?"live":""}">${live?"Today · Shoot Day":curDate}</small></div>
        <button class="arrow" data-nav="1">&rsaquo;</button>
        <button class="btn ghost" data-today>Today</button>
      </div>
      <div class="filters">${chips}
        <button class="btn ghost" data-newmove>+ Move</button>
        <button class="btn" onclick="window.print()">Print Call Sheet</button>
      </div>
    </div>
    ${deckHTML()}
    ${timelineHTML()}
    <div class="subhdr">Unit Detail</div>
    <div class="grid">${cards}</div>
    <div class="footer-note">Tap a status pill to advance it &middot; tap a timeline bar or hover a card to edit &middot; everything saves on this device</div>`;
}

function cardHTML(id,m,isDue,i){
  const t=truckById(id);if(!t)return"";
  const noDriver=!t.driver||!t.driver.trim();
  const toStr=(m.to&&m.to.trim())?`<b>${esc(m.to)}</b>`:`<b class="missing">— set destination —</b>`;
  const rollStr=m.roll?esc(fmt12(m.roll)):`<span class="missing">--:--</span>`;
  // per-card flags
  const flags=[];
  const f=feasibility(m);
  if(f&&f.sev==="c")flags.push(`<span class="flg c">&#9888; ${esc(f.msg)}</span>`);
  else if(f&&f.sev==="w")flags.push(`<span class="flg w">&#9201; ${esc(f.msg)}</span>`);
  else if(f&&f.sev==="ok")flags.push(`<span class="flg ok">&#10003; ${esc(f.msg)}</span>`);
  if(t.fuel!=null&&t.fuel<=FUEL_CRIT)flags.push(`<span class="flg c">&#9832; fuel ${t.fuel}%</span>`);
  else if(t.fuel!=null&&t.fuel<=FUEL_WARN)flags.push(`<span class="flg w">&#9832; low fuel</span>`);
  const spans=driverSpans(curDate);
  if(!noDriver&&spans[t.driver]){const sp=spans[t.driver].span;
    if(sp>=SPAN_CRIT)flags.push(`<span class="flg c">&#9201; ${hrsMin(sp)} day</span>`);
    else if(sp>=SPAN_WARN)flags.push(`<span class="flg w">&#9201; ${hrsMin(sp)} day</span>`);
  }
  const fc=fuelClass(t.fuel);
  const fuelHTML=t.fuel!=null?`<div class="fuel"><div class="fbar"><i class="${fc}" style="width:${t.fuel}%"></i></div><span class="fl">${t.fuel}%</span></div>`:`<div class="crew" style="color:var(--gray)">${m.crew!=null?m.crew:"—"} crew</div>`;
  return `<div class="card ${isDue?"due":""}" style="animation-delay:${Math.min(i,10)*45}ms">
    ${isDue?`<div class="duetag">Next up</div>`:""}
    <button class="btn ghost edit" data-editmove="${id}">Edit</button>
    <div class="ct">
      <div>
        <div class="tname">${esc(t.name)}</div>
        <div class="ttype">${esc(t.type)}</div>
        <div class="unit">${esc(t.unit)}</div>
      </div>
      <span class="pill ${m.status}" data-cycle="${id}"><span class="pd"></span>${STATUS[m.status]}</span>
    </div>
    <div class="route">
      <div class="loc"><small>From</small><b>${esc(m.from)||"—"}</b></div>
      <div class="arrw">&rarr;</div>
      <div class="loc"><small>To</small>${toStr}</div>
    </div>
    <div class="times">
      <div><small>Roll-out</small><b>${rollStr}</b></div>
      <div><small>On-set</small><b>${m.call?esc(fmt12(m.call)):"--:--"}</b></div>
      <div><small>Wrap</small><b>${m.wrap?esc(fmt12(m.wrap)):"--:--"}</b></div>
    </div>
    ${(m.stops&&m.stops.length)?`<div class="itin">${m.stops.map(s=>`<span class="istop">${esc(fmt12(s.t))||"--:--"} · ${s.p?esc(s.p):`<span class="missing">stop</span>`}</span>`).join("")}</div>`:""}
    <div class="flags">${flags.join("")}</div>
    <div class="cfoot">
      <div class="driver">&#128666; ${noDriver?`<span class="warn">No driver &#9888;</span>`:esc(t.driver)}</div>
      ${fuelHTML}
    </div>
  </div>`;
}

/* ============ WEEK ============ */
function viewWeek(){
  if(!DB.fleet.length)return onboard();
  const d=new Date(curDate+"T00:00:00");
  const start=addDays(curDate,-d.getDay());
  const days=[...Array(7)].map((_,i)=>addDays(start,i));
  const head=days.map(dd=>{
    const dt=new Date(dd+"T00:00:00");
    const cnt=Object.keys(DB.moves[dd]||{}).length;
    return `<th class="${dd===todayISO()?"today":""}">${DOW[dt.getDay()]}<small>${MON[dt.getMonth()].slice(0,3)} ${dt.getDate()} · ${cnt} mv</small></th>`;
  }).join("");
  const rows=DB.fleet.map(t=>{
    const sub=[t.type,(t.driver&&t.driver.trim())?t.driver:"⚠ no driver"].filter(Boolean).join(" · ");
    const cells=days.map(dd=>{
      const m=(DB.moves[dd]||{})[t.id];
      if(!m)return `<td class="dropcell" data-drop="${t.id}|${dd}"><span class="wblank" data-cell="${t.id}|${dd}">+</span></td>`;
      const stop1=(m.to&&m.to.trim())?esc(m.to):`<span class="missing">set dest</span>`;
      let legs=`<div class="wleg"><span class="lt">${fmt12(m.roll)||"--:--"}</span><span class="lp">${stop1}</span></div>`;
      (m.stops||[]).forEach(s=>{legs+=`<div class="wleg"><span class="lt">${fmt12(s.t)||"--:--"}</span><span class="lp">${s.p?esc(s.p):`<span class="missing">stop</span>`}</span></div>`;});
      if(m.wrap)legs+=`<div class="wleg park"><span class="lt">${fmt12(m.wrap)}</span><span class="lp">&#8962; parked</span></div>`;
      return `<td class="dropcell" data-drop="${t.id}|${dd}">
        <span class="wchip cs-${m.status}" draggable="true" data-drag="${t.id}|${dd}" title="Drag to another day · click to edit">
          <span class="grip">&#10303;</span>
          ${legs}
        </span></td>`;
    }).join("");
    return `<tr><th class="rowhead">${esc(t.name)}<br><span style="font-weight:400;font-size:10px;color:var(--gray)">${esc(sub)}</span></th>${cells}</tr>`;
  }).join("");
  return `
    <div class="toolbar">
      <div class="datestep">
        <button class="arrow" data-nav="-7">&lsaquo;</button>
        <div class="curdate">Week of ${esc(fmtDateLong(start))}<small>${start} → ${addDays(start,6)}</small></div>
        <button class="arrow" data-nav="7">&rsaquo;</button>
        <button class="btn ghost" data-today>This Week</button>
      </div>
      <div class="filters"><button class="btn" onclick="window.print()">Print</button></div>
    </div>
    <div class="weekwrap"><table class="week">
      <thead><tr><th class="rowhead">Unit</th>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <div class="footer-note">Drag a move chip to another day to reschedule &middot; click a chip to edit &middot; click + on an empty day to add</div>`;
}

/* ============ CREW & HOURS ============ */
function personById(id){return (DB.people||[]).find(p=>p.id===id);}
function personPhone(name){const p=(DB.people||[]).find(x=>x.name===name);return p&&p.phone?p.phone:"";}
function telHref(phone){return "tel:"+String(phone).replace(/[^0-9+]/g,"");}
// where is this person assigned on the current date?
function personToday(name){
  const dm=DB.moves[curDate]||{};let fallback=null;
  for(const t of DB.fleet){
    const isDriver=t.driver&&t.driver.trim()===name;
    const isCrew=(t.crew||[]).includes(name);
    if(isDriver||isCrew){
      if(dm[t.id])return {role:isDriver?"Driver":"Crew",unit:t.name,roll:dm[t.id].roll};
      if(!fallback)fallback={role:isDriver?"Driver":"Crew",unit:t.name,roll:null};
    }
  }
  return fallback;
}
function viewCrew(){
  if(!DB.fleet.length)return onboard();
  const spans=driverSpans(curDate);
  // --- contact roster / call-down list ---
  const roster=(DB.people||[]).slice().sort((a,b)=>{
    const ra=a.role==="Driver"?0:1,rb=b.role==="Driver"?0:1;return ra-rb||a.name.localeCompare(b.name);
  });
  const rrows=roster.map(p=>{
    const a=personToday(p.name);
    const assign=a?`${esc(a.unit)}${a.roll?` <span style="color:var(--gray)">· roll ${esc(fmt12(a.roll))}</span>`:` <span style="color:var(--gray)">· not rolling</span>`}`:`<span style="color:var(--gray)">unassigned</span>`;
    const phone=p.phone?`<a href="${telHref(p.phone)}" style="color:var(--blue);font-variant-numeric:tabular-nums;text-decoration:none">&#128222; ${esc(p.phone)}</a>`:`<span style="color:var(--gray)">— add —</span>`;
    return `<tr>
      <td><b>${esc(p.name)}</b></td>
      <td>${esc(p.role)||"—"}</td>
      <td>${phone}</td>
      <td style="font-size:12px">${assign}</td>
      <td><button class="btn ghost" data-editperson="${p.id}">Edit</button></td>
    </tr>`;
  }).join("")||`<tr><td colspan="5" style="text-align:center;padding:26px;color:var(--ink-soft)">No contacts yet. Click <b>+ Person</b> to build your call-down list.</td></tr>`;
  const rosterBlock=`
    <div class="subhdr">Call-Down List &middot; ${roster.length} people</div>
    <div class="fleetwrap" style="margin-bottom:22px"><table class="fleet">
      <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>On today</th><th></th></tr></thead>
      <tbody>${rrows}</tbody>
    </table></div>`;
  // --- per-unit assignment + hours cards ---
  const cards=DB.fleet.map(t=>{
    const driverRow=`<div class="person"><span class="badge ${t.driver?"driver":"none"}">${t.driver?"Driver":"No driver"}</span>${t.driver?esc(t.driver):`<span class="missing">needs assignment</span>`}${t.driver&&personPhone(t.driver)?` <a href="${telHref(personPhone(t.driver))}" style="margin-left:auto;color:var(--blue);text-decoration:none;font-size:11px">&#128222;</a>`:""}</div>`;
    const crewRows=(t.crew||[]).map(c=>`<div class="person"><span class="badge crew">Crew</span>${esc(c)}${personPhone(c)?` <a href="${telHref(personPhone(c))}" style="margin-left:auto;color:var(--blue);text-decoration:none;font-size:11px">&#128222;</a>`:""}</div>`).join("");
    let hours="";
    if(t.driver&&spans[t.driver]&&spans[t.driver].span){
      const s=spans[t.driver],cls=s.span>=SPAN_CRIT?"c":s.span>=SPAN_WARN?"w":"";
      const rest=turnaround(curDate,t.driver);
      const rcls=rest!=null?(rest<REST_CRIT?"c":rest<REST_WARN?"w":""):"";
      const w=Math.min(s.span/SPAN_CRIT*100,100);
      hours=`<div class="hours">
        <div class="hrow"><span class="lab">Scheduled day</span><span class="val ${cls}">${hrsMin(s.span)}</span></div>
        <div class="hbar"><i class="${cls}" style="width:${w}%"></i></div>
        ${rest!=null?`<div class="hrow" style="margin-top:6px"><span class="lab">Rest since yesterday</span><span class="val ${rcls}">${hrsMin(rest)}</span></div>`:""}
      </div>`;
    }
    return `<div class="rcard">
      <h4>${esc(t.name)}</h4>
      <div class="rtype">${esc(t.type)} · ${esc(t.unit)}</div>
      ${driverRow}${crewRows||`<div class="person"><span class="badge crew">Crew</span><span style="color:var(--gray)">—</span></div>`}
      ${hours}
    </div>`;
  }).join("");
  const noDriver=DB.fleet.filter(t=>!t.driver||!t.driver.trim());
  const fatigued=Object.keys(spans).filter(d=>spans[d].span>=SPAN_WARN);
  let banner="";
  if(noDriver.length||fatigued.length){
    const items=[
      ...noDriver.map(t=>`<li class="c"><span class="tick">&#9656;</span>${esc(t.name)} has no driver</li>`),
      ...fatigued.map(d=>`<li class="${spans[d].span>=SPAN_CRIT?"c":"w"}"><span class="tick">&#9656;</span>${esc(d)} on a ${hrsMin(spans[d].span)} day</li>`)
    ].join("");
    banner=`<div class="alerts sev-${noDriver.length||fatigued.some(d=>spans[d].span>=SPAN_CRIT)?"crit":"warn"}" style="margin:0 0 16px;border:2px solid;border-radius:var(--rad);padding:12px 16px"><div class="ah">&#9888; Staffing &amp; hours &middot; ${esc(fmtDateLong(curDate))}</div><ul>${items}</ul></div>`;
  }
  return `<div class="toolbar">
      <div class="datestep">
        <button class="arrow" data-nav="-1">&lsaquo;</button>
        <div class="curdate" style="min-width:210px">Crew &amp; Hours<small>${esc(fmtDateLong(curDate))}</small></div>
        <button class="arrow" data-nav="1">&rsaquo;</button>
        <button class="btn ghost" data-today>Today</button>
      </div>
      <div class="filters">
        <button class="btn ghost" data-newperson>+ Person</button>
        <button class="btn ghost" onclick="window.print()">Print Call-Down</button>
        <button class="btn ghost" data-view-switch="fleet">Manage in Fleet →</button>
      </div>
    </div>${banner}${rosterBlock}<div class="subhdr">By Unit</div><div class="roster">${cards}</div>`;
}

/* ============ FLEET ============ */
function viewFleet(){
  const rows=DB.fleet.map(t=>{
    const noDriver=!t.driver||!t.driver.trim();
    const fc=fuelClass(t.fuel);
    const fuel=t.fuel!=null?`<div class="minifuel"><div class="fbar"><i class="${fc}" style="width:${t.fuel}%"></i></div>${t.fuel}%</div>`:"—";
    return `<tr>
      <td><b>${esc(t.name)}</b><br><span style="color:var(--gray);font-size:11px">${esc(t.type)}</span></td>
      <td style="font-variant-numeric:tabular-nums">${esc(t.unit)||"—"}</td>
      <td>${noDriver?`<span class="flag">⚠ unassigned</span>`:esc(t.driver)}</td>
      <td>${fuel}</td>
      <td style="font-variant-numeric:tabular-nums">${t.odo!=null?Number(t.odo).toLocaleString()+" mi":"—"}</td>
      <td style="font-size:12px;color:var(--ink-soft)">${esc(t.notes)||"—"}</td>
      <td><button class="btn ghost" data-edittruck="${t.id}">Edit</button></td>
    </tr>`;
  }).join("");
  const body=rows||`<tr><td colspan="7" style="text-align:center;padding:34px;color:var(--ink-soft)">No trucks yet. Click <b>+ Add Truck</b> to build your fleet.</td></tr>`;
  return `
    <div class="toolbar">
      <div class="curdate" style="min-width:auto">Fleet &middot; ${DB.fleet.length} units</div>
      <button class="btn" data-newtruck>+ Add Truck</button>
    </div>
    <div class="fleetwrap"><table class="fleet">
      <thead><tr><th>Unit</th><th>Unit / Plate</th><th>Driver</th><th>Fuel</th><th>Odometer</th><th>Notes</th><th></th></tr></thead>
      <tbody>${body}</tbody>
    </table></div>
    <div class="footer-note">Units missing a driver or low on fuel are flagged here and on the Dispatch board</div>`;
}

/* ============ WIRING ============ */
function wire(){
  document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>{curDate=addDays(curDate,+b.dataset.nav);render();});
  document.querySelectorAll("[data-today]").forEach(b=>b.onclick=()=>{curDate=todayISO();render();});
  document.querySelectorAll("[data-filter]").forEach(c=>c.onclick=()=>{filter=c.dataset.filter;render();});
  document.querySelectorAll("[data-cycle]").forEach(p=>p.onclick=()=>cycleStatus(p.dataset.cycle));
  document.querySelectorAll("[data-editmove]").forEach(b=>b.onclick=()=>openMove(b.dataset.editmove,curDate));
  document.querySelectorAll("[data-newmove]").forEach(b=>b.onclick=()=>openMove(null,curDate));
  document.querySelectorAll("[data-cell]").forEach(c=>c.onclick=()=>{const[tid,dd]=c.dataset.cell.split("|");openMove(tid,dd);});
  document.querySelectorAll("[data-edittruck]").forEach(b=>b.onclick=()=>openTruck(b.dataset.edittruck));
  document.querySelectorAll("[data-newtruck]").forEach(b=>b.onclick=()=>openTruck(null));
  document.querySelectorAll("[data-view-switch]").forEach(b=>b.onclick=()=>{view=b.dataset.viewSwitch;render();});
  document.querySelectorAll("[data-loadsample]").forEach(b=>b.onclick=()=>{DB=seed();save();view="daily";render();});
  document.querySelectorAll("[data-opensetup]").forEach(b=>b.onclick=()=>openSetup());
  document.querySelectorAll("[data-editperson]").forEach(b=>b.onclick=()=>openPerson(b.dataset.editperson));
  document.querySelectorAll("[data-newperson]").forEach(b=>b.onclick=()=>openPerson(null));
  // Week drag & drop
  document.querySelectorAll("[data-drag]").forEach(ch=>{
    ch.addEventListener("dragstart",e=>{dragData=ch.dataset.drag;ch.classList.add("dragging");e.dataTransfer.effectAllowed="move";try{e.dataTransfer.setData("text/plain",dragData);}catch(_){}});
    ch.addEventListener("dragend",()=>{ch.classList.remove("dragging");justDragged=true;setTimeout(()=>{justDragged=false;dragData=null;},250);document.querySelectorAll(".drop-ok").forEach(x=>x.classList.remove("drop-ok"));});
    ch.addEventListener("click",()=>{if(justDragged)return;const[tid,dd]=ch.dataset.drag.split("|");openMove(tid,dd);});
  });
  document.querySelectorAll("[data-drop]").forEach(td=>{
    td.addEventListener("dragover",e=>{if(!dragData)return;if(dragData.split("|")[0]!==td.dataset.drop.split("|")[0])return;e.preventDefault();td.classList.add("drop-ok");});
    td.addEventListener("dragleave",()=>td.classList.remove("drop-ok"));
    td.addEventListener("drop",e=>{td.classList.remove("drop-ok");if(!dragData)return;const[sT,sD]=dragData.split("|");const[dT,dD]=td.dataset.drop.split("|");if(sT!==dT||sD===dD)return;e.preventDefault();moveChip(sT,sD,dD);});
  });
}

function cycleStatus(tid){
  const m=(DB.moves[curDate]||{})[tid];if(!m)return;
  const i=STATUS_ORDER.indexOf(m.status);
  m.status=STATUS_ORDER[(i+1)%STATUS_ORDER.length];
  save();render();
}

/* ---- move modal ---- */
let editingMove=null;
let editStops=[];
function renderStopRows(){
  const wrap=document.getElementById("mv_stops");if(!wrap)return;
  wrap.innerHTML=editStops.length?editStops.map((s,i)=>`<div class="stoprow"><input type="time" class="st" value="${s.t||""}"><input class="sp" placeholder="Stop location" value="${esc(s.p||"")}"><button type="button" class="rmstop" data-i="${i}" title="Remove stop">&times;</button></div>`).join(""):`<div class="shint" style="margin:2px 0 4px">No extra stops — departs, hits the destination above, parks by wrap.</div>`;
  wrap.querySelectorAll(".rmstop").forEach(b=>b.onclick=()=>{editStops.splice(+b.dataset.i,1);renderStopRows();});
  wrap.querySelectorAll(".stoprow").forEach((r,i)=>{
    r.querySelector(".st").oninput=e=>editStops[i].t=e.target.value;
    r.querySelector(".sp").oninput=e=>editStops[i].p=e.target.value;
  });
}
function openMove(tid,dateStr){
  const sel=document.getElementById("mv_truck");
  sel.innerHTML=DB.fleet.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("");
  const existing=tid?((DB.moves[dateStr]||{})[tid]):null;
  editingMove={tid:tid||DB.fleet[0].id,date:dateStr,isNew:!existing};
  sel.value=editingMove.tid;
  document.getElementById("mv_date").value=dateStr;
  document.getElementById("mv_from").value=existing?existing.from||"":"";
  document.getElementById("mv_to").value=existing?existing.to||"":"";
  document.getElementById("mv_roll").value=existing?existing.roll||"":"";
  document.getElementById("mv_call").value=existing?existing.call||"":"";
  document.getElementById("mv_wrap").value=existing?existing.wrap||"":"";
  document.getElementById("mv_drive").value=existing&&existing.drive!=null?existing.drive:"";
  document.getElementById("mv_status").value=existing?existing.status:"staged";
  document.getElementById("mv_crew").value=existing&&existing.crew!=null?existing.crew:"";
  editStops=(existing&&Array.isArray(existing.stops))?existing.stops.map(s=>({t:s.t||"",p:s.p||""})):[];
  renderStopRows();
  document.getElementById("moveModalTitle").textContent=existing?"Edit Move":"Add Move";
  document.getElementById("mv_delete").style.display=existing?"":"none";
  document.getElementById("moveModal").classList.add("show");
}
function saveMove(){
  const tid=document.getElementById("mv_truck").value;
  const date=document.getElementById("mv_date").value;
  const oldTid=editingMove.tid,oldDate=editingMove.date;
  if(DB.moves[oldDate]&&DB.moves[oldDate][oldTid]&&(oldTid!==tid||oldDate!==date))delete DB.moves[oldDate][oldTid];
  const crewVal=document.getElementById("mv_crew").value;
  const driveVal=document.getElementById("mv_drive").value;
  const stops=editStops.map(s=>({t:s.t,p:(s.p||"").trim()})).filter(s=>s.t||s.p);
  const m={
    from:document.getElementById("mv_from").value.trim(),
    to:document.getElementById("mv_to").value.trim(),
    roll:document.getElementById("mv_roll").value,
    call:document.getElementById("mv_call").value,
    wrap:document.getElementById("mv_wrap").value,
    drive:driveVal===""?null:Number(driveVal),
    status:document.getElementById("mv_status").value,
    crew:crewVal===""?null:Number(crewVal)
  };
  if(stops.length)m.stops=stops;
  (DB.moves[date]=DB.moves[date]||{})[tid]=m;
  save();closeModals();
  if(view==="daily")curDate=date;
  render();
}
function deleteMove(){if(DB.moves[editingMove.date])delete DB.moves[editingMove.date][editingMove.tid];save();closeModals();render();}
function moveChip(tid,fromDate,toDate){
  const src=(DB.moves[fromDate]||{})[tid];if(!src)return;
  DB.moves[toDate]=DB.moves[toDate]||{};
  const dst=DB.moves[toDate][tid];
  DB.moves[toDate][tid]=src;
  if(dst){DB.moves[fromDate][tid]=dst;}else{delete DB.moves[fromDate][tid];}
  save();render();
}

/* ---- truck modal ---- */
let editingTruck=null;
function openTruck(id){
  const t=id?truckById(id):null;
  editingTruck={id,isNew:!t};
  document.getElementById("tk_name").value=t?t.name:"";
  document.getElementById("tk_type").value=t?t.type:"";
  document.getElementById("tk_unit").value=t?t.unit:"";
  document.getElementById("tk_driver").value=t?t.driver:"";
  document.getElementById("tk_crew").value=t?(t.crew||[]).join(", "):"";
  document.getElementById("tk_fuel").value=t&&t.fuel!=null?t.fuel:"";
  document.getElementById("tk_odo").value=t&&t.odo!=null?t.odo:"";
  document.getElementById("tk_notes").value=t?t.notes:"";
  document.getElementById("truckModalTitle").textContent=t?"Edit Truck":"Add Truck";
  document.getElementById("tk_delete").style.display=t?"":"none";
  document.getElementById("truckModal").classList.add("show");
}
function saveTruck(){
  const name=document.getElementById("tk_name").value.trim();
  if(!name){alert("Truck needs a name.");return;}
  const fuelV=document.getElementById("tk_fuel").value;
  const odoV=document.getElementById("tk_odo").value;
  const data={
    name,
    type:document.getElementById("tk_type").value.trim(),
    unit:document.getElementById("tk_unit").value.trim(),
    driver:document.getElementById("tk_driver").value.trim(),
    crew:document.getElementById("tk_crew").value.split(",").map(s=>s.trim()).filter(Boolean),
    fuel:fuelV===""?null:Math.max(0,Math.min(100,Number(fuelV))),
    odo:odoV===""?null:Number(odoV),
    notes:document.getElementById("tk_notes").value.trim()
  };
  if(editingTruck.isNew){data.id="t"+Date.now().toString(36);DB.fleet.push(data);}
  else{Object.assign(truckById(editingTruck.id),data);}
  // make sure any new driver / crew names show up in the call-down roster
  DB.people=DB.people||[];
  const known=new Set(DB.people.map(p=>p.name));
  if(data.driver&&!known.has(data.driver)){DB.people.push({id:"p"+Math.random().toString(36).slice(2,8),name:data.driver,role:"Driver",phone:""});known.add(data.driver);}
  data.crew.forEach(c=>{if(!known.has(c)){DB.people.push({id:"p"+Math.random().toString(36).slice(2,8),name:c,role:"Crew",phone:""});known.add(c);}});
  save();closeModals();render();
}
function deleteTruck(){
  if(!confirm("Delete this truck and all its scheduled moves?"))return;
  const id=editingTruck.id;
  DB.fleet=DB.fleet.filter(t=>t.id!==id);
  Object.keys(DB.moves).forEach(d=>{delete DB.moves[d][id];});
  save();closeModals();render();
}
function closeModals(){document.querySelectorAll(".modal-bg").forEach(m=>m.classList.remove("show"));}

/* ---- person modal ---- */
let editingPerson=null;
function openPerson(id){
  const p=id?personById(id):null;
  editingPerson={id,isNew:!p,oldName:p?p.name:""};
  document.getElementById("pr_name").value=p?p.name:"";
  document.getElementById("pr_role").value=p?p.role:"";
  document.getElementById("pr_phone").value=p?p.phone:"";
  document.getElementById("personModalTitle").textContent=p?"Edit Person":"Add Person";
  document.getElementById("pr_delete").style.display=p?"":"none";
  document.getElementById("personModal").classList.add("show");
}
function savePerson(){
  const name=document.getElementById("pr_name").value.trim();
  if(!name){alert("Name is required.");return;}
  const role=document.getElementById("pr_role").value.trim();
  const phone=document.getElementById("pr_phone").value.trim();
  DB.people=DB.people||[];
  if(editingPerson.isNew){DB.people.push({id:"p"+Math.random().toString(36).slice(2,8),name,role,phone});}
  else{
    const p=personById(editingPerson.id);const old=editingPerson.oldName;
    if(p){p.name=name;p.role=role;p.phone=phone;}
    if(old&&old!==name){ // keep unit assignments in sync on rename
      DB.fleet.forEach(t=>{
        if(t.driver&&t.driver.trim()===old)t.driver=name;
        t.crew=(t.crew||[]).map(c=>c===old?name:c);
      });
    }
  }
  save();closeModals();render();
}
function deletePerson(){
  DB.people=(DB.people||[]).filter(p=>p.id!==editingPerson.id);
  save();closeModals();render();
}

/* ---- static button bindings ---- */
document.getElementById("mv_save").onclick=saveMove;
document.getElementById("mv_delete").onclick=deleteMove;
document.getElementById("mv_addstop").onclick=()=>{editStops.push({t:"",p:""});renderStopRows();};
document.getElementById("tk_save").onclick=saveTruck;
document.getElementById("tk_delete").onclick=deleteTruck;
document.getElementById("pr_save").onclick=savePerson;
document.getElementById("pr_delete").onclick=deletePerson;
document.querySelectorAll("[data-close]").forEach(x=>x.onclick=closeModals);
document.querySelectorAll(".modal-bg").forEach(bg=>bg.onclick=e=>{if(e.target===bg)closeModals();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModals();});
document.querySelectorAll("nav button.tab").forEach(b=>b.onclick=()=>{view=b.dataset.view;render();});

/* ---- board menu ---- */
document.getElementById("menuBtn").onclick=e=>{e.stopPropagation();document.getElementById("boardMenu").classList.toggle("show");};
document.addEventListener("click",()=>document.getElementById("boardMenu").classList.remove("show"));
document.querySelectorAll("#boardMenu button").forEach(b=>b.onclick=()=>{
  const a=b.dataset.act;document.getElementById("boardMenu").classList.remove("show");
  if(a==="setup"){openSetup();}
  else if(a==="sample"){if(confirm("Replace the current board with the sample data?")){DB=seed();save();view="daily";curDate=todayISO();render();}}
  else if(a==="clearmoves"){if(confirm("Remove all scheduled moves? Your trucks stay in the Fleet.")){DB.moves={};save();render();}}
  else if(a==="fresh"){if(confirm("Start a brand-new empty board? This clears all trucks, moves, AND the roster.")){DB={fleet:[],moves:{},people:[]};save();su.people=[];su._csv="";su.step=0;view="setup";render();}}
});

/* ---- clock + live tick ---- */
function tickClock(){
  const n=new Date();
  const hh=String(n.getHours()).padStart(2,"0"),mm=String(n.getMinutes()).padStart(2,"0"),ss=String(n.getSeconds()).padStart(2,"0");
  document.getElementById("clockTime").innerHTML=`${hh}:${mm}<span class="sec">:${ss}</span>`;
  document.getElementById("clockDate").textContent=`${DOW[n.getDay()]} ${MON[n.getMonth()].slice(0,3)} ${n.getDate()} · ON THE CLOCK`;
}
tickClock();
setInterval(tickClock,1000);
// live board refresh (moves the NOW line, updates countdowns) — only on today's dispatch
let lastMin=nowMinutes();
setInterval(()=>{
  const m=nowMinutes();
  if(m!==lastMin){
    lastMin=m;
    if(view==="daily"&&curDate===todayISO()){renderAlerts();updateNavCounts();
      const app=document.getElementById("app");app.innerHTML=viewDaily();wire();}
  }
},15000);

render();
