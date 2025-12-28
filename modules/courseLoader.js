/**
 * Course Loader Module
 * Handles lazy loading of course data files.
 * 
 * Usage:
 *   CourseLoader.loadCourse('arduino')  → Loads arduino.js dynamically
 *   CourseLoader.isLoaded('arduino')    → Check if already loaded
 *   CourseLoader.getManifest()          → Get list of available courses
 */

const CourseLoader = {
    // Track which courses have been loaded
    loadedCourses: new Set(),

    // Course manifest - metadata without full content
    manifest: {
        arduino: {
            title: "Arduino Serüveni",
            description: "20 Haftalık Arduino robotik eğitimi",
            icon: "🤖",
            color: "#00979C",
            file: "data/arduino.js"
        },
        microbit: {
            title: "Micro:bit Dünyası",
            description: "BBC Micro:bit ile kodlama",
            icon: "💻",
            color: "#6C63FF",
            file: "data/microbit.js"
        },
        scratch: {
            title: "Scratch ile Oyun Yapımı",
            description: "Blok tabanlı programlama",
            icon: "🎮",
            color: "#FF6F00",
            file: "data/scratch.js"
        },
        mblock: {
            title: "mBlock ile Robotik",
            description: "mBlock tabanlı Arduino programlama",
            icon: "🦾",
            color: "#30B0C7",
            file: "data/mblock.js"
        },
        appinventor: {
            title: "App Inventor",
            description: "Android uygulama geliştirme",
            icon: "📱",
            color: "#7CB342",
            file: "data/appinventor.js"
        }
    },

    /**
     * Get the manifest (for course selection screen)
     */
    getManifest: () => CourseLoader.manifest,

    /**
     * Check if a course is already loaded
     */
    isLoaded: (key) => CourseLoader.loadedCourses.has(key),

    /**
     * Load a course dynamically
     * Returns a Promise that resolves when the course is loaded
     */
    loadCourse: (key) => {
        return new Promise((resolve, reject) => {
            // Already loaded?
            if (CourseLoader.isLoaded(key)) {
                resolve(window.courseData[key]);
                return;
            }

            const courseInfo = CourseLoader.manifest[key];
            if (!courseInfo) {
                reject(new Error(`Course not found: ${key}`));
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.src = courseInfo.file;
            script.async = true;

            script.onload = () => {
                CourseLoader.loadedCourses.add(key);
                console.log(`[CourseLoader] Loaded: ${key}`);
                resolve(window.courseData[key]);
            };

            script.onerror = () => {
                reject(new Error(`Failed to load course: ${key}`));
            };

            document.head.appendChild(script);
        });
    },

    /**
     * Load ALL courses (useful for Admin panel or pre-caching)
     */
    loadAll: () => {
        const promises = Object.keys(CourseLoader.manifest).map(key => CourseLoader.loadCourse(key));
        return Promise.all(promises);
    },

    /**
     * Preload essential data (tips, quiz) - called on init
     */
    preloadEssentials: () => {
        // These are small files, load them upfront
        const essentials = ['data/tips.js', 'data/quiz.js'];
        essentials.forEach(src => {
            if (!document.querySelector(`script[src="${src}"]`)) {
                const script = document.createElement('script');
                script.src = src;
                document.head.appendChild(script);
            }
        });
    }
};

// Export for global access
window.CourseLoader = CourseLoader;
