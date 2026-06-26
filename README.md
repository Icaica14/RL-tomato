# RL Tomato Lab

RL Tomato Lab è un’app React + TypeScript per imparare il reinforcement learning in modo concreto. Usa una **Tomato GridWorld** deterministica: a ogni passo puoi osservare `stato → azione → stato successivo → ricompensa → terminale? → aggiornamento del valore → policy`.

## La griglia è uno spazio di stati astratto

La griglia **non è una mappa fisica**. È uno spazio di condizioni della pianta:

- asse X = **acqua**: da poca acqua a troppa acqua;
- asse Y = **nutrienti**: da pochi nutrienti a troppi nutrienti;
- ogni cella è uno stato discreto usato per V(s), Q(s,a), conteggi visite e policy.

## Azioni deterministiche in v1

In v1 non ci sono meteo, parassiti, shock esterni, variabili nascoste o transizioni stocastiche. Gli stati successivi sono deterministici e locali:

- **Ø = Non fare nulla**: la pianta consuma risorse e lo stato tende a scendere/sinistra;
- **H₂O = Annaffia**: aumenta l’acqua e lo stato si sposta al massimo di una cella verso destra;
- **Nut = Fertilizza**: aumenta i nutrienti e lo stato si sposta al massimo di una cella verso l’alto.

La casualità, quando `epsilon > 0`, riguarda solo **la scelta dell’azione** nella policy epsilon-greedy, non la transizione dell’ambiente.

## Come viene scelta l’azione

- **Modalità manuale:** scegli tu l’azione. L’agente non sta ancora imparando una policy autonoma.
- **TD(0) predizione:** l’obiettivo è stimare V(s). La policy può essere manuale o esplorativa, ma TD(0) non cerca direttamente l’azione migliore.
- **SARSA e Q-learning:** l’azione è scelta con policy epsilon-greedy: con probabilità ε esplora, altrimenti sceglie l’azione con Q(s,a) più alto.

## Pannello formula

Il pannello formula esiste per mostrare **come avviene l’apprendimento**. Dopo una transizione mostra:

1. formula simbolica;
2. formula con numeri reali;
3. significato pratico di ricompensa, gamma, target ed errore;
4. nuovo valore di V(s) o Q(s,a);
5. spiegazione semplice del perché il valore aumenta o diminuisce.

## Concetti RL nell’app

- **Stato:** giorno, acqua, nutrienti, salute, frutti, vivo/morto e cella corrente.
- **Azione:** uno dei tre trattamenti deterministici: Ø, H₂O, Nut.
- **Ricompensa:** numero che descrive quanto è stato buono o cattivo il risultato del passo.
- **Episodio:** una gestione completa della pianta dal giorno 0 alla morte o alla raccolta.
- **Terminale:** l’episodio termina se salute ≤ 0, la pianta non è viva, una cella è terminale o si raggiunge il giorno di raccolta.

## Esecuzione locale

```bash
npm install
npm run dev
npm test
npm run build
```

## Percorso consigliato per imparare

1. Apri il preset **Pomodoro bilanciato**.
2. Resta in **Modalità manuale**.
3. Premi **H₂O Annaffia** e guarda come cambia la cella sulla griglia.
4. Leggi ricompensa, spiegazione e stato terminale/non terminale.
5. Passa a **TD(0) predizione** ed esegui un passo per vedere V(s) aggiornarsi.
6. Passa a **SARSA** o **Q-learning** e osserva Q(s,a), policy corrente ed epsilon.
7. Esegui un episodio.
8. Esegui 100 episodi.
9. Ispeziona Registro aggiornamenti, grafici, heatmap V(s), frequenza visite e probabilità della policy.

## Modalità e algoritmi

- **Modalità manuale:** impari il ciclo ambiente senza dover capire subito un algoritmo.
- **TD(0):** aggiorna V(s) con ricompensa immediata + valore stimato dello stato successivo.
- **SARSA:** aggiorna Q(s,a) usando l’azione successiva scelta davvero dall’agente.
- **Q-learning:** aggiorna Q(s,a) come se l’agente scegliesse la migliore azione stimata nello stato successivo.
- **Monte Carlo:** pannello didattico: aspetta la fine dell’episodio e usa il ritorno totale reale, senza bootstrap da V(s').

## Estensioni future

Possibili estensioni dopo v1: transizioni stocastiche, meteo, parassiti, osservabilità parziale e un modello botanico più realistico. Queste idee sono escluse da v1 per mantenere il laboratorio semplice e osservabile.
