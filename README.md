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
3. Configurez la base de données dans `prisma/schema.prisma`.
4. Générez la base de données Prisma :

```bash
npx prisma migrate dev --name init
```

5. Lancez le serveur :

```bash
npm run dev
```

## Scripts utiles

- `npm run dev` : Démarre le serveur en mode développement avec Nodemon
- `npm start` : Démarre le serveur en mode production

## Authentification

L'authentification utilise JWT et Bcrypt. Les routes d'authentification se trouvent dans `src/auth/`.

### Exemple d'utilisation de l'API d'authentification

#### Connexion

```http
POST api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "votreMotDePasse"
}
```

#### Accès à une route protégée

Ajouter le token JWT dans l'en-tête :

```http
Authorization: Bearer <votre_token_jwt>
```

## Contribution

Les contributions sont les bienvenues !

## Licence

MIT
