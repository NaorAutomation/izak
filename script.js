// פרידום מדיקל - קובץ ג'אווהסקריפט ראשי
// מותאם לשנת 2025

document.addEventListener('DOMContentLoaded', function() {
    // -------------- אנימציות כניסה --------------
    
    // אנימציית חלקי הדף כשנכנסים לתצוגה
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-visible');
                    // מוסיף קלאס ספציפי בהתאם לסוג האנימציה
                    if (entry.target.dataset.animationType) {
                        entry.target.classList.add(entry.target.dataset.animationType);
                    }
                }
            });
        }, { threshold: 0.1 });
        
        elements.forEach(element => {
            observer.observe(element);
            // מוסיף קלאס בסיסי לכל האלמנטים שנכנסים לאנימציה
            element.classList.add('transition-all', 'duration-700', 'opacity-0');
            
            // מוסיף קלאס ספציפי בהתאם לסוג האנימציה
            if (element.dataset.animationType === 'fade-up') {
                element.classList.add('translate-y-10');
            } else if (element.dataset.animationType === 'fade-right') {
                element.classList.add('-translate-x-10');
            } else if (element.dataset.animationType === 'fade-left') {
                element.classList.add('translate-x-10');
            } else if (element.dataset.animationType === 'zoom-in') {
                element.classList.add('scale-95');
            }
        });
    };
    
    // אנימציה לסקציות שלמות
    const animateSections = () => {
        const sections = document.querySelectorAll('section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    
                    // אנימציה מדורגת לאלמנטים בתוך הסקציה
                    const elements = entry.target.querySelectorAll('.stagger-animation');
                    elements.forEach((el, index) => {
                        setTimeout(() => {
                            el.classList.add('opacity-100', 'translate-y-0');
                        }, 150 * index);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        sections.forEach(section => {
            observer.observe(section);
            section.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10');
            
            // מוסיף אנימציה מדורגת לאלמנטים בתוך הסקציה
            const elements = section.querySelectorAll('.stagger-animation');
            elements.forEach(el => {
                el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-8');
            });
        });
    };
    
    // -------------- פונקציונליות נוספת --------------
    
    // התנהגות של נאב בר נגלל
    const setupScrollNavbar = () => {
        const navbar = document.querySelector('nav');
        const scrollThreshold = 50;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > scrollThreshold) {
                navbar.classList.add('nav-scrolled', 'shadow-md', 'py-2');
                navbar.classList.remove('py-3');
            } else {
                navbar.classList.remove('nav-scrolled', 'shadow-md', 'py-2');
                navbar.classList.add('py-3');
            }
        });
    };
    
    // תפריט מובייל
    const setupMobileMenu = () => {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                // במקום להסתיר ולהציג פשוט, נשתמש באנימציות
                if (mobileMenu.classList.contains('hidden')) {
                    // פתיחת התפריט
                    mobileMenu.classList.remove('hidden');
                    mobileMenu.classList.remove('mobile-menu-close');
                    mobileMenu.classList.add('mobile-menu-open');
                } else {
                    // סגירת התפריט עם אנימציה
                    mobileMenu.classList.remove('mobile-menu-open');
                    mobileMenu.classList.add('mobile-menu-close');
                    
                    // הסתרת התפריט אחרי שהאנימציה מסתיימת
                    setTimeout(() => {
                        mobileMenu.classList.add('hidden');
                    }, 300); // הזמן תואם את משך האנימציה
                }
                
                // החלפת אייקון
                const icon = mobileMenuBtn.querySelector('i');
                if (icon.classList.contains('fa-bars')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
            
            // סגירת תפריט בלחיצה על קישור
            const mobileLinks = mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    // סגירת התפריט עם אנימציה
                    mobileMenu.classList.remove('mobile-menu-open');
                    mobileMenu.classList.add('mobile-menu-close');
                    
                    setTimeout(() => {
                        mobileMenu.classList.add('hidden');
                    }, 300);
                    
                    // החזרת האייקון למצב ברירת מחדל
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                });
            });
        }
    };
    
    // שאלות נפוצות - פונקציונליות אקורדיון
    const setupFAQ = () => {
        const faqHeaders = document.querySelectorAll('.faq-header');
        
        faqHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('i');
                
                // סגור/פתח את התוכן
                content.classList.toggle('hidden');
                
                // שנה את האייקון
                if (content.classList.contains('hidden')) {
                    icon.classList.remove('transform', 'rotate-180');
                } else {
                    icon.classList.add('transform', 'rotate-180');
                }
                
                // סגור את כל התשובות האחרות
                faqHeaders.forEach(otherHeader => {
                    if (otherHeader !== header) {
                        const otherContent = otherHeader.nextElementSibling;
                        const otherIcon = otherHeader.querySelector('i');
                        
                        otherContent.classList.add('hidden');
                        otherIcon.classList.remove('transform', 'rotate-180');
                    }
                });
            });
        });
    };
    
    // אנימציית מספרים - מוסיף אנימציה שסופרת מספרים עד לערך הסופי
    const setupNumberAnimation = () => {
        const statsNumbers = document.querySelectorAll('.stats-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const targetNumber = parseInt(target.getAttribute('data-target'));
                    const duration = 2000; // משך האנימציה במילישניות
                    const stepTime = 20; // זמן בין צעדים
                    const steps = duration / stepTime;
                    const increment = targetNumber / steps;
                    let current = 0;
                    
                    const counter = setInterval(() => {
                        current += increment;
                        if (current >= targetNumber) {
                            target.textContent = targetNumber;
                            clearInterval(counter);
                        } else {
                            target.textContent = Math.round(current);
                        }
                    }, stepTime);
                    
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        statsNumbers.forEach(number => {
            observer.observe(number);
        });
    };
    
    // אנימציית סליידר המלצות - פונקציונליות פשוטה לסליידר
    const setupTestimonialSlider = () => {
        const slider = document.querySelector('.testimonial-slider');
        if (!slider) return;
        
        const slides = slider.querySelectorAll('.grid > div');
        const dots = slider.querySelectorAll('.absolute > button');
        const prevBtn = slider.querySelector('button:nth-of-type(2)'); // כפתור קודם
        const nextBtn = slider.querySelector('button:nth-of-type(1)'); // כפתור הבא
        
        let currentSlide = 0;
        const maxSlide = Math.ceil(slides.length / 3) - 1; // מספר העמודים (כל עמוד מכיל 3 המלצות במחשב)
        
        // פונקציה לשינוי סליידים
        const goToSlide = (slide) => {
            // עדכון נקודות ניווט
            dots.forEach((dot, i) => {
                if (i === slide) {
                    dot.classList.remove('opacity-50');
                    dot.classList.add('opacity-100');
                } else {
                    dot.classList.remove('opacity-100');
                    dot.classList.add('opacity-50');
                }
            });
            
            // במובייל - כל המלצה זה סלייד שלם
            if (window.innerWidth < 768) {
                slides.forEach((s, i) => {
                    s.style.display = i === slide ? 'block' : 'none';
                });
            } 
            // במחשב - מציג 3 המלצות בכל פעם
            else {
                // מחשב נציג את כל הסליידים עם מעבר חלק ביניהם
                // הלוגיקה כאן תלויה באופן שבו אתה בונה את הסליידר
                // יש להתאים בהתאם למבנה ה-HTML
            }
        };
        
        // אירועי לחיצה לכפתורים
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % (maxSlide + 1);
                goToSlide(currentSlide);
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + maxSlide + 1) % (maxSlide + 1);
                goToSlide(currentSlide);
            });
        }
        
        // אירועי לחיצה לנקודות ניווט
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                currentSlide = i;
                goToSlide(currentSlide);
            });
        });
        
        // מעבר אוטומטי בין סליידים כל 5 שניות
        setInterval(() => {
            currentSlide = (currentSlide + 1) % (maxSlide + 1);
            goToSlide(currentSlide);
        }, 5000);
    };
    
    // אפקט שלג של עלים של קאנאביס - אנימציה חדשנית מיוחדת לשנת 2025
    const setupCannabisFallingLeaves = () => {
        const heroSection = document.getElementById('home');
        if (!heroSection) return;
        
        // יצירת עלי קאנאביס
        const leafCount = 10; // מספר העלים
        
        for (let i = 0; i < leafCount; i++) {
            createLeaf(heroSection);
        }
    };
    
    // יצירת עלה בגודל ומיקום רנדומלי בסקציית הגיבור
    function createLeaf(container) {
        const leaf = document.createElement('div');
        leaf.classList.add('cannabis-leaf', 'absolute', 'z-0', 'opacity-30');
        
        // קובע גודל רנדומלי
        const size = Math.random() * 30 + 20; // בין 20 ל-50 פיקסלים
        leaf.style.width = `${size}px`;
        leaf.style.height = `${size}px`;
        
        // קובע מיקום רנדומלי
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.top = `-${size}px`; // מתחיל מעל לחלון הנראה
        
        // קובע אנימציית נפילה
        const duration = Math.random() * 10 + 5; // בין 5 ל-15 שניות
        leaf.style.animation = `falling ${duration}s linear infinite`;
        
        // מוסיף צבעים משתנים לעלים
        const hue = Math.random() * 60 + 90; // גוון ירוק
        const lightness = Math.random() * 20 + 40; // בהירות
        leaf.style.backgroundColor = `hsl(${hue}, 70%, ${lightness}%)`;
        
        // צורת עלה (משתמש באייקון המתאים)
        leaf.innerHTML = '<i class="fas fa-cannabis" style="font-size: 100%"></i>';
        
        // מוסיף לקונטיינר
        container.appendChild(leaf);
        
        // מחליף מיקום לאחר סיום האנימציה
        setTimeout(() => {
            resetLeaf(leaf);
        }, duration * 1000);
    }
    
    // מאפס את העלה למיקום חדש מעל לחלון
    function resetLeaf(leaf) {
        const size = parseInt(leaf.style.width);
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.top = `-${size}px`;
        
        const duration = Math.random() * 10 + 5;
        leaf.style.animation = `falling ${duration}s linear infinite`;
        
        setTimeout(() => {
            resetLeaf(leaf);
        }, duration * 1000);
    }
    
    // הוספת סגנונות CSS לאנימציה
    function addFallingAnimationStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes falling {
                0% {
                    transform: translateY(0) rotate(0deg);
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                }
            }
            
            .cannabis-leaf {
                position: absolute;
                z-index: 0;
                color: #2E8B57;
                filter: drop-shadow(0 0 2px rgba(0,0,0,0.2));
                transform-origin: center;
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    // טפסים - בדיקת תקינות והנפשה של שדות
    const setupFormAnimations = () => {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            // מוסיף אנימציות לשדות
            inputs.forEach(input => {
                // אנימציה בעת מיקוד
                input.addEventListener('focus', () => {
                    input.parentElement.classList.add('focused');
                });
                
                input.addEventListener('blur', () => {
                    input.parentElement.classList.remove('focused');
                    
                    // בדיקה אם יש תוכן בשדה
                    if (input.value.trim() !== '') {
                        input.classList.add('has-content');
                    } else {
                        input.classList.remove('has-content');
                    }
                });
            });
            
            // טיפול בהגשת טופס
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // בדיקת תקינות הטופס
                let isValid = true;
                const requiredInputs = form.querySelectorAll('input[required], textarea[required], select[required]');
                
                requiredInputs.forEach(input => {
                    if (input.value.trim() === '') {
                        isValid = false;
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                });
                
                if (isValid) {
                    // אנימציית הגשה
                    const submitBtn = form.querySelector('button[type="submit"]');
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> שולח...';
                    submitBtn.disabled = true;
                    
                    // כאן נוסיף בעתיד לוגיקת שליחת טופס באמצעות fetch/AJAX
                    
                    // פידבק חיובי לאחר "שליחה"
                    setTimeout(() => {
                        form.innerHTML = `
                            <div class="text-center py-8">
                                <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/20 text-primary rounded-full mb-4">
                                    <i class="fas fa-check text-2xl"></i>
                                </div>
                                <h3 class="text-xl font-bold mb-2">פנייתך התקבלה בהצלחה!</h3>
                                <p class="text-white/80">נציג שלנו יחזור אליך בהקדם.</p>
                            </div>
                        `;
                    }, 1500);
                }
            });
        });
    };
    
    // אנימציית לוגו
    const setupLogoAnimation = () => {
        const logo = document.querySelector('nav img');
        if (!logo) return;
        
        logo.addEventListener('mouseenter', () => {
            logo.classList.add('animate-pulse');
        });
        
        logo.addEventListener('mouseleave', () => {
            logo.classList.remove('animate-pulse');
        });
    };
    
    // הוספת הסגנונות לאנימציית העלים
    addFallingAnimationStyles();
    
    // הפעלת כל הפונקציות
    animateOnScroll();
    animateSections();
    setupScrollNavbar();
    setupMobileMenu();
    setupFAQ();
    setupNumberAnimation();
    setupTestimonialSlider();
    setupCannabisFallingLeaves();
    setupFormAnimations();
    setupLogoAnimation();
    
    // אנימציית טעינת האתר
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 300);
});

// אנימציה חלקה לגלילה פנימית בעמוד
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        window.scrollTo({
            top: targetElement.offsetTop - 80, // נותן מרווח לנאב בר
            behavior: 'smooth'
        });
    });
});

// הוספת פונקציונליות להגדלת המלצות וואטסאפ בלחיצה - בוטל לפי בקשת הלקוח
function setupTestimonialModal() {
    // פונקציונליות בוטלה - אין צורך בהגדלת תמונות ההמלצות
    console.log('Testimonial modal functionality disabled per client request');
    return;
}

// מוסיף את פונקציונליות המודל לדף כאשר הוא נטען
document.addEventListener('DOMContentLoaded', function() {
    setupTestimonialModal();
}); 