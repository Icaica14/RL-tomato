import { useMemo, useState } from 'react';
import { Algorithm, EpisodeMetric, FormulaDetails, RLParameters, UpdateLogEntry } from './types/rl';
import { ActionId, PlantState, TomatoCell, TomatoConfig } from './types/tomato';
import { bucketIndex, defaultInitialState, stepEnvironment } from './rl/environment';
import { createCounts, createQTable, createSACounts, createVTable, actions } from './rl/valueTables';
import { td0Update } from './rl/tdPrediction';
import { qLearningUpdate } from './rl/qLearning';
import { sarsaUpdate } from './rl/sarsa';
import { bestAction, epsilonGreedy, policyProbabilities } from './rl/policies';
import { createSeededRandom } from './utils/random';
import { balancedTomato, presets } from './presets/tomatoPresets';
import { exportConfig, importConfig, logToCsv, logToJson } from './utils/serialization';

const actionLabels: Record<ActionId, string> = { do_nothing: 'Non fare nulla', water: 'Annaffia', fertilize: 'Fertilizza' };
const modeLabels: Record<Algorithm, string> = {
  'Manual Mode': 'Modalità manuale',
  'TD(0) Prediction': 'TD(0) predizione',
  SARSA: 'SARSA',
  'Q-learning': 'Q-learning',
  'Monte Carlo': 'Monte Carlo',
  'Compare algorithms': 'Confronta algoritmi',
};
const initialParams: RLParameters = { alpha: 0.3, gamma: 0.9, epsilon: 0.2, epsilonDecay: 0.98, minEpsilon: 0.02, optimisticInitialization: false, initialV: 0, initialQ: 0, trainingEpisodes: 100, maxStepsPerEpisode: 30, seed: 7, speed: 300 };

function quality(value: number, balanced = false) {
  if (balanced) {
    if (value < 30) return { text: 'troppo basso', className: 'bad' };
    if (value > 70) return { text: 'troppo alto', className: 'bad' };
    if (value < 40 || value > 60) return { text: 'attenzione', className: 'warn' };
    return { text: 'buono', className: 'good' };
  }
  if (value < 35) return { text: 'troppo basso', className: 'bad' };
  if (value < 65) return { text: 'medio', className: 'warn' };
  return { text: 'buono', className: 'good' };
}

function policyText(tab: Algorithm) {
  if (tab === 'Manual Mode') return 'L’azione la scegli tu manualmente. L’agente non sta ancora imparando una policy autonoma.';
  if (tab === 'TD(0) Prediction') return 'TD(0) valuta gli stati. In questa modalità la policy può essere manuale o casuale: l’obiettivo è stimare V(s), non scegliere automaticamente l’azione migliore.';
  if (tab === 'SARSA' || tab === 'Q-learning') return 'L’azione viene scelta con policy epsilon-greedy: con probabilità ε l’agente esplora scegliendo un’azione casuale; altrimenti sceglie l’azione con Q(s,a) più alto.';
  return 'Questa scheda è didattica: osserva log, grafici e valori per confrontare ciò che l’agente ha imparato.';
}

function valueColor(value: number, min: number, max: number) {
  if (max === min) return '#eef5ec';
  const t = (value - min) / (max - min);
  const r = Math.round(210 - 120 * t);
  const g = Math.round(70 + 130 * t);
  return `rgb(${r}, ${g}, 80)`;
}

