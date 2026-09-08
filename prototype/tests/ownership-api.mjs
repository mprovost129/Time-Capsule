import assert from 'node:assert/strict';
const base='http://localhost:3000';const id='f122a743-92ee-4c6b-9f37-000000000001';const headers={cookie:'__sites_local_auth=1',origin:base};
const list=await (await fetch(base+'/api/capsules',{headers})).json();assert.ok(!list.capsules.some(c=>c.id===id));
assert.equal((await fetch(base+'/api/photos?capsuleId='+id,{headers})).status,404);
assert.equal((await fetch(base+'/api/capsules?id='+id,{method:'DELETE',headers})).status,404);
const body={id,name:'Attempt',title:'Attempt',date:'2026-09-08',answers:{},coverId:null,revision:1};
assert.equal((await fetch(base+'/api/capsules',{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(body)})).status,409);
console.log('PASS: another owner’s capsule is excluded from library and rejects photo access, writes, and deletion.');
