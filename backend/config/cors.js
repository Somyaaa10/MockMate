const getAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL || "";
  const configuredOrigins = clientUrl
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
    const devDefaults = ["http://localhost:5173", "http://127.0.0.1:5173"];
    return Array.from(new Set([...devDefaults, ...configuredOrigins]));
  }

  return configuredOrigins;
};

const corsOriginDelegate = (origin, callback) => {
  const allowedOrigins = getAllowedOrigins();

  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
  if (!origin || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
};

const corsOptions = {
  origin: corsOriginDelegate,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

module.exports = {
  getAllowedOrigins,
  corsOriginDelegate,
  corsOptions,
};
