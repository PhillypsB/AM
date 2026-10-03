/* Dependency-free syntax and local entry-point reference checks. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');let checked=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 if(['node_modules','.git','test-results'].includes(entry.name))continue;
 const file=path.join(dir,entry.name);
 if(entry.isDirectory())walk(file);
 else if(/\.(js|cjs)$/.test(file)){new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});checked++;}
}}
walk(root);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#?]+)"/g)){
 if(/^(?:https?:|data:|#|\.\.\/)/.test(match[1]))continue;
 if(!fs.existsSync(path.join(root,match[1])))throw Error('Missing reference: '+match[1]);
}
for(const file of ['app/config.js','app/loader.js','index.html']){
 if(/C:\\Users\\|C:\/Users\//i.test(fs.readFileSync(path.join(root,file),'utf8')))throw Error('Personal path in '+file);
}
console.log(`OK: ${checked} JavaScript files parsed; entry-point references and portable configuration checked.`);
