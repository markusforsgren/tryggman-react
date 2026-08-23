import { useState, useEffect, useRef } from "react";
import { db, auth, collection, addDoc, onSnapshot, query, orderBy, where, serverTimestamp, doc, updateDoc, increment, getDocs } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

/* ============================================================
   ARTIKLAR PAGE
   ============================================================ */
const articles = [
  { id:1, tag:'Tystnad & manlighet', category:'tystnad', title:'Borsta bort gruset och upp igen', excerpt:'Det börjar inte med något dramatiskt. Det börjar istället tyst, omärkligt och sakta — med en röst som med tiden börjar låta som din egen.', readTime:'8 min', premium:false, featured:true, content:`<p>Det börjar inte med något dramatiskt. Det börjar istället som de flesta viktiga saker i livet börjar — tyst, omärkligt och så sakta att man inte ens märker att det pågår.</p><p>Det börjar med en röst. Kanske din pappas röst. Kanske din farfars, din äldre brors, en tränares eller en lärares. En röst som tillhörde någon du såg upp till, vars ord landade djupt.</p><blockquote>Borsta bort gruset. Upp igen.</blockquote><p>Du föll. Det gjorde ont. Men smärtan fick inte ta plats. Den borstades bort tillsammans med gruset på knäet, och du reste dig. Inte för att du inte hade ont. Utan för att det var det enda som var tillåtet.</p><h2>Fasaden som blev ett hem</h2><p>Det är det som är så lurigt med inlärd tystnad — den är fullständigt osynlig inifrån. Du lär dig le på rätt ställen, svara "bra tack" när folk frågar hur du mår.</p><div class="stat-box"><strong>70%</strong><span>Av män som mår dåligt söker aldrig professionell hjälp. (Källa: Mind)</span></div><h2>Det vi inte fick lära oss</h2><p>Det vi egentligen behövde lära oss är att känslor inte är ett tecken på svaghet. Att gråta inte gör en till mindre man. Att be om hjälp inte är ett nederlag utan ett mod.</p>` },
  { id:2, tag:'Utbrändhet & stress', category:'utbrändhet', title:'Vad utbrändhet faktiskt är', excerpt:'Att gå in i väggen är inte bara att man blir trött. Det är en monumental felaktighet i hur vi som samhälle pratar om utbrändhet.', readTime:'10 min', premium:false, content:`<p>Att gå in i väggen är inte bara att man blir trött. Det handlar om att kroppen bokstavligen håller på att stänga av på ett grundläggande, biologiskt plan.</p><h2>Hjärnan som slutade fungera</h2><p>Logiken försvinner. Den analytiska förmågan är borta. Minnet sviker i de mest vardagliga situationer.</p><blockquote>Det var som om alla försvarsmurar jag byggt upp under ett helt liv hade vittrat sönder till damm på en sekund.</blockquote><div class="stat-box"><strong>Underdiagnostiserade</strong><span>Forskning visar att män och kvinnor drabbas ungefär lika ofta av utbrändhet — men männens symtom är svårare att känna igen. (Källa: Lunds universitet)</span></div>` },
  { id:3, tag:'Depression', category:'depression', title:'Depression hos män — så ser symtomen ut', excerpt:'Depression hos män ser ofta inte ut som tårar och sängliggande. Den ser ut som ilska, distans, alkohol och överarbete.', readTime:'9 min', premium:false, content:`<p>När de flesta tänker på depression föreställer de sig en person som ligger i sängen och gråter. Men det är sällan så det ser ut hos män.</p><h2>Hur depression faktiskt ser ut hos män</h2><p>Irritabilitet snarare än sorg. Ilska som exploderar vid fel tidpunkt. En känsla av tomhet.</p><blockquote>Jag var inte ledsen. Jag var bara inte något alls.</blockquote><div class="stat-box"><strong>3 av 4</strong><span>Självmord i Sverige begås av män. Depression är den vanligaste orsaken. (Källa: Folkhälsomyndigheten)</span></div>` },
  { id:4, tag:'Ångest', category:'ångest', title:'Ångest hos män — vad det är och vad som hjälper', excerpt:'Ångest är inte bara oro. Det är en fysisk, överväldigande upplevelse som kan lamslå en människa mitt i vardagen.', readTime:'11 min', premium:false, content:`<p>Ångest är en av de vanligaste psykiska besvären — men bland männen pratas det sällan om det.</p><h2>Vad ångest faktiskt är</h2><p>Ångest är kroppens larmsystem som gått i överdrift. Hjärtat slår snabbare, andningen blir ytlig, musklerna spänner sig.</p><blockquote>Det kändes som att sitta i en bil med en motor som aldrig stängs av. Konstant brus.</blockquote><div class="stat-box"><strong>1 av 4</strong><span>Män upplever kliniskt signifikant ångest någon gång i livet. (Källa: WHO)</span></div>` },
  { id:5, tag:'Utbrändhet & stress', category:'utbrändhet', title:'Sömnproblem och stress — sambandet ingen pratar om', excerpt:'Dålig sömn skapar mer stress. Mer stress skapar sämre sömn. Det är en spiral som kan ta år att ta sig ur.', readTime:'8 min', premium:true, content:`<p>Det börjar ofta med en period av ökad stress. Och sömnen påverkas.</p><blockquote>Efter tre veckor av dålig sömn var det som att världen hade bytt färg.</blockquote><div class="stat-box"><strong>6 timmar</strong><span>Forskning visar att personer som sover under 6 timmar per natt löper dubbelt så hög risk för hjärt-kärlsjukdom. (Källa: Karolinska Institutet)</span></div>` },
  { id:6, tag:'Föräldraskap', category:'föräldraskap', title:'Pappan som inte räknades', excerpt:'Sverige är ett av världens mest jämställda länder. Men det finns en sida av berättelsen som sällan berättas.', readTime:'9 min', premium:true, content:`<p>Det finns ett kontrakt som ingen skriver på men som alla förväntas följa.</p><blockquote>Inte onda blickar. Inte fientliga. Bara frågande. En tyst undran: Var är mamman?</blockquote><div class="stat-box"><strong>Stark riskfaktor</strong><span>Fäder som förlorar kontakten med sina barn efter en separation löper kraftigt förhöjd risk för psykisk ohälsa.</span></div>` },
  { id:7, tag:'Relationer', category:'relationer', title:'Rösten som sa att du är fel', excerpt:'Det finns en sorts utmattning som inte syns på ett blodprov. Utmattningen av att leva länge med en röst som talar om för dig vem du är.', readTime:'11 min', premium:true, content:`<p>Det finns en sorts utmattning som inte syns på ett blodprov.</p><blockquote>Man justerar sig. Man försöker bli bättre. Man försöker räcka till.</blockquote>` },
  { id:8, tag:'Återhämtning', category:'återhämtning', title:'Klockan 03 — natten jag förstod hur illa det faktiskt var', excerpt:'Strålkastarna skar som glödande knivar. Musiken på högsta volym var det enda tillförlitliga verktyget för att hålla ögonlocken uppe.', readTime:'12 min', premium:true, content:`<p>Det var ett liv på marginalen av vad en kropp klarar.</p><blockquote>Tankarna malde om samma sak om och om igen. Och de malde hårdast mitt i natten.</blockquote><div class="stat-box"><strong>Varje dag</strong><span>Tar i genomsnitt fyra personer sitt liv i Sverige. Tre av dem är män. Men nio av tio som gjort ett försök och överlever, dör inte av självmord senare. Det finns en väg framåt. (Källa: Mind)</span></div>` },
  { id:9, tag:'Återhämtning', category:'återhämtning', title:'Altanen — ur mörkret, en gnista', excerpt:'Det var de tankarna som malde i mig den kvällen. Ensam under plasttaket medan regnet smattrade. Och mitt i det mörkret hände något.', readTime:'8 min', premium:true, content:`<p>Jag satt under plasttaket medan regnet smattrade och stänkte in.</p><blockquote>Det måste finnas tusentals män som sitter på exakt likadana altaner just nu, i exakt samma ensamhet.</blockquote><p>Ur den insikten föddes något. En vägran att låta tystnaden vinna. Det var där idén till Tryggman.se tog form.</p>` },
  { id:10, tag:'Depression', category:'depression', title:'Hur pratar man med en vän som mår dåligt', excerpt:'Du märker att din vän inte är sig själv. Han verkar borta, trött, eller arg av okänd anledning. Du vill säga något — men vet inte hur.', readTime:'7 min', premium:false, content:`<p>De flesta gör ett av två misstag: antingen säger de ingenting alls. Eller så försöker de genast lösa problemet.</p><blockquote>Fråga rakt ut: Mår du bra? Inte som ett artighetsfrågande — utan som en riktig fråga.</blockquote><div class="stat-box"><strong>Det viktigaste</strong><span>Forskning visar att det att någon frågar direkt om en person mår dåligt minskar risken för självmord. (Mind)</span></div>` },
  { id:11, tag:'Föräldraskap', category:'föräldraskap', title:'Att vara pappa och må dåligt — du är inte ensam', excerpt:'Pappor mår dåligt också. Men det pratas sällan om. För vem ska ta hand om familjen om pappa inte håller ihop?', readTime:'8 min', premium:false, content:`<p>Det finns en föreställning om att pappor är de som håller ihop.</p><blockquote>Jag älskade dem mer än allt. Och ändå räckte jag inte till.</blockquote><div class="stat-box"><strong>10%</strong><span>Av nyblivna pappor upplever postpartumdepression. (Källa: Karolinska Institutet)</span></div>` },
  { id:12, tag:'Utbrändhet & stress', category:'utbrändhet', title:'Stressens fysiologi — vad som händer i kroppen', excerpt:'Stress är inte bara en känsla. Det är en biologisk reaktion som förändrar din kropp på cellnivå.', readTime:'9 min', premium:true, content:`<p>Vi pratar om stress som om det vore en känsla. Men stress är i grunden en biologisk reaktion.</p><div class="stat-box"><strong>Kronisk stress</strong><span>Förkortar telomererna — skyddskapslar på DNA-kedjorna kopplade till åldrande och sjukdom. (Källa: Nobelinstitutet)</span></div>` },
];

