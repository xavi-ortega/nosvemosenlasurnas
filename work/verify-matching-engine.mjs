import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ALGORITHM_VERSION, matchPolicyPreferences, similarity, minimumUnknownSimilarity } from '../outputs/matching-engine.mjs';
const f = JSON.parse(readFileSync(new URL('../outputs/matching-example.json', import.meta.url), 'utf8'));
const clone = x => structuredClone(x);
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-8, `${a} != ${b}`);
const run = (bundle=f.bundle,answers=f.answers,importance=f.importance,extra={}) => matchPolicyPreferences(bundle,answers,importance,{demoPolicy:f.demoPolicy,...extra});
const byId = r => Object.fromEntries(r.parties.map(p=>[p.candidacyId,p]));
let checks=0;
const check = (name, fn) => { fn(); checks++; console.log('PASS '+name); };
check('weighted worked example and narrow unknown bounds',()=>{
 const r=run();const p=byId(r);
 close(r.questionWeights.reduce((s,q)=>s+q.weight,0),1);
 close(p.X.observedIndex,90);close(p.X.coverage,5/6);
 close(p.X.missingEvidenceBounds.lower,100*5/6);close(p.X.missingEvidenceBounds.upper,100*11/12);
 close(p.Y.observedIndex,100*5/6);close(p.Y.coverage,1);
 close(p.Z.observedIndex,100);close(p.Z.coverage,0.25);close(p.Z.missingEvidenceBounds.lower,100*5/12);
 assert.equal(r.comparison.allowed,false);assert.deepEqual(r.comparison.scores,[]);
});
check('same evidence subset and unchanged original weights',()=>{
 const r=run(f.bundle,f.answers,f.importance,{cohortIds:['Y','X']});
 assert.equal(r.comparison.allowed,true);close(r.comparison.commonCoverage,5/6);
 const scores=Object.fromEntries(r.comparison.scores.map(x=>[x.candidacyId,x.sharedIndex]));
 close(scores.X,90);close(scores.Y,80);
});
check('same stances give full similarity; extremes give zero',()=>{
 for(const u of [-2,-1,0,1,2])close(similarity(u,u),1);
 close(similarity(-2,2),0);close(similarity(0,2),0.5);
});
check('neutral is scored; unsure and skipped answers are excluded',()=>{
 const neutral=run();assert.equal(neutral.responseCoverage.answeredQuestions,6);
 const answers={...f.answers,c2:'unsure',e2:'skip'};const r=run(f.bundle,answers);
 assert.equal(r.responseCoverage.answeredQuestions,4);
 assert.ok(!r.questionWeights.some(q=>['c2','e2'].includes(q.questionId)));
});
check('pending values never become scored evidence',()=>{
 const b=clone(f.bundle);b.positions.X.h1.status='pending';
 const p=byId(run(b)).X;assert.equal(p.knownQuestions,4);
 assert.equal(p.explanations.find(x=>x.questionId==='h1').partyStance,null);
});
check('no evidence returns an unavailable score, not neutrality',()=>{
 const b=clone(f.bundle);for(const q of b.questions)b.positions.X[q.id]={status:'not_stated'};
 const p=byId(run(b)).X;assert.equal(p.observedIndex,null);assert.equal(p.missingEvidenceBounds,null);close(p.coverage,0);
});
check('party and question order do not affect scores',()=>{
 const b=clone(f.bundle);b.questions.reverse();b.candidacies.reverse();const a=byId(run());const z=byId(run(b));
 for(const id of Object.keys(a)){close(a[id].observedIndex,z[id].observedIndex);close(a[id].coverage,z[id].coverage);}
});
check('inverting all policy directions preserves results',()=>{
 const b=clone(f.bundle);const answers=Object.fromEntries(Object.entries(f.answers).map(([id,v])=>[id,-v]));
 for(const map of Object.values(b.positions))for(const p of Object.values(map))if(p.status==='fixture')p.stance=-p.stance;
 const a=byId(run());const z=byId(run(b,answers));for(const id of Object.keys(a))close(a[id].observedIndex,z[id].observedIndex);
});
check('splitting a question weight cannot inflate a domain',()=>{
 const b=clone(f.bundle);const q=b.questions.find(q=>q.id==='h1');q.baseWeight=0.5;b.questions.push({...q,id:'h1copy'});
 for(const id of Object.keys(b.positions))b.positions[id].h1copy=clone(b.positions[id].h1);
 const z=byId(run(b,{...f.answers,h1copy:f.answers.h1}));const a=byId(run());
 for(const id of Object.keys(a))close(a[id].observedIndex,z[id].observedIndex);
});
check('bounds contain every allowed completion of the missing stance',()=>{
 const initial=byId(run()).X.missingEvidenceBounds;
 for(const value of [-2,-1,0,1,2]){
  const b=clone(f.bundle);b.positions.X.c2={...clone(b.positions.Y.c2),stance:value};
  const p=byId(run(b)).X;assert.ok(p.observedIndex>=initial.lower-1e-8 && p.observedIndex<=initial.upper+1e-8);
 }
 for(const u of [-2,-1,0,1,2])close(minimumUnknownSimilarity(u),Math.min(...[-2,-1,0,1,2].map(p=>similarity(u,p))));
});
check('zero-priority topics and no answers are handled explicitly',()=>{
 const r=run(f.bundle,f.answers,{housing:0,energy:1,care:0});assert.equal(r.responseCoverage.answeredQuestions,2);
 close(r.questionWeights.reduce((s,q)=>s+q.weight,0),1);
 const empty=run(f.bundle,{});assert.equal(empty.comparison.allowed,false);assert.ok(empty.parties.every(p=>p.observedIndex===null));
 const none=run(f.bundle,f.answers,{housing:0,energy:0,care:0});assert.equal(none.responseCoverage.activeQuestions,0);
});
check('near-score groups cannot chain into a wide apparent tie',()=>{
 const b=clone(f.bundle);for(const [id,q2] of [['X',-1],['Y',0],['Z',1]]){
  b.positions[id].e1=clone(b.positions.Y.e1);b.positions[id].e2={...clone(b.positions.Y.e2),stance:q2};
 }
 const r=matchPolicyPreferences(b,f.answers,{housing:0,energy:1,care:0},{demoPolicy:{...f.demoPolicy,minAnsweredQuestions:1,minAnsweredDomains:1,minCommonQuestions:1,minCommonDomains:1,closeScorePoints:13}});
 assert.equal(r.comparison.allowed,true);assert.equal(r.comparison.groups.length,2);
 for(const g of r.comparison.groups)assert.ok(g.highestIndex-g.lowestIndex<=13);
});
check('malformed inputs, citations and duplicate approvals are rejected',()=>{
 assert.throws(()=>run(f.bundle,{...f.answers,h1:3}));assert.throws(()=>run(f.bundle,{alien:0}));assert.throws(()=>run(f.bundle,f.answers,{housing:4}));
 const b=clone(f.bundle);b.positions.X.h1.approvedBy=['a','a'];assert.throws(()=>run(b));
 const blank=clone(f.bundle);blank.positions.X.h1.approvedBy=[null,undefined];assert.throws(()=>run(blank));
 const missing=clone(f.bundle);delete missing.evidence[missing.positions.X.h1.evidenceIds[0]];assert.throws(()=>run(missing));
 const duplicate=clone(f.bundle);duplicate.questions.push(clone(duplicate.questions[0]));assert.throws(()=>run(duplicate));
});
check('released datasets reject historical evidence and demo overrides',()=>{
 const b=clone(f.bundle);b.kind='released';b.electionId='synthetic-test-election';b.documents={};
 for(const [partyId,map] of Object.entries(b.positions))for(const p of Object.values(map))if(p.status==='fixture'){
  p.status='reviewed';for(const id of p.evidenceIds){
   b.evidence[id]={...b.evidence[id],documentId:'test-'+partyId,locator:'Synthetic test section'};
   b.documents['test-'+partyId]={type:'programme',electionId:b.electionId,candidacyIds:[partyId],sha256:'a'.repeat(64),sourceUrl:'https://fixture.invalid/programme'};
  }
 }
 assert.equal(matchPolicyPreferences(b,f.answers,f.importance).synthetic,false);
 const noElection=clone(b);delete noElection.electionId;assert.throws(()=>matchPolicyPreferences(noElection,f.answers,f.importance));
 assert.throws(()=>matchPolicyPreferences(b,f.answers,f.importance,{demoPolicy:f.demoPolicy}));
 b.documents['test-X'].electionId='historical-test-election';assert.throws(()=>matchPolicyPreferences(b,f.answers,f.importance));
});
check('pure function does not mutate or persist its inputs',()=>{
 const before=JSON.stringify(f);run();assert.equal(JSON.stringify(f),before);
 const source=readFileSync(new URL('../outputs/matching-engine.mjs',import.meta.url),'utf8');
 assert.ok(!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|navigator\.|document\.|window\./.test(source));
});
console.log(`${checks} meaningful verification groups passed for ${ALGORITHM_VERSION}.`);
