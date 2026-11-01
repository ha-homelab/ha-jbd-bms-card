import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const window=new Window();
for(const key of ['window','document','HTMLElement','customElements','CustomEvent'])globalThis[key]=window[key];
const {normalizeConfig,virtualBatteryModel,batteryModel,cellStats,cellVoltage,HaJbdBmsCard,LOCALES,MESSAGES,translate}=await import('../ha-jbd-bms-card.js');
const state=(value,unit)=>({state:String(value),attributes:{unit_of_measurement:unit}});
function fixture(count=4,cellCounts=[4]) {
  const states={},batteries=Array.from({length:count},(_,i)=>{
    const prefix=`sensor.pack_${i+1}`,cells=Array.from({length:cellCounts[i%cellCounts.length]},(_,j)=>`${prefix}_cell_${j+1}`);
    states[`${prefix}_soc`]=state(80-i*5,'%');
    states[`${prefix}_voltage`]=state(cells.length*3.3,i%2?'mV':'V');
    if(i%2)states[`${prefix}_voltage`]=state(cells.length*3300,'mV');
    states[`${prefix}_current`]=state(-2,'A');
    cells.forEach((id,j)=>states[id]=state(j%2?3300:3.3,j%2?'mV':'V'));
    return {name:`Pack ${i+1}`,soc:`${prefix}_soc`,voltage:`${prefix}_voltage`,current:`${prefix}_current`,cells};
  });
  return {config:{virtual_batteries:[{name:'Series bank',batteries}]},states};
}
const model=(f)=>virtualBatteryModel(normalizeConfig(f.config).virtual_batteries[0],f.states);
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} ≠ ${expected}`);
function cardFor(f) {const card=new HaJbdBmsCard();card.setConfig(f.config);card.hass={states:f.states,locale:{language:'en'}};return card;}

for(const count of [1,2,3,4,5,12])test(`${count} physical batteries form one complete series without a 48 V assumption`,()=>{
  const f=fixture(count),m=model(f);
  close(m.voltage,count*13.2);assert.equal(m.cells.length,count*4);assert.equal(m.stats.count,count*4);assert.equal(m.stats.complete,true);
  assert.equal(m.current,null);assert.equal(m.power,null);assert.equal(m.soc,null);
  assert.equal(m.lowestSoc,80-(count-1)*5);assert.equal(m.highestSoc,80);assert.equal(m.status,'available');
});
test('heterogeneous 4, 8, 16-cell packs use actual member voltage, not cell count or nominal voltage',()=>{
  const f=fixture(3,[4,8,16]),g=f.config.virtual_batteries[0];
  g.nominal_voltage=89.6;g.voltage_range={min:70,max:102};g.batteries[0].nominal_voltage=12.8;
  f.states[g.batteries[2].voltage]=state(51.9,'V');
  const m=model(f);close(m.voltage,13.2+26.4+51.9);assert.equal(m.cells.length,28);assert.equal(m.stats.complete,true);
  const card=cardFor(f);assert.equal(card.shadowRoot.querySelectorAll('.virtual-battery').length,1);assert.equal(card.shadowRoot.querySelectorAll('.battery').length,3);assert.equal(card.shadowRoot.querySelectorAll('.cell').length,28);
  assert.match(card.shadowRoot.querySelector('.series-voltage').textContent,/91\.50/);
  assert.match(card.shadowRoot.querySelector('.series-summary .nominal').textContent,/89\.60/);
  assert.equal(card.shadowRoot.querySelectorAll('h3').length,3);
});
test('a missing, malformed or unsupported-unit member voltage never produces a partial series sum',()=>{
  for(const value of [undefined,state('unavailable'),state('NaN'),state(0),state(-5),state(13.2,'A')]) {
    const f=fixture(4),id=f.config.virtual_batteries[0].batteries[2].voltage;f.states[id]=value;
    const m=model(f);assert.equal(m.voltage,null);assert.equal(m.status,'partial');
    // Valid cell data remains useful even when the pack-voltage sensor is missing.
    assert.equal(m.stats.complete,true);
  }
});
test('an explicit series voltage is authoritative and unavailable source never falls back',()=>{
  const f=fixture(4),g=f.config.virtual_batteries[0];g.voltage='sensor.series_voltage';
  f.states[g.voltage]=state(52600,'mV');close(model(f).voltage,52.6);
  f.states[g.voltage]=state('unavailable');assert.equal(model(f).voltage,null);
  f.states[g.voltage]=state(51.1,'V');delete f.states[g.batteries[0].voltage];
  assert.equal(model(f).voltage,51.1);assert.equal(model(f).status,'partial');
});
test('series current and charge are never inferred from pack values or nominal settings',()=>{
  const f=fixture(4),g=f.config.virtual_batteries[0];
  for(const [i,b]of g.batteries.entries()) {f.states[b.current]=state(i+1,'A');b.capacity=100;}
  g.nominal_voltage=51.2;
  const m=model(f);assert.equal(m.current,null);assert.equal(m.soc,null);assert.equal(m.power,null);assert.equal(m.lowestSoc,65);assert.equal(m.highestSoc,80);
  const text=cardFor(f).shadowRoot.querySelector('.series-summary').textContent;
  assert.match(text,/Lowest member charge/);assert.match(text,/Member charge range/);assert.doesNotMatch(text,/Estimated power/);
});
test('explicit series current normalizes units, preserves sign and zero, and labels estimated V × I power',()=>{
  const f=fixture(4),g=f.config.virtual_batteries[0];g.current='sensor.series_current';g.soc='sensor.series_soc';f.states[g.soc]=state(42,'%');
  for(const [value,unit,expected]of [[-2500,'mA',-2.5],[0,'A',0],[0.001,'kA',1]]) {
    f.states[g.current]=state(value,unit);const m=model(f);assert.equal(m.current,expected);close(m.power,52.8*expected);assert.equal(m.soc,42);assert.equal(m.estimatedPower,true);
  }
  const card=cardFor(f);assert.match(card.shadowRoot.querySelector('.series-summary').textContent,/Estimated power · V × I/);
  f.states[g.current]=state(2,'W');assert.equal(model(f).current,null);assert.equal(model(f).power,null);
  f.states[g.soc]=state(101,'%');assert.equal(model(f).soc,null);
});
test('explicit series power normalizes W units, preserves sign, and never falls back to V × I',()=>{
  const f=fixture(2),g=f.config.virtual_batteries[0];g.current='sensor.series_current';g.power='sensor.series_power';f.states[g.current]=state(2,'A');
  for(const [value,unit,expected]of [[-0.25,'kW',-250],[0.001,'MW',1000],[2500,'mW',2.5],[0,'W',0]]) {
    f.states[g.power]=state(value,unit);const m=model(f);assert.equal(m.power,expected);assert.equal(m.estimatedPower,false);
  }
  f.states[g.power]=state('unavailable');assert.equal(model(f).power,null);
  f.states[g.power]=state(1,'VA');assert.equal(model(f).power,null);
});
test('member availability prevents retained telemetry from masquerading as complete series measurements',()=>{
  const f=fixture(4),g=f.config.virtual_batteries[0],b=g.batteries[1];b.availability='binary_sensor.pack_ready';f.states[b.availability]=state('off');
  const m=model(f);assert.equal(m.voltage,null);assert.equal(m.lowestSoc,null);assert.equal(m.highestSoc,null);assert.equal(m.stats.delta,null);assert.equal(m.stats.count,12);assert.equal(m.status,'partial');
  assert.equal(m.members[1].status,'unavailable');assert.ok(m.members[1].cells.every(c=>c.value===null));
  f.states[b.availability]=state('on');assert.equal(model(f).status,'available');
});
test('series availability gates explicit summary measurements and every physical member',()=>{
  const f=fixture(2),g=f.config.virtual_batteries[0];Object.assign(g,{availability:'binary_sensor.series_ready',voltage:'sensor.series_voltage',soc:'sensor.series_soc',current:'sensor.series_current',power:'sensor.series_power'});
  for(const key of ['voltage','soc','current','power'])f.states[g[key]]=state(20);
  for(const value of [undefined,'off','unavailable','unknown']) {
    f.states[g.availability]=value===undefined?undefined:state(value);const m=model(f);
    for(const key of ['voltage','soc','current','power','lowestSoc','highestSoc'])assert.equal(m[key],null,key);
    assert.equal(m.status,'unavailable');assert.equal(m.stats.count,0);assert.ok(m.members.every(member=>member.status==='unavailable'));
  }
  f.states[g.availability]=state('on');assert.equal(model(f).status,'available');
});
test('one missing cell invalidates series min, max and spread but preserves independent pack voltages',()=>{
  const f=fixture(3,[4,8,16]),g=f.config.virtual_batteries[0];delete f.states[g.batteries[1].cells[4]];
  const m=model(f);assert.equal(m.stats.count,27);assert.equal(m.stats.complete,false);assert.equal(m.stats.min,null);assert.equal(m.stats.max,null);assert.equal(m.stats.delta,null);close(m.voltage,92.4);assert.equal(m.status,'partial');
  const card=cardFor(f);assert.match(card.shadowRoot.querySelector('.series-stats').textContent,/27\/28 cells available/);assert.match(card.shadowRoot.querySelector('.series-stats').textContent,/Incomplete cells/);
});
test('one missing member SOC invalidates lowest and range rather than selecting a reassuring subset',()=>{
  const f=fixture(3),g=f.config.virtual_batteries[0];delete f.states[g.batteries[2].soc];
  const m=model(f);assert.equal(m.lowestSoc,null);assert.equal(m.highestSoc,null);assert.equal(m.soc,null);assert.equal(m.status,'partial');
});
test('overflow in sums, unit scaling, cell spread or estimated power cannot appear as Infinity',()=>{
  const f=fixture(2),g=f.config.virtual_batteries[0];for(const b of g.batteries)f.states[b.voltage]=state(1e308,'V');
  assert.equal(model(f).voltage,null);
  g.voltage='sensor.series_voltage';g.current='sensor.series_current';f.states[g.voltage]=state(1e308,'V');f.states[g.current]=state(2,'A');assert.equal(model(f).power,null);
  f.states[g.current]=state(1e308,'kA');assert.equal(model(f).current,null);
  assert.deepEqual(cellStats([1,1e308]),{complete:false,count:2,min:null,max:null,delta:null});
  assert.equal(cellVoltage(state('5e-324','mV')),null);
  assert.doesNotMatch(cardFor(f).shadowRoot.textContent,/Infinity|NaN/);
});
test('threshold inheritance is independent for groups and physical batteries',()=>{
  const f=fixture(2),g=f.config.virtual_batteries[0];f.config.thresholds={cell_min:2.5,delta_warning:40};g.thresholds={cell_max:4.2};g.batteries[1].thresholds={cell_min:3.0};
  const normalized=normalizeConfig(f.config).virtual_batteries[0];assert.equal(normalized.thresholds.cell_min,2.5);assert.equal(normalized.batteries[0].thresholds.cell_min,2.5);assert.equal(normalized.batteries[1].thresholds.cell_min,3.0);assert.equal(normalized.batteries[1].thresholds.cell_max,4.2);assert.equal(normalized.batteries[1].thresholds.delta_warning,40);
});
test('voltage range is display-only and cannot clamp values or replace absent sensors',()=>{
  const f=fixture(1),g=f.config.virtual_batteries[0];g.voltage_range={min:10,max:12};g.nominal_voltage=12.8;g.batteries[0].voltage_range={min:10,max:12};
  assert.equal(model(f).voltage,13.2);const card=cardFor(f);assert.equal(card.shadowRoot.querySelectorAll('.voltage-range.outside').length,2);
  delete f.states[g.batteries[0].voltage];assert.equal(model(f).voltage,null);
});
test('invalid modes, members, telemetry, duplicate sources and voltage configuration fail early',()=>{
  const invalid=[{virtual_batteries:[]},{virtual_batteries:[{batteries:[]}]},{virtual_batteries:[{batteries:Array(33).fill({})}]},{virtual_batteries:Array(33).fill({})},{virtual_batteries:{}}];
  for(const c of invalid)assert.throws(()=>normalizeConfig(c));
  const f=fixture(2),g=f.config.virtual_batteries[0];
  assert.throws(()=>normalizeConfig({...f.config,batteries:g.batteries}));
  for(const change of [{voltage:'bad'},{current:'bad'},{soc:'bad'},{power:'bad'},{availability:'bad'},{topology:'parallel'},{name:5},{accent:'lime'},{thresholds:null},{nominal_voltage:0},{nominal_voltage:Infinity},{nominal_voltage:'48'},{voltage_range:{min:0,max:0}},{voltage_range:{min:-1,max:5}},{voltage_range:{min:0,max:Infinity}},{voltage_range:[0,52]},{voltage_range:null}])assert.throws(()=>normalizeConfig({virtual_batteries:[{...g,...change}]}),JSON.stringify(change));
  const dup=fixture(2);dup.config.virtual_batteries[0].batteries[1].voltage=dup.config.virtual_batteries[0].batteries[0].voltage;assert.throws(()=>normalizeConfig(dup.config),/distinct/);
  const cellDup=fixture(2);cellDup.config.virtual_batteries[0].batteries[1].cells[0]=cellDup.config.virtual_batteries[0].batteries[0].cells[0];assert.throws(()=>normalizeConfig(cellDup.config),/distinct/);
  const cross=fixture(1);cross.config.virtual_batteries[0].batteries[0].cells[0]=cross.config.virtual_batteries[0].batteries[0].voltage;assert.throws(()=>normalizeConfig(cross.config),/distinct/);
  // The same physical bank may intentionally appear in separate comparison groups.
  assert.doesNotThrow(()=>normalizeConfig({virtual_batteries:[g,g]}));
});
test('physical mV normalization works in legacy layouts without changing configured objects',()=>{
  const f=fixture(2),b=f.config.virtual_batteries[0].batteries[1],c={batteries:[b]},snapshot=JSON.stringify(c);
  const normalized=normalizeConfig(c);close(batteryModel(normalized.batteries[0],f.states).voltage,13.2);
  const card=new HaJbdBmsCard();card.setConfig(c);card.hass={states:f.states};assert.match(card.shadowRoot.querySelector('.volts').textContent,/13\.20V/);assert.equal(JSON.stringify(c),snapshot);
});
test('virtual entities trigger redraw and keyboard details, preserve focus, and never call a service',()=>{
  const f=fixture(2),g=f.config.virtual_batteries[0];g.voltage='sensor.series_voltage';f.states[g.voltage]=state(26.4,'V');
  const card=cardFor(f);document.body.append(card);let opened;card.addEventListener('hass-more-info',e=>opened=e.detail.entityId);
  const target=card.shadowRoot.querySelector('.series-summary [data-entity="sensor.series_voltage"]');target.focus();target.dispatchEvent(new window.KeyboardEvent('keydown',{key:' ',bubbles:true}));assert.equal(opened,g.voltage);
  const original=card.shadowRoot.querySelector('.series-summary');card.hass={states:{...f.states,'sensor.unrelated':state(10)},callService:()=>assert.fail('read-only card')};assert.equal(card.shadowRoot.querySelector('.series-summary'),original);
  card.hass={states:{...f.states,[g.voltage]:state(26.5,'V')},callService:()=>assert.fail('read-only card')};assert.notEqual(card.shadowRoot.querySelector('.series-summary'),original);assert.equal(card.shadowRoot.activeElement.dataset.entity,g.voltage);assert.match(card.shadowRoot.querySelector('.series-voltage').textContent,/26\.50/);card.remove();
});
test('all locales translate virtual summaries and validation, preserve RTL isolation and escape literal names',()=>{
  for(const {code,dir}of LOCALES) {
    const f=fixture(1);f.config.language=code;f.config.virtual_batteries[0].name='<img src=x onerror=alert(1)>';
    const card=cardFor(f);assert.equal(card.dir,dir);assert.equal(card.shadowRoot.querySelector('.series-summary h2').textContent,f.config.virtual_batteries[0].name);assert.equal(card.shadowRoot.querySelectorAll('img,script').length,0);assert.match(card.shadowRoot.querySelector('.series-summary').textContent,new RegExp(MESSAGES[code].virtualBattery));
    assert.ok(card.shadowRoot.querySelectorAll('.series-summary bdi[dir="ltr"]').length>3);
    assert.throws(()=>normalizeConfig({...f.config,batteries:[]}),{message:MESSAGES[code].errorLayout});
    assert.throws(()=>normalizeConfig({language:code,virtual_batteries:[{batteries:f.config.virtual_batteries[0].batteries,current:'bad'}]}),{message:translate(code,'errorSeriesField',{field:'current'})});
    for(const key of ['virtualBattery','seriesMembers','voltageSum','lowestSoc','errorLayout','errorVoltageConfig'])if(code!=='en')assert.notEqual(MESSAGES[code][key],MESSAGES.en[key],`${code}:${key}`);
  }
});
