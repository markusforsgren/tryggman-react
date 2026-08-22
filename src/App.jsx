import { useState, useEffect, useRef, createContext, useContext } from "react";
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, collection, doc, addDoc, setDoc, getDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs } from "./firebase";

/* ============================================================
   AUTH CONTEXT
   ============================================================ */
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isTherapist, setIsTherapist] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      if (user) {
        try {
          const res = await fetch('/.netlify/functions/check-premium?userId=' + user.uid);
          const data = await res.json();
          setIsPremium(data.isPremium || false);
        } catch { setIsPremium(false); }
        try {
          const snap = await getDocs(collection(db, 'Therapists'));
          setIsTherapist(snap.docs.some(d => d.data().uid === user.uid));
        } catch { setIsTherapist(false); }
      } else {
        setIsPremium(false);
        setIsTherapist(false);
      }
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isPremium, isTherapist, auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

/* ============================================================
   HELPERS
   ============================================================ */
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
};

const formatTime = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  return d.toLocaleTimeString('sv-SE', { hour:'2-digit', minute:'2-digit' });
};

/* ============================================================
   CSS — Exakt tryggman.se design
   ============================================================ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

*{margin:0;padding:0;box-sizing:border-box}
:root{
  --slate:#1C2B35;--slate-mid:#2E4050;--slate-light:#3D5468;
  --teal:#3A7D6E;--teal-light:#4E9E8D;
  --sand:#F2EDE5;--cream:#FAFAF7;
  --gold:#C0873A;--text:#1C2B35;--text-muted:#6B7A85;
  --border:rgba(28,43,53,0.08);--white:#fff;
}
html{scroll-behavior:smooth}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--text);line-height:1.6;overflow-x:hidden}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;justify-content:space-between;align-items:center;padding:1.1rem 6%;background:rgba(28,43,53,0.97);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.05)}
.nav-logo{font-family:'DM Serif Display',serif;font-size:1.35rem;color:#fff;letter-spacing:0.02em;cursor:pointer;text-decoration:none}
.hamburger{background:none;border:none;cursor:pointer;padding:0.3rem;display:flex;flex-direction:column;gap:5px;z-index:102}
.hamburger span{display:block;width:24px;height:2px;background:#fff;transition:all 0.3s ease;border-radius:2px}
.hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.hamburger.open span:nth-child(2){opacity:0;transform:translateX(-8px)}
.hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.nav-menu-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;display:none;backdrop-filter:blur(2px)}
.nav-menu-overlay.open{display:block}
.nav-menu{position:fixed;top:0;right:-100%;width:280px;height:100vh;background:#1C2B35;z-index:101;transition:right 0.35s ease;display:flex;flex-direction:column;padding:5rem 2rem 2rem;box-shadow:-8px 0 32px rgba(0,0,0,0.3)}
.nav-menu.open{right:0}
.nav-menu-label{font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.2);padding:0 0.8rem;margin-bottom:0.3rem;margin-top:1rem}
.nav-menu ul{list-style:none;display:flex;flex-direction:column;gap:0.2rem;flex:1}
.nav-menu-btn{display:block;width:100%;text-align:left;background:none;border:none;padding:0.75rem 0.8rem;color:rgba(255,255,255,0.6);font-family:'DM Sans',sans-serif;font-size:0.95rem;font-weight:400;border-radius:2px;transition:all 0.2s;cursor:pointer}
.nav-menu-btn:hover,.nav-menu-btn.active{color:#fff;background:rgba(255,255,255,0.05)}
.nav-menu-btn.active{color:#4E9E8D}
.nav-menu-cta{background:#3A7D6E!important;color:#fff!important;font-weight:500!important;margin-top:0.5rem}
.nav-menu-bottom{border-top:1px solid rgba(255,255,255,0.06);padding-top:1.2rem;margin-top:auto}
.nav-menu-bottom button{display:block;width:100%;text-align:left;background:none;border:none;padding:0.5rem 0.8rem;color:rgba(255,255,255,0.3);font-family:'DM Sans',sans-serif;font-size:0.82rem;transition:color 0.2s;cursor:pointer}
.nav-menu-bottom button:hover{color:rgba(255,255,255,0.6)}

/* TICKER */
.ticker-wrap{overflow:hidden;padding:0.85rem 0;background:#1C2B35;border-bottom:1px solid rgba(255,255,255,0.04);position:relative;margin-top:62px}
.ticker-wrap::before,.ticker-wrap::after{content:'';position:absolute;top:0;bottom:0;width:5rem;z-index:2;pointer-events:none}
.ticker-wrap::before{left:0;background:linear-gradient(to right,#1C2B35,transparent)}
.ticker-wrap::after{right:0;background:linear-gradient(to left,#1C2B35,transparent)}
.ticker-track{display:flex;white-space:nowrap;animation:ticker 55s linear infinite}
.ticker-track:hover{animation-play-state:paused}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ticker-item{display:inline-flex;align-items:center;gap:0.5rem;padding:0 2.5rem;font-size:0.8rem;font-weight:300}
.ticker-item.stat{color:rgba(255,255,255,0.48)}
.ticker-item.stat strong{color:#4E9E8D;font-weight:500;font-family:'DM Serif Display',serif;font-size:0.95rem}
.ticker-item.quote{color:rgba(255,255,255,0.32);font-style:italic;font-family:'DM Serif Display',serif;font-size:0.82rem}
.ticker-sep{color:rgba(255,255,255,0.12);padding:0 0.3rem}

/* HERO */
.hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:#1C2B35}
.hero-left{display:flex;flex-direction:column;justify-content:center;padding:5rem 5% 5rem 8%;position:relative}
.hero-left::after{content:'';position:absolute;right:0;top:15%;bottom:15%;width:1px;background:rgba(255,255,255,0.07)}
.hero-eyebrow{font-size:0.74rem;letter-spacing:0.22em;text-transform:uppercase;color:#4E9E8D;margin-bottom:1.8rem;display:flex;align-items:center;gap:0.8rem}
.hero-eyebrow::before{content:'';display:inline-block;width:2rem;height:1px;background:#4E9E8D;flex-shrink:0}
.hero-title{font-family:'DM Serif Display',serif;font-size:4.4rem;line-height:1.08;color:#fff;margin-bottom:1.5rem}
.hero-title em{font-style:italic;color:#4E9E8D}
.hero-body{font-size:1.02rem;color:rgba(255,255,255,0.52);max-width:390px;line-height:1.85;margin-bottom:2.5rem;font-weight:300}
.hero-actions{display:flex;gap:1rem;flex-wrap:wrap}
.hero-right{display:flex;flex-direction:column;justify-content:center;padding:5rem 8% 5rem 5%}
.stat-stack{display:flex;flex-direction:column}
.stat-item{display:flex;align-items:flex-start;gap:1.8rem;padding:2.2rem 0;border-bottom:1px solid rgba(255,255,255,0.07)}
.stat-item:first-child{padding-top:0}
.stat-item:last-child{border-bottom:none;padding-bottom:0}
.stat-num{font-family:'DM Serif Display',serif;font-size:3.6rem;line-height:1;color:#fff;min-width:105px;flex-shrink:0}
.stat-num span{font-size:1.5rem;color:#4E9E8D}
.stat-label{font-size:0.86rem;color:rgba(255,255,255,0.42);line-height:1.75;padding-top:0.5rem;font-weight:300}

/* BUTTONS */
.btn-primary{background:#3A7D6E;color:#fff;padding:0.85rem 1.9rem;border:none;border-radius:2px;font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:500;cursor:pointer;transition:background 0.2s;letter-spacing:0.02em}
.btn-primary:hover{background:#4E9E8D}
.btn-ghost-white{background:none;color:rgba(255,255,255,0.65);padding:0.85rem 1.9rem;border:1px solid rgba(255,255,255,0.18);border-radius:2px;font-family:'DM Sans',sans-serif;font-size:0.9rem;cursor:pointer;transition:all 0.2s}
.btn-ghost-white:hover{border-color:rgba(255,255,255,0.55);color:#fff}
.btn-ghost{background:none;color:#6B7A85;padding:0.85rem 1.9rem;border:1px solid rgba(28,43,53,0.2);border-radius:2px;font-family:'DM Sans',sans-serif;font-size:0.9rem;cursor:pointer;transition:all 0.2s}
.btn-ghost:hover{border-color:#3A7D6E;color:#3A7D6E}

/* CRISIS BAND */
.crisis-band{background:#3A7D6E;padding:0.85rem 6%;display:flex;align-items:center;justify-content:center;gap:2.5rem;flex-wrap:wrap}
.crisis-band p{color:rgba(255,255,255,0.82);font-size:0.85rem}
.crisis-band strong{color:#fff;font-weight:500}

/* WHY SECTION */
.section-why{padding:6rem 8%;max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:6rem;align-items:start}
.section-label{font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;color:#3A7D6E;margin-bottom:0.9rem}
.section-title{font-family:'DM Serif Display',serif;font-size:2.6rem;line-height:1.15;color:#1C2B35;margin-bottom:1.3rem}
.section-body{font-size:0.98rem;color:#6B7A85;line-height:1.9;margin-bottom:1.2rem;font-weight:300}
.quote-block{border-left:3px solid #3A7D6E;padding:1.4rem 1.8rem;background:#F2EDE5;margin:2rem 0}
.quote-block blockquote{font-family:'DM Serif Display',serif;font-size:1.2rem;font-style:italic;color:#1C2B35;line-height:1.55;margin-bottom:0.5rem}
.quote-block cite{font-size:0.8rem;color:#6B7A85;font-style:normal}
.stigma-card{background:#1C2B35;padding:2rem;margin-bottom:1rem;position:relative;overflow:hidden}
.stigma-card::before{content:'';position:absolute;top:0;left:0;width:4px;height:100%;background:#3A7D6E}
.stigma-card.gold::before{background:#C0873A}
.stigma-card-label{font-size:0.67rem;letter-spacing:0.16em;text-transform:uppercase;color:#4E9E8D;margin-bottom:0.5rem}
.stigma-card.gold .stigma-card-label{color:#C0873A}
.stigma-card p{color:rgba(255,255,255,0.65);font-size:0.92rem;line-height:1.75;font-weight:300}

/* PILLARS */
.section-pillars{background:#F2EDE5;padding:6rem 8%}
.pillars-inner{max-width:1100px;margin:0 auto}
.pillars-header{text-align:center;margin-bottom:3.5rem}
.pillars-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.8rem}
.pillar-card{background:#fff;padding:2.4rem 2rem;position:relative;border-top:3px solid #1C2B35;cursor:pointer;transition:transform 0.2s}
.pillar-card:hover{transform:translateY(-4px)}
.pillar-num{font-family:'DM Serif Display',serif;font-size:3.8rem;color:#F2EDE5;position:absolute;top:0.8rem;right:1.2rem;line-height:1;font-style:italic;user-select:none}
.pillar-icon{font-size:1.5rem;margin-bottom:1.1rem;display:block}
.pillar-title{font-family:'DM Serif Display',serif;font-size:1.35rem;color:#1C2B35;margin-bottom:0.7rem}
.pillar-body{font-size:0.88rem;color:#6B7A85;line-height:1.85;font-weight:300}

/* PRICING */
.section-pricing{padding:6rem 8%;background:#1C2B35}
.pricing-inner{max-width:900px;margin:0 auto}
.pricing-header{text-align:center;margin-bottom:3.5rem}
.pricing-header .section-label{color:#4E9E8D}
.pricing-header .section-title{color:#fff}
.pricing-header p{color:rgba(255,255,255,0.45);font-size:0.95rem;font-weight:300}
.pricing-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2.5rem}
.price-card{background:#2E4050;padding:2.2rem;position:relative;border-top:3px solid #3A7D6E}
.price-card.featured{background:#3A7D6E;border-top-color:#4E9E8D}
.price-tag-label{font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;color:#4E9E8D;margin-bottom:0.8rem}
.price-card.featured .price-tag-label{color:rgba(255,255,255,0.7)}
.price-name{font-family:'DM Serif Display',serif;font-size:1.5rem;color:#fff;margin-bottom:0.5rem}
.price-amount{font-family:'DM Serif Display',serif;font-size:3rem;color:#fff;line-height:1;margin-bottom:0.3rem}
.price-amount span{font-size:1rem;font-family:'DM Sans',sans-serif;font-weight:300;color:rgba(255,255,255,0.5)}
.price-desc{font-size:0.82rem;color:rgba(255,255,255,0.45);margin-bottom:1.5rem;line-height:1.6}
.price-card.featured .price-desc{color:rgba(255,255,255,0.7)}
.price-features{list-style:none;margin-bottom:1.8rem;display:flex;flex-direction:column;gap:0.65rem}
.price-features li{font-size:0.85rem;color:rgba(255,255,255,0.65);display:flex;align-items:flex-start;gap:0.6rem}
.price-features li::before{content:'✓';color:#4E9E8D;font-weight:600;flex-shrink:0;margin-top:1px}
.price-card.featured .price-features li{color:rgba(255,255,255,0.85)}
.price-card.featured .price-features li::before{color:#fff}
.price-btn{width:100%;padding:0.85rem;border:none;border-radius:2px;font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:500;cursor:pointer;transition:all 0.2s;text-align:center;display:block}
.price-btn-outline{background:none;border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.7)}
.price-btn-outline:hover{border-color:#4E9E8D;color:#fff}
.price-btn-solid{background:#fff;color:#1C2B35}
.price-btn-solid:hover{background:#F2EDE5}
.price-free-note{font-size:0.75rem;color:rgba(255,255,255,0.35);text-align:center;margin-top:0.6rem}
.price-value-note{font-size:0.78rem;color:rgba(255,255,255,0.5);font-style:italic;margin-top:0.8rem;text-align:center;line-height:1.5}

/* FAQ */
.section-faq{padding:5rem 8%;background:#F2EDE5}
.faq-inner{max-width:700px;margin:0 auto}
.faq-item{border-bottom:1px solid rgba(28,43,53,0.1);padding:1.2rem 0;cursor:pointer}
.faq-q{font-weight:500;color:#1C2B35;display:flex;justify-content:space-between;align-items:center;font-size:0.95rem}
.faq-icon{font-size:1.3rem;color:#3A7D6E;transition:transform 0.2s;flex-shrink:0}
.faq-icon.open{transform:rotate(45deg)}
.faq-a{font-size:0.88rem;color:#6B7A85;line-height:1.75;max-height:0;overflow:hidden;transition:max-height 0.3s ease,padding 0.3s ease}
.faq-a.open{max-height:200px;padding-top:0.8rem}

/* CTA */
.section-cta{background:#1C2B35;padding:5rem 8%;text-align:center}
.section-cta h2{font-family:'DM Serif Display',serif;font-size:2.8rem;color:#fff;margin-bottom:1rem}
.section-cta p{color:rgba(255,255,255,0.45);font-size:1rem;margin-bottom:2.5rem;font-weight:300}
.cta-buttons{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}

/* FOOTER */
footer{background:#1C2B35;padding:4.5rem 8% 2rem}
.footer-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;padding-bottom:3rem;border-bottom:1px solid rgba(255,255,255,0.07);margin-bottom:2rem}
.footer-brand{font-family:'DM Serif Display',serif;font-size:1.6rem;color:#fff;margin-bottom:0.9rem;display:block;cursor:pointer}
.footer-tagline{font-size:0.85rem;color:rgba(255,255,255,0.35);line-height:1.75;max-width:260px;font-weight:300}
.footer-col h4{font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:1.1rem}
.footer-col ul{list-style:none}
.footer-col li{margin-bottom:0.5rem}
.footer-col button{background:none;border:none;color:rgba(255,255,255,0.35);font-family:'DM Sans',sans-serif;font-size:0.85rem;cursor:pointer;transition:color 0.2s;font-weight:300;padding:0;text-align:left}
.footer-col button:hover{color:#fff}
.footer-bottom{display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;color:rgba(255,255,255,0.25);flex-wrap:wrap;gap:0.5rem}
.footer-crisis{color:#4E9E8D;font-weight:500}
.footer-legal{display:flex;gap:1.5rem;flex-wrap:wrap;margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,0.04)}
.footer-legal button{background:none;border:none;color:rgba(255,255,255,0.2);font-family:'DM Sans',sans-serif;font-size:0.75rem;cursor:pointer;transition:color 0.2s;padding:0}
.footer-legal button:hover{color:rgba(255,255,255,0.5)}

/* PAGE HERO */
.page-hero{padding:7rem 8% 4rem;background:#1C2B35;margin-top:62px}
.page-hero .section-label{color:#4E9E8D}
.page-hero h1{font-family:'DM Serif Display',serif;font-size:3.5rem;line-height:1.1;color:#fff;margin-bottom:1rem}
.page-hero h1 em{font-style:italic;color:#4E9E8D}
.page-hero p{font-size:1rem;color:rgba(255,255,255,0.5);max-width:520px;font-weight:300;line-height:1.85}

/* CHAT FULLSCREEN */
.chat-fullscreen{position:fixed;top:0;left:0;right:0;bottom:0;background:#1C2B35;z-index:9999;display:flex;flex-direction:column}
.chat-header-bar{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;background:#2E4050;border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0}
.chat-messages{flex:1;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;background:#1C2B35}
.chat-bubble-user{max-width:80%;padding:0.85rem 1.1rem;border-radius:2px;font-size:0.9rem;line-height:1.55;background:#3A7D6E;color:#fff;margin-left:auto}
.chat-bubble-ai{max-width:80%;padding:0.85rem 1.1rem;border-radius:2px;font-size:0.9rem;line-height:1.55;background:#2E4050;color:rgba(255,255,255,0.85);border-left:3px solid #4E9E8D}
.chat-input-bar{display:flex;gap:0.6rem;padding:1rem 1.5rem;background:#2E4050;border-top:1px solid rgba(255,255,255,0.07);flex-shrink:0}
.chat-input{flex:1;background:#1C2B35;border:1px solid rgba(255,255,255,0.1);border-radius:2px;padding:0.8rem 1rem;color:#fff;font-family:'DM Sans',sans-serif;font-size:0.9rem;outline:none}
.chat-input::placeholder{color:rgba(255,255,255,0.3)}
.chat-input:focus{border-color:#4E9E8D}
.chat-send-btn{background:#3A7D6E;color:#fff;border:none;border-radius:2px;padding:0.8rem 1.5rem;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:background 0.2s}
.chat-send-btn:hover{background:#4E9E8D}

/* INPUT FIELDS */
.input-field{width:100%;background:#fff;border:1px solid rgba(28,43,53,0.15);border-radius:2px;padding:0.85rem 1.2rem;color:#1C2B35;font-family:'DM Sans',sans-serif;font-size:0.95rem;outline:none;transition:border-color 0.2s}
.input-field:focus{border-color:#3A7D6E}
.input-label{font-size:0.82rem;font-weight:500;color:#6B7A85;display:block;margin-bottom:0.4rem;letter-spacing:0.02em}

/* CARDS */
.card-sand{background:#F2EDE5;padding:2rem;border-left:3px solid #3A7D6E}
.card-dark{background:#2E4050;padding:2rem}

/* THERAPY CHAT */
.therapy-page{padding:2rem 5%;max-width:900px;margin:0 auto}
.therapy-container{background:#fff;border-top:3px solid #1C2B35;overflow:hidden}
.therapy-header{background:#1C2B35;padding:1.5rem 2rem;display:flex;align-items:center;gap:1rem}
.therapy-messages{min-height:400px;max-height:500px;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;background:#FAFAF7}
.therapy-msg-user{display:flex;justify-content:flex-end}
.therapy-msg-therapist{display:flex;justify-content:flex-start}
.therapy-bubble-user{background:#3A7D6E;color:#fff;padding:0.75rem 1rem;max-width:75%;font-size:0.9rem;line-height:1.55}
.therapy-bubble-therapist{background:#fff;color:#1C2B35;padding:0.75rem 1rem;max-width:75%;font-size:0.9rem;line-height:1.55;border:1px solid rgba(28,43,53,0.1)}
.therapy-input-area{display:flex;gap:0.8rem;padding:1rem 1.5rem;background:#fff;border-top:1px solid rgba(28,43,53,0.08)}
.therapy-input{flex:1;background:#FAFAF7;border:1px solid rgba(28,43,53,0.12);border-radius:2px;padding:0.8rem 1rem;font-family:'DM Sans',sans-serif;font-size:0.9rem;color:#1C2B35;outline:none}
.therapy-input:focus{border-color:#3A7D6E}
.therapy-send-btn{background:#1C2B35;color:#fff;border:none;padding:0.8rem 1.5rem;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:background 0.2s}
.therapy-send-btn:hover{background:#3A7D6E}

/* MAIN */
.main-content{margin-top:0}

/* RESPONSIVE */
@media(max-width:900px){
  .hero{grid-template-columns:1fr}
  .hero-left::after{display:none}
  .hero-left{padding:4rem 5% 3rem}
  .hero-right{padding:3rem 5% 4rem}
  .hero-title{font-size:3rem}
  .section-why{grid-template-columns:1fr;gap:3rem;padding:4rem 5%}
  .pillars-grid{grid-template-columns:1fr;gap:1.2rem}
  .pricing-grid{grid-template-columns:1fr}
  .footer-top{grid-template-columns:1fr 1fr}
}
@media(max-width:600px){
  .hero-title{font-size:2.4rem}
  .section-title{font-size:2rem}
  .footer-top{grid-template-columns:1fr}
}
`;

/* ============================================================
   TICKER
   ============================================================ */
const Ticker = () => {
  const items = [
    { type:'stat', content: <><strong>3×</strong> fler män än kvinnor tar sitt liv i Sverige varje år</> },
    { type:'quote', content: '"Styrka är inte att hålla masken — det är att ta av sig den."' },
    { type:'stat', content: <><strong>70%</strong> av män som mår dåligt söker aldrig professionell hjälp</> },
    { type:'quote', content: '"Du är inte svag för att du behöver stöd. Du är modig."' },
    { type:'stat', content: <><strong>1 av 4</strong> män upplever psykisk ohälsa någon gång i livet</> },
    { type:'quote', content: '"Att be om hjälp är det modigaste du kan göra."' },
    { type:'stat', content: <>Suicid är vanligaste dödsorsaken bland män under <strong>45 år</strong></> },
    { type:'quote', content: '"Ingen man ska behöva kämpa ensam — Tryggman"' },
    { type:'stat', content: <><strong>Mind Självmordslinjen 90101</strong> — anonymt, dygnet runt</> },
  ];
  const allItems = [...items, ...items];
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {allItems.map((item, i) => (
          <span key={i}>
            <span className={`ticker-item ${item.type}`}>{item.content}</span>
            <span className="ticker-sep">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   FAQ ITEM
   ============================================================ */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item" onClick={()=>setOpen(!open)}>
      <div className="faq-q">
        {q}
        <span className={`faq-icon${open?' open':''}`}>+</span>
      </div>
      <div className={`faq-a${open?' open':''}`}>{a}</div>
    </div>
  );
};

/* ============================================================
   HOME PAGE
   ============================================================ */
const HomePage = ({ nav }) => (
  <div>
    <Ticker/>
    <section className="hero">
      <div className="hero-left">
        <div className="hero-eyebrow">Mäns psykiska hälsa</div>
        <h1 className="hero-title">Där<br/><em>trygghet</em><br/>skapas</h1>
        <p className="hero-body">Vi tror på att varje man förtjänar att känna sig trygg med sin psykiska hälsa. I en värld där män förväntas hålla masken — skapar vi ett utrymme där det är okej att inte vara okej.</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={()=>nav('chat')}>Prova gratis</button>
          <button className="btn-ghost-white" onClick={()=>nav('resurser')}>Få hjälp nu</button>
        </div>
      </div>
      <div className="hero-right">
        <div className="stat-stack">
          <div className="stat-item">
            <div className="stat-num">3<span>×</span></div>
            <div className="stat-label">Fler män än kvinnor tar sitt liv varje år i Sverige. Inte ett slumpvärde — resultatet av stigma, tystnad och bristande stöd.</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">70<span>%</span></div>
            <div className="stat-label">Av män som mår dåligt söker aldrig professionell hjälp. Rädslan för att dömas håller dem tysta — tills det är för sent.</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">1<span>/4</span></div>
            <div className="stat-label">Män upplever psykisk ohälsa någon gång i livet. Din bror, din pappa, din vän — någon ni känner kämpar just nu.</div>
          </div>
        </div>
      </div>
    </section>

    <div className="crisis-band">
      <p>Behöver du prata nu? <strong>Mind Självmordslinjen: 90101</strong> — anonymt och gratis, dygnet runt</p>
      <p>Akut fara: <strong>112</strong> &nbsp;·&nbsp; Vård och rådgivning: <strong>1177</strong></p>
    </div>

    <section id="varfor">
      <div className="section-why">
        <div>
          <div className="section-label">Varför vi finns</div>
          <h2 className="section-title">Tystnaden som dödar</h2>
          <p className="section-body">Från tidig ålder lär sig många män att "hålla masken". Pojkar gråter inte. Ta dig samman. Var en man. Dessa fraser formar hur vi förhåller oss till våra egna känslor — i decennier.</p>
          <p className="section-body">Vi växer upp med förväntningar om att alltid vara starka, klara oss själva, aldrig visa sårbarhet. Men vem ska vi luta oss mot när vi själva behöver stöd?</p>
          <div className="quote-block">
            <blockquote>"Det krävs otroligt mycket styrka att erkänna när man inte mår bra."</blockquote>
            <cite>— Marcus, 38 år, Stockholm</cite>
          </div>
          <button className="btn-ghost" onClick={()=>nav('om-oss')}>Läs mer om oss →</button>
        </div>
        <div>
          <div className="stigma-card">
            <div className="stigma-card-label">Det vi säger till pojkar</div>
            <p>"Pojkar gråter inte." "Ta dig samman." "Var en man." Dessa fraser stänger dörrar som borde vara öppna.</p>
          </div>
          <div className="stigma-card">
            <div className="stigma-card-label">Det vi skapar hos vuxna</div>
            <p>Män som inte vet hur de ska be om hjälp. Som kämpar i tystnad tills det är för sent att vända.</p>
          </div>
          <div className="stigma-card gold">
            <div className="stigma-card-label">Det vi vill skapa</div>
            <p>Ett utrymme där det är okej att inte vara okej. Där mod är att ta av sig masken — inte att hålla den på.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="section-pillars">
      <div className="pillars-inner">
        <div className="pillars-header">
          <div className="section-label">Vad Tryggman erbjuder</div>
          <h2 className="section-title">Stöd på dina villkor</h2>
        </div>
        <div className="pillars-grid">
          <div className="pillar-card" onClick={()=>nav('chat')}>
            <div className="pillar-num">1</div>
            <span className="pillar-icon">💬</span>
            <h3 className="pillar-title">AI-rådgivning</h3>
            <p className="pillar-body">Prata med en AI som lyssnar — dygnet runt, anonymt, utan väntetid. Ett första steg när det känns svårt att ta nästa.</p>
          </div>
          <div className="pillar-card" onClick={()=>nav('terapeut')}>
            <div className="pillar-num">2</div>
            <span className="pillar-icon">🤝</span>
            <h3 className="pillar-title">Certifierad terapeut</h3>
            <p className="pillar-body">Chatta med en certifierad psykoterapeut. Svar inom 24 timmar. Ingen bokning via telefon. Ingen väntrumskänsla.</p>
          </div>
          <div className="pillar-card" onClick={()=>nav('berattelser')}>
            <div className="pillar-num">3</div>
            <span className="pillar-icon">🛡️</span>
            <h3 className="pillar-title">Gemenskap</h3>
            <p className="pillar-body">Läs berättelser från män som känner som du. Du är inte ensam. Tillsammans bryter vi tystnaden.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="section-pricing" id="priser">
      <div className="pricing-inner">
        <div className="pricing-header">
          <div className="section-label">Transparent prissättning</div>
          <h2 className="section-title">Välj ditt stöd</h2>
          <p>Ingen bindningstid. Inga dolda kostnader. Avsluta när du vill.</p>
        </div>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-tag-label">Mental Fitness</div>
            <div className="price-name">AI-Rådgivare</div>
            <div className="price-amount">39 <span>kr/mån</span></div>
            <div className="price-desc">Dygnet runt stöd, verktyg och reflektion — i din egen takt.</div>
            <ul className="price-features">
              <li>Obegränsad AI-chatt dygnet runt</li>
              <li>Daglig humörtracking</li>
              <li>Guidade andnings- & mindfulnessövningar</li>
              <li>Artiklar & kunskap om mäns hälsa</li>
              <li>Community</li>
              <li>Ingen bindningstid</li>
            </ul>
            <button className="price-btn price-btn-outline" onClick={()=>nav('chat')}>Prova 4 meddelanden gratis</button>
            <div className="price-free-note">Inget kreditkort krävs för att prova</div>
          </div>
          <div className="price-card featured">
            <div className="price-tag-label">Professionell terapi</div>
            <div className="price-name">Personlig Terapeut</div>
            <div className="price-amount">349 <span>kr/mån</span></div>
            <div className="price-desc">Asynkron textterapi med certifierad psykoterapeut. Skriv när du vill — svar vardagar inom 24 timmar.</div>
            <ul className="price-features">
              <li>Certifierad psykoterapeut</li>
              <li>Upp till 10 meddelanden per månad</li>
              <li>Svar inom 24 timmar (måndag–fredag)</li>
              <li>Full tystnadsplikt</li>
              <li>Allt i AI-paketet ingår</li>
              <li>Ingen bindningstid</li>
            </ul>
            <button className="price-btn price-btn-solid" onClick={()=>nav('terapeut')}>Starta samtal med terapeut</button>
            <div className="price-value-note">Mindre än 12 kr om dagen — billigare än ett enskilt fysiskt terapeutbesök.</div>
          </div>
        </div>
      </div>
    </section>

    <section className="section-faq">
      <div className="faq-inner">
        <div className="section-label">Vanliga frågor</div>
        <h2 className="section-title" style={{marginBottom:'2rem'}}>Trygghet i varje detalj</h2>
        <FaqItem q="Syns det på mitt kontoutdrag?" a='Transaktionen visas som "Tryggman" — inte med något som avslöjar vad tjänsten handlar om.'/>
        <FaqItem q="Hur hanteras mina data och chattar?" a="All data hanteras enligt GDPR. Dina chattar är krypterade och säljs aldrig vidare till tredje part."/>
        <FaqItem q="Är terapeuterna certifierade?" a="Ja. Alla terapeuter på Tryggman är certifierade psykoterapeuter med svensk legitimation och full tystnadsplikt."/>
        <FaqItem q="Hur fungerar asynkron textterapi?" a="Du skriver ett meddelande när du vill — dag eller natt. Din terapeut läser och svarar inom 24 timmar på vardagar."/>
        <FaqItem q="Kan jag avsluta när som helst?" a="Absolut. Ingen bindningstid, inga avgifter för uppsägning."/>
        <FaqItem q="Vad är skillnaden på AI-chatten och terapeuten?" a="AI-rådgivaren finns dygnet runt och är utmärkt för reflektion och första steget. Terapeuten är en certifierad människa med klinisk utbildning — bättre för djupare bearbetning."/>
        <FaqItem q="Ersätter detta professionell vård?" a="Nej. Tryggman är ett komplement till, inte ersättning för, professionell psykiatrisk vård. Vid akut kris — ring 90101 eller 112."/>
      </div>
    </section>

    <section className="section-cta">
      <h2>Redo att ta första steget?</h2>
      <p>Det behöver inte vara stort. Det räcker med ett meddelande.</p>
      <div className="cta-buttons">
        <button className="btn-primary" onClick={()=>nav('chat')}>Prova AI-rådgivaren gratis</button>
        <button className="btn-ghost-white" onClick={()=>nav('terapeut')}>Starta med terapeut</button>
      </div>
    </section>
  </div>
);

/* ============================================================
   CHAT PAGE
   ============================================================ */
const ChatPage = ({ nav, isPremium, currentUser }) => {
  const [messages, setMessages] = useState([{ role:'assistant', content:'Hej. Jag är här för att lyssna — utan att döma. Det krävs mod att ta det här steget. Hur mår du idag?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const FREE_LIMIT = 4;
  const isLocked = !isPremium && msgCount >= FREE_LIMIT;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);
  useEffect(() => { if (modalOpen) setTimeout(()=>inputRef.current?.focus(),100); }, [modalOpen]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || isLocked) return;
    const msg = input;
    setMessages(p=>[...p,{role:'user',content:msg}]);
    setInput('');
    setLoading(true);
    setMsgCount(c=>c+1);
    try {
      const res = await fetch('/.netlify/functions/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:1000,
          system:'Du är en psykologisk samtalspartner på Tryggman — en plattform för mäns psykiska hälsa. Du är NEUTRAL och REFLEKTERANDE. Du ställer frågor som hjälper personen att tänka djupare. Du förstår att många män har svårt att prata om känslor och möter varje man med respekt utan att vara överdrivet positiv eller bekräftande. VIKTIGT: Du är inte terapeut. Vid kris: Mind Självmordslinjen 90101, akut fara 112. Tala alltid svenska.',
          messages: messages.concat({role:'user',content:msg}).map(m=>({role:m.role,content:m.content}))
        })
      });
      const data = await res.json();
      setMessages(p=>[...p,{role:'assistant',content:data.content[0].text}]);
    } catch {
      setMessages(p=>[...p,{role:'assistant',content:'Om du behöver stöd nu kan du ringa Mind Självmordslinjen på 90101 — anonymt och gratis, dygnet runt.'}]);
    }
    setLoading(false);
  };

  const Modal = () => (
    <div className="chat-fullscreen">
      <div className="chat-header-bar">
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <div style={{width:'36px',height:'36px',background:'#3A7D6E',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontFamily:'DM Serif Display,serif',color:'#fff',fontWeight:400}}>T</div>
          <div>
            <div style={{fontFamily:'DM Serif Display,serif',fontSize:'1rem',color:'#fff'}}>AI-Rådgivning</div>
            <div style={{fontSize:'0.72rem',color:'#4E9E8D'}}>● Alltid tillgänglig · Anonymt</div>
          </div>
        </div>
        <button onClick={()=>setModalOpen(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:'1.3rem',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>✕ Stäng</button>
      </div>
      <div style={{background:'rgba(58,125,110,0.08)',padding:'0.4rem 1.5rem',fontSize:'0.72rem',color:'rgba(255,255,255,0.35)',borderBottom:'1px solid rgba(255,255,255,0.04)',flexShrink:0}}>
        Ersätter inte professionell vård · Kris: <strong style={{color:'#4E9E8D'}}>90101</strong> / <strong style={{color:'#4E9E8D'}}>112</strong>
      </div>
      <div className="chat-messages">
        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
            <div className={m.role==='user'?'chat-bubble-user':'chat-bubble-ai'}>{m.content}</div>
          </div>
        ))}
        {loading && <div><div className="chat-bubble-ai" style={{color:'rgba(255,255,255,0.35)'}}>Skriver...</div></div>}
        <div ref={bottomRef}/>
      </div>
      {isLocked ? (
        <div style={{padding:'1.5rem',background:'#2E4050',borderTop:'1px solid rgba(255,255,255,0.07)',textAlign:'center',flexShrink:0}}>
          <p style={{color:'rgba(255,255,255,0.55)',fontSize:'0.85rem',marginBottom:'1rem'}}>Du har använt dina {FREE_LIMIT} gratis meddelanden</p>
          <button className="btn-primary" onClick={()=>{setModalOpen(false);nav('konto');}}>Prova gratis i 14 dagar — 39 kr/mån</button>
        </div>
      ) : (
        <>
          {!isPremium && <div style={{padding:'0.3rem',background:'rgba(78,158,141,0.08)',textAlign:'center',fontSize:'0.75rem',color:'#4E9E8D',flexShrink:0}}>{FREE_LIMIT-msgCount} gratis meddelanden kvar</div>}
          <form onSubmit={send} className="chat-input-bar">
            <input ref={inputRef} type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="Skriv här..." disabled={loading} className="chat-input"/>
            <button type="submit" disabled={loading} className="chat-send-btn">{loading?'...':'Skicka'}</button>
          </form>
        </>
      )}
    </div>
  );

  return (
    <div>
      <Ticker/>
      <div className="page-hero">
        <div className="section-label">AI-Rådgivning</div>
        <h1>Prata med <em>någon</em></h1>
        <p>Anonymt. Dygnet runt. Utan väntetid. Ett första steg när det känns svårt att ta nästa.</p>
      </div>
      {modalOpen && <Modal/>}
      <div style={{padding:'3rem 8%',maxWidth:'700px',margin:'0 auto'}}>
        <div style={{background:'#fff',borderTop:'3px solid #1C2B35',padding:'2.5rem',cursor:'pointer'}} onClick={()=>setModalOpen(true)}>
          <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem'}}>
            <div style={{width:'44px',height:'44px',background:'#1C2B35',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Serif Display,serif',color:'#fff',fontSize:'1.1rem'}}>T</div>
            <div>
              <div style={{fontFamily:'DM Serif Display,serif',fontSize:'1.1rem',color:'#1C2B35'}}>AI-Rådgivning</div>
              <div style={{fontSize:'0.78rem',color:'#4E9E8D'}}>● Alltid tillgänglig</div>
            </div>
          </div>
          <p style={{color:'#6B7A85',fontSize:'0.9rem',marginBottom:'1.5rem',lineHeight:'1.7'}}>
            {messages.length > 1 ? `${messages.length-1} meddelanden i konversationen` : 'Hur mår du idag? Jag lyssnar.'}
          </p>
          {messages.slice(-1).map((m,i)=>(
            <div key={i} style={{background:'#F2EDE5',padding:'1rem 1.2rem',borderLeft:'3px solid '+(m.role==='user'?'#3A7D6E':'#1C2B35'),marginBottom:'1rem',fontSize:'0.88rem',color:'#6B7A85',lineHeight:'1.7'}}>
              <span style={{fontSize:'0.7rem',fontWeight:500,color:m.role==='user'?'#3A7D6E':'#1C2B35',textTransform:'uppercase',letterSpacing:'0.1em',display:'block',marginBottom:'0.3rem'}}>{m.role==='user'?'Du':'AI-Rådgivare'}</span>
              {m.content.slice(0,120)}{m.content.length>120?'...':''}
            </div>
          ))}
          <button className="btn-primary" style={{width:'100%'}}>{messages.length>1?'Fortsätt samtalet':'Starta samtal'}</button>
          <p style={{textAlign:'center',fontSize:'0.75rem',color:'#6B7A85',marginTop:'0.8rem'}}>Vid akut kris: Ring 90101 (Mind) eller 112</p>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   TERAPEUT PAGE
   ============================================================ */
const TerapeutPage = ({ nav, isPremium, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [msgCount, setMsgCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const MESSAGE_LIMIT = 10;

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'chats', currentUser.uid, 'messages'), orderBy('createdAt'));
    return onSnapshot(q, snap => setMessages(snap.docs.map(d=>({id:d.id,...d.data()}))));
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !messages.length) return;
    const now = new Date();
    const count = messages.filter(m => {
      if (m.sender !== 'user' || !m.createdAt) return false;
      const d = m.createdAt.toDate ? m.createdAt.toDate() : new Date(m.createdAt.seconds*1000);
      return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    }).length;
    setMsgCount(count);
  }, [messages, currentUser]);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);
  useEffect(() => { if (modalOpen) setTimeout(()=>inputRef.current?.focus(),100); }, [modalOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentUser || msgCount >= MESSAGE_LIMIT) return;
    const text = input;
    setInput('');
    const isFirst = messages.length === 0;
    await setDoc(doc(db,'chats',currentUser.uid), {
      userId:currentUser.uid, userEmail:currentUser.email,
      userName:currentUser.displayName||currentUser.email,
      lastMessage:text, updatedAt:serverTimestamp(),
      ...(isFirst && {firstMessageAt:serverTimestamp(),queueStatus:'waiting',therapistReplied:false})
    }, {merge:true});
    await addDoc(collection(db,'chats',currentUser.uid,'messages'), {
      text, sender:'user', senderName:currentUser.displayName||currentUser.email, createdAt:serverTimestamp()
    });
  };

  if (!currentUser) return (
    <div>
      <Ticker/>
      <div className="page-hero">
        <div className="section-label">Personlig terapeut</div>
        <h1>Professionellt <em>stöd</em></h1>
        <p>Logga in för att chatta med din terapeut.</p>
      </div>
      <div style={{padding:'3rem 8%',textAlign:'center'}}>
        <button className="btn-primary" onClick={()=>nav('login')}>Logga in</button>
      </div>
    </div>
  );

  if (!isPremium) return (
    <div>
      <Ticker/>
      <div className="page-hero">
        <div className="section-label">Personlig terapeut</div>
        <h1>Professionellt <em>stöd</em></h1>
        <p>Asynkron textterapi med certifierad psykoterapeut.</p>
      </div>
      <div style={{padding:'3rem 8%',maxWidth:'600px',margin:'0 auto',textAlign:'center'}}>
        <div style={{background:'#F2EDE5',borderTop:'3px solid #1C2B35',padding:'3rem 2rem'}}>
          <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🔒</div>
          <h3 style={{fontFamily:'DM Serif Display,serif',fontSize:'1.8rem',color:'#1C2B35',marginBottom:'1rem'}}>Premium krävs</h3>
          <p style={{color:'#6B7A85',marginBottom:'2rem',lineHeight:'1.7'}}>Ingen bokning. Ingen diagnos. Bara någon som lyssnar och svarar — när du behöver det.</p>
          <button className="btn-primary" onClick={()=>nav('konto')}>Uppgradera till Premium — 349 kr/mån</button>
        </div>
      </div>
    </div>
  );

  const Modal = () => (
    <div className="chat-fullscreen">
      <div className="chat-header-bar">
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <div style={{width:'36px',height:'36px',background:'#3A7D6E',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontFamily:'DM Serif Display,serif',color:'#fff'}}>T</div>
          <div>
            <div style={{fontFamily:'DM Serif Display,serif',fontSize:'1rem',color:'#fff'}}>Din terapeut</div>
            <div style={{fontSize:'0.72rem',color:'#4E9E8D'}}>● Svarar inom 24 timmar</div>
          </div>
        </div>
        <button onClick={()=>setModalOpen(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:'1.3rem',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>✕ Stäng</button>
      </div>
      <div className="chat-messages">
        {messages.length===0 && (
          <div style={{textAlign:'center',padding:'3rem',color:'rgba(255,255,255,0.3)'}}>
            <div style={{fontFamily:'DM Serif Display,serif',fontSize:'1.2rem',marginBottom:'0.5rem',color:'rgba(255,255,255,0.5)'}}>Välkommen till din trygga plats</div>
            <p style={{fontSize:'0.85rem',lineHeight:'1.7'}}>Skriv ditt första meddelande. Din terapeut svarar inom 24 timmar.</p>
          </div>
        )}
        {messages.map(m=>(
          <div key={m.id} style={{display:'flex',justifyContent:m.sender==='user'?'flex-end':'flex-start'}}>
            <div className={m.sender==='user'?'chat-bubble-user':'chat-bubble-ai'}>
              {m.text}
              <div style={{fontSize:'0.7rem',opacity:0.5,marginTop:'4px'}}>{formatTime(m.createdAt)}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
      {msgCount>0 && msgCount<MESSAGE_LIMIT && (
        <div style={{padding:'0.3rem',background:'rgba(78,158,141,0.08)',textAlign:'center',fontSize:'0.75rem',color:'#4E9E8D',flexShrink:0}}>{MESSAGE_LIMIT-msgCount} meddelanden kvar denna månad</div>
      )}
      <form onSubmit={sendMessage} className="chat-input-bar">
        <input ref={inputRef} type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder={msgCount>=MESSAGE_LIMIT?'Meddelandegräns nådd':'Skriv till din terapeut...'} disabled={msgCount>=MESSAGE_LIMIT} className="chat-input"/>
        <button type="submit" disabled={!input.trim()||msgCount>=MESSAGE_LIMIT} className="chat-send-btn">Skicka</button>
      </form>
      <div style={{padding:'0.5rem',textAlign:'center',fontSize:'0.7rem',color:'rgba(255,255,255,0.2)',flexShrink:0}}>Krypterat och konfidentiellt · Kris: ring 90101 eller 112</div>
    </div>
  );

  return (
    <div>
      <Ticker/>
      <div className="page-hero">
        <div className="section-label">Personlig terapeut</div>
        <h1>Din <em>terapeut</em></h1>
        <p>Asynkron textterapi med certifierad psykoterapeut. Skriv när du vill — svar vardagar inom 24 timmar.</p>
      </div>
      {modalOpen && <Modal/>}
      <div style={{padding:'3rem 8%',maxWidth:'700px',margin:'0 auto'}}>
        <div style={{background:'#fff',borderTop:'3px solid #1C2B35',padding:'2.5rem',cursor:'pointer'}} onClick={()=>setModalOpen(true)}>
          <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem'}}>
            <div style={{width:'44px',height:'44px',background:'#1C2B35',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Serif Display,serif',color:'#fff',fontSize:'1.1rem'}}>T</div>
            <div>
              <div style={{fontFamily:'DM Serif Display,serif',fontSize:'1.1rem',color:'#1C2B35'}}>Din personliga terapeut</div>
              <div style={{fontSize:'0.78rem',color:'#4E9E8D'}}>● Svarar inom 24 timmar</div>
            </div>
          </div>
          <p style={{color:'#6B7A85',fontSize:'0.9rem',marginBottom:'1.5rem',lineHeight:'1.7'}}>
            {messages.length>0?`${messages.length} meddelanden · Tryck för att fortsätta`:'Tryck för att skriva till din terapeut'}
          </p>
          {messages.length>0 && (
            <div style={{background:'#F2EDE5',padding:'1rem 1.2rem',borderLeft:'3px solid #3A7D6E',marginBottom:'1rem',fontSize:'0.88rem',color:'#6B7A85',lineHeight:'1.7'}}>
              <span style={{fontSize:'0.7rem',fontWeight:500,color:messages[messages.length-1].sender==='user'?'#3A7D6E':'#1C2B35',textTransform:'uppercase',letterSpacing:'0.1em',display:'block',marginBottom:'0.3rem'}}>{messages[messages.length-1].sender==='user'?'Du':'Terapeut'}</span>
              {messages[messages.length-1].text.slice(0,120)}{messages[messages.length-1].text.length>120?'...':''}
            </div>
          )}
          <button className="btn-primary" style={{width:'100%'}}>{messages.length>0?'Fortsätt chatten':'Starta chatten'}</button>
          <p style={{textAlign:'center',fontSize:'0.75rem',color:'#6B7A85',marginTop:'0.8rem'}}>Krypterat och konfidentiellt · Vid kris: ring 90101 eller 112</p>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   LOGIN PAGE
   ============================================================ */
const LoginPage = ({ nav }) => {
  const { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (isForgot) {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Återställningsmail skickat!');
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        nav('hem');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        nav('hem');
      }
    } catch {
      setError(isForgot?'Kunde inte skicka mail.':isLogin?'Fel e-post eller lösenord.':'Kunde inte skapa konto.');
    }
    setLoading(false);
  };

  return (
    <div>
      <Ticker/>
      <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'3rem 5%',background:'#FAFAF7'}}>
        <div style={{maxWidth:'420px',width:'100%'}}>
          <div style={{background:'#fff',borderTop:'3px solid #1C2B35',padding:'2.5rem'}}>
            <h2 style={{fontFamily:'DM Serif Display,serif',fontSize:'2rem',color:'#1C2B35',marginBottom:'0.4rem'}}>
              {isForgot?'Glömt lösenord':isLogin?'Välkommen tillbaka':'Skapa konto'}
            </h2>
            <p style={{color:'#6B7A85',fontSize:'0.88rem',marginBottom:'2rem',fontWeight:300}}>
              {isForgot?'Vi skickar ett återställningsmail':isLogin?'Logga in på ditt konto':'Börja din resa'}
            </p>
            {error && <div style={{background:'rgba(192,135,58,0.1)',borderLeft:'3px solid #C0873A',padding:'0.8rem 1rem',color:'#C0873A',fontSize:'0.85rem',marginBottom:'1rem'}}>{error}</div>}
            {success && <div style={{background:'rgba(58,125,110,0.1)',borderLeft:'3px solid #3A7D6E',padding:'0.8rem 1rem',color:'#3A7D6E',fontSize:'0.85rem',marginBottom:'1rem'}}>{success}</div>}
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div>
                <label className="input-label">E-post</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="din@epost.se" className="input-field"/>
              </div>
              {!isForgot && (
                <div>
                  <label className="input-label">Lösenord</label>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Minst 6 tecken" className="input-field"/>
                </div>
              )}
              {isLogin && !isForgot && (
                <div style={{textAlign:'right'}}>
                  <button type="button" onClick={()=>setIsForgot(true)} style={{background:'none',border:'none',color:'#3A7D6E',fontSize:'0.82rem',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Glömt lösenord?</button>
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary" style={{marginTop:'0.5rem'}}>
                {loading?'Laddar...':(isForgot?'Skicka mail':isLogin?'Logga in':'Skapa konto')}
              </button>
            </form>
            {isForgot ? (
              <p style={{textAlign:'center',marginTop:'1.5rem',fontSize:'0.85rem',color:'#6B7A85'}}>
                <button onClick={()=>setIsForgot(false)} style={{background:'none',border:'none',color:'#3A7D6E',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>← Tillbaka till inloggning</button>
              </p>
            ) : (
              <p style={{textAlign:'center',marginTop:'1.5rem',fontSize:'0.85rem',color:'#6B7A85'}}>
                {isLogin?'Inget konto?':'Redan medlem?'}{' '}
                <button onClick={()=>setIsLogin(!isLogin)} style={{background:'none',border:'none',color:'#3A7D6E',fontWeight:500,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{isLogin?'Skapa konto':'Logga in'}</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   PLACEHOLDER
   ============================================================ */
const PlaceholderPage = ({ title, label, nav }) => (
  <div>
    <Ticker/>
    <div className="page-hero">
      <div className="section-label">{label}</div>
      <h1>{title}</h1>
      <p>Kommer snart.</p>
    </div>
    <div style={{padding:'3rem 8%',textAlign:'center'}}>
      <button className="btn-ghost" onClick={()=>nav('hem')}>← Tillbaka till start</button>
    </div>
  </div>
);

/* ============================================================
   APP CONTENT
   ============================================================ */
const AppContent = () => {
  const { currentUser, isPremium, isTherapist, signOut, auth } = useAuth();
  const [page, setPage] = useState('hem');
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = (p) => { setPage(p); setMenuOpen(false); };

  const menuItems = [
    { key:'chat', label:'AI-Chat', group:'plattform' },
    { key:'terapeut', label:'Terapeut', group:'plattform' },
    { key:'halsa', label:'Min hälsa', group:'plattform' },
    { key:'ovningar', label:'Övningar', group:'plattform' },
    { key:'artiklar', label:'Artiklar', group:'plattform' },
    { key:'berattelser', label:'Berättelser', group:'plattform' },
    { key:'community', label:'Community', group:'plattform' },
    { key:'priser', label:'Priser', group:'konto' },
    { key:'konto', label:'Mitt konto', group:'konto' },
  ];

  const renderPage = () => {
    switch(page) {
      case 'hem': return <HomePage nav={nav}/>;
      case 'chat': return <ChatPage nav={nav} isPremium={isPremium} currentUser={currentUser}/>;
      case 'terapeut': return <TerapeutPage nav={nav} isPremium={isPremium} currentUser={currentUser}/>;
      case 'login': return <LoginPage nav={nav}/>;
      case 'halsa': return <PlaceholderPage title="Min hälsa" label="Välmående" nav={nav}/>;
      case 'ovningar': return <PlaceholderPage title="Övningar" label="Mindfulness" nav={nav}/>;
      case 'artiklar': return <PlaceholderPage title="Artiklar" label="Kunskap" nav={nav}/>;
      case 'berattelser': return <PlaceholderPage title="Berättelser" label="Gemenskap" nav={nav}/>;
      case 'community': return <PlaceholderPage title="Community" label="Gemenskap" nav={nav}/>;
      case 'konto': return <PlaceholderPage title="Mitt konto" label="Konto" nav={nav}/>;
      case 'priser': return <PlaceholderPage title="Priser" label="Prenumeration" nav={nav}/>;
      case 'resurser': return <PlaceholderPage title="Resurser & hjälplinjer" label="Hjälp" nav={nav}/>;
      case 'om-oss': return <PlaceholderPage title="Om oss" label="Tryggman" nav={nav}/>;
      default: return <HomePage nav={nav}/>;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className={`nav-menu-overlay${menuOpen?' open':''}`} onClick={()=>setMenuOpen(false)}/>
      <div className={`nav-menu${menuOpen?' open':''}`}>
        <ul>
          <div className="nav-menu-label">Plattformen</div>
          {menuItems.filter(i=>i.group==='plattform').map(item=>(
            <li key={item.key}><button className={`nav-menu-btn${page===item.key?' active':''}`} onClick={()=>nav(item.key)}>{item.label}</button></li>
          ))}
          <div className="nav-menu-label">Konto</div>
          {menuItems.filter(i=>i.group==='konto').map(item=>(
            <li key={item.key}><button className={`nav-menu-btn${page===item.key?' active':''}`} onClick={()=>nav(item.key)}>{item.label}</button></li>
          ))}
        </ul>
        <div className="nav-menu-bottom">
          <button onClick={()=>nav('om-oss')}>Om oss</button>
          <button onClick={()=>nav('resurser')}>Resurser & hjälplinjer</button>
          {currentUser ? (
            <button onClick={()=>signOut(auth)} style={{color:'rgba(255,255,255,0.5)'}}>Logga ut</button>
          ) : (
            <button onClick={()=>nav('login')} style={{color:'#4E9E8D',fontWeight:500}}>Logga in</button>
          )}
        </div>
      </div>

      <nav>
        <span className="nav-logo" onClick={()=>nav('hem')}>Tryggman</span>
        <button className={`hamburger${menuOpen?' open':''}`} onClick={(e)=>{e.stopPropagation();setMenuOpen(!menuOpen);}}>
          <span/><span/><span/>
        </button>
      </nav>

      <main className="main-content">{renderPage()}</main>

      <footer>
        <div className="footer-top">
          <div>
            <span className="footer-brand" onClick={()=>nav('hem')}>Tryggman</span>
            <p className="footer-tagline">Där trygghet skapas. Tillsammans bryter vi tystnaden kring mäns psykiska hälsa.</p>
          </div>
          <div className="footer-col">
            <h4>Plattformen</h4>
            <ul>
              <li><button onClick={()=>nav('chat')}>AI-Chat</button></li>
              <li><button onClick={()=>nav('terapeut')}>Terapeut</button></li>
              <li><button onClick={()=>nav('community')}>Community</button></li>
              <li><button onClick={()=>nav('halsa')}>Min hälsa</button></li>
              <li><button onClick={()=>nav('ovningar')}>Övningar</button></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Innehåll</h4>
            <ul>
              <li><button onClick={()=>nav('artiklar')}>Artiklar</button></li>
              <li><button onClick={()=>nav('berattelser')}>Berättelser</button></li>
              <li><button onClick={()=>nav('resurser')}>Resurser</button></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Om Tryggman</h4>
            <ul>
              <li><button onClick={()=>nav('om-oss')}>Om oss</button></li>
              <li><button onClick={()=>nav('priser')}>Priser</button></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Tryggman</div>
          <div className="footer-crisis">Kris? Ring 90101 eller 112</div>
        </div>
        <div className="footer-legal">
          <button>Integritetspolicy</button>
          <button>Användarvillkor</button>
          <button>Cookies</button>
        </div>
      </footer>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent/>
    </AuthProvider>
  );
}
