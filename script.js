// Typing Trainer v7 — gauges, live caret, word-by-word dictation, dual-accent voice, interactive learn panel.
const $ = id => document.getElementById(id);
let text="", currentLesson=null, currentLevel="A1";
let startTime=null, timer=null, finished=false, totalErrors=0;
let speechToken=0, selectedVoice=null;
const PROGRESS_KEY="typingTrainerProgressV7";

function rand(arr){return arr[Math.floor(Math.random()*arr.length)]}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
/* CORE HAND-AUTHORED POOLS (22 topics) */
const pools = {
daily:{
A1:{subjects:["A student","A young person","A worker"],actions:["starts the morning with a simple breakfast","walks to a nearby place","cleans the room before lunch"],details:["because the day is busy","and feels ready to work","before meeting a friend"]},
A2:{subjects:["Many people","A busy student","A new worker"],actions:["plan their day before leaving home","try to balance work and free time","make a short list of important tasks"],details:["so they can use their time well","when the schedule becomes difficult","before the evening begins"]},
B1:{subjects:["A balanced routine","A careful schedule","A productive morning"],actions:["can make everyday responsibilities easier","helps people decide what deserves attention","gives a person more control over the day"],details:["especially when several tasks compete for time","without removing the need for flexibility","when unexpected events appear"]},
B2:{subjects:["A thoughtful daily routine","A well-designed schedule","An effective routine"],actions:["can reduce unnecessary decisions","allows people to protect time for important goals","creates a useful structure without becoming rigid"],details:["while still leaving room for unexpected events","when responsibilities become demanding","as long as the plan remains realistic"]},
C1:{subjects:["A deliberate routine","A carefully designed schedule","A sustainable daily system"],actions:["can reduce cognitive pressure while preserving flexibility","allows individuals to allocate attention more deliberately","creates structure without eliminating spontaneous choices"],details:["particularly when competing demands become difficult to prioritize","provided that the system remains adaptable","without assuming that every day will unfold predictably"]}},
education:{
A1:{subjects:["A student","A teacher","A class"],actions:["reads a short text","learns new words","asks a simple question"],details:["during the English lesson","with a friend","before the class ends"]},
A2:{subjects:["A student","An English learner","A teacher"],actions:["reviews new vocabulary every evening","writes a short paragraph after reading","listens to a simple lesson twice"],details:["to remember the language more easily","because regular practice is useful","before taking a short break"]},
B1:{subjects:["Regular practice","A clear study plan","Active learning"],actions:["helps students remember new information","can make difficult subjects easier to understand","encourages learners to notice their own mistakes"],details:["when the learner studies consistently","especially when the material is unfamiliar","without depending only on memorization"]},
B2:{subjects:["Effective study methods","A structured learning plan","Active recall"],actions:["can improve long-term understanding","helps learners identify gaps in their knowledge","allows students to connect new ideas with previous experience"],details:["rather than simply repeating information","when the learner reviews material strategically","particularly in demanding academic subjects"]},
C1:{subjects:["Deliberate learning","A rigorous study strategy","Independent scholarship"],actions:["depends on evaluating information rather than merely collecting it","requires learners to connect evidence with broader concepts","becomes more effective when reflection follows practice"],details:["especially when the subject involves competing explanations","rather than relying on passive exposure","provided that the learner remains willing to revise assumptions"]}},
work:{
A1:{subjects:["A worker","A small team","A manager"],actions:["checks the daily plan","answers an email","helps a customer"],details:["before lunch","at the office","during the morning"]},
A2:{subjects:["A small team","A new employee","A careful manager"],actions:["shares information with colleagues","checks the schedule before starting work","writes down the most important tasks"],details:["so everyone knows what to do","when the office becomes busy","before the next meeting"]},
B1:{subjects:["A productive team","A good manager","A clear work plan"],actions:["can reduce confusion between colleagues","helps people focus on important responsibilities","makes it easier to discuss problems early"],details:["when communication is regular","especially during busy periods","without creating unnecessary meetings"]},
B2:{subjects:["Effective teamwork","A transparent work process","A responsible manager"],actions:["depends on clear expectations and timely communication","can prevent small problems from becoming expensive delays","requires people to understand both goals and responsibilities"],details:["particularly when several departments are involved","before a project reaches a critical stage","while still allowing reasonable flexibility"]},
C1:{subjects:["Organizational effectiveness","A resilient team","A transparent decision-making process"],actions:["depends on aligning individual responsibilities with broader objectives","requires communication mechanisms that expose problems early","can improve performance when accountability is balanced with autonomy"],details:["particularly in complex projects with competing priorities","without turning every decision into a bureaucratic procedure","provided that participants understand the underlying rationale"]}},
technology:{
A1:{subjects:["A phone","A computer","An online tool"],actions:["helps people find information","makes communication easier","allows a student to practice English"],details:["at home","during the day","with a friend"]},
A2:{subjects:["A smartphone","An online platform","A useful application"],actions:["can help people communicate quickly","makes it easier to study from home","allows users to organize simple tasks"],details:["when an internet connection is available","without spending much time","during a busy week"]},
B1:{subjects:["Digital technology","Online platforms","Mobile applications"],actions:["have changed how people communicate and study","give users quick access to information","can make learning more flexible"],details:["although users still need to evaluate information","when the tools are designed well","without replacing every traditional method"]},
B2:{subjects:["Digital platforms","Modern communication tools","Online services"],actions:["have transformed access to information","can increase convenience while creating new distractions","allow people to collaborate across long distances"],details:["although their effects depend on how they are used","particularly when notifications compete for attention","without removing the need for careful judgment"]},
C1:{subjects:["Digital infrastructures","Contemporary platforms","Networked technologies"],actions:["have transformed how information is produced and distributed","can expand access while simultaneously intensifying competition for attention","enable collaboration at a scale that was previously difficult to imagine"],details:["although their social consequences remain contested","particularly when commercial incentives shape design decisions","without eliminating the need for critical evaluation"]}},
travel:{
A1:{subjects:["A traveler","A family","A tourist"],actions:["visits a new city","takes a train","looks at a map"],details:["for the first time","during a holiday","before dinner"]},
A2:{subjects:["A traveler","A small group","A tourist"],actions:["plans a short trip before leaving","checks the weather before packing","visits a local market"],details:["because the city is unfamiliar","to avoid unnecessary problems","during the afternoon"]},
B1:{subjects:["A careful traveler","A flexible itinerary","A well-planned trip"],actions:["can make unfamiliar places easier to explore","allows visitors to change plans when necessary","often includes time for unexpected discoveries"],details:["especially when transportation is uncertain","without making the journey stressful","when the traveler remains flexible"]},
B2:{subjects:["Responsible travel","A carefully planned itinerary","Independent exploration"],actions:["can provide cultural experiences without excessive pressure","allows visitors to balance preparation with spontaneity","becomes more rewarding when travelers learn about local customs"],details:["particularly when the destination is unfamiliar","without reducing the sense of discovery","while respecting the communities being visited"]},
C1:{subjects:["Thoughtful travel","Independent exploration","Cultural immersion"],actions:["can challenge assumptions about unfamiliar societies","allows visitors to interpret places through perspectives different from their own","becomes particularly valuable when observation is combined with historical context"],details:["provided that travelers remain open to revising their expectations","rather than reducing a destination to familiar stereotypes","especially when local voices are taken seriously"]}},
science:{
A1:{subjects:["A scientist","A simple experiment","A student"],actions:["asks a question","looks at the results","records what happens"],details:["in the classroom","during a lesson","before making a conclusion"]},
A2:{subjects:["A simple experiment","A science student","A careful observation"],actions:["can help students understand a new idea","shows why evidence is important","gives learners a chance to test a prediction"],details:["when the steps are clear","before they explain the result","without changing the evidence"]},
B1:{subjects:["Scientific research","A careful experiment","Good evidence"],actions:["helps researchers test explanations","can reveal patterns that are not obvious at first","allows scientists to compare different ideas"],details:["when observations are recorded carefully","before a strong conclusion is made","especially when results are repeated"]},
B2:{subjects:["Reliable scientific evidence","Experimental research","A carefully designed study"],actions:["can distinguish between plausible explanations","helps researchers evaluate competing hypotheses","becomes stronger when independent observations lead to similar results"],details:["although uncertainty can never be removed completely","particularly when the method is transparent","before broad conclusions are accepted"]},
C1:{subjects:["Scientific inquiry","A rigorous research program","Empirical evidence"],actions:["requires explicit assumptions and methods that can be examined by others","can refine explanations when observations contradict previous expectations","gains credibility when results survive independent scrutiny"],details:["particularly in fields where uncertainty is substantial","rather than treating a single observation as decisive","provided that limitations are openly acknowledged"]}},
environment:{
A1:{subjects:["A clean park","A family","A community"],actions:["uses less plastic","plants a tree","keeps the street clean"],details:["to protect nature","during the weekend","for everyone"]},
A2:{subjects:["A local community","A careful family","A small environmental project"],actions:["reduces unnecessary waste","encourages people to recycle","uses less water at home"],details:["because small actions can help","when resources are limited","during everyday life"]},
B1:{subjects:["Environmental protection","A local recycling program","Sustainable habits"],actions:["can reduce unnecessary waste","helps communities use resources more carefully","encourages people to think about long-term effects"],details:["when many people participate","without requiring every solution to be expensive","especially in growing cities"]},
B2:{subjects:["Environmental policy","Sustainable development","Resource management"],actions:["requires choices that consider both present needs and future consequences","can become more effective when communities have reliable information","depends on cooperation between institutions and individuals"],details:["particularly when resources are limited","although priorities may differ between regions","without assuming that one solution fits every place"]},
C1:{subjects:["Environmental governance","Long-term sustainability","Climate policy"],actions:["requires institutions to reconcile immediate economic pressures with long-term ecological constraints","becomes more credible when policy is evaluated against measurable outcomes","depends on cooperation across jurisdictions that do not always share the same incentives"],details:["particularly when uncertainty complicates prediction","rather than relying on isolated interventions","provided that distributional consequences are also considered"]}},
culture:{
A1:{subjects:["A local festival","A family tradition","A community event"],actions:["brings people together","includes music and food","helps children learn about the past"],details:["every year","in the town","during the holiday"]},
A2:{subjects:["A cultural festival","A family tradition","A local museum"],actions:["helps people understand local history","gives visitors a chance to learn about traditions","brings different generations together"],details:["during special events","when people share their stories","through music, food, and art"]},
B1:{subjects:["Cultural traditions","Community events","Local history"],actions:["can help people understand where they come from","often change as younger generations reinterpret them","provide opportunities for people with different experiences to meet"],details:["without remaining exactly the same","especially in diverse communities","when people discuss their meaning openly"]},
B2:{subjects:["Cultural identity","Shared traditions","Public cultural spaces"],actions:["can change when communities encounter new influences","often contain different interpretations of the same history","can encourage dialogue between generations"],details:["although disagreements about meaning may remain","particularly in diverse societies","without requiring everyone to share one interpretation"]},
C1:{subjects:["Cultural identity","Collective memory","Public representations of history"],actions:["is continually negotiated rather than simply inherited","can become contested when different groups remember the same events differently","often changes as institutions decide which narratives receive public attention"],details:["particularly in pluralistic societies","without implying that every interpretation has equal evidential support","when historical evidence is interpreted through present concerns"]}},
law:{
A1:{subjects:["A rule","A judge","A citizen"],actions:["helps people understand what is allowed","reads a simple law","asks for legal advice"],details:["in a fair society","before making a decision","when a problem appears"]},
A2:{subjects:["A legal rule","A court","A citizen"],actions:["helps people understand their rights","looks at the facts before making a decision","may ask a lawyer for advice"],details:["when a disagreement occurs","before a case is decided","if the situation is unclear"]},
B1:{subjects:["A legal system","A court","A clear rule"],actions:["provides a framework for resolving disputes","helps decision-makers apply general principles to specific facts","can protect people when procedures are followed"],details:["although difficult cases may require interpretation","when the relevant evidence is available","without guaranteeing that every disagreement will disappear"]},
B2:{subjects:["Legal reasoning","A judicial decision","A statutory rule"],actions:["requires attention to both language and context","may depend on how general principles apply to specific facts","can become controversial when reasonable interpretations compete"],details:["particularly when the wording is ambiguous","although precedent may influence the analysis","without eliminating the need for argument"]},
C1:{subjects:["Legal interpretation","A constitutional principle","Judicial reasoning"],actions:["requires an assessment of text, precedent, institutional purpose, and competing principles","can become difficult when formally valid rules produce conflicting consequences","often depends on distinguishing what a provision states from what it is taken to imply"],details:["particularly when different interpretive methods point in different directions","without assuming that ambiguity can always be resolved mechanically","provided that the reasoning remains transparent"]}},
communication:{
A1:{subjects:["A good conversation","A clear message","A friendly question"],actions:["helps people understand each other","makes a discussion easier","can prevent a small problem"],details:["at school","at work","between friends"]},
A2:{subjects:["Clear communication","A polite message","A useful conversation"],actions:["can prevent unnecessary confusion","helps people explain what they need","makes cooperation easier"],details:["when people listen carefully","especially during a disagreement","without using difficult language"]},
B1:{subjects:["Effective communication","Active listening","A clear explanation"],actions:["can reduce misunderstandings","helps people respond to the real question","makes difficult conversations more productive"],details:["when participants listen before reacting","especially when expectations are different","without requiring complete agreement"]},
B2:{subjects:["Effective communication","Careful dialogue","A difficult conversation"],actions:["depends on both clarity and attention to the other person's perspective","can improve cooperation when disagreement is expressed precisely","requires people to distinguish facts from assumptions"],details:["particularly when emotions are strong","without treating disagreement as personal hostility","when the purpose of the discussion is clear"]},
C1:{subjects:["Deliberative communication","Constructive disagreement","Institutional dialogue"],actions:["depends on participants making assumptions explicit and responding to the strongest version of competing arguments","can improve collective decisions when disagreement is treated as information rather than merely as conflict","requires a distinction between persuasive language and evidential support"],details:["particularly when the stakes are high","without reducing complex disagreement to personal motives","provided that participants remain willing to revise their claims"]}}
};