const stories = [
  { id:1, name:'Johan', initials:'J', meta:'42 år · Göteborg', tag:'Utbrändhet', title:'Dagen jag grät på parkeringen', locked:false, excerpt:'Jag satt i bilen i tjugo minuter innan jag orkade gå in på jobbet. Inte för att jag var rädd. Utan för att jag var så trött att tårarna bara rann och jag inte ens förstod varför.', full:`<p>Jag satt i bilen i tjugo minuter innan jag orkade gå in på jobbet. Inte för att jag var rädd för något. Utan för att jag var så trött att tårarna bara rann och jag inte ens förstod varför.</p><blockquote>"Det är inte en tuff period. Det är ditt liv. Och det håller på att köra dig i botten."</blockquote><p>Det var vad min fru sa till mig den kvällen. Jag sökte hjälp tre veckor senare. Det var det svåraste jag gjort. Och det bästa.</p>` },
  { id:2, name:'Anonym', initials:'A', meta:'35 år', tag:'Skilsmässa & barn', title:'Jag fick lära mig att vara pappa på halv tid', locked:false, excerpt:'Ingen förberedde mig på hur det skulle kännas att lämna dem på söndagskvällen.', full:`<p>Ingen förberedde mig på hur det skulle kännas att lämna dem på söndagskvällen.</p><blockquote>Jag är fortfarande deras pappa, varje dag, oavsett vilket hem de sover i.</blockquote>` },
  { id:3, name:'Mikael', initials:'M', meta:'51 år · Stockholm', tag:'Depression', title:'Tjugo år med ett leende som inte var mitt', locked:true, excerpt:'Jag var den rolige. Den som alltid hade ett svar, en historia, ett skämt. Ingen visste att jag på insidan var totalt tom.', full:`<p>Jag var den rolige. Ingen visste att jag på insidan var totalt tom.</p><blockquote>Depression ser sällan ut som man tror. Ibland ser det ut som att allting är bra.</blockquote>` },
  { id:4, name:'Anonym', initials:'A', meta:'28 år', tag:'Ångest', title:'Ångesten ingen visste om', locked:true, excerpt:'Utifrån såg jag ut att ha allt. Inuti var det som att sitta i en bil med en motor som aldrig stängs av.', full:`<p>Utifrån såg jag ut att ha allt. Inuti var det som att sitta i en bil med en motor som aldrig stängs av.</p><blockquote>Det tog ett panikattack på jobbet — framför tre kollegor — innan jag sökte hjälp.</blockquote>` },
  { id:5, name:'Thomas', initials:'T', meta:'44 år · Malmö', tag:'Ensamhet', title:'Omgiven av folk, helt ensam', locked:true, excerpt:'Jag hade ett fullt socialt liv på pappret. Men ingen visste egentligen vem jag var.', full:`<p>Jag hade ett fullt socialt liv på pappret. Men ingen visste egentligen vem jag var.</p><blockquote>Den enda platsen jag faktiskt fick vara ärlig var i en anonym onlineforum.</blockquote>` },
];

