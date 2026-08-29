import { useState, useEffect, useRef } from "react";
import { db, auth, collection, addDoc, onSnapshot, query, orderBy, where, serverTimestamp, doc, updateDoc, increment, getDocs, getDoc } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { Purchases } from "@revenuecat/purchases-capacitor";

const IS_NATIVE = Capacitor.isNativePlatform();
const REVENUECAT_ANDROID_KEY = "goog_XXXXXXXXXXXXXXXXXXXXXXXX"; // ersätt med er riktiga public API-nyckel från RevenueCat-dashboarden

let rcConfigured = false;
async function ensureRevenueCatConfigured(userId) {
  if (!IS_NATIVE || rcConfigured) return;
  await Purchases.configure({ apiKey: REVENUECAT_ANDROID_KEY, appUserID: userId });
  rcConfigured = true;
}

/* ============================================================
   ARTIKLAR PAGE
   ============================================================ */
const articles = [
  {
    id:1, tag:'Tystnad & manlighet', category:'tystnad',
    title:'Borsta bort gruset och upp igen — om pojken som lärde sig hålla tyst',
    excerpt:'Det börjar inte med något dramatiskt. Det börjar istället tyst, omärkligt och sakta — med en röst som med tiden börjar låta som din egen.',
    readTime:'4 min', premium:false, featured:true,
    content:`<p>Det börjar inte med något dramatiskt. Det börjar istället som de flesta viktiga saker i livet börjar — tyst, omärkligt och så sakta att man inte ens märker att det pågår.</p><p>Det börjar med en röst. Kanske din pappas röst. Kanske din farfars, din äldre brors, en tränares eller en lärares. En röst som tillhörde någon du såg upp till, vars ord landade djupt, precis när du var som mest formbar. Du var kanske sju år. Kanske tio. Du föll av cykeln, skrapade upp knäet, kände tårarna trycka på — och så kom rösten.</p><blockquote>Borsta bort gruset. Upp igen.</blockquote><p>Du föll. Det gjorde ont. Men smärtan fick inte ta plats. Den borstades bort tillsammans med gruset på knäet, och du reste dig. Inte för att du inte hade ont. Utan för att det var det enda som var tillåtet. Ingen sa det rakt ut — "gråt inte" — men det behövdes inte. Blicken, tonfallet, den lilla pausen innan nästa mening räckte. Meddelandet gick fram klart och tydligt: det du känner just nu är fel, eller åtminstone opassande att visa.</p><h2>Fasaden som blev ett hem</h2><p>Det är det som är så lurigt med inlärd tystnad — den är fullständigt osynlig inifrån. Du lär dig le på rätt ställen, svara "bra tack" när folk frågar hur du mår, även när svaret egentligen är ett helt annat. Med tiden slutar det kännas som en fasad. Det blir ett hem. Du flyttar in i det och glömmer nästan att det finns rum bakom väggarna som du aldrig öppnar dörren till.</p><p>Det som gör det extra svårt är att strategin faktiskt fungerar — ett tag. Att borsta bort gruset och resa sig fungerar utmärkt när utmaningen är ett skrapsår. Problemet är att samma strategi används senare i livet på sådant den aldrig var byggd för: en skilsmässa, en förlust, en utbrändhet, en son eller dotter som mår dåligt och inte vet hur man pratar om det. Då räcker inte "upp igen". Då krävs något helt annat — förmågan att stanna kvar i det obekväma tillräckligt länge för att förstå vad det faktiskt handlar om.</p><div class="stat-box"><strong>70%</strong><span>Av män som mår dåligt söker aldrig professionell hjälp. Rädslan för att dömas håller dem tysta. (Källa: Mind)</span></div><h2>Rösten som blir din egen</h2><p>Det som gör tystnaden så seglivad är att rösten till slut inte längre är någon annans. Den blir din. Du behöver inte längre någon som säger åt dig att borsta bort gruset — du gör det själv, automatiskt, långt innan du ens hunnit känna efter vad som faktiskt hänt. Det är då tystnaden gått från en uppfostringsstrategi till en identitet.</p><p>Många män vi pratat med beskriver samma sak: en känsla av att aldrig riktigt ha fått lära sig ett annat sätt att hantera smärta. Inte för att någon medvetet ville skada dem, utan för att de själva fostrades likadant, av sina föräldrar, som fostrades likadant av sina. Ett mönster som ärvs vidare, generation efter generation, tills någon väljer att bryta det.</p><h2>Det vi inte fick lära oss</h2><p>Det vi egentligen behövde lära oss är att känslor inte är ett tecken på svaghet. Att gråta inte gör en till mindre man. Att be om hjälp inte är ett nederlag utan ett mod som kräver mer av en människa än att hålla tyst någonsin gör. Det låter enkelt skrivet i en text. Det är svårt att faktiskt leva efter, särskilt när man är fostrad i motsatsen sedan barnsben.</p><p>Men det går. Steget börjar sällan med en stor gest. Det börjar med en enda mening sagd högt till en annan människa: "Jag mår faktiskt inte så bra." Den meningen är ofta den svåraste att säga i hela livet — och samtidigt den som öppnar dörren till allt annat.</p>`
  },
  {
    id:2, tag:'Utbrändhet & stress', category:'utbrändhet',
    title:'Vad utbrändhet faktiskt är — och varför sjukvården missar det hos män',
    excerpt:'Att gå in i väggen är inte bara att man blir trött. Det är en monumental felaktighet i hur vi som samhälle pratar om utbrändhet.',
    readTime:'3 min', premium:false,
    content:`<p>Att gå in i väggen är inte bara att man blir trött. Det handlar om att kroppen bokstavligen håller på att stänga av på ett grundläggande, biologiskt plan — och det är en monumental felaktighet i hur vi som samhälle fortfarande pratar om utbrändhet, som om det bara handlade om att jobba lite för mycket ett tag.</p><h2>Hjärnan som slutade fungera</h2><p>Logiken försvinner. Den analytiska förmågan är borta. Minnet sviker i de mest vardagliga situationer. Man kan gå ut från en affär och inte ha en aning om var man parkerat bilen. Man kan tappa tråden mitt i en mening, mitt i ett samtal med sitt eget barn, och inte hitta vägen tillbaka.</p><p>Det som gör det så skrämmande är hur långsamt det smyger sig på. Ingen vaknar en morgon och är utbränd. Det är en process som ofta pågått i månader, ibland år, medan man klätt smärtan i andra ord: "jag är bara lite stressad", "det lugnar sig efter sommaren", "alla har det tufft just nu". Kroppen protesterar länge innan den till slut vägrar samarbeta.</p><blockquote>Det var som om alla försvarsmurar jag byggt upp under ett helt liv hade vittrat sönder till damm på en sekund. Kroppen sa ifrån.</blockquote><h2>Varför sjukvården ofta missar det hos män</h2><p>Män söker sällan hjälp förrän kroppen tvingar dem — ett fysiskt symtom, en kollaps, en partner som säger stopp. Och när de väl söker hjälp beskriver de sällan sina symtom i de ord vården är van vid att lyssna efter. Istället för "jag känner mig nedstämd" hörs "jag sover dåligt" eller "jag orkar inte med jobbet längre". Det gör att männens utmattning ofta bortförklaras som vanlig trötthet, medan den bakomliggande kollapsen fortsätter obemärkt.</p><div class="stat-box"><strong>Underdiagnostiserade</strong><span>Forskning visar att män och kvinnor drabbas ungefär lika ofta av utbrändhet — men männens symtom är svårare att känna igen, och de söker vård senare i förloppet. (Källa: Lunds universitet)</span></div><h2>Vägen tillbaka</h2><p>Återhämtning från utbrändhet är sällan linjär. Det är inte två veckors semester och sen tillbaka i full fart. Det handlar om att på riktigt förstå vad som ledde dit — vilka mönster, vilka krav, vilka röster som gjorde att kroppen till slut sa ifrån — och att bygga något annat i dess ställe.</p><h2>Det är inte ditt fel</h2><p>Män går in i väggen. Män drabbas av utmattning. Och när de väl tar steget och söker hjälp — förtjänar de att bli sedda. Inte bortförklarade, inte avfärdade som "lite stressade". Sedda, för den verkliga och biologiska kris de faktiskt genomlever.</p>`
  },
  {
    id:3, tag:'Depression', category:'depression',
    title:'Depression hos män — så ser symtomen ut när de inte ser ut som du tror',
    excerpt:'Depression hos män ser ofta inte ut som tårar och sängliggande. Den ser ut som ilska, distans, alkohol och överarbete. Och det är därför den missas.',
    readTime:'3 min', premium:false,
    content:`<p>När de flesta tänker på depression föreställer de sig en person som ligger i sängen och gråter, som inte orkar duscha, som isolerar sig helt. Men det är sällan så det ser ut hos män. Och det är just därför så många faller igenom sprickorna, år efter år, utan att någon — inte ens de själva — sätter ord på vad det egentligen är.</p><h2>Hur depression faktiskt ser ut hos män</h2><p>Irritabilitet snarare än sorg. Ilska som exploderar vid fel tidpunkt, över småsaker — en trafikstockning, en disktrasa på fel plats. En känsla av tomhet — inte av djup smärta, utan av ingenting alls, ett grått filter över hela tillvaron. Att jobba mer än någonsin för att slippa vara inne i sig själv, för att fylla varje vaken timme så det inte finns utrymme för tankarna att komma ifatt.</p><p>Ofta läggs det till alkohol. Inte nödvändigtvis i stora mängder varje dag, men som ett tillförlitligt sätt att stänga av på kvällen. Ett par öl blir en vana, vanan blir ett beroende av att aldrig behöva sitta i sina egna tankar helt nyktert.</p><blockquote>Jag var inte ledsen. Jag var bara inte något alls. Det är svårare att förklara för någon som inte känt det.</blockquote><h2>Varför männen inte söker hjälp</h2><p>Dels för att de inte känner igen sina egna symtom som depression — ilska och distans matchar sällan bilden av "deprimerad" som förmedlats genom hela livet. Dels för att det fortfarande känns som ett misslyckande att erkänna att man inte mår bra, som att man brustit i något grundläggande. Och dels för att vården ofta inte ställer rätt frågor, utan fastnar vid symtom som "har du känt dig nedstämd" — en fråga många män ärligt kan svara nej på, samtidigt som de bär på en depression ingen sett.</p><div class="stat-box"><strong>3 av 4</strong><span>Självmord i Sverige begås av män. Depression är den vanligaste bakomliggande orsaken — men bara hälften av männen med depression söker hjälp. (Källa: Folkhälsomyndigheten)</span></div><h2>Vad du kan göra</h2><p>Det första steget är att känna igen det. Om du känner igen dig i beskrivningen ovan — ilskan, tomheten, distansen, behovet av att alltid vara upptagen — är det värt att prata med någon. En vän. En vårdcentral. En AI som lyssnar utan att döma, som ett första steg innan du orkar prata med en människa. Inte för att du är svag. Utan för att du förtjänar att må bättre, och för att de som står dig närmast förtjänar att få träffa hela dig, inte bara ytan.</p>`
  },
  {
    id:4, tag:'Ångest', category:'ångest',
    title:'Ångest hos män — vad det är, varför det uppstår och vad som faktiskt hjälper',
    excerpt:'Ångest är inte bara oro. Det är en fysisk, överväldigande upplevelse som kan lamslå en människa mitt i vardagen. Och den är vanligare hos män än du tror.',
    readTime:'3 min', premium:false,
    content:`<p>Ångest är inte bara oro. Det är en fysisk, överväldigande upplevelse som kan lamslå en människa mitt i vardagen — mitt i ett möte, i en matbutik, i sängen klockan tre på natten. Och den är vanligare hos män än de flesta tror, för den pratas det sällan om. Delvis för att ångest upplevs som ett tecken på svaghet, ett erkännande av att man inte har kontroll. Delvis för att den tar sig uttryck på sätt som inte alltid identifieras som ångest — irritation, undvikande, konstant behov av att ha koll på läget.</p><h2>Vad ångest faktiskt är</h2><p>Ångest är kroppens larmsystem som gått i överdrift. Det är evolutionärt programmerat för att skydda oss från fara — en gång i tiden ett lejon i gräset — men hos en person med ångest aktiveras systemet utan att det finns ett reellt hot. Resultatet är en fysisk upplevelse: hjärtat slår snabbare, andningen blir ytlig, musklerna spänner sig, magen vänder sig. Kroppen förbereder sig för att fly eller slåss mot något som inte existerar.</p><p>Det som gör ångest särskilt förrädisk är att den kan komma helt utan förvarning, mitt i en till synes lugn stund. Många beskriver att den lika gärna slår till under ett vanligt söndagsfika som under en pressad arbetsdag — kroppen tycks ha ett eget schema, oberoende av vad som faktiskt pågår runt omkring.</p><blockquote>Det kändes som att sitta i en bil med en motor som aldrig stängs av. Konstant brus. Konstant beredskap för något som aldrig kom.</blockquote><h2>Hur det ser ut hos män</h2><p>Hos många män visar sig ångest inte som synlig oro utan som rastlöshet, kort stubin, eller ett behov av att ständigt vara i rörelse — träna extra hårt, jobba över, fixa saker hemma sent på kvällen. Allt för att slippa sitta still med känslan.</p><div class="stat-box"><strong>1 av 4</strong><span>Män upplever kliniskt signifikant ångest någon gång i livet — men majoriteten söker aldrig hjälp för det. (Källa: WHO)</span></div><h2>Vad som faktiskt hjälper</h2><p>KBT (kognitiv beteendeterapi) är den mest evidensbaserade behandlingen för ångest, och hjälper de flesta att bryta de tankemönster som håller ångesten vid liv. Andningsövningar kan ge snabb lindring i akuta situationer — långsamma, djupa andetag signalerar till nervsystemet att faran är över. Regelbunden fysisk aktivitet minskar grundnivån av ångest över tid, genom att bränna av det överskott av stresshormoner kroppen producerar. Och att prata med någon — en terapeut, en vän, en AI — kan bryta isolationen som ofta förvärrar ångest, eftersom den tystnad man håller kring den bara ger den mer utrymme att växa.</p><p>Det viktigaste att bära med sig: ångesten ljuger. Den säger att hotet är verkligt, att katastrofen väntar runt hörnet. Det är den inte. Den är ett larmsystem som slår till fel — inte en sanning om din verklighet.</p>`
  },
  {
    id:5, tag:'Utbrändhet & stress', category:'utbrändhet',
    title:'Sömnproblem och stress — sambandet ingen pratar om',
    excerpt:'Dålig sömn skapar mer stress. Mer stress skapar sämre sömn. Det är en spiral som kan ta år att ta sig ur — men det finns en väg ut.',
    readTime:'2 min', premium:true,
    content:`<p>Dålig sömn skapar mer stress. Mer stress skapar sämre sömn. Det är en spiral som kan ta år att ta sig ur — men det finns en väg ut, och den börjar med att förstå hur de två faktiskt hänger ihop.</p><p>Det börjar ofta med en period av ökad stress. Jobbet, ekonomin, relationen — något tar mer plats än vanligt. Och sömnen påverkas. Man somnar inte lika lätt. Man vaknar mitt i natten med tankarna igång, går igenom morgondagens att-göra-lista om och om igen utan att komma någon vart.</p><h2>Spiralen</h2><p>Problemet är att sömnbrist i sig skapar stress. Kortisol — stresshormonet — stiger när kroppen inte fått tillräcklig återhämtning. Det gör det svårare att hantera vardagsutmaningar som annars vore triviala, vilket skapar mer stress, vilket gör det ännu svårare att sova nästa natt. En helt vanlig arbetsvecka kan på så vis förvandlas till en nedåtgående spiral utan att man riktigt märker när det vände.</p><blockquote>Efter tre veckor av dålig sömn var det som att världen hade bytt färg. Allt var lite mer hotfullt. Lite mer överväldigande. Lite mer omöjligt.</blockquote><p>Det som gör det extra lurigt är att många försöker lösa problemet med fel verktyg — mer koffein för att orka dagen, alkohol för att somna på kvällen, skärmtid för att distrahera sig från tankarna. Allt sådant lindrar för stunden men förvärrar mönstret på sikt.</p><div class="stat-box"><strong>6 timmar</strong><span>Forskning visar att personer som sover under 6 timmar per natt löper dubbelt så hög risk för hjärt-kärlsjukdom och har kraftigt förhöjd risk för depression. (Källa: Karolinska Institutet)</span></div><h2>Vägen ut</h2><p>Sömnhygien är grunden: samma tid varje dag, svalt och mörkt rum, ingen skärm en timme innan. Enkla regler, men de gör faktiskt skillnad över tid eftersom de tränar kroppens inre klocka att lita på ett mönster igen.</p><p>Men viktigare är att adressera stressnivån — inte bara symtomen på sömnbrist. Det kan handla om att prioritera bort saker som inte är nödvändiga just nu, sätta tydligare gränser mot jobb eller andra krav, eller söka professionell hjälp om spiralen pågått länge. Ibland räcker inte egna knep, och det är helt okej. Att be om hjälp med sömn och stress är precis lika rimligt som att söka vård för vilket annat kroppsligt symtom som helst.</p>`
  },
  {
    id:6, tag:'Föräldraskap', category:'föräldraskap',
    title:'Pappan som inte räknades — om osynligheten i ett jämställt land',
    excerpt:'Sverige är ett av världens mest jämställda länder. Men det finns en sida av berättelsen som sällan berättas — pappan som sitter ensam i väntrummet.',
    readTime:'2 min', premium:true,
    content:`<p>Sverige är ett av världens mest jämställda länder. Men det finns en sida av jämställdhetsberättelsen som sällan berättas — pappan som sitter ensam i väntrummet, pappan som blir tillfrågad om han "hjälper till hemma" som om barnen egentligen var någon annans ansvar.</p><blockquote>Inte onda blickar. Inte fientliga. Bara frågande. En tyst undran: Var är mamman?</blockquote><h2>Det osynliga kontraktet</h2><p>Det finns ett kontrakt som ingen skriver på men som alla förväntas följa. Du ska se till att familjen tar sig från A till B. Du ska jobba. Du ska leverera ekonomisk trygghet. Och när du är hemma ska du inte ta för mycket plats — barnens vardag, deras känslor, deras behov, förväntas ofta ändå ha en primär förälder, och den förväntas sällan vara pappan, även när han är precis lika närvarande.</p><p>Det märks i småsaker. Personalen på förskolan som automatiskt ringer mamma först vid problem. Släktingar som frågar mamma om vaccinationsschema och pappan om jobbet. Ingen av delarna är illvilliga. Men tillsammans bygger de en osynlig mur som gör pappans roll mindre synlig, mindre bekräftad — även när han bär lika mycket av det praktiska och känslomässiga ansvaret.</p><h2>När separationen kommer</h2><p>Det är i samband med separationer som osynligheten blir som allra tydligast och som mest kostsam. Familjerätten, som ska vara neutral, hamnar ofta i praktiken i mönster där mamman förutsätts vara den naturliga huvudvårdnadshavaren, om inget uttryckligen talar emot det. För de pappor som förlorar täta kontakten med sina barn i den processen blir det en av livets djupaste sorger — en sorg som sällan bemöts med samma medkänsla som en mammas motsvarande förlust skulle mötas med.</p><div class="stat-box"><strong>Stark riskfaktor</strong><span>Forskning visar att fäder som förlorar kontakten med sina barn efter en separation löper kraftigt förhöjd risk för psykisk ohälsa och självmord.</span></div><h2>Jämställdhet på riktigt</h2><p>Jämställdhet på riktigt betyder att vi ser alla föräldrar som föräldrar, inte som en huvudperson och en assisterande roll. Att en pappa på BVC är lika självklar som en mamma. Att familjerätten väger lika tungt på båda sidor av bordet. Att ett barn som växer upp med en engagerad, synlig pappa ses som lika normalt som ett barn med en engagerad mamma — inte som en lycklig avvikelse.</p>`
  },
  {
    id:7, tag:'Relationer', category:'relationer',
    title:'Rösten som sa att du är fel — om psykologisk utmattning i nära relationer',
    excerpt:'Det finns en sorts utmattning som inte syns på ett blodprov. Utmattningen av att leva länge med en röst som talar om för dig vem du är.',
    readTime:'3 min', premium:true,
    content:`<p>Det finns en sorts utmattning som inte syns på ett blodprov och som inte mäts på en våg. Det är utmattningen av att leva länge med en röst som talar om för dig vem du är — vad du gjorde fel, vad du borde ha sagt istället, hur du egentligen är innerst inne.</p><p>Det sker sällan över en natt. Det sker i millimeter, i tusentals små ögonblick där du justerar dig lite grann för att undvika bråk, lite grann för att göra den andra nöjd, lite grann för att slippa den blick som säger att du gjort fel igen.</p><blockquote>Man justerar sig. Man försöker bli bättre. Man försöker räcka till — utan att märka att tillräcklighet aldrig var möjlig.</blockquote><h2>Hur det smyger sig på</h2><p>Det som gör den här sortens utmattning så svår att sätta ord på är att den sällan innehåller några dramatiska händelser att peka på. Ingen enskild mening man kan citera och säga "där, det var det som var fel". Istället är det ett mönster av ständig anpassning som med tiden gör att man tappar kontakten med sin egen uppfattning om verkligheten — man börjar undra om man verkligen minns rätt, om man verkligen känner det man känner.</p><p>Många män som befinner sig i det här beskriver att de blivit allt mindre — mindre av sig själva, mindre av sina intressen, mindre av sina vänskaper — utan att någonsin ha valt det aktivt. Det har bara skett, steg för steg, tills en dag inser man hur liten yta man faktiskt tar upp i sitt eget liv.</p><div class="stat-box"><strong>Osynligt problem</strong><span>Psykologisk forskning visar att de som lever i kontrollerande relationer sällan identifierar mönstren medan de befinner sig mitt i dem. Insikten kommer oftast först i efterhand, med distans. (Källa: Nationellt centrum för kvinnofrid)</span></div><h2>Det som inte var ditt fel</h2><p>Det tar tid att förlåta sig själv. Att se vad som är en reaktion på omständigheter snarare än en sanning om ens karaktär. Det är inte svaghet. Det är ett nervsystem som lärt sig en lektion — att hålla sig liten är säkrare — och som inte vet om att lektionen inte längre gäller, att den nuvarande verkligheten inte kräver samma anpassning längre.</p><p>Vägen tillbaka handlar inte om att skynda på processen. Den handlar om att sakta börja lyssna på sin egen röst igen — vad man faktiskt tycker, vad man faktiskt vill, utan att först fråga sig hur det kommer att tas emot. Det låter enkelt. Det är sällan det. Men det är möjligt, ett litet steg i taget.</p>`
  },
  {
    id:8, tag:'Återhämtning', category:'återhämtning',
    title:'Klockan 03 — natten jag förstod hur illa det faktiskt var',
    excerpt:'Strålkastarna skar som glödande knivar. Musiken på högsta volym var det enda tillförlitliga verktyget för att hålla ögonlocken uppe.',
    readTime:'2 min', premium:true,
    content:`<p>Strålkastarna skar som glödande knivar. Musiken på högsta volym var det enda tillförlitliga verktyget för att hålla ögonlocken uppe. Klockan var tre på morgonen, och vägen framför mig var det enda som fanns kvar i min värld just då.</p><p>Strålkastarna från de mötande bilarna skar som glödande knivar genom vindrutan. Musiken på absolut högsta volym — det enda tillförlitliga verktyget för att hålla hjärnan vaken, för att ge den något annat att fästa vid än de tankar som annars tog över helt.</p><p>Det var en ren säkerhetsåtgärd för att inte somna vid ratten. Det var ett liv på marginalen av vad en kropp klarar — dag efter dag, natt efter natt, utan att jag för ett ögonblick tillät mig att stanna upp och fråga mig själv hur jag egentligen hamnat här.</p><blockquote>Tankarna malde om samma sak om och om igen. Och de malde hårdast mitt i natten, när allt annat var tyst.</blockquote><h2>Botten som inte syntes utifrån</h2><p>Utåt sett fungerade jag. Jag gick till jobbet. Jag log när det förväntades av mig. Men inombords var det som att köra på tom tank, mil efter mil, och låtsas att mätaren visade full. Den natten, i bilen, var första gången jag på riktigt insåg avståndet mellan hur jag såg ut utifrån och hur illa det faktiskt var därinne.</p><h2>Det som höll mig kvar</h2><p>Barnen. Inte som en abstrakt tanke om förpliktelse, en pliktkänsla man borde ha. Utan deras ansikten — konkreta, verkliga, levande, framför mig varje gång tankarna gick för långt. Det var inte alltid nog. Men det var något att hålla fast vid när allt annat kändes för tungt.</p><div class="stat-box"><strong>Varje dag</strong><span>Tar i genomsnitt fyra personer sitt liv i Sverige. Tre av dem är män. Men nio av tio som gjort ett försök och överlever, dör inte av självmord senare. Det finns en väg framåt. (Källa: Mind)</span></div><p>Jag sökte hjälp inte alldeles direkt efter den natten, men den blev en vändpunkt jag ofta återvänder till — beviset på hur långt man kan gå innan man tvingas erkänna för sig själv att man inte klarar det ensam längre. Om du känner igen dig i något av det här: du behöver inte vänta tills du själv sitter i en bil klockan tre på natten för att söka hjälp. Du får göra det redan nu.</p>`
  },
  {
    id:9, tag:'Återhämtning', category:'återhämtning',
    title:'Altanen — ur mörkret, en gnista',
    excerpt:'Det var de tankarna som malde i mig den kvällen. Ensam under plasttaket medan regnet smattrade. Och mitt i det mörkret hände något.',
    readTime:'2 min', premium:true,
    content:`<p>Det var de tankarna som malde i mig den kvällen. Ensam under plasttaket medan regnet smattrade. Och mitt i det mörkret hände något — något jag inte såg komma och absolut inte hade planerat.</p><p>Jag satt under plasttaket medan regnet smattrade och stänkte in över kanten. Jag tittade på mina egna händer, som om de tillhörde någon annan. Det var sent. Huset bakom mig var mörkt och tyst, alla sov, och jag var ensam med allt det jag inte sagt högt på mycket länge.</p><p>Jag hade suttit så många kvällar innan den här, i olika versioner av samma ensamhet. Men den här kvällen var något annorlunda. Kanske för att regnet var så högljutt att det nästan drunknade tankarna. Kanske för att jag var så trött på att bära allt själv att något till slut måste ge vika.</p><blockquote>Det kan inte bara vara jag. Det måste finnas tusentals män som sitter på exakt likadana altaner just nu, i exakt samma ensamhet.</blockquote><h2>Gnistan</h2><p>Ur den insikten föddes något. En vägran att låta tystnaden vinna, en känsla av att om jag inte gjorde något med det just då skulle jag riskera att sitta där i ytterligare tio år till. Det var där, under det smattrande plasttaket — som idén till Tryggman.se tog form. Inte som en färdig plan, utan som en enkel, envis tanke: någon måste göra det lättare för män att prata om det här. Varför inte jag?</p><p>Tystnaden vann i för många år. Den vinner fortfarande för för många män, varje dag, i varje stad i det här landet. Det var dags att börja bryta den — inte med stora ord, utan genom att skapa en plats där ett vanligt, trött, ensamt man klockan elva på kvällen kunde hitta någon att prata med.</p>`
  },
  {
    id:10, tag:'Depression', category:'depression',
    title:'Hur pratar man med en vän som mår dåligt — en guide för män',
    excerpt:'Du märker att din vän inte är sig själv. Han verkar borta, trött, eller arg av okänd anledning. Du vill säga något — men vet inte hur.',
    readTime:'2 min', premium:false,
    content:`<p>Du märker att din vän inte är sig själv. Han verkar borta, trött, eller arg av okänd anledning. Du vill säga något — men vet inte hur. Och du är rädd för att göra det värre, rädd för att lägga dig i, rädd att han ska bli irriterad om du frågar fel sak vid fel tillfälle.</p><h2>Det vanligaste misstaget</h2><p>De flesta gör ett av två misstag: antingen säger de ingenting alls — för att det känns obekvämt, för att de inte vet vad de ska säga, för att de hoppas att det löser sig självt om de bara ger det lite tid. Eller så försöker de genast lösa problemet — kommer med råd, förslag och lösningar innan de ens hunnit förstå vad problemet faktiskt är.</p><p>Ingen av dem hjälper särskilt mycket. Det din vän behöver, oftast före allt annat, är att bli hörd, inte fixad. Att få prata utan att genast bli avbruten med en lösning.</p><blockquote>Fråga rakt ut: Mår du bra? Inte som ett artighetsfrågande — utan som en riktig fråga som förtjänar ett riktigt svar.</blockquote><h2>Vad du faktiskt ska säga</h2><p>Börja enkelt: "Jag har märkt att du verkar ha det tungt. Vill du prata?" Undvik att göra det till en stor grej — en vanlig ton, ett vanligt tillfälle, funkar oftast bättre än en tillrättalagd "vi behöver prata"-situation.</p><p>Och sen — lyssna. Avbryt inte. Kom inte med råd om han inte ber om det. Bekräfta det han berättar: "Det låter tungt. Det förstår jag." Ibland är det enda som faktiskt behövs att någon stannar kvar i rummet utan att fly undan obehaget.</p><div class="stat-box"><strong>Det viktigaste</strong><span>Forskning visar att det att någon frågar direkt om en person mår dåligt — även om ämnet är känsligt — minskar risken för självmord. Att fråga skapar inte problemet. Att inte fråga kan förvärra det.</span></div><h2>Om du är orolig på riktigt</h2><p>Om du tror att din vän har tankar på att skada sig — fråga direkt. "Har du tankar på att ta livet av dig?" Det är en svår fråga att ställa. Men det är rätt fråga, och den gör sällan skillnaden värre. Och om svaret är ja — hjälp honom att kontakta vården eller ring 90101 tillsammans med honom, samma kväll om det går.</p>`
  },
  {
    id:11, tag:'Föräldraskap', category:'föräldraskap',
    title:'Att vara pappa och må dåligt — du är inte ensam',
    excerpt:'Pappor mår dåligt också. Men det pratas sällan om. För vem ska ta hand om familjen om pappa inte håller ihop? Den frågan är en fälla.',
    readTime:'2 min', premium:false,
    content:`<p>Pappor mår dåligt också. Men det pratas sällan om. För vem ska ta hand om familjen om pappa inte håller ihop? Den frågan är en fälla — och den håller alldeles för många pappor fast i tystnad de aldrig borde behöva bära.</p><p>Det finns en föreställning om att pappor är de som håller ihop. De som är starka när det behövs. De som inte rasar ihop — för om de gör det, vad händer då med resten? Vem blir kvar att fånga upp alla andra?</p><p>Den föreställningen är en fälla. Och den håller många pappor kvar i ett mönster av tystnad som kostar enormt mycket — för dem själva, men också för barnen och partnern som aldrig får se hela människan bakom rollen.</p><h2>Att vara pappa är att vara människa</h2><p>Pappor upplever depression. Pappor upplever ångest. Pappor kan gå in i väggen. Pappor kan ha perioder när de inte orkar — inte med jobbet, inte med relationen, och ibland inte ens med det de älskar mest: sina barn. Det sista är kanske det svåraste att erkänna, för det känns som att erkänna ett svek mot det man värnar mest om i hela världen.</p><blockquote>Jag älskade dem mer än allt. Och ändå räckte jag inte till. Jag förstod inte att de två sakerna kunde vara sanna samtidigt.</blockquote><p>Just den insikten — att kärlek och otillräcklighet kan existera sida vid sida, utan att den ena upphäver den andra — är ofta det som till slut gör att en pappa vågar söka hjälp. Inte trots att han älskar sina barn, utan just för att han gör det.</p><div class="stat-box"><strong>10%</strong><span>Av nyblivna pappor upplever postpartumdepression — en siffra som är kraftigt underrapporterad eftersom symtomen sällan identifieras. (Källa: Karolinska Institutet)</span></div><h2>Det du behöver höra</h2><p>Att må dåligt som pappa gör dig inte till en dålig pappa. Det gör dig till en människa som behöver hjälp. Och att söka den hjälpen — att visa dina barn att det är okej att inte vara okej, och att man kan ta tag i det — är ett av de bästa föredömen du kan ge dem, långt mer värdefullt i längden än en fasad av att alltid ha koll.</p>`
  },
  {
    id:12, tag:'Utbrändhet & stress', category:'utbrändhet',
    title:'Stressens fysiologi — vad som faktiskt händer i kroppen när du kör för hårt',
    excerpt:'Stress är inte bara en känsla. Det är en biologisk reaktion som förändrar din kropp på cellnivå. Och kronisk stress gör skador som tar lång tid att läka.',
    readTime:'2 min', premium:true,
    content:`<p>Stress är inte bara en känsla. Det är en biologisk reaktion som förändrar din kropp på cellnivå. Och kronisk stress gör skador som tar lång tid att läka — vilket är precis varför det är värt att förstå vad som faktiskt händer därinne, inte bara försöka "ta det lugnare".</p><p>Vi pratar om stress som om det vore en känsla man kan välja bort. Som om det handlade om att "ta det lugnt" eller "inte ta det så hårt", som om lösningen bara var en fråga om attityd. Men stress är i grunden en biologisk reaktion — och kronisk stress gör fysiska skador på din kropp, oavsett hur bra attityd du har.</p><h2>Fight or flight</h2><p>När hjärnan uppfattar ett hot — ett verkligt hot eller ett upplevt hot som en deadline eller ett svårt samtal — aktiveras det sympatiska nervsystemet. Adrenalin och kortisol pumpas ut. Pulsen ökar. Blodtrycket stiger. Musklerna spänner sig, redo för handling som sällan behövs i det moderna livet.</p><p>Det är ett system designat för kortsiktiga hot — ett fåtal minuter av intensiv aktivering, sen tillbaka till lugn. Problemet uppstår när det aktiveras konstant — dag efter dag, vecka efter vecka, utan att kroppen någonsin får signalen att faran är över.</p><div class="stat-box"><strong>Kronisk stress</strong><span>Förkortar telomererna — skyddskapslar på DNA-kedjorna som är kopplade till åldrande och sjukdom. Kronisk stress åldrar kroppen på cellnivå. (Källa: Nobelinstitutet)</span></div><h2>Vad som behöver hända</h2><p>Det parasympatiska nervsystemet — "vila och smälta"-systemet — måste få utrymme att ta över regelbundet. Det aktiveras av djup andning, rörelse, sömn och socialt stöd. Inte av Netflix och alkohol, som känns återhämtande i stunden men som i praktiken håller nervsystemet kvar i ett aktiverat tillstånd, bara utan att det märks lika tydligt.</p><p>Återhämtning är alltså inte passivitet. Det är aktivt underhåll av kroppen som ska bära dig resten av livet — lika viktigt att prioritera som träningen eller jobbet, även om det sällan känns lika brådskande.</p>`
  }
];

