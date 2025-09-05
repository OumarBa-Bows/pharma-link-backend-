# Pharma Link Backend

Ce projet est le backend de l'application Pharma Link, développé avec Node.js, Express et Prisma.

## Fonctionnalités principales
- Authentification (JWT, Bcrypt)
- Gestion des utilisateurs
- Intégration avec Prisma ORM
- Gestion des erreurs centralisée

## Structure du projet
```
nodemon.json
package.json
prisma/
  schema.prisma
src/
  app.js
  auth/
    controller.js
    middleware.js
    route.js
    service.js
  configs/
    bcrypt.conf.js
    database.conf.js
    jwt.conf.js
    prisma.conf.js
  routes/
    index.js
  utils/
    error-handle.js
    verifyTokens.js
```

## Installation
1. Clonez le dépôt :
   ```bash
   git clone <repo-url>
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Configurez la base de données dans `src/configs/database.conf.js` et Prisma dans `prisma/schema.prisma`.
4. Lancez le serveur :
   ```bash
   npm run dev
   ```

## Scripts utiles
- `npm run dev` : Démarre le serveur en mode développement avec Nodemon
- `npm start` : Démarre le serveur en mode production

## Authentification
L'authentification utilise JWT et Bcrypt. Les routes d'authentification se trouvent dans `src/auth/`.

## Contribution
Les contributions sont les bienvenues !

## Licence
MIT
