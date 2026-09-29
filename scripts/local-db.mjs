import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
// Each file is applied once per checkout; preserve the local database and journal.
const journal='.sites-runtime/applied-migrations.json';
const applied=fs.existsSync(journal)?JSON.parse(fs.readFileSync(journal,'utf8')):[];
for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort()){
 if(applied.includes(file))continue;
 const result=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--file',path.join('drizzle',file)],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status??1);
 applied.push(file);fs.mkdirSync(path.dirname(journal),{recursive:true});fs.writeFileSync(journal,JSON.stringify(applied,null,2)+'\n');
}