const exercises = {
  '478': { name:'4-7-8 Andning', desc:'Andas in 4s, håll 7s, ut 8s. Lugnar nervsystemet snabbt.', icon:'🌬️', phases:[{name:'Andas in',duration:4,scale:1.4},{name:'Håll',duration:7,scale:1.4},{name:'Andas ut',duration:8,scale:1.0}], rounds:4, complete:'Du har aktiverat ditt parasympatiska nervsystem. Ångesten och stressen minskar nu naturligt.' },
  'box': { name:'Box Breathing', desc:'In 4s → Håll 4s → Ut 4s → Håll 4s. Militär teknik för stresshantering.', icon:'📦', phases:[{name:'Andas in',duration:4,scale:1.4},{name:'Håll',duration:4,scale:1.4},{name:'Andas ut',duration:4,scale:1.0},{name:'Håll',duration:4,scale:1.0}], rounds:5, complete:'Box breathing är klart. Ditt nervsystem är nu i balans.' },
  'grounding': { name:'5-4-3-2-1 Grounding', desc:'Namnge 5 saker du ser, 4 du rör, 3 du hör, 2 du luktar, 1 du smakar.', icon:'🌱', phases:[{name:'5 saker du ser',duration:20,scale:1.1},{name:'4 saker du kan röra',duration:20,scale:1.1},{name:'3 saker du hör',duration:20,scale:1.1},{name:'2 saker du luktar',duration:15,scale:1.1},{name:'1 sak du smakar',duration:10,scale:1.1}], rounds:1, complete:'Du är tillbaka i nuet. Ångestspiralen är bruten.' },
  'activation': { name:'Aktiveringsandning', desc:'Snabba kraftfulla andetag för att öka energin och fokus.', icon:'⚡', phases:[{name:'Snabb andning',duration:20,scale:1.2},{name:'Andas ut helt',duration:2,scale:1.0},{name:'Håll',duration:10,scale:1.0}], rounds:3, complete:'Syreupptagningen har ökat. Du borde känna en naturlig energikick nu.' },
  'relaxation': { name:'Progressiv avslappning', desc:'Spänn och slappna av muskelgrupper från fötter till huvud.', icon:'😌', phases:[{name:'Fötter — spänn',duration:8,scale:1.3},{name:'Fötter — slappna av',duration:8,scale:1.0},{name:'Axlar — höj',duration:8,scale:1.3},{name:'Axlar — släpp',duration:8,scale:1.0},{name:'Ansikte — grimasa',duration:8,scale:1.3},{name:'Ansikte — slappna av',duration:8,scale:1.0}], rounds:1, complete:'Kroppen är nu djupt avslappnad. Perfekt för sömn eller återhämtning.' },
  'anger': { name:'Snabb nedvarvning', desc:'Lång utandning sänker pulsen snabbt. För ilska och frustration.', icon:'🧊', phases:[{name:'Andas in',duration:4,scale:1.3},{name:'Andas ut långsamt',duration:8,scale:1.0}], rounds:3, complete:'Pulsen har sjunkit. Du har kontrollen tillbaka — inte ilskan.' },
};

