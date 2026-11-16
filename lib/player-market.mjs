/** Original Player Market transforms, separate from transcript measurements. */
import {readFileSync,realpathSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';import {spawn} from 'node:child_process';
const binding=JSON.parse(readFileSync(new URL('../contracts/player-owner.json',import.meta.url),'utf8'));
const digest=b=>createHash('sha256').update(b).digest('hex');
export const PLAYER_IDS=Object.freeze(['form_heat','relative_form','session_tape','peak_from_peak','form_stack','vault_fill','desk_receipt']);
export function playerOwnerBinding(){return structuredClone(binding)}
function validate(request){
 if(!request||Object.keys(request).sort().join(',')!=='instruments,request_id,schema,source,source_sha256'||request.schema!=='instrument-that.player-reading/v1'||!/^[a-f0-9]{32}$/.test(request.request_id||'')||!Array.isArray(request.instruments)||!request.instruments.length||new Set(request.instruments).size!==request.instruments.length||request.instruments.some(id=>!PLAYER_IDS.includes(id)))throw Error('Choose existing Player instrument transforms.');
 const source=request.source;
 if(!source||Object.keys(source).sort().join(',')!=='league_bench,player_id,sessions,team_bench,vault'||typeof source.player_id!=='string'||! /^[a-zA-Z0-9_-]{1,64}$/.test(source.player_id)||!source.vault||Array.isArray(source.vault))throw Error('Use an explicit Player source record.');
 for(const rows of [source.sessions,source.team_bench,source.league_bench]){
  if(!Array.isArray(rows)||rows.length<15||rows.length>1000)throw Error('Use15–1000 actual sessions and explicit benchmarks.');
  for(const row of rows){if(!row||typeof row!=='object'||Object.keys(row).some(k=>!['rank_price','minutes','open','high','low','session_id','date'].includes(k))||!Number.isFinite(row.rank_price)||row.rank_price<=0)throw Error('A session source is malformed.');for(const [key,value]of Object.entries(row)){if(['session_id','date'].includes(key)){if(typeof value!=='string'||value.length>64)throw Error('Session identity is malformed.')}else if(!Number.isFinite(value)||value<0||value>1e12)throw Error('A session measure is malformed.')}}
 }
 for(const [key,value] of Object.entries(source.vault))if(!['accolades_held','family_room','sessions_left'].includes(key)||!Number.isFinite(value)||value<0||value>1e12)throw Error('Vault facts are malformed.');
 if(digest(JSON.stringify(source))!==request.source_sha256)throw Error('The exact Player source changed.');
}
export async function invokePlayerSelected(request,{admit,installedRoot}={}){
 const text=JSON.stringify(request);if(Buffer.byteLength(text)>1024*1024)throw Error('The source is too large.');const snapshot=JSON.parse(text);validate(snapshot);
 if(typeof admit!=='function'||typeof installedRoot!=='string')throw Error('The registered admission and Player owners are unavailable.');
 const requestHash=digest(text);if(await admit(Object.freeze({request_id:snapshot.request_id,request_sha256:requestHash,source_sha256:snapshot.source_sha256,instruments:Object.freeze([...snapshot.instruments])}))!==true)throw Error('This exact Player reading is not admitted.');
 const root=realpathSync(installedRoot);
 const verify=()=>{for(const [path,expected]of Object.entries(binding.files)){const file=join(root,path);if(realpathSync(file)!==file||digest(readFileSync(file))!==expected.sha256)throw Error('The accepted Player owner source changed.')}};verify();
 const output=await new Promise((resolve,reject)=>{const child=spawn('python3',['-I','-B',new URL('../scripts/read-player-instruments.py',import.meta.url).pathname,join(root,'architecture/venture-mode/python')],{shell:false,stdio:['pipe','pipe','pipe']});let n=0,parts=[],done=false;const fail=()=>{if(done)return;done=true;clearTimeout(timer);child.kill();reject(Error('The Player owner did not return a bounded reading.'))};const timer=setTimeout(fail,10000);child.stdout.on('data',b=>{n+=b.length;if(n>1024*1024)fail();else parts.push(b)});child.stderr.resume();child.on('error',fail);child.stdin.on('error',fail);child.on('close',code=>{if(done)return;done=true;clearTimeout(timer);if(code!==0)return reject(Error('The Player owner refused the reading.'));try{resolve(JSON.parse(Buffer.concat(parts).toString('utf8')))}catch{reject(Error('The Player owner returned malformed data.'))}});child.stdin.end(text)});verify();
 if(output.schema!=='instrument-that.player-readings/v1'||output.request_id!==snapshot.request_id||output.source_sha256!==snapshot.source_sha256||JSON.stringify(output.readings?.map(row=>row.instrument))!==JSON.stringify(snapshot.instruments))throw Error('The Player owner readback changed.');
 return {schema:'instrument-that.player-receipt/v1',request_sha256:requestHash,measurement_owner:binding.repository,measurement_owner_revision:binding.revision,result:output,limitations:['Rank Price session transforms are not media analysis or investment advice.','Original desk receipt data is not actor identity, admission or independent commissioning.','No price, benchmark or vault data was fetched.']};
}