/* GRAMMAR BY LEVEL */
const grammarByLevel = {
A1:"Present simple and basic sentence patterns.",
A2:"Present and past forms, common connectors, and everyday sentence structures.",
B1:"Present perfect, linking words, comparison, and common complex sentences.",
B2:"Relative clauses, contrast, modality, and more formal sentence structures.",
C1:"Complex clauses, academic vocabulary, hedging, and precise logical relationships."
};

/* ARABIC DICTIONARY + TRANSLATION + TOOLTIP */
const arabicDictionary={"family":"العائلة","parents":"الوالدان","younger":"أصغر سنًا","together":"معًا","morning":"الصباح","breakfast":"الإفطار","early":"مبكر","evening":"المساء","learning":"التعلم","english":"الإنجليزية","communicate":"يتواصل / التواصل","different":"مختلف","practice":"الممارسة","podcasts":"البودكاست","busy":"مشغول","prepared":"جهّز / أعدّ","quickly":"بسرعة","arrived":"وصل","technology":"التكنولوجيا","access":"الوصول","platforms":"المنصات","improving":"التحسن","rarely":"نادرًا","mistakes":"الأخطاء","progress":"التقدم","expand":"يوسّع","complex":"معقد","perspectives":"وجهات النظر","thoughtful":"متأمل / متأنٍ","unavoidable":"لا مفر منه","failure":"الفشل","examine":"يفحص / يدرس","experience":"الخبرة / التجربة","attention":"الانتباه","intensely":"بشدة","valuable":"قيّم / ثمين","encourage":"يشجع","evaluating":"تقييم","evidence":"دليل / أدلة","assumptions":"افتراضات","revise":"يراجع / يعدّل","health":"الصحة","healthy":"صحي","wellness":"العافية","food":"الطعام","cooking":"الطبخ","finance":"التمويل","money":"المال","history":"التاريخ","geography":"الجغرافيا","psychology":"علم النفس","philosophy":"الفلسفة","media":"الإعلام","sports":"الرياضة","economics":"الاقتصاد","ethics":"الأخلاق","social":"اجتماعي","issues":"قضايا","student":"طالب","students":"طلاب","work":"العمل","business":"الأعمال","travel":"السفر","science":"العلم","environment":"البيئة","culture":"الثقافة","society":"المجتمع","law":"القانون","communication":"التواصل","education":"التعليم","important":"مهم","information":"المعلومات","knowledge":"المعرفة","decision":"القرار","decisions":"القرارات","choice":"الاختيار","choices":"الخيارات","question":"السؤال","answer":"الإجابة","people":"الناس","future":"المستقبل","past":"الماضي","present":"الحاضر","understand":"يفهم","understanding":"الفهم","reason":"السبب","reasons":"الأسباب","because":"لأن","through":"من خلال","without":"بدون","between":"بين","during":"خلال","often":"غالبًا","especially":"خصوصًا","regular":"منتظم","improve":"يحسن","difficult":"صعب","simple":"بسيط","useful":"مفيد","effective":"فعال","careful":"حذر","carefully":"بحذر","fair":"عادل","true":"صحيح","false":"خاطئ","public":"عام","private":"خاص","local":"محلي","global":"عالمي","modern":"حديث","traditional":"تقليدي","market":"السوق","price":"السعر","prices":"الأسعار","customer":"العميل","customers":"العملاء","community":"المجتمع المحلي","government":"الحكومة","theory":"نظرية","training":"تدريب","value":"قيمة","vocabulary":"مفردات"};
function getArabicMeaning(word){
  const w=String(word||'').toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g,'');
  if(!w)return '';
  if(arabicDictionary[w])return arabicDictionary[w];
  // Try common English inflections so that learned forms can reuse the base entry.
  const candidates=[];
  if(w.endsWith('ies') && w.length>4)candidates.push(w.slice(0,-3)+'y');
  if(w.endsWith('es') && w.length>4)candidates.push(w.slice(0,-2));
  if(w.endsWith('s') && w.length>3)candidates.push(w.slice(0,-1));
  if(w.endsWith('ing') && w.length>5){candidates.push(w.slice(0,-3)); candidates.push(w.slice(0,-3)+'e');}
  if(w.endsWith('ed') && w.length>4){candidates.push(w.slice(0,-2)); candidates.push(w.slice(0,-1));}
  if(w.endsWith('ly') && w.length>4)candidates.push(w.slice(0,-2));
  for(const c of candidates){if(arabicDictionary[c])return arabicDictionary[c];}
  return '';
}

// Robust translation fallback: local dictionary first, then an online English→Arabic
// lookup when the browser is online. Results are cached locally for future offline use.
const translationCacheKey='typingTrainerArabicCacheV1';
let translationCache={};
try{translationCache=JSON.parse(localStorage.getItem(translationCacheKey)||'{}')||{}}catch(e){translationCache={};}
function saveTranslationCache(){try{localStorage.setItem(translationCacheKey,JSON.stringify(translationCache));}catch(e){}}
function onlineTranslation(word){
  const q=encodeURIComponent(word);
  const url=`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${q}`;
  return fetch(url,{method:'GET',mode:'cors'}).then(r=>{if(!r.ok)throw new Error('translation request failed');return r.json()})
    .then(data=>{
      const parts=Array.isArray(data?.[0])?data[0]:[];
      const meaning=parts.map(x=>Array.isArray(x)?x[0]:'').filter(Boolean).join(' ').trim();
      if(!meaning)throw new Error('empty translation');
      translationCache[word.toLowerCase()]=meaning;saveTranslationCache();return meaning;
    });
}
function findMeaning(word){
  const w=String(word||'').toLowerCase();
  return getArabicMeaning(w)||translationCache[w]||'';
}

