const Language = require('../../models/Language');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');

const normalizeTranslations = (translations = {}) => {
  const source = translations instanceof Map ? Object.fromEntries(translations) : (translations || {});
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [String(key).trim(), value == null ? '' : String(value)])
      .filter(([key]) => Boolean(key))
  );
};

const serialize = (language) => ({
  id: String(language._id),
  code: language.code,
  name: language.name,
  nativeName: language.nativeName,
  isDefault: language.isDefault,
  isActive: language.isActive,
  translations: normalizeTranslations(language.translations),
  createdAt: language.createdAt,
  updatedAt: language.updatedAt,
});

const getAllLanguages = asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim();
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const filter = search
    ? { $or: [{ code: { $regex: search, $options: 'i' } }, { name: { $regex: search, $options: 'i' } }, { nativeName: { $regex: search, $options: 'i' } }] }
    : {};

  const [languages, total] = await Promise.all([
    Language.find(filter).sort({ isDefault: -1, code: 1 }).skip((page - 1) * limit).limit(limit),
    Language.countDocuments(filter),
  ]);

  res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, 'Languages retrieved', {
    items: languages.map(serialize),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }));
});

const createLanguage = asyncHandler(async (req, res) => {
  const code = String(req.body.code || '').trim().toLowerCase();
  const name = String(req.body.name || '').trim();
  const nativeName = String(req.body.nativeName || '').trim();
  if (!/^[a-z]{2,8}(?:-[a-z0-9]{2,8})?$/.test(code) || !name || !nativeName) {
    throw new ApiError(httpStatusCodes.BAD_REQUEST, 'Valid language code, name, and native name are required');
  }
  if (await Language.findOne({ code })) throw new ApiError(httpStatusCodes.CONFLICT, 'Language code already exists');
  if (req.body.isDefault) await Language.updateMany({}, { $set: { isDefault: false } });

  const language = await Language.create({
    code,
    name,
    nativeName,
    isDefault: Boolean(req.body.isDefault),
    isActive: req.body.isActive !== false,
    translations: normalizeTranslations(req.body.translations),
  });
  res.status(httpStatusCodes.CREATED).json(new ApiResponse(httpStatusCodes.CREATED, 'Language created', serialize(language)));
});

const updateLanguage = asyncHandler(async (req, res) => {
  const language = await Language.findById(req.params.id);
  if (!language) throw new ApiError(httpStatusCodes.NOT_FOUND, 'Language not found');

  if (req.body.name !== undefined) language.name = String(req.body.name).trim();
  if (req.body.nativeName !== undefined) language.nativeName = String(req.body.nativeName).trim();
  if (req.body.isActive !== undefined) language.isActive = Boolean(req.body.isActive);
  if (req.body.translations !== undefined) language.translations = normalizeTranslations(req.body.translations);
  if (req.body.isDefault === true) {
    await Language.updateMany({ _id: { $ne: language._id } }, { $set: { isDefault: false } });
    language.isDefault = true;
  }
  if (req.body.isDefault === false && language.isDefault) {
    throw new ApiError(httpStatusCodes.BAD_REQUEST, 'A default language must always exist');
  }
  await language.save();
  res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, 'Language updated', serialize(language)));
});

const deleteLanguage = asyncHandler(async (req, res) => {
  const language = await Language.findById(req.params.id);
  if (!language) throw new ApiError(httpStatusCodes.NOT_FOUND, 'Language not found');
  if (language.isDefault) throw new ApiError(httpStatusCodes.BAD_REQUEST, 'The default language cannot be deleted');
  await language.deleteOne();
  res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, 'Language deleted'));
});

const upsertTranslation = asyncHandler(async (req, res) => {
  const language = await Language.findById(req.params.id);
  if (!language) throw new ApiError(httpStatusCodes.NOT_FOUND, 'Language not found');
  const key = String(req.body.key || '').trim();
  if (!key) throw new ApiError(httpStatusCodes.BAD_REQUEST, 'Translation key is required');
  const translations = normalizeTranslations(language.translations);
  translations[key] = String(req.body.value ?? '');
  language.translations = translations;
  language.markModified('translations');
  await language.save();
  res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, 'Translation saved', serialize(language)));
});

const deleteTranslation = asyncHandler(async (req, res) => {
  const language = await Language.findById(req.params.id);
  if (!language) throw new ApiError(httpStatusCodes.NOT_FOUND, 'Language not found');
  const translations = normalizeTranslations(language.translations);
  delete translations[String(req.params.key)];
  language.translations = translations;
  language.markModified('translations');
  await language.save();
  res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, 'Translation deleted', serialize(language)));
});

module.exports = { getAllLanguages, createLanguage, updateLanguage, deleteLanguage, upsertTranslation, deleteTranslation, serialize };
