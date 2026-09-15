# Superstars du Ski

Un petit jeu de slalom en 3D qui tourne dans le navigateur. Le héros s’appelle Ethan, et c’est à vous de le mener jusqu’en bas de la piste.

Pour jouer : [arnwaldn.github.io/ethan-ski](https://arnwaldn.github.io/ethan-ski/)

Il se joue au clavier, sur ordinateur.

## La course

L’écran-titre montre le portrait d’Ethan et un bouton DÉPART. Ensuite on descend dans la neige, entre les sapins et les rochers, en visant les portes. Chaque porte manquée ajoute 2 secondes au chrono.

Pendant la descente, l’écran affiche le temps, la vitesse et les portes passées. Une descente complète dure environ cinq minutes.

À l’arrivée, l’écran « Course terminée » fait les comptes : temps de course, pénalités, temps total, vitesse maximale et portes passées. Il propose aussi un bouton REJOUER.

## Commandes

- ← → ou A D : tourner
- ↓ ou S : position aéro

Le bouton en haut à droite passe le jeu en plein écran.

## Pour les développeurs

Le rendu 3D repose sur Three.js, avec Vite et TypeScript pour l’outillage. Les sons sont générés par le navigateur, sans fichier audio.

Il faut Node 22 ou plus récent. Pour installer les dépendances et lancer le jeu en local :

```bash
npm ci
npm run dev
```

Le jeu est alors servi sur [http://localhost:5173/ethan-ski/](http://localhost:5173/ethan-ski/).

Pour construire la version finale et la regarder tourner :

```bash
npm run build
npm run preview
```

Chaque envoi sur la branche `main` déclenche GitHub Actions, qui reconstruit le site et le publie sur GitHub Pages.

## Crédits

Les modèles 3D des sapins et des rochers viennent du [Nature Kit](https://kenney.nl/assets/nature-kit) de Kenney. Sa licence d’origine est conservée dans [LICENCES/kenney-nature-kit-License.txt](LICENCES/kenney-nature-kit-License.txt).

Les textures de neige sont celles de [Snow 02](https://polyhaven.com/a/snow_02), chez Poly Haven.

Ces ressources sont sous licence CC0, dans le domaine public. Les citer n’a rien d’obligatoire ; c’est une courtoisie.

## Droits

Le code et les illustrations originales du jeu, dont le portrait du personnage : © Arnaud Porcel, tous droits réservés. Le dépôt est public pour être lu et exploré.
