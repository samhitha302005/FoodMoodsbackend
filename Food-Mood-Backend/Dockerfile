FROM node:22

# Install Python (Debian-based package)
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    apt-get clean

# Use --break-system-packages to bypass PEP 668 in Docker
RUN pip3 install --break-system-packages scikit-learn

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the application
COPY . .

# Expose app port
EXPOSE 8000

# Run the app
CMD ["npm", "start"]