export default function App() {
  const [config, setConfig] = useState<TomatoConfig>(balancedTomato());
  const [plant, setPlant] = useState<PlantState>(defaultInitialState);
  const [tab, setTab] = useState<Algorithm>('Manual Mode');
  const [params, setParams] = useState(initialParams);
  const [v, setV] = useState(() => createVTable(config));
  const [q, setQ] = useState(() => createQTable(config));
  const [visits, setVisits] = useState(() => createCounts(config));
  const [saVisits, setSaVisits] = useState(() => createSACounts(config));
  const [selected, setSelected] = useState('cell-2-2');
  const [log, setLog] = useState<UpdateLogEntry[]>([]);
  const [pickedLog, setPickedLog] = useState<UpdateLogEntry>();
  const [formula, setFormula] = useState<FormulaDetails>();
  const [episode, setEpisode] = useState(1);
  const [metrics, setMetrics] = useState<EpisodeMetric[]>([]);
  const [lesson, setLesson] = useState(true);
  const [logExpanded, setLogExpanded] = useState(false);
  const rand = useMemo(() => createSeededRandom(params.seed + log.length), [params.seed, log.length]);
  const selectedCell = config.cells.find((c) => c.id === selected)!;
  const currentCell = config.cells.find((c) => c.id === plant.currentCellId)!;
  const probs = policyProbabilities(q, selected, params.epsilon);
  const vValues = Object.values(v);
  const maxVisits = Math.max(1, ...Object.values(visits));

  function resetValues(c = config) {
    setV(createVTable(c, params.initialV)); setQ(createQTable(c, params.initialQ)); setVisits(createCounts(c)); setSaVisits(createSACounts(c)); setFormula(undefined); setLog([]);
  }
  function resetEnv() { setPlant({ ...defaultInitialState, currentCellId: 'cell-2-2' }); setEpisode((e) => e + 1); }
  function record(result: ReturnType<typeof stepEnvironment>, actionId: ActionId, alg: Algorithm, f?: FormulaDetails) {
    setVisits((x) => ({ ...x, [result.nextState.currentCellId]: (x[result.nextState.currentCellId] ?? 0) + 1 }));
    setSaVisits((x) => ({ ...x, [result.previousState.currentCellId]: { ...x[result.previousState.currentCellId], [actionId]: (x[result.previousState.currentCellId]?.[actionId] ?? 0) + 1 } }));
    const entry: UpdateLogEntry = { id: `${Date.now()}-${log.length}`, episode, step: result.nextState.day, algorithm: alg, previousStateId: result.previousState.currentCellId, action: actionId, reward: result.reward, nextStateId: result.nextState.currentCellId, done: result.done, terminalReason: result.terminalReason, oldValue: f?.oldValue, target: f?.target, error: f?.error, newValue: f?.newValue, explanation: [result.explanation.plainLanguage, f?.explanation].filter(Boolean).join(' '), stepExplanation: result.explanation, formula: f };
    setLog((l) => [entry, ...l]); setPickedLog(entry); if (f) setFormula(f); if (result.done) setMetrics((m) => [...m, { episode, totalReward: result.reward, length: result.nextState.day, algorithm: alg }]);
  }
  function take(actionId: ActionId, alg = tab) {
    const start = plant.alive ? plant : { ...defaultInitialState };
    const result = stepEnvironment(start, actionId, config);
    let f: FormulaDetails | undefined;
    if (alg === 'TD(0) Prediction') { const u = td0Update(v, start.currentCellId, result.reward, result.nextState.currentCellId, result.done, params.alpha, params.gamma); setV(u.table); f = u.formula; }
    if (alg === 'Q-learning') { const u = qLearningUpdate(q, start.currentCellId, actionId, result.reward, result.nextState.currentCellId, result.done, params.alpha, params.gamma); setQ(u.table); f = u.formula; }
    if (alg === 'SARSA') { const next = epsilonGreedy(q, result.nextState.currentCellId, params.epsilon, rand); const u = sarsaUpdate(q, start.currentCellId, actionId, result.reward, result.nextState.currentCellId, next, result.done, params.alpha, params.gamma); setQ(u.table); f = u.formula; }
    setPlant(result.done ? { ...result.nextState, alive: false } : result.nextState); record(result, actionId, alg, f);
  }
  function algorithmStep() { const alg = tab === 'Manual Mode' ? 'Q-learning' : tab; take(epsilonGreedy(q, plant.currentCellId, params.epsilon, rand), alg); }
  function runEpisode() { let localPlant = { ...defaultInitialState }; let total = 0; let len = 0; for (let i = 0; i < params.maxStepsPerEpisode && !(!localPlant.alive || localPlant.day >= config.harvestDay); i++) { const a = epsilonGreedy(q, localPlant.currentCellId, params.epsilon, rand); const r = stepEnvironment(localPlant, a, config); total += r.reward; len = r.nextState.day; localPlant = r.nextState; } setMetrics((m) => [...m, { episode, totalReward: total, length: len, algorithm: tab }]); setPlant(localPlant); }
  function runN() { for (let i = 0; i < params.trainingEpisodes; i++) runEpisode(); }
  function updateCell(p: Partial<TomatoCell>) { setConfig((c) => ({ ...c, cells: c.cells.map((cell) => (cell.id === selected ? { ...cell, ...p } : cell)) })); }
  function loadPreset(i: number) { const c = JSON.parse(JSON.stringify(presets[i].config)); setConfig(c); resetValues(c); setPlant(defaultInitialState); }
  function download(name: string, text: string) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = name; a.click(); }

  const renderBar = (label: string, value: number, balanced = false) => { const ql = quality(value, balanced); return <div className="state-row"><span>{label}</span><div className={`state-bar ${balanced ? 'balanced' : 'positive'}`}><i style={{ width: `${value}%` }} /></div><strong className={ql.className}>{value} · {ql.text}</strong></div>; };

  return <div>
    <header className="top"><h1>🍅 RL Tomato Lab</h1><p>Laboratorio didattico deterministico: osserva insieme stato, azione, ricompensa, terminale, aggiornamento del valore e policy.</p></header>
    <nav className="tabs">{(['Manual Mode', 'TD(0) Prediction', 'SARSA', 'Q-learning', 'Monte Carlo', 'Compare algorithms'] as Algorithm[]).map((t) => <button key={t} title={t === 'TD(0) Prediction' ? 'Stima il valore degli stati aggiornando V(s) dopo ogni passo.' : t === 'SARSA' ? 'Impara Q(s,a) usando l’azione successiva scelta davvero.' : t === 'Q-learning' ? 'Impara Q(s,a) usando la migliore azione stimata nello stato successivo.' : undefined} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{modeLabels[t]}</button>)}</nav>

    <main className="dashboard">
      <section className="card grid-panel">
        <h2>Tomato GridWorld</h2><p className="hint">Ogni cella è una condizione della pianta: acqua sull’asse orizzontale, nutrienti sull’asse verticale.</p>
        <div className="axis-wrap"><div className="y-axis"><b>Nutrienti ↑</b><span>troppi nutrienti</span><span>pochi nutrienti</span></div><div><div className="grid">{config.cells.slice().reverse().map((c) => <button key={c.id} onClick={() => setSelected(c.id)} className={`cell ${plant.currentCellId === c.id ? 'current' : ''} ${selected === c.id ? 'selected' : ''}`}><span role="button" tabIndex={0} className="edit-dot" title="Modifica conseguenze di questa cella" aria-label="Modifica conseguenze di questa cella" onClick={(e) => { e.stopPropagation(); setSelected(c.id); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); setSelected(c.id); } }}>✎</span><b>{c.label}</b><small>A:{c.waterBucketLabel}</small><small>N:{c.nutrientBucketLabel}</small><span>V {v[c.id].toFixed(1)} · visite {visits[c.id]}</span><em>{config.actions[bestAction(q, c.id)].badge}</em></button>)}</div><div className="x-axis"><span>poca acqua</span><b>Acqua →</b><span>troppa acqua</span></div></div></div>
        <div className="legend"><b>Badge policy:</b> Ø = Non fare nulla · H₂O = Annaffia · Nut = Fertilizza</div>
        <ul className="movement"><li>Annaffia → aumenta l’acqua → tende a spostare lo stato verso destra.</li><li>Fertilizza → aumenta i nutrienti → tende a spostare lo stato verso l’alto.</li><li>Non fare nulla → la pianta consuma risorse → tende a scendere/sinistra.</li></ul>
      </section>

      <section className="stack">
        <section className="card compact"><h2>Stato della pianta</h2><p className="hint">Qui vedi le variabili reali della pianta dopo ogni azione.</p><p>Giorno {plant.day} / {config.harvestDay} · Stato: <b>{plant.alive ? 'viva' : 'terminale'}</b></p>{renderBar('Acqua', plant.waterLevel, true)}{renderBar('Nutrienti', plant.nutrientLevel, true)}{renderBar('Salute', plant.health)}{renderBar('Frutti', plant.fruitProgress)}<p>Cella corrente: <b>{currentCell?.label}</b></p></section>
        <section className="card compact"><h2>Azioni</h2><p className="hint">Scegli un trattamento: l’ambiente aggiorna acqua, nutrienti, salute, frutti e ricompensa.</p>{actions.map((a) => <button key={a} disabled={!plant.alive} onClick={() => take(a, 'Manual Mode')}>{config.actions[a].badge} {actionLabels[a]} ({config.actions[a].actionCost})</button>)}{actions.map((a) => <p key={a} className="mini"><b>{actionLabels[a]}:</b> {config.actions[a].explanation}</p>)}</section>
        <section className="card compact"><h2>Editor cella</h2><p className="hint">Modifica che cosa significa la regione selezionata.</p><select value={selectedCell.cellType} onChange={(e) => updateCell({ cellType: e.target.value as TomatoCell['cellType'] })}>{['Balanced growth', 'Dry stress', 'Overwatered', 'Nutrient deficiency', 'Nutrient excess', 'Double stress', 'Recovery', 'Dead / terminal', 'Harvest / terminal', 'Custom'].map((x) => <option key={x}>{x}</option>)}</select><input value={selectedCell.label} onChange={(e) => updateCell({ label: e.target.value })} /><textarea value={selectedCell.explanation} onChange={(e) => updateCell({ explanation: e.target.value })} />{(['rewardOnEnter', 'healthDelta', 'fruitDelta'] as const).map((k) => <label key={k}>{k}<input type="number" value={selectedCell[k]} onChange={(e) => updateCell({ [k]: Number(e.target.value) })} /></label>)}<label>terminale <input type="checkbox" checked={selectedCell.terminal} onChange={(e) => updateCell({ terminal: e.target.checked })} /></label></section>
      </section>

      <section className="stack">
        <section className="card compact"><h2>Pannello algoritmo</h2><p className="hint">Qui decidi come l’agente sceglie le azioni e come impara dai risultati.</p><h3>Come viene scelta l’azione?</h3><p>{policyText(tab)}</p><p className="deterministic">Gli stati successivi non sono randomici in v1. Le transizioni sono deterministiche; la casualità riguarda solo la scelta dell’azione quando epsilon &gt; 0.</p>{tab === 'Monte Carlo' && <p>Monte Carlo aspetta la fine dell’episodio, usa il ritorno totale reale e non fa bootstrap da V(s').</p>}
          <div className="button-row"><button title="Fa compiere una sola azione all’agente e mostra immediatamente stato successivo, ricompensa e aggiornamento." onClick={algorithmStep}>Esegui un passo</button><button title="Fa andare avanti la simulazione fino alla morte della pianta o al giorno di raccolta." onClick={runEpisode}>Esegui un episodio</button><button title="Allena l’agente su molti episodi consecutivi per vedere come cambiano V(s), Q(s,a) e policy." onClick={runN}>Esegui {params.trainingEpisodes} episodi</button><button title="Riporta la pianta allo stato iniziale, senza necessariamente cancellare ciò che l’agente ha imparato." onClick={resetEnv}>Reset ambiente</button><button title="Azzera quello che l’agente ha imparato: V(s), Q(s,a), conteggi e log." onClick={() => resetValues()}>Reset valori</button></div>
          <h3>Policy corrente · ε = {params.epsilon.toFixed(2)}</h3>{actions.map((a) => <p key={a}>{actionLabels[a]}: <progress value={probs[a]} max={1} /> {(probs[a] * 100).toFixed(0)}% · Q={q[selected][a].toFixed(2)} · conteggio={saVisits[selected][a]}</p>)}
          <details><summary>Avanzato: parametri e seed</summary>{(['alpha', 'gamma', 'epsilon', 'epsilonDecay', 'minEpsilon', 'initialV', 'initialQ', 'trainingEpisodes', 'maxStepsPerEpisode', 'seed', 'speed'] as const).map((k) => <label key={k}>{k}<input type="number" step="0.01" value={params[k]} onChange={(e) => setParams((p) => ({ ...p, [k]: Number(e.target.value) }))} /></label>)}<p><b>alpha</b>: quanto una nuova esperienza cambia la stima. <b>gamma</b>: quanto conta il futuro. <b>epsilon</b>: quanto spesso l’agente esplora.</p></details>
        </section>

        <section className="card formula compact"><h2>Pannello formula: come si aggiorna il valore</h2><p className="hint">Questo pannello mostra il calcolo con cui l’algoritmo modifica V(s) o Q(s,a) dopo una transizione.</p>{formula ? <><h3>A. Formula simbolica</h3><code>{formula.symbolic}</code><h3>B. Formula con numeri reali</h3><code>{formula.numerical}</code><h3>C. Significato pratico dei pezzi</h3><ul><li>Valore vecchio = {formula.oldValue?.toFixed(3)}</li><li>r = {formula.reward?.toFixed(3)}, ricompensa appena ricevuta</li><li>γ = {formula.gamma}, peso del futuro</li><li>Valore prossimo = {formula.nextValue?.toFixed(3)}</li><li>target = {formula.target?.toFixed(3)}</li><li>errore = {formula.error?.toFixed(3)}</li></ul><h3>D. Risultato finale</h3><p>Nuovo valore = <b>{formula.newValue?.toFixed(3)}</b></p><h3>E. Spiegazione semplice</h3><p>{formula.explanation}</p></> : <p>Nessun aggiornamento ancora. Fai un’azione o avvia un episodio per vedere la formula applicata.</p>}</section>
        <section className="card compact"><h2>Lezione passo-passo <input type="checkbox" checked={lesson} onChange={(e) => setLesson(e.target.checked)} /></h2>{lesson && <p>{pickedLog?.explanation ?? 'Scegli un’azione per vedere perché ogni numero è cambiato.'}</p>}</section>
      </section>
    </main>

    <section className="bottom">
      <section className="card"><h2>Grafici di apprendimento</h2><p className="hint">Questi grafici servono a vedere se l’agente sta migliorando nel tempo.</p>{metrics.length === 0 && <p>Non ci sono ancora dati. Esegui uno o più episodi per popolare i grafici.</p>}<h3>Ricompensa totale per episodio</h3><p className="mini">Se questo valore cresce nel tempo, l’agente sta imparando a ottenere risultati migliori.</p><div className="bars">{metrics.slice(-30).map((m, i) => <div key={i} title={`episodio ${m.episode}: ricompensa ${m.totalReward}`} style={{ height: Math.max(4, Math.abs(m.totalReward)) }} />)}</div><h3>Durata episodio</h3><p className="mini">Mostra quanti passi dura ogni episodio: basso se la pianta muore presto, massimo se arriva alla raccolta.</p><p>{metrics.slice(-12).map((m) => m.length).join(', ') || '—'}</p><h3>Heatmap V(s)</h3><p className="mini">Verde significa valore alto, rosso valore basso.</p><div className="heatmap">{config.cells.slice().reverse().map((c) => <span key={c.id} style={{ background: valueColor(v[c.id], Math.min(...vValues), Math.max(...vValues)) }}>{v[c.id].toFixed(1)}</span>)}</div><h3>Frequenza visite stati</h3><p className="mini">Mostra in quali stati l’agente passa più spesso.</p><div className="heatmap">{config.cells.slice().reverse().map((c) => <span key={c.id} style={{ opacity: 0.25 + 0.75 * (visits[c.id] / maxVisits) }}>{visits[c.id]}</span>)}</div></section>
      <section className="card"><h2>Registro aggiornamenti</h2><p className="hint">Qui vedi la memoria cronologica delle esperienze dell’agente. Ogni riga corrisponde a una transizione o a un aggiornamento: stato precedente, azione, ricompensa, nuovo stato e valore aggiornato.</p><button onClick={() => setLogExpanded((x) => !x)}>{logExpanded ? 'Riduci registro' : 'Espandi registro'}</button><div className={`log-box ${logExpanded ? 'expanded' : ''}`}><table><thead><tr><th>Episodio</th><th>Passo</th><th>Algoritmo</th><th>Stato precedente</th><th>Azione</th><th>Ricompensa</th><th>Stato successivo</th><th>Terminale?</th><th>Valore vecchio</th><th>Target</th><th>Errore</th><th>Valore nuovo</th></tr></thead><tbody>{log.map((r) => <tr key={r.id} onClick={() => setPickedLog(r)}><td>{r.episode}</td><td>{r.step}</td><td>{modeLabels[r.algorithm]}</td><td>{r.previousStateId}</td><td>{actionLabels[r.action]}</td><td>{r.reward}</td><td>{r.nextStateId}</td><td>{r.done ? 'sì' : 'no'}</td><td>{r.oldValue?.toFixed(2)}</td><td>{r.target?.toFixed(2)}</td><td>{r.error?.toFixed(2)}</td><td>{r.newValue?.toFixed(2)}</td></tr>)}</tbody></table></div>{pickedLog && <details><summary>Dettaglio riga selezionata</summary><pre>{JSON.stringify(pickedLog, null, 2)}</pre></details>}</section>
      <section className="card"><details><summary>Avanzato: preset, import/export e salvataggio</summary><select onChange={(e) => loadPreset(Number(e.target.value))}>{presets.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}</select><button onClick={() => localStorage.setItem('rl-tomato-config', exportConfig(config))}>Salva in localStorage</button><button onClick={() => { const s = localStorage.getItem('rl-tomato-config'); if (s) setConfig(importConfig(s)); }}>Carica salvataggio</button><button onClick={() => download('config.json', exportConfig(config))}>Esporta config JSON</button><button onClick={() => download('registro.json', logToJson(log))}>Esporta registro JSON</button><button onClick={() => download('registro.csv', logToCsv(log))}>Esporta registro CSV</button><textarea placeholder="Incolla config JSON, poi esci dal campo" onBlur={(e) => { if (e.currentTarget.value.trim()) setConfig(importConfig(e.currentTarget.value)); }} /></details></section>
    </section>
  </div>;
}
