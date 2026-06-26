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

## 17. Come leggere il replay episodio

Il pannello **Replay episodio** serve a separare la visualizzazione dalla simulazione live. Quando premi **Visualizza episodio**, compare una seconda griglia, intitolata **Replay visivo dell’episodio**, immediatamente sotto i controlli. Quella griglia è di sola lettura: non cambia la pianta live, non modifica V(s), Q(s,a), conteggi o policy.

Nel replay osserva:

- **START**: la cella da cui è partito l’episodio.
- **ORA**: la cella del passo replay corrente.
- **celle visitate**: il percorso accumulato fino a quel passo.
- **TERM**: la cella terminale, se l’episodio è finito.

Usa **Passo precedente**, **Passo successivo**, **Play** e **Pausa** per ricostruire lentamente la traiettoria. Lo scopo non è vincere la simulazione, ma capire la catena: stato precedente → azione → stato successivo → reward.

## 18. Come leggere il grafico acqua/nutrienti/salute/frutti

Il grafico **Andamento della pianta nell’episodio corrente** cresce passo dopo passo. In Modalità manuale, ogni click su **Non fare nulla**, **Annaffia** o **Fertilizza** aggiunge un punto. In modalità algoritmo, ogni passo dell’agente aggiunge un punto.

- X = passo / giorno dell’episodio.
- Y = valore della variabile da 0 a 100.
- Blu = acqua.
- Viola = nutrienti.
- Verde = salute.
- Arancione = frutti.

Se premi **Non fare nulla**, dovresti vedere acqua e nutrienti scendere. Se premi **Annaffia**, l’acqua sale. Se premi **Fertilizza**, salgono i nutrienti. Quando l’episodio termina, quella traiettoria viene congelata e diventa disponibile nel replay.

## 19. Come leggere il grafico di apprendimento

Il grafico **Reward totale per episodio** ha:

- X = episodio.
- Y = reward totale ottenuta nell’episodio.
- Ogni barra = un episodio completo.

Se le barre tendono a salire, l’agente sta ottenendo risultati migliori. Se scendono, sta incontrando più penalità o terminali negativi. Se oscillano, non significa per forza che l’app sia sbagliata: con pochi episodi l’esperienza può essere ancora limitata.

## 20. Che cosa significa media mobile della reward

La **Media mobile della reward** è la media degli ultimi N episodi. È utile perché un singolo episodio può essere poco rappresentativo. La finestra può essere 5, 10 o 20 episodi:

- finestra piccola = reagisce velocemente ai cambiamenti;
- finestra grande = mostra una tendenza più stabile.

Se ci sono meno di N episodi, la UI avvisa che servono più episodi per calcolare una media completa.

## 21. Che cosa significa copertura dell’esperienza

La **Copertura dell’esperienza** non dice che l’agente ha imparato il modello completo. RL Tomato Lab usa metodi model-free: l’agente non costruisce una tabella esplicita delle probabilità di transizione.

La copertura misura invece quanta esperienza empirica è stata raccolta:

- **Stati visitati %**: quanta parte della griglia è stata incontrata almeno una volta.
- **Coppie stato-azione visitate %**: quante decisioni possibili sono state provate almeno una volta.
- **Incertezza empirica**: proxy didattico basato su 1 / sqrt(1 + N(s,a)); scende quando aumentano le visite.

È un modo pratico per chiedersi: “Le stime dell’agente sono basate su abbastanza esperienza?”.

## 22. Perché le heatmap sembrano ferme all’inizio

All’inizio V(s), Q(s,a) e i conteggi sono quasi tutti zero. Per questo una heatmap può sembrare piatta. Dopo più passi o episodi:

- la heatmap visite cambia nelle celle attraversate;
- la heatmap V(s) cambia quando usi TD(0);
- i valori Q(s,a) cambiano quando usi SARSA o Q-learning.

Se una cella non viene mai visitata, il suo colore nella heatmap visite non cambierà.

## 23. Differenza tra colore della condizione e heatmap del valore

Il **colore della condizione** parla della pianta: verde = favorevole, giallo = attenzione, rosso = pericolo.

La **heatmap del valore V(s)** parla della stima dell’agente: verde = stato che storicamente porta a buoni risultati, rosso = stato che storicamente porta a cattivi risultati.

Queste due cose sono collegate, ma non identiche. Una cella può sembrare buona biologicamente ma avere valore basso se da lì l’agente tende poi a fare azioni sbagliate.

## 24. Perché lo stato può muoversi in diagonale

La griglia ha due assi. Se cambia solo l’acqua, lo stato si muove orizzontalmente. Se cambiano solo i nutrienti, si muove verticalmente. Se cambiano entrambi, lo stato può muoversi in diagonale.

Esempio: **Non fare nulla** fa consumare alla pianta sia acqua sia nutrienti. Quindi lo stato può scendere a sinistra. Questo è un movimento diagonale perché due variabili sono diminuite nello stesso passo.

Regola v1: nessuna transizione educativa deve muoversi di più di un bucket per asse in un singolo passo.

## 25. Perché model-free non significa “mondo casuale”

Model-free non significa che il mondo è casuale. Significa che l’algoritmo non usa una tabella esplicita delle transizioni o delle reward per pianificare. In RL Tomato Lab il mondo è deterministico: date la stessa cella e la stessa azione, la transizione è comprensibile e ripetibile.

La parte “model-free” riguarda il modo in cui l’agente impara: osserva stato, azione, reward e stato successivo, poi corregge V(s) o Q(s,a) senza consultare un modello di pianificazione.

## 26. Esercizio guidato: capire una transizione diagonale

1. Premi **Reset totale**.
2. Vai in **Modalità manuale**.
3. Premi **Non fare nulla**.
4. Guarda acqua e nutrienti diminuire.
5. Guarda se lo stato si sposta verso sinistra/basso.
6. Leggi il pannello **Perché lo stato si è spostato così?**.
7. Apri il grafico dell’episodio e osserva acqua/nutrienti scendere.

Domanda guida: lo spostamento è diagonale perché il metodo è model-free, oppure perché sono cambiate due variabili nello stesso passo? La risposta corretta è la seconda.

## 27. Esercizio guidato: capire perché la heatmap visite cambia

1. Premi **Reset totale**.
2. Seleziona **Colora celle per frequenza visite**.
3. Esegui 10 episodi.
4. Osserva quali celle sono state visitate.
5. Clicca una cella.
6. Leggi **Visite stato** e **Visite azione** nell’ispettore cella.

Se una cella rimane chiara o con conteggio zero, significa che l’agente non l’ha incontrata in quegli episodi.
