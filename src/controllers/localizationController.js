const Language = require('../models/Language');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const httpStatusCodes = require('../constants/httpStatusCodes');

const getSupportedLanguages = asyncHandler(async (req, res) => {
  const languages = await Language.find({ isActive: true }).select('code name nativeName isDefault');
  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Supported languages retrieved', languages)
  );
});

const getTranslationsByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;
  let language = await Language.findOne({ code: code.toLowerCase(), isActive: true });

  if (!language) {
    language = await Language.findOne({ isDefault: true });
  }

  const translations = language?.translations instanceof Map
    ? Object.fromEntries(language.translations)
    : (language?.translations || {});
  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, `Translations for ${language ? language.code : 'en'}`, {
      code: language?.code || 'en',
      translations
    })
  );
});

module.exports = {
  getSupportedLanguages,
  getTranslationsByCode
};