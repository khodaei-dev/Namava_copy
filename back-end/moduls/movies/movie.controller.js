const categoryModel = require("./../../models/category");
const movieModel = require("./../../models/movie");
const previewModel = require("./../../models/preview");
const { categoryValidator } = require("./movie.validator");

exports.getAllMovie = async (req, res, next) => {
  try {
    const movies = await movieModel.find({}).lean();

    if (!movies) {
      return res.status(404).json({ message: "No Movies Uploaded yet" });
    }

    return res.json({ movies });
  } catch (err) {
    next(err);
  }
};
exports.getMovieInformation = async (req, res, next) => {
  try {
    const { movieID } = req.params;
    if (!movieID) {
      return res.status(404).json({ message: "Movie not Found" });
    }

    const movie = await movieModel
      .findOne({ _id: movieID })
      .populate("category", "title href");
    if (!movie) {
      return res.status(404).json({ message: "Movie not Found" });
    }

    return res.json({ movie });
  } catch (err) {
    next(err);
  }
};

exports.addMovies = async (req, res, next) => {
  try {
    const { categoryID } = req.params;

    const {
      name,
      coverDescription,
      description,
      time,
      director,
      actors,
      releaseYear,
      publicationStatus,
      translation,
      ageLimit,
    } = req.body;

    if (!req.files) {
      return res.status(403).json("Please Upload Movie Prewies and cover");
    }

    // todo: validator

    const coverFilename = req.files.cover[0].filename;
    const previewFilename = req.files.preview[0].filename;

    const coverUrlPath = `/public/movie/${coverFilename}`;
    const previewUrlPath = `/public/movie/${previewFilename}`;

    //Movie categories
    const movieCategory = await categoryModel.findOne({ _id: categoryID });

    const movie = await movieModel.create({
      name,
      coverDescription,
      description,
      cover: {
        path: coverUrlPath,
        filename: coverFilename,
      },
      category: movieCategory._id,
      time,
      director,
      actors,
      releaseYear,
      publicationStatus,
      translation,
      ageLimit,
    });

    await previewModel.create({
      preview: {
        path: previewUrlPath,
        filename: previewFilename,
      },
      movie: movie._id,
      category: movieCategory._id,
    });

    return res.status(201).json({ message: "movie created successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getAllCategory = async (req, res, next) => {
  try {
    const categories = await categoryModel.find({}).lean();

    if (!categories) {
      return res.status(404).json({ message: "No Category Created yet" });
    }

    return res.json({ categories });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryInformation = async (req, res, next) => {
  try {
    const { href } = req.params;

    const category = await categoryModel.findOne({ href });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({ category });
  } catch (err) {
    next(err);
  }
};

exports.addCategoyr = async (req, res, next) => {
  try {
    const { title, href } = req.body;

    if (!req.file) {
      return res.status(403).json({
        message: "Please Upload Category cover",
      });
    }

    categoryValidator.validateSync({ title, href }, { abortEarly: false });
    const coverUrlPath = `/public/category/${req.files.filename}`;

    await categoryModel.create({
      title,
      href,
      cover: {
        path: coverUrlPath,
        filename: req.file.filename,
      },
    });

    return res.status(201).json({ message: "category created" });
  } catch (err) {
    next(err);
  }
};

exports.latestMovies = async (req, res, next) => {
  try {
    const movies = await movieModel.find({}).sort({ releaseYear: -1 }).limit(5);

    return res.json(movies);
  } catch (err) {
    next(err);
  }
};