// Lightweight hover tooltip. It does not alter the typing engine.
(function installTranslationTooltip(){
  let tip=null, activeWord='', requestId=0;
  function ensure(){
    if(tip)return tip;
    tip=document.createElement('div');
    tip.id='arabicHoverTip';
    tip.style.cssText='position:fixed;z-index:99999;display:none;max-width:320px;padding:9px 12px;border:1px solid #555;border-radius:8px;background:#111;color:#fff;font:14px/1.45 Arial,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);pointer-events:none;text-align:right;direction:rtl;';
    document.body.appendChild(tip);return tip;
  }
  function position(e){
    const t=ensure(), pad=12; t.style.left=Math.min(Math.max(pad,e.clientX+12),window.innerWidth-t.offsetWidth-pad)+'px';
    t.style.top=Math.min(Math.max(pad,e.clientY+18),window.innerHeight-t.offsetHeight-pad)+'px';
  }
  document.addEventListener('mouseover',async e=>{
    const el=e.target.closest?.('.practice-word');
    if(!el||!document.body.contains(el))return;
    if(el.contains(e.relatedTarget))return;
    const word=el.dataset.word||el.textContent.trim(); activeWord=word; const id=++requestId;
    const t=ensure(); const local=findMeaning(word);
    t.innerHTML=local?`<b dir="ltr">${word}</b><br><span>${local}</span>`:`<b dir="ltr">${word}</b><br><span>جاري البحث عن المعنى…</span>`;
    t.style.display='block'; position(e);
    if(local)return;
    try{
      if(!navigator.onLine)throw new Error('offline');
      const meaning=await onlineTranslation(word);
      if(id!==requestId||activeWord!==word)return;
      t.innerHTML=`<b dir="ltr">${word}</b><br><span>${meaning}</span>`; position(e);
    }catch(err){
      if(id!==requestId||activeWord!==word)return;
      t.innerHTML=`<b dir="ltr">${word}</b><br><span>الترجمة غير متاحة حاليًا</span>`; position(e);
    }
  });
  document.addEventListener('mousemove',e=>{if(tip?.style.display==='block')position(e);});
  document.addEventListener('mouseout',e=>{
    const el=e.target.closest?.('.practice-word');
    if(el&&!el.contains(e.relatedTarget)){activeWord='';requestId++;if(tip)tip.style.display='none';}
  });
})();
Object.assign(arabicDictionary,{"cybersecurity":"الأمن السيبراني","privacy":"الخصوصية","digital":"رقمي","literacy":"محو الأمية / الإلمام","ecommerce":"التجارة الإلكترونية","shopping":"التسوق","collaboration":"التعاون","remote":"عن بُعد","artificial":"اصطناعي","intelligence":"الذكاء","robotics":"الروبوتات","innovation":"الابتكار","engineering":"الهندسة","internet":"الإنترنت","software":"البرمجيات","platforms":"المنصات","missions":"المهمات","industries":"الصناعات","mental":"نفسي","anxiety":"القلق","stigma":"وصمة العار","nutrition":"التغذية","nutrients":"العناصر الغذائية","nutritional":"غذائي","exercise":"التمرين","fitness":"اللياقة","concentration":"التركيز","sleep":"النوم","medicine":"الطب","medical":"طبي","healthcare":"الرعاية الصحية","diagnosis":"التشخيص","treatment":"العلاج","outbreaks":"تفشي الأمراض","investing":"الاستثمار","savings":"المدخرات","trade":"التجارة","economy":"الاقتصاد","economies":"الاقتصادات","economic":"اقتصادي","spending":"الإنفاق","consumer":"المستهلك","climate":"المناخ","ecosystems":"الأنظمة البيئية","wildlife":"الحياة البرية","habitats":"الموائل","endangered":"مهدد بالانقراض","conservation":"الحفاظ","disasters":"الكوارث","preparedness":"الاستعداد","resilience":"المرونة","infrastructure":"البنية التحتية","oceans":"المحيطات","marine":"بحري","biodiversity":"التنوع الحيوي","pollution":"التلوث","overfishing":"الصيد الجائر","weather":"الطقس","seasons":"الفصول","seasonal":"موسمي","traditions":"التقاليد","festivals":"المهرجانات","museums":"المتاحف","artifacts":"القطع الأثرية","literature":"الأدب","authors":"الكتّاب","imagination":"الخيال","democratic":"ديمقراطي","government":"الحكومة","governments":"الحكومات","transparency":"الشفافية","accountability":"المساءلة","civic":"مدني","participation":"المشاركة","rights":"الحقوق","dignity":"الكرامة","freedom":"الحرية","justice":"العدالة","punishment":"العقاب","rehabilitation":"إعادة التأهيل","speaking":"التحدث","audience":"الجمهور","audiences":"الجماهير","emotional":"عاطفي","emotions":"المشاعر","empathy":"التعاطف","management":"الإدارة","prioritize":"يرتب الأولويات","motivation":"الدافع","setbacks":"النكسات","creative":"إبداعي","creativity":"الإبداع","journalism":"الصحافة","verifying":"التحقق","video":"فيديو","games":"الألعاب","players":"اللاعبون","tourism":"السياحة","visitor":"الزائر","transportation":"النقل","mobility":"التنقل","adventure":"المغامرة","precautions":"الاحتياطات","cultures":"الثقافات","customs":"العادات","olympic":"أولمبي","athletes":"الرياضيون","recreation":"الترفيه","discipline":"الانضباط","equipment":"المعدات","civilizations":"الحضارات","ancient":"قديم","monuments":"الآثار","conflicts":"النزاعات","borders":"الحدود","generations":"الأجيال","figures":"الشخصيات","exploration":"الاستكشاف","geographic":"جغرافي","reasoning":"الاستدلال","logical":"منطقي","arguments":"الحجج","behavior":"السلوك","happiness":"السعادة","relationships":"العلاقات","poverty":"الفقر","inequality":"عدم المساواة","employment":"التوظيف","population":"السكان","demand":"الطلب","resources":"الموارد","migration":"الهجرة","communities":"المجتمعات","farming":"الزراعة","agriculture":"الزراعة","productivity":"الإنتاجية","supply":"الإمداد","chains":"سلاسل","distribution":"التوزيع","rural":"ريفي","architecture":"العمارة","neighborhoods":"الأحياء","traffic":"حركة المرور","housing":"الإسكان","affordable":"ميسور التكلفة","visual":"بصري","photography":"التصوير الفوتوغرافي","design":"التصميم","function":"الوظيفة","filmmaking":"صناعة الأفلام","storytelling":"سرد القصص","performance":"الأداء","genres":"الأنواع","households":"الأسر","routines":"الروتين اليومي","parenting":"تربية الأطفال","fashion":"الموضة","identity":"الهوية","minimalist":"أنصار البساطة","possessions":"الممتلكات","distractions":"المشتتات","leadership":"القيادة","entrepreneurship":"ريادة الأعمال","careers":"المهن","workplace":"مكان العمل","retention":"الاحتفاظ","teams":"الفرق","flexibility":"المرونة","university":"الجامعة","independently":"باستقلالية","exams":"الاختبارات","preparation":"التحضير","onlinelearning":"التعلم عبر الإنترنت","vocabulary":"المفردات","stress":"التوتر","confidence":"الثقة","curiosity":"الفضول","habits":"العادات","science":"العلم","technology":"التكنولوجيا","modern":"حديث","global":"عالمي","local":"محلي","urban":"حضري","cities":"المدن","space":"الفضاء","astronomy":"علم الفلك","security":"الأمن","threats":"التهديدات","awareness":"الوعي"});
const EXTRA_LEVEL_VARIANTS={
A1:[['A simple example','helps people learn new ideas','in daily life'],['An easy habit','makes a normal day better','for many people'],['A small change','can help someone feel better','after a short time'],['A short lesson','teaches something new and useful','during the week'],['A daily task','helps someone stay organized','without much effort'],['A short activity','gives people a useful skill','over time'],['A helpful idea','makes life a little easier','each day'],['A new friend','can make a difficult day better','very quickly'],['A quiet moment','helps a person think clearly','before a busy day'],['A small step','leads to a bigger change','after some practice']],
A2:[['A useful habit','can make everyday tasks easier','when practiced regularly'],['A helpful routine','gives people more free time','after a few weeks'],['A clear plan','makes a busy day less stressful','most of the time'],['A new skill','becomes easier with regular practice','over several months'],['A simple strategy','can reduce daily stress','without extra effort'],['A short break','helps people focus again','during a long day'],['An extra effort','often leads to better results','after some practice'],['A clear goal','makes it easier to stay motivated','throughout the week'],['A quick decision','can change the outcome of a busy day','in an unexpected way'],['A supportive friend','can make a difficult moment easier','when things go wrong']],
B1:[['A thoughtful approach','can improve understanding and decision-making','when people pay attention'],['A balanced habit','often leads to better results over time','if it is repeated consistently'],['A well-planned routine','helps people manage stress and stay organized','especially during busy periods'],['A consistent practice','can gradually build confidence and skill','even when progress feels slow'],['A realistic goal','can motivate people to keep trying','even when progress is slow'],['A small improvement','often leads to noticeable change','over several weeks'],['A shared responsibility','makes cooperation easier to maintain','when expectations are clear'],['An honest conversation','can resolve a misunderstanding quickly','before it becomes serious'],['A flexible plan','allows people to adjust when circumstances change','without losing overall direction'],['A consistent effort','tends to produce better long-term results','compared with occasional attempts']],
B2:[['A practical approach','requires considering several factors and possible consequences','in complex situations'],['A disciplined routine','can produce noticeable results, although progress is rarely immediate','across a longer period'],['A flexible strategy','allows people to adapt when circumstances change unexpectedly','without losing sight of the main goal'],['A well-informed decision','depends on weighing short-term convenience against long-term benefit','particularly when resources are limited'],['A carefully considered choice','can prevent unnecessary complications later','even when the benefits are not immediate'],['A well-timed decision','often determines whether an opportunity is used effectively','regardless of how much planning preceded it'],['A balanced perspective','helps people evaluate competing priorities more fairly','particularly under pressure'],['A realistic assessment','can reveal weaknesses that were previously overlooked','before they become costly'],['A collaborative approach','tends to produce more durable solutions','although it usually requires more initial coordination'],['A measured response','can defuse a tense situation more effectively than a reactive one','especially when emotions are involved']],
C1:[['A careful analysis','requires distinguishing evidence, assumptions, and competing explanations','when the issue is complex'],['A rigorous evaluation','depends on separating correlation from causation before drawing conclusions','particularly when data is incomplete'],['A nuanced perspective','acknowledges competing priorities without oversimplifying the trade-offs involved','especially in contested situations'],['A deliberate strategy','balances immediate constraints against longer-term structural considerations','provided that assumptions are periodically reexamined'],['A rigorous assessment','requires distinguishing superficial correlations from genuine causal relationships','before drawing firm conclusions'],['A carefully calibrated strategy','balances short-term constraints against longer-term structural considerations','while remaining open to revision'],['A nuanced evaluation','acknowledges the limitations of available evidence rather than overstating its certainty','particularly in contested domains'],['A disciplined methodology','reduces the risk of unwarranted generalization','even when preliminary results appear compelling'],['A reflective practice','encourages practitioners to reassess assumptions in light of new evidence','rather than defending initial positions indefinitely'],['A principled compromise','reconciles competing interests without dismissing the legitimacy of either','provided that the underlying trade-offs are made explicit']]
};
const extraBase={health:["Healthy habits","can improve physical and mental well-being","over time"],food:["Home cooking","can connect food with health, culture, and family","in everyday life"],finance:["Personal budgeting","helps people plan spending and prepare for future needs","over time"],history:["Historical research","helps people understand how societies changed","when several sources are compared"],geography:["Regional development","is shaped by geography, infrastructure, and human decisions","over long periods"],psychology:["Human behavior","is influenced by attention, experience, habits, and social context","in many situations"],philosophy:["Philosophical reasoning","helps people examine assumptions and compare explanations","when questions are difficult"],media:["Digital journalism","requires audiences to evaluate sources carefully","during uncertain events"],sports:["Regular training","can improve physical skills, confidence, and cooperation","over time"],economics:["Market competition","is influenced by prices, information, incentives, and consumer choices","in different markets"],ethics:["Ethical reasoning","can require comparing duties, consequences, and values","when choices are difficult"],social:["Community cooperation","can make collective problems easier to manage","when people communicate clearly"],
home:['A well-organized home','can make daily routines calmer and more efficient','when responsibilities are shared'],shopping:['Careful shopping habits','help people compare prices and avoid unnecessary spending','especially during busy seasons'],family:['Strong family relationships','depend on regular communication, patience, and mutual support','even during difficult periods'],fashion:['Personal style','allows people to express identity through clothing and choices','in different social settings'],parenting:['Attentive parenting','helps children build confidence, curiosity, and healthy habits','during early years'],habits:['Small daily habits','can gradually shape long-term health and productivity','when practiced consistently'],minimalism:['A minimalist lifestyle','focuses on reducing unnecessary possessions and daily distractions','to create more time for what matters'],languagelearning:['Consistent language practice','helps learners build vocabulary and confidence over time','even with limited daily study'],studyskills:['Effective study skills','allow students to retain information and manage their time','during demanding academic periods'],exams:['Careful exam preparation','reduces anxiety and improves performance under time pressure','when practice tests are used regularly'],highereducation:['University education','gives students the chance to specialize and think independently','before entering a career'],onlinelearning:['Online courses','allow learners to study flexibly from any location','when self-discipline is maintained'],careers:['A clear career plan','helps people set goals and evaluate new opportunities','as their skills and interests develop'],entrepreneurship:['Starting a new business','requires careful planning, resourcefulness, and tolerance for risk','especially in competitive markets'],leadership:['Effective leadership','depends on clear communication, trust, and the ability to make difficult decisions','during periods of change'],remotework:['Remote work','offers flexibility but requires discipline and clear communication','when teams are spread across locations'],workplaceculture:['A positive workplace culture','can improve motivation, cooperation, and long-term retention','even during stressful periods'],ai:['Artificial intelligence','is changing how people search for information, write, and make decisions','across many industries'],space:['Space exploration','expands scientific knowledge and challenges engineering limits','as new missions are planned'],internet:['The internet','connects billions of people and reshapes how information spreads','in ways that are still being understood'],robotics:['Modern robotics','combines mechanical design with software to automate repetitive tasks','in factories and homes alike'],innovation:['Technological innovation','often begins with a simple idea that solves an everyday problem','before it reaches a wider market'],cybersecurity:['Basic cybersecurity habits','help people protect personal information from online threats','as more daily activity moves online'],onlineprivacy:['Online privacy','depends on understanding what data is collected and how it is used','especially on social platforms'],digitalliteracy:['Digital literacy','helps people evaluate online information and use technology responsibly','in both work and daily life'],ecommerce:['Online shopping','has changed how people compare prices and make purchasing decisions','across many different markets'],remotecollaboration:['Remote collaboration tools','allow distributed teams to share work and communicate in real time','despite differences in location and time zone'],mentalhealth:['Mental health awareness','encourages people to recognize stress and seek support when needed','without unnecessary stigma'],nutrition:['A balanced diet','provides the energy and nutrients the body needs to function well','when meals are planned thoughtfully'],fitness:['Regular exercise','strengthens the body and can improve mood and concentration','when combined with adequate rest'],sleep:['Consistent sleep habits','allow the body and mind to recover from daily activity','especially during demanding weeks'],medicine:['Modern medicine','relies on research, careful diagnosis, and evidence-based treatment','to improve patient outcomes'],publichealth:['Public health systems','aim to prevent disease and respond quickly during outbreaks','across different communities'],investing:['Long-term investing','allows people to grow their savings while accepting some risk','when decisions are based on research'],trade:['International trade','allows countries to exchange goods and specialize in what they produce best','despite occasional disagreements over policy'],consumereconomy:['Consumer spending','reflects confidence in the economy and influences business decisions','during different economic cycles'],climatechange:['Climate change','is altering weather patterns and affecting ecosystems around the world','according to long-term scientific observation'],wildlife:['Wildlife conservation','protects endangered species and preserves natural habitats','despite growing pressure from human development'],disasters:['Natural disasters','test the preparedness of communities and the resilience of infrastructure','when warning systems fail to reach everyone'],oceans:['Healthy oceans','support marine biodiversity and regulate the global climate','when pollution and overfishing are controlled'],weather:['Local weather patterns','affect daily plans, agriculture, and travel decisions','throughout the year'],seasons:['Seasonal change','shapes clothing, food, and daily routines in many cultures','as the year progresses'],traditions:['Cultural traditions and festivals','bring communities together and preserve shared history','across different generations'],art:['Museums and public art','give people access to creative works and historical artifacts','regardless of their background'],music:['Music','connects people across cultures and expresses emotions that words sometimes cannot','in nearly every society'],literature:['Literature','allows readers to explore other perspectives and reflect on universal experiences','across different time periods'],government:['Democratic government','depends on transparency, accountability, and active civic participation','even when opinions strongly differ'],humanrights:['Human rights protections','aim to guarantee basic dignity and freedom for every person','regardless of where they live'],crime:['The justice system','seeks to balance punishment, rehabilitation, and public safety','when evidence is carefully examined'],publicspeaking:['Confident public speaking','requires preparation, clear structure, and awareness of the audience','even when the topic is difficult'],emotionalintelligence:['Emotional intelligence','helps people recognize their own feelings and respond to others with empathy','during stressful conversations'],timemanagement:['Good time management','allows people to prioritize important tasks and reduce unnecessary stress','when unexpected demands appear'],motivation:['Personal motivation','often grows stronger when goals are specific and progress is visible','even after early setbacks'],creativity:['Creative thinking','allows people to solve problems in unexpected ways','when they are willing to take small risks'],movies:['Films and television','tell stories that can influence public opinion and reflect cultural values','across different genres'],socialmediatrends:['Social media trends','spread quickly and can shape public conversation within hours','before fading just as fast'],journalism:['Responsible journalism','requires verifying facts and presenting multiple perspectives','especially during breaking news events'],gaming:['Video games','combine storytelling, strategy, and technology to create interactive experiences','for players of many ages'],tourism:['Sustainable tourism','can support local economies while protecting natural and cultural sites','when visitor numbers are managed carefully'],transportation:['Modern transportation systems','connect distant places and shape how cities grow','as demand for mobility increases'],adventure:['Outdoor adventure','challenges people physically and mentally while building confidence','when proper safety precautions are followed'],worldcultures:['Learning about world cultures','helps people understand different customs, values, and ways of life','before or during international travel'],olympics:['The Olympic Games','bring together athletes from around the world to compete under shared rules','every few years'],outdoorrecreation:['Outdoor recreation','offers a break from daily routines and encourages physical activity','regardless of the season'],teamsports:['Team sports','teach cooperation, discipline, and the value of shared goals','through practice and competition'],extremesports:['Extreme sports','push athletes to test their limits under carefully managed risk','with specialized training and equipment'],ancientcivilizations:['Ancient civilizations','developed writing systems, laws, and monuments that still influence modern society','despite existing thousands of years ago'],wars:['Historical conflicts','reshaped borders, governments, and the lives of millions of people','with consequences that lasted for generations'],historicalfigures:['Influential historical figures','made decisions that changed the course of politics, science, or culture','often under difficult circumstances'],exploration:['Early exploration','expanded geographic knowledge and connected distant regions of the world','despite significant risk and uncertainty'],logic:['Logical reasoning','helps people identify weak arguments and avoid common thinking errors','when evaluating competing claims'],humanbehavior:['The study of human behavior','reveals patterns in how people make decisions under different conditions','across a wide range of situations'],happiness:['Lasting happiness','tends to depend more on relationships and meaning than on material possessions','according to long-term research'],poverty:['Reducing poverty','requires improving access to education, healthcare, and stable employment','especially in developing regions'],population:['Population growth','affects demand for housing, resources, and public services','differently across regions'],globalhealth:['Global health initiatives','aim to prevent disease outbreaks and improve access to basic medical care','particularly in underserved communities'],migration:['Human migration','reshapes communities and economies as people search for safety or opportunity','across borders and generations'],farming:['Modern farming','must balance productivity with the long-term health of soil and water resources','as global demand for food increases'],foodsecurity:['Food security','depends on stable supply chains, fair distribution, and resilient agriculture','especially during crises'],sustainablefood:['Sustainable food production','reduces environmental impact while still meeting nutritional needs','through improved farming methods'],rurallife:['Rural communities','often rely on agriculture and close social ties despite limited access to services','compared with larger cities'],citylife:['City life','offers convenience and opportunity but can also bring crowding and higher costs','especially in growing urban areas'],architecture:['Thoughtful architecture','shapes how people experience public and private spaces','long after a building is completed'],urbanplanning:['Careful urban planning','can reduce traffic, improve safety, and create more livable neighborhoods','as cities continue to grow'],housing:['Affordable housing','remains a major challenge in many growing cities','as demand continues to outpace supply'],visualarts:['Visual arts','allow people to express ideas and emotions through images rather than words','across many different styles'],photography:['Photography','captures moments and perspectives that might otherwise be forgotten','with increasingly accessible technology'],design:['Good design','balances function and appearance to solve real problems for users','whether in a product or a space'],creativewriting:['Creative writing','allows authors to explore imagination, emotion, and language in new ways','across different forms and genres'],filmmaking:['Filmmaking','combines visual storytelling, sound, and performance to create a shared experience','for audiences of all backgrounds']};
for(const [t,base] of Object.entries(extraBase)){pools[t]={};for(const lvl of ['A1','A2','B1','B2','C1']){const vs=EXTRA_LEVEL_VARIANTS[lvl];pools[t][lvl]={subjects:[base[0],base[0],...vs.map(v=>v[0])],actions:[base[1],base[1],...vs.map(v=>v[1])],details:[base[2],base[2],...vs.map(v=>v[2])]}}}
const TOPIC_LABELS={daily:'Daily Life',food:'Food & Cooking',home:'Home & Household',shopping:'Shopping & Consumer Habits',family:'Family & Relationships',fashion:'Fashion & Style',parenting:'Parenting',habits:'Personal Habits & Routines',minimalism:'Minimalism',education:'Education',languagelearning:'Language Learning',studyskills:'Study Skills',exams:'Exams & Testing',highereducation:'Higher Education',onlinelearning:'Online Learning',work:'Work & Business',careers:'Careers & Job Hunting',entrepreneurship:'Entrepreneurship',leadership:'Leadership & Management',remotework:'Remote Work',workplaceculture:'Workplace Culture',technology:'Technology',science:'Science',ai:'Artificial Intelligence',space:'Space & Astronomy',internet:'Internet & Social Media',robotics:'Robotics',innovation:'Innovation & Invention',cybersecurity:'Cybersecurity',onlineprivacy:'Online Privacy',digitalliteracy:'Digital Literacy',ecommerce:'Online Shopping & E-commerce',remotecollaboration:'Remote Collaboration Tools',health:'Health & Wellness',mentalhealth:'Mental Health',nutrition:'Nutrition',fitness:'Fitness & Exercise',sleep:'Sleep & Rest',medicine:'Medicine & Healthcare',publichealth:'Public Health',finance:'Money & Personal Finance',economics:'Economics',investing:'Investing & Markets',trade:'Global Trade',consumereconomy:'Consumer Economy',environment:'Environment',geography:'Geography',climatechange:'Climate Change',wildlife:'Wildlife & Animals',disasters:'Natural Disasters',oceans:'Oceans & Marine Life',weather:'Weather',seasons:'Seasons',culture:'Culture & Society',traditions:'Traditions & Festivals',art:'Art & Museums',music:'Music',literature:'Literature',social:'Social Issues',law:'Law & Critical Thinking',ethics:'Ethics',government:'Government & Politics',humanrights:'Human Rights',crime:'Crime & Justice',communication:'Communication',publicspeaking:'Public Speaking',emotionalintelligence:'Emotional Intelligence',timemanagement:'Time Management',motivation:'Motivation & Goals',creativity:'Creativity',media:'Media & News',movies:'Movies & Television',socialmediatrends:'Social Media Trends',journalism:'Journalism',gaming:'Video Games',travel:'Travel',tourism:'Tourism',transportation:'Transportation',adventure:'Adventure & Outdoors',worldcultures:'World Cultures',sports:'Sports',olympics:'Olympic Games',outdoorrecreation:'Outdoor Recreation',teamsports:'Team Sports',extremesports:'Extreme Sports',history:'History',ancientcivilizations:'Ancient Civilizations',wars:'Wars & Conflicts',historicalfigures:'Historical Figures',exploration:'Exploration & Discovery',philosophy:'Philosophy',psychology:'Psychology',logic:'Logic & Reasoning',humanbehavior:'Human Behavior',happiness:'Happiness & Wellbeing',poverty:'Poverty & Inequality',population:'Population & Demographics',globalhealth:'Global Health',migration:'Migration',farming:'Farming & Agriculture',foodsecurity:'Food Security',sustainablefood:'Sustainable Food',rurallife:'Rural Life',citylife:'City Life',architecture:'Architecture & Design',urbanplanning:'Urban Planning',housing:'Housing',visualarts:'Visual Arts',photography:'Photography',design:'Design',creativewriting:'Creative Writing',filmmaking:'Filmmaking'};
function topicLabel(t){return TOPIC_LABELS[t]||t}
const STABLE_TOPIC_DATA={'Everyday Life':[{value:'daily',label:'Daily Life'},{value:'food',label:'Food & Cooking'},{value:'home',label:'Home & Household'},{value:'shopping',label:'Shopping & Consumer Habits'},{value:'family',label:'Family & Relationships'},{value:'fashion',label:'Fashion & Style'},{value:'parenting',label:'Parenting'},{value:'habits',label:'Personal Habits & Routines'},{value:'minimalism',label:'Minimalism'}],'Education & Learning':[{value:'education',label:'Education'},{value:'languagelearning',label:'Language Learning'},{value:'studyskills',label:'Study Skills'},{value:'exams',label:'Exams & Testing'},{value:'highereducation',label:'Higher Education'},{value:'onlinelearning',label:'Online Learning'}],'Work & Career':[{value:'work',label:'Work & Business'},{value:'careers',label:'Careers & Job Hunting'},{value:'entrepreneurship',label:'Entrepreneurship'},{value:'leadership',label:'Leadership & Management'},{value:'remotework',label:'Remote Work'},{value:'workplaceculture',label:'Workplace Culture'}],'Science & Technology':[{value:'technology',label:'Technology'},{value:'science',label:'Science'},{value:'ai',label:'Artificial Intelligence'},{value:'space',label:'Space & Astronomy'},{value:'internet',label:'Internet & Social Media'},{value:'robotics',label:'Robotics'},{value:'innovation',label:'Innovation & Invention'}],'Digital Life & Security':[{value:'cybersecurity',label:'Cybersecurity'},{value:'onlineprivacy',label:'Online Privacy'},{value:'digitalliteracy',label:'Digital Literacy'},{value:'ecommerce',label:'Online Shopping & E-commerce'},{value:'remotecollaboration',label:'Remote Collaboration Tools'}],'Health & Wellness':[{value:'health',label:'Health & Wellness'},{value:'mentalhealth',label:'Mental Health'},{value:'nutrition',label:'Nutrition'},{value:'fitness',label:'Fitness & Exercise'},{value:'sleep',label:'Sleep & Rest'},{value:'medicine',label:'Medicine & Healthcare'},{value:'publichealth',label:'Public Health'}],'Money & Economics':[{value:'finance',label:'Money & Personal Finance'},{value:'economics',label:'Economics'},{value:'investing',label:'Investing & Markets'},{value:'trade',label:'Global Trade'},{value:'consumereconomy',label:'Consumer Economy'}],'Nature & Environment':[{value:'environment',label:'Environment'},{value:'geography',label:'Geography'},{value:'climatechange',label:'Climate Change'},{value:'wildlife',label:'Wildlife & Animals'},{value:'disasters',label:'Natural Disasters'},{value:'oceans',label:'Oceans & Marine Life'},{value:'weather',label:'Weather'},{value:'seasons',label:'Seasons'}],'Culture & Society':[{value:'culture',label:'Culture & Society'},{value:'traditions',label:'Traditions & Festivals'},{value:'art',label:'Art & Museums'},{value:'music',label:'Music'},{value:'literature',label:'Literature'},{value:'social',label:'Social Issues'}],'Law, Ethics & Government':[{value:'law',label:'Law & Critical Thinking'},{value:'ethics',label:'Ethics'},{value:'government',label:'Government & Politics'},{value:'humanrights',label:'Human Rights'},{value:'crime',label:'Crime & Justice'}],'Communication & Personal Development':[{value:'communication',label:'Communication'},{value:'publicspeaking',label:'Public Speaking'},{value:'emotionalintelligence',label:'Emotional Intelligence'},{value:'timemanagement',label:'Time Management'},{value:'motivation',label:'Motivation & Goals'},{value:'creativity',label:'Creativity'}],'Media & Entertainment':[{value:'media',label:'Media & News'},{value:'movies',label:'Movies & Television'},{value:'socialmediatrends',label:'Social Media Trends'},{value:'journalism',label:'Journalism'},{value:'gaming',label:'Video Games'}],'Travel & Exploration':[{value:'travel',label:'Travel'},{value:'tourism',label:'Tourism'},{value:'transportation',label:'Transportation'},{value:'adventure',label:'Adventure & Outdoors'},{value:'worldcultures',label:'World Cultures'}],'Sports & Recreation':[{value:'sports',label:'Sports'},{value:'olympics',label:'Olympic Games'},{value:'outdoorrecreation',label:'Outdoor Recreation'},{value:'teamsports',label:'Team Sports'},{value:'extremesports',label:'Extreme Sports'}],'History & Civilization':[{value:'history',label:'History'},{value:'ancientcivilizations',label:'Ancient Civilizations'},{value:'wars',label:'Wars & Conflicts'},{value:'historicalfigures',label:'Historical Figures'},{value:'exploration',label:'Exploration & Discovery'}],'Philosophy & Psychology':[{value:'philosophy',label:'Philosophy'},{value:'psychology',label:'Psychology'},{value:'logic',label:'Logic & Reasoning'},{value:'humanbehavior',label:'Human Behavior'},{value:'happiness',label:'Happiness & Wellbeing'}],'Global Issues':[{value:'poverty',label:'Poverty & Inequality'},{value:'population',label:'Population & Demographics'},{value:'globalhealth',label:'Global Health'},{value:'migration',label:'Migration'}],'Agriculture & Food Systems':[{value:'farming',label:'Farming & Agriculture'},{value:'foodsecurity',label:'Food Security'},{value:'sustainablefood',label:'Sustainable Food'},{value:'rurallife',label:'Rural Life'}],'Urban Life & Architecture':[{value:'citylife',label:'City Life'},{value:'architecture',label:'Architecture & Design'},{value:'urbanplanning',label:'Urban Planning'},{value:'housing',label:'Housing'}],'Arts & Creativity':[{value:'visualarts',label:'Visual Arts'},{value:'photography',label:'Photography'},{value:'design',label:'Design'},{value:'creativewriting',label:'Creative Writing'},{value:'filmmaking',label:'Filmmaking'}]};
/* ---- Subject-verb agreement helper (fixes mismatches like "A student plan" -> "A student plans") ---- */
function isPluralSubject(subj){
  const s=subj.trim();
  if(/^(many|several|most|all|both|these|those)\b/i.test(s)) return true;
  if(/^(a|an)\b/i.test(s)) return false;
  const words=s.split(/\s+/);
  const last=words[words.length-1].toLowerCase();
  const singularExceptions=/^(business|process|success|access|progress|purpose|structure|adventure|homework|news|analysis|awareness)$/;
  if(/s$/.test(last) && !singularExceptions.test(last) && !/ss$/.test(last)) return true;
  return false;
}
function baseVerbForm(word){
  const w=word.toLowerCase();
  if(w==='has')return 'have';
  if(w==='does')return 'do';
  if(w==='goes')return 'go';
  if(/(ches|shes|sses|xes|zes|oes)$/.test(w))return w.slice(0,-2);
  if(w.endsWith('ies')&&w.length>4)return w.slice(0,-3)+'y';
  if(w.endsWith('s')&&w.length>2&&!w.endsWith('ss')&&!w.endsWith('us')&&!w.endsWith('is'))return w.slice(0,-1);
  return w;
}
function conjugateThirdSingular(base){
  const w=base.toLowerCase();
  if(w==='have')return 'has';
  if(w==='do')return 'does';
  if(w==='go')return 'goes';
  if(/(ch|sh|ss|x|z|o)$/.test(w))return w+'es';
  if(/[^aeiou]y$/.test(w))return w.slice(0,-1)+'ies';
  return w+'s';
}
const MODAL_VERBS=new Set(['can','could','may','might','must','shall','should','will','would']);
const LEADING_ADVERBS=new Set(['often','rarely','usually','sometimes','always','never','still','also','frequently','typically','generally','gradually','quickly','slowly','immediately','eventually']);
function conjugateAction(subject,action){
  const words=action.split(' ');
  let idx=0;
  // Skip a leading adverb (e.g. "often leads" -> conjugate "leads", not "often") so the
  // real verb gets found and adjusted instead of the adverb before it.
  if(LEADING_ADVERBS.has(words[0].toLowerCase()) && words.length>1) idx=1;
  const target=words[idx].toLowerCase();
  if(MODAL_VERBS.has(target))return action; // modal verbs never take -s
  const base=baseVerbForm(words[idx]);
  const plural=isPluralSubject(subject);
  words[idx]=plural?base:conjugateThirdSingular(base);
  return words.join(' ');
}

