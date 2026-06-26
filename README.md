# RL Tomato Lab

RL Tomato Lab è un’app React + TypeScript per imparare il reinforcement learning osservando un ambiente semplice e deterministico: una **Tomato GridWorld** dove l’asse X è l’acqua e l’asse Y sono i nutrienti.

L’obiettivo non è simulare agronomia realistica. L’obiettivo è vedere chiaramente: `stato → azione → stato successivo → ricompensa → aggiornamento V(s)/Q(s,a) → policy`.

## Come eseguire

```bash
npm install
npm run dev
npm test
npm run build
```

## Novità didattiche

- Assi cartesiani chiari: acqua aumenta verso destra, nutrienti aumentano verso l’alto.
- Colori cella per condizione della pianta: rosso per pericolo, giallo per attenzione, verde per condizione favorevole.
- Toggle per vedere condizione, heatmap V(s) o frequenza visite.
- Pannello formula riscritto per principianti: prima spiega target, errore, alpha e gamma, poi mostra la formula tecnica.
- Replay episodio con percorso sulla griglia e grafico di acqua, nutrienti, salute e frutti.
- Grafico di apprendimento sotto la griglia con “Ultimi risultati”.
- Pulsante **Cosa devo guardare?** con una guida rapida di osservazione.
- Pulsante **Reset totale** per ripartire da zero.

## Reset dei vecchi valori locali

Questa versione usa la storage version:

`rl-tomato-v3-episode-replay-guide`

Al primo avvio, i vecchi valori locali di test vengono cancellati intenzionalmente: configurazione salvata, valori imparati, log, metriche ed episodi registrati. Questo evita che dati vecchi rendano incomprensibili grafici e replay.

Puoi premere **Reset totale** in qualunque momento. Il reset totale cancella V(s), Q(s,a), conteggi, log, episodi registrati, metriche, formula corrente e configurazione salvata in localStorage.

## Primo workflow consigliato

1. Apri l’app.
2. Premi **Cosa devo guardare?**.
3. Osserva la griglia: X = acqua, Y = nutrienti.
4. In Modalità manuale premi **Annaffia**.
5. Guarda cella nuova, barre della pianta e ricompensa.
6. Seleziona **TD(0) predizione**.
7. Premi **Esegui un passo** e leggi il Pannello formula.
8. Premi **Esegui un episodio**.
9. Usa **Replay episodio** per rivedere la traiettoria.
10. Esegui 10, 50 o 100 episodi e osserva il grafico di apprendimento.

## Guida lunga

La guida completa in italiano è qui:

[`docs/GUIDA_UI_RL_TOMATO_LAB.md`](docs/GUIDA_UI_RL_TOMATO_LAB.md)

La guida collega la UI al Capitolo 4 del libro, “Learning from What Actually Happened”, e include una roadmap per Capitoli 5 e 6.

## Screenshot

Se vuoi aggiungere screenshot reali alla guida:

1. avvia l’app con `npm run dev`;
2. apri il browser;
3. salva immagini reali in `docs/images/` con questi nomi:
   - `01-dashboard.png`
   - `02-grid-axes.png`
   - `03-formula-panel.png`
   - `04-episode-replay.png`
   - `05-learning-chart.png`
   - `06-heatmap-modes.png`

Non sono stati aggiunti screenshot inventati: la guida contiene placeholder finché non vengono catturati screenshot reali.

## Cosa resta escluso da v1

Non ci sono meteo, parassiti, transizioni stocastiche, reti neurali o metodi avanzati. La semplicità è intenzionale: serve a rendere osservabile il processo di apprendimento.
