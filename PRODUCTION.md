# Production Backend Notes

Use the existing `.env.example` as the template for production configuration. Do not commit or distribute a real `.env` file.

Required runtime values include the MongoDB connection string, JWT secrets, CORS origin, admin defaults and application port.

Install and run:

```bash
npm ci
npm start
```

For deployment, provide all environment variables through the hosting provider's secret/environment configuration.