/* ---- Level-aware opening sentence (complexity now matches the chosen level) ---- */
const OPENING_BY_LEVEL={
  A1:t=>`${t} is easy to talk about.`,
  A2:t=>`${t} is something people often think about.`,
  B1:t=>`${t} can be an interesting topic to explore.`,
  B2:t=>`${t} raises questions that are worth considering carefully.`,
  C1:t=>`${t} raises questions that merit careful and critical analysis.`
};

function generateText(level,topic,length){
  const p=pools[topic][level];
  const counts={short:4,medium:7,long:11};
  const count=counts[length]||7;
  const sentences=[];
  let lastSub="",lastAct="",lastDet="";
  for(let i=0;i<count;i++){
    let sub=rand(p.subjects), rawAct=rand(p.actions), det=rand(p.details);
    let guard=0;
    while((sub===lastSub && rawAct===lastAct && det===lastDet)&&guard<8){sub=rand(p.subjects);rawAct=rand(p.actions);det=rand(p.details);guard++}
    lastSub=sub;lastAct=rawAct;lastDet=det;
    const act=conjugateAction(sub,rawAct);
    const templates=[
      `${sub} ${act} ${det}.`,
      `In many situations, ${sub.toLowerCase()} ${act} ${det}.`,
      `For this reason, ${sub.toLowerCase()} ${act} ${det}.`,
      `When the situation changes, ${sub.toLowerCase()} ${act} ${det}.`
    ];
    sentences.push(rand(templates));
  }
  const body=sentences.join(" ");
  const opening=OPENING_BY_LEVEL[level] ? OPENING_BY_LEVEL[level](topicLabel(topic)) : `${topicLabel(topic)} gives us useful ideas to explore and discuss.`;
  return `${opening} ${body}`;
}


