const m={instances:new Map,defaults:{placeholder:"Ders içeriğini buraya yazın...",autosave:!0,autosaveDelay:3e3},create(e,o={}){const l=`editor-${Date.now()}`,t=typeof e=="string"?document.querySelector(e):e;if(!t)return console.error("[AdminRichTextEditor] Container not found:",e),null;const i={...this.defaults,...o},n=this._createFallbackEditor(t,i,l);return this.instances.set(l,n),n},_createFallbackEditor(e,o,l){e.innerHTML=`
            <div class="admin-rte-wrapper" data-editor-id="${l}">
                <div class="admin-rte-toolbar">
                    <div class="admin-rte-toolbar-group">
                        <button type="button" data-action="bold" title="Kalın" class="admin-rte-btn">
                            <strong>B</strong>
                        </button>
                        <button type="button" data-action="italic" title="İtalik" class="admin-rte-btn">
                            <em>I</em>
                        </button>
                        <button type="button" data-action="heading" title="Başlık" class="admin-rte-btn">
                            H
                        </button>
                        <button type="button" data-action="list" title="Liste" class="admin-rte-btn">
                            ☰
                        </button>
                        <button type="button" data-action="link" title="Link" class="admin-rte-btn">
                            🔗
                        </button>
                        <button type="button" data-action="code" title="Kod" class="admin-rte-btn">
                            { }
                        </button>
                    </div>
                    <div class="admin-rte-toolbar-spacer"></div>
                    <div class="admin-rte-toolbar-group">
                        <button type="button" data-action="preview" title="Önizleme" class="admin-rte-btn">
                            👁️
                        </button>
                        <span class="admin-rte-status"></span>
                    </div>
                </div>
                <div class="admin-rte-body">
                    <textarea class="admin-rte-textarea" placeholder="${o.placeholder}">${o.content||""}</textarea>
                    <div class="admin-rte-preview" style="display:none;"></div>
                </div>
            </div>
        `;const t=e.querySelector(".admin-rte-textarea"),i=e.querySelector(".admin-rte-preview"),n=e.querySelector(".admin-rte-status");let r=null,a=!1,s=!1;return e.querySelectorAll("[data-action]").forEach(d=>{d.addEventListener("click",()=>{const c=d.dataset.action;this._handleAction(t,c,i),c==="preview"&&(s=!s,t.style.display=s?"none":"block",i.style.display=s?"block":"none",s&&(i.innerHTML=this._markdownToHtml(t.value)),d.classList.toggle("active",s))})}),t.addEventListener("input",()=>{a=!0,n.textContent="Değişiklikler...",r&&clearTimeout(r),o.autosave&&o.onSave&&(r=setTimeout(()=>{o.onSave(t.value),a=!1,n.textContent="✓ Kaydedildi"},o.autosaveDelay))}),{id:l,container:e,getHTML(){return this._markdownToHtml(t.value)},getText(){return t.value},getContent(){return t.value},setContent(d){t.value=d||"",a=!1},clear(){t.value="",a=!1},save(){o.onSave&&(o.onSave(t.value),a=!1,n.textContent="✓ Kaydedildi")},hasUnsavedChanges(){return a},focus(){t.focus()},destroy(){r&&clearTimeout(r),e.innerHTML="",m.instances.delete(l)},_markdownToHtml:m._markdownToHtml.bind(m)}},_handleAction(e,o,l){const t=e.selectionStart,i=e.selectionEnd,n=e.value,r=n.substring(t,i);let a="",s=0;switch(o){case"bold":a=`**${r||"kalın metin"}**`,s=r?0:2;break;case"italic":a=`*${r||"italik metin"}*`,s=r?0:1;break;case"heading":a=`
## ${r||"Başlık"}
`;break;case"list":a=`
- ${r||"Liste öğesi"}
- 
- 
`;break;case"link":const d=prompt("URL girin:","https://");d&&(a=`[${r||"link metni"}](${d})`);break;case"code":r.includes(`
`)?a=`
\`\`\`
${r}
\`\`\`
`:a=`\`${r||"kod"}\``;break;case"preview":return}a&&(e.value=n.substring(0,t)+a+n.substring(i),e.focus(),e.setSelectionRange(t+s,t+a.length),e.dispatchEvent(new Event("input")))},_markdownToHtml(e){if(!e)return"";const o=i=>i?String(i).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#039;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):"",l=i=>{if(!i)return!1;const n=i.trim(),r=n.toLowerCase(),s=[/^https?:\/\//i,/^mailto:/i,/^#/,/^\?/,/^\//,/^\.\//,/^\.\.\//].some(c=>c.test(n)),d=/^(javascript|vbscript|data|file):/i.test(r);return s&&!d};let t=e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/^#### (.+)$/gm,"<h4>$1</h4>").replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/```(\w*)\n([\s\S]*?)```/g,'<pre><code class="language-$1">$2</code></pre>').replace(/`([^`]+)`/g,"<code>$1</code>");return t=t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(i,n,r)=>{if(!l(r))return`<span class="blocked-content">[Blocked Image: ${n}]</span>`;const a=n.replace(/"/g,"&quot;").replace(/'/g,"&#039;");return`<img src="${o(r)}" alt="${a}" />`}),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(i,n,r)=>l(r)?`<a href="${o(r)}" target="_blank" rel="noopener noreferrer">${n}</a>`:`<span class="blocked-link">${n}</span>`),t=t.replace(/^\s*[-*]\s+(.+)$/gm,"<li>$1</li>").replace(/^>\s*(.+)$/gm,"<blockquote>$1</blockquote>").replace(/^---$/gm,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>"),t=t.replace(/(<li>.*<\/li>\s*)+/g,"<ul>$&</ul>"),t.startsWith("<")||(t="<p>"+t+"</p>"),t},getInstance(e){return this.instances.get(e)},destroyAll(){this.instances.forEach(e=>e.destroy()),this.instances.clear()},sanitize(e){return typeof DOMPurify<"u"?DOMPurify.sanitize(e,{ALLOWED_TAGS:["p","br","strong","em","u","s","code","pre","h1","h2","h3","h4","ul","ol","li","blockquote","hr","a","img","table","thead","tbody","tr","th","td"],ALLOWED_ATTR:["href","src","alt","class","target","rel"]}):e.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"").replace(/on\w+="[^"]*"/gi,"").replace(/javascript:/gi,"")}};(function(){const e=document.createElement("style");e.textContent=`
        .admin-rte-wrapper {
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            overflow: hidden;
            background: rgba(30, 41, 59, 0.75);
        }
        
        .admin-rte-toolbar {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.03);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-rte-toolbar-group {
            display: flex;
            align-items: center;
            gap: 0.125rem;
        }
        
        .admin-rte-toolbar-spacer {
            flex: 1;
        }
        
        .admin-rte-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            padding: 0;
            background: transparent;
            border: none;
            border-radius: 0.375rem;
            color: #94a3b8;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        
        .admin-rte-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }
        
        .admin-rte-btn.active {
            background: linear-gradient(135deg, #ff8c00, #ff4500);
            color: #fff;
        }
        
        .admin-rte-status {
            font-size: 0.75rem;
            color: #64748b;
            padding: 0 0.5rem;
        }
        
        .admin-rte-body {
            position: relative;
        }
        
        .admin-rte-textarea {
            width: 100%;
            min-height: 300px;
            padding: 1rem;
            background: #1e293b;
            border: none;
            color: #e2e8f0;
            font-family: 'Fira Code', Monaco, monospace;
            font-size: 0.9rem;
            line-height: 1.6;
            resize: vertical;
        }
        
        .admin-rte-textarea:focus {
            outline: none;
        }
        
        .admin-rte-textarea::placeholder {
            color: #475569;
        }
        
        .admin-rte-preview {
            min-height: 300px;
            padding: 1rem;
            background: #1e293b;
            color: #e2e8f0;
            line-height: 1.6;
            overflow-y: auto;
        }
        
        .admin-rte-preview h1,
        .admin-rte-preview h2,
        .admin-rte-preview h3,
        .admin-rte-preview h4 {
            margin: 1rem 0 0.5rem;
            color: #fff;
        }
        
        .admin-rte-preview h1 { font-size: 1.75rem; }
        .admin-rte-preview h2 { font-size: 1.5rem; }
        .admin-rte-preview h3 { font-size: 1.25rem; }
        .admin-rte-preview h4 { font-size: 1.1rem; }
        
        .admin-rte-preview p {
            margin: 0.5rem 0;
        }
        
        .admin-rte-preview ul, .admin-rte-preview ol {
            margin: 0.5rem 0;
            padding-left: 1.5rem;
        }
        
        .admin-rte-preview code {
            padding: 0.125rem 0.375rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 0.25rem;
            font-family: 'Fira Code', monospace;
            color: #ff8c00;
        }
        
        .admin-rte-preview pre {
            margin: 1rem 0;
            padding: 1rem;
            background: #0f172a;
            border-radius: 0.5rem;
            overflow-x: auto;
        }
        
        .admin-rte-preview pre code {
            padding: 0;
            background: none;
            color: #e0e0e0;
        }
        
        .admin-rte-preview blockquote {
            margin: 1rem 0;
            padding: 0.75rem 1rem;
            border-left: 3px solid #ff8c00;
            background: rgba(255, 140, 0, 0.1);
            font-style: italic;
        }
        
        .admin-rte-preview a {
            color: #00d4ff;
            text-decoration: underline;
        }
        
        .admin-rte-preview img {
            max-width: 100%;
            border-radius: 0.5rem;
        }
    `,document.head.appendChild(e)})();typeof window<"u"&&(window.AdminRichTextEditor=m);
