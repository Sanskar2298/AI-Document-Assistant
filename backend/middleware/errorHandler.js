exports.notFoundHandler = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404).json({ message: error.message });
};

exports.errorHandler = (err, req, res, next) => {
    // Handle Multer-specific errors with clean messages
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            success: false,
            message: "File is too large. Maximum allowed size is 10MB.",
        });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
            success: false,
            message: "Unexpected file field. Please use 'file' as the field name.",
        });
    }

    if (err.message === "Only PDF files are allowed!") {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
