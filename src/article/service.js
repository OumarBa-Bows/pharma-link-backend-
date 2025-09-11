// article service logic
const { prisma } = require("../configs/prisma.conf");
const exceptionRaiser = require("../utils/error-handle");

exports.createArticle = async (data) => {
  try {
    console.log("Creating article with data:", data);
    // S'assurer que price est bien un nombre
    const articleData = {
      ...data,
      price:
        typeof data.price === "string" ? parseFloat(data.price) : data.price,
    };
    const article = await prisma.article.create({ data: articleData });
    return article;
  } catch (error) {
    return Promise.reject(error);
  }
};

exports.updateArticle = async (id, data) => {
  try {
    // S'assurer que price est bien un nombre si présent
    const articleData = {
      ...data,
      ...(data.price !== undefined && {
        price:
          typeof data.price === "string" ? parseFloat(data.price) : data.price,
      }),
    };
    const article = await prisma.article.update({
      where: { id },
      data: articleData,
    });
    return article;
  } catch (error) {
    return Promise.reject(error);
  }
};

exports.deleteArticle = async (id) => {
  try {
    const article = await prisma.article.delete({ where: { id } });
    return article;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Récupérer tous les articles
exports.getAllArticles = async () => {
  try {
    const articles = await prisma.article.findMany();
    return articles;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Récupérer un article par ID
exports.getArticleById = async (id) => {
  try {
    const article = await prisma.article.findUnique({ where: { id } });
    return article;
  } catch (error) {
    return Promise.reject(error);
  }
};
