(function(){
  var btn=document.getElementById('bookCall');
  var note=document.getElementById('bookCallNote');
  if(!btn||!note)return;
  btn.addEventListener('click',function(){
    note.textContent='Placeholder — this draft has no scheduling link.';
    note.hidden=false;
    note.focus();
  });
})();
