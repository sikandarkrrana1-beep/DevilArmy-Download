// STEP: Replace this with your deployed Cloudflare Worker URL, e.g. https://devilarmy-api.YOUR-SUBDOMAIN.workers.dev
const API_BASE = "PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE";
let allFiles = [];
const $ = (id) => document.getElementById(id);
$("year").textContent = new Date().getFullYear();

function apiReady(){return API_BASE.startsWith("https://") && !API_BASE.includes("PASTE_");}
function setStatus(message){$("status").textContent=message;}
function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderFiles(items){
 const box=$("fileList");
 if(!items.length){box.innerHTML='<div class="file-card">Abhi koi file nahi mili.</div>';return;}
 box.innerHTML=items.map(f=>`<article class="file-card"><h3>${esc(f.title||f.name||"Untitled file")}</h3><div class="meta">${esc(f.category||"Other")} · ${esc(f.sizeLabel||"File")}</div><a href="${esc(f.downloadUrl)}" target="_blank" rel="noopener">Download</a></article>`).join("");
}
async function loadFiles(){
 if(!apiReady()){setStatus("Setup required: script.js mein Cloudflare Worker URL add karein.");return;}
 setStatus("Files load ho rahi hain…");
 try{const r=await fetch(API_BASE+"/api/files");const data=await r.json();if(!r.ok)throw new Error(data.error||"API error");allFiles=data.files||[];renderFiles(allFiles);setStatus(`${allFiles.length} files available`);}
 catch(e){setStatus("Files load nahi hui: "+e.message+" — Worker URL, deployment aur R2 binding check karein.");}
}
$("searchForm").addEventListener("submit",e=>{e.preventDefault();const q=$("searchInput").value.trim().toLowerCase();renderFiles(allFiles.filter(f=>`${f.title} ${f.category} ${f.name}`.toLowerCase().includes(q)));});
document.querySelectorAll("[data-category]").forEach(b=>b.addEventListener("click",()=>{const c=b.dataset.category;renderFiles(c?allFiles.filter(f=>(f.category||"Other").toLowerCase()===c.toLowerCase()):allFiles);}));
$("uploadForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!apiReady()){$("uploadStatus").textContent="Pehle script.js mein Worker URL set karein.";return;}
 const file=$("fileInput").files[0];if(!file)return;
 const form=new FormData();form.append("file",file);form.append("title",$("fileTitle").value.trim());form.append("category",$("fileCategory").value);
 $("uploadStatus").textContent="Upload ho raha hai…";
 try{const r=await fetch(API_BASE+"/api/upload",{method:"POST",headers:{"Authorization":"Bearer "+$("adminToken").value},body:form});const data=await r.json();if(!r.ok)throw new Error(data.error||"Upload failed");$("uploadStatus").textContent="Upload successful ✅";$("uploadForm").reset();await loadFiles();}
 catch(err){$("uploadStatus").textContent="Upload error: "+err.message;}
});
loadFiles();
