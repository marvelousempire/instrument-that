/** Registry/composition only. Media Resolver remains the sole measurement owner. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {realpath} from 'node:fs/promises';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const inventory=JSON.parse(readFileSync(new URL('../data/instruments.json',import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
export const MR_REVISION='1e378fa9d7bd42ac94f219951adc3d1af86f33b2';
export function catalog(){return structuredClone(inventory)}
export function validateCatalog(){
 const ids=new Set();let callable=0;
 if(inventory.schema!=='instrument-that.catalog/v1'||inventory.instruments.length!==54)throw Error('The catalog identity changed.');
 for(const row of inventory.instruments){
  if(!/^[a-z][a-z0-9_-]*$/.test(row.id)||ids.has(row.id)||!row.groups.length)throw Error('The catalog is malformed.');
  ids.add(row.id);
  if(row.port){if(!['media-resolver.selected-instrument-reading/v1','instrument-that.player-reading/v1'].includes(row.port)||row.port.startsWith('media-resolver')&&row.measurement_owner!=='media-resolver'||row.port.startsWith('instrument-that')&&row.measurement_owner!=='red-e-play-app')throw Error('The owner binding is malformed.');callable++}
  else if(row.availability!=='unbound')throw Error('An unbound instrument cannot be offered.');
 }
 if(callable!==46)throw Error('The callable source set changed.');return true;
}
function snapshotRequest(request){
 if(!request||typeof request!=='object'||Array.isArray(request))throw Error('Use one source-bound reading.');
 const text=JSON.stringify(request);if(Buffer.byteLength(text)>12*1024*1024)throw Error('The reading is too large.');
 const copy=JSON.parse(text),fields=['instruments','request_id','schema','transcript','transcript_sha256',...(Object.hasOwn(copy,'media')?['media']:[]),...(Object.hasOwn(copy,'word_timing')?['word_timing']:[])].sort().join(',');
 if(Object.keys(copy).sort().join(',')!==fields||copy.schema!=='media-resolver.selected-instrument-reading/v1'||! /^[a-f0-9]{32}$/.test(copy.request_id||''))throw Error('The request identity is malformed.');
 if(typeof copy.transcript!=='string'||!copy.transcript.trim()||Buffer.byteLength(copy.transcript)>65536||Buffer.from(copy.transcript).toString()!==copy.transcript||sha(copy.transcript)!==copy.transcript_sha256)throw Error('The retained original changed.');
 if(!Array.isArray(copy.instruments)||!copy.instruments.length||new Set(copy.instruments).size!==copy.instruments.length||copy.instruments.some(id=>!inventory.instruments.some(row=>row.id===id&&row.port==='media-resolver.selected-instrument-reading/v1')))throw Error('A selected instrument has no callable owner port.');
 return {copy,text,digest:sha(text)};
}
/** Trusted host supplies admission/readback; no grant is accepted from request JSON. */
export async function invokeSelected(request,{admit,runOwner}={}){
 validateCatalog();const {copy,text,digest}=snapshotRequest(request);
 if(typeof admit!=='function'||typeof runOwner!=='function')throw Error('The registered admission and measurement owners are unavailable.');
 const admitted=await admit(Object.freeze({request_id:copy.request_id,request_sha256:digest,transcript_sha256:copy.transcript_sha256,instruments:Object.freeze([...copy.instruments]),media_sha256:copy.media?.sha256??null,word_timing_sha256:copy.word_timing?sha(JSON.stringify(copy.word_timing)):null}));
 if(admitted!==true)throw Error('This exact reading is not admitted.');
 const result=await runOwner(JSON.parse(text));
 if(!result||result.schema!==copy.schema||result.owner!=='media-resolver'||result.request_id!==copy.request_id||result.source?.transcript_sha256!==copy.transcript_sha256||copy.media&&result.source?.media?.sha256!==copy.media.sha256)throw Error('The measurement owner source readback changed.');
 if(copy.word_timing&&(result.source?.word_timing?.words_sha256!==copy.word_timing.words_sha256||result.source?.word_timing?.audio_sha256!==copy.word_timing.audio_sha256||result.source?.word_timing?.transcript_sha256!==copy.word_timing.transcript_sha256||result.source?.word_timing?.engine!==copy.word_timing.engine||result.source?.word_timing?.word_count!==copy.word_timing.words?.length))throw Error('The retained word timing readback changed.');
 if(result.ok===true&&(JSON.stringify(result.requested)!==JSON.stringify(copy.instruments)||!Array.isArray(result.readings)||result.readings.some(row=>!copy.instruments.includes(row.instrument))))throw Error('The measurement owner selection readback changed.');
 if(typeof result.ok!=='boolean'||!['read','unavailable'].includes(result.status))throw Error('The measurement owner status is malformed.');
 return {schema:'instrument-that.reading/v1',request_sha256:digest,measurement_owner_revision:MR_REVISION,result};
}
/** Deployment configuration only, never a request field. Fixed argv, exact clean source. */
export function localMediaResolver(root){
 return async request=>{
  const resolved=await realpath(root);
  const revision=(await exec('git',['-C',resolved,'rev-parse','HEAD'])).stdout.trim();
  const dirty=(await exec('git',['-C',resolved,'status','--porcelain','--untracked-files=all'])).stdout;
  if(revision!==MR_REVISION||dirty)throw Error('The installed measurement source is not the accepted clean revision.');
  const result=await new Promise((resolve,reject)=>{
   const child=spawn(process.execPath,[join(resolved,'scripts/read-selected-instrument-projections.mjs')],{cwd:resolved,stdio:['pipe','pipe','pipe'],shell:false,env:{PATH:process.env.PATH,HOME:process.env.HOME,LANG:'en_US.UTF-8'}});
   let size=0,parts=[],settled=false;
   const fail=()=>{if(settled)return;settled=true;clearTimeout(timer);child.kill();reject(Error('The measurement owner did not return a bounded reading.'))};
   const timer=setTimeout(fail,125000);
   child.stdout.on('data',block=>{size+=block.length;if(size>1024*1024)fail();else parts.push(block)});
   child.stderr.resume();child.on('error',fail);child.stdin.on('error',fail);
   child.on('close',code=>{if(settled)return;settled=true;clearTimeout(timer);if(![0,3].includes(code))return reject(Error('The measurement owner refused the reading.'));try{resolve(JSON.parse(Buffer.concat(parts).toString('utf8')))}catch{reject(Error('The measurement owner result is malformed.'))}});
   child.stdin.end(JSON.stringify(request));
  });
  const after=(await exec('git',['-C',resolved,'rev-parse','HEAD'])).stdout.trim();
  const changed=(await exec('git',['-C',resolved,'status','--porcelain','--untracked-files=all'])).stdout;
  if(after!==revision||changed)throw Error('The measurement owner source changed during reading.');
  return result;
 };
}
