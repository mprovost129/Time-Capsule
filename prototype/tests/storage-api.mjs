import assert from 'node:assert/strict';
const base='http://localhost:3000';
const headers={cookie:'__sites_local_auth=1',origin:base};
const id=crypto.randomUUID();
const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0MsAAAAASUVORK5CYII=','base64');
async function req(path,init={}){const r=await fetch(base+path,{...init,headers:{...headers,...init.headers}});return r}
async function put(c,extra={}){return req('/api/capsules',{method:'PUT',headers:{'Content-Type':'application/json',...extra},body:JSON.stringify(c)})}
let capsule={id,name:'Storage test',title:'Disposable integration test',date:'2026-09-08',answers:{'Favorite thing?':'Saved across requests'},coverId:null,revision:0};
try{
 assert.equal((await fetch(base+'/api/capsules')).status,401,'unauthenticated library denied');
 assert.equal((await put(capsule,{origin:'https://untrusted.example'})).status,403,'cross-origin write denied');
 assert.equal((await put({...capsule,date:'2026-02-30'})).status,400,'impossible date denied');
 let response=await put(capsule);assert.equal(response.status,200,await response.clone().text());capsule=(await response.json()).capsule;
 const saved=(await (await req('/api/capsules')).json()).capsules.find(c=>c.id===id);assert.equal(saved.answers['Favorite thing?'],'Saved across requests');
 const updates=await Promise.all([put({...capsule,title:'First edit'}),put({...capsule,title:'Second edit'})]);assert.deepEqual(updates.map(r=>r.status).sort(),[200,409],'stale writes cannot overwrite');capsule=(await updates.find(r=>r.status===200).json()).capsule;
 const bad=new FormData();bad.set('photo',new Blob(['<svg/>'],{type:'image/svg+xml'}),'unsafe.svg');assert.equal((await req('/api/photos?capsuleId='+id,{method:'POST',body:bad})).status,415);
 const uploaded=[];
 for(let i=0;i<11;i++){const form=new FormData();form.set('photo',new Blob([image],{type:'image/png'}),`test-${i}.png`);const r=await req('/api/photos?capsuleId='+id,{method:'POST',body:form});assert.equal(r.status,i<10?201:409,await r.clone().text());if(i<10)uploaded.push((await r.json()).photo)}
 assert.equal((await (await req('/api/photos?capsuleId='+id)).json()).photos.length,10);
 const p=uploaded[0];const bytes=await req('/api/photos?id='+p.id);assert.equal(bytes.headers.get('content-type'),'image/png');assert.deepEqual(Buffer.from(await bytes.arrayBuffer()),image,'original bytes preserved');assert.equal((await fetch(base+'/api/photos?id='+p.id)).status,401);
 assert.equal((await req('/api/photos',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:p.id,caption:'A saved caption'})})).status,200);
 assert.equal((await (await req('/api/photos?capsuleId='+id)).json()).photos.find(x=>x.id===p.id).caption,'A saved caption');
 response=await put({...capsule,coverId:p.id});assert.equal(response.status,200);capsule=(await response.json()).capsule;
 assert.equal((await put({...capsule,coverId:crypto.randomUUID()})).status,400,'invalid cover denied');
 assert.equal((await req('/api/photos?id='+p.id,{method:'DELETE'})).status,200);assert.equal((await req('/api/photos?id='+p.id)).status,404);
 const after=(await (await req('/api/capsules')).json()).capsules.find(c=>c.id===id);assert.equal(after.coverId,null);
 console.log('PASS: save/read, concurrent-edit protection, date validation, authentication, cross-origin protection, upload type/count limits, original bytes, caption, cover, and photo deletion.');
}finally{const r=await req('/api/capsules?id='+id,{method:'DELETE'});assert.ok([200,404].includes(r.status));const result=await (await req('/api/capsules')).json();assert.ok(!result.capsules.some(c=>c.id===id));console.log('PASS: capsule deletion and test cleanup.');}
