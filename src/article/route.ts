import { Router } from 'express';
import { validateCreate, validateDelete, validateUpdate } from './middleware';
import { ArticleController } from './controller';


export const articleRoute = Router({ mergeParams: true });

// Créer un article
articleRoute.post('/', validateCreate, ArticleController.create);

// Mettre à jour un article
articleRoute.put('/:id', validateUpdate, ArticleController.update);

// Supprimer un article
articleRoute.delete('/:id', validateDelete, ArticleController.delete);

// Récupérer tous les articles
articleRoute.get('/', ArticleController.getAll);

// Récupérer un article par ID
articleRoute.get('/:id', ArticleController.getById);
