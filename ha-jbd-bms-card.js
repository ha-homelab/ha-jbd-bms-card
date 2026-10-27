/** JBD Battery & Cell Card · MIT · no runtime dependencies. */
const VERSION = "0.1.0";
const DEFAULT_THRESHOLDS = Object.freeze({cell_min: 2.8, cell_max: 3.65, delta_warning: 30, delta_critical: 80, soc_low: 15, soc_warning: 30});
const PALETTES = ["cyan", "violet", "teal", "pink", "blue", "amber"];
const TEXT = {
  en: {title:"Battery atlas", subtitle:"Every battery. Every cell.", battery:"Battery", batteries:"batteries", available:"Entities available", partial:"Partial data", unavailable:"Unavailable", soc:"Charge", voltage:"Voltage", current:"Current", power:"Power", temperature:"Temperature", cells:"Cell voltages", spread:"Cell spread", min:"Minimum", max:"Maximum", missing:"No data", lowest:"Lowest", highest:"Highest", cellsPresent:"cells available", source:"Home Assistant entity states · measurement freshness is not verified", warning:"Elevated spread", critical:"High spread", good:"Low spread", outOfRange:"Outside display range", incomplete:"Incomplete cells", unknown:"Unknown", status:"Source status"},
  ru: {title:"Атлас батарей", subtitle:"Каждая батарея. Каждая ячейка.", battery:"Батарея", batteries:"батарей", available:"Сущности доступны", partial:"Неполные данные", unavailable:"Недоступно", soc:"Заряд", voltage:"Напряжение", current:"Ток", power:"Мощность", temperature:"Температура", cells:"Напряжения ячеек", spread:"Разброс ячеек", min:"Минимум", max:"Максимум", missing:"Нет данных", lowest:"Минимум", highest:"Максимум", cellsPresent:"ячеек доступны", source:"Состояния Home Assistant · свежесть измерений не подтверждена", warning:"Повышенный разброс", critical:"Высокий разброс", good:"Небольшой разброс", outOfRange:"Вне диапазона отображения", incomplete:"Неполные данные ячеек", unknown:"Неизвестно", status:"Состояние источника"}
};
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const entityId = (value) => typeof value === "string" && /^[a-z_]+\.[a-z0-9_]+$/.test(value);

export function numericState(state) {
  if (!state || typeof state.state !== "string" || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(state.state.trim())) return null;
  const value = Number(state.state);
  return Number.isFinite(value) ? value : null;
}

export function cellVoltage(state) {
  const number = numericState(state);
  if (number === null || number <= 0) return null;
  const unit = state.attributes?.unit_of_measurement;
  if (unit && unit !== "V" && unit !== "mV") return null;
  return unit === "mV" ? number / 1000 : number;
}

export function cellStats(values) {
  const present = values.filter((x) => x !== null && Number.isFinite(x));
  if (!values.length || present.length !== values.length) return {complete:false, count:present.length, min:null, max:null, delta:null};
  const min = Math.min(...present), max = Math.max(...present);
  return {complete:true, count:present.length, min, max, delta:(max-min)*1000};
}

export function normalizeConfig(config) {
  if (!config || !Array.isArray(config.batteries) || !config.batteries.length || config.batteries.length > 32) throw new Error("Define batteries: with 1–32 battery configurations.");
  if (config.title !== undefined && typeof config.title !== "string") throw new Error("title must be text.");
  if (config.language !== undefined && !["en","ru"].includes(config.language)) throw new Error("language must be en or ru.");
  const validateThresholds = (input) => {
    const t = {...DEFAULT_THRESHOLDS, ...input};
    if (!Object.values(t).every((x) => typeof x === "number" && Number.isFinite(x))) throw new Error("Thresholds must be finite numbers.");
    if (!(t.cell_min > 0 && t.cell_max > t.cell_min && t.delta_warning > 0 && t.delta_critical > t.delta_warning && t.soc_low >= 0 && t.soc_warning > t.soc_low && t.soc_warning <= 100)) throw new Error("Invalid threshold order or range.");
    return t;
  };
  const thresholds = validateThresholds(config.thresholds);
  const batteries = config.batteries.map((b, index) => {
    if (!b || typeof b !== "object" || !Array.isArray(b.cells) || !b.cells.length || b.cells.length > 64) throw new Error(`Battery ${index+1}: define 1–64 cell entities.`);
    for (const key of ["soc","voltage","current","power","temperature","availability"]) {
      if ((["soc","voltage"].includes(key) || b[key] !== undefined) && !entityId(b[key])) throw new Error(`Battery ${index+1}: ${key} must be an entity ID.`);
    }
    for (const key of ["name","subtitle"]) if (b[key] !== undefined && typeof b[key] !== "string") throw new Error(`Battery ${index+1}: ${key} must be text.`);
    const cells = b.cells.map((c, i) => {
      const cell = typeof c === "string" ? {entity:c} : c;
      if (!cell || !entityId(cell.entity) || (cell.name !== undefined && typeof cell.name !== "string")) throw new Error(`Battery ${index+1}: invalid cell ${i+1}.`);
      return {entity:cell.entity, name:cell.name ?? String(i+1).padStart(2,"0")};
    });
    if (new Set(cells.map(c=>c.entity)).size !== cells.length) throw new Error(`Battery ${index+1}: duplicate cell entity.`);
    if (b.accent !== undefined && !PALETTES.includes(b.accent)) throw new Error(`Battery ${index+1}: unsupported accent.`);
    return {...b, cells, accent:b.accent ?? PALETTES[index%PALETTES.length], thresholds:validateThresholds({...thresholds,...b.thresholds})};
  });
  return {...config, batteries, thresholds};
}

