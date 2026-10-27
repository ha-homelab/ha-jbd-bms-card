import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';
import {checkBundle} from '../scripts/build-i18n.mjs';
const window = new Window();
for(const key of ['window','document','HTMLElement','customElements','CustomEvent'])globalThis[key]=window[key];
const {LOCALES,MESSAGES,resolveLocale,selectedLocale,translate,normalizeConfig,HaJbdBmsCard}=await import('../ha-jbd-bms-card.js');
const config=()=>({type:'custom:ha-jbd-bms-card',batteries:[{soc:'sensor.soc',voltage:'sensor.voltage',current:'sensor.current',cells:['sensor.c1','sensor.c2']}]});
const state=(value,unit)=>({state:String(value),attributes:{unit_of_measurement:unit}});
const states=()=>({'sensor.soc':state(72,'%'),'sensor.voltage':state(6.6,'V'),'sensor.current':state(-2.5,'A'),'sensor.c1':state(3.3,'V'),'sensor.c2':state(3.3,'V')});
const expectedCodes=['en','ar','bn','cs','de','es','fa','fr','he','hi','id','it','ja','ko','nl','pl','pt','ru','th','tr','uk','vi','zh-Hans','zh-Hant'];

test('all 24 complete packs match canonical keys/placeholders and deterministic offline bundle',async()=>{
  assert.deepEqual(LOCALES.map(x=>x.code),expectedCodes);
  const {source,updated}=await checkBundle();assert.equal(source,updated);
  assert.doesNotMatch(source,/\bimport\s*(?:\(|.*from\b)|\bfetch\s*\(/);
  const placeholders=s=>[...s.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map(x=>x[1]).sort();
  for(const {code} of LOCALES){
    const dictionary=JSON.parse(await readFile(new URL(`../locales/${code}.json`,import.meta.url),'utf8'));
    assert.deepEqual(MESSAGES[code],dictionary);
    assert.deepEqual(Object.keys(dictionary).sort(),Object.keys(MESSAGES.en).sort());
    for(const [key,text]of Object.entries(dictionary)){assert.ok(text.trim(),`${code}:${key}`);assert.deepEqual(placeholders(text),placeholders(MESSAGES.en[key]),`${code}:${key}`);}
    for(const key of ['source','subtitle','moreInfo','errorBatteries'])if(code!=='en')assert.notEqual(dictionary[key],MESSAGES.en[key],`${code}:${key}`);
  }
});
test('regional tags, Chinese scripts, unsupported input and prototype-shaped keys resolve safely',()=>{
  for(const [input,expected]of [['pt-BR','pt'],[' EN_us ','en'],['fr-CA','fr'],['de-AT','de'],['zh','zh-Hans'],['zh-CN','zh-Hans'],['zh-SG','zh-Hans'],['zh-TW','zh-Hant'],['zh-HK','zh-Hant'],['zh-MO','zh-Hant'],['zh-Hans-TW','zh-Hans'],['ZH_hant','zh-Hant'],['ru-RU','ru'],['fa-IR','fa'],['xx',null],['__proto__',null],[null,null],[{},null]])assert.equal(resolveLocale(input),expected,String(input));
  assert.equal(translate('xx','soc'),MESSAGES.en.soc);
  assert.equal(translate('ru','constructor'),'constructor');
  assert.equal(translate('ru','absent.key'),'absent.key');
  assert.equal(translate('en','moreInfo',{name:'{name} {value} <b>x</b>'}),'Show details: {name} {value} <b>x</b>');
});
test('automatic selection mirrors DESLOC: override, HA profile, legacy HA property, English',()=>{
  assert.equal(selectedLocale({},{}),'en');
  assert.equal(selectedLocale({}, {language:'de',locale:{language:'fr-CA'}}),'fr');
  assert.equal(selectedLocale({}, {language:'ru-RU'}),'ru');
  assert.equal(selectedLocale({language:'auto'},{locale:{language:'ja'}}),'ja');
  assert.equal(selectedLocale({language:'de-AT'},{locale:{language:'ja'}}),'de');
  assert.equal(selectedLocale({language:'not-supported'},{locale:{language:'ja'}}),'en');
  assert.equal(selectedLocale({}, {locale:{language:'not-supported'},language:'ru'}),'en');
});
for(const {code,dir}of LOCALES){
  test(`${code}: default text, accessibility, validation and direction render from the selected pack`,()=>{
    const card=new HaJbdBmsCard(),c=config();card.setConfig(c);card.hass={states:states(),locale:{language:code}};
    assert.equal(card.lang,code);assert.equal(card.dir,dir);
    assert.equal(card.shadowRoot.querySelector('h1').textContent,MESSAGES[code].title);
    assert.equal(card.shadowRoot.querySelector('h2').textContent,translate(code,'defaultBattery',{number:1}));
    assert.equal(card.shadowRoot.querySelector('.footer').textContent,MESSAGES[code].source);
    assert.equal(card.shadowRoot.querySelector('.status').textContent,MESSAGES[code].available);
    assert.equal(card.shadowRoot.querySelector('[data-entity="sensor.current"]').getAttribute('aria-label'),translate(code,'moreInfo',{name:MESSAGES[code].current}));
    assert.ok(card.shadowRoot.querySelectorAll('bdi[dir="ltr"]').length>=4);
    assert.throws(()=>card.setConfig({batteries:[]}),{message:MESSAGES[code].errorBatteries});
    const bad=config();bad.batteries[0].soc='invalid';
    assert.throws(()=>card.setConfig(bad),{message:translate(code,'errorEntity',{battery:1,field:'soc'})});
    assert.throws(()=>normalizeConfig({...config(),language:code,thresholds:{cell_min:NaN}}),{message:MESSAGES[code].errorThresholds});
  });
}
test('profile changes redraw without changing literal names, entities, metrics or config',()=>{
  const c=config();c.title='Battery room';c.batteries[0].name='<img src=x onerror="alert(1)"> {name} שלום';
  c.batteries[0].cells=[{entity:'sensor.c1',name:'<b>C1</b> {value}'},'sensor.c2'];
  const s=states(),before=JSON.stringify({c,s}),card=new HaJbdBmsCard();card.setConfig(c);
  let events=0;card.addEventListener('hass-more-info',()=>events++);
  for(const {code,dir}of LOCALES){
    card.hass={states:s,locale:{language:code},callService:()=>assert.fail('A locale change must not call services')};
    assert.equal(card.shadowRoot.querySelector('h1').textContent,c.title);
    assert.equal(card.shadowRoot.querySelector('h2').textContent,c.batteries[0].name);
    assert.equal(card.shadowRoot.querySelector('.cell-label').textContent,'<b>C1</b> {value}');
    assert.equal(card.shadowRoot.querySelectorAll('img,script').length,0);
    assert.equal(card.lang,code);assert.equal(card.dir,dir);
    assert.equal(card.shadowRoot.querySelectorAll('.cell').length,2);
  }
  assert.equal(JSON.stringify({c,s}),before);assert.equal(events,0);
});
test('per-card override stays independent of HA profile and auto returns to it',()=>{
  const card=new HaJbdBmsCard();card.setConfig({...config(),language:'fr-CA'});card.hass={states:states(),locale:{language:'ar'}};assert.equal(card.lang,'fr');
  card.hass={states:states(),locale:{language:'ja'}};assert.equal(card.lang,'fr');
  card.setConfig({...config(),language:'auto'});assert.equal(card.lang,'ja');
  card.setConfig({...config(),language:'unsupported'});assert.equal(card.lang,'en');
  const second=new HaJbdBmsCard();second.setConfig(config());second.hass={states:states(),locale:{language:'ar'}};assert.equal(second.dir,'rtl');assert.equal(card.dir,'ltr');
});
test('language config accepts regional and unsupported tags but rejects invalid data types',()=>{
  for(const language of ['',null,42,{},[],true])assert.throws(()=>normalizeConfig({...config(),language}));
  for(const language of ['auto','fr-CA','zh-Hans-TW','unsupported'])assert.doesNotThrow(()=>normalizeConfig({...config(),language}));
});
test('picker stub leaves generated names unset so defaults follow the eventual HA profile',()=>{
  const stub=HaJbdBmsCard.getStubConfig();assert.equal(stub.batteries[0].name,undefined);
  const card=new HaJbdBmsCard();card.setConfig(stub);
  for(const language of ['en','de','ar']){
    card.hass={states:{},locale:{language}};
    assert.equal(card.shadowRoot.querySelector('h2').textContent,translate(language,'defaultBattery',{number:1}));
    assert.equal(card._config.batteries[0].name,undefined);
  }
});
