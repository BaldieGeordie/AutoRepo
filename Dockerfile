FROM node:20-alpine

WORKDIR /app

# Install frontend deps and build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Install backend deps
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/
RUN cd backend && npm install --include=dev

# Build backend
COPY backend/ ./backend/
RUN cd backend && npx prisma generate && npx tsc

# Expose port (optional but fine)
EXPOSE 8080

# Run from backend folder so no "cd" is needed
WORKDIR /app/backend

CMD ["npm", "run", "deploy:start"]
