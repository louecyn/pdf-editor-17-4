# Générateur de sélections automatiques (`question_actions_auto_builder.php`)

Ce guide résume ce que fait la page `/pdf-editor/question_actions_auto_builder.php`, tout ce qu’on peut y tester en live (zones bleues/rouges) et comment valider chaque fonctionnalité avant d’enregistrer.

## Obtenir un aperçu live (zones bleues)
- Dans **« Vos modèles pré‑enregistrés »**, choisissez un modèle, puis ouvrez‑le dans **« Document réel en aperçu live »**.
- Le PDF s’affiche avec les superpositions : bleu/rouge expliquent ce qui serait inséré et où.
- Toute configuration de règle met à jour l’aperçu immédiatement, sans sauvegarde. Rien n’est persisté tant que vous n’avez pas cliqué **« Enregistrer et retourner »**.
- Utilisez la **navigation de pages** (Précédente/Suivante) et le **journal live** pour vérifier comment chaque partie de la règle s’applique.

## Checklist des fonctionnalités à tester
1. **Chargement et recherche de clients**
   - Sélectionner un ou plusieurs clients (`request.json`) et filtrer via la recherche pour alimenter le générateur.
2. **Explorateur de données** (visible après sélection d’au moins un client)
   - **Analyser** copie le chemin dans **« Chemin à analyser »**.
   - **Insérer** renseigne le chemin d’insertion.
   - **Ajouter au filtre** préremplit les termes de comparaison.
3. **Définition de règle**
   - Nom de règle, coordonnées d’insertion (manuelles ou via **« Choisir sur le document »**), chemin à analyser, type de condition et termes de comparaison. L’aide inline clarifie la différence entre chemin d’analyse et d’insertion.
4. **Scénarios de conditions**
   - Tester les six conditions : `contains`, `not_contains`, `equals`, `not_equals`, `empty`, `not_empty`, avec les mini‑scénarios proposés pour voir la réaction sur les clients sélectionnés.
5. **Source de valeur**
   - Basculer entre la copie d’un autre champ de `request.json` et l’insertion d’un texte custom ; l’UI affiche les champs appropriés selon le choix.
6. **Options supplémentaires**
   - **Valeur alternative** (fallback) n’apparaît que lorsqu’elle est activée.
   - **Notes internes** conservées avec la règle (onglet Questions/Actions).
7. **Prévisualisation avant sauvegarde**
   - Le bloc **« Prévisualiser »** récapitule chemins, condition, source de valeur et coordonnées.
8. **Modal de sélection de coordonnées**
   - **« Choisir sur le document »** ouvre la modale pour cliquer un point dans n’importe quel modèle enregistré ; les coordonnées sont reportées automatiquement.
9. **Réinitialisation et sauvegarde**
   - **Réinitialiser** vide le formulaire.
   - **Enregistrer et retourner** renvoie la règle à l’onglet Questions/Actions et ne ferme la page qu’après une sauvegarde réussie.

## Comment tout tester sans enregistrer
- Travaillez dans l’**aperçu live** : changez conditions/valeurs/coordonnées et observez l’overlay + journal. Les modifications sont temporaires.
- Utilisez le **résumé de règle** pour relire chemins, condition, termes, source de valeur et coordonnées avant toute sauvegarde.
- Servez‑vous des **mini‑scénarios de condition** comme tests d’acceptation : entrez les termes suggérés et vérifiez la réaction de l’aperçu/journal pour chaque type de condition.
- Ouvrez la **modale de coordonnées**, cliquez un point puis fermez/annulez : le champ de coordonnées doit se mettre à jour sans rien persister.
- Pour repartir de zéro, appuyez sur **Réinitialiser** ; aucune donnée n’est sauvegardée tant que vous n’avez pas confirmé **« Enregistrer et retourner »**.
