const e={projectId:null,data:null,onUpdate:null,init:(s,a,t)=>{e.projectId=s,e.data=Array.isArray(a)?a:[],e.onUpdate=t,e.render()},render:()=>{const s=document.getElementById("quiz-editor-list"),a=document.getElementById("quiz-empty-msg");s&&(s.innerHTML="",!e.data||e.data.length===0?a&&a.classList.remove("hidden"):(a&&a.classList.add("hidden"),e.data.forEach((t,n)=>{for((!t.options||!Array.isArray(t.options))&&(t.options=["","","",""]);t.options.length<4;)t.options.push("");const o=document.createElement("div");o.className="bg-white border rounded p-4 shadow-sm relative group",o.innerHTML=`
                    <button type="button" onclick="QuizEditor.removeQuestion(${n})" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 font-bold p-1">❌</button>
                    
                    <div class="mb-2">
                        <label class="block text-xs font-bold text-gray-500 uppercase">Soru ${n+1}</label>
                        <input type="text" class="w-full border rounded p-2 text-sm font-bold" 
                            value="${e.escapeHtml(t.q)}" 
                            onchange="QuizEditor.updateQuestion(${n}, 'q', this.value)">
                    </div>
                    
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-gray-500 uppercase">Seçenekler</label>
                        ${t.options.map((r,i)=>`
                            <div class="flex items-center space-x-2">
                                <input type="radio" name="q${n}_ans" value="${i}" 
                                    ${t.answer===i?"checked":""} 
                                    onchange="QuizEditor.updateQuestion(${n}, 'answer', ${i})">
                                <input type="text" class="w-full border rounded p-1 text-sm bg-gray-50" 
                                    value="${e.escapeHtml(r)}" 
                                    onchange="QuizEditor.updateQuestion(${n}, 'option_${i}', this.value)">
                            </div>
                        `).join("")}
                    </div>
                    <div class="mt-2 text-xs text-green-600 font-bold">
                        * Doğru cevabın yanındaki kutucuğu işaretleyin.
                    </div>
                `,s.appendChild(o)})))},addQuestion:()=>{e.data||(e.data=[]),e.data.push({q:"Yeni Soru?",options:["A Şıkkı","B Şıkkı","C Şıkkı","D Şıkkı"],answer:0}),e.render(),e.sync()},removeQuestion:s=>{confirm("Bu soruyu silmek istediğinize emin misiniz?")&&(e.data.splice(s,1),e.render(),e.sync())},updateQuestion:(s,a,t)=>{const n=e.data[s];if(a==="q")n.q=t;else if(a==="answer")n.answer=parseInt(t);else if(a.startsWith("option_")){const o=parseInt(a.split("_")[1]);n.options[o]=t}e.sync()},sync:()=>{e.onUpdate&&e.onUpdate(e.data)},escapeHtml:s=>s?s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""};window.QuizEditor=e;