/* ============ BUTTON PRESS FEEDBACK ============ */
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.button');if(b)b.classList.add('is-pressed')});
['pointerup','pointerleave','pointercancel'].forEach(ev=>document.addEventListener(ev,e=>{const b=e.target.closest('.button');if(b)b.classList.remove('is-pressed');document.querySelectorAll('.button.is-pressed').forEach(x=>{if(ev!=='pointerleave')x.classList.remove('is-pressed')})}));

/* ============ GAUGES ============ */
const GAUGE_ARC_LEN=132;
function setGauge(pathEl, ratio){ if(!pathEl)return; const r=Math.max(0,Math.min(1,ratio)); pathEl.setAttribute('stroke-dasharray',(r*GAUGE_ARC_LEN)+' '+GAUGE_ARC_LEN); }
function formatTime(totalSeconds){
  const t=Math.max(0,Math.floor(totalSeconds));
  const m=Math.floor(t/60), s=t%60;
  return m+':'+String(s).padStart(2,'0');
}

/* ============ TEXT OPTIONS: ignore-case comparison + punctuation removal ============ */
let ignoreCase=false, removePunctuation=false, lastRawText='';
let autoSpeak=localStorage.getItem('typingTrainerAutoSpeakV1')!=='0';
$('autoSpeakToggle').checked=autoSpeak;
$('autoSpeakToggle').onchange=e=>{ autoSpeak=e.target.checked; localStorage.setItem('typingTrainerAutoSpeakV1', autoSpeak?'1':'0'); };
function stripPunctuation(s){
  return s.replace(/[.,!?;:"“”‘’()\[\]{}—–]/g,'').replace(/[ \t]{2,}/g,' ').trim();
}
function transformText(raw){ return removePunctuation ? stripPunctuation(raw) : raw; }
function charsMatch(a,b){ return ignoreCase ? a.toLowerCase()===b.toLowerCase() : a===b; }
$('ignoreCaseToggle').onchange=e=>{ ignoreCase=e.target.checked; if(text)reRenderCurrentText(); };
$('removePunctuationToggle').onchange=e=>{ removePunctuation=e.target.checked; if(lastRawText)loadText(lastRawText,currentLesson,currentLevel); };
function reRenderCurrentText(){
  const typed=$("typingInput").value;
  for(let i=0;i<Math.min(typed.length,charEls.length);i++){
    const ok=charsMatch(typed[i],text[i]);
    const el=charEls[i]; const wasIncorrect=el.classList.contains('incorrect');
    el.classList.remove('correct','incorrect'); el.classList.add(ok?'correct':'incorrect');
    if(wasIncorrect&&ok)totalErrors=Math.max(0,totalErrors-1); else if(!wasIncorrect&&!ok)totalErrors++;
  }
  updateStats();
}

/* ============ TYPING SURFACE — cached elements + delta updates + GPU caret ============ */
/* Monkeytype-style responsiveness: never re-scan the whole passage per keystroke;
   only touch the character(s) that actually changed, and move the caret with a
   transform (compositor-only) instead of left/top (layout-triggering). */
let charEls=[], wordRangesCache=[], lastTypedLen=0;

function loadText(newText,lesson=null,level=null){
  const raw=(newText||"").trim(); if(!raw)return;
  lastRawText=raw;
  text=transformText(raw);
  stopSpeech();
  clearInterval(timer); startTime=null; timer=null; finished=false; totalErrors=0; lastTypedLen=0;
  currentLesson=lesson; if(level)currentLevel=level;
  const disp=$("textDisplay"); disp.innerHTML="";
  const frag=document.createDocumentFragment();
  const tokenRe=/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g; let cursor=0,m;
  while((m=tokenRe.exec(text))){
    for(let j=cursor;j<m.index;j++){const s=document.createElement("span");s.textContent=text[j];s.className="char";frag.appendChild(s)}
    const word=document.createElement("span");word.className="practice-word";word.dataset.word=m[0];
    const meaning=getArabicMeaning(m[0]);
    word.setAttribute('aria-label', meaning ? (m[0]+' — '+meaning) : (m[0]+' — Arabic meaning not available offline'));
    for(const ch of m[0]){const s=document.createElement("span");s.textContent=ch;s.className="char";word.appendChild(s)}
    frag.appendChild(word);cursor=m.index+m[0].length;
  }
  for(let j=cursor;j<text.length;j++){const s=document.createElement("span");s.textContent=text[j];s.className="char";frag.appendChild(s)}
  disp.appendChild(frag);
  charEls=Array.from(disp.querySelectorAll('.char'));
  wordRangesCache=computeWordRanges();
  $("typingInput").value="";$("typingInput").disabled=false;
  $("wpm").textContent="0";$("accuracy").textContent="100";$("time").textContent="0:00";$("errors").textContent="0";
  setGauge($("gaugeWpmArc"),0); setGauge($("gaugeAccArc"),1);
  $("currentPracticeTitle").textContent=lesson?lesson.title:"Custom text";
  $("currentLevelBadge").textContent=lesson?(currentLevel+" · "+topicLabel(lesson.topic||"custom")):currentLevel;
  updateLearningPanel();
  requestAnimationFrame(updateCaret);
  $("result").classList.add("hidden");
}

let caretRafScheduled=false;
function scheduleCaretUpdate(){
  if(caretRafScheduled)return; caretRafScheduled=true;
  requestAnimationFrame(()=>{caretRafScheduled=false;updateCaret();});
}
function updateCaret(){
  const caret=$("liveCaret"), stage=document.querySelector('.type-stage');
  const typed=$("typingInput").value.length;
  const target = charEls[Math.min(typed,charEls.length-1)];
  if(!target||!stage||finished){ if(finished&&caret)caret.style.display='none'; return; }
  target.scrollIntoView({block:'nearest',inline:'nearest'});
  const stageBox=stage.getBoundingClientRect(), charBox=target.getBoundingClientRect();
  const atEnd = typed>=charEls.length;
  const x = charBox.left-stageBox.left+(atEnd?charBox.width:0);
  const y = charBox.top-stageBox.top;
  caret.style.transform=`translate(${x}px,${y}px)`;
  caret.style.height=charBox.height+'px';
  caret.style.display='block';
}

function startTimer(){ startTime=Date.now(); timer=setInterval(updateStats,100); }
function updateStats(){
  if(!startTime)return;
  const elapsedSec=(Date.now()-startTime)/1000;
  const typed=$("typingInput").value;
  const words=typed.length/5;
  const wpm=elapsedSec>0?Math.round((words/elapsedSec)*60):0;
  let correct=0; for(let i=0;i<typed.length;i++) if(charsMatch(typed[i],text[i]))correct++;
  const acc=typed.length?Math.round((correct/typed.length)*100):100;
  $("wpm").textContent=wpm; $("accuracy").textContent=acc; $("time").textContent=formatTime(elapsedSec);
  $("errors").textContent=totalErrors;
  setGauge($("gaugeWpmArc"), Math.min(wpm,100)/100);
  setGauge($("gaugeAccArc"), acc/100);
}
function computeWordRanges(){
  const ranges=[]; const re=/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g; let m;
  while((m=re.exec(text))) ranges.push({word:m[0], start:m.index, end:m.index+m[0].length});
  return ranges;
}
function getWordRanges(){ return wordRangesCache; }
function currentWordIndex(){
  const typed=$("typingInput").value.length, ranges=getWordRanges();
  for(let i=0;i<ranges.length;i++) if(typed<=ranges[i].end) return i;
  return ranges.length-1;
}
function updateNextWord(){
  const ranges=getWordRanges(), typed=$("typingInput").value;
  let idx=0; for(let i=0;i<ranges.length;i++){ if(typed.length<=ranges[i].end){ idx=i; break; } idx=i+1; }
  const r=ranges[idx];
  $("nextWordLabel").textContent = r ? ("Next word: "+r.word) : "Next word: —";
}

$("typingInput").addEventListener("input",()=>{
  if(!text||finished)return;
  if(!startTime){stopSpeech();startTimer();if(autoSpeak)speakCurrentOrNextWord()}
  const typed=$("typingInput").value;
  const newLen=typed.length;
  if(newLen>lastTypedLen){
    for(let i=lastTypedLen;i<newLen;i++){
      const el=charEls[i]; if(!el)break;
      const ok=charsMatch(typed[i],text[i]);
      el.classList.remove('correct','incorrect'); el.classList.add(ok?'correct':'incorrect');
      if(!ok)totalErrors++;
    }
  } else if(newLen<lastTypedLen){
    for(let i=newLen;i<lastTypedLen;i++){
      const el=charEls[i]; if(!el)continue;
      if(el.classList.contains('incorrect'))totalErrors=Math.max(0,totalErrors-1);
      el.classList.remove('correct','incorrect');
    }
  }
  lastTypedLen=newLen;
  updateStats();updateNextWord();scheduleCaretUpdate();
  const ranges=getWordRanges(),pos=typed.length;
  if(autoSpeak){
    for(let i=0;i<ranges.length;i++){
      if(pos===ranges[i].end){
        const next=ranges[i+1]; if(next)setTimeout(()=>{if($("typingInput").value.length>=pos && !finished)speakWord(next.word,.92)},0);
        break;
      }
    }
  }
  if(typed.length>=text.length)finishTest();
});

function finishTest(){
  if(finished)return;finished=true;clearInterval(timer);timer=null;updateStats();stopSpeech();
  $("liveCaret").style.display='none';
  $("finalWpm").textContent=$("wpm").textContent;$("finalAccuracy").textContent=$("accuracy").textContent+"%";$("finalTime").textContent=$("time").textContent;$("finalErrors").textContent=$("errors").textContent;
  updateResultLearning();saveTestResult();renderProgress();
  $("result").classList.remove("hidden");
  $("result").scrollIntoView({behavior:'smooth',block:'start'});
  $("typingInput").disabled=true;
}
$("startBtn").onclick=()=>{if(!text){alert("Choose or generate a text first.");return}stopSpeech();$("typingInput").disabled=false;$("typingInput").focus({preventScroll:true});if(!startTime){startTimer();if(autoSpeak)speakCurrentOrNextWord()}updateCaret()};
$("textDisplay").addEventListener("click",()=>{if(text && !finished){$("typingInput").disabled=false;$("typingInput").focus({preventScroll:true});if(!startTime){startTimer();if(autoSpeak)speakCurrentOrNextWord()}updateCaret()}});
$("resetBtn").onclick=()=>{
  clearInterval(timer);stopSpeech();startTime=null;timer=null;finished=false;totalErrors=0;lastTypedLen=0;
  $("typingInput").value="";$("typingInput").disabled=!text;
  charEls.forEach(c=>c.classList.remove("correct","incorrect"));
  $("wpm").textContent="0";$("accuracy").textContent="100";$("time").textContent="0:00";$("errors").textContent="0";
  setGauge($("gaugeWpmArc"),0); setGauge($("gaugeAccArc"),1);
  $("result").classList.add("hidden");
  updateNextWord();updateCaret();
};
$("restartBtn").onclick=()=>{$("resetBtn").click();$("typingInput").focus({preventScroll:true})};

function updateResultLearning(){
  $("resultLessonName").textContent = currentLesson ? currentLesson.title : "Custom text";
  renderVocabFlips($("resultVocabulary"), currentLesson ? currentLesson.vocabulary : []);
  $("resultGrammar").textContent = currentLesson ? currentLesson.grammar : (grammarByLevel[currentLevel]||"Practice the structures in your text.");
}

$("playBtn").onclick=()=>speakFullText();$("pauseBtn").onclick=()=>window.speechSynthesis?.pause();$("resumeBtn").onclick=()=>window.speechSynthesis?.resume();$("stopBtn").onclick=()=>stopSpeech();$("speakWordBtn").onclick=()=>speakCurrentOrNextWord();
$("fileInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{loadText(ev.target.result,null,"CUSTOM");document.getElementById('practice').scrollIntoView({behavior:'smooth'});};r.readAsText(f)};
$("useTextBtn").onclick=()=>{loadText($("customText").value,null,"CUSTOM");document.getElementById('practice').scrollIntoView({behavior:'smooth'});};

/* ============ VOICE ENGINE (US / UK accent choice) ============ */
let availableVoices=[];
let preferredVoiceName=localStorage.getItem('typingTrainerVoiceV8')||'';
let preferredAccent=localStorage.getItem('typingTrainerAccentV8')||'us';
function isEnglishVoice(v){return !!v&&/^en[-_]/i.test(v.lang||'')}
function isUSVoice(v){return !!v&&/^en[-_]us$/i.test(v.lang||'')}
function isGBVoice(v){return !!v&&/^en[-_]gb$/i.test(v.lang||'')}
function isLikelyOffline(v){return /microsoft|desktop|espeak|festival|offline/i.test(v.name||'')}
function accentMatch(v){ if(preferredAccent==='us')return isUSVoice(v); if(preferredAccent==='gb')return isGBVoice(v); return true; }
/* Voice quality heuristic: neural/online voices (Google, Microsoft Online Natural) sound
   near-human; older offline engines (Desktop SAPI, eSpeak, Festival) sound robotic.
   We now reward quality instead of rewarding "offline" as we did before. */
function voiceQualityScore(v){
  const n=(v.name||'').toLowerCase();
  if(/natural|neural/.test(n)) return 500;
  if(/google/.test(n)) return 300;
  if(/online/.test(n)) return 250;
  if(/desktop|espeak|festival|compact/.test(n)) return -100;
  return 0;
}
function refreshVoiceList(){
 if(!('speechSynthesis' in window))return;
 availableVoices=window.speechSynthesis.getVoices().filter(isEnglishVoice);
 const sel=$('voiceSelect');sel.innerHTML='';
 if(!availableVoices.length){
   sel.innerHTML='<option>No English voice detected</option>';
   $('voiceHelpText').textContent='No English voice was found on this device.';
   $('offlineVoiceDot').className='dot warn';
   $('offlineVoiceStatus').textContent='No voice';
   return;
 }
 const score=v=>(v.name===preferredVoiceName?1000:0)+(accentMatch(v)?100:0)+voiceQualityScore(v);
 availableVoices.sort((a,b)=>score(b)-score(a));
 availableVoices.forEach(v=>{
   const accentTag=isUSVoice(v)?' (US)':isGBVoice(v)?' (UK)':'';
   const o=document.createElement('option');o.value=v.name;o.textContent=`${v.name}${accentTag}${isLikelyOffline(v)?' • offline':''}`;sel.appendChild(o);
 });
 const best=availableVoices.find(v=>v.name===preferredVoiceName)||availableVoices.find(accentMatch)||availableVoices[0];
 preferredVoiceName=best.name;localStorage.setItem('typingTrainerVoiceV8',preferredVoiceName);sel.value=preferredVoiceName;
 const offlineMatch=availableVoices.find(v=>accentMatch(v)&&isLikelyOffline(v));
 $('offlineVoiceDot').className='dot '+(offlineMatch?'ok':'warn');
 $('offlineVoiceStatus').textContent=offlineMatch?'✓ Offline voice ready':'⚠ May need a connection';
 $('voiceHelpText').textContent=offlineMatch?`Selected: ${best.name}.`:`Selected: ${best.name}. No clearly offline voice matches this accent — install one for reliable offline use.`;
 updateVoiceStatus();
}
function getPreferredVoice(){return availableVoices.find(v=>v.name===preferredVoiceName)||availableVoices.find(accentMatch)||availableVoices.find(isLikelyOffline)||availableVoices[0]||null}
function updateVoiceStatus(){
  selectedVoice=getPreferredVoice();
  if(!selectedVoice){$('voiceStatus').textContent='Voice loading…';$('voiceStatus').classList.remove('live');return}
  const tag=isUSVoice(selectedVoice)?'US':isGBVoice(selectedVoice)?'UK':'English';
  $('voiceStatus').textContent=`✓ ${tag} voice`;$('voiceStatus').classList.add('live');
}
function stopSpeech(){speechToken++;if("speechSynthesis"in window)window.speechSynthesis.cancel()}
function speakHuman(s,rate=.86,onend=null){
  if(!s||!('speechSynthesis'in window))return;
  speechToken++;const token=speechToken;
  const synth=window.speechSynthesis;
  const doSpeak=()=>{
    if(token!==speechToken)return;
    const u=new SpeechSynthesisUtterance(s),v=getPreferredVoice();
    if(v){u.voice=v;u.lang=v.lang}else u.lang=preferredAccent==='gb'?'en-GB':'en-US';
    u.rate=Math.max(.55,Math.min(1.12,rate));u.pitch=1;u.volume=1;
    u.onend=()=>{if(token===speechToken&&onend)onend()};
    synth.speak(u);
  };
  // Only cancel (and wait briefly) when something is actually in progress —
  // calling cancel() immediately before speak() every time is what causes
  // Chrome's speech engine to silently drop or delay utterances.
  if(synth.speaking||synth.pending){ synth.cancel(); setTimeout(doSpeak,30); } else { doSpeak(); }
}
function speakWord(word,rate=.86){speakHuman(word,rate)}
function speakCurrentOrNextWord(){const r=getWordRanges(),i=currentWordIndex();if(r[i])speakWord(r[i].word,.92)}
function speakFullText(){
  if(!text)return;speechToken++;const token=speechToken;
  const synth=window.speechSynthesis;
  const chunks=text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text];let i=0;
  const next=()=>{
    if(token!==speechToken||i>=chunks.length)return;
    const u=new SpeechSynthesisUtterance(chunks[i++].trim()),v=getPreferredVoice();
    if(v){u.voice=v;u.lang=v.lang}else u.lang=preferredAccent==='gb'?'en-GB':'en-US';
    u.rate=Math.max(.6,Math.min(1.05,Number($('speechRate').value)*.9));u.pitch=1;u.volume=1;
    u.onend=()=>setTimeout(next,100);u.onerror=()=>setTimeout(next,150);
    synth.speak(u);
  };
  if(synth.speaking||synth.pending){ synth.cancel(); setTimeout(next,30); } else { next(); }
}
// Chrome silently pauses long-running speech after ~15s of inactivity in the
// tab; nudging pause/resume periodically keeps it alive without any audible glitch.
if('speechSynthesis'in window){
  setInterval(()=>{ const s=window.speechSynthesis; if(s.speaking&&!s.paused){ s.pause(); s.resume(); } },7000);
}
$('voiceSelect').onchange=e=>{preferredVoiceName=e.target.value;localStorage.setItem('typingTrainerVoiceV8',preferredVoiceName);refreshVoiceList()};
$('refreshVoicesBtn').onclick=refreshVoiceList;
$('voiceTestBtn').onclick=()=>speakHuman('Hello. This is a voice test for your typing trainer.',.8);
document.querySelectorAll('.accent-btn').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.accent-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  preferredAccent=b.dataset.accent;localStorage.setItem('typingTrainerAccentV8',preferredAccent);
  preferredVoiceName='';
  refreshVoiceList();
});
(function initAccentButtons(){
  document.querySelectorAll('.accent-btn').forEach(b=>b.classList.toggle('active', b.dataset.accent===preferredAccent));
})();
if('speechSynthesis'in window){window.speechSynthesis.onvoiceschanged=refreshVoiceList;setTimeout(refreshVoiceList,400)}

