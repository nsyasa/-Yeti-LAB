const n={currentProjectId:null,isOpen:!1,openEditor(){const e=window.admin?.currentProjectId||window.ProjectManager?.currentProjectId;if(!e&&e!==0){console.warn("[QuizManager] No project selected"),window.Toast&&Toast.warning("Önce bir ders seçin");return}this.currentProjectId=e;const i=(window.admin?.currentData?.projects||[]).find(o=>o.id===e);if(!i){console.error("[QuizManager] Project not found:",e);return}i.quiz||(i.quiz=[]),window.QuizEditor&&QuizEditor.init(e,i.quiz,o=>{i.quiz=o,this.updateQuizCount(o.length),window.admin?.triggerAutoSave&&admin.triggerAutoSave()});const r=document.getElementById("quiz-editor-modal");r&&(r.classList.remove("hidden"),r.classList.add("flex"),this.isOpen=!0),this.renderQuestions()},closeEditor(){const e=document.getElementById("quiz-editor-modal");e&&(e.classList.add("hidden"),e.classList.remove("flex"),this.isOpen=!1)},addQuestion(){window.QuizEditor&&(QuizEditor.addQuestion(),this.renderQuestions())},removeQuestion(e){window.QuizEditor&&(QuizEditor.removeQuestion(e),this.renderQuestions())},updateQuestion(e,t,i){window.QuizEditor&&QuizEditor.updateQuestion(e,t,i)},saveAndClose(){this.closeEditor(),window.Toast&&Toast.success("Quiz kaydedildi")},renderQuestions(){const e=document.getElementById("quiz-questions-container");if(!e||!window.QuizEditor)return;const t=QuizEditor.data||[];if(t.length===0){e.innerHTML=`
                <div class="text-center py-12 text-gray-400">
                    <div class="text-5xl mb-4">📝</div>
                    <p>Henüz soru eklenmemiş.</p>
                    <button onclick="QuizManager.addQuestion()" 
                            class="mt-4 text-theme hover:text-theme-dark font-bold">
                        + İlk soruyu ekle
                    </button>
                </div>
            `;return}e.innerHTML=t.map((i,r)=>this.renderQuestion(i,r)).join("")},renderQuestion(e,t){for((!e.options||!Array.isArray(e.options))&&(e.options=["","","",""]);e.options.length<4;)e.options.push("");return`
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 relative group">
                <button type="button" 
                        onclick="QuizManager.removeQuestion(${t})" 
                        class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg opacity-0 group-hover:opacity-100 transition">
                    ❌
                </button>
                
                <div class="mb-4">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Soru ${t+1}
                    </label>
                    <input type="text" 
                           class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 text-sm font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                           value="${this.escapeHtml(e.q||"")}" 
                           onchange="QuizManager.updateQuestion(${t}, 'q', this.value)"
                           placeholder="Soruyu yazın...">
                </div>
                
                <div class="space-y-2">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Seçenekler</label>
                    ${e.options.map((i,r)=>`
                        <div class="flex items-center gap-3">
                            <input type="radio" 
                                   name="q${t}_ans" 
                                   value="${r}" 
                                   ${e.answer===r?"checked":""} 
                                   onchange="QuizManager.updateQuestion(${t}, 'answer', ${r})"
                                   class="w-5 h-5 text-green-600">
                            <span class="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-xs font-bold">
                                ${String.fromCharCode(65+r)}
                            </span>
                            <input type="text" 
                                   class="flex-1 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                                   value="${this.escapeHtml(i)}" 
                                   onchange="QuizManager.updateQuestion(${t}, 'option_${r}', this.value)"
                                   placeholder="${String.fromCharCode(65+r)} şıkkı...">
                        </div>
                    `).join("")}
                </div>
                
                <div class="mt-3 text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                    <span>✓</span>
                    <span>Doğru cevabın yanındaki kutucuğu işaretleyin</span>
                </div>
            </div>
        `},updateQuizCount(e){const t=document.getElementById("quiz-count-badge");t&&(t.textContent=e)},escapeHtml(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}};window.QuizManager=n;
