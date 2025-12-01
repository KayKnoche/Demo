window.DHLApp = window.DHLApp || {};
(function (app) {
  const KEY_SUBJECT="DHLApp.SubjectID";
  const KEY_SERVER="DHLApp.ServerURL";
  const KEY_CONTAINER="DHLApp.ContainerName";

  function restore(){
    if(localStorage.getItem(KEY_SUBJECT)) document.getElementById("subject-id-input").value = localStorage.getItem(KEY_SUBJECT);
    if(localStorage.getItem(KEY_SERVER)) document.getElementById("server-url-input").value = localStorage.getItem(KEY_SERVER);
    if(localStorage.getItem(KEY_CONTAINER)) document.getElementById("container-name-input").value = localStorage.getItem(KEY_CONTAINER);
  }
  function save(key,val){ localStorage.setItem(key,val.trim()); }
  function getSID(){ return (document.getElementById("subject-id-input").value||"").trim(); }

  document.addEventListener("DOMContentLoaded",()=>{
    restore();
    const sid=document.getElementById("subject-id-input");
    const srv=document.getElementById("server-url-input");
    const con=document.getElementById("container-name-input");

    sid.addEventListener("input",()=>save(KEY_SUBJECT,sid.value));
    srv.addEventListener("input",()=>save(KEY_SERVER,srv.value));
    con.addEventListener("input",()=>save(KEY_CONTAINER,con.value));

    const btn=document.getElementById("btn-call");
    const raw=document.getElementById("raw-response");
    const log=document.getElementById("log");
    const out=document.getElementById("offer-output");

    btn.addEventListener("click",async()=>{
      btn.disabled=true;
      save(KEY_SUBJECT,sid.value);
      save(KEY_SERVER,srv.value);
      save(KEY_CONTAINER,con.value);

      log.textContent="Rufe Container auf...";
      raw.textContent="";
      out.textContent="Lade...";

      try{
        const data=await app.realtime.callContainer(getSID());
        raw.textContent=JSON.stringify(data,null,2);
        log.textContent="Erfolg.";
        app.realtime.renderResult(data,out);
      } catch(e){
        log.textContent=e.message;
        raw.textContent=e.stack;
      } finally {
        btn.disabled=false;
      }
    });
  });
})(window.DHLApp);