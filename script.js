    row.querySelector('.delete-lib').onclick=()=>{
      if(!confirm('Delete "'+item.label+'"?'))return;
      saveLibraryItems(getLibraryItems().filter(x=>x.id!==item.id));
      renderLibrary();
    };
    box.appendChild(row);
  });
}
document.querySelectorAll('#libraryTabs .tab-btn').forEach(b=>b.onclick=()=>{ activeLibraryLevel=b.dataset.level; renderLibrary(); });
$('libraryFileInput').onchange=e=>{
  const f=e.target.files[0]; if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{ $('libraryTextInput').value=ev.target.result; };
  r.readAsText(f);
};
$('libraryAddBtn').onclick=()=>{
  const label=$('libraryLabelInput').value.trim();
  const txt=$('libraryTextInput').value.trim();
  if(!label){ alert('Give this text a topic name first.'); return; }
  if(!txt){ alert('Paste some text or upload a file first.'); return; }
  const items=getLibraryItems();
  items.push({id:Date.now()+'-'+Math.random().toString(36).slice(2,7), level:activeLibraryLevel, label, text:txt, savedAt:new Date().toISOString()});
  saveLibraryItems(items);
  $('libraryLabelInput').value=''; $('libraryTextInput').value='';
  renderLibrary();
};
renderLibrary();
