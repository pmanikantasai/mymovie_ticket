FROM node:20-alpine

WORKDIR /app

# Install package definitions
COPY package*.json ./
RUN npm install

# Copy code
COPY . .

# Expose port
EXPOSE 5173

# Run dev server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
