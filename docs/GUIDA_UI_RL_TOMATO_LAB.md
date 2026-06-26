# Guida a RL Tomato Lab

> Screenshot: inserire screenshot reale dopo avvio locale: `docs/images/01-dashboard.png`.

## 1. Perché esiste questa UI

RL Tomato Lab esiste per rendere visibile il ciclo del reinforcement learning. In un libro è facile leggere la sequenza **stato → azione → reward → stato successivo → aggiornamento**, ma è molto più difficile capire che cosa osservare mentre succede. Questa UI mette quei pezzi nello stesso schermo.

L’obiettivo non è simulare davvero un pomodoro. La pianta è un ambiente didattico semplice: acqua e nutrienti determinano una condizione astratta, l’agente sceglie trattamenti, l’ambiente restituisce una ricompensa e gli algoritmi correggono V(s) o Q(s,a).

## 2. Collegamento al Capitolo 4

Il Capitolo 4, “Learning from What Actually Happened”, introduce l’idea centrale: l’agente impara dall’esperienza osservata, non da una descrizione perfetta del mondo. In questa UI l’esperienza è un passo concreto: ero in una cella, ho scelto Annaffia/Fertilizza/Non fare nulla, sono arrivato in una nuova cella e ho ricevuto una ricompensa.

Monte Carlo aspetta la fine dell’episodio per usare il ritorno totale reale. TD impara dopo un solo passo usando bootstrap: reward appena ricevuta più una stima del valore dello stato successivo. Il Pannello formula serve a vedere questo bootstrap.

| Concetto del libro | Elemento nella UI |
| --- | --- |
| state / stato | cella corrente nella griglia acqua/nutrienti |
| action / azione | Annaffia, Fertilizza, Non fare nulla |
| reward | Ricompensa mostrata dopo il passo |
| episode | stagione simulata fino a morte o raccolta |
| V(s) | valore mostrato nella cella |
| Q(s,a) | valori azione nella cella selezionata |
| TD error | “errore” nel Pannello formula |
| policy | probabilità delle azioni nel Pannello algoritmo |

## 3. Che cosa significa la griglia

La griglia è un piano cartesiano degli stati:

- X = acqua;
- Y = nutrienti;
- verso destra = più acqua;
- verso l’alto = più nutrienti;
- il centro bilanciato è in genere sano;
- gli estremi sono pericolosi.

> Screenshot: inserire screenshot reale dopo avvio locale: `docs/images/02-grid-axes.png`.

La scala colore di default è una **scala di condizione della pianta**: rosso per pericolo, giallo per attenzione, verde per condizione favorevole. Non confonderla con la heatmap V(s): la prima parla della pianta, la seconda parla di ciò che l’agente ha imparato.

## 4. Che cosa significa un’azione

Un’azione non è un movimento fisico dell’agente. È un trattamento che cambia lo stato della pianta.

- **Annaffia** aumenta l’acqua e tende a spostare lo stato verso destra.
- **Fertilizza** aumenta i nutrienti e tende a spostare lo stato verso l’alto.
- **Non fare nulla** lascia che la pianta consumi acqua e nutrienti, quindi lo stato tende a scendere/sinistra.

In v1 ogni transizione è deterministica e locale: non ci sono meteo, parassiti o shock casuali.

## 5. Che cosa significa una reward

La reward è il numero assegnato dall’ambiente dopo un passo. Una reward positiva indica che il passo aiuta l’obiettivo; una reward negativa indica costo, stress o danno. Se la pianta muore o raggiunge la raccolta, può comparire una ricompensa terminale forte.

La reward è importante perché è il segnale da cui l’agente impara. Senza reward, V(s) e Q(s,a) non saprebbero in quale direzione correggersi.

## 6. Che cosa significa un episodio

Un episodio è una stagione simulata. Parte dalla condizione iniziale e termina quando la pianta muore o raggiunge il giorno di raccolta. Rivedere un episodio aiuta perché trasforma una lista di numeri in una storia: si vede quali azioni hanno portato a stress, recupero, morte o raccolta.

## 7. Come usare la Modalità manuale

1. Apri il preset **Pomodoro bilanciato**.
2. Guarda la cella iniziale al centro.
3. Clicca **Annaffia** una volta.
4. Osserva nuova cella, barra acqua e reward.
5. Clicca **Fertilizza**.
6. Osserva il movimento verso l’alto dei nutrienti.
7. Clicca **Non fare nulla**.
8. Osserva il decadimento naturale di acqua e nutrienti.

Dopo ogni passo chiediti: lo stato è migliorato o peggiorato? La reward conferma questa intuizione?

## 8. Come capire TD(0)

