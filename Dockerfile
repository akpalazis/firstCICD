# Start with a minimal Node.js image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR .

# Copy only the necessary files (built artifacts) into the container
COPY dist ./dist

ENV DB_URL postgres://postgres:pass@192.168.1.182:5433/postgres


# Expose the port on which the app is listening
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/dev_app.js"]
