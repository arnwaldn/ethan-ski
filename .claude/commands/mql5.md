# /mql5 - Création de Robots et Indicateurs MT5

Génère des Expert Advisors, Indicateurs et Scripts pour MetaTrader 5.

## Usage
```
/mql5 [type] [stratégie] [options]
```

## Types Disponibles

### ea - Expert Advisor (Robot de Trading)
```
/mql5 ea scalper
/mql5 ea trend-following
/mql5 ea grid
/mql5 ea martingale
/mql5 ea breakout
/mql5 ea mean-reversion
```

### indicator - Indicateur Personnalisé
```
/mql5 indicator oscillator
/mql5 indicator trend
/mql5 indicator volatility
/mql5 indicator volume
/mql5 indicator multi-timeframe
```

### script - Script One-Shot
```
/mql5 script close-all
/mql5 script trailing-stop
/mql5 script lot-calculator
/mql5 script export-history
```

### library - Bibliothèque Réutilisable
```
/mql5 library risk-management
/mql5 library signal-generator
/mql5 library position-manager
```

## Stratégies Pré-définies

### Scalping
```
/mql5 ea scalper --timeframe=M5 --sl=20 --tp=40
```
- MA Cross (EMA 8/21)
- RSI Filter
- Spread Filter
- Session Filter
- Trailing Stop

### Trend Following
```
/mql5 ea trend --timeframe=H4 --indicator=ichimoku
```
- Triple MA System
- ADX Filter
- ATR-based SL/TP
- Multi-timeframe confirmation

### Grid Trading
```
/mql5 ea grid --size=50 --levels=5 --multiplier=1.5
```
- Grid niveaux dynamiques
- Hedge mode
- Recovery mode
- Max drawdown protection

### Breakout
```
/mql5 ea breakout --period=20 --atr-multiplier=1.5
```
- Support/Resistance detection
- Bollinger Squeeze
- Volume confirmation
- False breakout filter

### Mean Reversion
```
/mql5 ea mean-reversion --indicator=rsi --period=14
```
- RSI Divergence
- Bollinger Bands
- Stochastic
- Entry sur extrêmes

## Options

### Trading
```
--lot=0.1           # Lot fixe
--risk=2            # Risque % par trade
--sl=50             # Stop Loss en points
--tp=100            # Take Profit en points
--magic=123456      # Magic Number
```

### Filtres
```
--spread-max=20     # Spread maximum
--session=london    # Session trading (london/newyork/tokyo/all)
--news-filter       # Éviter les news
--trend-filter      # Filtrer contre-tendance
```

### Risk Management
```
--max-trades=3      # Max positions simultanées
--daily-loss=5      # Max perte journalière %
--daily-profit=10   # Objectif profit journalier %
--trailing          # Activer trailing stop
--breakeven         # Activer breakeven
```

### Indicateurs
```
--ma-fast=8         # MA rapide
--ma-slow=21        # MA lente
--rsi-period=14     # Période RSI
--atr-period=14     # Période ATR
```

## Exemples Complets

### EA Scalper EURUSD
```
/mql5 ea scalper "EURUSD_Scalper" --timeframe=M5 --lot=0.1 --sl=20 --tp=40 --ma-fast=8 --ma-slow=21 --rsi-period=14 --spread-max=15 --session=london --trailing --breakeven
```

### EA Trend H4
```
/mql5 ea trend "H4_Trend_Trader" --timeframe=H4 --risk=1 --indicator=ma-cross --ma-fast=21 --ma-slow=50 --trend-filter --atr-multiplier=2
```

### Indicateur RSI Divergence
```
/mql5 indicator divergence "RSI_Divergence" --base=rsi --period=14 --alerts
```

### Script Close All
```
/mql5 script close-all "CloseAllPositions" --magic=123456 --confirm
```

## Output Généré

```
Fichiers créés:
├── EA_Name.mq5           # Code source principal
├── EA_Name_Lib.mqh       # Bibliothèque de fonctions
├── EA_Name_Settings.set  # Fichier paramètres optimisés
└── README.txt            # Documentation

Recommandations Backtest:
- Période: 2020-2024
- Spread: Variable
- Mode: Every tick
- Optimization: Genetic algorithm

Paramètres à optimiser:
- InpMAPeriod: 5-50, step 5
- InpRSIPeriod: 7-21, step 2
- InpStopLoss: 10-50, step 5
```

## Workflow Recommandé

1. **Génération**
   ```
   /mql5 ea scalper "MyScalper"
   ```

2. **Personnalisation**
   - Ajuster les paramètres selon le symbole
   - Adapter la logique de signal

3. **Backtest**
   - MT5 Strategy Tester
   - Period: 2+ ans
   - Mode: Every tick based

4. **Optimisation**
   - Walk-forward analysis
   - Out-of-sample testing
   - Monte Carlo simulation

5. **Demo Trading**
   - 1-3 mois en compte démo
   - Vérifier slippage réel
   - Ajuster si nécessaire

6. **Production**
   - Commencer avec lot minimum
   - Monitoring quotidien
   - Ajustements continus

## Ressources

- Templates: `knowledge/mql5/templates/`
- Stratégies: `knowledge/mql5/trading-strategies.md`
- Guide complet: `knowledge/mql5/mql5-complete-guide.md`