const stories = [
  { id:1, name:'Johan', initials:'J', meta:'42 år · Göteborg', tag:'Utbrändhet', title:'Dagen jag grät på parkeringen', locked:false, excerpt:'Jag satt i bilen i tjugo minuter innan jag orkade gå in på jobbet. Inte för att jag var rädd. Utan för att jag var så trött att tårarna bara rann och jag inte ens förstod varför.', full:`<p>Jag satt i bilen i tjugo minuter innan jag orkade gå in på jobbet. Inte för att jag var rädd för något. Utan för att jag var så trött att tårarna bara rann och jag inte ens förstod varför. Jag mindes inte ens vad som utlöste det. Det bara kom, som ett tryck bakom ögonen som till slut gav vika.</p><p>Det hade byggt på sig i månader, kanske längre. Jag hade jobbat övertid utan att säga något, skött familjen på autopilot, löst problem som egentligen inte var mina att lösa — kollegors, min mammas, grannens. Och hela tiden sagt till mig själv att det bara var en tuff period. Att det skulle lugna sig efter nästa deadline. Sen nästa. Sen nästa.</p><p>Jag hade slutat märka hur trött jag var, för trött hade blivit mitt normala. Jag sov, men vaknade lika utmattad som jag lagt mig. Jag åt lunch framför datorn och kallade det effektivt. Jag log på möten och kände ingenting.</p><blockquote>"Det är inte en tuff period. Det är ditt liv. Och det håller på att köra dig i botten."</blockquote><p>Det var vad min fru sa till mig den kvällen, när jag äntligen kom hem efter att ha suttit kvar i bilen på parkeringen igen — den här gången utanför vårt eget hus. Hon sa det inte elakt. Hon sa det desperat, med rösten hon använder när hon är rädd men försöker låta lugn. Hon hade sett det länge. Hon visste bara inte hur hon skulle nå fram till mig utan att jag skulle gå i försvar.</p><p>Jag blev arg först. Sen tyst. Sen satt vi bara där vid köksbordet i typ en timme utan att säga så mycket alls.</p><p>Jag sökte hjälp tre veckor senare. Ringde vårdcentralen på en rast, viskade nästan i telefonen som om någon skulle höra. Det var det svåraste jag gjort på länge. Och i efterhand — det bästa.</p>` },
  { id:2, name:'Anonym', initials:'A', meta:'35 år', tag:'Skilsmässa & barn', title:'Jag fick lära mig att vara pappa på halv tid', locked:false, excerpt:'Ingen förberedde mig på hur det skulle kännas att lämna dem på söndagskvällen. Hur jag satt i den tomma lägenheten och inte visste vad jag skulle göra med alla timmar.', full:`<p>Ingen förberedde mig på hur det skulle kännas att lämna dem på söndagskvällen. Hur bildörren stängs en aning för hårt när jag kör iväg. Hur jag blir stående kvar på trappan en stund efter att de gått in, som om jag väntar på att något ska ändra sig om jag bara står där tillräckligt länge.</p><p>Sen kör jag hem till en lägenhet som är exakt lika tom som förra veckan. Ingen förberedde mig på tystnaden. Inga skor slängda i hallen. Inget bråk om vem som ska duscha först. Inga skratt genom väggen när jag ska sova. Bara alla de där timmarna som plötsligt inte längre är fyllda med dem — och jag som inte riktigt vet vad jag ska göra med dem.</p><p>Jag diskar en tallrik som redan är ren. Jag sätter mig i soffan. Jag reser mig igen efter två minuter. Jag vet inte varför. Jag har provat allt — träna, städa, ringa polare — men de tomma kvällarna har ett eget sug som är svårt att fylla.</p><p>Skilsmässan var rätt. Det visste vi båda, även om ingen av oss sa det högt de sista månaderna. Ingen av oss mådde bra av att stanna, och barnen hade redan börjat märka det innan vi själva vågade erkänna det för oss själva. Men rätt beslut gör inte varannan-vecka-livet lättare. Det gör bara att jag vet, med hela mig, att jag inte skulle ha valt annorlunda — samtidigt som jag saknar dem varje enda dag de inte är här.</p><blockquote>Jag är fortfarande deras pappa, varje dag, oavsett vilket hem de sover i.</blockquote><p>Folk säger "du har ju dem varannan vecka, det är ju ändå bra." Och ja, det är bättre än ingenting, det vet jag. Men ingen frågar hur det känns att missa en helt vanlig tisdag. Ett läxförhör. Ett gnäll om något dumt som hänt i skolan. De där små sakerna som aldrig är stora nog att nämna på telefon, men som ändå är hela livet när man är förälder.</p><p>Det låter enkelt när jag skriver det. Det är det inte. Men det är sant.</p>` },
  { id:3, name:'Mikael', initials:'M', meta:'51 år · Stockholm', tag:'Depression', title:'Tjugo år med ett leende som inte var mitt', locked:true, excerpt:'Jag var den rolige. Den som alltid hade ett svar, en historia, ett skämt. Ingen visste — inte ens min fru på länge — att jag på insidan var totalt tom.', full:`<p>Jag var den rolige. Den som alltid hade ett svar redo, en historia att dra, ett skämt när stämningen blev tung. På fester var jag den som fyllde tystnaden innan den blev obekväm. Kollegor sa att jag lyste upp rummet. Jag blev bra på det — så bra att jag nästan trodde på det själv ibland.</p><p>Ingen visste — inte ens min fru på länge — att jag på insidan var totalt tom. Att jag kunde stå mitt i ett skratt jag själv orsakat och känna precis ingenting. Som om jag såg mig själv utifrån, spelandes en roll jag blivit väldigt duktig på men aldrig valt.</p><p>Jag la ner enorm energi på att se okej ut. Det är utmattande på ett sätt folk inte förstår om de inte varit där. Att hålla masken kräver mer kraft än att bara få vara den man faktiskt är den dagen.</p><blockquote>Depression ser sällan ut som man tror. Ibland ser det ut som att allting är bra.</blockquote><p>Det var min läkare som till slut ställde rätt fråga, vid en helt vanlig kontroll för något annat. Inte "hur mår du?" — det hade jag svarat "bra" på i tjugo år utan att tveka. Utan "hur mår du egentligen, när ingen ser på?" Något i den frågan gjorde att jag inte kunde svara på autopilot. Jag minns att jag satt tyst länge. Sen sprack något, mitt i mottagningsrummet, framför en person jag träffat i tio minuter.</p><p>Jag är 51 år gammal. Det tog mig tjugo år att förstå vad jag faktiskt bar på under leendet. Min fru grät när jag berättade — inte för att hon blev chockad, utan för att hon i efterhand kände igen alla tecken hon aldrig fått sätta ord på. Jag önskar att någon hade frågat tidigare. Jag önskar att jag hade vågat svara ärligt tidigare, den där enda gången det räckte.</p>` },
  { id:4, name:'Anonym', initials:'A', meta:'28 år', tag:'Ångest', title:'Ångesten ingen visste om', locked:true, excerpt:'Utifrån såg jag ut att ha allt. Bra jobb, bra tjej, bra lägenhet. Inuti var det som att sitta i en bil med en motor som aldrig stängs av.', full:`<p>Utifrån såg jag ut att ha allt. Bra jobb med bra lön, en tjej jag älskade, en lägenhet jag var stolt över, ett gym-schema jag höll fast vid. På Instagram hade jag antagligen sett ut som en person med koll på läget.</p><p>Inuti var det något helt annat. Som att sitta i en bil med en motor som aldrig stängs av, även när bilen står helt still i garaget. Pulsen som aldrig riktigt sjönk. Tankarna som hoppade från en katastrof till nästa innan jag ens hunnit somna. Jag låg vaken och gick igenom saker som redan hänt, om och om igen, som om jag kunde ändra utfallet genom att tänka tillräckligt hårt på det.</p><p>Jag sa till mig själv att alla har det stressigt. Att det bara var att bita ihop. Jag drack mer kaffe för att orka genom dagarna och mer alkohol på helgerna för att stänga av på kvällarna, utan att koppla ihop de två.</p><blockquote>Det tog en panikattack på jobbet — framför tre kollegor — innan jag sökte hjälp. Jag önskar att jag hade gjort det utan att behöva nå botten först.</blockquote><p>Det hände under ett helt vanligt möte. Plötsligt kunde jag inte andas, rummet kändes för litet, händerna domnade. Jag var övertygad om att jag höll på att dö. Kollegorna trodde först att jag skämtade, sen att jag fick ett hjärtinfarkt. Jag fick åka hem för resten av dagen och satt sen bara på golvet i hallen i typ en timme.</p><p>KBT hjälpte, men det gick inte över en natt. Det tar tid att lära om ett nervsystem som gått på högvarv i flera år. Men det funkar, steg för steg. Och det är inget — absolut inget — att skämmas för.</p>` },
  { id:5, name:'Thomas', initials:'T', meta:'44 år · Malmö', tag:'Ensamhet', title:'Omgiven av folk, helt ensam', locked:true, excerpt:'Jag hade ett fullt socialt liv på pappret. Men ingen visste egentligen vem jag var. Vi höll oss på ytan — och låtsades att ytan var allt.', full:`<p>Jag hade ett fullt socialt liv på pappret. Fotbollslaget på tisdagar, grillkvällar nästan varje helg på sommaren, kollegor jag åt lunch med varje dag och pratade med hela eftermiddagen. Kalendern var full. Telefonen tystnade aldrig.</p><p>Men ingen visste egentligen vem jag var. Vi pratade om matcher, om semestrar, om vem som skulle grilla nästa gång. Aldrig om hur man faktiskt hade det. Det var som en tyst överenskommelse — vi höll oss på ytan, och alla låtsades att ytan var allt som fanns.</p><p>Jag minns att jag en kväll satt mitt bland tio kompisar, mitt i skratt och historier, och kände mig mer ensam än jag någonsin gjort hemma själv. Det var en konstig, obekväm känsla att bära på — att vara omgiven av så mycket och ändå känna att ingen av dem faktiskt kände mig.</p><blockquote>Den enda platsen jag faktiskt fick vara ärlig var i ett anonymt onlineforum. Det säger något om hur vi har det.</blockquote><p>Där, bakom ett anonymt användarnamn, skrev jag saker jag aldrig sagt högt till en enda människa jag träffat i verkliga livet. Det var lättare att vara ärlig mot främlingar än mot vänner jag känt i femton år. Jag tänkte länge på vad det säger om oss män och hur vi umgås — att vi kan dela allt utom det som faktiskt spelar roll.</p><p>Nu har jag en terapeut jag pratar med varannan vecka. Det är konstigt, faktiskt lite sorgligt, att det krävs en yrkesperson jag betalar för att få ha ett fullständigt ärligt samtal. Men det är bättre än ingenting. Och det har fått mig att sakta börja säga mer sanning även till några av kompisarna på tisdagsträningen — en åt gången.</p>` }
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
  const [rcLoading, setRcLoading] = useState(false);

  useEffect(() => {
    if (currentUser) ensureRevenueCatConfigured(currentUser.uid);
  }, [currentUser]);

  const checkout = async (type) => {
    if (!currentUser) { nav('login'); return; }

    if (IS_NATIVE) {
      // Google Play Billing via RevenueCat
      setRcLoading(true);
      try {
        await ensureRevenueCatConfigured(currentUser.uid);
        const offerings = await Purchases.getOfferings();
        const pkg = offerings.current?.availablePackages?.find(p => p.identifier === type);
        if (!pkg) {
          alert('Kunde inte hitta prenumerationen. Försök igen om en stund.');
          setRcLoading(false);
          return;
        }
        const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
        const active = customerInfo.entitlements.active[type === 'premium' ? 'premium' : 'bas'];
        if (active) {
          // Firestore-uppdateringen sker normalt via RevenueCats webhook -> Netlify-funktion,
          // men vi flaggar direkt lokalt också så UI känns responsivt.
          alert('Klart! Din prenumeration är aktiv.');
          window.location.reload();
        }
      } catch (e) {
        if (e?.userCancelled) {
          // användaren avbröt köpdialogen, inget fel att visa
        } else {
          alert('Något gick fel med köpet. Försök igen.');
        }
      }
      setRcLoading(false);
      return;
    }

    // Stripe för webben
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
            <button className="price-btn-tm price-btn-ghost-tm" onClick={()=>checkout('bas')} disabled={isPremium || rcLoading}>
              {isPremium ? 'Du har Premium' : rcLoading ? 'Öppnar...' : 'Prova 4 meddelanden gratis'}
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
            <button className="price-btn-tm price-btn-solid-tm" onClick={()=>checkout('premium')} disabled={isPremium || rcLoading}>
              {isPremium ? '✓ Din aktiva plan' : rcLoading ? 'Öppnar...' : 'Starta samtal med terapeut'}
            </button>
            <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',textAlign:'center',marginTop:'0.8rem',fontStyle:'italic'}}>Mindre än 12 kr om dagen</div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ============================================================
   MITT KONTO PAGE
   ============================================================ */
export const KontoPage = ({ nav, currentUser, isPremium, signOut, auth }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        setUserData(snap.exists() ? snap.data() : null);
      } catch { setUserData(null); }
      setLoading(false);
    })();
  }, [currentUser]);

  const planLabel = (plan) => plan === 'premium' ? 'Premium — Personlig Terapeut'
    : plan === 'bas' ? 'BAS — AI-Rådgivare'
    : 'Gratis';

  const formatDate = (ts) => {
    if (!ts) return null;
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('sv-SE', { year:'numeric', month:'long', day:'numeric' });
    } catch { return null; }
  };

  const handleCancel = async () => {
    if (!currentUser) return;
    if (!window.confirm('Är du säker på att du vill avsluta din prenumeration? Du behåller tillgången fram till slutet av din nuvarande betalperiod.')) return;
    setCanceling(true);
    setMsg(null);
    try {
      const res = await fetch('/.netlify/functions/cancel-subscription', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId: currentUser.uid })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type:'success', text:'Din prenumeration är avslutad och upphör vid periodens slut. Du behåller full tillgång tills dess.' });
      } else {
        setMsg({ type:'error', text: data.error || 'Något gick fel. Försök igen eller kontakta oss.' });
      }
    } catch {
      setMsg({ type:'error', text:'Något gick fel. Försök igen eller kontakta oss.' });
    }
    setCanceling(false);
  };

  if (!currentUser) {
    return (
      <div>
        <div className="page-hero">
          <div className="section-label">Konto</div>
          <h1>Mitt konto</h1>
          <p>Du behöver logga in för att se ditt konto.</p>
        </div>
        <div style={{padding:'3rem 8%',textAlign:'center'}}>
          <button className="btn-primary" onClick={()=>nav('login')}>Logga in</button>
        </div>
      </div>
    );
  }

  const plan = userData?.plan || 'free';

  return (
    <div>
      <div className="page-hero">
        <div className="section-label">Konto</div>
        <h1>Mitt konto</h1>
        <p>Här hittar du din information och din prenumeration.</p>
      </div>

      <div style={{padding:'3rem 8% 5rem',maxWidth:'640px',margin:'0 auto'}}>
        {loading ? (
          <p style={{color:'#6B7A85',textAlign:'center'}}>Laddar...</p>
        ) : (
          <>
            <div style={{background:'#fff',border:'1px solid rgba(28,43,53,0.1)',borderRadius:'4px',padding:'2rem',marginBottom:'1.5rem'}}>
              <div style={{fontSize:'0.72rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'#4E9E8D',marginBottom:'1rem'}}>Kontoinformation</div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.9rem'}}>
                <div>
                  <div className="input-label">E-post</div>
                  <div style={{color:'#1C2B35',fontSize:'1rem'}}>{currentUser.email}</div>
                </div>
                {currentUser.displayName && (
                  <div>
                    <div className="input-label">Namn</div>
                    <div style={{color:'#1C2B35',fontSize:'1rem'}}>{currentUser.displayName}</div>
                  </div>
                )}
                <div>
                  <div className="input-label">Medlem sedan</div>
                  <div style={{color:'#1C2B35',fontSize:'1rem'}}>{formatDate(currentUser.metadata?.creationTime) || '—'}</div>
                </div>
              </div>
            </div>

            <div style={{background:'#fff',border:'1px solid rgba(28,43,53,0.1)',borderRadius:'4px',padding:'2rem',marginBottom:'1.5rem'}}>
              <div style={{fontSize:'0.72rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'#4E9E8D',marginBottom:'1rem'}}>Prenumeration</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom: plan!=='free' ? '1.2rem' : 0}}>
                <div>
                  <div style={{fontFamily:'DM Serif Display,serif',fontSize:'1.3rem',color:'#1C2B35'}}>{planLabel(plan)}</div>
                  {userData?.planActivatedAt && (
                    <div style={{fontSize:'0.85rem',color:'#6B7A85',marginTop:'0.2rem'}}>Aktiverad {formatDate(userData.planActivatedAt)}</div>
                  )}
                </div>
                {plan==='free' && <button className="btn-primary" onClick={()=>nav('priser')}>Uppgradera</button>}
              </div>
              {plan!=='free' && (
                <div style={{display:'flex',gap:'0.8rem',flexWrap:'wrap'}}>
                  <button className="btn-ghost" onClick={()=>nav('priser')}>Byt plan</button>
                  <button className="btn-ghost" onClick={handleCancel} disabled={canceling} style={{borderColor:'rgba(192,86,58,0.35)',color:'#C0563A'}}>
                    {canceling ? 'Avslutar...' : 'Avsluta prenumeration'}
                  </button>
                </div>
              )}
              {msg && (
                <div style={{marginTop:'1rem',padding:'0.8rem 1rem',fontSize:'0.85rem',borderLeft:`3px solid ${msg.type==='success'?'#3A7D6E':'#C0873A'}`,background: msg.type==='success' ? 'rgba(58,125,110,0.08)' : 'rgba(192,135,58,0.08)',color: msg.type==='success' ? '#3A7D6E' : '#C0873A'}}>
                  {msg.text}
                </div>
              )}
            </div>

            <div style={{textAlign:'center',display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
              <button className="btn-ghost" onClick={()=>nav('hem')}>← Tillbaka till start</button>
              <button className="btn-ghost" onClick={()=>signOut(auth)}>Logga ut</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   OM OSS PAGE
   ============================================================ */
export const OmOssPage = ({ nav }) => (
  <div>
    <div className="page-hero">
      <div className="section-label">Vår historia</div>
      <h1>Varför <em>Tryggman finns</em></h1>
      <p>Tryggman föddes ur en frustration och en övertygelse. Frustration över att se så många män lida i det tysta. Övertygelse om att det måste finnas ett bättre sätt.</p>
    </div>

    <section style={{padding:'4rem 8%',maxWidth:'1100px',margin:'0 auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3rem'}} className="about-intro-grid">
        <div>
          <div className="section-label">Bakgrunden</div>
          <h2 style={{fontFamily:'DM Serif Display,serif',fontSize:'1.8rem',color:'#1C2B35',margin:'0.5rem 0 1rem'}}>En tyst kris</h2>
          <p style={{color:'#6B7A85',lineHeight:1.85,marginBottom:'1rem',fontWeight:300}}>Varje dag förlorar vi män till psykisk ohälsa. Män som var söner, bröder, pappor och vänner. Män som kände att de inte kunde prata om sina känslor, som trodde att de måste klara allt själva.</p>
          <p style={{color:'#6B7A85',lineHeight:1.85,marginBottom:'1rem',fontWeight:300}}>Bakom varje siffra finns en människa med en historia. En familj som sörjer. Vänner som önskar att de hade sagt något. Vi lever i ett samhälle där män fortfarande förväntas "hålla masken" — där känslor ses som svaghet.</p>
          <p style={{color:'#6B7A85',lineHeight:1.85,fontWeight:300}}>Men sanningen är att det krävs otroligt mycket styrka att erkänna när man inte mår bra. Det är precis den styrkan vi vill stötta.</p>
        </div>
        <div>
          <div className="section-label">Vår approach</div>
          <h2 style={{fontFamily:'DM Serif Display,serif',fontSize:'1.8rem',color:'#1C2B35',margin:'0.5rem 0 1rem'}}>Möter dig där du är</h2>
          <p style={{color:'#6B7A85',lineHeight:1.85,marginBottom:'1rem',fontWeight:300}}>Vi skapade Tryggman som en plattform som möter män där de är. Som gör det lättare att ta första steget. Som finns där när du behöver det — utan press, utan dom.</p>
          <p style={{color:'#6B7A85',lineHeight:1.85,marginBottom:'1rem',fontWeight:300}}>Vi tror på kombinationen: AI-rådgivning för den som är redo att börja prata, certifierade terapeuter för djupare stöd, och en community av män som förstår.</p>
          <p style={{color:'#6B7A85',lineHeight:1.85,fontWeight:300}}>Tillsammans bryter vi tystnaden — en berättelse i taget.</p>
        </div>
      </div>
    </section>

    <section style={{background:'#F2EDE5',padding:'4rem 8%'}}>
      <div style={{maxWidth:'1100px',margin:'0 auto'}}>
        <div className="section-label">Vad vi tror på</div>
        <h2 style={{fontFamily:'DM Serif Display,serif',fontSize:'1.8rem',color:'#1C2B35',margin:'0.5rem 0 2rem'}}>Våra värderingar</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1.5rem'}}>
          <div><div style={{fontSize:'1.8rem',marginBottom:'0.5rem'}}>🛡️</div><div style={{fontWeight:600,color:'#1C2B35',marginBottom:'0.3rem'}}>Trygghet</div><div style={{color:'#6B7A85',fontSize:'0.9rem',fontWeight:300}}>En miljö utan dömande. Du kan vara precis den du är.</div></div>
          <div><div style={{fontSize:'1.8rem',marginBottom:'0.5rem'}}>🌱</div><div style={{fontWeight:600,color:'#1C2B35',marginBottom:'0.3rem'}}>Tillgänglighet</div><div style={{color:'#6B7A85',fontSize:'0.9rem',fontWeight:300}}>Stöd dygnet runt. Ångest väntar inte på kontorstid.</div></div>
          <div><div style={{fontSize:'1.8rem',marginBottom:'0.5rem'}}>📖</div><div style={{fontWeight:600,color:'#1C2B35',marginBottom:'0.3rem'}}>Evidensbaserat</div><div style={{color:'#6B7A85',fontSize:'0.9rem',fontWeight:300}}>Allt vi erbjuder bygger på forskning och beprövad praxis.</div></div>
          <div><div style={{fontSize:'1.8rem',marginBottom:'0.5rem'}}>🤝</div><div style={{fontWeight:600,color:'#1C2B35',marginBottom:'0.3rem'}}>Gemenskap</div><div style={{color:'#6B7A85',fontSize:'0.9rem',fontWeight:300}}>Ingen man ska behöva kämpa ensam. Aldrig.</div></div>
        </div>
      </div>
    </section>

    <section style={{background:'#1C2B35',padding:'4rem 8%',textAlign:'center'}}>
      <h2 style={{fontFamily:'DM Serif Display,serif',fontSize:'2rem',color:'#fff',marginBottom:'1rem'}}>Vår vision</h2>
      <p style={{color:'rgba(255,255,255,0.5)',maxWidth:'560px',margin:'0 auto 2rem',fontWeight:300,lineHeight:1.85}}>En värld där mental hälsa inte är tabu. Där varje man har tillgång till stödet han behöver. Där det är lika naturligt att ta hand om sin psykiska hälsa som sin fysiska.</p>
      <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
        <button className="btn-primary" onClick={()=>nav('berattelser')}>Läs berättelser</button>
        <button className="btn-ghost-white" onClick={()=>nav('chat')}>Prata med oss</button>
      </div>
    </section>
  </div>
);

/* ============================================================
   LEGAL PAGES (Integritetspolicy, Användarvillkor, Cookies)
   ============================================================ */
const LegalShell = ({ label, title, updated, highlight, children }) => (
  <div>
    <div className="page-hero" style={{paddingBottom:'2.5rem'}}>
      <div className="section-label">{label}</div>
      <h1 style={{fontSize:'2.6rem'}}>{title}</h1>
      <p style={{fontSize:'0.85rem'}}>{updated}</p>
    </div>
    <div style={{maxWidth:'740px',margin:'0 auto',padding:'3rem 8% 5rem'}}>
      {highlight && <div style={{background:'#F2EDE5',borderLeft:'3px solid #3A7D6E',padding:'1rem 1.2rem',fontSize:'0.88rem',color:'#1C2B35',marginBottom:'1.5rem',lineHeight:1.7}}>{highlight}</div>}
      {children}
    </div>
  </div>
);
const LH2 = ({children}) => <h2 style={{fontFamily:'DM Serif Display,serif',fontSize:'1.4rem',color:'#1C2B35',margin:'2.2rem 0 0.7rem'}}>{children}</h2>;
const LH3 = ({children}) => <h3 style={{fontSize:'0.95rem',fontWeight:600,color:'#1C2B35',margin:'1.3rem 0 0.4rem'}}>{children}</h3>;
const LP = ({children}) => <p style={{fontSize:'0.92rem',color:'#6B7A85',lineHeight:1.85,marginBottom:'0.9rem',fontWeight:300}}>{children}</p>;
const LUL = ({items}) => <ul style={{margin:'0.4rem 0 0.9rem 1.2rem'}}>{items.map((it,i)=><li key={i} style={{fontSize:'0.92rem',color:'#6B7A85',lineHeight:1.8,fontWeight:300,marginBottom:'0.2rem'}}>{it}</li>)}</ul>;

export const IntegritetspolicyPage = ({ nav }) => (
  <LegalShell label="Juridisk information" title="Integritetspolicy" updated="Senast uppdaterad: Juli 2026"
    highlight="Din integritet är viktig för oss. Vi samlar aldrig in mer data än nödvändigt och säljer aldrig dina uppgifter till tredje part.">
    <LH2>1. Vem är ansvarig?</LH2>
    <LP>Tryggman (enskild firma), med säte i Falun, Sverige, är personuppgiftsansvarig för behandlingen av dina personuppgifter.</LP>
    <LP>Kontakt: <a href="mailto:kontakt@tryggman.se" style={{color:'#3A7D6E'}}>kontakt@tryggman.se</a></LP>

    <LH2>2. Vilka uppgifter samlar vi in?</LH2>
    <LH3>Kontouppgifter</LH3>
    <LUL items={['E-postadress (obligatorisk vid registrering)','Namn eller alias (du väljer själv)','Lösenord (krypterat, aldrig läsbart för oss)']}/>
    <LH3>Användningsdata</LH3>
    <LUL items={['Måendelogg (sparas lokalt i din webbläsare, inte på våra servrar)','Chatthistorik med AI-rådgivaren (sparas lokalt, max 14–30 dagar)','Meddelanden i terapeut-chatten (krypterade i Firebase)','Community-inlägg och svar (kopplade till ditt konto)']}/>
    <LH3>Betalningsuppgifter</LH3>
    <LP>Betalningar hanteras av Stripe. Vi lagrar aldrig kortuppgifter. Vi sparar prenumerationsstatus och Stripe-kund-ID för att hantera din prenumeration.</LP>

    <LH2>3. Varför behandlar vi dina uppgifter?</LH2>
    <LUL items={['För att tillhandahålla tjänsten (avtalsfullgörande)','För att hantera din prenumeration och betalning (avtalsfullgörande)','För att skicka viktig information om tjänsten (berättigat intresse)','För att förbättra tjänsten (berättigat intresse)']}/>

    <LH2>4. Hur länge sparar vi dina uppgifter?</LH2>
    <LUL items={['Kontouppgifter sparas tills du begär radering','Terapeut-chattmeddelanden sparas i 12 månader','Betalningsdata sparas enligt bokföringslagens krav (7 år)','AI-chatthistorik sparas lokalt av dig, inte av oss']}/>

    <LH2>5. Delar vi dina uppgifter?</LH2>
    <LP>Vi delar aldrig dina uppgifter i marknadsföringssyfte. Vi använder följande underleverantörer:</LP>
    <LUL items={['Firebase / Google Cloud (autentisering och databas)','Stripe (betalningar)','Netlify (hosting)','Anthropic (AI-rådgivare)']}/>
    <LP>Alla underleverantörer är bundna av dataskyddsavtal (DPA) och hanterar data enligt GDPR.</LP>

    <LH2>6. Dina rättigheter</LH2>
    <LP>Enligt GDPR har du rätt att:</LP>
    <LUL items={['Begära tillgång till dina uppgifter','Begära rättelse av felaktiga uppgifter','Begära radering ("rätten att bli glömd")','Invända mot behandling','Begära dataportabilitet']}/>
    <LP>Kontakta oss på <a href="mailto:kontakt@tryggman.se" style={{color:'#3A7D6E'}}>kontakt@tryggman.se</a> för att utöva dina rättigheter. Vi svarar inom 30 dagar.</LP>

    <LH2>7. Säkerhet</LH2>
    <LP>All data krypteras under överföring (TLS/HTTPS). Firebase lagrar data krypterat. Vi använder säkra autentiseringsmetoder och begränsar åtkomst till personuppgifter.</LP>

    <LH2>8. Klagomål</LH2>
    <LP>Om du anser att vi behandlar dina uppgifter felaktigt kan du vända dig till Integritetsskyddsmyndigheten (IMY) på <a href="https://www.imy.se" style={{color:'#3A7D6E'}} target="_blank" rel="noreferrer">imy.se</a>.</LP>

    <div style={{textAlign:'center',marginTop:'2.5rem'}}>
      <button className="btn-ghost" onClick={()=>nav('hem')}>← Tillbaka till start</button>
    </div>
  </LegalShell>
);

export const AnvandarvillkorPage = ({ nav }) => (
  <LegalShell label="Juridisk information" title="Användarvillkor" updated="Senast uppdaterad: Juli 2026"
    highlight={<><strong>Viktigt:</strong> Tryggman är ett stödverktyg och ersätter inte professionell psykiatrisk vård. Vid akut kris — ring 90101 eller 112.</>}>
    <LH2>1. Om tjänsten</LH2>
    <LP>Tryggman är en digital plattform för mäns psykiska hälsa som erbjuder AI-rådgivning, kontakt med certifierade terapeuter, community och utbildningsinnehåll. Tjänsten drivs av Tryggman (enskild firma) med säte i Falun, Sverige.</LP>

    <LH2>2. Acceptans av villkor</LH2>
    <LP>Genom att använda Tryggman accepterar du dessa användarvillkor. Om du inte accepterar villkoren ber vi dig att inte använda tjänsten.</LP>

    <LH2>3. Medicinsk ansvarsfriskrivning</LH2>
    <LP>Tryggman är inte en medicinsk tjänst och ersätter inte professionell vård:</LP>
    <LUL items={['AI-rådgivaren är inte en legitimerad terapeut eller läkare','Innehållet på plattformen är informativt, inte medicinskt råd','Terapeut-chatten är ett stödverktyg, inte akutpsykiatri','Vid akut psykiatrisk kris — kontakta vården eller ring 112']}/>

    <LH2>4. Ditt konto</LH2>
    <LP>Du ansvarar för att:</LP>
    <LUL items={['Hålla dina inloggningsuppgifter säkra','All aktivitet som sker via ditt konto','Lämna korrekta uppgifter vid registrering','Inte dela ditt konto med andra']}/>
    <LP>Du måste vara minst 18 år för att använda tjänsten. Är du under 18 behöver du målsmans godkännande.</LP>

    <LH2>5. Tillåten användning</LH2>
    <LP>Du förbinder dig att inte:</LP>
    <LUL items={['Dela innehåll som är kränkande, hotfullt eller diskriminerande','Använda tjänsten för att trakassera andra användare','Dela personuppgifter om andra utan deras samtycke','Försöka kringgå säkerhetsfunktioner','Använda tjänsten i kommersiellt syfte utan tillstånd']}/>

    <LH2>6. Prenumeration och betalning</LH2>
    <LUL items={['Prenumerationer debiteras månadsvis','Ingen bindningstid — avsluta när som helst','Återbetalning ges ej för påbörjad period','Prisändringar meddelas minst 30 dagar i förväg','Betalningar hanteras av Stripe']}/>

    <LH2>7. Community-regler</LH2>
    <LP>I communityn gäller:</LP>
    <LUL items={['Respektera andra användare och deras upplevelser','Dela inte personlig information om andra','Inlägg som bryter mot reglerna kan tas bort','Upprepade överträdelser kan leda till avstängning']}/>

    <LH2>8. Immateriella rättigheter</LH2>
    <LP>Allt innehåll på Tryggman — texter, artiklar, design och kod — tillhör Tryggman och skyddas av upphovsrätt. Du får inte kopiera eller distribuera innehåll utan tillstånd.</LP>
    <LP>Innehåll du publicerar i community förblir ditt, men du ger Tryggman rätt att visa det på plattformen.</LP>

    <LH2>9. Ansvarsbegränsning</LH2>
    <LP>Tryggman ansvarar inte för:</LP>
    <LUL items={['Skador som uppstår till följd av användning av tjänsten','Fel eller avbrott i tjänsten','Innehåll publicerat av andra användare','Beslut du fattar baserat på information från tjänsten']}/>

    <LH2>10. Avslutande av konto</LH2>
    <LP>Du kan avsluta ditt konto när som helst via Mitt konto eller genom att kontakta oss. Vi förbehåller oss rätten att stänga av konton som bryter mot dessa villkor.</LP>

    <LH2>11. Ändringar av villkor</LH2>
    <LP>Vi kan uppdatera dessa villkor. Du meddelas via e-post vid väsentliga ändringar. Fortsatt användning efter meddelandet innebär acceptans av nya villkor.</LP>

    <LH2>12. Tillämplig lag</LH2>
    <LP>Dessa villkor regleras av svensk lag. Eventuella tvister avgörs i svensk domstol.</LP>

    <LP>Frågor? Kontakta oss på <a href="mailto:kontakt@tryggman.se" style={{color:'#3A7D6E'}}>kontakt@tryggman.se</a></LP>

    <div style={{textAlign:'center',marginTop:'2rem'}}>
      <button className="btn-ghost" onClick={()=>nav('hem')}>← Tillbaka till start</button>
    </div>
  </LegalShell>
);

export const CookiesPage = ({ nav }) => {
  const rows = [
    ['Firebase Auth Token','Nödvändig','Håller dig inloggad','Session / 30 dagar'],
    ['tryggman_chat_disclaimer','Funktionell','Kommer ihåg att du läst disclaimern i AI-chatten','Tills du rensar webbläsaren'],
    ['tryggman_terapeut_disclaimer','Funktionell','Kommer ihåg att du läst disclaimern på terapeut-sidan','Tills du rensar webbläsaren'],
    ['tryggman_health_log','Funktionell','Sparar din måendelogg lokalt i webbläsaren','Permanent (tills du rensar)'],
    ['tryggman_ai_chat','Funktionell','Sparar AI-chatthistorik lokalt (14–30 dagar)','14–30 dagar'],
    ['tryggman_msg_count_*','Funktionell','Räknar antal meddelanden till terapeuten per månad','Per månad'],
    ['tryggman_conv_id','Funktionell','Kopplar dig till din terapeut-konversation','Permanent (tills du rensar)'],
  ];
  return (
    <LegalShell label="Juridisk information" title="Cookies" updated="Senast uppdaterad: Juli 2026"
      highlight="Vi använder minimalt med cookies — bara det som krävs för att tjänsten ska fungera. Inga spårnings- eller reklamcookies.">
      <LH2>Vad är cookies?</LH2>
      <LP>Cookies är små textfiler som lagras i din webbläsare. De hjälper webbplatser att komma ihåg information om ditt besök. Vi använder också localStorage (lokal lagring) för att spara data direkt i din webbläsare utan att skicka det till våra servrar.</LP>

      <LH2>Vilka cookies använder vi?</LH2>
      <div style={{overflowX:'auto',marginBottom:'1rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.82rem'}}>
          <thead>
            <tr>
              {['Namn','Typ','Syfte','Varaktighet'].map(h=>
                <th key={h} style={{textAlign:'left',padding:'0.6rem 0.7rem',color:'#1C2B35',borderBottom:'2px solid rgba(28,43,53,0.15)',fontWeight:600}}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                {r.map((c,j)=><td key={j} style={{padding:'0.6rem 0.7rem',color:'#6B7A85',borderBottom:'1px solid rgba(28,43,53,0.08)',fontWeight:300}}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LH2>Tredjepartscookies</LH2>
      <LP>Vi använder inga spårnings- eller reklamcookies. Våra tredjepartsleverantörer kan sätta egna cookies:</LP>
      <LUL items={[<><strong>Firebase / Google</strong> — för autentisering och databas</>, <><strong>Stripe</strong> — för betalningshantering (endast på priser-sidan och vid checkout)</>, <><strong>Google Fonts</strong> — för typsnitt (ingen spårning)</>]}/>

      <LH2>Din kontroll</LH2>
      <LP>Du kan rensa cookies och localStorage i din webbläsares inställningar. Notera att detta loggar ut dig och rensar din lokalt sparade data (måendelogg, chatthistorik).</LP>
      <LP>De flesta webbläsare låter dig blockera cookies. Nödvändiga cookies krävs för att tjänsten ska fungera.</LP>

      <LH2>Kontakt</LH2>
      <LP>Frågor om vår cookie-användning? Kontakta oss på <a href="mailto:kontakt@tryggman.se" style={{color:'#3A7D6E'}}>kontakt@tryggman.se</a></LP>

      <div style={{textAlign:'center',marginTop:'1.5rem'}}>
        <button className="btn-ghost" onClick={()=>nav('hem')}>← Tillbaka till start</button>
      </div>
    </LegalShell>
  );
};

/* ============================================================
   RADERA KONTO PAGE
   ============================================================ */
export const RaderaKontoPage = ({ nav }) => (
  <LegalShell label="Ditt konto" title="Radera konto" updated="Senast uppdaterad: Augusti 2026"
    highlight="Du har alltid rätt att få ditt konto och din data raderad från Tryggman. Nedan beskriver vi exakt hur du gör och vad som händer med din data.">
    <LH2>Så begär du radering</LH2>
    <LP>Skicka ett mejl till <a href="mailto:kontakt@tryggman.se?subject=Radera%20konto" style={{color:'#3A7D6E'}}>kontakt@tryggman.se</a> med ämnesraden <strong>"Radera konto"</strong>, från den e-postadress som är kopplad till ditt Tryggman-konto.</LP>
    <LP>Ange gärna ditt registrerade användarnamn eller e-postadress i meddelandet så vi snabbt kan hitta rätt konto.</LP>

    <LH2>Vad som händer</LH2>
    <LUL items={[
      'Vi bekräftar mottagandet av din begäran inom 5 arbetsdagar',
      'Ditt konto och tillhörande personuppgifter raderas inom 30 dagar från bekräftad begäran',
      'Om du har en aktiv prenumeration avslutas den samtidigt (ingen ytterligare debitering sker)'
    ]}/>

    <LH2>Vilken data raderas</LH2>
    <LUL items={[
      'Kontouppgifter: e-postadress, namn, lösenord (krypterat)',
      'Chatthistorik med AI-rådgivaren och terapeut-chatten',
      'Måendelogg och annan personlig aktivitetsdata',
      'Community-inlägg kopplade till ditt konto'
    ]}/>

    <LH2>Vilken data kan behöva sparas längre</LH2>
    <LP>Av bokföringsskäl (svensk bokföringslag) sparar vi betalningshistorik i 7 år, men denna avidentifieras från ditt konto så snart det är möjligt. Detta gäller endast transaktionsdata som krävs enligt lag — inte din chatthistorik eller ditt personliga innehåll.</LP>

    <LH2>Alternativ: radera själv via appen</LH2>
    <LP>Du kan också gå till <button onClick={()=>nav('konto')} style={{color:'#3A7D6E',background:'none',border:'none',padding:0,textDecoration:'underline',cursor:'pointer',font:'inherit'}}>Mitt konto</button> och kontakta oss därifrån om du redan är inloggad.</LP>

    <div style={{textAlign:'center',marginTop:'1.5rem'}}>
      <button className="btn-ghost" onClick={()=>nav('hem')}>← Tillbaka till start</button>
    </div>
  </LegalShell>
);