const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./notificationService-vqAmugJa.js","./router-Wt5PmBlh.js","./router-P-fjebgT.css"])))=>i.map(i=>d[i]);
import{_ as r}from"./main-C696FNGh.js";import"./router-Wt5PmBlh.js";const d={isOpen:!1,notifications:[],unreadCount:0,isLoading:!1,_unsubscribe:null,async init(){const{default:t}=await r(async()=>{const{default:e}=await import("./notificationService-vqAmugJa.js");return{default:e}},__vite__mapDeps([0,1,2]),import.meta.url);this.unreadCount=await t.getUnreadCount(),this.updateBadge(),this._unsubscribe=t.subscribe(({unreadCount:e,newNotification:i})=>{this.unreadCount=e,this.updateBadge(),i&&this.isOpen&&this.loadNotifications(),i&&window.showToast&&window.showToast(i.title,"info")}),console.log("[NotificationDropdown] Initialized")},destroy(){this._unsubscribe&&(this._unsubscribe(),this._unsubscribe=null)},renderBellIcon(){return`
            <button onclick="NotificationDropdown.toggle(event)" 
                class="relative p-2.5 text-gray-500 hover:text-theme hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                title="Bildirimler"
                id="notification-bell">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <!-- Badge -->
                <span id="notification-badge" 
                    class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ${this.unreadCount>0?"":"hidden"}">
                    ${this.unreadCount>9?"9+":this.unreadCount}
                </span>
            </button>
        `},renderDropdown(){return`
            <div id="notification-dropdown" 
                class="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 hidden overflow-hidden">
                
                <!-- Header -->
                <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        🔔 Bildirimler
                        ${this.unreadCount>0?`<span class="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">${this.unreadCount}</span>`:""}
                    </h3>
                    <div class="flex items-center gap-2">
                        ${this.unreadCount>0?`
                            <button onclick="NotificationDropdown.markAllRead()" 
                                class="text-xs text-theme hover:underline">
                                Tümünü Okundu İşaretle
                            </button>
                        `:""}
                    </div>
                </div>

                <!-- Notification List -->
                <div id="notification-list" class="max-h-[400px] overflow-y-auto">
                    ${this.renderNotificationList()}
                </div>

                <!-- Footer -->
                <div class="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button onclick="NotificationDropdown.openFullPage()"
                        class="w-full py-2 text-sm text-center text-theme hover:bg-theme/10 rounded-lg transition-colors font-medium">
                        Tüm Bildirimleri Gör →
                    </button>
                </div>
            </div>
        `},renderNotificationList(){return this.isLoading?`
                <div class="flex items-center justify-center py-12">
                    <div class="animate-spin w-8 h-8 border-4 border-theme border-t-transparent rounded-full"></div>
                </div>
            `:!this.notifications||this.notifications.length===0?`
                <div class="py-12 text-center">
                    <div class="text-4xl mb-3">🔔</div>
                    <p class="text-gray-500 dark:text-gray-400">Henüz bildirim yok</p>
                </div>
            `:this.notifications.map(t=>this.renderNotificationItem(t)).join("")},renderNotificationItem(t){const e=this.getIcon(t.type),i=this.getColor(t.type),n=this.formatTime(t.created_at),o=!t.is_read;return`
            <div class="notification-item p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-0 transition-colors ${o?"bg-theme/5":""}"
                 onclick="NotificationDropdown.handleClick('${t.id}', '${t.action_url||""}')">
                <div class="flex gap-3">
                    <!-- Icon -->
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${i} bg-gray-100 dark:bg-gray-700">
                        ${e}
                    </div>
                    
                    <!-- Content -->
                    <div class="flex-grow min-w-0">
                        <div class="flex items-start justify-between gap-2">
                            <h4 class="font-semibold text-gray-800 dark:text-white text-sm line-clamp-1 ${o?"":"font-normal"}">
                                ${t.title}
                            </h4>
                            ${o?'<span class="w-2 h-2 bg-theme rounded-full shrink-0 mt-1.5"></span>':""}
                        </div>
                        ${t.message?`
                            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                ${t.message}
                            </p>
                        `:""}
                        <p class="text-xs text-gray-400 mt-1">
                            ${n}
                        </p>
                    </div>
                </div>
            </div>
        `},updateBadge(){const t=document.getElementById("notification-badge");t&&(this.unreadCount>0?(t.textContent=this.unreadCount>9?"9+":this.unreadCount,t.classList.remove("hidden")):t.classList.add("hidden"))},async toggle(t){t?.stopPropagation();const e=document.getElementById("notification-dropdown");e&&(this.isOpen=!this.isOpen,this.isOpen?(e.classList.remove("hidden"),await this.loadNotifications(),setTimeout(()=>{document.addEventListener("click",this._outsideClickHandler)},0)):(e.classList.add("hidden"),document.removeEventListener("click",this._outsideClickHandler)))},_outsideClickHandler:t=>{const e=document.getElementById("notification-dropdown"),i=document.getElementById("notification-bell");e&&!e.contains(t.target)&&i&&!i.contains(t.target)&&d.close()},close(){const t=document.getElementById("notification-dropdown");t&&t.classList.add("hidden"),this.isOpen=!1,document.removeEventListener("click",this._outsideClickHandler)},async loadNotifications(){this.isLoading=!0,this.updateList();try{const{default:t}=await r(async()=>{const{default:e}=await import("./notificationService-vqAmugJa.js");return{default:e}},__vite__mapDeps([0,1,2]),import.meta.url);this.notifications=await t.getNotifications({limit:10}),this.unreadCount=await t.getUnreadCount()}catch(t){console.error("Bildirimler yüklenemedi:",t),this.notifications=[]}this.isLoading=!1,this.updateList(),this.updateBadge()},updateList(){const t=document.getElementById("notification-list");t&&(t.innerHTML=this.renderNotificationList())},async handleClick(t,e){try{const{default:i}=await r(async()=>{const{default:n}=await import("./notificationService-vqAmugJa.js");return{default:n}},__vite__mapDeps([0,1,2]),import.meta.url);await i.markAsRead(t),this.unreadCount=Math.max(0,this.unreadCount-1),this.updateBadge()}catch(i){console.error("Okundu işaretleme hatası:",i)}e&&(this.close(),window.Router?Router.navigate(e):window.Navbar&&Navbar.navigateSPA(e))},async markAllRead(){try{const{default:t}=await r(async()=>{const{default:e}=await import("./notificationService-vqAmugJa.js");return{default:e}},__vite__mapDeps([0,1,2]),import.meta.url);await t.markAllAsRead(),this.unreadCount=0,this.updateBadge(),await this.loadNotifications(),window.showToast&&window.showToast("Tüm bildirimler okundu","success")}catch(t){console.error("Toplu okundu işaretleme hatası:",t)}},openFullPage(){this.close(),window.Router?Router.navigate("/notifications"):window.Navbar&&Navbar.navigateSPA("/notifications")},getIcon(t){return{assignment_created:"📋",assignment_due_soon:"⏰",assignment_due_today:"🔔",assignment_overdue:"⚠️",submission_received:"📥",submission_graded:"✅",submission_returned:"↩️",course_enrolled:"📚",achievement_earned:"🏆",announcement:"📢",system:"⚙️"}[t]||"🔔"},getColor(t){return{assignment_created:"text-blue-500",assignment_due_soon:"text-orange-500",assignment_due_today:"text-red-500",assignment_overdue:"text-red-600",submission_received:"text-green-500",submission_graded:"text-emerald-500",submission_returned:"text-yellow-500",course_enrolled:"text-purple-500",achievement_earned:"text-amber-500",announcement:"text-indigo-500",system:"text-gray-500"}[t]||"text-gray-500"},formatTime(t){const e=new Date(t),n=new Date-e,o=Math.floor(n/6e4),a=Math.floor(n/36e5),s=Math.floor(n/864e5);return o<1?"Az önce":o<60?`${o} dk önce`:a<24?`${a} saat önce`:s<7?`${s} gün önce`:e.toLocaleDateString("tr-TR")}};window.NotificationDropdown=d;export{d as default};
