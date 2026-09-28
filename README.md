# Eazy 1000
Prototype mobile-first de planification repas, recettes et courses adapté à l'Afrique francophone.

## Parcours inclus
- Découverte de recettes internationales + propositions ivoiriennes/ouest-africaines ou revisitées.
- Fiche recette avec action par ingrédient : **ajouter à la liste** ou **faire livrer**.
- Simulation partenaire **Allo Market** : adresse, panier, estimation et frais de livraison à la charge du client.
- Liste de courses interactive et gamifiée : XP, série, progression, défi anti-gaspi.
- Sauvegarde locale et export/import JSON des données utilisateur.
- UX prête à accueillir plus tard une API LLM pour recherche/génération de recettes et une API partenaire pour prix/stock/livraison.

## Démarrer
```bash
npm install
npm run dev
```

## Architecture de données
Le prototype persiste côté navigateur via localStorage. L'utilisateur peut exporter son état en JSON puis le restaurer par upload. `data/user-example.json` documente un état minimal.

> Les prix, stocks et frais Allo Market sont actuellement simulés et doivent être remplacés par les données contractuelles/API du partenaire en production.