export function batteryModel(config, states) {
  const gate = config.availability ? states[config.availability]?.state : undefined;
  const blocked = Boolean(config.availability) && !["on","online","true","connected"].includes(gate);
  const value = (key) => blocked ? null : numericState(states[config[key]]);
  const rawSoc = value("soc");
  const soc = rawSoc !== null && rawSoc >= 0 && rawSoc <= 100 ? rawSoc : null;
  const rawVoltage = value("voltage");
  const voltage = rawVoltage !== null && rawVoltage > 0 ? rawVoltage : null;
  const cells = config.cells.map(c => ({...c, value:blocked ? null : cellVoltage(states[c.entity])}));
  const metrics = {soc, voltage, current:value("current"), power:value("power"), temperature:value("temperature")};
  const values = [soc, voltage, ...["current","power","temperature"].filter(k=>config[k]).map(k=>metrics[k]), ...cells.map(c=>c.value)];
  const count = values.filter(v=>v!==null).length;
  return {...metrics, cells, stats:cellStats(cells.map(c=>c.value)), status:count===0 ? "unavailable" : count===values.length ? "available" : "partial"};
}

const STYLE = `
:host{display:block;--jbd-ink:var(--primary-text-color,#172238);--jbd-muted:var(--secondary-text-color,#66758c);--jbd-line:var(--divider-color,rgba(120,140,170,.2));font-family:var(--paper-font-body1_-_font-family,system-ui,sans-serif);color:var(--jbd-ink)}
*{box-sizing:border-box}ha-card{display:block;overflow:hidden;background:var(--ha-card-background,var(--card-background-color,#fff));border-radius:var(--ha-card-border-radius,24px);border:1px solid var(--jbd-line);box-shadow:var(--ha-card-box-shadow,0 10px 32px #152a4810)}
.header{padding:26px 26px 20px;display:flex;gap:16px;align-items:center;background:linear-gradient(125deg,#12b8d516,#9865ed12 60%,transparent)}.brand{width:42px;height:42px;border-radius:14px;background:linear-gradient(145deg,#04b5d3,#9461ea);display:grid;place-items:center;color:white;flex-shrink:0}.brand svg{width:25px}.header h1{font-size:23px;line-height:1.2;letter-spacing:-.7px;margin:0;font-weight:750}.subtitle{font-size:12px;color:var(--jbd-muted);margin:6px 0 0}.badge{margin-left:auto;border:1px solid var(--jbd-line);border-radius:999px;font-size:11px;padding:7px 11px;white-space:nowrap;font-variant-numeric:tabular-nums}
.batteries{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:16px;padding:0 20px 20px}.battery{--accent:#0aaec9;--accent-rgb:10,174,201;padding:20px;border:1px solid var(--jbd-line);border-radius:19px;min-width:0;background:linear-gradient(155deg,rgba(var(--accent-rgb),.09),transparent 60%)}.violet{--accent:#9664e6;--accent-rgb:150,100,230}.teal{--accent:#14a98c;--accent-rgb:20,169,140}.pink{--accent:#dd68a4;--accent-rgb:221,104,164}.blue{--accent:#5c8ee8;--accent-rgb:92,142,232}.amber{--accent:#cf9022;--accent-rgb:207,144,34}.pack-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.pack-top h2{font-size:17px;margin:0 0 5px;line-height:1.3;overflow-wrap:anywhere}.eyebrow{font-size:10px;letter-spacing:1.1px;font-weight:750;text-transform:uppercase;color:var(--accent);margin-bottom:7px}.pack-subtitle{font-size:11px;color:var(--jbd-muted);overflow-wrap:anywhere}.status{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--jbd-muted);white-space:nowrap}.dot{width:6px;height:6px;border-radius:100%;background:#22b895;flex-shrink:0}.partial .dot{background:#db9a24}.unavailable .dot{background:#8290a3}.hero{display:flex;align-items:center;gap:22px;margin:24px 0 20px}.ring{width:108px;height:108px;flex-shrink:0;position:relative;display:grid;place-items:center}.ring svg{width:108px;height:108px;transform:rotate(-90deg)}.track{fill:none;stroke:var(--jbd-line);stroke-width:8}.progress{fill:none;stroke:var(--soc-color,var(--accent));stroke-width:8;stroke-linecap:round}.ring-label{position:absolute;text-align:center}.ring-label strong{font-size:28px;letter-spacing:-1.2px;line-height:1.1;font-variant-numeric:tabular-nums}.ring-label small{font-size:13px;color:var(--jbd-muted);margin-left:1px}.ring-label span{display:block;font-size:10px;color:var(--jbd-muted);margin-top:5px}.volts{font-size:31px;letter-spacing:-1px;font-weight:700;font-variant-numeric:tabular-nums}.unit{font-size:13px;color:var(--jbd-muted);font-weight:400;margin-left:4px;letter-spacing:0}.metric-label{font-size:10px;color:var(--jbd-muted);margin-top:4px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:21px}.metric{padding:10px 8px;border-radius:11px;background:rgba(var(--accent-rgb),.07);min-width:0}.metric strong{font-size:15px;font-variant-numeric:tabular-nums;white-space:nowrap}.metric .unit{font-size:10px;margin-left:3px}.cell-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font-size:11px;gap:6px}.cell-head strong{font-weight:650}.cell-head span{color:var(--jbd-muted);font-size:10px}.cells{display:grid;grid-template-columns:repeat(auto-fit,minmax(60px,1fr));gap:7px}.cell{--tone:var(--accent);padding:10px 5px 8px;text-align:center;border:1px solid var(--jbd-line);border-radius:10px;background:var(--ha-card-background,var(--card-background-color,#fff));position:relative;overflow:hidden;min-width:0}.cell:before{content:"";position:absolute;bottom:0;left:0;height:3px;width:var(--fill,0%);background:var(--tone)}.cell-label{display:block;font-size:9px;color:var(--jbd-muted);letter-spacing:.4px;margin-bottom:6px;overflow-wrap:anywhere}.cell strong{font-size:13px;font-variant-numeric:tabular-nums;letter-spacing:-.3px}.cell .unit{font-size:9px;margin-left:1px}.flag{display:block;font-size:8px;margin-top:5px;color:var(--tone);min-height:10px}.cell.warning{--tone:#d99a25}.cell.critical{--tone:#e15a70}.cell.missing{--tone:#8290a3;color:var(--jbd-muted);background:transparent}.spread{margin-top:16px;padding-top:14px;border-top:1px solid var(--jbd-line);display:flex;justify-content:space-between;align-items:center;gap:8px}.spread strong{font-size:17px;letter-spacing:-.3px;font-variant-numeric:tabular-nums}.spread .unit{font-size:10px}.spread-label{font-size:10px;color:var(--jbd-muted);margin-bottom:4px}.spread-pill{font-size:9px;padding:5px 8px;border-radius:999px;background:#18ad8b14;color:#158d73;max-width:55%;text-align:center}.spread-pill.warning{background:#d99a2517;color:#aa7214}.spread-pill.critical{background:#e15a7017;color:#cf425d}.spread-pill.missing{background:#8290a314;color:var(--jbd-muted)}.minmax{display:flex;gap:14px;font-size:10px;color:var(--jbd-muted);margin-top:12px}.minmax b{font-weight:600;color:var(--jbd-ink)}.footer{font-size:10px;color:var(--jbd-muted);padding:0 23px 18px;line-height:1.5}.state-action{cursor:pointer}.state-action:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:6px}.unavailable .ring,.unavailable .metrics,.unavailable .volts{opacity:.55}.missing-value{color:var(--jbd-muted)}
@media(max-width:480px){.header{padding:20px 18px 18px}.header h1{font-size:20px}.badge{display:none}.batteries{padding:0 12px 12px;gap:12px}.battery{padding:16px}.status{font-size:9px}.pack-top{gap:7px}.hero{gap:18px;margin:20px 0}.ring,.ring svg{width:98px;height:98px}.footer{padding:0 18px 15px}.cells{grid-template-columns:repeat(auto-fit,minmax(56px,1fr))}}`;