const pageCss = `
.page-hero{padding:7rem 8% 4rem;background:#1C2B35;margin-top:62px}
.page-hero .section-label{color:#4E9E8D}
.page-hero h1{font-family:'DM Serif Display',serif;font-size:3.5rem;line-height:1.1;color:#fff;margin-bottom:1rem}
.page-hero h1 em{font-style:italic;color:#4E9E8D}
.page-hero p{font-size:1rem;color:rgba(255,255,255,0.5);max-width:520px;font-weight:300;line-height:1.85}

.filter-bar{padding:1.2rem 8%;background:#fff;border-bottom:1px solid rgba(28,43,53,0.08);display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center}
.filter-btn{padding:0.4rem 1rem;border:1px solid rgba(28,43,53,0.15);background:#FAFAF7;border-radius:2px;font-size:0.78rem;color:#6B7A85;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif}
.filter-btn:hover{border-color:#3A7D6E;color:#3A7D6E}
.filter-btn.active{background:#1C2B35;border-color:#1C2B35;color:#fff}

.articles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;padding:3rem 8%;max-width:1280px;margin:0 auto}
.article-card{background:#fff;border:1px solid rgba(28,43,53,0.08);overflow:hidden;cursor:pointer;transition:all 0.2s;position:relative}
.article-card:hover{box-shadow:0 8px 32px rgba(28,43,53,0.1);transform:translateY(-2px)}
.article-top{padding:1.5rem 1.5rem 0}
.article-tag-sm{font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:#3A7D6E;margin-bottom:0.5rem}
.article-title-card{font-family:'DM Serif Display',serif;font-size:1.2rem;color:#1C2B35;line-height:1.3;margin-bottom:0.8rem}
.article-body-card{padding:0 1.5rem 1.5rem}
.article-excerpt-card{font-size:0.85rem;color:#6B7A85;line-height:1.75;margin-bottom:1rem;font-weight:300}
.article-meta-bar{display:flex;align-items:center;justify-content:space-between;font-size:0.72rem;color:#6B7A85;padding-top:0.8rem;border-top:1px solid rgba(28,43,53,0.06)}
.lock-overlay-art{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,#fff 60%,rgba(255,255,255,0));padding:3rem 1.5rem 1.5rem;text-align:center}
.lock-badge-art{display:inline-flex;align-items:center;gap:0.5rem;background:#1C2B35;color:#fff;padding:0.5rem 1rem;font-size:0.78rem;font-weight:500;margin-bottom:0.5rem}
.article-featured-card{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr}
.article-featured-img{background:#1C2B35;display:flex;align-items:center;justify-content:center;min-height:280px}
.article-featured-img-inner{font-family:'DM Serif Display',serif;font-size:2.5rem;color:rgba(255,255,255,0.08);padding:2rem;text-align:center;line-height:1.3}

.article-overlay{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;background:#FAFAF7;overflow-y:auto;transform:translateX(100%);transition:transform 0.3s ease}
.article-overlay.active{transform:translateX(0)}
.article-overlay-header{background:#1C2B35;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;flex-shrink:0}
.article-back-btn{background:none;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);padding:0.4rem 0.8rem;font-size:0.78rem;font-family:'DM Sans',sans-serif;cursor:pointer}
.article-content-inner{max-width:680px;margin:0 auto;padding:4rem 2rem}
.article-content-tag{font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;color:#3A7D6E;margin-bottom:1rem}
.article-content-h1{font-family:'DM Serif Display',serif;font-size:2.5rem;line-height:1.1;color:#1C2B35;margin-bottom:1rem}
.article-content-meta{font-size:0.78rem;color:#6B7A85;margin-bottom:2.5rem;padding-bottom:2rem;border-bottom:1px solid rgba(28,43,53,0.08)}
.article-content-body{font-size:1rem;color:#1C2B35;line-height:1.9;font-weight:300}
.article-content-body p{margin-bottom:1.5rem}
.article-content-body h2{font-family:'DM Serif Display',serif;font-size:1.6rem;color:#1C2B35;margin:2.5rem 0 1rem}
.article-content-body blockquote{border-left:3px solid #3A7D6E;padding:1rem 1.5rem;background:#F2EDE5;margin:2rem 0;font-family:'DM Serif Display',serif;font-style:italic;font-size:1.1rem;color:#1C2B35;line-height:1.55}
.article-content-body .stat-box{background:#1C2B35;color:#fff;padding:1.5rem;margin:2rem 0}
.article-content-body .stat-box strong{font-family:'DM Serif Display',serif;font-size:1.8rem;color:#4E9E8D;display:block;margin-bottom:0.3rem}
.article-content-body .stat-box span{font-size:0.82rem;color:rgba(255,255,255,0.6)}
.premium-gate-art{background:#1C2B35;padding:2.5rem;text-align:center;margin-top:2rem}
.premium-gate-art h3{font-family:'DM Serif Display',serif;font-size:1.4rem;color:#fff;margin-bottom:0.8rem}
.premium-gate-art p{font-size:0.85rem;color:rgba(255,255,255,0.5);margin-bottom:1.5rem}

.stories-list{padding:3rem 8%;max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:1.5rem}
.story-card{background:#fff;border:1px solid rgba(28,43,53,0.08);padding:2rem;position:relative;overflow:hidden}
.story-card.locked .story-body-text{filter:blur(3px)}
.story-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
.story-author{display:flex;align-items:center;gap:0.8rem}
.story-avatar-sm{width:36px;height:36px;background:#1C2B35;display:flex;align-items:center;justify-content:center;font-family:'DM Serif Display',serif;color:#fff;font-size:0.85rem}
.story-name-sm{font-weight:500;color:#1C2B35;font-size:0.88rem}
.story-meta-sm{font-size:0.75rem;color:#6B7A85}
.story-tag-sm{font-size:0.68rem;letter-spacing:0.1em;text-transform:uppercase;color:#3A7D6E;background:#F2EDE5;padding:0.2rem 0.6rem}
.story-title-sm{font-family:'DM Serif Display',serif;font-size:1.3rem;color:#1C2B35;margin-bottom:0.8rem}
.story-body-text{font-size:0.88rem;color:#6B7A85;line-height:1.75;font-weight:300}
.story-footer-bar{display:flex;justify-content:flex-end;margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(28,43,53,0.06)}
.story-read-more{font-size:0.82rem;color:#3A7D6E;cursor:pointer;font-weight:500}
.story-lock-overlay{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,#fff 60%,rgba(255,255,255,0));padding:2.5rem 2rem 1.5rem;text-align:center}
.story-lock-badge{display:inline-block;background:#1C2B35;color:#fff;padding:0.4rem 0.8rem;font-size:0.75rem;margin-bottom:0.5rem}

.story-overlay{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;background:#FAFAF7;overflow-y:auto;transform:translateX(100%);transition:transform 0.3s ease}
.story-overlay.active{transform:translateX(0)}
.story-full-content{max-width:680px;margin:0 auto;padding:4rem 2rem}
.story-full-avatar{width:48px;height:48px;background:#1C2B35;display:flex;align-items:center;justify-content:center;font-family:'DM Serif Display',serif;color:#fff;font-size:1rem}
.story-full-title{font-family:'DM Serif Display',serif;font-size:2.2rem;color:#1C2B35;margin:1.5rem 0 0.5rem}
.story-full-body{font-size:1rem;color:#1C2B35;line-height:1.9;font-weight:300;margin-top:2rem}
.story-full-body p{margin-bottom:1.5rem}
.story-full-body blockquote{border-left:3px solid #3A7D6E;padding:1rem 1.5rem;background:#F2EDE5;margin:2rem 0;font-family:'DM Serif Display',serif;font-style:italic;font-size:1.1rem;color:#1C2B35}

.exercises-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;padding:3rem 8%;max-width:1100px;margin:0 auto}
.exercise-card{background:#fff;border-top:3px solid #1C2B35;padding:2rem;cursor:pointer;transition:all 0.2s}
.exercise-card:hover{transform:translateY(-4px);box-shadow:0 8px 32px rgba(28,43,53,0.1)}
.exercise-icon{font-size:2rem;margin-bottom:1rem;display:block}
.exercise-name{font-family:'DM Serif Display',serif;font-size:1.2rem;color:#1C2B35;margin-bottom:0.5rem}
.exercise-desc{font-size:0.85rem;color:#6B7A85;line-height:1.7;font-weight:300}
.exercise-start{display:inline-block;margin-top:1rem;background:#1C2B35;color:#fff;padding:0.6rem 1.2rem;font-size:0.82rem;font-family:'DM Sans',sans-serif;font-weight:500;border:none;cursor:pointer}

.exercise-modal{position:fixed;inset:0;background:rgba(28,43,53,0.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem}
.exercise-modal-header{display:flex;align-items:center;justify-content:space-between;width:100%;max-width:500px;margin-bottom:2rem}
.exercise-modal-title{font-family:'DM Serif Display',serif;font-size:1.5rem;color:#fff}
.exercise-close-btn{background:none;border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.5);padding:0.4rem 0.8rem;cursor:pointer;font-family:'DM Sans',sans-serif}
.breathe-circle{width:160px;height:160px;border-radius:50%;border:2px solid #3A7D6E;display:flex;align-items:center;justify-content:center;flex-direction:column;transition:transform 1s ease-in-out;margin:0 auto 2rem}
.breathe-num{font-family:'DM Serif Display',serif;font-size:2.5rem;color:#fff}
.breathe-label{font-size:0.75rem;color:#4E9E8D;text-transform:uppercase;letter-spacing:0.1em}
.exercise-instruction{font-family:'DM Serif Display',serif;font-size:1.8rem;color:#fff;text-align:center;margin-bottom:0.5rem}
.exercise-sub{font-size:0.85rem;color:rgba(255,255,255,0.45);text-align:center;margin-bottom:2rem}
.exercise-progress{width:100%;max-width:400px;height:3px;background:rgba(255,255,255,0.1);margin:0 auto 1.5rem;border-radius:2px}
.exercise-progress-bar{height:100%;background:#3A7D6E;transition:width 1s linear}
.exercise-round{font-size:0.75rem;color:rgba(255,255,255,0.35);text-align:center;margin-bottom:1.5rem;text-transform:uppercase;letter-spacing:0.1em}
.exercise-start-btn{background:#3A7D6E;color:#fff;border:none;padding:0.85rem 2.5rem;font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:500;cursor:pointer;transition:background 0.2s}
.exercise-start-btn:hover{background:#4E9E8D}
.exercise-complete-view{text-align:center;color:#fff;display:none}
.exercise-complete-view.active{display:block}
.exercise-complete-icon{font-size:3rem;margin-bottom:1rem}

.halsa-content{padding:3rem 8%;max-width:900px;margin:0 auto}
.mood-card{background:#fff;border-top:3px solid #1C2B35;padding:2rem;margin-bottom:1.5rem}
.mood-scale{display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap}
.mood-btn{flex:1;min-width:36px;padding:0.6rem 0.3rem;border:1px solid rgba(28,43,53,0.12);background:#FAFAF7;cursor:pointer;font-size:0.85rem;font-weight:500;color:#6B7A85;transition:all 0.2s;text-align:center;font-family:'DM Sans',sans-serif}
.mood-btn:hover{border-color:#3A7D6E;color:#3A7D6E}
.mood-btn.selected{background:#3A7D6E;border-color:#3A7D6E;color:#fff}
.mood-log-item{display:flex;align-items:center;gap:1rem;padding:1rem;border-bottom:1px solid rgba(28,43,53,0.06)}
.mood-log-num{font-family:'DM Serif Display',serif;font-size:1.4rem;color:#1C2B35;min-width:30px}
.mood-log-bar{flex:1;height:6px;background:#F2EDE5;border-radius:2px;overflow:hidden}
.mood-log-fill{height:100%;background:#3A7D6E;border-radius:2px}
.mood-log-date{font-size:0.75rem;color:#6B7A85}

.community-content{padding:3rem 8%;max-width:900px;margin:0 auto}
.community-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem}
.community-cats{display:flex;gap:0.5rem;flex-wrap:wrap}
.cat-btn{padding:0.4rem 0.8rem;border:1px solid rgba(28,43,53,0.15);background:#FAFAF7;border-radius:2px;font-size:0.78rem;color:#6B7A85;cursor:pointer;font-family:'DM Sans',sans-serif}
.cat-btn.active{background:#1C2B35;border-color:#1C2B35;color:#fff}
.post-card{background:#fff;border:1px solid rgba(28,43,53,0.08);padding:1.5rem;margin-bottom:1rem}
.post-meta{font-size:0.72rem;color:#6B7A85;margin-bottom:0.5rem}
.post-cat{display:inline-block;background:#F2EDE5;color:#3A7D6E;font-size:0.65rem;padding:0.15rem 0.5rem;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem}
.post-title{font-family:'DM Serif Display',serif;font-size:1.1rem;color:#1C2B35;margin-bottom:0.5rem}
.post-body-text{font-size:0.85rem;color:#6B7A85;line-height:1.7;font-weight:300}
.new-post-form{background:#fff;border-top:3px solid #1C2B35;padding:2rem;margin-bottom:2rem}
.post-input{width:100%;background:#FAFAF7;border:1px solid rgba(28,43,53,0.12);border-radius:2px;padding:0.8rem 1rem;font-family:'DM Sans',sans-serif;font-size:0.88rem;color:#1C2B35;outline:none;margin-bottom:0.8rem}
.post-input:focus{border-color:#3A7D6E}
.post-textarea{width:100%;background:#FAFAF7;border:1px solid rgba(28,43,53,0.12);border-radius:2px;padding:0.8rem 1rem;font-family:'DM Sans',sans-serif;font-size:0.88rem;color:#1C2B35;outline:none;min-height:120px;resize:vertical;margin-bottom:0.8rem}
.post-textarea:focus{border-color:#3A7D6E}

.priser-content{padding:4rem 8%;background:#1C2B35;min-height:80vh}
.pricing-grid-tm{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;max-width:900px;margin:0 auto}
.price-card-tm{background:#2E4050;padding:2.2rem;border-top:3px solid rgba(255,255,255,0.1)}
.price-card-tm.featured{background:#3A7D6E;border-top-color:#4E9E8D}
.price-label-tm{font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;color:#4E9E8D;margin-bottom:0.8rem}
.price-card-tm.featured .price-label-tm{color:rgba(255,255,255,0.7)}
.price-name-tm{font-family:'DM Serif Display',serif;font-size:1.4rem;color:#fff;margin-bottom:0.5rem}
.price-amount-tm{font-family:'DM Serif Display',serif;font-size:2.8rem;color:#fff;line-height:1;margin-bottom:1.5rem}
.price-amount-tm span{font-size:0.95rem;font-family:'DM Sans',sans-serif;font-weight:300;color:rgba(255,255,255,0.45)}
.price-features-tm{list-style:none;margin-bottom:2rem;display:flex;flex-direction:column;gap:0.6rem}
.price-features-tm li{font-size:0.82rem;color:rgba(255,255,255,0.65);display:flex;align-items:flex-start;gap:0.6rem}
.price-features-tm li::before{content:'✓';color:#4E9E8D;font-weight:600;flex-shrink:0}
.price-card-tm.featured .price-features-tm li{color:rgba(255,255,255,0.85)}
.price-card-tm.featured .price-features-tm li::before{color:#fff}
.price-btn-tm{width:100%;padding:0.85rem;border:none;font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:500;cursor:pointer;transition:all 0.2s}
.price-btn-ghost-tm{background:none;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6)}
.price-btn-ghost-tm:hover{border-color:#4E9E8D;color:#fff}
.price-btn-solid-tm{background:#fff;color:#1C2B35}
.price-btn-solid-tm:hover{background:#F2EDE5}

@media(max-width:900px){
  .articles-grid,.exercises-grid,.pricing-grid-tm{grid-template-columns:1fr}
  .article-featured-card{grid-template-columns:1fr}
  .article-featured-img{display:none}
  .page-hero h1{font-size:2.4rem}
}
`;

