/* Utilidades compartidas: lectura de Instagram (Behold / Graph API) */
window.IG={
 parse(u){const m=/instagram\.com\/(?:[^\/]+\/)?(p|reel|reels|tv)\/([^\/?#]+)/.exec(u||"");return m?{t:m[1]=="p"?"p":"reel",id:m[2]}:null},
 short(ts){try{return new Date(ts).toLocaleDateString("es",{day:"numeric",month:"short"}).replace(".","")}catch(e){return ""}},
 async fetch(source,max){
  let url=(source||"").trim();if(!url)throw new Error("Falta la fuente");
  if(!/^https?:/i.test(url))url="https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit="+max+"&access_token="+encodeURIComponent(url);
  const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);
  const j=await r.json(),arr=Array.isArray(j)?j:(j.posts||j.data||[]);
  const out=arr.filter(p=>p&&p.permalink).map(p=>{
   const cap=(p.caption||p.prunedCaption||"").trim(),ln=cap.split(/\n+/).filter(Boolean),ts=p.timestamp||"";
   return{u:p.permalink,ts,date:ts?IG.short(ts):"",title:(ln[0]||"Publicación").slice(0,70),body:(ln.slice(1).join(" ")||cap.slice(70)).slice(0,150),
    img:p.thumbnail_url||p.thumbnailUrl||(/IMAGE/i.test(p.media_type||p.mediaType||"")?(p.media_url||p.mediaUrl):"")||""}});
  out.sort((a,b)=>String(b.ts).localeCompare(String(a.ts)));
  return out.slice(0,max)}
};