export class HaJbdBmsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:"open"});
    this.shadowRoot.addEventListener("click", (event) => this._openEntity(event));
    this.shadowRoot.addEventListener("keydown", (event) => {
      if (["Enter"," "].includes(event.key) && event.target.closest("[data-entity]")) {event.preventDefault();this._openEntity(event);}
    });
  }
  setConfig(config) {this._config=normalizeConfig(config);this._signature=null;this._render();}
  set hass(hass) {
    this._hass=hass;
    if (!this._config) return;
    const ids = this._config.batteries.flatMap(b=>[b.soc,b.voltage,b.current,b.power,b.temperature,b.availability,...b.cells.map(c=>c.entity)]).filter(Boolean);
    const signature = [hass.language,...ids.map(id=>hass.states[id])];
    if (this._signature && signature.every((v,i)=>v===this._signature[i])) return;
    this._signature=signature;this._render();
  }
  getCardSize() {return 10 * Math.ceil((this._config?.batteries.length ?? 1)/2);}
  getGridOptions() {return {columns:12, rows:"auto", min_columns:6};}
  static getStubConfig() {return {type:"custom:ha-jbd-bms-card",batteries:[{name:"Battery 1",soc:"sensor.replace_soc",voltage:"sensor.replace_voltage",cells:["sensor.replace_cell_1","sensor.replace_cell_2","sensor.replace_cell_3","sensor.replace_cell_4"]}]};}
  _openEntity(event) {
    const target=event.target.closest("[data-entity]");
    if (!target || !this._hass?.states[target.dataset.entity]) return;
    this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:target.dataset.entity},bubbles:true,composed:true}));
  }
  _render() {
    if (!this._config || !this._hass) return;
    const language=this._config.language ?? (this._hass.language?.startsWith("ru")?"ru":"en");
    const t=TEXT[language], states=this._hass.states;
    const num=(value,digits=1)=>value===null?"—":new Intl.NumberFormat(language,{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value);
    const action=(id)=>id?`class="state-action" tabindex="0" role="button" data-entity="${esc(id)}"`:"";
    const metric=(label,key,b,m,defaultUnit)=>b[key]?`<div class="metric"><div ${action(b[key])} aria-label="${esc(label)}"><strong>${num(m[key],key==="power"?(["kW","MW"].includes(states[b[key]]?.attributes?.unit_of_measurement)?2:0):1)}</strong><span class="unit">${esc(states[b[key]]?.attributes?.unit_of_measurement??defaultUnit)}</span><div class="metric-label">${esc(label)}</div></div></div>`:"";
    const packs=this._config.batteries.map((b,index)=>{
      const m=batteryModel(b,states), th=b.thresholds;
      const color=m.soc===null?"#8290a3":m.soc<=th.soc_low?"#e15a70":m.soc<=th.soc_warning?"#d99a25":"var(--accent)";
      const length=2*Math.PI*46;
      const spreadClass=m.stats.delta===null?"missing":m.stats.delta>=th.delta_critical-1e-9?"critical":m.stats.delta>=th.delta_warning-1e-9?"warning":"good";
      const spreadText=m.stats.delta===null?t.incomplete:spreadClass==="critical"?t.critical:spreadClass==="warning"?t.warning:t.good;
      const cellHtml=m.cells.map(c=>{
        const missing=c.value===null, out=!missing&&(c.value<th.cell_min||c.value>th.cell_max);
        const isMin=m.stats.complete&&Math.abs(c.value-m.stats.min)<1e-9;
        const isMax=m.stats.complete&&Math.abs(c.value-m.stats.max)<1e-9;
        const flag=missing?t.missing:out?t.outOfRange:(isMin&&isMax?"":isMin?t.lowest:isMax?t.highest:"");
        const fill=missing?0:Math.max(0,Math.min(100,(c.value-th.cell_min)/(th.cell_max-th.cell_min)*100));
        return `<div class="cell ${missing?"missing":out?"critical":""}" style="--fill:${fill}%"><div ${action(c.entity)} aria-label="${esc(c.name)}: ${missing?t.missing:`${num(c.value,3)} V`}"><span class="cell-label">${esc(c.name)}</span><strong>${num(c.value,3)}</strong><span class="unit">V</span><span class="flag">${esc(flag)}</span></div></div>`;
      }).join("");
      return `<section class="battery ${b.accent} ${m.status}" aria-label="${esc(b.name??`${t.battery} ${index+1}`)}"><div class="pack-top"><div><div class="eyebrow">${t.battery} ${String(index+1).padStart(2,"0")}</div><h2>${esc(b.name??`${t.battery} ${index+1}`)}</h2>${b.subtitle?`<div class="pack-subtitle">${esc(b.subtitle)}</div>`:""}</div><span class="status" title="${t.status}"><span class="dot"></span>${t[m.status]}</span></div><div class="hero"><div class="ring" style="--soc-color:${color}"><svg viewBox="0 0 108 108" aria-hidden="true"><circle class="track" cx="54" cy="54" r="46"/><circle class="progress" cx="54" cy="54" r="46" stroke-dasharray="${length}" stroke-dashoffset="${length*(1-(m.soc??0)/100)}"/></svg><div class="ring-label"><div ${action(b.soc)} aria-label="${t.soc}"><strong>${num(m.soc,0)}</strong>${m.soc===null?"":"<small>%</small>"}<span>${t.soc}</span></div></div></div><div><div ${action(b.voltage)} aria-label="${t.voltage}"><div class="volts">${num(m.voltage,2)}<span class="unit">${esc(states[b.voltage]?.attributes?.unit_of_measurement??"V")}</span></div><div class="metric-label">${t.voltage}</div></div></div></div>${[b.current,b.power,b.temperature].some(Boolean)?`<div class="metrics">${metric(t.current,"current",b,m,"A")}${metric(t.power,"power",b,m,"W")}${metric(t.temperature,"temperature",b,m,"°C")}</div>`:""}<div class="cell-head"><strong>${t.cells}</strong><span>${m.stats.count}/${m.cells.length} ${t.cellsPresent}</span></div><div class="cells">${cellHtml}</div><div class="spread"><div><div class="spread-label">${t.spread}</div><strong>${num(m.stats.delta,0)}</strong><span class="unit">mV</span></div><span class="spread-pill ${spreadClass}">${spreadText}</span></div><div class="minmax"><span>${t.min} <b>${num(m.stats.min,3)} V</b></span><span>${t.max} <b>${num(m.stats.max,3)} V</b></span></div></section>`;
    }).join("");
    const focusedEntity=this.shadowRoot.activeElement?.dataset?.entity;
    const focusedIndex=focusedEntity?Array.from(this.shadowRoot.querySelectorAll("[data-entity]")).filter(el=>el.dataset.entity===focusedEntity).indexOf(this.shadowRoot.activeElement):-1;
    this.shadowRoot.innerHTML=`<style>${STYLE}</style><ha-card><header class="header"><div class="brand" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="6" width="17" height="12" rx="3"/><path d="M22 10v4M11 8l-3 5h5l-2 4"/></svg></div><div><h1>${esc(this._config.title??t.title)}</h1><p class="subtitle">${t.subtitle}</p></div><span class="badge">${this._config.batteries.length} ${t.batteries}</span></header><div class="batteries">${packs}</div><footer class="footer">${t.source}</footer></ha-card>`;
    if(focusedEntity) Array.from(this.shadowRoot.querySelectorAll("[data-entity]")).filter(el=>el.dataset.entity===focusedEntity)[focusedIndex]?.focus({preventScroll:true});
  }
}
if (!customElements.get("ha-jbd-bms-card")) customElements.define("ha-jbd-bms-card",HaJbdBmsCard);
window.customCards=window.customCards??[];
if (!window.customCards.some(c=>c.type==="ha-jbd-bms-card")) window.customCards.push({type:"ha-jbd-bms-card",name:"JBD Battery & Cell Card",description:"Colorful battery overview and individual cell voltages. Explicit entity mapping; no Victron required.",preview:true});
console.info(`JBD BATTERY & CELL CARD ${VERSION}`);
