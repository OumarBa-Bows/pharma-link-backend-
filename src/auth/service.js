const { prisma } = require("../configs/prisma.conf");
const exceptionRaiser = require("../utils/error-handle");
const bcrypt = require("../configs/bcrypt.conf");
const JWT = require("../configs/jwt.conf");

// Fonction générique pour obtenir un utilisateur par un champ
const findUser = async (field, value) => {
  try {
    console.log("field", field);
    console.log("value", value);

    const user = await prisma.user.findFirst({
      where: { [field]: value },
    });

    if (!user) {
      return exceptionRaiser.errorHandler(
        "UserNotFoundException",
        "user not found",
        400
      );
    }
    return user;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Obtenir un utilisateur par email
const getUserByEmail = (email) => findUser("email", email);

// Obtenir un utilisateur par ID
const getUserById = (id) => findUser("id", id); // ⚠️ attention : Prisma utilise `id`, pas `_id`

// Fonction pour comparer le mot de passe
const decryptPassword = async (password, hash) => {
  try {
    const isMatch = await bcrypt.comparePasswords(`${password}`, hash);
    if (!isMatch) {
      return exceptionRaiser.errorHandler(
        "PasswordMismatchException",
        "Password mismatch",
        401
      );
    }
    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Créer des tokens
const createTokens = async (user) => {
  try {
    const payload = { id: user.id, origin: "pharmalink-backend" };
    const [accessToken, refreshToken] = await Promise.all([
      JWT.issueAccessToken(payload),
      JWT.issueRefreshToken(payload),
    ]);
    return { accessToken, refreshToken };
  } catch (error) {
    return Promise.reject(error);
  }
};

// Validation login
exports.login = async (params) => {
  try {
    const user = await getUserByEmail(params.email);
    await decryptPassword(params.password, user.password);
    const { accessToken, refreshToken } = await createTokens(user);
    const safeUser = {
      name: user.name,
      email: user.email,
    };
    return { user: safeUser, accessToken, refreshToken };
  } catch (error) {
    console.log("Error ", error);
    return Promise.reject(error);
  }
};

// Rafraîchir le token
exports.refreshAccessToken = async (refreshToken) => {
  try {
    const [parsedToken] = await JWT.verifyRefreshToken(refreshToken);
    const user = await getUserById(parsedToken.id);
    const { accessToken } = await createTokens(user);
    return accessToken;
  } catch (error) {
    return Promise.reject(error);
  }
};