/* ============ DICTATION — word by word, live per-character feedback ============ */
let dict={active:false,index:0,words:[]};
function dictWords(){return (text.match(/[A-Za-z]+(?:['-][A-Za-z]+)*/g)||[])}
function speakDictWord(){ if(!dict.active||dict.index>=dict.words.length)return; stopSpeech(); setTimeout(()=>speakHuman(dict.words[dict.index],.8),70); }
function renderDictSlots(){
  const word=dict.words[dict.index]||'', typed=$('dictationInput').value, box=$('dictSlots');
  box.innerHTML='';
  for(let i=0;i<word.length;i++){
    const slot=document.createElement('span'); slot.className='dict-slot';
    if(i<typed.length){ slot.textContent=typed[i]; slot.classList.add(typed[i].toLowerCase()===word[i].toLowerCase()?'correct':'incorrect'); }
    else if(i===typed.length){ slot.classList.add('current'); slot.textContent=''; }
    box.appendChild(slot);
  }
}
function updateDictUI(){
  const n=dict.index+1,t=dict.words.length;
  $('dictationStatus').textContent=dict.active?`Word ${n}/${t}`:'Ready';
  $('dictationProgress').textContent=dict.active?`Listen to word ${n} of ${t}. Each letter turns red immediately if it's wrong.`:'No voice test running.';
  renderDictSlots();
}
function startDict(){
  if(!text){alert('Choose or generate a text first.');return}
  stopSpeech();
  let words=dictWords();
  const limitRaw=$('dictWordLimit').value.trim();
  const limit=parseInt(limitRaw,10);
  if(limitRaw && !isNaN(limit) && limit>0) words=words.slice(0, limit);
  dict={active:true,index:0,words,correctCount:0};
  $('dictationInput').value='';$('dictationInput').disabled=false;$('dictationResult').classList.add('hidden');
  updateDictUI();setTimeout(speakDictWord,180);$('dictationInput').focus({preventScroll:true});
}
function repeatDict(){if(dict.active)speakDictWord()}
function advanceDict(wasCorrect){
  if(wasCorrect)dict.correctCount=(dict.correctCount||0)+1;
  dict.index++;$('dictationInput').value='';
  if(dict.index<dict.words.length){ updateDictUI(); setTimeout(speakDictWord,350); }
  else{
    dict.active=false;$('dictationInput').disabled=true;
    const pct=Math.round((dict.correctCount/dict.words.length)*100);
    $('dictationStatus').textContent='Completed';
    $('dictationProgress').textContent='Voice test complete.';
    $('dictSlots').innerHTML='';
    $('dictationResult').classList.remove('hidden');
    $('dictationResult').innerHTML=`<strong>Score: ${pct}%</strong><br>You typed ${dict.correctCount} of ${dict.words.length} words correctly.`;
  }
}
$('dictationInput').addEventListener('input',()=>{
  if(!dict.active)return;
  const word=dict.words[dict.index], typed=$('dictationInput').value;
  renderDictSlots();
  if(typed.length>=word.length){
    const ok=typed.toLowerCase().replace(/[’]/g,"'")===word.toLowerCase().replace(/[’]/g,"'");
    setTimeout(()=>advanceDict(ok),350);
  }
});
$('startDictationBtn').onclick=startDict;$('repeatDictationBtn').onclick=repeatDict;
$('revealDictationBtn').onclick=()=>{if(dict.active){$('dictationResult').classList.remove('hidden');$('dictationResult').innerHTML='<strong>Word:</strong> '+dict.words[dict.index]}};

/* ============ GENERATOR — accordion topic picker: domains -> subtopics ============ */
let selectedTopic='daily';
function buildTopicPicker(){
  const list=$('topicDomainList'); list.innerHTML='';
  Object.keys(STABLE_TOPIC_DATA).forEach(domain=>{
    const group=document.createElement('div'); group.className='topic-domain-group';
    const head=document.createElement('button'); head.type='button'; head.className='topic-domain-head';
    head.innerHTML=`<span>${domain}</span><span class="chev">▾</span>`;
    const subList=document.createElement('div'); subList.className='topic-sub-list hidden';
    STABLE_TOPIC_DATA[domain].forEach(t=>{
      const chip=document.createElement('button'); chip.type='button'; chip.className='topic-sub-chip';
      if(t.value===selectedTopic)chip.classList.add('active');
      chip.textContent=t.label;
      chip.onclick=(e)=>{ e.stopPropagation(); selectedTopic=t.value; $('topicTriggerLabel').textContent=t.label; closeTopicPanel(); };
      subList.appendChild(chip);
    });
    head.onclick=(e)=>{
      e.stopPropagation();
      const isOpen=!subList.classList.contains('hidden');
      document.querySelectorAll('.topic-sub-list').forEach(x=>x.classList.add('hidden'));
      document.querySelectorAll('.topic-domain-head').forEach(x=>x.classList.remove('open'));
      if(!isOpen){ subList.classList.remove('hidden'); head.classList.add('open'); }
    };
    group.appendChild(head); group.appendChild(subList);
    list.appendChild(group);
  });
}
function openTopicPanel(){ buildTopicPicker(); $('topicPanel').classList.remove('hidden'); }
function closeTopicPanel(){ $('topicPanel').classList.add('hidden'); }
$('topicTrigger').onclick=(e)=>{ e.stopPropagation(); const panel=$('topicPanel'); panel.classList.contains('hidden')?openTopicPanel():closeTopicPanel(); };
document.addEventListener('click',e=>{ if(!e.target.closest('.topic-field')) closeTopicPanel(); });
$('topicTriggerLabel').textContent=topicLabel(selectedTopic);

function extractVocabulary(t,level){
  const words=t.toLowerCase().match(/[a-z]{5,}/g)||[];
  const stop=new Set(["about","after","before","because","people","their","there","which","when","while","without","through","every","often","especially","rather","although","between","during","allows","allow","helps","help","can","will","from","with","into","more","than","this","that","these","those","being","have","has","they","them","then","also","some","many","most","only","over","such"]);
  const unique=[...new Set(words.filter(w=>!stop.has(w)))];
  return unique.sort((a,b)=>b.length-a.length).slice(0,6);
}
$("generateBtn").onclick=()=>{
  const level=$("genLevel").value, topic=selectedTopic, len=$("genLength").value;
  const generated=generateText(level,topic,len);
  const lesson={title:`${topicLabel(topic)} — New Text`,description:`Fresh ${len} practice text generated for ${level}.`,text:generated,vocabulary:extractVocabulary(generated,level),grammar:grammarByLevel[level],topic};
  loadText(generated,lesson,level);
  $("generatorInfo").textContent=`Generated a new ${len} ${level} text about ${topicLabel(topic)}. Generate again for another text.`;
};
$("nextLessonBtn").onclick=()=>{ $("generateBtn").click(); document.getElementById('practice').scrollIntoView({behavior:'smooth'}); };

/* ============ LEARN PANEL — interactive vocabulary + grammar ============ */
function renderVocabFlips(container,words){
  if(!words||!words.length){container.innerHTML='<p class="vocab-hint" style="margin:0">Vocabulary is based on the selected topic.</p>';return}
  container.innerHTML='';
  words.forEach(w=>{
    const card=document.createElement('div'); card.className='vocab-flip';
    const meaning=getArabicMeaning(w)||'—';
    card.innerHTML=`<span class="en">${w}</span><span class="ar">${meaning}</span><button type="button" class="say-btn" title="Pronounce">🔊</button>`;
    card.querySelector('.say-btn').onclick=(e)=>{e.stopPropagation();speakHuman(w,.85)};
    card.onclick=()=>card.classList.toggle('flipped');
    container.appendChild(card);
  });
}
function updateLearningPanel(){
  if(!currentLesson){
    $("lessonTitle").textContent="Generated Text / Custom Text";
    $("lessonDescription").textContent="This exercise was generated locally or supplied by you.";
    renderVocabFlips($("vocabularyList"),[]);
    $("grammarFocus").textContent=grammarByLevel[currentLevel]||"Practice the structures in your text.";
    $("grammarExample").classList.remove('shown');$("grammarExample").textContent='';
    $("grammarExampleBtn").textContent='Show example from this text';
    return;
  }
  $("lessonTitle").textContent=currentLesson.title;
  $("lessonDescription").textContent=currentLesson.description;
  renderVocabFlips($("vocabularyList"),currentLesson.vocabulary);
  $("grammarFocus").textContent=currentLesson.grammar;
  $("grammarExample").classList.remove('shown');$("grammarExample").textContent='';
  $("grammarExampleBtn").textContent='Show example from this text';
}
$("grammarExampleBtn").onclick=()=>{
  const box=$("grammarExample");
  if(box.classList.contains('shown')){box.classList.remove('shown');$("grammarExampleBtn").textContent='Show example from this text';return}
  const sentences=(text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text]).map(s=>s.trim()).filter(Boolean);
  box.textContent = sentences.length ? rand(sentences) : 'No text loaded yet.';
  box.classList.add('shown');
  $("grammarExampleBtn").textContent='Hide example';
};

/* ============ PROGRESS LEDGER ============ */
function getProgress(){try{return JSON.parse(localStorage.getItem(PROGRESS_KEY))||{tests:[],weak:{},learned:{}}}catch(e){return{tests:[],weak:{},learned:{}}}}
function wordTokens(s){return String(s||'').toLowerCase().replace(/[^a-z'\s]/g,' ').split(/\s+/).filter(Boolean)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function saveTestResult(){
  const p=getProgress();
  const wpm=+($("wpm").textContent)||0, acc=parseFloat($("accuracy").textContent)||0;
  p.tests.push({date:new Date().toISOString(),wpm,accuracy:acc,errors:totalErrors,level:currentLevel});
  if(p.tests.length>300)p.tests=p.tests.slice(-300);
  const typedWords=wordTokens($("typingInput").value), targetWords=wordTokens(text);
  for(let i=0;i<Math.max(typedWords.length,targetWords.length);i++){ if(targetWords[i] && typedWords[i]!==targetWords[i]) p.weak[targetWords[i]]=(p.weak[targetWords[i]]||0)+1; }
  targetWords.forEach(w=>p.learned[w]=(p.learned[w]||0)+1);
  localStorage.setItem(PROGRESS_KEY,JSON.stringify(p));
}
function renderProgress(){
  const p=getProgress(), tests=p.tests;
  const wpms=tests.map(t=>t.wpm).filter(Boolean), accs=tests.map(t=>t.accuracy).filter(Boolean);
  $("bestWpm").textContent = wpms.length?Math.max(...wpms):0;
  $("avgWpm").textContent = wpms.length?Math.round(wpms.reduce((a,b)=>a+b,0)/wpms.length):0;
  $("avgAccuracy").textContent = (accs.length?Math.round(accs.reduce((a,b)=>a+b,0)/accs.length):0)+"%";
  $("totalTests").textContent = tests.length;

  const weakBox=$("weakWordsGrid");
  const weakEntries=Object.entries(p.weak).sort((a,b)=>b[1]-a[1]).slice(0,18);
  weakBox.innerHTML = weakEntries.length ? weakEntries.map(([w,c])=>`<div class="weak-item"><strong>${escapeHtml(w)}</strong><small>${c} miss${c>1?'es':''}</small></div>`).join('') : '<p class="empty-note">No weak words yet — they will appear here after your first few tests.</p>';

  const levels=["A1","A2","B1","B2","C1"];
  const totalTests=tests.length||1;
  $("cefrRow").innerHTML = levels.map(l=>{
    const n=tests.filter(t=>t.level===l).length, pct=Math.round((n/totalTests)*100);
    return `<div class="cefr-item"><strong>${l}</strong><div class="cefr-track"><div class="cefr-fill" style="width:${tests.length?pct:0}%"></div></div><small>${n} test${n===1?'':'s'}</small></div>`;
  }).join('');
}
document.querySelectorAll('.progress-panel .tab-btn').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.progress-panel .tab-btn').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.progress-panel .tab-pane').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  document.querySelector(`.progress-panel [data-pane="${b.dataset.tab}"]`)?.classList.add('active');
});
$("clearProgressBtn").onclick=()=>{ if(confirm('Clear all saved progress? This cannot be undone.')){ localStorage.removeItem(PROGRESS_KEY); renderProgress(); } };
renderProgress();
updateNextWord();

/* ============ THEME TOGGLE (dark / light) ============ */
(function initTheme(){
  const btn=$('themeToggle');
  const isLight=document.documentElement.getAttribute('data-theme')==='light';
  btn.textContent=isLight?'☀️':'🌙';
  btn.onclick=()=>{
    const nowLight=document.documentElement.getAttribute('data-theme')==='light';
    if(nowLight){ document.documentElement.removeAttribute('data-theme'); btn.textContent='🌙'; localStorage.setItem('typingTrainerThemeV1','dark'); }
    else{ document.documentElement.setAttribute('data-theme','light'); btn.textContent='☀️'; localStorage.setItem('typingTrainerThemeV1','light'); }
  };
})();

/* ============ FLOATING SCROLL NAVIGATION ============ */
$('scrollTopBtn').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
$('scrollBottomBtn').onclick=()=>window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});

/* ============ PERSONAL TEXT LIBRARY — saved by CEFR level, persisted locally ============ */
const LIBRARY_KEY='typingTrainerLibraryV1';
let activeLibraryLevel='A1';
function getLibraryItems(){ try{ return JSON.parse(localStorage.getItem(LIBRARY_KEY))||[]; }catch(e){ return []; } }
function saveLibraryItems(arr){ localStorage.setItem(LIBRARY_KEY, JSON.stringify(arr)); }
function renderLibrary(){
  document.querySelectorAll('#libraryTabs .tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.level===activeLibraryLevel));
  const items=getLibraryItems().filter(it=>it.level===activeLibraryLevel);
  const box=$('libraryList');
  if(!items.length){ box.innerHTML='<p class="empty-note">No saved texts yet for '+activeLibraryLevel+'.</p>'; return; }
  box.innerHTML='';
  items.slice().reverse().forEach(item=>{
    const row=document.createElement('div'); row.className='library-item';
    const words=item.text.trim().split(/\s+/).filter(Boolean).length;
    const d=new Date(item.savedAt);
    row.innerHTML=`<div><strong>${escapeHtml(item.label)}</strong><span class="lib-meta">${words} words · saved ${d.toLocaleDateString()}</span></div><div class="lib-actions"><button type="button" class="button small practice-lib">Practice</button><button type="button" class="button small danger delete-lib">Delete</button></div>`;
    row.querySelector('.practice-lib').onclick=()=>{
      const lesson={title:item.label,description:'From your personal library.',vocabulary:extractVocabulary(item.text,item.level),grammar:grammarByLevel[item.level],topic:'custom'};
      loadText(item.text,lesson,item.level);
      document.getElementById('practice').scrollIntoView({behavior:'smooth'});
    };
    row.querySelector('.delete-lib').onclick=()=>{
      if(!confirm('Delete "'+item.label+'"?'))return;
      saveLibraryItems(getLibraryItems().filter(x=>x.id!==item.id));
      renderLibrary();
    };
    box.appendChild(row);
  });
}
document.querySelectorAll('#libraryTabs .tab-btn').forEach(b=>b.onclick=()=>{ activeLibraryLevel=b.dataset.level; renderLibrary(); });
$('libraryFileInput').onchange=e=>{
  const f=e.target.files[0]; if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{ $('libraryTextInput').value=ev.target.result; };
  r.readAsText(f);
};
$('libraryAddBtn').onclick=()=>{
  const label=$('libraryLabelInput').value.trim();
  const txt=$('libraryTextInput').value.trim();
  if(!label){ alert('Give this text a topic name first.'); return; }
  if(!txt){ alert('Paste some text or upload a file first.'); return; }
  const items=getLibraryItems();
  items.push({id:Date.now()+'-'+Math.random().toString(36).slice(2,7), level:activeLibraryLevel, label, text:txt, savedAt:new Date().toISOString()});
  saveLibraryItems(items);
  $('libraryLabelInput').value=''; $('libraryTextInput').value='';
  renderLibrary();
};
renderLibrary();
