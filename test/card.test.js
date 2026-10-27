import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
const window = new Window();
for (const key of ['window','document','HTMLElement','customElements','CustomEvent']) globalThis[key]=window[key];
const {numericState,cellVoltage,cellStats,normalizeConfig,batteryModel,HaJbdBmsCard}=await import('../ha-jbd-bms-card.js');
const state=(value,unit)=>({state:String(value),attributes:{unit_of_measurement:unit}});
const config=()=>({type:'custom:ha-jbd-bms-card',batteries:[{name:'Battery A',soc:'sensor.soc',voltage:'sensor.voltage',current:'sensor.current',cells:['sensor.c1','sensor.c2','sensor.c3','sensor.c4']}]});
const states=()=>({'sensor.soc':state(0,'%'),'sensor.voltage':state(13.2,'V'),'sensor.current':state(-2.5,'A'),'sensor.c1':state(3.3,'V'),'sensor.c2':state(3.31,'V'),'sensor.c3':state(3.32,'V'),'sensor.c4':state(3.3,'V')});

test('unknown, empty, nonfinite and malformed values never become zero',()=>{
  for(const value of ['unknown','unavailable','',' ','NaN','Infinity','0x10','12V','null']) assert.equal(numericState(state(value)),null,value);
  assert.equal(numericState(undefined),null);
  assert.equal(numericState(state(0)),0);
  assert.equal(numericState(state(-2.5)),-2.5);
});
test('cell values normalize mV and reject invalid units or nonpositive voltage',()=>{
  assert.equal(cellVoltage(state(3305,'mV')),3.305);
  assert.equal(cellVoltage(state(3.305,'V')),3.305);
  assert.equal(cellVoltage(state(3.305)),3.305);
  assert.equal(cellVoltage(state(3.305,'A')),null);
  assert.equal(cellVoltage(state(0,'V')),null);
});
test('spread requires every configured cell; missing cells cannot produce reassuring zero',()=>{
  assert.deepEqual(cellStats([3.3,null]),{complete:false,count:1,min:null,max:null,delta:null});
  const stats=cellStats([3.3,3.31,3.29,3.3]);
  assert.equal(stats.count,4);assert.ok(Math.abs(stats.delta-20)<1e-8);
});
test('SOC zero is valid and negative current is preserved',()=>{
  const model=batteryModel(normalizeConfig(config()).batteries[0],states());
  assert.equal(model.soc,0);assert.equal(model.current,-2.5);assert.equal(model.status,'available');
});
test('invalid SOC and pack voltage are missing, not clamped',()=>{
  const s=states();s['sensor.soc']=state(101);s['sensor.voltage']=state(0);
  const m=batteryModel(normalizeConfig(config()).batteries[0],s);
  assert.equal(m.soc,null);assert.equal(m.voltage,null);assert.equal(m.status,'partial');
});
test('availability gates all retained entity values and does not assert freshness',()=>{
  const c=config();c.batteries[0].availability='binary_sensor.ready';
  const b=normalizeConfig(c).batteries[0],s=states();
  for(const gate of [undefined,'off','unavailable','unknown']) {
    if(gate)s['binary_sensor.ready']=state(gate);else delete s['binary_sensor.ready'];
    const m=batteryModel(b,s);assert.equal(m.status,'unavailable');assert.equal(m.soc,null);assert.equal(m.stats.delta,null);
  }
  s['binary_sensor.ready']=state('on');assert.equal(batteryModel(b,s).status,'available');
});
test('unchanged HA timestamp does not falsely make a stable reading stale',()=>{
  const s=states();s['sensor.c1'].last_updated='2000-01-01T00:00:00Z';
  assert.equal(batteryModel(normalizeConfig(config()).batteries[0],s).cells[0].value,3.3);
});
test('configuration rejects invalid entity IDs, duplicate cells and bad display thresholds',()=>{
  const c=config();c.batteries[0].soc='<script>';assert.throws(()=>normalizeConfig(c));
  const d=config();d.batteries[0].cells=['sensor.c1','sensor.c1'];assert.throws(()=>normalizeConfig(d));
  for(const thresholds of [{cell_min:4,cell_max:3},{delta_critical:20,delta_warning:30},{soc_low:101},{cell_min:NaN}]) assert.throws(()=>normalizeConfig({...config(),thresholds}));
});
test('per-battery threshold and accent overrides survive normalization',()=>{
  const c=config();c.thresholds={cell_min:2.5};c.batteries[0].thresholds={cell_max:3.6};c.batteries[0].accent='pink';
  const b=normalizeConfig(c).batteries[0];assert.equal(b.thresholds.cell_min,2.5);assert.equal(b.thresholds.cell_max,3.6);assert.equal(b.accent,'pink');
});
test('render escapes user and entity text; no external fetch, controls or invented telemetry',()=>{
  const c=config();c.title='<img src=x onerror=alert(1)>';c.batteries[0].name='<script>alert(1)</script>';
  const card=new HaJbdBmsCard();card.setConfig(c);card.hass={states:states(),language:'en'};
  assert.equal(card.shadowRoot.querySelectorAll('img,script').length,0);
  assert.match(card.shadowRoot.textContent,/<script>alert\(1\)<\/script>/);
  assert.match(card.shadowRoot.textContent,/freshness is not verified/);
  assert.equal(card.shadowRoot.querySelectorAll('.cell').length,4);
});
test('missing states render em dash and incomplete spread, including zero valid cells',()=>{
  const card=new HaJbdBmsCard();card.setConfig(config());card.hass={states:{},language:'en'};
  assert.match(card.shadowRoot.textContent,/Incomplete cells/);
  assert.match(card.shadowRoot.textContent,/0\/4/);
  assert.ok(!card.shadowRoot.textContent.includes('NaN'));
  assert.equal(card.shadowRoot.querySelector('.ring-label strong').textContent,'—');
});
test('more-info is keyboard accessible and only dispatches existing entities',()=>{
  const card=new HaJbdBmsCard();card.setConfig(config());card.hass={states:states(),language:'en'};
  let opened;card.addEventListener('hass-more-info',e=>opened=e.detail.entityId);
  const target=card.shadowRoot.querySelector('[data-entity="sensor.c1"]');
  target.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert.equal(opened,'sensor.c1');
  opened=null;card.hass={states:{},language:'en'};card.shadowRoot.querySelector('[data-entity="sensor.c1"]').click();assert.equal(opened,null);
});
test('unrelated hass state updates do not redraw, but relevant changes and language do',()=>{
  const card=new HaJbdBmsCard();card.setConfig(config());const s=states();card.hass={states:s,language:'en'};
  const original=card.shadowRoot.querySelector('ha-card');card.hass={states:{...s,'light.foo':state('on')},language:'en'};
  assert.equal(card.shadowRoot.querySelector('ha-card'),original);
  card.hass={states:{...s,'sensor.soc':state(50)},language:'en'};assert.notEqual(card.shadowRoot.querySelector('ha-card'),original);
  card.hass={states:s,language:'ru'};assert.match(card.shadowRoot.textContent,/Атлас батарей/);
});
test('eight batteries and 32 cells remain separate; no misleading aggregate SOC',()=>{
  const c=config();c.batteries=Array.from({length:8},(_,i)=>({...c.batteries[0],name:`Battery ${i+1}`}));
  const card=new HaJbdBmsCard();card.setConfig(c);card.hass={states:states(),language:'en'};
  assert.equal(card.shadowRoot.querySelectorAll('.battery').length,8);assert.equal(card.shadowRoot.querySelectorAll('.cell').length,32);
  assert.deepEqual(card.getGridOptions(),{columns:12,rows:'auto',min_columns:6});
});
test('equal out-of-range cells say low spread, never within voltage range',()=>{
  const s=states();for(const id of ['sensor.c1','sensor.c2','sensor.c3','sensor.c4'])s[id]=state(4.2,'V');
  const card=new HaJbdBmsCard();card.setConfig(config());card.hass={states:s,language:'en'};
  assert.equal(card.shadowRoot.querySelectorAll('.cell.critical').length,4);
  assert.equal(card.shadowRoot.querySelector('.spread-pill').textContent,'Low spread');
  assert.ok(!card.shadowRoot.textContent.includes('Within display range'));
});
test('power keeps useful precision for kW and MW units',()=>{
  const c=config();c.batteries[0].power='sensor.power';const s=states();
  for(const unit of ['kW','MW']){
    s['sensor.power']=state(0.25,unit);const card=new HaJbdBmsCard();card.setConfig(c);card.hass={states:s,language:'en'};
    assert.equal(card.shadowRoot.querySelector('[data-entity="sensor.power"] strong').textContent,'0.25');
  }
});
test('keyboard focus survives relevant state updates',()=>{
  const card=new HaJbdBmsCard();document.body.append(card);card.setConfig(config());const s=states();card.hass={states:s,language:'en'};
  card.shadowRoot.querySelector('[data-entity="sensor.c1"]').focus();
  card.hass={states:{...s,'sensor.c1':state(3.31,'V')},language:'en'};
  assert.equal(card.shadowRoot.activeElement?.dataset.entity,'sensor.c1');card.remove();
});
