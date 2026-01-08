/**
 * State Proxy Module
 * app.state ile Store arasında senkronizasyon sağlar
 * Geriye uyumluluk için app.state kullanılabilir, ama veriler Store'da tutulur
 *
 * @module modules/core/stateProxy
 */

const StateProxy = {
    /**
     * Store ile senkronize bir state proxy oluşturur
     * @returns {Proxy} Store ile senkronize edilmiş proxy objesi
     */
    create: () => {
        // Fallback değerler - Store yüklenmeden önce kullanılır
        const fallback = {
            currentCourseKey: null,
            componentInfo: {},
            phases: [],
            projects: [],
        };

        // Proxy ile Store'a senkronize et
        return new Proxy(fallback, {
            get(target, prop) {
                // Store yüklü mü kontrol et - her erişimde
                if (typeof Store !== 'undefined' && Store.getCurrentCourseKey) {
                    switch (prop) {
                        case 'currentCourseKey':
                            return Store.getCurrentCourseKey();
                        case 'phases':
                            return Store.getPhases();
                        case 'projects':
                            return Store.getProjects();
                        case 'componentInfo':
                            return Store.getComponentInfo();
                    }
                }
                // Store yoksa veya bilinen bir prop değilse fallback'ten oku
                return target[prop];
            },
            set(target, prop, value) {
                // Her zaman fallback'e de yaz (Store yokken kullanılır)
                target[prop] = value;

                // Store yüklü mü kontrol et
                if (typeof Store !== 'undefined' && Store.setCurrentCourseKey) {
                    switch (prop) {
                        case 'currentCourseKey':
                            Store.setCurrentCourseKey(value);
                            break;
                        case 'phases':
                            Store.setState({ phases: value });
                            break;
                        case 'projects':
                            Store.setState({ projects: value });
                            break;
                        case 'componentInfo':
                            Store.setState({ componentInfo: value });
                            break;
                    }
                }
                return true;
            },
        });
    },
};

// Global scope'a ekle (mevcut yapıya uyum için)
window.StateProxy = StateProxy;
