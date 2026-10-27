// Cloudflare Worker + R2. Create an R2 bucket and bind it as FILES.
// Add Worker secret ADMIN_TOKEN. Add plain-text variable ALLOWED_ORIGIN with your GitHub Pages origin,
// e.g. https://YOUR-USERNAME.github.io (or your custom domain). Never put ADMIN_TOKEN in frontend code.
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
 "audio/mpeg","audio/mp4","audio/wav","audio/ogg","audio/aac",
 "video/mp4","video/webm","image/jpeg","image/png","image/webp","application/pdf",
 "application/zip","application/x-zip-compressed","application/octet-stream"
]);
function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8",...headers}});}
function cors(request,env){
 const origin=request.headers.get("Origin")||"";
 const allowed=env.ALLOWED_ORIGIN||"";
 const allow=allowed && origin===allowed ? origin : (allowed ? "" : "*");
 return {"Access-Control-Allow-Origin":allow||"null","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Max-Age":"86400","Vary":"Origin"};
}
function safeName(s){return String(s||"file").replace(/[^\w.\- ()]/g,"_").slice(0,120)||"file";}
function sizeLabel(n){if(n<1024)return n+" B";if(n<1048576)return (n/1024).toFixed(1)+" KB";return (n/1048576).toFixed(1)+" MB";}
export default {
 async fetch(request,env){
  const url=new URL(request.url), headers=cors(request,env);
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
  try{
   if(url.pathname==="/api/files"&&request.method==="GET"){
    const listed=await env.FILES.list({limit:1000});
    const files=listed.objects.map(o=>{const meta=o.customMetadata||{};return {key:o.key,name:meta.originalName||o.key,title:meta.title||meta.originalName||o.key,category:meta.category||"Other",sizeLabel:sizeLabel(o.size),downloadUrl:url.origin+"/download/"+encodeURIComponent(o.key)};}).sort((a,b)=>a.title.localeCompare(b.title));
    return json({files},200,headers);
   }
   if(url.pathname==="/api/upload"&&request.method==="POST"){
    const auth=request.headers.get("Authorization")||"";
    if(!env.ADMIN_TOKEN||auth!=="Bearer "+env.ADMIN_TOKEN)return json({error:"Unauthorized admin token"},401,headers);
    const form=await request.formData(), file=form.get("file");
    if(!file||typeof file==="string")return json({error:"File missing"},400,headers);
    if(file.size>MAX_BYTES)return json({error:"Maximum file size is 25 MB"},413,headers);
    const type=file.type||"application/octet-stream";
    if(!ALLOWED_TYPES.has(type))return json({error:"File type not allowed"},415,headers);
    const originalName=safeName(file.name), key=Date.now()+"-"+crypto.randomUUID()+"-"+originalName;
    const title=String(form.get("title")||originalName).slice(0,120);
    const category=String(form.get("category")||"Other").slice(0,40);
    await env.FILES.put(key,file.stream(),{httpMetadata:{contentType:type,contentDisposition:`attachment; filename="${originalName.replace(/["\\]/g,"_")}"`},customMetadata:{originalName,title,category}});
    return json({ok:true,key,title},201,headers);
   }
   if(url.pathname.startsWith("/download/")&&request.method==="GET"){
    const key=decodeURIComponent(url.pathname.slice("/download/".length));
    if(!key||key.includes("..")||key.includes("/"))return json({error:"Invalid file key"},400,headers);
    const obj=await env.FILES.get(key);if(!obj)return json({error:"File not found"},404,headers);
    const responseHeaders=new Headers(headers);obj.writeHttpMetadata(responseHeaders);responseHeaders.set("etag",obj.httpEtag);responseHeaders.set("Content-Length",String(obj.size));responseHeaders.set("Content-Disposition",responseHeaders.get("Content-Disposition")||'attachment; filename="download"');
    return new Response(obj.body,{headers:responseHeaders});
   }
   return json({error:"Not found"},404,headers);
  }catch(e){return json({error:"Server error",detail:String(e?.message||e)},500,headers);}
 }
};
