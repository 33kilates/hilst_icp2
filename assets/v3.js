/* Hilst · V3. O envio só é ativado quando a página publicada define HILST_PREVIEW_MODE=false. */
(() => {
  'use strict';
  const PREVIEW_MODE = window.HILST_PREVIEW_MODE !== false || /^(127\.0\.0\.1|localhost)$/.test(location.hostname) || location.protocol === 'file:';
  const RULE_VERSION = 'guided-v3-min300-route-2026-10-13';
  const CATALOG_SNAPSHOT = 'conectavenda-2026-10-08';
  const MIN_CENTS = 30000;
  const PIX_CENTS = 100000;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = cents => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const uuid = () => crypto.randomUUID?.() || `v3-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const products = [
    { id:'BR1855', group:'XXG6326', name:'Brinco coração', category:'Brincos', cents:2815, tags:['coracao','delicado'], img:'BR1855.webp', client:'Para clientes que gostam de corações e detalhes discretos.', role:'Uma opção de menor preço entre os brincos.', show:'Apresente sozinho ou ao lado da pulseira de coração. Cada peça pode ser escolhida separadamente.' },
    { id:'PU712', group:'IRA1253', name:'Pulseira coração e ponto de luz 16+5cm', category:'Pulseiras', cents:6775, tags:['coracao','brilho','delicado'], img:'PU712.webp', client:'Para clientes que gostam de corações e pontos de luz.', role:'Uma pulseira para mostrar com o brinco de coração ou vender separadamente.', show:'Mostre a pulseira no pulso e uma opção de brinco ao lado.' },
    { id:'CR361', group:'DKH5750', name:'Colar elos estrelas 40cm', category:'Colares', cents:8730, tags:['delicado'], img:'CR361.webp', client:'Para clientes que gostam de correntes com detalhes no desenho.', role:'Uma opção de menor preço entre os colares desta amostra.', show:'Mostre como fica no colo e apresente também um brinco, sem obrigar a compra das duas peças.' },
    { id:'AN733', group:'YHG2890', name:'Anel quadrado', category:'Anéis', cents:6238, tags:['geometrico','simples'], img:'AN733.webp', client:'Para clientes que procuram anéis com desenho quadrado.', role:'Uma opção de menor preço entre os anéis desta amostra.', show:'Apresente sozinho ou compare com o brinco quadrado. Confira a numeração no atendimento.' },
    { id:'BR1875', group:'IFU8844', name:'Brinco LOVE', category:'Brincos', cents:3960, tags:['simbolo','delicado'], img:'BR1875.webp', client:'Para clientes que gostam de joias com palavras e símbolos.', role:'Um desenho diferente para comparar com brincos de formas simples.', show:'Mostre o detalhe LOVE na foto.' },
    { id:'BR1623', group:'III2696', name:'Brinco argola click marinho', category:'Brincos', cents:5265, tags:['cor'], img:'BR1623.webp', client:'Para clientes que procuram joias com um toque de cor.', role:'Uma opção azul para variar entre os modelos de prata.', show:'Apresente a argola sozinha ou ao lado de uma pulseira simples.' },
    { id:'AN710', group:'PDU5558', name:'Anel solitário zircônia 5mm', category:'Anéis', cents:7620, tags:['brilho','classico'], img:'AN710.webp', client:'Para clientes que procuram o estilo solitário com zircônia.', role:'Um anel para comparar com desenhos lisos e aparadores.', show:'Mostre sozinho. A numeração é conferida no atendimento.' },
    { id:'GR697', group:'OHQ9958', name:'Colar três pontos de luz 40cm', category:'Colares', cents:12060, tags:['brilho','classico'], img:'GR697.webp', client:'Para clientes que procuram colares com pontos de luz.', role:'Um colar para comparar com brincos ou pulseiras de detalhes semelhantes.', show:'Mostre sozinho e depois uma possível combinação com brinco de ponto de luz.' },
    { id:'BR1956', group:'UQD1843', name:'Brinco quadrado', category:'Brincos', cents:7348, tags:['geometrico','simples'], img:'BR1956.webp', client:'Para clientes que preferem formas mais retas.', role:'Uma alternativa aos brincos de coração e às argolas.', show:'Mostre o formato de perto e compare com o anel quadrado.' },
    { id:'PU704', group:'CVH8423', name:'Pulseira fita 18cm', category:'Pulseiras', cents:9645, tags:['simples','classico'], img:'PU704.webp', client:'Para clientes que procuram pulseiras de linhas mais simples.', role:'Uma pulseira para combinar com peças que você já vende.', show:'Apresente sozinha ou ao lado de um colar. Confira o comprimento no atendimento.' },
    { id:'CR509', group:'YCJ2913', name:'Corrente torcida 40+5cm', category:'Colares', cents:43745, tags:['classico'], img:'CR509.webp', client:'Para clientes que pedem correntes com desenho torcido.', role:'Opção de maior valor nesta amostra. Inclua somente se o modelo e o preço fizerem sentido.', show:'Apresente sozinha para destacar o desenho e compare outras opções antes de escolher.' }
  ];
  const byId = Object.fromEntries(products.map(product => [product.id, product]));
  const contexts = [
    { key:'repor', title:'Completar o que está faltando', copy:'Se faltam opções em algumas categorias, comece pelo que precisa completar. Você escolhe quais entram no pedido.', ids:['BR1855','PU712','CR361','AN733'], note:'Compare o coração do brinco e da pulseira como uma possibilidade de apresentação. O colar e o anel também podem ser oferecidos separadamente.' },
    { key:'teste', title:'Repor e experimentar outros modelos', copy:'Quer apresentar algo diferente às clientes? Compare desenhos e detalhes antes de decidir quais modelos incluir.', ids:['BR1875','BR1623','AN710','GR697'], note:'O detalhe LOVE e a argola com cor oferecem desenhos diferentes. O solitário e os pontos de luz são outras opções para comparar.' },
    { key:'completo', title:'Reunir mais categorias no pedido', copy:'Veja opções de brinco, colar, pulseira e anel. Ter mais categorias não obriga a comprar todas nem a aumentar a quantidade de cada modelo.', ids:['BR1956','AN733','PU704','CR509'], note:'Brinco e anel quadrados podem ser apresentados juntos ou separados. A pulseira e a corrente ampliam as opções; a corrente tem maior valor nesta amostra.' }
  ];
  const goalLabels = { repor:contexts[0].title, teste:contexts[1].title, completo:contexts[2].title, categoria:'Reforçar uma categoria' };
  const preferenceTags = { coracao:'coracao', geometrico:'geometrico', brilho:'brilho', cor:'cor', simples:'simples', variados:'' };
  const state = { selectionId:uuid(), entry:'', goal:'', operation:'', preference:'', categories:[], budget:'', selected:[], alternatives:[], startedAt:'', changedGoal:false };

  function track(event, extra={}) {
    const safe = { event, at:new Date().toISOString(), selection_id:state.selectionId, rule_version:RULE_VERSION, catalog_snapshot:CATALOG_SNAPSHOT, ...extra };
    try { const list=JSON.parse(sessionStorage.getItem('hilst_v3_preview_events')||'[]'); list.push(safe); sessionStorage.setItem('hilst_v3_preview_events',JSON.stringify(list.slice(-150))); } catch(_) { /* private browsing */ }
    if (!PREVIEW_MODE && ['guide_open','suggestion_exposed','category_path_select'].includes(event)) {
      window.HilstTracking?.trackCustom('HilstSelectionInteraction', { action:event, goal:safe.goal||'', selection_id:state.selectionId, rule_version:RULE_VERSION });
    }
  }
  function totals(ids=state.selected) {
    const subtotal=ids.reduce((sum,id)=>sum+(byId[id]?.cents||0),0);
    const discount=subtotal>=PIX_CENTS ? Math.round(subtotal*0.1) : 0;
    return { subtotal, discount, pix:subtotal-discount, minimumMet:subtotal>=MIN_CENTS, pixEligible:discount>0 };
  }
  function productCard(product) {
    return `<article class="v3-product" data-product="${product.id}"><img src="assets/catalog/${product.img}" alt="${escapeHtml(product.name)}" width="600" height="600" loading="lazy"><div class="v3-product-copy"><small>${product.id} · ${product.category}</small><h4>${escapeHtml(product.name)}</h4><strong class="v3-price">${money(product.cents)}</strong><p><b>Para suas clientes:</b> ${escapeHtml(product.client)}</p><p><b>No seu pedido:</b> ${escapeHtml(product.role)}</p><details><summary>Uma ideia para apresentar</summary><p>${escapeHtml(product.show)}</p></details></div></article>`;
  }
  function renderContexts() {
    $('#v3-context-list').innerHTML=contexts.map((context,index)=>`<article class="v3-context" data-context="${context.key}"><div class="v3-context-top"><div><span class="v3-context-index">${String(index+1).padStart(2,'0')}</span><h3>${context.title}</h3><p>${context.copy}</p></div></div><div class="v3-rail-label"><span>Algumas opções para comparar · amostra de modelos, não um pedido completo</span><div class="v3-rail-controls"><button type="button" data-rail-prev aria-label="Ver peças anteriores" disabled>←</button><span aria-live="polite">Modelo 1 de 4</span><button type="button" data-rail-next aria-label="Ver próximas peças">→</button></div></div><div class="v3-rail" tabindex="0" role="region" aria-label="${context.title}: modelos para comparar">${context.ids.map(id=>productCard(byId[id])).join('')}</div><div class="v3-context-foot"><p>${context.note}<br><small>Na simulação, você define categorias e valor. Disponibilidade, numeração e quantidade são conferidas no atendimento.</small></p><button class="btn" type="button" data-start="${context.key}">Ver uma sugestão para mim</button></div></article>`).join('');
    $$('.v3-context').forEach(context => {
      const rail=$('.v3-rail',context),prev=$('[data-rail-prev]',context),next=$('[data-rail-next]',context),position=$('.v3-rail-controls span',context);
      const sync=()=>{const cards=$$('.v3-product',rail),step=(cards[1]?.offsetLeft||0)-(cards[0]?.offsetLeft||0)||cards[0].getBoundingClientRect().width;const index=Math.min(cards.length-1,Math.max(0,Math.round(rail.scrollLeft/step)));const canScroll=rail.scrollWidth>rail.clientWidth+2;position.textContent=canScroll?`Modelo ${index+1} de ${cards.length}`:`4 modelos à vista`;prev.disabled=!canScroll||index===0;next.disabled=!canScroll||rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-2;};
      prev.addEventListener('click',()=>{rail.scrollBy({left:-$('.v3-product',rail).getBoundingClientRect().width-13,behavior:'smooth'});track('rail_navigate',{context:context.dataset.context,direction:'prev'});});
      next.addEventListener('click',()=>{rail.scrollBy({left:$('.v3-product',rail).getBoundingClientRect().width+13,behavior:'smooth'});track('rail_navigate',{context:context.dataset.context,direction:'next'});});
      rail.addEventListener('scroll',sync,{passive:true});addEventListener('resize',sync);rail.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();(event.key==='ArrowRight'?next:prev).click();}});sync();
    });
  }
  function goalOptions() { return contexts.map(context=>`<option value="${context.key}">${context.title}</option>`).join('')+'<option value="categoria">Reforçar uma categoria</option>'; }
  function guideMarkup() {
    return `<div class="v3-panel"><div id="v3-choice-line" class="v3-choice-line" hidden></div><form id="v3-answers" novalidate><div class="v3-questions"><div class="v3-question wide" id="v3-goal-question"><label for="v3-goal">O que você precisa neste pedido? *</label><select id="v3-goal" required><option value="">Escolha uma opção</option>${goalOptions()}</select></div><div class="v3-question"><label for="v3-operation">Como e onde você vende? *</label><select id="v3-operation" required><option value="">Escolha uma opção</option><option>Loja física</option><option>Loja física + online</option><option>E-commerce próprio</option><option>Instagram/WhatsApp com vendas ativas</option><option>Revenda por atendimento com clientes ativos</option><option>Estou retomando as vendas</option></select></div><div class="v3-question"><label for="v3-preference">O que suas clientes procuram? *</label><select id="v3-preference" required><option value="">Escolha uma opção</option><option value="variados">Preferências diferentes</option><option value="coracao">Corações e detalhes delicados</option><option value="geometrico">Formas mais retas</option><option value="brilho">Pontos de luz e brilho</option><option value="cor">Peças com cor</option><option value="simples">Linhas simples</option></select></div><fieldset class="v3-question wide"><legend>${state.entry==='category'?'Qual categoria quer reforçar? *':'Quais categorias quer ver? *'}</legend><div class="v3-checks">${['Brincos','Colares','Anéis','Pulseiras'].map(category=>`<label><input type="${state.entry==='category'?'radio':'checkbox'}" name="v3-category" value="${category}">${category}</label>`).join('')}</div></fieldset><div class="v3-question wide"><label for="v3-budget">Até quanto pretende investir em peças neste pedido? *</label><select id="v3-budget" required><option value="">Escolha uma opção</option><option value="30000">Até R$ 300</option><option value="60000">Até R$ 600</option><option value="100000">Até R$ 1.000</option><option value="150000">Até R$ 1.500</option><option value="300000">Até R$ 3.000</option><option value="500000">Até R$ 5.000</option><option value="undefined">Ainda não defini</option></select><p class="v3-help">É o seu limite para mercadorias antes de desconto, não uma meta de gasto. O frete não entra.</p></div></div><div id="v3-validation" class="v3-validation" role="alert"></div><div class="v3-form-actions"><button class="btn" type="submit">Ver sugestão de peças</button><a class="v3-link" href="#contato">Prefiro conversar com a consultora</a></div></form><div id="v3-results" class="v3-results" aria-live="polite"></div></div>`;
  }
  function startGuide(entry) {
    const oldGoal=state.goal;
    state.entry=entry;
    state.goal=entry==='generic'?'':entry==='category'?'categoria':entry;
    if(entry==='category'&&state.categories.length!==1)state.categories=[];
    if(oldGoal&&oldGoal!==state.goal) state.changedGoal=true;
    $('#v3-guide-app').innerHTML=guideMarkup();
    $('#v3-goal').value=state.goal;
    $('#v3-operation').value=state.operation;
    $('#v3-preference').value=state.preference;
    $('#v3-budget').value=state.budget;
    $$('[name="v3-category"]').forEach(el=>{el.checked=state.categories.includes(el.value)});
    if(entry==='category') { $('#v3-goal-question').hidden=true; $('#v3-goal').required=false; }
    else if(entry!=='generic') { $('#v3-goal-question').hidden=true; $('#v3-goal').required=false; }
    else { $('#v3-goal-question').hidden=false; $('#v3-goal').required=true; }
    if(entry!=='generic') { const line=$('#v3-choice-line');line.hidden=false;line.innerHTML=`<span>Sua escolha: <strong>${goalLabels[state.goal]}</strong></span><button type="button" id="v3-change-goal">Trocar objetivo</button>`; $('#v3-change-goal').addEventListener('click',()=>{readAnswers(false);track('goal_changed',{from:state.goal});startGuide('generic');}); }
    $('#v3-answers').addEventListener('submit',handleAnswers);
    if(!state.startedAt) state.startedAt=new Date().toISOString();
    track('guide_open',{entry,goal:state.goal||'unselected'});
    $('#simulacao').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function readAnswers(validate=true) {
    const goal=$('#v3-goal').value,operation=$('#v3-operation').value,preference=$('#v3-preference').value,budget=$('#v3-budget').value,categories=$$('[name="v3-category"]:checked').map(el=>el.value);
    const errors=[];
    if(!goal) errors.push('Escolha o objetivo do pedido.');
    if(!operation) errors.push('Informe como e onde vende.');
    if(!preference) errors.push('Marque o que suas clientes procuram.');
    if(!categories.length) errors.push('Escolha pelo menos uma categoria.');
    if(goal==='categoria'&&categories.length!==1) errors.push('Para reforçar uma categoria, escolha somente uma.');
    if(!budget) errors.push('Informe o limite para este pedido ou marque que ainda não definiu.');
    if(validate&&errors.length) {const box=$('#v3-validation');box.textContent=errors[0];box.classList.add('show');return false;}
    Object.assign(state,{goal,operation,preference,budget,categories});
    return true;
  }
  function compatible() {
    const tag=preferenceTags[state.preference];
    return products.filter(product=>state.categories.includes(product.category)&&(!tag||product.tags.includes(tag))&&(state.budget==='undefined'||product.cents<=Number(state.budget)));
  }
  function sortedPool(pool,variant=0) {
    const context=contexts.find(item=>item.key===state.goal),priorities=context?.ids||[];
    const preferred=product=>{const index=priorities.indexOf(product.id);return index<0?20:index};
    return [...pool].sort((a,b)=>variant===1?b.cents-a.cents:variant===2?a.cents-b.cents:preferred(a)-preferred(b)||a.cents-b.cents);
  }
  function buildSuggestion(pool,variant=0) {
    const ordered=sortedPool(pool,variant),budget=state.budget==='undefined'?150000:Number(state.budget),selected=[],seen=new Set();let sum=0;
    const add=product=>{if(sum+product.cents>budget||seen.has(product.id))return false;selected.push(product.id);seen.add(product.id);sum+=product.cents;return true;};
    const categories=state.goal==='completo'?[...state.categories].sort((a,b)=>a.localeCompare(b,'pt-BR')):state.categories;
    for(const category of categories){const candidate=ordered.find(product=>product.category===category&&!seen.has(product.id));if(candidate)add(candidate);}
    while(sum<MIN_CENTS&&selected.length<ordered.length){
      const counts=Object.fromEntries(categories.map(category=>[category,selected.filter(id=>byId[id].category===category).length]));
      const candidate=ordered.filter(product=>!seen.has(product.id)&&sum+product.cents<=budget).sort((a,b)=>(counts[a.category]||0)-(counts[b.category]||0)||ordered.indexOf(a)-ordered.indexOf(b))[0];
      if(!candidate)break;
      add(candidate);
    }
    return selected;
  }
  function handleAnswers(event) {
    event.preventDefault();
    if(!readAnswers())return;
    const pool=compatible();
    state.selected=buildSuggestion(pool,0);
    const key=ids=>[...ids].sort().join('|');const seen=new Set([key(state.selected)]);
    state.alternatives=[1,2].map(v=>buildSuggestion(pool,v)).filter(ids=>ids.length&&!seen.has(key(ids))&&seen.add(key(ids)));
    track('suggestion_exposed',{goal:state.goal,preference:state.preference,categories:state.categories.join(','),budget:state.budget,model_count:state.selected.length,subtotal_cents:totals().subtotal});
    renderResults();
    $('#v3-results').scrollIntoView({behavior:'smooth',block:'center'});
  }
  function renderResults() {
    const node=$('#v3-results');node.classList.add('show');
    if(!state.selected.length){node.innerHTML=`<div class="v3-result-note">Não encontramos uma sugestão compatível com essas respostas nesta amostra. Altere as categorias, a preferência ou o limite, ou converse com a consultora para ver outras peças.</div><div class="v3-result-actions"><button class="v3-text-button" type="button" data-edit>Alterar respostas</button><a class="btn" href="#contato">Conversar com a consultora</a></div>`;bindResults();updateContactSummary();return;}
    const t=totals();const pool=compatible();const available=pool.filter(product=>!state.selected.includes(product.id));
    const minimum=t.minimumMet?'Esta sugestão alcança o pedido mínimo de R$ 300.':'Esta amostra ainda não alcança o pedido mínimo de R$ 300. Você pode comparar outras peças ou ajustar com a consultora; não é um pedido pronto.';
    const pix=t.pixEligible?`10% OFF no PIX: −${money(t.discount)} · valor no PIX ${money(t.pix)}`:'10% OFF no PIX somente a partir de R$ 1.000 em peças (frete excluído).';
    node.innerHTML=`<div class="v3-result-head"><div><p class="eyebrow">Sugestão para comparar</p><h3>${state.goal==='categoria'?'Opções da categoria escolhida':goalLabels[state.goal]}</h3><p>${state.budget==='undefined'?'Exemplo até R$ 1.500 porque você ainda não definiu um limite.':'Dentro do limite informado para mercadorias.'}</p></div><div class="v3-total"><span>Subtotal em peças</span><strong>${money(t.subtotal)}</strong><span class="v3-pix">${t.pixEligible?`PIX: ${money(t.pix)}`:'Sem desconto PIX nesta faixa'}</span><small>Frete não incluído</small></div></div><div class="v3-result-note">${minimum}<br>${pix}<br>Uma referência de cada modelo para comparar preços. Isso não informa o número de peças físicas, pares ou kits; a consultora confirma unidade comercial, disponibilidade e numeração.</div><div class="v3-selected" tabindex="0" aria-label="Fotos das referências sugeridas">${state.selected.map(id=>{const p=byId[id];return `<article><img src="assets/catalog/${p.img}" alt="${escapeHtml(p.name)}" loading="lazy" width="300" height="300"><div><small>${id} · ${p.category}</small><strong>${escapeHtml(p.name)}</strong><b>${money(p.cents)}</b><button type="button" data-remove="${id}" aria-label="Retirar ${escapeHtml(p.name)}">Retirar</button></div></article>`}).join('')}</div><details class="v3-order-list"><summary>Conferir todas as ${state.selected.length} referências</summary><table><thead><tr><th>Código</th><th>Modelo</th><th>Categoria</th><th>Valor</th></tr></thead><tbody>${state.selected.map(id=>{const p=byId[id];return `<tr><td>${id}</td><td>${escapeHtml(p.name)}</td><td>${p.category}</td><td>${money(p.cents)}</td></tr>`}).join('')}</tbody></table></details>${state.alternatives.length?`<div class="v3-alt"><strong>Outras sugestões compatíveis</strong>${state.alternatives.map((ids,index)=>`<button type="button" data-alternative="${index}">Ver alternativa ${index+1}: ${ids.length} referências · ${money(totals(ids).subtotal)}</button>`).join('')}</div>`:''}${available.length?`<div class="v3-alt"><strong>Mais peças compatíveis para comparar</strong>${available.slice(0,4).map(p=>`<button type="button" data-add="${p.id}">Adicionar ${escapeHtml(p.name)} · ${money(p.cents)}</button>`).join('')}</div>`:''}<div class="v3-result-actions"><a class="btn" href="#contato" data-contact-selection>Conversar sobre essa seleção</a><button class="v3-text-button" type="button" data-edit>Alterar respostas</button></div>`;
    bindResults();updateContactSummary();
  }
  function bindResults(){const node=$('#v3-results');$$('[data-remove]',node).forEach(button=>button.addEventListener('click',()=>{state.selected=state.selected.filter(id=>id!==button.dataset.remove);track('item_removed',{code:button.dataset.remove,subtotal_cents:totals().subtotal});renderResults();}));$$('[data-add]',node).forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.add,budget=state.budget==='undefined'?150000:Number(state.budget);if(totals().subtotal+byId[id].cents>budget)return;state.selected.push(id);track('item_added',{code:id,subtotal_cents:totals().subtotal});renderResults();}));$$('[data-alternative]',node).forEach(button=>button.addEventListener('click',()=>{state.selected=[...state.alternatives[Number(button.dataset.alternative)]];track('alternative_selected',{subtotal_cents:totals().subtotal});renderResults();}));$$('[data-edit]',node).forEach(button=>button.addEventListener('click',()=>{$('#v3-answers').scrollIntoView({behavior:'smooth',block:'start'});$('#v3-operation').focus();}));$('[data-contact-selection]',node)?.addEventListener('click',()=>track('contact_selection_click',{subtotal_cents:totals().subtotal}));}
  function updateContactSummary(){const box=$('#v3-contact-summary'),button=$('#submit-form');if(!state.goal){box.textContent='Sem simulação. A consultora também pode ajudar você a comparar as peças.';button.textContent='Conversar com a consultora';return;}const t=totals();box.textContent=`Objetivo: ${goalLabels[state.goal]}\nComo vende: ${state.operation||'não informado'}\nCategorias: ${state.categories.join(', ')||'não informadas'}\nLimite em peças: ${state.budget==='undefined'?'a definir':state.budget?money(Number(state.budget)):'não informado'}\n${state.selected.length?`Modelos: ${state.selected.map(id=>`${id} (${byId[id].name})`).join(', ')}\nSubtotal: ${money(t.subtotal)} · PIX: ${t.pixEligible?money(t.pix):'não aplicável'}`:'Sem modelos escolhidos nesta amostra.'}\nA consultora confirma disponibilidade, unidade comercial e numeração; o pedido pode ser ajustado.`;button.textContent=state.selected.length?'Conversar sobre essa seleção':'Conversar com a consultora';}
  function attribution(){const params=new URLSearchParams(location.search),fields=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'];return Object.fromEntries(fields.map(field=>[field,params.get(field)||'']));}
  function appendRouteFallback(payload) {
    if(payload.get('origem_detalhada'))return;
    const query=new URLSearchParams(location.search),reason=query.get('hilst_route_reason');
    const reasons={prefers_remote:'Preferiu atendimento remoto',below_3000:'Pedido abaixo de R$ 3.000',not_selling_yet:'Ainda não vende'};
    if(query.get('hilst_route')!=='presencial_para_remoto'||!reasons[reason])return;
    const campaign=query.get('utm_campaign')||'',id=(query.get('hilst_route_id')||'').replace(/[^a-zA-Z0-9-]/g,'').slice(0,100);
    payload.set('origem_detalhada',`LP Representante → Atacado remoto | ${reasons[reason]}${campaign?` | Campanha: ${campaign.slice(0,500)}`:''}`);
    payload.set('route_origin','representante');payload.set('route_reason',reason);payload.set('route_id',id);
    payload.set('observacoes_iniciais',`${payload.get('observacoes_iniciais')||''} | ${payload.get('origem_detalhada')} | Identificador do caminho: ${id}`);
    try {
      const entry=new URL(query.get('hilst_entry_url')||'https://representante.hilstjoiasemprata.com.br/');
      if(entry.protocol==='https:'&&entry.hostname==='representante.hilstjoiasemprata.com.br') {
        const allowed=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id','fbclid'];
        [...entry.searchParams.keys()].forEach(key=>{if(!allowed.includes(key))entry.searchParams.delete(key);});entry.hash='';
        payload.set('landing_url',entry.href);
      }
    }catch(_){}
  }
  function buildPayload(data){const t=totals();const payload=new URLSearchParams();for(const[key,value]of data.entries())payload.set(key,String(value));const notes=`Objetivo: ${goalLabels[state.goal]||'Contato direto'} | Preferência: ${state.preference||'não informada'} | Categorias: ${state.categories.join(', ')||'não informadas'} | Teto mercadorias: ${state.budget==='undefined'?'não definido':state.budget?money(Number(state.budget)):'não informado'} | Modelos: ${state.selected.map(id=>`${id} [grupo ${byId[id].group}] x1 ${money(byId[id].cents)}`).join('; ')||'sem simulação'} | Subtotal: ${money(t.subtotal)} | PIX: ${t.pixEligible?`${money(t.discount)} de desconto; líquido ${money(t.pix)}`:'não elegível'} | selection_id: ${state.selectionId} | regra: ${RULE_VERSION} | catálogo: ${CATALOG_SNAPSHOT}`;
    payload.set('whatsapp',`55${String(data.get('whatsapp')||'').replace(/\D/g,'').replace(/^55/,'')}`);payload.set('operacao',state.operation);payload.set('investimento',state.budget==='undefined'?'Não definido':state.budget?`Até ${money(Number(state.budget))}`:'A confirmar');payload.set('objetivo',goalLabels[state.goal]||'Contato direto');payload.set('necessidade',goalLabels[state.goal]||'Contato direto');payload.set('categorias',state.categories.join(', ')||'A confirmar');payload.set('perfil_preco',state.preference||'A confirmar');payload.set('observacoes_iniciais',notes);payload.set('origem_lp','LP ICP2');payload.set('oferta_icp_origem','ICP2 | Seleção guiada');payload.set('form_version',RULE_VERSION);payload.set('lp_variant','guided_v3');const completedAt=new Date();payload.set('form_started_at',state.startedAt||completedAt.toISOString());payload.set('form_completed_at',completedAt.toISOString());payload.set('form_duration_seconds',String(Math.max(0,Math.round((completedAt-new Date(state.startedAt||completedAt))/1000))));payload.set('elegivel_meta','Sim');payload.set('selection_id',state.selectionId);payload.set('selection_rule_version',RULE_VERSION);payload.set('catalog_snapshot',CATALOG_SNAPSHOT);payload.set('selection_subtotal_cents',String(t.subtotal));payload.set('selection_pix_discount_cents',String(t.discount));payload.set('selection_items_json',JSON.stringify(state.selected.map(id=>({code:id,sku_group:byId[id].group,quantity_proposed:1,unit_price_cents:byId[id].cents}))));payload.set('landing_url',location.href);payload.set('event_source_url',location.href);payload.set('referrer',document.referrer);Object.entries(attribution()).forEach(([key,value])=>payload.set(key,value));window.HilstTracking?.appendToPayload(payload);return payload;}
  async function sendLeadWithRetry(payload,status){
    const endpoint=window.HILST_LEAD_ROUTING_ENDPOINT;
    if(!endpoint)throw new Error('Serviço de cadastro indisponível.');
    let lastError;
    for(let attempt=1;attempt<=3;attempt++){
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),18000);
      try{
        const response=await fetch(endpoint,{method:'POST',body:payload,cache:'no-store',signal:controller.signal});
        if(!response.ok)throw new Error(`Falha temporária (${response.status}).`);
        const result=await response.json();
        if(!result.ok){const error=new Error(result.error||'Não foi possível concluir o envio.');error.isBusinessError=true;throw error;}
        if(!result.leadId)throw new Error('Resposta de cadastro incompleta.');
        return result;
      }catch(error){
        lastError=error;
        if(error.isBusinessError||attempt===3)throw error;
        status.textContent='A conexão oscilou. Estamos confirmando seus dados sem criar outro cadastro...';
        status.className='status show notice';
        await new Promise(resolve=>setTimeout(resolve,attempt*900));
      }finally{clearTimeout(timeout);}
    }
    throw lastError;
  }
  async function handleContact(event){
    event.preventDefault();
    const form=event.currentTarget,status=$('#form-status'),submit=$('#submit-form');
    if(form.website_check.value)return;
    for(const field of [form.nome,form.whatsapp,form.cidade]){if(!field.value.trim()){field.reportValidity();return;}}
    const phone=String(form.whatsapp.value).replace(/\D/g,'').replace(/^55/,'');
    if(phone.length<10||phone.length>11){form.whatsapp.setCustomValidity('Informe um WhatsApp com DDD.');form.whatsapp.reportValidity();form.whatsapp.setCustomValidity('');return;}
    const payload=buildPayload(new FormData(form));
    appendRouteFallback(payload);
    if(PREVIEW_MODE){status.className='status show notice';status.textContent='Prévia: o formulário foi conferido, mas nenhum dado foi enviado à planilha ou ao WhatsApp. Resumo da escolha acima.';track('preview_form_validated',{has_selection:state.selected.length>0,subtotal_cents:totals().subtotal});return;}
    submit.disabled=true;submit.textContent='Enviando...';status.className='status';
    try{
      const result=await sendLeadWithRetry(payload,status),consultant=result.consultant||{};
      if(result.leadId && !result.duplicate){window.HilstTracking?.trackLead(result.leadId);window.HilstTracking?.trackContact(result.leadId);}
      if(result.leadId)window.HilstTracking?.trackRegisteredContact(result.leadId,!!result.duplicate);
      const consultantPhone=String(consultant.phone||'').replace(/\D/g,'');
      if(!/^55\d{10,11}$/.test(consultantPhone)){
        status.textContent='Seus dados foram registrados, mas não conseguimos abrir o WhatsApp automaticamente. A Hilst seguirá com o atendimento.';
        status.className='status show notice';
        submit.disabled=false;submit.textContent='Conversar com a consultora';
        return;
      }
      const summary=state.selected.length?`Modelos que quero comparar: ${state.selected.map(id=>`${id} (${byId[id].name})`).join(', ')}`:'Quero ver opções do atacado Hilst.';
      const message=[`Olá, ${consultant.name||'consultora Hilst'}! Preenchi o formulário no site da Hilst.`,summary,`Objetivo: ${goalLabels[state.goal]||'conhecer o atacado'}`,`Categorias: ${state.categories.join(', ')||'a definir'}`,`Até quanto quero investir: ${state.budget==='undefined'?'a definir':state.budget?money(Number(state.budget)):'a definir'}`,`Cidade: ${form.cidade.value.trim()}`,`Meu nome: ${form.nome.value.trim()}`].join('\n');
      status.textContent=`${result.serviceMessage||'Dados recebidos.'} Abrindo o WhatsApp de ${consultant.name||'sua consultora'}...`;
      status.className='status show success';
      setTimeout(()=>window.location.assign(`https://wa.me/${consultantPhone}?text=${encodeURIComponent(message)}`),700);
    }catch(error){
      console.error(error);window.HilstTracking?.trackFormError(error.message||'submit_error');
      status.textContent='Não conseguimos registrar seus dados agora. Confira sua conexão e tente novamente.';
      status.className='status show error';submit.disabled=false;submit.textContent='Conversar com a consultora';
    }
  }
  function init(){renderContexts();$('#v3-guide-app').innerHTML='<div class="v3-panel"><p>Escolha um dos caminhos acima ou clique em “Simular meu próximo pedido”.</p><button class="btn" type="button" data-start="generic">Começar simulação</button></div>';const openCategories=$('#v3-open-categories'),categoryChoices=$('#v3-category-choices');openCategories.addEventListener('click',()=>{categoryChoices.hidden=!categoryChoices.hidden;openCategories.setAttribute('aria-expanded',String(!categoryChoices.hidden));openCategories.textContent=categoryChoices.hidden?'Ver categorias':'Ocultar categorias';if(!categoryChoices.hidden){$('[data-category-choice]',categoryChoices).focus();track('category_options_open');}});document.addEventListener('click',event=>{const category=event.target.closest('[data-category-choice]');if(category){state.categories=[category.dataset.categoryChoice];track('category_path_select',{category:category.dataset.categoryChoice});startGuide('category');return;}const button=event.target.closest('[data-start]');if(button)startGuide(button.dataset.start);});$('#lead-form').addEventListener('submit',handleContact);$('#lead-form').addEventListener('focusin',()=>{if(!state.startedAt)state.startedAt=new Date().toISOString();if(!PREVIEW_MODE)window.HilstTracking?.trackFormStart(RULE_VERSION);},{once:true});updateContactSummary();const mobile=$('.mobile-cta'),contextStart=$('#pecas');const sync=()=>mobile.classList.toggle('visible',innerWidth<=680&&scrollY>Math.min(620,innerHeight*.72)&&contextStart.getBoundingClientRect().top>innerHeight*.85);addEventListener('scroll',sync,{passive:true});addEventListener('resize',sync);sync();window.HilstV3Debug=Object.freeze({products,contexts,totals,buildSuggestion,compatible,state,buildPayload});track('preview_loaded',{source:attribution().utm_source||'direct'});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
