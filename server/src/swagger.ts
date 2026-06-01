import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Timing API',
      version: '1.0.0',
      description: '일정 조율 서비스 Timing의 REST API 문서입니다.',
    },
    servers: [
      { url: 'https://timing-server.onrender.com', description: 'Production' },
      { url: 'http://localhost:3000', description: 'Local' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export default swaggerJsdoc(options);
