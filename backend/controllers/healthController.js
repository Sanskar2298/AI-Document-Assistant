const healthService = require("../services/healthService");

exports.getWelcomeMessage = (req, res) => {
    const message = healthService.getWelcomeMessage();
    res.json({ message });
};

exports.getHealthStatus = (req, res) => {
    const status = healthService.getHealthStatus();
    res.json({ status });
};
