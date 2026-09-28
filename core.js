export function parseNotes(text) { return text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean); }
export function randomIndex(n) {
  if (!Number.isSafeInteger(n)||n<1) throw new Error('没有可抽取的纸条');
  const limit=4294967296-4294967296%n, a=new Uint32Array(1);
  do { crypto.getRandomValues(a); } while(a[0]>=limit);
  return a[0]%n;
}
export function draw(pool,count,replace,rng=randomIndex) {
  if(!Number.isInteger(count)||count<1||count>500) throw new Error('一次请输入 1–500 张');
  if(!pool.length) throw new Error('箱子空了，请先全部放回或添加纸条');
  if(!replace&&count>pool.length) throw new Error('抽取数量超过剩余纸条，请减少数量或全部放回');
  const remaining=[...pool], picked=[];
  for(let i=0;i<count;i++){const p=rng(remaining.length);picked.push(remaining[p]);if(!replace)remaining.splice(p,1);}
  return {picked,remaining};
}
export function validateBackup(data) {
  if(data?.version!==1||!Array.isArray(data.boxes)||data.boxes.length>100)throw new Error('备份格式不正确，或箱子超过 100 个');
  return data.boxes.map(b=>{
    if(typeof b.name!=='string'||!b.name.trim()||b.name.length>60||!Array.isArray(b.notes)||!b.notes.length||b.notes.length>5000||b.notes.some(s=>typeof s!=='string'||!s.trim()||s.length>500))throw new Error('备份中的箱子或纸条格式不正确');
    if(!Array.isArray(b.remaining)||new Set(b.remaining).size!==b.remaining.length||b.remaining.some(n=>!Number.isInteger(n)||n<0||n>=b.notes.length))throw new Error('备份中的剩余纸条数据不正确');
    return {id:crypto.randomUUID(),name:b.name,notes:b.notes,remaining:b.remaining,history:[],settings:{count:1,replace:false,reset:true}};
  });
}