1. Seleziona **TD(0) predizione**.
2. Premi **Reset totale**.
3. Esegui un passo.
4. Guarda il Pannello formula.
5. Trova vecchio V(s), reward, V(s'), target, errore e nuovo V(s).
6. Esegui 10 passi.
7. Osserva come i valori iniziano a cambiare.

TD non conosce il futuro. Usa il valore stimato dello stato successivo come indizio provvisorio. Questo è il bootstrap: imparare da una stima, non solo da un risultato finale.

## 9. Come capire SARSA

SARSA impara Q(s,a), cioè il valore di fare una certa azione in uno stato. È on-policy: usa l’azione successiva che l’agente sceglie davvero, inclusa l’esplorazione.

Procedura:

1. Seleziona SARSA.
2. Osserva epsilon e probabilità della policy.
3. Esegui un passo.
4. Nel Pannello formula cerca l’azione successiva a'.
5. Nota che il target usa Q(s',a'), non necessariamente la migliore azione possibile.

## 10. Come capire Q-learning

Q-learning impara Q(s,a), ma usa la migliore azione stimata nello stato successivo. È off-policy e più ottimistico: aggiorna come se in futuro l’agente scegliesse sempre la scelta migliore nota.

Procedura:

1. Seleziona Q-learning.
2. Esegui un passo.
3. Cerca nel Pannello formula “migliore azione stimata”.
4. Confronta con SARSA: Q-learning usa max Q(s',a'), SARSA usa Q(s',a') dell’azione realmente scelta.

## 11. Come leggere il grafico di apprendimento

Il grafico “Ricompensa totale per episodio” mostra quanto è andato bene ogni episodio. Se tende a salire, l’agente sta ottenendo risultati migliori. Se scende, l’agente sta facendo scelte dannose o sta esplorando male. Se resta piatto, potrebbe non esserci abbastanza esperienza o i parametri potrebbero essere poco informativi.

Negli esperimenti piccoli il grafico può essere rumoroso. Per questo la UI mostra anche media mobile, lunghezza episodio, raccolti riusciti e morti della pianta.

> Screenshot: inserire screenshot reale dopo avvio locale: `docs/images/05-learning-chart.png`.

## 12. Come leggere le heatmap

Ci sono tre modalità importanti:

- **Condizione:** dice se la pianta sta bene o male in una cella.
- **V(s):** dice quanto l’agente considera promettente quello stato.
- **Frequenza visite:** dice dove l’agente passa spesso.

Una buona condizione e un alto valore appreso sono collegati, ma non identici. Una cella può essere sana ma non ancora appresa; una cella può essere visitata spesso perché l’agente cade lì, non perché sia buona.

> Screenshot: inserire screenshot reale dopo avvio locale: `docs/images/06-heatmap-modes.png`.

## 13. Come usare il replay episodio

1. Esegui un episodio.
2. Apri **Replay episodio**.
3. Seleziona l’ultimo episodio.
4. Premi Play.
5. Guarda il movimento della cella evidenziata.
6. Guarda il grafico acqua/nutrienti/salute/frutti.
7. Confronta azioni e conseguenze.

Il replay non cambia lo stato live: serve solo a visualizzare ciò che è già successo.

> Screenshot: inserire screenshot reale dopo avvio locale: `docs/images/04-episode-replay.png`.

## 14. Prima sessione consigliata, 20 minuti

- 5 minuti: Modalità manuale, una azione alla volta.
- 5 minuti: TD(0), osservando un aggiornamento alla volta.
- 5 minuti: un episodio completo e replay.
- 5 minuti: confronto rapido SARSA vs Q-learning.

## 15. Roadmap per Capitoli 4, 5 e 6

Questa roadmap non è implementata ora; serve a guidare futuri aggiornamenti.

### Capitolo 4

- Monte Carlo completo;
- TD(0);
- n-step TD;
- eligibility traces;
- visualizzazione bias/varianza.

### Capitolo 5

- Q-learning;
- SARSA;
- exploration vs exploitation;
- epsilon-greedy;
- function approximation;
- concetti DQN;
- visualizzazione della deadly triad.

### Capitolo 6

- policy gradients;
- REINFORCE;
- baseline;
- advantage;
- actor-critic;
- visualizzazione delle probabilità della policy.

## 16. Glossario

- **stato:** descrizione della situazione corrente, qui una cella acqua/nutrienti.
- **azione:** scelta dell’agente: Annaffia, Fertilizza, Non fare nulla.
- **reward / ricompensa:** numero che valuta il risultato immediato.
- **episodio:** sequenza di passi fino a terminale.
- **policy:** regola con cui l’agente sceglie le azioni.
- **V(s):** valore stimato di uno stato.
- **Q(s,a):** valore stimato di fare un’azione in uno stato.
- **target:** riferimento verso cui correggere la stima.
- **errore TD:** differenza tra target e vecchia stima.
- **alpha:** velocità di correzione.
- **gamma:** peso del futuro.
- **epsilon:** probabilità di esplorare.
- **Monte Carlo:** aggiorna dopo la fine dell’episodio usando il ritorno reale.
- **TD:** aggiorna dopo un passo usando bootstrap.
- **SARSA:** metodo on-policy per Q(s,a).
- **Q-learning:** metodo off-policy per Q(s,a).
- **heatmap:** mappa colorata che rende visibile un valore o una frequenza.

## Screenshot manuali

Se Playwright non è disponibile, avvia l’app con `npm run dev`, apri il browser e salva screenshot reali in `docs/images/` con questi nomi:

- `01-dashboard.png`
- `02-grid-axes.png`
- `03-formula-panel.png`
- `04-episode-replay.png`
- `05-learning-chart.png`
- `06-heatmap-modes.png`