/* ============================================================
   ARTIKLAR
   ============================================================ */
export const ArtiklarPage = ({ nav, isPremium }) => {
  const [filter, setFilter] = useState('alla');
  const [openArticle, setOpenArticle] = useState(null);

  const cats = ['alla','tystnad','utbrändhet','depression','ångest','relationer','föräldraskap','återhämtning'];
  const filtered = filter === 'alla' ? articles : articles.filter(a => a.category === filter);

  return (
    <>
      <style>{pageCss}</style>
      <div className="page-hero">
        <div className="section-label">Fördjupning & kunskap</div>
        <h1>Artiklar om<br/><em>mäns hälsa</em></h1>
        <p>Djupgående texter om psykisk hälsa, manlighet och livet bakom masken.</p>
      </div>

      <div className="filter-bar">
        {cats.map(c => (
          <button key={c} className={`filter-btn${filter===c?' active':''}`} onClick={()=>setFilter(c)}>
            {c.charAt(0).toUpperCase()+c.slice(1)}
          </button>
        ))}
      </div>

      <div className="articles-grid">
        {filtered.map((article, i) => {
          const locked = article.premium && !isPremium;
          if (article.featured && i === 0) return (
            <div key={article.id} className="article-card article-featured-card" onClick={!locked?()=>setOpenArticle(article):undefined}>
              <div className="article-featured-img">
                <div className="article-featured-img-inner">Det vi<br/>inte fick<br/>säga</div>
              </div>
              <div>
                <div className="article-top">
                  <div style={{background:'#C0873A',color:'#fff',fontSize:'0.68rem',padding:'0.2rem 0.6rem',display:'inline-block',marginBottom:'0.8rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Fördjupning</div>
                  <div className="article-tag-sm">{article.tag}</div>
                  <div className="article-title-card">{article.title}</div>
                </div>
                <div className="article-body-card">
                  <div className="article-excerpt-card">{article.excerpt}</div>
                  <div className="article-meta-bar"><span>⏱ {article.readTime}</span><span>{article.premium?'PREMIUM':'Gratis'}</span></div>
                </div>
              </div>
            </div>
          );
          return (
            <div key={article.id} className="article-card" onClick={!locked?()=>setOpenArticle(article):undefined}>
              <div className="article-top">
                <div className="article-tag-sm">{article.tag}</div>
                <div className="article-title-card">{article.title}</div>
              </div>
              <div className="article-body-card">
                <div className="article-excerpt-card">{article.excerpt}</div>
                <div className="article-meta-bar"><span>⏱ {article.readTime}</span><span>{article.premium?'PREMIUM':'Gratis'}</span></div>
              </div>
              {locked && (
                <div className="lock-overlay-art">
                  <div className="lock-badge-art">🔒 PREMIUM-artikel</div>
                  <div style={{fontSize:'0.75rem',color:'#6B7A85'}}>Uppgradera för att läsa</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Article overlay */}
      <div className={`article-overlay${openArticle?' active':''}`}>
        {openArticle && (
          <>
            <div className="article-overlay-header">
              <button className="article-back-btn" onClick={()=>setOpenArticle(null)}>← Tillbaka</button>
              <span style={{fontSize:'0.72rem',color:'#4E9E8D'}}>{openArticle.premium?'PREMIUM':'Gratis'}</span>
            </div>
            <div className="article-content-inner">
              <div className="article-content-tag">{openArticle.tag}</div>
              <h1 className="article-content-h1">{openArticle.title}</h1>
              <div className="article-content-meta">{openArticle.readTime} läsning · Tryggman</div>
              <div className="article-content-body" dangerouslySetInnerHTML={{__html: openArticle.content}}/>
            </div>
          </>
        )}
      </div>
    </>
  );
};

/* ============================================================
   BERÄTTELSER
   ============================================================ */
export const BerattelsePage = ({ nav, isPremium, currentUser }) => {
  const [openStory, setOpenStory] = useState(null);
  const [tab, setTab] = useState('stories');
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [subBody, setSubBody] = useState('');
  const [subAnon, setSubAnon] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!subTitle || subBody.length < 100) { alert('Fyll i rubrik och en berättelse på minst 100 tecken.'); return; }
    try {
      await addDoc(collection(db, 'story_submissions'), {
        name: subAnon ? 'Anonym' : (subName || 'Anonym'),
        email: subEmail || null, title: subTitle, body: subBody,
        anonymous: subAnon, status: 'pending', submittedAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch(e) { alert('Något gick fel. Försök igen.'); }
  };

  return (
    <>
      <div className="page-hero">
        <div className="section-label">Gemenskap & mod</div>
        <h1>Berättelser från<br/><em>riktiga män</em></h1>
        <p>Här delar män sina egna erfarenheter — av depression, utbrändhet, ensamhet och återhämtning. Du är inte ensam.</p>
      </div>

      <div style={{display:'flex',gap:'1rem',padding:'1.5rem 8%',background:'#fff',borderBottom:'1px solid rgba(28,43,53,0.08)'}}>
        <button className={`filter-btn${tab==='stories'?' active':''}`} onClick={()=>setTab('stories')}>Läs berättelser</button>
        <button className={`filter-btn${tab==='submit'?' active':''}`} onClick={()=>setTab('submit')}>Dela din berättelse</button>
      </div>

      {tab === 'stories' && (
        <div className="stories-list">
          {stories.map(story => {
            const locked = story.locked && !isPremium;
            return (
              <div key={story.id} className={`story-card${locked?' locked':''}`}>
                <div className="story-header">
                  <div className="story-author">
                    <div className="story-avatar-sm">{story.initials}</div>
                    <div><div className="story-name-sm">{story.name}</div><div className="story-meta-sm">{story.meta}</div></div>
                  </div>
                  <span className="story-tag-sm">{story.tag}</span>
                </div>
                <div className="story-title-sm">{story.title}</div>
                <div className="story-body-text">{story.excerpt}</div>
                {locked ? (
                  <div className="story-lock-overlay">
                    <div className="story-lock-badge">🔒 Kräver BAS-medlemskap</div>
                    <div style={{fontSize:'0.78rem',color:'#6B7A85',marginTop:'0.3rem'}}>Läs alla berättelser för 39 kr/mån</div>
                  </div>
                ) : (
                  <div className="story-footer-bar">
                    <span className="story-read-more" onClick={()=>setOpenStory(story)}>Läs hela berättelsen →</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'submit' && (
        <div style={{padding:'3rem 8%',maxWidth:'700px',margin:'0 auto'}}>
          {submitted ? (
            <div style={{background:'#F2EDE5',borderLeft:'3px solid #3A7D6E',padding:'2rem',textAlign:'center'}}>
              <div style={{fontFamily:'DM Serif Display,serif',fontSize:'1.5rem',color:'#1C2B35',marginBottom:'0.5rem'}}>Tack för din berättelse</div>
              <p style={{color:'#6B7A85',fontSize:'0.9rem'}}>Vi granskar den och publicerar om den passar vår plattform.</p>
            </div>
          ) : (
            <div className="new-post-form">
              <h3 style={{fontFamily:'DM Serif Display,serif',fontSize:'1.5rem',color:'#1C2B35',marginBottom:'1.5rem'}}>Dela din berättelse</h3>
              <input className="post-input" placeholder="Ditt namn (valfritt)" value={subName} onChange={e=>setSubName(e.target.value)}/>
              <input className="post-input" placeholder="Din e-post (valfritt)" value={subEmail} onChange={e=>setSubEmail(e.target.value)}/>
              <input className="post-input" placeholder="Rubrik" value={subTitle} onChange={e=>setSubTitle(e.target.value)}/>
              <textarea className="post-textarea" placeholder="Din berättelse (minst 100 tecken)..." value={subBody} onChange={e=>setSubBody(e.target.value)}/>
              <label style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem',fontSize:'0.85rem',color:'#6B7A85',cursor:'pointer'}}>
                <input type="checkbox" checked={subAnon} onChange={e=>setSubAnon(e.target.checked)}/> Publicera anonymt
              </label>
              <button className="btn-primary" onClick={handleSubmit}>Skicka in min berättelse</button>
            </div>
          )}
        </div>
      )}

      {/* Story overlay */}
      <div className={`story-overlay${openStory?' active':''}`}>
        {openStory && (
          <>
            <div className="article-overlay-header">
              <button className="article-back-btn" onClick={()=>setOpenStory(null)}>← Tillbaka</button>
              <span style={{fontSize:'0.72rem',color:'#4E9E8D'}}>{openStory.tag}</span>
            </div>
            <div className="story-full-content">
              <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                <div className="story-full-avatar">{openStory.initials}</div>
                <div><div style={{fontWeight:500,color:'#1C2B35'}}>{openStory.name}</div><div style={{fontSize:'0.78rem',color:'#6B7A85'}}>{openStory.meta}</div></div>
              </div>
              <h1 className="story-full-title">{openStory.title}</h1>
              <div className="story-full-body" dangerouslySetInnerHTML={{__html: openStory.full}}/>
            </div>
          </>
        )}
      </div>
    </>
  );
};

/* ============================================================
   ÖVNINGAR
   ============================================================ */
export const OvningarPage = ({ nav }) => {
  const [activeEx, setActiveEx] = useState(null);
  const [phase, setPhase] = useState(0);
  const [round, setRound] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const timerRef = useRef(null);
  const totalDuration = useRef(0);
  const elapsed = useRef(0);

  const startExercise = (key) => {
    const ex = exercises[key];
    setActiveEx({...ex, key});
    setPhase(0); setRound(0); setCountdown(ex.phases[0].duration);
    setRunning(false); setProgress(0); setComplete(false);
    elapsed.current = 0;
    totalDuration.current = ex.phases.reduce((s,p)=>s+p.duration,0) * ex.rounds;
  };

  const closeExercise = () => {
    clearInterval(timerRef.current);
    setActiveEx(null); setRunning(false);
  };

  const toggleRun = () => {
    if (running) { clearInterval(timerRef.current); setRunning(false); return; }
    setRunning(true);
    runTick();
  };

  const runTick = () => {
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          nextPhase();
          return 0;
        }
        elapsed.current++;
        setProgress(elapsed.current / totalDuration.current * 100);
        return c - 1;
      });
    }, 1000);
  };

  const nextPhase = () => {
    setActiveEx(ex => {
      if (!ex) return ex;
      const nextPhaseIdx = (phase + 1) % ex.phases.length;
      const newRound = nextPhaseIdx === 0 ? round + 1 : round;
      if (newRound >= ex.rounds) { setComplete(true); setRunning(false); return ex; }
      setPhase(nextPhaseIdx);
      setRound(newRound);
      setCountdown(ex.phases[nextPhaseIdx].duration);
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(timerRef.current); nextPhase(); return 0; }
          elapsed.current++;
          setProgress(elapsed.current / totalDuration.current * 100);
          return c - 1;
        });
      }, 1000);
      return ex;
    });
  };

  return (
    <>
      <div className="page-hero">
        <div className="section-label">Mindfulness & återhämtning</div>
        <h1>Övningar för<br/><em>inre ro</em></h1>
        <p>Andningsövningar och grounding-tekniker som faktiskt funkar. Vetenskapligt beprövade metoder för att hantera stress, ångest och ilska.</p>
      </div>

      <div className="exercises-grid">
        {Object.entries(exercises).map(([key, ex]) => (
          <div key={key} className="exercise-card">
            <span className="exercise-icon">{ex.icon}</span>
            <div className="exercise-name">{ex.name}</div>
            <div className="exercise-desc">{ex.desc}</div>
            <button className="exercise-start" onClick={()=>startExercise(key)}>Starta övning →</button>
          </div>
        ))}
      </div>

      {activeEx && (
        <div className="exercise-modal">
          <div className="exercise-modal-header">
            <div className="exercise-modal-title">{activeEx.name}</div>
            <button className="exercise-close-btn" onClick={closeExercise}>✕ Stäng</button>
          </div>

          {!complete ? (
            <>
              <div className="breathe-circle" style={{transform:`scale(${activeEx.phases[phase]?.scale||1})`}}>
                <div className="breathe-num">{countdown}</div>
                <div className="breathe-label">{activeEx.phases[phase]?.name}</div>
              </div>
              <div className="exercise-instruction">{activeEx.phases[phase]?.name}</div>
              <div className="exercise-sub">Runda {round+1} av {activeEx.rounds}</div>
              <div className="exercise-progress" style={{width:'400px',maxWidth:'90vw'}}>
                <div className="exercise-progress-bar" style={{width:`${progress}%`}}/>
              </div>
              <button className="exercise-start-btn" onClick={toggleRun}>
                {running ? 'Pausa' : (round===0&&!running?'Starta':'Fortsätt')}
              </button>
            </>
          ) : (
            <div className="exercise-complete-view active">
              <div className="exercise-complete-icon">✓</div>
              <div style={{fontFamily:'DM Serif Display,serif',fontSize:'1.5rem',color:'#fff',marginBottom:'1rem'}}>Övning klar</div>
              <div style={{color:'rgba(255,255,255,0.55)',fontSize:'0.9rem',maxWidth:'400px',lineHeight:'1.7',marginBottom:'2rem'}}>{activeEx.complete}</div>
              <button className="exercise-start-btn" onClick={closeExercise}>Stäng</button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

/* ============================================================
   HÄLSA / MÅENDE
   ============================================================ */
export const HalsaPage = ({ nav, isPremium, currentUser }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [log, setLog] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tryggman_mood_log');
    if (stored) setLog(JSON.parse(stored));
  }, []);

  const saveMood = () => {
    if (!selectedMood) return;
    const entry = { mood: selectedMood, note, date: new Date().toLocaleDateString('sv-SE'), ts: Date.now() };
    const newLog = [entry, ...log].slice(0, 30);
    setLog(newLog);
    localStorage.setItem('tryggman_mood_log', JSON.stringify(newLog));
    setSaved(true);
    setSelectedMood(null); setNote('');
    setTimeout(()=>setSaved(false), 2000);
  };

  return (
    <>
      <div className="page-hero">
        <div className="section-label">Självkännedom</div>
        <h1>Mitt<br/><em>mående</em></h1>
        <p>Följ ditt mående över tid och förstå dina egna mönster. En dagbok för dig.</p>
      </div>

      <div className="halsa-content">
        <div className="mood-card">
          <h3 style={{fontFamily:'DM Serif Display,serif',fontSize:'1.3rem',color:'#1C2B35',marginBottom:'1rem'}}>Hur mår du idag?</h3>
          <div className="mood-scale">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} className={`mood-btn${selectedMood===n?' selected':''}`} onClick={()=>setSelectedMood(n)}>{n}</button>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.72rem',color:'#6B7A85',marginBottom:'1.5rem'}}>
            <span>Mycket dåligt</span><span>Utmärkt</span>
          </div>
          <textarea className="post-textarea" placeholder="Anteckning (valfritt)..." value={note} onChange={e=>setNote(e.target.value)} style={{minHeight:'80px'}}/>
          <button className="btn-primary" onClick={saveMood} disabled={!selectedMood}>
            {saved ? '✓ Sparat!' : 'Logga mående'}
          </button>
        </div>

        {log.length > 0 && (
          <div className="mood-card">
            <h3 style={{fontFamily:'DM Serif Display,serif',fontSize:'1.2rem',color:'#1C2B35',marginBottom:'1rem'}}>Din historik</h3>
            {log.slice(0,10).map((entry,i) => (
              <div key={i} className="mood-log-item">
                <div className="mood-log-num">{entry.mood}</div>
                <div className="mood-log-bar"><div className="mood-log-fill" style={{width:`${entry.mood*10}%`}}/></div>
                <div className="mood-log-date">{entry.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

/* ============================================================
   COMMUNITY
   ============================================================ */
export const CommunityPage = ({ nav, currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('alla');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [anon, setAnon] = useState(true);
  const [posting, setPosting] = useState(false);

  const cats = ['alla','Stress & utbrändhet','Depression','Ångest','Relationer','Föräldraskap','Återhämtning'];

  useEffect(() => {
    const q = category === 'alla'
      ? query(collection(db, 'community_posts'), orderBy('createdAt','desc'))
      : query(collection(db, 'community_posts'), where('category','==',category), orderBy('createdAt','desc'));
    return onSnapshot(q, snap => setPosts(snap.docs.map(d=>({id:d.id,...d.data()}))));
  }, [category]);

  const submitPost = async () => {
    if (!title || !body || !currentUser) return;
    setPosting(true);
    await addDoc(collection(db, 'community_posts'), {
      title, body, category: category==='alla'?'Allmänt':category,
      authorName: anon ? 'Anonym' : (currentUser.displayName || 'Anonym'),
      authorId: currentUser.uid, createdAt: serverTimestamp(), replyCount: 0
    });
    setTitle(''); setBody(''); setPosting(false);
  };

  return (
    <>
      <div className="page-hero">
        <div className="section-label">Gemenskap</div>
        <h1>Du är inte<br/><em>ensam</em></h1>
        <p>En plats där män pratar med varandra. Anonymt, öppet och utan dömande.</p>
      </div>

      <div className="community-content">
        {currentUser && (
          <div className="new-post-form">
            <h3 style={{fontFamily:'DM Serif Display,serif',fontSize:'1.3rem',color:'#1C2B35',marginBottom:'1rem'}}>Skriv ett inlägg</h3>
            <input className="post-input" placeholder="Rubrik" value={title} onChange={e=>setTitle(e.target.value)}/>
            <textarea className="post-textarea" placeholder="Dela dina tankar..." value={body} onChange={e=>setBody(e.target.value)}/>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem'}}>
              <label style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.85rem',color:'#6B7A85',cursor:'pointer'}}>
                <input type="checkbox" checked={anon} onChange={e=>setAnon(e.target.checked)}/> Posta anonymt
              </label>
              <button className="btn-primary" onClick={submitPost} disabled={posting||!title||!body}>{posting?'Postar...':'Posta'}</button>
            </div>
          </div>
        )}

        <div className="community-cats">
          {cats.map(c => (
            <button key={c} className={`cat-btn${category===c?' active':''}`} onClick={()=>setCategory(c)}>{c}</button>
          ))}
        </div>

        <div style={{marginTop:'1.5rem'}}>
          {posts.length === 0 && <p style={{color:'#6B7A85',fontSize:'0.9rem',textAlign:'center',padding:'3rem'}}>Inga inlägg ännu — var den första!</p>}
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                <span className="post-cat">{post.category}</span>
                <span style={{fontSize:'0.72rem',color:'#6B7A85'}}>{post.authorName}</span>
              </div>
              <div className="post-title">{post.title}</div>
              <div className="post-body-text">{post.body}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ============================================================
   PRISER
   ============================================================ */
export const PriserPage = ({ nav, currentUser, isPremium }) => {
  const checkout = async (type) => {
    if (!currentUser) { nav('login'); return; }
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId: currentUser.uid, plan: type })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch(e) { alert('Något gick fel. Försök igen.'); }
  };

  return (
    <>
      <div style={{background:'#1C2B35',padding:'7rem 8% 4rem',marginTop:'62px',textAlign:'center'}}>
        <div style={{fontSize:'0.72rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#4E9E8D',marginBottom:'0.9rem'}}>Transparent prissättning</div>
        <h1 style={{fontFamily:'DM Serif Display,serif',fontSize:'3rem',color:'#fff',marginBottom:'1rem'}}>Välj ditt <em style={{color:'#4E9E8D',fontStyle:'italic'}}>stöd</em></h1>
        <p style={{color:'rgba(255,255,255,0.45)',maxWidth:'500px',margin:'0 auto',fontWeight:300}}>Ingen bindningstid. Inga dolda kostnader. Avsluta när du vill.</p>
      </div>

      <div className="priser-content">
        <div className="pricing-grid-tm">
          <div className="price-card-tm">
            <div className="price-label-tm">Mental Fitness</div>
            <div className="price-name-tm">AI-Rådgivare</div>
            <div className="price-amount-tm">39 <span>kr/mån</span></div>
            <ul className="price-features-tm">
              <li>Obegränsad AI-chatt dygnet runt</li>
              <li>Daglig humörtracking</li>
              <li>Guidade andningsövningar</li>
              <li>Artiklar & kunskap om mäns hälsa</li>
              <li>Community-tillgång</li>
              <li>Ingen bindningstid</li>
            </ul>
            <button className="price-btn-tm price-btn-ghost-tm" onClick={()=>checkout('bas')} disabled={isPremium}>
              {isPremium ? 'Du har Premium' : 'Prova 4 meddelanden gratis'}
            </button>
          </div>
          <div className="price-card-tm featured">
            <div className="price-label-tm">Professionell terapi</div>
            <div className="price-name-tm">Personlig Terapeut</div>
            <div className="price-amount-tm">349 <span>kr/mån</span></div>
            <ul className="price-features-tm">
              <li>Certifierad psykoterapeut</li>
              <li>Upp till 10 meddelanden per månad</li>
              <li>Svar inom 24 timmar (mån–fre)</li>
              <li>Full tystnadsplikt</li>
              <li>Allt i AI-paketet ingår</li>
              <li>Ingen bindningstid</li>
            </ul>
            <button className="price-btn-tm price-btn-solid-tm" onClick={()=>checkout('premium')} disabled={isPremium}>
              {isPremium ? '✓ Din aktiva plan' : 'Starta samtal med terapeut'}
            </button>
            <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',textAlign:'center',marginTop:'0.8rem',fontStyle:'italic'}}>Mindre än 12 kr om dagen</div>
          </div>
        </div>
      </div>
    </>
  );
};
