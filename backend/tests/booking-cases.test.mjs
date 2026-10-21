import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
const source=readFileSync(new URL('../../frontend/src/data/bookingCases.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const module={exports:{}};runInNewContext(code,{module,exports:module.exports});
const {casesForBookings}=module.exports;
const cargo=(id,extra={})=>({id,type:'Cargo Shortage',desc:'One crate needs checking',status:'Under Review',createdAt:'2026-10-21T01:00:00Z',photos:[],response:null,adminNotes:[],...extra});
const booking=(id,extra={})=>({id,bookingId:'BK-'+id,requestId:'REQ-'+id,customer:'Customer '+id,assignment:{business:'Operator '+id},createdAt:'2026-10-20T01:00:00Z',events:[],dispatch:{issue:null,payIssue:null},...extra});
test('empty case inventory has no sample complaints or invented records',()=>{assert.equal(casesForBookings([]).length,0);assert.equal(casesForBookings([booking('one')]).length,0);});
test('cases include actual cargo and payment reports across different bookings',()=>{
 const result=casesForBookings([booking('one',{dispatch:{issue:cargo('ISS-REAL'),payIssue:null}}),booking('two',{dispatch:{issue:null,payIssue:{id:'PAY-REAL',type:'Incorrect Amount',note:'Please review transfer',by:'operator',status:'Under Review',attachmentIds:['receipt-real'],createdAt:'2026-10-21T02:00:00Z'}}})]);
 assert.equal(result.length,2);assert.equal(result[0].id,'PAY-REAL');assert.equal(result[0].bookingId,'two');assert.equal(result[0].operator,'Operator two');assert.equal(result[0].description,'Please review transfer');assert.equal(result[0].attachmentIds[0],'receipt-real');assert.equal(result[1].customer,'Customer one');
});
test('resolved cargo remains visible with evidence and resolution without duplicating the open case',()=>{
 const active=booking('one',{dispatch:{issue:cargo('ISS-REAL'),payIssue:null}});
 const before=casesForBookings([active]);assert.equal(before[0].status,'Under Review');
 const after=casesForBookings([{...active,dispatch:{issue:null,payIssue:null},resolvedIssues:[cargo('ISS-REAL',{resolution:'Count checked with receiver',resolvedAt:'2026-10-21T03:00:00Z',photos:[{attachmentId:'evidence-real',label:'Crate count'}]})]}]);
 assert.equal(after.length,1);assert.equal(after[0].key,before[0].key);assert.equal(after[0].status,'Resolved');assert.equal(after[0].resolution,'Count checked with receiver');assert.equal(after[0].photos[0].attachmentId,'evidence-real');
});
test('legacy case dates use saved booking events and resolved payment metadata is retained',()=>{
 const b=booking('one',{events:[{label:'Cargo Issue Reported',at:'2026-10-20T12:00:00Z'}],dispatch:{issue:cargo('ISS-OLD',{createdAt:undefined}),payIssue:{id:'PAY-OLD',type:'Receipt concern',note:'Please check receipt',by:'customer',status:'Resolved',resolution:'Transfer confirmed',resolvedAt:'2026-10-21T04:00:00Z'}}});
 const result=casesForBookings([b]);assert.equal(result.find(c=>c.id==='ISS-OLD').createdAt,'2026-10-20T12:00:00Z');assert.equal(result.find(c=>c.id==='PAY-OLD').resolution,'Transfer confirmed');
});
